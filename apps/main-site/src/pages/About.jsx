import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@ifs/shared/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@ifs/shared/utils';
import { Users2, BookOpenCheck, Briefcase } from 'lucide-react';
import { User } from '@ifs/shared/api/entities';
import MainSiteNav from '../components/marketing/MainSiteNav';
import { useBreadcrumbs } from '@ifs/shared/components/providers/BreadcrumbProvider';
import HeroBreadcrumbs from '../components/marketing/HeroBreadcrumbs';
import { usePostHog } from '@ifs/shared/components/providers/PostHogProvider';
import { customLoginWithRedirect } from '../components/utils/auth';

export default function About() {
  const { getBreadcrumbs } = useBreadcrumbs();
  const location = useLocation();
  const { trackEvent } = usePostHog();

  // The useEffect for adding dynamic breadcrumbs is removed as per the change outline.
  // Breadcrumbs are now handled statically via the HeroBreadcrumbs component and its 'pageName' prop.

  const handleJoin = (location) => {
    trackEvent('join_button_clicked', {
      intent: 'associate',
      location: location || 'about_page_hero', // Use the passed location, or default
      user_type: 'anonymous'
    });
    // Use the new custom login function
    const redirectPath = createPageUrl('Onboarding') + '?intent=associate';
    customLoginWithRedirect(redirectPath);
  };

  const handleLearnMore = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <>
            <Helmet>
              <title>About Us - Independent Federation for Safeguarding</title>
              <meta name="description" content="The Independent Federation for Safeguarding (IfS) was founded by professionals, for professionals. We provide an independent platform where safeguarding leaders can connect, share knowledge, and access support." />
              <link rel="canonical" href="https://ifs-safeguarding.co.uk/About" />
              <meta property="og:title" content="About Us - Independent Federation for Safeguarding" />
              <meta property="og:description" content="Supporting safeguarding excellence across the UK through community, evidence-based practice, and professional innovation." />
              <meta property="og:url" content="https://ifs-safeguarding.co.uk/About" />
              <meta property="og:type" content="website" />
            </Helmet>
            {/* Hero Section - Full IoD Style */}
            <section className="relative bg-gray-900 overflow-hidden" style={{ minHeight: '600px' }}>
                
                {/* Full-width Background Image */}
                <div className="absolute inset-0 hidden lg:block">
                    <img
            src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop"
            alt="A group of professionals in a discussion circle during a workshop"
            className="w-full h-full object-cover object-center"
            style={{ filter: 'grayscale(100%) contrast(1.1)' }} />

                </div>

                {/* Gradient overlay for split effect */}
                <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, #5e028f 45%, rgba(94, 2, 143, 0.2) 65%, transparent 100%)' }}>
        </div>

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
                            <HeroBreadcrumbs pageName="About" /> {/* Replaced static breadcrumbs with HeroBreadcrumbs and added pageName prop */}
                            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                                Supporting safeguarding excellence across the UK
                            </h1>
                            <div className="text-lg lg:text-xl text-purple-100 mb-8 leading-relaxed space-y-4">
                                <p>
                                    The Independent Federation for Safeguarding was founded by professionals, for professionals.
                                </p>
                                <p className="hidden lg:block"> {/* This paragraph is hidden on mobile */}
                                    We provide an independent platform where safeguarding leaders can connect, share knowledge, and access the support they need to protect vulnerable individuals effectively.
                                </p>
                            </div>
                            {/* Desktop Button */}
                            <div className="hidden lg:inline-flex items-center gap-4">
                                <Button
                                    onClick={handleLearnMore}
                                    size="lg"
                                    className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm">
                                    Find out more
                                </Button>
                                <Button
                                  onClick={() => handleJoin('about_hero_desktop')}
                                  size="lg"
                                  variant="outline"
                                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-800 font-semibold px-8 py-3 text-base rounded-sm transition-all"
                                >
                                  Become a Member for Free
                                </Button>
                            </div>
                            {/* Mobile Button */}
                            <div className="mt-8 lg:hidden">
                                <Button
                                    onClick={() => handleJoin('about_hero_mobile')}
                                    size="lg"
                                    className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm w-full sm:w-auto">
                                    Become a Member for Free
                                </Button>
                            </div>
                        </div>
                        
                        {/* Right column is empty, space is filled by the background image */}
                        <div className="hidden lg:block"></div>
                    </div>
                </div>
            </section>

            {/* <Breadcrumbs /> - Removed as per outline, now using HeroBreadcrumbs */}

            {/* Feature Highlights - IoD Style */}
            <section className="bg-white py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-gray-50 p-8 rounded-lg">
                            <h3 className="text-xl font-bold text-black mb-4">Our Vision</h3>
                            <p className="text-gray-600 mb-6">A world where every safeguarding professional has access to the support, knowledge, and community they need to excel in their vital work.</p>
                            <Link to={createPageUrl("WhyJoinUs")} className="text-purple-800 font-medium hover:text-purple-900">
                                Join our mission →
                            </Link>
                        </div>
                        <div className="bg-gray-50 p-8 rounded-lg">
                            <h3 className="text-xl font-bold text-black mb-4">Professional Standards</h3>
                            <p className="text-gray-600 mb-6">We maintain the highest standards of professionalism, ensuring our community remains a trusted space for safeguarding leaders.</p>
                            <Link to={createPageUrl("MemberBenefits")} className="text-purple-800 font-medium hover:text-purple-900">
                                Learn about membership →
                            </Link>
                        </div>
                        <div className="bg-gray-50 p-8 rounded-lg">
                            <h3 className="text-xl font-bold text-black mb-4">Independent Platform</h3>
                            <p className="text-gray-600 mb-6">As an independent organization, we provide a neutral space free from commercial interests or organizational politics.</p>
                            <Link to={createPageUrl("Contact")} className="text-purple-800 font-medium hover:text-purple-900">
                                Contact us →
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Mission Section - IoD Style */}
            <section className="bg-white py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl lg:text-4xl font-bold text-black mb-6">
                                Founded on the principles of collaboration and excellence
                            </h2>
                            <div className="text-lg text-gray-600 space-y-4">
                                <p className="">IfS was established in response to the growing need for an independent, professional community dedicated to safeguarding practitioners.

                </p>
                                <p className="">Safeguarding professionals often work in isolation, facing complex challenges without adequate peer support or resources. We exist to change that.

                </p>
                            </div>
                        </div>
                        
                        {/* Three Pillars */}
                        <div className="space-y-8">
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Users2 className="w-6 h-6 text-purple-800" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-black mb-2">Community Focus</h3>
                                    <p className="text-gray-600">Building meaningful connections between safeguarding professionals to share knowledge, support, and best practices.</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <BookOpenCheck className="w-6 h-6 text-purple-800" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-black mb-2">Evidence-Based Practice</h3>
                                    <p className="text-gray-600">Promoting the highest standards through research, statutory guidance compliance, and continuous professional development.</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Briefcase className="w-6 h-6 text-purple-800" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-black mb-2">Professional Innovation</h3>
                                    <p className="text-gray-600">Leveraging technology and innovation to create tools and resources that enhance safeguarding practice and outcomes.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Link Section */}
            <section className="bg-slate-50 py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-lg p-8 lg:p-12 text-center">
                        <h2 className="text-3xl lg:text-4xl font-bold text-black mb-6">
                            Meet Our Team
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                            Our dedicated team combines decades of safeguarding expertise with a passion for supporting professionals across the UK. Get to know the leadership, staff, and trustees guiding our mission.
                        </p>
                        <Button asChild size="lg" className="bg-purple-800 hover:bg-purple-900 text-white font-semibold px-8 py-3 rounded-sm">
                            <Link to={createPageUrl("Team")}>View Our Team</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Membership CTA - IoD Style */}
            <section className="bg-gray-900 py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                        Join a community that understands your work
                    </h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                        Become part of the UK's leading professional community for safeguarding leaders and access the support, knowledge, and connections you need.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
              onClick={() => handleJoin('about_page_membership_cta')}
              size="lg"
              className="bg-pink-600 hover:bg-pink-700 text-white font-semibold px-8 py-4 text-lg rounded-sm">

                            Apply for Membership
                        </Button>
                        <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-8 py-4 text-lg rounded-sm"
              asChild>

                            <Link to={createPageUrl("Contact")}>Learn More</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </>);

}