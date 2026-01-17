import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CourseBooking } from '@/api/entities';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

export default function AddBookingModal({ 
    isOpen, 
    onClose, 
    onBookingAdded, 
    users = [], 
    courses = [], 
    variants = [], 
    dates = [] 
}) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        userId: '',
        courseId: '',
        variantId: '',
        courseDateId: '',
        paymentMethod: 'manual',
        status: 'confirmed',
        notes: ''
    });

    const [filteredVariants, setFilteredVariants] = useState([]);
    const [filteredDates, setFilteredDates] = useState([]);

    useEffect(() => {
        if (formData.courseId) {
            setFilteredVariants(variants.filter(v => v.courseId === formData.courseId));
            // Dates might depend on variant or just course
            // If variant is selected, filter dates by variant
            if (formData.variantId) {
                setFilteredDates(dates.filter(d => d.courseId === formData.courseId && (d.variantId === formData.variantId || !d.variantId)));
            } else {
                setFilteredDates(dates.filter(d => d.courseId === formData.courseId));
            }
        } else {
            setFilteredVariants([]);
            setFilteredDates([]);
        }
    }, [formData.courseId, formData.variantId, variants, dates]);

    const handleSubmit = async () => {
        if (!formData.userId || !formData.courseId || !formData.courseDateId) {
            toast({
                title: "Missing Fields",
                description: "Please select User, Course, and Date.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const user = users.find(u => u.id === formData.userId);
            const course = courses.find(c => c.id === formData.courseId);
            const variant = variants.find(v => v.id === formData.variantId);
            const date = dates.find(d => d.id === formData.courseDateId);

            const bookingData = {
                userId: user.id,
                userEmail: user.email,
                userName: user.displayName || user.full_name,
                courseId: course.id,
                courseTitle: course.title,
                variantId: variant?.id,
                variantName: variant?.name,
                courseDateId: date.id,
                selectedDate: date.date,
                selectedTime: date.startTime ? `${date.startTime} - ${date.endTime}` : 'All Day',
                selectedLocation: date.location,
                paymentMethod: formData.paymentMethod,
                status: formData.status,
                notes: formData.notes,
                organisationName: user.organisationName,
                totalCost: variant ? variant.price : course.price,
                gbpAmount: variant ? variant.price : course.price, // Assuming full manual payment
                creditsUsed: 0
            };

            await CourseBooking.create(bookingData);

            toast({ title: "Success", description: "Booking created manually." });
            onBookingAdded();
            onClose();
            // Reset form
            setFormData({
                userId: '',
                courseId: '',
                variantId: '',
                courseDateId: '',
                paymentMethod: 'manual',
                status: 'confirmed',
                notes: ''
            });
        } catch (error) {
            console.error("Failed to create booking:", error);
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Manually Add Course Booking</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>User</Label>
                        <Select 
                            value={formData.userId} 
                            onValueChange={(val) => setFormData({...formData, userId: val})}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select User" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                {users.map(u => (
                                    <SelectItem key={u.id} value={u.id}>
                                        {u.displayName || u.full_name} ({u.email})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Course</Label>
                        <Select 
                            value={formData.courseId} 
                            onValueChange={(val) => setFormData({...formData, courseId: val, variantId: '', courseDateId: ''})}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Course" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                {courses.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {filteredVariants.length > 0 && (
                        <div className="grid gap-2">
                            <Label>Variant (Optional)</Label>
                            <Select 
                                value={formData.variantId} 
                                onValueChange={(val) => setFormData({...formData, variantId: val, courseDateId: ''})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Variant" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredVariants.map(v => (
                                        <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label>Date</Label>
                        <Select 
                            value={formData.courseDateId} 
                            onValueChange={(val) => setFormData({...formData, courseDateId: val})}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Date" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                {filteredDates.map(d => (
                                    <SelectItem key={d.id} value={d.id}>
                                        {format(new Date(d.date), 'dd MMM yyyy')} ({d.location})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Payment Method</Label>
                        <Select 
                            value={formData.paymentMethod} 
                            onValueChange={(val) => setFormData({...formData, paymentMethod: val})}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="manual">Manual / Cash</SelectItem>
                                <SelectItem value="invoice">Invoice</SelectItem>
                                <SelectItem value="gbp">Paid Online (GBP)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Status</Label>
                        <Select 
                            value={formData.status} 
                            onValueChange={(val) => setFormData({...formData, status: val})}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Notes</Label>
                        <Input 
                            value={formData.notes} 
                            onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                            placeholder="Optional notes..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Booking
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}