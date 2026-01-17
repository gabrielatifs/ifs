import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from '@/api/entities';
import { customLoginWithRedirect } from '../components/utils/auth';
import { ArrowRight, Users, UserPlus, Award, Check, Mail, GraduationCap, Percent, CheckCircle, CheckCircle2 } from 'lucide-react';
import MainSiteNav from '../components/marketing/MainSiteNav';
import HeroBreadcrumbs from '../components/marketing/HeroBreadcrumbs';
import ServiceCard from '../components/marketing/ServiceCard';
import MembershipTable from '../components/membership/MembershipTable';
import { usePostHog } from '../components/providers/PostHogProvider';

export default function AssociateMembership() {
  const { trackEvent } = usePostHog();

  const handleJoin = (location) => {
    trackEvent('join_button_clicked', {
      intent: 'associate',
      location: location || 'associate_membership_page_hero',
      user_type: 'anonymous'
    });
    const redirectPath = `${createPageUrl('Onboarding')}?intent=associate`;
    customLoginWithRedirect(redirectPath);
  };

  const benefits = [
    {
      title: "UK-Wide Professional Community",
      description: "Join a network of over 5,000 peers in our moderated forums. Share insights, solve challenges, and access a wealth of collective knowledge.",
      imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d66daf168696381e05/15fda2c0c_chris-montgomery-smgTvepind4-unsplash.jpg",
      linkTo: createPageUrl('ForumsAndWorkshops'),
      linkText: "Explore Forums"
    },
    {
      title: "Professional Recognition",
      description: "Demonstrate your commitment with the 'AMIfS' post-nominal title and a professional digital badge for your profile and email signature.",
      imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b647042_pexels-igreja-dimensao-56315701-10401279.jpg",
      linkTo: createPageUrl('MemberBenefits'),
      linkText: "View Benefits"
    },
    {
      title: "Expert CPD Workshops",
      description: "Access exclusive monthly workshops led by industry experts, covering the latest developments in safeguarding practice and policy.",
      imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=400&auto=format&fit=crop",
      linkTo: createPageUrl('Events'),
      linkText: "View Workshops"
    },

    {
      title: "Essential Knowledge & Updates",
      description: "Stay informed with our weekly newsletter and access a curated library of essential safeguarding guidance, templates, and resources.",
      imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d66daf168696381e05/8e4a9aaf0_guzel-maksutova-B30XL_m3fso-unsplash.jpg",
      linkTo: createPageUrl('ResearchAndAdvocacy'),
      linkText: "Read More"
    },
    {
      title: "Find a Professional Supervisor",
      description: "Connect with an approved supervisor through our dedicated matching service, designed to support your professional practice and wellbeing.",
      imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d66daf168696381e05/465bd1fe1_amy-hirschi-JaoVGh5aJ3E-unsplash1.jpg",
      linkTo: createPageUrl('SupervisionServicesMarketing'),
      linkText: "Find a Supervisor"
    },
    {
      title: "Career Opportunities",
      description: "Discover your next career move on our dedicated jobs board, with daily access to view new roles in the safeguarding sector.",
      imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=400&auto=format&fit=crop",
      linkTo: createPageUrl('JobsBoardMarketing'),
      linkText: "View Jobs"
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-slate-900 overflow-hidden" style={{ minHeight: '600px' }}>
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop"
            alt="A diverse group of professionals networking"
            className="w-full h-full object-cover object-center opacity-20"
          />
        </div>

        <MainSiteNav />

        <div className="relative z-10 max-w-screen-xl mx-auto">
          <div className="grid lg:grid-cols-2 items-center min-h-[600px]">
            <div className="px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
              <HeroBreadcrumbs pageName="AssociateMembership" />
              <span className="inline-block text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">
                Community Access
              </span>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6 tracking-tight">
                Associate Membership
              </h1>
              <div className="text-lg lg:text-xl text-slate-300 mb-8 leading-relaxed font-light">
                <p>
                  Join the UK's professional body for safeguarding. Connect with peers, access essential resources, and demonstrate your commitment to professional standards.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => handleJoin('associate_membership_hero')}
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-slate-100 font-semibold px-8 py-4 text-sm tracking-[0.1em] uppercase"
                >
                  Join Free Today
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="bg-white py-24">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-16 items-start">
            <div className="lg:col-span-2">
              <h2 className="text-4xl lg:text-5xl font-bold text-black leading-tight">
                Start your professional safeguarding journey with free membership
              </h2>
              <div className="mt-8">
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  Associate Membership provides free access to essential resources, professional community, and regular development opportunities.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed mb-8">
                  Whether you're new to safeguarding or an experienced practitioner, Associate Membership offers the support and recognition you need at no cost.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => handleJoin('associate_membership_main_content_top')}
                    size="lg"
                    className="bg-black hover:bg-gray-800 text-white font-semibold px-8 py-3 rounded-sm"
                  >
                    Join for Free
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

            {/* Sidebar CTA */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg p-8 border-t-4 border-slate-900 shadow-lg sticky top-10">
                <div className="mb-6">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3 block">
                    Membership Fee
                  </span>
                  <h3 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Free Forever</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Join the UK's professional body for safeguarding at no cost. Full access to community, workshops, and professional recognition.
                  </p>
                </div>

                <div className="w-12 h-px bg-slate-200 my-6"></div>

                <div className="space-y-3">
                  <Button
                    onClick={() => handleJoin('associate_membership_action_box')}
                    size="lg"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm tracking-[0.1em] uppercase py-6 rounded-sm transition-all"
                  >
                    Join Free Today
                  </Button>
                </div>
                <p className="text-xs text-center text-slate-500 mt-4">Register in under 60 seconds.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Benefits Section */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 block">
              What's Included
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
              Everything You Need to Grow Professionally
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Associate Membership gives you immediate access to a powerful set of tools and a vibrant professional community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-lg p-8 border border-slate-200 hover:shadow-md transition-all duration-300 hover:border-slate-300">
                <h3 className="text-xl font-bold text-slate-900 mb-3">{benefit.title}</h3>
                <p className="text-slate-600 leading-relaxed mb-4">{benefit.description}</p>
                <Link to={benefit.linkTo} className="inline-flex items-center text-sm font-semibold text-slate-900 hover:text-slate-700">
                  {benefit.linkText} <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>





      {/* Who's it for? Section */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Who's it for?</h2>
            <p className="text-xl text-gray-600">
              Associate Membership is designed for anyone with safeguarding responsibilities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2 text-lg">New to Safeguarding</h3>
              <p className="text-gray-600">Starting your career in safeguarding and building foundational knowledge</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2 text-lg">Experienced Practitioners</h3>
              <p className="text-gray-600">Professionals seeking continued professional development and peer support</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2 text-lg">Supporting Roles</h3>
              <p className="text-gray-600">Working alongside safeguarding leads in education, health, or social care</p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button
              onClick={() => handleJoin('whos_it_for_cta')}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-10 py-4"
            >
              Join Free Today
            </Button>
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
                    trackEvent('brochure_downloaded', { location: 'associate_brochure_section' });
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

      {/* Membership Tier Comparison */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
              Compare Membership Tiers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Start with Associate and upgrade anytime for enhanced benefits
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
                  onClick={() => handleJoin('comparison_associate')}
                  size="lg"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white"
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
                    <span className="font-semibold text-slate-900">1 CPD Hour included monthly</span>
                  </li>
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
                  onClick={() => handleJoin('comparison_full')}
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 tracking-tight">
            Ready to Join?
          </h2>
          <p className="text-lg text-slate-300 mb-8 font-light">
            Registration takes less than a minute.
          </p>
          <Button
            onClick={() => handleJoin('associate_membership_final_cta')}
            size="lg"
            className="bg-white text-slate-900 hover:bg-slate-100 font-semibold px-10 py-4 text-sm tracking-[0.1em] uppercase rounded-sm"
          >
            Create Your Free Account
          </Button>
        </div>
      </section>
    </>
  );
}