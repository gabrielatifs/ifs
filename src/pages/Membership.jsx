import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from '@/api/entities';
import { MarketingContent } from '@/api/entities';
import { ArrowRight, Loader2, Check, Users, Trophy, Award } from 'lucide-react';
import MainSiteNav from '../components/marketing/MainSiteNav';
import HeroBreadcrumbs from '../components/marketing/HeroBreadcrumbs';
import MembershipTable from '../components/membership/MembershipTable';
import ServiceCard from '../components/marketing/ServiceCard';
import { usePostHog } from '../components/providers/PostHogProvider';
import { customLoginWithRedirect } from '../components/utils/auth';

export default function Membership() {
  const location = useLocation();
  const [cardContents, setCardContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { trackEvent } = usePostHog();

  const fetchContent = async () => {
      setLoading(true);
      try {
          const contents = await MarketingContent.filter({ page: 'Shared' });
          setCardContents(contents);
      } catch (error) {
          console.error("Failed to fetch marketing content:", error);
      } finally {
          setLoading(false);
      }
  };
  
  useEffect(() => {
      fetchContent();
  }, []);

  const handleJoin = (location) => {
    trackEvent('join_button_clicked', {
      intent: 'associate',
      location: location || 'membership_page_hero',
      user_type: 'anonymous'
    });
    const redirectPath = createPageUrl('Onboarding') + '?intent=associate';
    customLoginWithRedirect(redirectPath);
  };

  const handleLearnMore = () => {
    const section = document.getElementById('membership-tiers'); // Corrected ID based on the existing section
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gray-900 overflow-hidden" style={{ minHeight: '600px' }}>
        <div className="absolute inset-0 hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop"
            alt="Teachers networking at a professional development event"
            className="w-full h-full object-cover object-center"
            style={{ filter: 'grayscale(100%) contrast(1.1)' }} />

        </div>
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, #5e028f 45%, rgba(94, 2, 143, 0.2) 65%, transparent 100%)' }}>
        </div>
        <div className="absolute inset-0 bg-purple-800 lg:hidden"></div>
        <div className="absolute inset-0 hidden lg:block">
          <div className="absolute top-16 right-24 w-64 h-64 bg-pink-600/30 rounded-full blur-3xl"></div>
          <div className="absolute top-32 right-8 w-32 h-32 bg-pink-500/40 rounded-full blur-xl"></div>
          <div className="absolute bottom-24 right-32 w-48 h-48 bg-purple-700/25 rounded-full blur-2xl"></div>
          <div className="absolute bottom-8 right-16 w-24 h-24 bg-purple-500/50 rounded-full blur-lg"></div>
          <div className="absolute top-1/2 right-4 w-20 h-20 bg-pink-600/60 rounded-full blur-md"></div>
        </div>

        <MainSiteNav />

        <div className="relative z-10 max-w-screen-xl mx-auto">
          <div className="grid lg:grid-cols-2 items-center min-h-[600px]">
            <div className="px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center lg:text-left">
              <HeroBreadcrumbs pageName="Membership" />
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                Join the UK's Professional Body for Safeguarding
              </h1>
              <div className="text-lg lg:text-xl text-purple-100 mb-8 leading-relaxed space-y-4">
                <p className="">Join a vibrant community of safeguarding professionals. We offer membership tiers for individuals and organisations committed to excellence.</p>
              </div>
              <div className="hidden lg:inline-flex items-center gap-4">
                <Button
                  onClick={() => handleJoin('membership_hero_desktop')}
                  size="lg"
                  className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm"
                >
                  Become a Member for Free
                </Button>
                <Button
                  onClick={() => {
                    trackEvent('brochure_downloaded', { location: 'membership_hero_desktop' });
                    const link = document.createElement('a');
                    link.href = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/6c32e4577_IFSMembership-Dec25_compressed.pdf';
                    link.download = 'IFS-Membership-Brochure.pdf';
                    link.target = '_blank';
                    link.click();
                  }}
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-800 font-semibold px-8 py-3 text-base rounded-sm transition-all"
                >
                  Download Brochure
                </Button>
              </div>
              <div className="mt-8 lg:hidden flex flex-col gap-3">
                <Button
                    onClick={() => handleJoin('membership_hero_mobile')}
                    size="lg"
                    className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm w-full">
                    Become a Member for Free
                </Button>
                <Button
                  onClick={() => {
                    trackEvent('brochure_downloaded', { location: 'membership_hero_mobile' });
                    const link = document.createElement('a');
                    link.href = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/6c32e4577_IFSMembership-Dec25_compressed.pdf';
                    link.download = 'IFS-Membership-Brochure.pdf';
                    link.target = '_blank';
                    link.click();
                  }}
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-800 font-semibold px-8 py-3 text-base rounded-sm transition-all w-full"
                >
                  Download Brochure
                </Button>
              </div>
            </div>
            <div className="hidden lg:block"></div>
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="bg-white py-24">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left Column - Headline */}
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-black leading-tight">
                Your professional home for safeguarding excellence
              </h2>
            </div>

            {/* Right Column - Description & CTAs */}
            <div>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                IfS membership provides you with the essential tools, expert knowledge, and supportive community needed to excel in your safeguarding role. We are committed to fostering professional growth and elevating standards across the sector, ensuring you have the resources to make a real difference.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-black hover:bg-gray-800 text-white font-semibold px-8 py-3 rounded-sm">

                  <Link to={createPageUrl("MembershipTiers")}>View Membership Tiers</Link>
                </Button>
                <Button
                  onClick={() => handleJoin('membership_description_section')}
                  size="lg"
                  variant="outline"
                  className="border-2 border-black text-black hover:bg-black hover:text-white font-semibold px-8 py-3 rounded-sm transition-all">

                  Become a Member
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Primary Links Section */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Why Join Us Card */}
            <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col">
                <div className="aspect-[4/3] overflow-hidden">
                    <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/aecbc7bb7_hebei-university-of-science-and-technology-1306651_1280.jpg" alt="Why Join Us" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                    <div className="flex-grow">
                        <h3 className="text-lg font-bold text-black mb-3">Why join us?</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">Discover the value of being part of a dedicated professional network.</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <Link to={createPageUrl("WhyJoinUs")} className="inline-flex items-center font-semibold text-purple-700 hover:text-purple-900 transition-colors">
                            Learn More <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Member Benefits Card */}
            <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col">
                <div className="aspect-[4/3] overflow-hidden">
                    <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/5f79d6f4e_pexels-naomi-bokhout-202762-627901.jpg" alt="Member Benefits" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                    <div className="flex-grow">
                        <h3 className="text-lg font-bold text-black mb-3">Member benefits</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">Explore the full range of resources, training, and support available.</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <Link to={createPageUrl("MemberBenefits")} className="inline-flex items-center font-semibold text-purple-700 hover:text-purple-900 transition-colors">
                            Explore Benefits <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Membership Tiers Card */}
            <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col">
                <div className="aspect-[4/3] overflow-hidden">
                    <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/4929aa546_christina-wocintechchat-com-4PU-OC8sW98-unsplash.jpg" alt="Membership Tiers" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                    <div className="flex-grow">
                        <h3 className="text-lg font-bold text-black mb-3">Membership tiers</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">Compare our membership options to find the perfect fit for you.</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <Link to={createPageUrl("MembershipTiers")} className="inline-flex items-center font-semibold text-purple-700 hover:text-purple-900 transition-colors">
                            Compare Tiers <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Member Portal Card */}
            <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col">
                <div className="aspect-[4/3] overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=400&auto=format&fit=crop" alt="Member Portal" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                    <div className="flex-grow">
                        <h3 className="text-lg font-bold text-black mb-3">Member portal</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">Access your account, benefits, and manage your membership.</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <Link to={createPageUrl("Dashboard")} className="inline-flex items-center font-semibold text-purple-700 hover:text-purple-900 transition-colors">
                            Access Portal <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Member Benefits Section */}
      <section id="membership-details" className="bg-slate-50 py-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
              Comprehensive support for your professional journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From peer support and training to career development and advocacy, we provide the resources you need at every stage.
            </p>
          </div>
          {loading ? (
              <div className="flex justify-center items-center h-48">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
              </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cardContents.map(content => (
                    <ServiceCard 
                        key={content.id}
                        content={content}
                        onUpdate={fetchContent}
                    />
                ))}
                <div className="group bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex items-center justify-center text-center p-8">
                <div className="text-white">
                    <h3 className="text-xl font-bold mb-4">Ready to explore all benefits?</h3>
                    <Link
                        to={createPageUrl("MemberBenefits")}
                        className="inline-flex items-center bg-white text-purple-600 hover:bg-gray-100 font-semibold px-6 py-3 rounded-sm transition-colors group-hover:scale-105 transform duration-300">

                    Explore Benefits
                    <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                </div>
                </div>
            </div>
          )}
        </div>
      </section>

      {/* Professional Brochure Showcase Section */}
      <section className="relative bg-white py-32 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-purple-50"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-100 rounded-full blur-3xl opacity-40"></div>
        
        <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Brochure Preview */}
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

            {/* Right: Content */}
            <div className="space-y-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600 mb-4 block">
                  Comprehensive Guide
                </span>
                <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-6 tracking-tight">
                  Everything you need to know about IfS Membership
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Our detailed membership brochure provides a complete overview of all tiers, benefits, and the fellowship programme. A professional resource for understanding your pathway in safeguarding excellence.
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
                      <Trophy className="w-5 h-5 text-slate-700" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm mb-1">Fellowship Programme</h4>
                      <p className="text-xs text-slate-600">Two routes to the highest professional recognition</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 border border-slate-200">
                      <Award className="w-5 h-5 text-slate-700" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm mb-1">Professional Development</h4>
                      <p className="text-xs text-slate-600">CPD hours, training, supervision, and career support</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={() => {
                    trackEvent('brochure_downloaded', { location: 'membership_showcase_section' });
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

      {/* Membership Tiers Section */}
      <section id="membership-tiers" className="bg-white py-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
              A professional home for every stage of your career
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From aspiring professionals to established leaders, IfS provides a tailored membership journey to support your growth and impact.
            </p>
          </div>
          
          <MembershipTable
            includeCorporate={false}
            onJoinAssociate={() => handleJoin('membership_table_associate')}
            onJoinFull={() => handleJoin('membership_table_full')} />

        </div>
      </section>

      {/* Final CTA */}
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
            <Button onClick={() => handleJoin('membership_cta_footer')} size="lg" className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-semibold px-8 py-4 text-lg rounded-sm shadow-lg hover:shadow-xl transition-all">
              Become a Member Today
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-8 py-4 text-lg rounded-sm transition-all" asChild>
              <Link to={createPageUrl("WhyJoinUs")}>Why Join Us?</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}