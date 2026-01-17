
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Calendar, Users, CheckCircle, Send, Loader2, Tv } from 'lucide-react';
import { Course } from '@/api/entities';
import { sendEmail } from '@/api/functions';
import { useToast } from "@/components/ui/use-toast";

export default function TrainingClaiming({ user }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [courses, setCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [formData, setFormData] = useState({
        preferredFormat: '',
        preferredTimeFrame: '',
        selectedCourse: '',
        specificRequirements: '',
        contactPhone: ''
    });

    const { toast } = useToast();

    // Fetch available courses on component mount
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const allCourses = await Course.list();
                // Filter for courses that are suitable for 1-day training sessions
                const oneDayCourses = allCourses.filter(course => 
                    course.duration && (
                        course.duration.toLowerCase().includes('day') || 
                        course.duration.toLowerCase().includes('full day') ||
                        course.duration.toLowerCase().includes('1 day')
                    )
                );
                setCourses(oneDayCourses);
            } catch (error) {
                console.error("Error fetching courses:", error);
                toast({
                    title: "Error Loading Courses",
                    description: "Could not load available training courses. Please try again.",
                    variant: "destructive"
                });
            } finally {
                setLoadingCourses(false);
            }
        };

        fetchCourses();
    }, [toast]);

    // Check membership status AFTER all hooks are called
    const isActiveFullMember = user?.membershipType === 'Full' && user?.membershipStatus === 'active';
    if (!isActiveFullMember) {
        return null; // Don't show for non-Full members or inactive members
    }

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.preferredFormat || !formData.preferredTimeFrame || !formData.selectedCourse) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields and select a training course.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const selectedCourseDetails = courses.find(course => course.id === formData.selectedCourse);
            
            const emailBody = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #5e028f;">Free Training Session Request</h2>
                    <p>A Full Member has requested to book their complimentary training session:</p>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin: 0 0 15px 0; color: #333;">Member Details</h3>
                        <p><strong>Name:</strong> ${user.displayName || user.full_name}</p>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <p><strong>Organisation:</strong> ${user.organisationName || 'Not specified'}</p>
                        <p><strong>Membership:</strong> ${user.membershipType} Member</p>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin: 0 0 15px 0; color: #333;">Training Preferences</h3>
                        <p><strong>Preferred Format:</strong> ${formData.preferredFormat}</p>
                        <p><strong>Preferred Time Frame:</strong> ${formData.preferredTimeFrame}</p>
                        ${formData.contactPhone ? `<p><strong>Contact Phone:</strong> ${formData.contactPhone}</p>` : ''}
                        
                        <h4 style="margin: 20px 0 10px 0; color: #333;">Selected Course:</h4>
                        <p><strong>${selectedCourseDetails?.title}</strong></p>
                        ${selectedCourseDetails?.description ? `<p style="color: #666;">${selectedCourseDetails.description}</p>` : ''}
                        
                        ${formData.specificRequirements ? `<p><strong>Specific Requirements:</strong><br/>${formData.specificRequirements.replace(/\n/g, '<br/>')}</p>` : ''}
                    </div>
                    
                    <p style="color: #666; font-size: 14px;">Please arrange the training session and respond to the member directly.</p>
                </div>
            `;

            await sendEmail({
                to: 'info@ifs-safeguarding.co.uk',
                subject: `Free Training Session Request - ${user.displayName || user.full_name}`,
                html: emailBody
            });

            // Send confirmation email to member
            const confirmationEmailBody = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #5e028f;">Training Session Request Confirmed</h2>
                    <p>Dear ${user.displayName || user.full_name},</p>
                    
                    <p>Thank you for requesting your complimentary training session. We have received your request and our training team will contact you within 3-5 business days to arrange your session.</p>
                    
                    <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #5e028f;">
                        <h3 style="margin: 0 0 15px 0; color: #5e028f;">Your Request Details</h3>
                        <p><strong>Selected Course:</strong> ${selectedCourseDetails?.title}</p>
                        <p><strong>Preferred Format:</strong> ${formData.preferredFormat}</p>
                        <p><strong>Preferred Time Frame:</strong> ${formData.preferredTimeFrame}</p>
                    </div>
                    
                    <p>We'll work with you to schedule a session that fits your requirements and availability.</p>
                    
                    <p style="margin-top: 30px; margin-bottom: 5px;">Best regards,</p>
                    <p style="margin-top: 0; font-weight: bold;">The IfS Training Team</p>
                </div>
            `;

            await sendEmail({
                to: user.email,
                subject: `Training Session Request Received - ${selectedCourseDetails?.title}`,
                html: confirmationEmailBody
            });

            setHasSubmitted(true);
            toast({
                title: "Request Submitted!",
                description: "We'll contact you within 3-5 business days to arrange your training session.",
                className: "bg-emerald-50 border-emerald-200 text-emerald-900",
            });

        } catch (error) {
            console.error("Error submitting training request:", error);
            toast({
                title: "Submission Error",
                description: "There was an error submitting your request. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (hasSubmitted) {
        return (
            <Card className="bg-emerald-50 border-emerald-200 rounded-t-none">
                <CardContent className="p-6 text-center">
                    <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-emerald-900 mb-2">Request Submitted Successfully!</h3>
                    <p className="text-emerald-800">Our training team will contact you within 3-5 business days to arrange your complimentary session.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-t-none">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-purple-600" />
                            Complimentary Training Session
                        </CardTitle>
                        <p className="text-sm text-slate-600 mt-1">
                            As a Full Member, you're entitled to one free day of training per year. Request your session below.
                        </p>
                        <Badge className="mt-2 bg-purple-100 text-purple-800">Full Member Benefit</Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="preferredFormat" className="text-sm font-medium">
                                Preferred Format <span className="text-red-500">*</span>
                            </Label>
                            <Select value={formData.preferredFormat} onValueChange={(value) => handleInputChange('preferredFormat', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select format" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="online">Online Training</SelectItem>
                                    <SelectItem value="in-person">In-Person Training</SelectItem>
                                    <SelectItem value="hybrid">Hybrid (Mix of both)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="preferredTimeFrame" className="text-sm font-medium">
                                Preferred Time Frame <span className="text-red-500">*</span>
                            </Label>
                            <Select value={formData.preferredTimeFrame} onValueChange={(value) => handleInputChange('preferredTimeFrame', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select timeframe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="within-month">Within 1 month</SelectItem>
                                    <SelectItem value="within-2-months">Within 2 months</SelectItem>
                                    <SelectItem value="within-3-months">Within 3 months</SelectItem>
                                    <SelectItem value="flexible">I'm flexible</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="selectedCourse" className="text-sm font-medium">
                            Training Course <span className="text-red-500">*</span>
                        </Label>
                        <Select 
                            value={formData.selectedCourse} 
                            onValueChange={(value) => handleInputChange('selectedCourse', value)}
                            disabled={loadingCourses}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={loadingCourses ? "Loading courses..." : "Select a course"} />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.length > 0 ? (
                                    courses.map(course => (
                                        <SelectItem key={course.id} value={course.id}>
                                            {course.title}
                                            {course.duration && (
                                                <span className="text-slate-500 text-sm ml-2">({course.duration})</span>
                                            )}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="no-courses" disabled>
                                        No courses available
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-slate-500 mt-1">
                            Select from our available one-day training courses
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="contactPhone" className="text-sm font-medium">Contact Phone (Optional)</Label>
                        <Input
                            type="tel"
                            placeholder="Your phone number for faster coordination"
                            value={formData.contactPhone}
                            onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                        />
                    </div>

                    <div>
                        <Label htmlFor="specificRequirements" className="text-sm font-medium">Specific Requirements</Label>
                        <Textarea
                            placeholder="Any accessibility requirements, technical needs, or other special considerations?"
                            value={formData.specificRequirements}
                            onChange={(e) => handleInputChange('specificRequirements', e.target.value)}
                            rows={3}
                        />
                    </div>
                </form>
            </CardContent>
            <CardFooter>
                <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting || loadingCourses} 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                >
                    {isSubmitting ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting Request...</>
                    ) : (
                        <><Send className="w-4 h-4 mr-2" /> Request Training Session</>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
