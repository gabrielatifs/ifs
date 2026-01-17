import React, { useState, useEffect } from 'react';
import { Button } from '@ifs/shared/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@ifs/shared/utils';
import { User } from '@ifs/shared/api/entities';
import { customLoginWithRedirect } from '../components/utils/auth';
import { ArrowRight, CheckCircle2, Award, Loader2, Briefcase, Vote, HelpCircle, Users, GraduationCap } from 'lucide-react';
import MainSiteNav from '../components/marketing/MainSiteNav';
import HeroBreadcrumbs from '../components/marketing/HeroBreadcrumbs';
import { useToast } from "@ifs/shared/components/ui/use-toast";
import MembershipTable from '@ifs/shared/components/membership/MembershipTable';
import { usePostHog } from '@ifs/shared/components/providers/PostHogProvider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@ifs/shared/components/ui/accordion";

export default function FullMembership() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { trackEvent } = usePostHog();

  const handleJoin = (eventLocation) => {
    trackEvent('join_button_clicked', {
      intent: 'full',
      location: eventLocation || 'full_membership_page_unknown',
      user_type: 'anonymous'
    });
    const redirectPath = `${createPageUrl('Onboarding')}?intent=full`;
    customLoginWithRedirect(redirectPath);
  };

  const handleRequestOrgPayment = () => {
    User.me().
    then((user) => {
      if (!user) {
        customLoginWithRedirect(createPageUrl('RequestOrgPayment'));
      } else {
        window.location.href = createPageUrl('RequestOrgPayment');
      }
    }).
    catch(() => {
      customLoginWithRedirect(createPageUrl('RequestOrgPayment'));
    });
  };

  const handleJoinAssociate = () => {
    customLoginWithRedirect(createPageUrl('Onboarding') + '?intent=associate');
  };

  const benefits = [
    "Standards regulated and affirmed by IfS",
    "1 CPD Hour included monthly—bank and use when you need it",
    "All Associate Membership benefits",
    "10% discount on training courses and supervision",
    "MIFS post-nominal designation",
    "Full Member digital credential",
    "Full voting rights—shape the sector",
    "Priority conference access",
    "Priority member support"
  ];


  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gray-900 overflow-hidden" style={{ minHeight: '600px' }}>
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=2070&auto=format&fit=crop"
            alt="Professional conference attendees networking"
            className="w-full h-full object-cover object-center opacity-30"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-purple-800/80 to-transparent"></div>

        <MainSiteNav />

        <div className="relative z-10 max-w-screen-xl mx-auto">
          <div className="grid lg:grid-cols-2 items-center min-h-[600px]">
            <div className="px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center lg:text-left">
              <HeroBreadcrumbs pageName="FullMembership" />
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                Full Membership
              </h1>
              <div className="text-lg lg:text-xl text-purple-100 mb-8 leading-relaxed space-y-4">
                <p>
                  Gain the MIfS professional designation, full voting rights, and 10% off training & supervision. Plus 1 Free CPD Hour included monthly.
                </p>
              </div>
              <div className="hidden lg:flex items-center gap-4">
                <Button
                  onClick={() => handleJoin('full_membership_hero_desktop')}
                  size="lg"
                  className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm shadow-lg hover:scale-105 transition-transform"
                >
                  Apply for Full Membership
                </Button>
                <Button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/1b0d9d6ab_IFSMembership-Dec253.pdf';
                    link.download = 'IFS-Membership-Brochure.pdf';
                    link.target = '_blank';
                    link.click();
                  }}
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-800 font-semibold px-8 py-3 text-base rounded-sm shadow-lg hover:scale-105 transition-all"
                >
                  Download Brochure
                </Button>
              </div>
              <div className="mt-8 lg:hidden flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => handleJoin('full_membership_hero_mobile')}
                  size="lg"
                  className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm w-full sm:w-auto"
                >
                  Apply Now
                </Button>
                <Button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/1b0d9d6ab_IFSMembership-Dec253.pdf';
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
                  Real, measurable professional development – every month.
                </h2>
              </div>
              <div className="mt-8">
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  Full Membership gives you more than community and support – it gives you real, measurable professional development with one hour of CPD added to your account each month.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed mb-8">
                  As a Full Member of IfS, you'll receive one hour of CPD credit per month, which you can bank and use whenever you need it: whether that's all in one go or spread across multiple sessions.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => handleJoin('full_membership_main_content_top')}
                    size="lg"
                    className="bg-black hover:bg-gray-800 text-white font-semibold px-8 py-3 rounded-sm"
                  >
                    Apply Now
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-2 border-black text-black hover:bg-black hover:text-white font-semibold px-8 py-3 rounded-sm transition-all"
                  >
                    <Link to={createPageUrl("MembershipTiers")}>Compare All Tiers</Link>
                  </Button>
                </div>
              </div>
            </div>
            {/* Right Column - Action Box */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg p-8 border-t-4 border-slate-900 shadow-lg sticky top-10">
                <div className="mb-6">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3 block">
                    Professional Standard
                  </span>
                  <h3 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Full Membership</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Become a practitioner whose standards are regulated and affirmed by IfS. Get 1 CPD Hour monthly, plus MIfS designation, voting rights, and 10% off all training and supervision.
                  </p>
                </div>

                <div className="w-12 h-px bg-slate-200 my-6"></div>

                <div className="mb-8">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-2">
                    Membership Fee
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900">£20</span>
                    <span className="text-slate-500 text-sm">/month</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">
                    Includes 1 CPD Hour monthly
                  </p>
                </div>
                <div className="space-y-3">
                  <Button
                    onClick={() => handleJoin('full_membership_action_box')}
                    size="lg"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm tracking-[0.1em] uppercase py-6 rounded-sm transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Apply for Full Membership'
                    )}
                  </Button>
                  <Button
                    onClick={handleRequestOrgPayment}
                    size="lg"
                    variant="outline"
                    className="w-full text-slate-900 border-slate-200 bg-white hover:bg-slate-50"
                  >
                    Organisation Sponsored
                  </Button>
                </div>
                <p className="text-xs text-center text-slate-500 mt-4">Cancel anytime.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1 Free CPD Hour Explanation */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 block">
                CPD Hours
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
                Your hour, your decision
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Use your monthly CPD hour as a discount off any of our training courses, or apply it in full to a session of your choice. It's your hour, your decision.
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3">
                  <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0 bg-slate-900" />
                  <p className="text-slate-600">Whether you want to stay ahead of new safeguarding guidance, refresh your skills or earn a certificate – you've got a dedicated CPD hour waiting for you every month.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0 bg-slate-900" />
                  <p className="text-slate-600">We recognise how busy safeguarding professionals are — so your CPD hour doesn't expire at the end of the month. You choose when to use it.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0 bg-slate-900" />
                  <p className="text-slate-600">Plus 10% discount – additional savings on all training and supervision</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-8 border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6">How Your CPD Hours Work</h3>
              <div className="space-y-4">
                <div className="pb-4 border-b border-slate-100">
                  <h4 className="font-semibold text-slate-900 mb-2">Receive Automatically</h4>
                  <p className="text-sm text-slate-600">One hour of CPD credit added to your account each month, ready when you need it.</p>
                </div>
                <div className="pb-4 border-b border-slate-100">
                  <h4 className="font-semibold text-slate-900 mb-2">Use Flexibly</h4>
                  <p className="text-sm text-slate-600">Apply your hours as part-payment or in full for any of our CPD-accredited courses.</p>
                </div>
                <div className="pb-4">
                  <h4 className="font-semibold text-slate-900 mb-2">Bank Forever</h4>
                  <p className="text-sm text-slate-600">Hours carry over – use them later. You choose when to use them.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 block">
              Questions
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-slate-600">
              Everything you need to know about your CPD hours
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left">
                <span className="font-semibold">How does the CPD hour work?</span>
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed">
                Each month you accrue one hour of CPD credit. You can save (bank) these hours and use them at a time that suits you.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                <span className="font-semibold">What if I don't use my hour in one month?</span>
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed">
                No problem — the hours carry over, so you can use them later.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                <span className="font-semibold">How many training courses can I apply it to?</span>
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed">
                You can use your hours as part-payment or in full for any of our CPD-accredited courses.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">
                <span className="font-semibold">Can I use CPD hours and the 10% discount together?</span>
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed">
                Yes! You can apply your banked CPD hours to a course and still benefit from the 10% member discount on training and supervision.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left">
                <span className="font-semibold">What happens to my CPD hours if I cancel my membership?</span>
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed">
                You'll keep any CPD hours you've already accrued and can use them for up to 12 months after your membership ends. You won't accrue new hours while your membership is inactive.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Democracy & Voting Section */}
      <section className="bg-white py-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 block">
                Democracy & Influence
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
                Shape the future of safeguarding
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Full Members don't just access resources – they actively shape the direction of IfS and the wider safeguarding sector. Your voting rights give you real influence over organizational decisions and policy positions.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0 bg-slate-900" />
                  <p className="text-slate-600">Full voting rights in all organizational decisions</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0 bg-slate-900" />
                  <p className="text-slate-600">Elect Board members who represent your interests</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0 bg-slate-900" />
                  <p className="text-slate-600">Influence sector policy and advocacy positions</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0 bg-slate-900" />
                  <p className="text-slate-600">Shape best practice standards for the profession</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-8 border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Your Voice Matters</h3>
              <div className="space-y-6">
                <div className="pb-6 border-b border-slate-200">
                  <h4 className="font-semibold text-slate-900 mb-2">Vote on Key Decisions</h4>
                  <p className="text-sm text-slate-600">Have your say in elections for the Board of Trustees and key organizational decisions.</p>
                </div>
                <div className="pb-6 border-b border-slate-200">
                  <h4 className="font-semibold text-slate-900 mb-2">Shape Policy Positions</h4>
                  <p className="text-sm text-slate-600">Influence IfS policy positions and advocacy work on behalf of the safeguarding sector.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Influence Best Practice</h4>
                  <p className="text-sm text-slate-600">Contribute to the development of sector-wide best practice guidance and standards.</p>
                </div>
              </div>
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
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/1b0d9d6ab_IFSMembership-Dec253.pdf"
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
                    link.href = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/1b0d9d6ab_IFSMembership-Dec253.pdf';
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

      {/* Membership Tier Comparison */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
              Compare Membership Tiers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              See how Full Membership enhances your professional development
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Associate Membership Card */}
            <div className="bg-white border-2 border-slate-200 rounded-lg overflow-hidden flex flex-col">
              <div className="p-8 flex-1">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Associate</h3>
                  <p className="text-slate-600 mb-4">
                    Essential membership for safeguarding professionals
                  </p>
                  <div className="text-sm text-slate-500">
                    <span className="font-medium">Membership fee:</span> Free
                  </div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-slate-900 flex-shrink-0 mt-0.5" />
                    <span>AMIfS post-nominal designation</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-slate-900 flex-shrink-0 mt-0.5" />
                    <span>Digital membership credential</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-slate-900 flex-shrink-0 mt-0.5" />
                    <span>Monthly professional workshops</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-slate-900 flex-shrink-0 mt-0.5" />
                    <span>Community forum access</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-slate-900 flex-shrink-0 mt-0.5" />
                    <span>Weekly newsletter</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-slate-900 flex-shrink-0 mt-0.5" />
                    <span>3 job views per day</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-8 pt-0">
                <Button
                  onClick={handleJoinAssociate}
                  size="lg"
                  variant="outline"
                  className="w-full border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white"
                >
                  Join for Free
                </Button>
              </div>
            </div>

            {/* Full Membership Card */}
            <div className="bg-white border-2 border-purple-600 rounded-lg overflow-hidden flex flex-col relative">
              <div className="absolute top-0 left-0 right-0 bg-purple-600 text-white text-xs font-bold text-center py-2 uppercase tracking-wider">
                Most Popular
              </div>
              <div className="p-8 pt-14 flex-1">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Full Membership</h3>
                  <p className="text-slate-600 mb-4">
                    Professional development with CPD hours
                  </p>
                  <div className="text-sm text-slate-500">
                    <span className="font-medium">Membership fee:</span> £20/month
                  </div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="font-semibold text-slate-900">MIFS post-nominal designation</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="font-semibold text-slate-900">10% training & supervision discount</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="font-semibold text-slate-900">1 CPD Hour included monthly</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>All Associate benefits</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Full voting rights</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Priority support</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-8 pt-0">
                <Button
                  onClick={() => handleJoin('full_membership_comparison_table')}
                  size="lg"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Become a Full Member
                </Button>
              </div>
            </div>

            {/* Fellowship Card */}
            <div className="bg-white border-2 border-slate-200 rounded-lg overflow-hidden flex flex-col">
              <div className="p-8 flex-1">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Fellowship</h3>
                  <p className="text-slate-600 mb-4">
                    Highest level of professional recognition
                  </p>
                  <div className="text-sm text-slate-500">
                    <span className="font-medium">By application</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-slate-900 flex-shrink-0 mt-0.5" />
                    <span className="font-semibold text-slate-900">FIfS designation</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-slate-900 flex-shrink-0 mt-0.5" />
                    <span>All Full Membership benefits</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-slate-900 flex-shrink-0 mt-0.5" />
                    <span>Leadership recognition</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-slate-900 flex-shrink-0 mt-0.5" />
                    <span>Annual review process</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-slate-900 flex-shrink-0 mt-0.5" />
                    <span>Sector influence</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-8 pt-0">
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white"
                >
                  <Link to={createPageUrl("Fellowship")}>Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-slate-900 py-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6 tracking-tight">
            Ready to Invest in Your Professional Excellence?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Join thousands of safeguarding leaders with Full Membership – bank your monthly CPD hours, use the MIfS designation, and have a voice in shaping the sector.
          </p>
          <Button
            onClick={() => handleJoin('full_membership_final_cta')}
            size="lg"
            className="bg-white text-slate-900 hover:bg-slate-100 font-semibold px-10 py-4 text-sm tracking-[0.1em] uppercase rounded-sm shadow-lg transition-all"
          >
            Apply for Full Membership
          </Button>
          <p className="text-xs text-slate-400 mt-4">Cancel anytime • No long-term commitment</p>
        </div>
      </section>
    </>
  );
}