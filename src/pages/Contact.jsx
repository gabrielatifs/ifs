import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Phone, Mail, Clock, Shield, Send, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { User } from '@/api/entities';
import MainSiteNav from '../components/marketing/MainSiteNav';
import { useBreadcrumbs } from '../components/providers/BreadcrumbProvider';
import HeroBreadcrumbs from '../components/marketing/HeroBreadcrumbs';
import { sendEmail } from '@/api/functions';
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { wrapEmailHtml } from '../../packages/shared/src/emails/wrapper.js';

export default function Contact() {
    const { getBreadcrumbs } = useBreadcrumbs();
    const location = useLocation();
    const { toast } = useToast();

    // The useEffect hook for dynamic breadcrumbs is removed as per the new static structure.
    // The HeroBreadcrumbs component will now receive a pageName prop directly.

    const [activeForm, setActiveForm] = useState('general');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        organisation: '',
        position: '',
        enquiryType: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleJoin = () => {
        const url = createPageUrl('Onboarding') + '?intent=associate';
        User.loginWithRedirect(url);
    };

    const handleScrollToForm = () => {
        const formSection = document.getElementById('contact-form-section');
        if (formSection) {
            formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const emailWrapper = (content) => wrapEmailHtml(content);

            // 1. Prepare email content
            const userEmailBody = `
                <td style="padding: 30px 40px; color: #333; line-height: 1.6;">
                    <h1 style="color: #333; font-size: 24px;">Your Enquiry has been Received</h1>
                    <p>Dear ${formData.name},</p>
                    <p>We have successfully received your message. A member of our professional team will respond within 24 business hours.</p>
                    <br>
                    <p><strong>Here is a summary of your submission:</strong></p>
                    <div style="border-left: 3px solid #eee; padding-left: 15px; color: #555;">
                        <p><strong>Subject:</strong> ${formData.subject}</p>
                        <p><strong>Message:</strong></p>
                        <p>${formData.message.replace(/\n/g, '<br>')}</p>
                    </div>
                    <p style="margin-top: 30px; margin-bottom: 5px;">Kind regards,</p>
                    <p style="margin-top: 0; font-weight: bold;">The Independent Federation for Safeguarding</p>
                </td>
            `;

            const adminEmailBody = `
                <td style="padding: 30px 40px; color: #333; line-height: 1.6;">
                    <h1 style="color: #333; font-size: 24px;">New Website Enquiry</h1>
                    <p>A new enquiry has been submitted via the contact form.</p>
                    <hr style="border: 0; border-top: 1px solid #eee;">
                    <p><strong>Name:</strong> ${formData.name}</p>
                    <p><strong>Email:</strong> <a href="mailto:${formData.email}" style="color: #5e028f;">${formData.email}</a></p>
                    <p><strong>Organisation:</strong> ${formData.organisation || 'N/A'}</p>
                    <p><strong>Position:</strong> ${formData.position || 'N/A'}</p>
                    <p><strong>Form/Enquiry Type:</strong> ${activeForm} / ${formData.enquiryType || 'N/A'}</p>
                    <p><strong>Subject:</strong> ${formData.subject}</p>
                    <h2 style="font-size: 20px; margin-top: 20px;">Message:</h2>
                    <div style="border: 1px solid #eee; padding: 15px; border-radius: 5px; background-color: #f9f9f9;">
                        <p>${formData.message.replace(/\n/g, '<br>')}</p>
                    </div>
                    <hr style="margin-top: 20px; border: 0; border-top: 1px solid #eee;">
                </td>
            `;

            // 2. Send both emails concurrently
            await Promise.all([
                sendEmail({
                    to: formData.email,
                    subject: 'Your Enquiry to the Institute for Safeguarding',
                    html: emailWrapper(userEmailBody)
                }),
                sendEmail({
                    to: 'info@ifs-safeguarding.co.uk', // Admin email address
                    subject: `New Website Enquiry: ${formData.subject}`,
                    html: emailWrapper(adminEmailBody)
                })
            ]);

            // 3. Handle success UI
            setIsSubmitted(true);

            // Reset form after 5 seconds to allow another submission
            setTimeout(() => {
                setIsSubmitted(false);
                setFormData({
                    name: '', email: '', organisation: '', position: '',
                    enquiryType: '', subject: '', message: ''
                });
            }, 5000);

        } catch (error) {
            console.error("Failed to send enquiry email:", error);
            toast({
                title: "Submission Failed",
                description: "There was an error sending your enquiry. Please try again or contact us directly.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <>
            <Helmet>
              <title>Contact Us - Independent Federation for Safeguarding</title>
              <meta name="description" content="Contact the Independent Federation for Safeguarding. Our dedicated team provides comprehensive support to safeguarding professionals across the UK. Get in touch for membership, services, and professional development enquiries." />
              <link rel="canonical" href="https://ifs-safeguarding.co.uk/Contact" />
              <meta property="og:title" content="Contact Us - Independent Federation for Safeguarding" />
              <meta property="og:description" content="Professional support and enquiries for safeguarding professionals. Expert guidance on membership, services, and professional development." />
              <meta property="og:url" content="https://ifs-safeguarding.co.uk/Contact" />
              <meta property="og:type" content="website" />
            </Helmet>
            <Toaster />
            {/* Hero Section */}
            <section className="relative bg-gray-900 overflow-hidden" style={{ minHeight: '600px' }}>

                {/* Full-width Background Image */}
                <div className="absolute inset-0 hidden lg:block">
                    <img
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/948cecd89_firmbee-com-SpVHcbuKi6e-unsplash.jpg"
                        alt="Professional consultation meeting"
                        className="w-full h-full object-cover object-center"
                        style={{ filter: 'grayscale(100%) contrast(1.1)' }}
                    />
                </div>

                {/* Gradient overlay for split effect */}
                <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to right, #5e028f 45%, rgba(94, 2, 143, 0.2) 65%, transparent 100%)' }}
                ></div>

                {/* Mobile Background */}
                <div className="absolute inset-0 bg-purple-800 lg:hidden"></div>

                {/* Geometric Overlays */}
                <div className="absolute inset-0 hidden lg:block">
                    <div className="absolute top-16 right-24 w-64 h-64 bg-pink-600/30 rounded-full blur-3xl"></div>
                    <div className="absolute top-32 right-8 w-32 h-32 bg-pink-500/40 rounded-full blur-xl"></div>
                    <div className="absolute bottom-24 right-32 w-48 h-48 bg-purple-700/25 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-8 right-16 w-24 h-24 bg-purple-500/50 rounded-full blur-lg"></div>
                    <div className="absolute top-1/2 right-4 w-20 h-20 bg-pink-600/60 rounded-full blur-md"></div>
                </div>

                <MainSiteNav />

                {/* Hero Content */}
                <div className="relative z-10 max-w-screen-xl mx-auto">
                    <div className="grid lg:grid-cols-2 items-center min-h-[600px]">
                        {/* Left Column - Content */}
                        <div className="px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center lg:text-left">
                            <HeroBreadcrumbs pageName="Contact" />
                            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                                Professional Support & Enquiries
                            </h1>
                            <div className="text-lg lg:text-xl text-purple-100 mb-8 leading-relaxed space-y-4">
                                <p>
                                    Our dedicated team provides comprehensive support to safeguarding professionals across the UK.
                                </p>
                                <p className="hidden lg:block">
                                    We offer expert guidance on membership, services, and professional development opportunities.
                                </p>
                            </div>
                            {/* Desktop Button */}
                            <Button
                                onClick={handleScrollToForm}
                                size="lg"
                                className="hidden lg:inline-flex bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm"
                            >
                                Submit an Enquiry
                            </Button>
                            {/* Mobile Button */}
                            <div className="mt-8 lg:hidden">
                                <Button
                                    onClick={handleJoin}
                                    size="lg"
                                    className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm">
                                    Become a Member for Free
                                </Button>
                            </div>
                        </div>

                        {/* Right column is empty, space is filled by the background image */}
                        <div className="hidden lg:block"></div>
                    </div>
                </div>
            </section>

            {/* Contact Information Strip */}
            <section className="bg-slate-50 border-b border-t border-gray-200">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div className="flex items-center justify-center gap-4">
                            <Phone className="w-6 h-6 text-purple-600 flex-shrink-0" />
                            <div>
                                <div className="font-semibold text-gray-900">+44 07413 034689</div>
                                <div className="text-sm text-gray-600">Mon - Fri, 9:00 - 17:00</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-4">
                            <Mail className="w-6 h-6 text-purple-600 flex-shrink-0" />
                            <div className="text-left">
                                <div className="font-semibold text-gray-900 break-all">info@ifs-safeguarding.co.uk</div>
                                <div className="text-sm text-gray-600">Professional enquiries</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-4">
                            <Clock className="w-6 h-6 text-purple-600 flex-shrink-0" />
                            <div>
                                <div className="font-semibold text-gray-900">3-hour response</div>
                                <div className="text-sm text-gray-600">Standard enquiries</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Form Section */}
            <section id="contact-form-section" className="bg-white py-20 lg:py-24">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-3 gap-12 items-start">
                        {/* Left Column - Form Categories */}
                        <div className="lg:col-span-1">
                            <h2 className="text-3xl font-bold text-gray-900 mb-8">
                                How may we assist you?
                            </h2>
                            <div className="space-y-4">
                                <button
                                    onClick={() => setActiveForm('general')}
                                    className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                                        activeForm === 'general'
                                            ? 'bg-purple-50 border-purple-400 shadow-md scale-105'
                                            : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">General Enquiries</h3>
                                    <p className="text-sm text-gray-600">Services, partnerships, and general information</p>
                                </button>

                                <button
                                    onClick={() => setActiveForm('membership')}
                                    className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                                        activeForm === 'membership'
                                            ? 'bg-purple-50 border-purple-400 shadow-md scale-105'
                                            : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Membership Services</h3>
                                    <p className="text-sm text-gray-600">Applications, benefits, and account management</p>
                                </button>

                                <button
                                    onClick={() => setActiveForm('technical')}
                                    className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                                        activeForm === 'technical'
                                            ? 'bg-purple-50 border-purple-400 shadow-md scale-105'
                                            : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Technical Support</h3>
                                    <p className="text-sm text-gray-600">Platform access and digital service assistance</p>
                                </button>
                            </div>

                            <div className="mt-10 p-5 bg-slate-50 border border-gray-200 rounded-xl">
                                <div className="flex items-start gap-4">
                                    <Shield className="w-6 h-6 text-purple-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Confidential Support</h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            All enquiries are treated with strict confidentiality in accordance with our professional standards.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Contact Form */}
                        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
                            {isSubmitted ? (
                                <div className="text-center py-12 flex flex-col items-center">
                                    <CheckCircle2 className="w-16 h-16 text-green-600 mb-4" />
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Enquiry Submitted Successfully</h3>
                                    <p className="text-gray-600 max-w-md">Thank you for contacting us. A member of our professional team will respond within 24 hours during business days.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                            {activeForm === 'general' && 'General Enquiry Form'}
                                            {activeForm === 'membership' && 'Membership Services Form'}
                                            {activeForm === 'technical' && 'Technical Support Form'}
                                        </h3>
                                        <p className="text-sm text-gray-600">Please complete all required fields marked with an asterisk (*)</p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                                            <Input
                                                value={formData.name}
                                                onChange={(e) => handleInputChange('name', e.target.value)}
                                                placeholder="Enter your full name"
                                                required
                                                className="border-gray-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Professional Email *</label>
                                            <Input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                placeholder="professional.email@organisation.com"
                                                required
                                                className="border-gray-300"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Organisation</label>
                                            <Input
                                                value={formData.organisation}
                                                onChange={(e) => handleInputChange('organisation', e.target.value)}
                                                placeholder="Your organisation or institution"
                                                className="border-gray-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Position/Role</label>
                                            <Input
                                                value={formData.position}
                                                onChange={(e) => handleInputChange('position', e.target.value)}
                                                placeholder="Your professional role or title"
                                                className="border-gray-300"
                                            />
                                        </div>
                                    </div>

                                    {activeForm === 'general' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Enquiry Category *</label>
                                            <Select value={formData.enquiryType} onValueChange={(value) => handleInputChange('enquiryType', value)}>
                                                <SelectTrigger className="border-gray-300 text-gray-500">
                                                    <SelectValue placeholder="Please select an enquiry category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="services">Professional Services Information</SelectItem>
                                                    <SelectItem value="partnership">Partnership & Collaboration</SelectItem>
                                                    <SelectItem value="training">Training & Development Opportunities</SelectItem>
                                                    <SelectItem value="media">Media & Press Enquiries</SelectItem>
                                                    <SelectItem value="feedback">Feedback & Suggestions</SelectItem>
                                                    <SelectItem value="other">Other Professional Enquiry</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {activeForm === 'membership' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Membership Enquiry Type *</label>
                                            <Select value={formData.enquiryType} onValueChange={(value) => handleInputChange('enquiryType', value)}>
                                                <SelectTrigger className="border-gray-300 text-gray-500">
                                                    <SelectValue placeholder="Please select membership enquiry type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="application">New Membership Application</SelectItem>
                                                    <SelectItem value="benefits">Membership Benefits & Services</SelectItem>
                                                    <SelectItem value="renewal">Membership Renewal Process</SelectItem>
                                                    <SelectItem value="upgrade">Membership Tier Upgrade</SelectItem>
                                                    <SelectItem value="certificate">Certificate & Documentation</SelectItem>
                                                    <SelectItem value="billing">Billing & Payment Enquiries</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {activeForm === 'technical' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Technical Issue Category *</label>
                                            <Select value={formData.enquiryType} onValueChange={(value) => handleInputChange('enquiryType', value)}>
                                                <SelectTrigger className="border-gray-300 text-gray-500">
                                                    <SelectValue placeholder="Please select technical issue category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="login">Account Access & Login Issues</SelectItem>
                                                    <SelectItem value="platform">Platform Navigation & Features</SelectItem>
                                                    <SelectItem value="password">Password Reset & Security</SelectItem>
                                                    <SelectItem value="features">Feature Functionality Issues</SelectItem>
                                                    <SelectItem value="mobile">Mobile Application Support</SelectItem>
                                                    <SelectItem value="download">Document Downloads & Resources</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                                        <Input
                                            value={formData.subject}
                                            onChange={(e) => handleInputChange('subject', e.target.value)}
                                            placeholder="Brief summary of your enquiry"
                                            required
                                            className="border-gray-300"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Message *</label>
                                        <Textarea
                                            value={formData.message}
                                            onChange={(e) => handleInputChange('message', e.target.value)}
                                            placeholder="Please provide comprehensive details of your enquiry to enable us to provide the most appropriate response..."
                                            rows={6}
                                            required
                                            className="border-gray-300"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        size="lg"
                                        className="w-full bg-purple-700 hover:bg-purple-800 text-white font-semibold py-3 rounded-md flex items-center justify-center"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Submitting Enquiry...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5 mr-2" />
                                                Submit Professional Enquiry
                                            </>
                                        )}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA - Enhanced gradient */}
            <section className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-20 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                </div>
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
                    <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                        Ready to elevate your safeguarding practice?
                    </h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                        Join our community of dedicated professionals and access the resources, connections, and expertise you need to make a meaningful difference.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={handleJoin}
                            size="lg"
                            className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-semibold px-8 py-4 text-lg rounded-sm shadow-lg hover:shadow-xl transition-all"
                        >
                            Become a Member Today
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-8 py-4 text-lg rounded-sm transition-all"
                            asChild
                        >
                            <Link to={createPageUrl("About")}>Learn More</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
}
