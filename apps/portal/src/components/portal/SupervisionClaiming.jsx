import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@ifs/shared/components/ui/card';
import { Button } from '@ifs/shared/components/ui/button';
import { Input } from '@ifs/shared/components/ui/input';
import { Textarea } from '@ifs/shared/components/ui/textarea';
import { Label } from '@ifs/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ifs/shared/components/ui/select';
import { Badge } from '@ifs/shared/components/ui/badge';
import { Heart, Calendar, Clock, CheckCircle, Send, Loader2, Info } from 'lucide-react';
import { sendEmail } from '@ifs/shared/api/functions';
import { useToast } from "@ifs/shared/components/ui/use-toast";
import { Organisation } from '@ifs/shared/api/entities';

export default function SupervisionClaiming({ user }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        preferredContactMethod: '',
        preferredTimeFrame: '',
        specificRequirements: '',
        contactPhone: '',
        urgencyLevel: 'standard',
        duration: '60'
    });
    const [userOrganisation, setUserOrganisation] = useState(null);

    const { toast } = useToast();

    const isActiveFullMember = user?.membershipType === 'Full' && user?.membershipStatus === 'active';
    const isActiveAssociateMember = user?.membershipType === 'Associate' && user?.membershipStatus === 'active';

    // Fetch user's organisation
    useEffect(() => {
        const fetchUserOrg = async () => {
            if (user?.organisationId) {
                try {
                    const orgs = await Organisation.filter({ id: user.organisationId });
                    if (orgs.length > 0) {
                        setUserOrganisation(orgs[0]);
                    }
                } catch (error) {
                    console.error('Failed to fetch organisation:', error);
                }
            }
        };
        fetchUserOrg();
    }, [user?.organisationId]);

    const hasOrgDiscount = userOrganisation?.hasOrganisationalMembership && userOrganisation?.orgMembershipStatus === 'active';

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.preferredContactMethod || !formData.preferredTimeFrame) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const emailSubject = isActiveFullMember 
                ? `Supervision Session Request (Full Member Discount) - ${user.displayName || user.full_name}`
                : `Supervision Enquiry - ${user.displayName || user.full_name}`;

            const emailBody = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #5e028f;">${isActiveFullMember ? 'Supervision Session Request (Full Member Discount)' : 'Supervision Session Enquiry'}</h2>
                    <p>${isActiveFullMember ? 'A Full Member has requested to book a supervision session with their 10% discount:' : 'An Associate Member has enquired about booking a supervision session:'}</p>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin: 0 0 15px 0; color: #333;">Member Details</h3>
                        <p><strong>Name:</strong> ${user.displayName || user.full_name}</p>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <p><strong>Membership:</strong> ${user.membershipType} Member</p>
                        ${isActiveFullMember ? '<p><strong>Discount Applied:</strong> 10% Full Member discount</p>' : ''}
                        ${hasOrgDiscount ? '<p><strong>Organisation Membership:</strong> Active (20% discount applies)</p>' : ''}
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin: 0 0 15px 0; color: #333;">Session Preferences</h3>
                        <p><strong>Preferred Contact Method:</strong> ${formData.preferredContactMethod}</p>
                        <p><strong>Preferred Time Frame:</strong> ${formData.preferredTimeFrame}</p>
                        <p><strong>Session Duration:</strong> ${formData.duration} minutes</p>
                        <p><strong>Urgency Level:</strong> ${formData.urgencyLevel}</p>
                        ${formData.contactPhone ? `<p><strong>Contact Phone:</strong> ${formData.contactPhone}</p>` : ''}
                        ${formData.specificRequirements ? `<p><strong>Specific Requirements:</strong><br/>${formData.specificRequirements.replace(/\n/g, '<br/>')}</p>` : ''}
                    </div>
                    
                    <p style="color: #666; font-size: 14px;">Please arrange the supervision session and respond to the member directly with pricing information.</p>
                </div>
            `;

            await sendEmail({
                to: 'info@ifs-safeguarding.co.uk',
                subject: emailSubject,
                html: emailBody
            });

            // Send confirmation email to member
            const confirmationEmailBody = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #5e028f;">Supervision ${isActiveFullMember ? 'Session Request' : 'Enquiry'} Confirmed</h2>
                    <p>Dear ${user.displayName || user.full_name},</p>
                    
                    <p>Thank you for ${isActiveFullMember ? 'requesting a supervision session with your Full Member discount' : 'enquiring about our professional supervision services'}. We have received your ${isActiveFullMember ? 'request' : 'enquiry'} and our team will contact you within 2-3 business days to arrange your session and discuss pricing.</p>
                    
                    <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #5e028f;">
                        <h3 style="margin: 0 0 15px 0; color: #5e028f;">Your ${isActiveFullMember ? 'Request' : 'Enquiry'} Details</h3>
                        <p><strong>Preferred Contact:</strong> ${formData.preferredContactMethod}</p>
                        <p><strong>Preferred Time Frame:</strong> ${formData.preferredTimeFrame}</p>
                        <p><strong>Session Duration:</strong> ${formData.duration} minutes</p>
                        <p><strong>Urgency:</strong> ${formData.urgencyLevel === 'urgent' ? 'Urgent - within 1 week' : 'Standard - within 2-3 weeks'}</p>
                        ${isActiveFullMember ? `<p><strong>Discount:</strong> 10% Full Member discount applied (Est. £${formData.duration === '120' ? '121.50' : '81'}).</p>` : ''}
                        ${hasOrgDiscount ? '<p><strong>Discount:</strong> 20% organisation membership discount applies.</p>' : ''}
                    </div>
                    
                    <p>Our team will provide you with pricing information and payment options when they contact you.</p>
                    
                    <p>If you need to make any changes or have urgent requirements, please contact us directly at <a href="mailto:info@ifs-safeguarding.co.uk">info@ifs-safeguarding.co.uk</a>.</p>
                    
                    <p>Best regards,<br/>The IfS Team</p>
                </div>
            `;

            await sendEmail({
                to: user.email,
                subject: `Your IfS Supervision ${isActiveFullMember ? 'Session Request' : 'Enquiry'} - Confirmed`,
                html: confirmationEmailBody
            });

            setHasSubmitted(true);
            toast({
                title: `${isActiveFullMember ? 'Request' : 'Enquiry'} Submitted!`,
                description: "We'll contact you within 2-3 business days to arrange your session and discuss pricing.",
                className: "bg-emerald-50 border-emerald-200 text-emerald-900"
            });

        } catch (error) {
            console.error("Error submitting supervision request:", error);
            toast({
                title: "Submission Error",
                description: "Please try again or contact us directly.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (hasSubmitted) {
        return (
            <Card className="bg-emerald-50 border-emerald-200 mt-4">
                <CardContent className="p-6 text-center">
                    <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-emerald-900 mb-2">{isActiveFullMember ? 'Request' : 'Enquiry'} Submitted Successfully!</h3>
                    <p className="text-emerald-800">Our supervision team will contact you within 2-3 business days to arrange your session and discuss pricing.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-t-none">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Heart className="w-5 h-5 text-pink-600" />
                            {isActiveFullMember ? 'Professional Supervision - Full Member Discount' : 'Professional Supervision Services'}
                        </CardTitle>
                        <p className="text-sm text-slate-600 mt-1">
                            {isActiveFullMember 
                                ? 'Book supervision sessions with your 10% Full Member discount'
                                : 'Request a professional supervision session'
                            }
                        </p>
                    </div>
                    {isActiveFullMember && (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">10% Off</Badge>
                    )}
                </div>
            </CardHeader>

            {hasOrgDiscount && (
                <div className="mx-6 mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                        🎉 Your organisation membership gives you 20% off supervision services!
                    </p>
                </div>
            )}

            {!isActiveFullMember && isActiveAssociateMember && (
                <div className="mx-6 mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold text-blue-900 mb-1">Paid Service for Associate Members</h4>
                            <p className="text-sm text-blue-800">
                                Professional supervision sessions are available to purchase (£90 for 60m / £135 for 120m). Our team will contact you with payment options after you submit this enquiry.
                            </p>
                        </div>
                    </div>
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {isActiveFullMember && (
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <div className="flex items-start gap-3">
                                <Heart className="w-5 h-5 text-purple-600 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-purple-900 mb-1">Your Full Membership Benefit</h4>
                                    <p className="text-sm text-purple-800 leading-relaxed">
                                        As a Full Member, you receive a 10% discount on all professional supervision sessions.
                                        <br/>
                                        <strong>60 mins:</strong> £81 (save £9) &nbsp;|&nbsp; <strong>120 mins:</strong> £121.50 (save £13.50)
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="contactMethod" className="text-sm font-semibold">Preferred Contact Method *</Label>
                            <Select value={formData.preferredContactMethod} onValueChange={value => handleInputChange('preferredContactMethod', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="How should we contact you?" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="phone">Phone</SelectItem>
                                    <SelectItem value="either">Either Email or Phone</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="urgency" className="text-sm font-semibold">Urgency Level</Label>
                            <Select value={formData.urgencyLevel} onValueChange={value => handleInputChange('urgencyLevel', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="How soon do you need this?" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="standard">Standard (2-3 weeks)</SelectItem>
                                    <SelectItem value="urgent">Urgent (within 1 week)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="duration" className="text-sm font-semibold">Session Duration *</Label>
                        <Select value={formData.duration} onValueChange={value => handleInputChange('duration', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="60">60 Minutes {isActiveFullMember ? '(£81)' : '(£90)'}</SelectItem>
                                <SelectItem value="120">120 Minutes {isActiveFullMember ? '(£121.50)' : '(£135)'}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="timeFrame" className="text-sm font-semibold">Preferred Time Frame *</Label>
                        <Select value={formData.preferredTimeFrame} onValueChange={value => handleInputChange('preferredTimeFrame', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="When works best for you?" />
                                </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="morning">Morning (9:00 AM - 12:00 PM)</SelectItem>
                                <SelectItem value="afternoon">Afternoon (12:00 PM - 5:00 PM)</SelectItem>
                                <SelectItem value="evening">Early Evening (5:00 PM - 7:00 PM)</SelectItem>
                                <SelectItem value="flexible">Flexible - any time</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {(formData.preferredContactMethod === 'phone' || formData.preferredContactMethod === 'either') && (
                        <div>
                            <Label htmlFor="contactPhone" className="text-sm font-semibold">Contact Phone Number</Label>
                            <Input 
                                id="contactPhone"
                                type="tel"
                                value={formData.contactPhone}
                                onChange={e => handleInputChange('contactPhone', e.target.value)}
                                placeholder="Your phone number"
                            />
                        </div>
                    )}

                    <div>
                        <Label htmlFor="requirements" className="text-sm font-semibold">Specific Requirements or Topics</Label>
                        <Textarea 
                            id="requirements"
                            value={formData.specificRequirements}
                            onChange={e => handleInputChange('specificRequirements', e.target.value)}
                            placeholder="Any specific areas you'd like to focus on, accessibility requirements, or preferred session format..."
                            rows={3}
                        />
                    </div>
                </CardContent>

                <CardFooter>
                    <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                {isActiveFullMember ? 'Request Supervision Session' : 'Submit Supervision Enquiry'}
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}