import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Heart, Loader2, CheckCircle, Award, Info } from 'lucide-react';
import { sendEmail } from '@/api/functions';
import { Badge } from '@/components/ui/badge';
import { useUser } from '../providers/UserProvider';

const getEmailWrapper = (content) => {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
            .header { background-color: #5e028f; padding: 20px; text-align: center; color: #ffffff; }
            .content { padding: 30px 40px; color: #333; line-height: 1.6; }
            .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee; }
            h1 { color: #333; font-size: 24px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="color: white; margin: 0; font-size: 24px;">Independent Federation for Safeguarding</h1>
            </div>
            <div class="content">
                ${content}
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Independent Federation for Safeguarding. All rights reserved.</p>
                <p>IfS, 128 City Road, London, EC1V 2NX</p>
            </div>
        </div>
    </body>
    </html>`;
};

export default function SupervisionEnquiry() {
    const { user } = useUser();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.displayName || '',
        email: user?.email || '',
        organisation: user?.organisationName || '',
        preferredFormat: '',
        duration: '60',
        additionalInfo: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const adminEmailContent = `
                <h1>New Supervision Session Enquiry</h1>
                <p>A member has enquired about booking a supervision session.</p>
                
                <h2>Member Details</h2>
                <p><strong>Name:</strong> ${formData.name}</p>
                <p><strong>Email:</strong> ${formData.email}</p>
                <p><strong>Organisation:</strong> ${formData.organisation || 'Not provided'}</p>
                <p><strong>Membership Type:</strong> ${user?.membershipType || 'Unknown'}</p>
                <p><strong>CPD Hours Balance:</strong> ${user?.cpdHours || 0} hours</p>
                
                <h2>Preferences</h2>
                <p><strong>Preferred Format:</strong> ${formData.preferredFormat}</p>
                <p><strong>Session Duration:</strong> ${formData.duration} minutes</p>
                
                <h2>Additional Information</h2>
                <p>${formData.additionalInfo || 'None provided'}</p>
                
                <h2>Pricing Information</h2>
                <p><strong>Session Cost:</strong> £${formData.duration === '120' ? '135' : '90'}</p>
                <p><strong>Full Member Price:</strong> £${formData.duration === '120' ? '121.50' : '81'} (10% discount)</p>
            `;

            const userEmailContent = `
                <h1>Thank You for Your Supervision Session Enquiry</h1>
                <p>Dear ${formData.name},</p>
                
                <p>We've received your enquiry about booking a professional supervision session with IfS. A member of our team will be in touch with you shortly to arrange your session.</p>
                
                <h2>Your Enquiry Details</h2>
                <p><strong>Preferred Format:</strong> ${formData.preferredFormat}</p>
                <p><strong>Session Duration:</strong> ${formData.duration} minutes</p>
                <p><strong>Session Cost:</strong> £${formData.duration === '120' ? '135' : '90'} per session</p>
                ${user?.membershipType === 'Full' ? `<p><strong>Your Full Member Discount:</strong> 10% off (£${formData.duration === '120' ? '121.50' : '81'} per session)</p>` : ''}
                ${formData.additionalInfo ? `<p><strong>Additional Information:</strong> ${formData.additionalInfo}</p>` : ''}
                
                <p>If you have any questions in the meantime, please don't hesitate to contact us at <a href="mailto:info@ifs-safeguarding.co.uk">info@ifs-safeguarding.co.uk</a>.</p>
                
                <p>Best regards,<br>The IfS Team</p>
            `;

            await Promise.all([
                sendEmail({
                    to: 'info@ifs-safeguarding.co.uk',
                    subject: `New Supervision Session Enquiry - ${formData.name}`,
                    body: getEmailWrapper(adminEmailContent)
                }),
                sendEmail({
                    to: formData.email,
                    subject: 'Your Supervision Session Enquiry - IfS',
                    body: getEmailWrapper(userEmailContent)
                })
            ]);

            setIsSubmitted(true);
            toast({
                title: "Enquiry Sent",
                description: "We'll be in touch shortly to arrange your supervision session.",
            });
        } catch (error) {
            console.error('Failed to send enquiry:', error);
            toast({
                title: "Error",
                description: "Failed to send your enquiry. Please try again or contact us directly.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <Card className="border-green-200">
                <CardContent className="pt-6">
                    <div className="text-center py-12">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-green-100 rounded-full">
                                <CheckCircle className="w-12 h-12 text-green-600" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Enquiry Received!</h3>
                        <p className="text-slate-600 mb-6">
                            Thank you for your interest. We'll be in touch shortly to arrange your supervision session.
                        </p>
                        <Button onClick={() => setIsSubmitted(false)} variant="outline">
                            Submit Another Enquiry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const isFullMember = user?.membershipType === 'Full';

    return (
        <div className="space-y-6">
            {/* Information Card - CORRECTED */}
            <Card className="border-purple-200 bg-purple-50">
                <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 p-2 bg-purple-100 rounded-lg">
                            <Heart className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 mb-2">Professional Supervision Sessions</h3>
                            <p className="text-sm text-slate-700 mb-3">
                                Our experienced safeguarding professionals provide reflective supervision to support your practice and professional development. Choose from 60 or 120 minute sessions.
                            </p>
                            <div className="space-y-2">
                                <div className="flex flex-wrap gap-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Badge className="bg-slate-100 text-slate-800 font-semibold">
                                            £90
                                        </Badge>
                                        <span className="text-slate-600">60 mins</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Badge className="bg-slate-100 text-slate-800 font-semibold">
                                            £135
                                        </Badge>
                                        <span className="text-slate-600">120 mins</span>
                                    </div>
                                </div>
                                {isFullMember && (
                                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Award className="w-4 h-4 text-green-700" />
                                            <span className="text-sm font-bold text-green-900">Your Full Member Discount:</span>
                                        </div>
                                        <p className="text-xs text-green-800">
                                            10% off all supervision sessions (<strong>£81</strong> for 60m / <strong>£121.50</strong> for 120m)
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Enquiry Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Book a Supervision Session</CardTitle>
                    <CardDescription>
                        Complete this form to enquire about booking a professional supervision session
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="mt-2"
                                />
                            </div>
                            <div>
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="organisation">Organisation</Label>
                            <Input
                                id="organisation"
                                value={formData.organisation}
                                onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
                                className="mt-2"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="preferredFormat">Preferred Format *</Label>
                                <Select 
                                    value={formData.preferredFormat}
                                    onValueChange={(value) => setFormData({ ...formData, preferredFormat: value })}
                                    required
                                >
                                    <SelectTrigger className="mt-2">
                                        <SelectValue placeholder="Select format" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Online">Online (via Zoom)</SelectItem>
                                        <SelectItem value="In-Person">In-Person (London Office)</SelectItem>
                                        <SelectItem value="Telephone">Telephone</SelectItem>
                                        <SelectItem value="Flexible">Flexible</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="duration">Session Duration *</Label>
                                <Select 
                                    value={formData.duration}
                                    onValueChange={(value) => setFormData({ ...formData, duration: value })}
                                    required
                                >
                                    <SelectTrigger className="mt-2">
                                        <SelectValue placeholder="Select duration" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="60">60 Minutes (£{isFullMember ? '81' : '90'})</SelectItem>
                                        <SelectItem value="120">120 Minutes (£{isFullMember ? '121.50' : '135'})</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="additionalInfo">Additional Information</Label>
                            <Textarea
                                id="additionalInfo"
                                value={formData.additionalInfo}
                                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                                placeholder="Any specific topics you'd like to discuss or scheduling preferences..."
                                className="mt-2 min-h-[120px]"
                            />
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        Send Enquiry
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}