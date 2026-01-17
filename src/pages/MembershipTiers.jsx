import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from '@/api/entities';
import { customLoginWithRedirect } from '../components/utils/auth';
import MainSiteNav from '../components/marketing/MainSiteNav';
import HeroBreadcrumbs from '../components/marketing/HeroBreadcrumbs';
import MembershipTable from '../components/membership/MembershipTable';
import { Button } from '@/components/ui/button';
import { usePostHog } from '../components/providers/PostHogProvider';

export default function MembershipTiers() {
    const { trackEvent } = usePostHog();
    
    // The handleJoin function retains its original signature (tier, location)
    // to ensure compatibility with the MembershipTable component which passes different tiers.
    // The hero section's new CTAs specifically target the 'associate' tier.
    const handleJoin = (tier, location) => {
        trackEvent('join_button_clicked', {
          intent: tier,
          location: location || 'membershiptiers_page',
          user_type: 'anonymous'
        });
        // Use full URL with your domain
        const redirectPath = `${createPageUrl('Onboarding')}?intent=${tier}`;
        customLoginWithRedirect(redirectPath);
    };
    
    return (
        <>
            {/* Hero Section */}
            <section className="relative bg-gray-900 overflow-hidden" style={{ minHeight: '600px' }}>
                <div className="absolute inset-0">
                    <img 
                        src="https://images.unsplash.com/photo-1543269664-56d93c1b41a6?q=80&w=2070&auto=format&fit=crop" 
                        alt="Diverse group of professionals collaborating around a table"
                        className="w-full h-full object-cover object-center opacity-40"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-purple-800/80 to-transparent"></div>

                <MainSiteNav />

                <div className="relative z-10 max-w-screen-xl mx-auto">
                    <div className="grid lg:grid-cols-2 items-center min-h-[600px]">
                        <div className="px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center lg:text-left">
                            <HeroBreadcrumbs pageName="MembershipTiers" />
                            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                                Find Your Perfect Membership
                            </h1>
                            <p className="text-lg lg:text-xl text-purple-100 mb-8 leading-relaxed">
                                From essential free resources to comprehensive professional support, we have a membership tier designed for every stage of your safeguarding career.
                            </p>
                            {/* Desktop 'Become a Member for Free' CTA */}
                            <div className="hidden lg:inline-flex">
                                <Button
                                    onClick={() => handleJoin('associate', 'membership_tiers_hero_desktop')}
                                    size="lg"
                                    className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm"
                                >
                                  Become a Member for Free
                                </Button>
                            </div>
                            {/* Mobile 'Become a Member for Free' CTA */}
                            <div className="mt-8 lg:hidden">
                                <Button
                                    onClick={() => handleJoin('associate', 'membership_tiers_hero_mobile')}
                                    size="lg"
                                    className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm w-full sm:w-auto">
                                    Become a Member for Free
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Intro Section - Homepage Style */}
            <section className="bg-white py-24">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-start">
                        {/* Left Column - Headline */}
                        <div>
                            <h2 className="text-4xl lg:text-5xl font-bold text-black leading-tight">
                                Choose the membership that fits your career stage
                            </h2>
                        </div>
                        
                        {/* Right Column - Description & CTAs */}
                        <div>
                            <p className="text-lg text-gray-600 leading-relaxed mb-8">
                                Whether you're starting your safeguarding journey or leading organizational change, our membership tiers provide the right level of support, resources, and professional recognition to help you excel in your vital work.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    asChild
                                    size="lg"
                                    className="bg-black hover:bg-gray-800 text-white font-semibold px-8 py-3 rounded-sm">
                                    <Link to={createPageUrl("JoinUs")}>Apply for Membership</Link>
                                </Button>
                                <Button
                                    asChild
                                    size="lg"
                                    variant="outline"
                                    className="border-2 border-black text-black hover:bg-black hover:text-white font-semibold px-8 py-3 rounded-sm transition-all">
                                    <Link to={createPageUrl("WhyJoinUs")}>Why Join IfS?</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Membership Tiers Section - Modified to remove heading and simplify structure */}
            <div id="membership-tiers" className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <MembershipTable 
                    includeCorporate={false} 
                    onJoinAssociate={() => handleJoin('associate', 'membershiptiers_table')}
                    onJoinFull={() => handleJoin('full', 'membershiptiers_table')}
                />
            </div>

            {/* Final CTA - Purple Gradient */}
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
                        Join our community of professionals and start your journey towards safeguarding excellence.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={() => handleJoin('associate', 'membershiptiers_cta_footer')}
                            size="lg"
                            className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-semibold px-8 py-4 text-lg rounded-sm shadow-lg hover:shadow-xl transition-all"
                        >
                            Become a Member Today
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
}