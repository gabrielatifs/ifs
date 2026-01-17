import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Building2,
  Users,
  Shield,
  BookOpen,
  Award,
  ArrowRight,
  TrendingUp,
  Clock,
  Check,
  Heart,
  CheckCircle2,
  Target } from
'lucide-react';
import MainSiteNav from '../components/marketing/MainSiteNav';
import HeroBreadcrumbs from '../components/marketing/HeroBreadcrumbs';
import ServiceCard from '../components/marketing/ServiceCard';
import { usePostHog } from '../components/providers/PostHogProvider';

export default function Organisation() {
  const { trackEvent } = usePostHog();

  const handleGetStarted = (location) => {
    trackEvent('get_started_clicked', {
      intent: 'organisation',
      location: location || 'organisation_page_hero',
      user_type: 'anonymous'
    });
    window.location.href = createPageUrl('OrganisationMembership');
  };

  const benefits = [
  {
    title: "Full Membership Seats",
    description: "Secure dedicated Full Membership seats for your DSLs and DDSLs with all premium benefits included.",
    imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b647042_pexels-igreja-dimensao-56315701-10401279.jpg",
    linkTo: createPageUrl('FullMembership'),
    linkText: "Learn More"
  },
  {
    title: "Monthly CPD Hours",
    description: "Each seat receives 1 CPD hour per month (12 annually) to book training, supervision, and masterclasses.",
    imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d66daf168696381e05/15fda2c0c_chris-montgomery-smgTvepind4-unsplash.jpg",
    linkTo: createPageUrl('CPDTrainingMarketing'),
    linkText: "View Training"
  },
  {
    title: "Team Management",
    description: "Centralized dashboard to manage your team's memberships, training, and professional development.",
    imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d66daf168696381e05/1e1479e4b_centre-for-ageing-better-XH8chLuj02g-unsplash.jpg",
    linkTo: createPageUrl('OrganisationMembership'),
    linkText: "Get Started"
  },
  {
    title: "10% Training Discount",
    description: "All team members receive 10% off additional training courses and supervision services.",
    imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d66daf168696381e05/8e4a9aaf0_guzel-maksutova-B30XL_m3fso-unsplash.jpg",
    linkTo: createPageUrl('CPDTrainingMarketing'),
    linkText: "Browse Courses"
  },
  {
    title: "Digital Credentials",
    description: "Team members earn verified digital credentials and certificates for all completed training.",
    imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d66daf168696381e05/465bd1fe1_amy-hirschi-JaoVGh5aJ3E-unsplash1.jpg",
    linkTo: createPageUrl('MemberBenefits'),
    linkText: "View Benefits"
  },
  {
    title: "Priority Support",
    description: "Dedicated account management and priority access to our support team for your organisation.",
    imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d66daf168696381e05/15fda2c0c_chris-montgomery-smgTvepind4-unsplash.jpg",
    linkTo: createPageUrl('Contact'),
    linkText: "Contact Us"
  }];


  const pricingTiers = [
  { seats: "1-2", price: "£20", color: "bg-blue-50 border-blue-200" },
  { seats: "3-5", price: "£16", color: "bg-purple-50 border-purple-200", popular: true },
  { seats: "6-8", price: "£15", color: "bg-indigo-50 border-indigo-200" },
  { seats: "9-10", price: "£14", color: "bg-violet-50 border-violet-200" },
  { seats: "11+", price: "£12", color: "bg-fuchsia-50 border-fuchsia-200" }];


  return (
    <>
            {/* Hero Section */}
            <section className="relative bg-gray-900 overflow-hidden" style={{ minHeight: '600px' }}>
                <div className="absolute inset-0">
                    <img
            src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop"
            alt="Professional team collaboration"
            className="w-full h-full object-cover object-center opacity-30" />

                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-800/80 to-transparent"></div>

                <MainSiteNav />

                <div className="relative z-10 max-w-screen-xl mx-auto">
                    <div className="grid lg:grid-cols-2 items-center min-h-[600px]">
                        <div className="px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center lg:text-left">
                            <HeroBreadcrumbs pageName="Organisation" />
                            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                                Organisation Membership
                            </h1>
                            <div className="text-lg lg:text-xl text-blue-100 mb-8 leading-relaxed space-y-4">
                                <p>
                                    Empower your safeguarding team with dedicated Full Membership seats.
                                </p>
                                <p className="hidden lg:block">
                                    Secure monthly CPD hours, centralized management, and comprehensive support for your DSLs and DDSLs.
                                </p>
                            </div>
                            <div className="hidden lg:inline-flex">
                                <Button
                  onClick={() => handleGetStarted('organisation_hero_desktop')}
                  size="lg"
                  className="bg-white text-blue-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm">

                                    Get Started
                                </Button>
                            </div>
                            <div className="mt-8 lg:hidden">
                                <Button
                  onClick={() => handleGetStarted('organisation_hero_mobile')}
                  size="lg"
                  className="bg-white text-blue-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm w-full sm:w-auto">

                                    Get Started
                                </Button>
                            </div>
                        </div>
                        <div className="hidden lg:block"></div>
                    </div>
                </div>
            </section>

            {/* Main Content Section */}
            <section className="bg-white py-24">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-4 gap-16 items-start">
                        <div className="lg:col-span-2">
                            <div>
                                <h2 className="text-4xl lg:text-5xl font-bold text-black leading-tight">
                                    Support your safeguarding team with full membership benefits.
                                </h2>
                            </div>
                            <div className="mt-8">
                                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                    Organisation Membership provides Full Membership seats for your DSLs and DDSLs with monthly CPD hours, comprehensive training discounts, and centralized team management.
                                </p>
                                <p className="text-lg text-gray-600 leading-relaxed mb-8">
                                    Each seat includes all Full Member benefits: professional credentials, monthly CPD hours, 10% training discounts, and access to exclusive masterclasses and resources.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button
                    onClick={() => handleGetStarted('organisation_intro_cta')}
                    size="lg"
                    className="bg-black hover:bg-gray-800 text-white font-semibold px-8 py-3 rounded-sm">

                                        Register Your Organisation
                                    </Button>
                                    <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-2 border-black text-black hover:bg-black hover:text-white font-semibold px-8 py-3 rounded-sm transition-all">

                                        <Link to={createPageUrl("Contact")}>Contact Sales</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-2">
                            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 sticky top-10">
                                <h3 className="text-3xl font-bold text-black mb-2">Flexible Pricing</h3>
                                <p className="text-gray-600 mb-6">
                                    Volume-based pricing that scales with your team. Choose the number of seats you need.
                                </p>
                                
                                <div className="space-y-3 mb-6">
                                    {pricingTiers.map((tier, index) =>
                  <div key={index} className={`flex justify-between items-center p-4 rounded-lg border-2 ${tier.color} ${tier.popular ? 'ring-2 ring-purple-500' : ''}`}>
                                            <div>
                                                <span className="font-bold text-gray-900">{tier.seats} seats</span>
                                                {tier.popular && <span className="ml-2 text-xs bg-purple-600 text-white px-2 py-1 rounded-full">Most Popular</span>}
                                            </div>
                                            <span className="text-2xl font-bold text-gray-900">{tier.price}<span className="text-sm font-normal text-gray-600">/seat/mo</span></span>
                                        </div>
                  )}
                                </div>

                                <Button
                  onClick={() => handleGetStarted('organisation_pricing_box_cta')}
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg py-7 rounded-lg shadow-lg hover:shadow-xl transition-all">

                                    <>
                                        <Building2 className="w-5 h-5 mr-3" />
                                        Register Your Organisation
                                    </>
                                </Button>
                                <p className="text-xs text-center text-gray-500 mt-4">Annual billing available</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>



            {/* 4 Key Features Deep Dive */}
            <section className="bg-white py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                            Key Benefits for Your Organisation
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Everything your safeguarding team needs for professional excellence.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Monthly CPD Hours */}
                        <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border border-blue-200">
                            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-xl mb-6">
                                <BookOpen className="w-7 h-7 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Monthly CPD Hours Allocation</h3>
                            <p className="text-gray-700 mb-4 leading-relaxed">
                                Each seat receives 1 CPD hour per month (12 annually) to book training sessions, supervision, and exclusive masterclasses.
                            </p>
                            <ul className="space-y-2 text-gray-700">
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <span>12 CPD hours per seat annually</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <span>Use for training, supervision, or masterclasses</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <span>Flexible allocation across your team</span>
                                </li>
                            </ul>
                        </div>

                        {/* Team Management */}
                        <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border border-purple-200">
                            <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-100 rounded-xl mb-6">
                                <Shield className="w-7 h-7 text-purple-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Centralized Team Management</h3>
                            <p className="text-gray-700 mb-4 leading-relaxed">
                                Manage your entire safeguarding team from one central dashboard with comprehensive oversight and reporting.
                            </p>
                            <ul className="space-y-2 text-gray-700">
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                    <span>Track CPD hours and training progress</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                    <span>Manage seat assignments and invitations</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                    <span>View team credentials and certificates</span>
                                </li>
                            </ul>
                        </div>

                        {/* Training Discount */}
                        <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl border border-green-200">
                            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-xl mb-6">
                                <TrendingUp className="w-7 h-7 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">10% Training Discount</h3>
                            <p className="text-gray-700 mb-4 leading-relaxed">
                                All team members receive an exclusive 10% discount on additional training courses and supervision services beyond their CPD hours.
                            </p>
                            <ul className="space-y-2 text-gray-700">
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <span><strong>10% discount</strong> on all training courses</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <span>Applies to supervision services</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <span>Automatic at checkout for all seats</span>
                                </li>
                            </ul>
                        </div>

                        {/* Full Member Benefits */}
                        <div className="bg-gradient-to-br from-amber-50 to-white p-8 rounded-2xl border border-amber-200">
                            <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 rounded-xl mb-6">
                                <Award className="w-7 h-7 text-amber-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Full Member Benefits</h3>
                            <p className="text-gray-700 mb-4 leading-relaxed">
                                Each seat holder receives all Full Membership benefits including professional credentials, voting rights, and priority access.
                            </p>
                            <ul className="space-y-2 text-gray-700">
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <span>FMIfS professional designation</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <span>Digital credentials and certificates</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <span>Community forums and peer support</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Organisation Membership CTA Section */}
            <section className="bg-slate-50 py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-r from-slate-100 to-gray-50 rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                        <div className="grid lg:grid-cols-2 items-center">
                            <div className="p-8 lg:p-12">
                                <div className="mb-6">
                                    <span className="inline-block bg-blue-100 text-blue-800 text-sm font-bold px-4 py-2 rounded-sm uppercase tracking-wider">
                                        ORGANISATION
                                    </span>
                                </div>
                                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                                    Secure Full Membership seats for your DSLs and DDSLs. Each seat includes monthly CPD hours, comprehensive training discounts, and all Full Member benefits with centralized team management.
                                </p>
                                <div className="mb-8">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-lg text-gray-600">From</span>
                                        <span className="text-4xl font-bold text-black">£12</span>
                                        <span className="text-gray-500">/ seat / month</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2">Volume-based pricing • Annual billing available</p>
                                </div>
                                <Button
                  onClick={() => handleGetStarted('organisation_cta_section_button')}
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 text-lg rounded-sm shadow-lg hover:shadow-xl transition-all">

                                    <>
                                        Register Your Organisation <ArrowRight className="w-5 h-5 ml-2" />
                                    </>
                                </Button>
                            </div>

                            <div className="relative h-64 lg:h-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                                <div className="absolute inset-0 overflow-hidden">
                                    <div className="absolute top-8 right-8 w-24 h-24 bg-blue-200 rounded-full opacity-60"></div>
                                    <div className="absolute top-20 right-20 w-16 h-16 bg-blue-300 rounded-full opacity-40"></div>
                                    <div className="absolute bottom-8 left-8 w-20 h-20 bg-blue-400 rounded-full opacity-30"></div>
                                    <div className="absolute bottom-16 left-16 w-12 h-12 bg-blue-500 rounded-full opacity-50"></div>
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-300 rounded-full opacity-20"></div>
                                </div>

                                <div className="relative z-10 text-center text-blue-700">
                                    <Building2 className="w-16 h-16 mx-auto mb-4 opacity-60" />
                                    <p className="font-semibold text-sm">Empower Your Safeguarding Team</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="bg-gradient-to-r from-blue-800 to-indigo-800 py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="relative">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                            Ready to Support Your Team?
                        </h2>
                        <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                            Join leading organisations who trust IfS to support their safeguarding professionals. Register in minutes and start managing your team today.
                        </p>
                        <Button
              onClick={() => handleGetStarted('organisation_final_cta')}
              size="lg"
              className="bg-white text-blue-800 hover:bg-gray-100 font-bold px-10 py-4 text-lg rounded-sm shadow-2xl hover:scale-105 transition-all">

                            Get Started Now
                        </Button>
                        <p className="text-xs text-blue-200 mt-4">Dedicated support for safeguarding teams nationwide.</p>
                    </div>
                </div>
            </section>
        </>);

}