import React, { useState, useEffect } from 'react';
import { ifs } from '@ifs/shared/api/ifsClient';
import { getOrganisationMembers } from '@ifs/shared/api/functions';
import { createOrgBulkCourseBooking } from '@ifs/shared/api/functions';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@ifs/shared/components/ui/dialog";
import { Button } from "@ifs/shared/components/ui/button";
import { Checkbox } from "@ifs/shared/components/ui/checkbox";
import { Badge } from "@ifs/shared/components/ui/badge";
import { Loader2, Users, CreditCard, Send, Clock } from 'lucide-react';
import { useToast } from "@ifs/shared/components/ui/use-toast";

export default function OrgBulkBookingModal({ 
    open, 
    onClose, 
    course, 
    variantId, 
    variantName,
    selectedDate,
    selectedTime,
    selectedLocation,
    user 
}) {
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [variant, setVariant] = useState(null);
    const { toast } = useToast();

    useEffect(() => {
        if (open && user?.organisationId) {
            fetchMembers();
            if (variantId) {
                fetchVariant();
            }
        }
    }, [open, user, variantId]);

    const fetchVariant = async () => {
        try {
            const variantData = await ifs.entities.CourseVariant.get(variantId);
            setVariant(variantData);
        } catch (error) {
            console.error('Failed to fetch variant:', error);
        }
    };

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const { data } = await getOrganisationMembers({ 
                organisationId: user.organisationId 
            });
            
            if (data?.success && data?.members) {
                setMembers(data.members);
            } else {
                setMembers([]);
            }
        } catch (error) {
            console.error('Failed to fetch members:', error);
            toast({
                title: "Error",
                description: "Failed to load organisation members",
                variant: "destructive"
            });
            setMembers([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleMember = (memberId) => {
        setSelectedMembers(prev => 
            prev.includes(memberId) 
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const calculateQuote = () => {
        const CPD_HOUR_VALUE = 20;
        const selectedMemberData = members.filter(m => selectedMembers.includes(m.id));
        
        let subtotal = 0;
        let totalCpdDiscount = 0;
        
        selectedMemberData.forEach(member => {
            // Base price from CPD hours
            const courseCpdHours = course.cpdHours || 0;
            let basePrice = courseCpdHours * CPD_HOUR_VALUE * 100; // in pence
            
            // Full Members get 10% discount
            const isFull = member.membershipType === 'Full';
            const membershipDiscount = isFull ? Math.round(basePrice * 0.10) : 0;
            const priceAfterMembershipDiscount = basePrice - membershipDiscount;
            
            // Calculate CPD discount on the discounted price
            const memberCpdHours = member.cpdHours || 0;
            const maxHoursUsable = Math.min(courseCpdHours, memberCpdHours);
            const cpdDiscount = maxHoursUsable * CPD_HOUR_VALUE * 100; // in pence
            
            const finalPrice = Math.max(0, priceAfterMembershipDiscount - cpdDiscount);
            
            subtotal += basePrice;
            totalCpdDiscount += (membershipDiscount + cpdDiscount);
        });
        
        return {
            subtotal,
            cpdDiscount: totalCpdDiscount,
            total: Math.max(0, subtotal - totalCpdDiscount)
        };
    };

    const handlePayNow = async () => {
        try {
            setProcessing(true);
            const { data } = await createOrgBulkCourseBooking({
                courseId: course.id,
                courseTitle: course.title,
                variantId,
                variantName,
                selectedDate,
                selectedTime,
                selectedLocation,
                memberIds: selectedMembers,
                paymentMethod: 'stripe_direct',
                organisationId: user.organisationId
            });

            if (data?.checkoutUrl) {
                window.location.href = data.checkoutUrl;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (error) {
            console.error('Failed to create booking:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to create booking",
                variant: "destructive"
            });
            setProcessing(false);
        }
    };

    const handleSendInvoice = async () => {
        try {
            setProcessing(true);
            const { data } = await createOrgBulkCourseBooking({
                courseId: course.id,
                courseTitle: course.title,
                variantId,
                variantName,
                selectedDate,
                selectedTime,
                selectedLocation,
                memberIds: selectedMembers,
                paymentMethod: 'stripe_invoice',
                organisationId: user.organisationId
            });

            toast({
                title: "Invoice Sent",
                description: "Invoice has been sent to your organisation administrator",
            });
            onClose();
        } catch (error) {
            console.error('Failed to send invoice:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to send invoice",
                variant: "destructive"
            });
        } finally {
            setProcessing(false);
        }
    };

    const quoteBreakdown = calculateQuote();
    const selectedMemberData = members.filter(m => selectedMembers.includes(m.id));

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Reserve Places for Organisation
                    </DialogTitle>
                    <DialogDescription>
                        Select team members to book for this course: {course?.title}
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Course Details */}
                        <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                            <h3 className="font-semibold text-slate-900">{course.title}</h3>
                            {variantName && <p className="text-sm text-slate-600">Variant: {variantName}</p>}
                            {selectedDate && <p className="text-sm text-slate-600">Date: {selectedDate}</p>}
                            {selectedTime && <p className="text-sm text-slate-600">Time: {selectedTime}</p>}
                            {selectedLocation && <p className="text-sm text-slate-600">Location: {selectedLocation}</p>}
                        </div>

                        {/* Member Selection */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-slate-900">Select Team Members</h4>
                            {members.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">No other team members found</p>
                            ) : (
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {members.map(member => {
                                        const CPD_HOUR_VALUE = 20;
                                        const memberCpdHours = member.cpdHours || 0;
                                        const courseCpdHours = course.cpdHours || 0;
                                        const basePrice = courseCpdHours * CPD_HOUR_VALUE * 100;
                                        
                                        // Full Members get 10% discount
                                        const isFull = member.membershipType === 'Full';
                                        const membershipDiscount = isFull ? Math.round(basePrice * 0.10) : 0;
                                        const priceAfterMembershipDiscount = basePrice - membershipDiscount;
                                        
                                        // Calculate CPD discount
                                        const maxHoursUsable = Math.min(courseCpdHours, memberCpdHours);
                                        const cpdDiscount = maxHoursUsable * CPD_HOUR_VALUE * 100;
                                        const totalDiscount = membershipDiscount + cpdDiscount;
                                        const finalPrice = Math.max(0, priceAfterMembershipDiscount - cpdDiscount);

                                        return (
                                            <div 
                                                key={member.id}
                                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Checkbox
                                                        checked={selectedMembers.includes(member.id)}
                                                        onCheckedChange={() => toggleMember(member.id)}
                                                    />
                                                    <div>
                                                        <p className="font-medium text-slate-900">
                                                            {member.displayName || member.full_name}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline" className="text-xs">
                                                                {member.membershipType || 'Standard'}
                                                            </Badge>
                                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {memberCpdHours.toFixed(1)} CPD hours
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    {totalDiscount > 0 && (
                                                        <p className="text-xs text-slate-500 line-through">
                                                            £{(basePrice / 100).toFixed(2)}
                                                        </p>
                                                    )}
                                                    <p className="font-semibold text-slate-900">
                                                        £{(finalPrice / 100).toFixed(2)}
                                                    </p>
                                                    <div className="text-xs text-green-600 space-y-0.5">
                                                        {isFull && (
                                                            <p>-10% Full Member</p>
                                                        )}
                                                        {maxHoursUsable > 0 && (
                                                            <p>-{maxHoursUsable.toFixed(1)} CPD hrs</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Quote Summary */}
                        {selectedMembers.length > 0 && (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
                                <h4 className="font-semibold text-slate-900 mb-2">
                                    Booking Summary ({selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''})
                                </h4>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-700">Course Price</span>
                                    <span className="font-semibold text-slate-900">
                                        £{(quoteBreakdown.subtotal / 100).toFixed(2)}
                                    </span>
                                </div>
                                {quoteBreakdown.cpdDiscount > 0 && (
                                    <div className="flex justify-between items-center text-green-700">
                                        <span>Member Discounts</span>
                                        <span className="font-semibold">
                                            -£{(quoteBreakdown.cpdDiscount / 100).toFixed(2)}
                                        </span>
                                    </div>
                                )}
                                <div className="border-t border-purple-200 pt-3 flex justify-between items-center">
                                    <span className="text-slate-900 font-bold">Total to Pay</span>
                                    <span className="text-2xl font-bold text-purple-900">
                                        £{(quoteBreakdown.total / 100).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                disabled={processing}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSendInvoice}
                                disabled={selectedMembers.length === 0 || processing}
                                variant="outline"
                                className="flex-1"
                            >
                                {processing ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <Send className="w-4 h-4 mr-2" />
                                )}
                                Send Invoice to Admin
                            </Button>
                            <Button
                                onClick={handlePayNow}
                                disabled={selectedMembers.length === 0 || processing}
                                className="flex-1 bg-purple-600 hover:bg-purple-700"
                            >
                                {processing ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <CreditCard className="w-4 h-4 mr-2" />
                                )}
                                Pay Now
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}