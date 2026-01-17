import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Award, CheckCircle, Mail, Trophy, Target, Users, Loader2, AlertCircle, GraduationCap } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import MainSiteNav from '../components/marketing/MainSiteNav';
import HeroBreadcrumbs from '../components/marketing/HeroBreadcrumbs';
import MarketingFooter from '../components/marketing/MarketingFooter';
import { base44 } from '@/api/base44Client';
import { FellowshipApplication } from '@/api/entities';
import { sendEmail } from '@/api/functions';
import { customLoginWithRedirect } from '../components/utils/auth';

export default function Fellowship() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    route: '',
    yearsInRole: '',
    currentRole: '',
    organisation: '',
    message: ''
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const isEligible = user && user.membershipType === 'Full' && user.membershipStatus === 'active';

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    try {
      await base44.entities.FellowshipApplication.create({
        userId: user?.id || null,
        userEmail: user?.email || formData.email,
        userName: user?.displayName || user?.full_name || formData.name,
        route: formData.route,
        yearsInRole: parseInt(formData.yearsInRole) || 0,
        currentRole: formData.currentRole,
        organisation: formData.organisation,
        message: formData.message,
        isMemberInGoodStanding: isEligible,
        status: 'pending'
      });

      const applicantName = user?.displayName || user?.full_name || formData.name;
      const applicantEmail = user?.email || formData.email;
      
      const emailBody = `
        <td style="padding: 30px 40px; color: #333; line-height: 1.6;">
          <h1 style="color: #333; font-size: 24px;">New Fellowship Application</h1>
          <p>Someone has submitted an application for Fellowship.</p>
          <div style="background-color: #fafafa; border-left: 4px solid #5e028f; padding: 20px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Applicant:</strong> ${applicantName}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${applicantEmail}</p>
            <p style="margin: 5px 0;"><strong>Route:</strong> ${formData.route}</p>
            <p style="margin: 5px 0;"><strong>Years in Role:</strong> ${formData.yearsInRole}</p>
            <p style="margin: 5px 0;"><strong>Current Role:</strong> ${formData.currentRole}</p>
            <p style="margin: 5px 0;"><strong>Organisation:</strong> ${formData.organisation}</p>
            ${formData.message ? `<p style="margin: 15px 0 0 0;"><strong>Message:</strong><br/>${formData.message.replace(/\n/g, '<br/>')}</p>` : ''}
          </div>
        </td>
      `;

      await sendEmail({
        to: 'info@ifs-safeguarding.co.uk',
        subject: 'New Fellowship Application',
        html: emailBody
      });

      // Send confirmation email to applicant
      const confirmationBody = `
        <td style="padding: 30px 40px; color: #333; line-height: 1.6;">
          <h1 style="color: #333; font-size: 24px;">Fellowship Application Received</h1>
          <p>Dear ${applicantName},</p>
          <p>Thank you for your interest in Fellowship with the Independent Federation for Safeguarding.</p>
          <p>We have received your application for the <strong>${formData.route}</strong> route and will review it shortly.</p>
          <div style="background-color: #fafafa; border-left: 4px solid #5e028f; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Next Steps</h3>
            <p>We'll be in touch within the next few days to schedule your initial consultation. During this consultation, we'll discuss your experience, professional development, and the most appropriate route to Fellowship for you.</p>
          </div>
          <p>If you have any questions in the meantime, please don't hesitate to contact us.</p>
          <p style="margin-top: 30px;">Best regards,<br/>The IfS Team</p>
        </td>
      `;

      await sendEmail({
        to: applicantEmail,
        subject: 'Fellowship Application Received - IfS',
        html: confirmationBody
      });

      toast({
        title: "Application Submitted",
        description: "We'll be in touch shortly to schedule your consultation."
      });

      setSubmitted(true);
      setFormData({ route: '', yearsInRole: '', currentRole: '', organisation: '', message: '' });
    } catch (error) {
      console.error("Application submission failed:", error);
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gray-900 overflow-hidden" style={{ minHeight: '600px' }}>
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2070&auto=format&fit=crop"
            alt="Professional leadership in safeguarding"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-purple-800/80 to-transparent"></div>
        
        <MainSiteNav />

        <div className="relative z-10 max-w-screen-xl mx-auto">
          <div className="grid lg:grid-cols-2 items-center min-h-[600px]">
            <div className="px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center lg:text-left">
              <HeroBreadcrumbs pageName="Fellowship Programme" />
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                Fellowship Programme
              </h1>
              <p className="text-xl lg:text-2xl text-purple-100 font-semibold mb-4">
                Recognising leadership, impact and contribution in safeguarding
              </p>
              <div className="text-lg text-purple-100 mb-8 leading-relaxed">
                <p>Fellowship of the Independent Federation for Safeguarding is the highest level of professional membership.</p>
              </div>
              <div className="hidden lg:flex items-center gap-4">
                <Button
                  onClick={() => document.getElementById('routes')?.scrollIntoView({ behavior: 'smooth' })}
                  size="lg"
                  className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm"
                >
                  Explore Routes to Fellowship
                </Button>
                <Button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/6c32e4577_IFSMembership-Dec25_compressed.pdf';
                    link.download = 'IFS-Membership-Brochure.pdf';
                    link.target = '_blank';
                    link.click();
                  }}
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-800 font-semibold px-8 py-3 text-base rounded-sm"
                >
                  Download Brochure
                </Button>
              </div>
              <div className="mt-8 lg:hidden flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => document.getElementById('routes')?.scrollIntoView({ behavior: 'smooth' })}
                  size="lg"
                  className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm w-full sm:w-auto"
                >
                  Explore Routes to Fellowship
                </Button>
                <Button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/6c32e4577_IFSMembership-Dec25_compressed.pdf';
                    link.download = 'IFS-Membership-Brochure.pdf';
                    link.target = '_blank';
                    link.click();
                  }}
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-800 font-semibold px-8 py-3 text-base rounded-sm w-full sm:w-auto"
                >
                  Download Brochure
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is Fellowship */}
      <section className="bg-white py-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-black leading-tight mb-6">
                The highest level of professional membership
              </h2>
              <div className="space-y-4 text-lg text-gray-600 leading-relaxed">
                <p>
                  Fellowship recognises safeguarding professionals who have demonstrated sustained leadership, influence and impact within their organisation, sector or the wider safeguarding landscape.
                </p>
                <p>
                  Fellowship is not solely a measure of seniority or job title. It reflects a commitment to advancing safeguarding practice, supporting others, and contributing to the development of the profession.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6">What Fellowship Means</h3>
              <div className="space-y-5">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Recognition of Excellence</h4>
                  <p className="text-sm text-gray-600">Professional excellence and leadership in safeguarding</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Enhanced Credibility</h4>
                  <p className="text-sm text-gray-600">Enhanced professional credibility and standing within organisations, partnerships and the wider sector</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Strategic Influence</h4>
                  <p className="text-sm text-gray-600">Opportunities to influence strategic direction and enhance sector-wide practices</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Routes to Fellowship */}
      <section id="routes" className="bg-slate-50 py-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
              Two Routes to Fellowship
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              IfS offers two routes to Fellowship, reflecting different professional journeys while maintaining a consistent standard of rigour, integrity and assessment.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Experience-Validated Route */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=800&auto=format&fit=crop"
                  alt="Experience validation"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white">Route 1: Experience Validation</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    The experience-based route recognises safeguarding leaders whose expertise has been developed through substantial professional experience, leadership responsibility and demonstrable impact.
                  </p>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Requirements</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-0.5">•</span>
                      <span>Full Membership in good standing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-0.5">•</span>
                      <span>Five or more years' experience in a safeguarding leadership role</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-0.5">•</span>
                      <span>Professional references demonstrating excellence</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-0.5">•</span>
                      <span>Evidence of leading safeguarding in complex contexts</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Application Process</h4>
                  <p className="text-sm text-gray-600">
                    Begins with a consultation with IfS to explore your role, responsibilities and leadership experience. Assessment focuses on quality, leadership and impact.
                  </p>
                </div>
              </div>
            </div>

            {/* CPD-Accredited Route */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop"
                  alt="CPD accredited"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white">Route 2: CPD Accredited</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    The CPD-based route supports safeguarding professionals who wish to progress to Fellowship through structured, advanced professional development.
                  </p>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Requirements</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-0.5">•</span>
                      <span>Full Membership in good standing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-0.5">•</span>
                      <span>Bespoke CPD programme (24-36 hours of learning)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-0.5">•</span>
                      <span>Professional references and evidence of engagement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-0.5">•</span>
                      <span>Final review by IfS upon programme completion</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Application Process</h4>
                  <p className="text-sm text-gray-600">
                    Consultation with your CPD Manager at IfS to design a tailored programme aligned to safeguarding leadership, complexity and professional judgement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Terms and Commitment */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-black mb-6">
              Terms and Commitment
            </h2>
            <p className="text-lg text-gray-600">
              Fellowship is a dynamic professional commitment requiring ongoing engagement and reflection.
            </p>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Fellowship Term</h3>
              <p className="text-gray-600 leading-relaxed">
                Fellowship is awarded for an initial 12-month period. Renewals are granted following successful annual reviews.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Annual Review Process</h3>
              <p className="text-gray-600 leading-relaxed">
                Each year, Fellows take part in a refresher consultation with IfS to reflect on practice, review professional development, and agree requirements for the year ahead.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Membership</h3>
              <p className="text-gray-600 leading-relaxed">
                Fellowship requires Full Membership in good standing, with an additional administration fee to support Fellowship administration and maintenance of professional records.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Brochure Showcase Section */}
      <section className="relative bg-white py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-purple-50"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-100 rounded-full blur-3xl opacity-40"></div>
        
        <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-purple-600/10 to-slate-900/10 rounded-3xl blur-2xl"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
                <div className="aspect-[8.5/11] bg-gradient-to-br from-purple-50 to-slate-50 rounded-lg overflow-hidden shadow-inner border border-slate-200">
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/6c32e4577_IFSMembership-Dec25_compressed.pdf"
                    alt="IfS Membership Brochure"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544006659-f0b21884ce1d?w=400&h=600&fit=crop'; }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600 mb-4 block">
                  Comprehensive Guide
                </span>
                <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-6 tracking-tight">
                  Your complete guide to IfS Membership
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Explore all membership tiers, from free Associate benefits to enhanced Full Membership and Fellowship pathways. Everything you need to know in one comprehensive resource.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">What's Inside</h3>
                <div className="grid gap-4">
                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 border border-slate-200">
                      <Users className="w-5 h-5 text-slate-700" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm mb-1">Complete Tier Comparison</h4>
                      <p className="text-xs text-slate-600">Associate, Full, and Fellowship benefits detailed</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 border border-slate-200">
                      <GraduationCap className="w-5 h-5 text-slate-700" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm mb-1">CPD Training & Development</h4>
                      <p className="text-xs text-slate-600">Professional learning opportunities and pathways</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 border border-slate-200">
                      <Award className="w-5 h-5 text-slate-700" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm mb-1">Professional Recognition</h4>
                      <p className="text-xs text-slate-600">Credentials, designations, and member benefits</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/6c32e4577_IFSMembership-Dec25_compressed.pdf';
                    link.download = 'IFS-Membership-Brochure.pdf';
                    link.target = '_blank';
                    link.click();
                  }}
                  size="lg"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-6 text-lg rounded-sm shadow-lg hover:shadow-xl transition-all"
                >
                  Download Full Brochure (PDF)
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-xs text-slate-500 text-center mt-3">13-page comprehensive guide • Updated December 2025</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-black mb-4">
              Begin Your Application
            </h2>
            <p className="text-lg text-gray-600">
              Applicants must be Full Members in good standing.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Received</h3>
                <p className="text-gray-600 mb-6">
                  Thank you for your interest in Fellowship. We'll be in touch shortly to schedule your initial consultation.
                </p>
                <Button onClick={() => setSubmitted(false)} variant="outline">
                  Submit Another Application
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {!user && (
                  <>
                    <div>
                      <Label htmlFor="name" className="text-sm font-semibold">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="mt-2"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-semibold">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="mt-2"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </>
                )}
                <div>
                  <Label htmlFor="route" className="text-sm font-semibold">Fellowship Route *</Label>
                  <Select 
                    value={formData.route}
                    onValueChange={(value) => setFormData({ ...formData, route: value })}
                    required
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select your preferred route" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Experience Validation">Experience Validation</SelectItem>
                      <SelectItem value="CPD Accredited">CPD Accredited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="yearsInRole" className="text-sm font-semibold">Years in Safeguarding Leadership *</Label>
                    <Input
                      id="yearsInRole"
                      type="number"
                      min="0"
                      value={formData.yearsInRole}
                      onChange={(e) => setFormData({ ...formData, yearsInRole: e.target.value })}
                      required
                      className="mt-2"
                      placeholder="e.g., 7"
                    />
                  </div>

                  <div>
                    <Label htmlFor="currentRole" className="text-sm font-semibold">Current Role *</Label>
                    <Input
                      id="currentRole"
                      value={formData.currentRole}
                      onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                      required
                      className="mt-2"
                      placeholder="e.g., Designated Safeguarding Lead"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="organisation" className="text-sm font-semibold">Current Organisation *</Label>
                  <Input
                    id="organisation"
                    value={formData.organisation}
                    onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
                    required
                    className="mt-2"
                    placeholder="Organisation name"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-sm font-semibold">Tell us about your leadership experience and impact</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="mt-2"
                    rows={6}
                    placeholder="Share examples of your leadership, impact, and contribution to safeguarding practice..."
                  />
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded p-4">
                  <p className="text-sm text-gray-700">
                    <strong>Next Steps:</strong> After submission, we'll contact you to schedule an initial consultation to discuss your application and determine the most appropriate route.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full bg-purple-600 hover:bg-purple-700 font-semibold"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                {!user && (
                  <p className="text-center text-sm text-gray-600">
                    Already a member?{' '}
                    <button 
                      type="button"
                      onClick={() => customLoginWithRedirect(createPageUrl('Fellowship'))}
                      className="text-purple-600 hover:text-purple-700 font-semibold underline"
                    >
                      Sign in to auto-fill your details
                    </button>
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </section>

      <MarketingFooter />
      <Toaster />
    </>
  );
}