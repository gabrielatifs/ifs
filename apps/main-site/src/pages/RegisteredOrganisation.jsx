import React from 'react';
import { Button } from '@ifs/shared/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@ifs/shared/utils';
import { ArrowRight, Building2, Users, CheckCircle2, GraduationCap, Award } from 'lucide-react';
import MainSiteNav from '../components/marketing/MainSiteNav';
import HeroBreadcrumbs from '../components/marketing/HeroBreadcrumbs';
import { usePostHog } from '@ifs/shared/components/providers/PostHogProvider';

export default function RegisteredOrganisation() {
  const { trackEvent } = usePostHog();

  const handleRegister = (location) => {
    trackEvent('register_org_button_clicked', {
      location: location || 'registered_org_page_hero',
      user_type: 'anonymous'
    });
    window.location.href = createPageUrl('OrganisationMembership');
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden" style={{ minHeight: '650px' }}>
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2070&auto=format&fit=crop"
            alt="Professional team in a modern office"
            className="w-full h-full object-cover object-center opacity-15"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-transparent"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

        <MainSiteNav />

        <div className="relative z-10 max-w-screen-xl mx-auto">
          <div className="grid lg:grid-cols-2 items-center min-h-[650px] gap-12">
            <div className="px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
              <HeroBreadcrumbs pageName="RegisteredOrganisation" />
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                <Award className="w-4 h-4 text-blue-300" />
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                  Free • Badge • Team Membership
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
                Registered<br />Organisation
              </h1>
              <div className="text-xl text-slate-200 mb-10 leading-relaxed max-w-xl">
                <p>
                  Join our free directory with a professional badge for your organisation. All team members receive complimentary Associate Membership.
                </p>
              </div>
              
              {/* Key features pills */}
              <div className="flex flex-wrap gap-3 mb-10">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
                  <CheckCircle2 className="w-4 h-4 text-green-300" />
                  <span className="text-sm text-white">Professional Badge</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
                  <CheckCircle2 className="w-4 h-4 text-green-300" />
                  <span className="text-sm text-white">Team Membership</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
                  <CheckCircle2 className="w-4 h-4 text-green-300" />
                  <span className="text-sm text-white">Free Forever</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Button
                  onClick={() => handleRegister('registered_org_hero')}
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-slate-100 font-semibold px-10 py-4 text-base rounded-sm shadow-xl hover:shadow-2xl transition-all"
                >
                  Register Your Organisation
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="bg-gradient-to-b from-white via-slate-50/30 to-white py-32">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-20 items-start">
            <div className="lg:col-span-3">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-6">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-900">
                  For Organisations
                </span>
              </div>
              <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-black leading-[1.1] mb-8">
                Build your organisation's safeguarding profile at no cost
              </h2>
              <div className="space-y-6 mb-12">
                <p className="text-xl text-gray-700 leading-relaxed">
                  Registered Organisation status provides a free professional badge for your organisation and complimentary Associate Membership for all your team members.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Perfect for organisations looking to support their safeguarding professionals with professional recognition and access to our community and resources.
                </p>
              </div>

              {/* Benefits list */}
              <div className="space-y-4 mb-12">
                <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Professional Badge</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">Display your commitment to safeguarding excellence with an official IfS badge</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Free Team Membership</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">All staff get Associate Membership with access to forums and resources</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Directory Listing</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">Appear in our searchable directory of safeguarding organisations</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => handleRegister('registered_org_main_content_top')}
                  size="lg"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-10 py-4 text-base rounded-sm shadow-lg hover:shadow-xl transition-all"
                >
                  Register Free Today
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-2 border-slate-300 text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 font-semibold px-10 py-4 text-base rounded-sm transition-all"
                >
                  <Link to={createPageUrl("Contact")}>Have Questions?</Link>
                </Button>
              </div>
            </div>

            {/* Sidebar CTA */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 shadow-2xl sticky top-10 border border-slate-700">
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5 mb-4">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-300" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-green-200">
                      Free Forever
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-sm mt-4">
                    Register your organisation and unlock Associate Membership for your entire team today.
                  </p>
                </div>

                <div className="h-px bg-white/10 my-8"></div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircle2 className="w-5 h-5 text-green-300 flex-shrink-0" />
                    <span className="text-sm">Professional organisation badge</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircle2 className="w-5 h-5 text-green-300 flex-shrink-0" />
                    <span className="text-sm">Associate Membership for all staff</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircle2 className="w-5 h-5 text-green-300 flex-shrink-0" />
                    <span className="text-sm">Public directory listing</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircle2 className="w-5 h-5 text-green-300 flex-shrink-0" />
                    <span className="text-sm">No hidden fees or commitments</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleRegister('registered_org_action_box')}
                  size="lg"
                  className="w-full bg-white hover:bg-slate-100 text-slate-900 font-semibold text-base py-6 rounded-sm shadow-xl hover:shadow-2xl transition-all"
                >
                  Register Your Organisation
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-xs text-center text-slate-400 mt-4">
                  ✓ Complete registration in under 2 minutes
                </p>
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
                  Explore all membership options for individuals and organisations. Everything you need to know in one comprehensive resource.
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
                    trackEvent('brochure_downloaded', { location: 'registered_org_brochure_section' });
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

      {/* What's Included Section */}
      <section className="relative bg-slate-50 py-32 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-40"></div>
        
        <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2 mb-6 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                What's Included
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-black mb-6 leading-tight">
              Professional Badge &<br />Team Membership
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Everything you need to support your safeguarding team and demonstrate your commitment to professional excellence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="group bg-white rounded-2xl p-10 border border-slate-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-2xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Award className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Professional Badge</h3>
                <p className="text-slate-600 leading-relaxed text-base">
                  Receive a digital badge to display on your website and communications, demonstrating your commitment to safeguarding excellence.
                </p>
              </div>
            </div>

            <div className="group bg-white rounded-2xl p-10 border border-slate-200 hover:border-purple-300 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full blur-2xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Team Associate Membership</h3>
                <p className="text-slate-600 leading-relaxed text-base">
                  All your team members receive complimentary Associate Membership with access to forums, workshops, and professional resources.
                </p>
              </div>
            </div>

            <div className="group bg-white rounded-2xl p-10 border border-slate-200 hover:border-green-300 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full blur-2xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Building2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Directory Profile</h3>
                <p className="text-slate-600 leading-relaxed text-base">
                  Appear in our searchable directory of safeguarding organisations, increasing your visibility within the sector.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
            alt="Team collaboration"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
              <CheckCircle2 className="w-4 h-4 text-green-300" />
              <span className="text-xs font-semibold uppercase tracking-wider text-green-200">
                Free Registration
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
              Ready to Register?
            </h2>
            <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Join our directory of safeguarding organisations in under 2 minutes. Get your professional badge and unlock Associate Membership for your entire team.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={() => handleRegister('registered_org_final_cta')}
                size="lg"
                className="bg-white text-slate-900 hover:bg-slate-100 font-semibold px-12 py-6 text-base rounded-sm shadow-2xl hover:shadow-3xl transition-all"
              >
                Register Your Organisation Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-white/30 text-white hover:bg-white hover:text-slate-900 font-semibold px-12 py-6 text-base rounded-sm backdrop-blur-sm transition-all"
              >
                <Link to={createPageUrl("Contact")}>Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}