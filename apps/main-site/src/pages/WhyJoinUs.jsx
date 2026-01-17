import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@ifs/shared/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@ifs/shared/utils';
import { Users, BookOpen, Briefcase, Shield, Award, Heart, Network, TrendingUp, Globe, CheckCircle2, ArrowRight, Star, Quote, MessageSquare, Megaphone, ClipboardList, Calendar, FileText, Play, Loader2 } from 'lucide-react';
import { User } from '@ifs/shared/api/entities';
import { MarketingContent } from '@ifs/shared/api/entities';
import MainSiteNav from '../components/marketing/MainSiteNav';
import ServiceCard from '../components/marketing/ServiceCard';
import MembershipTable from '@ifs/shared/components/membership/MembershipTable';
import { useBreadcrumbs } from '@ifs/shared/components/providers/BreadcrumbProvider'; // Updated import path
import HeroBreadcrumbs from '../components/marketing/HeroBreadcrumbs'; // Added import for HeroBreadcrumbs
import { usePostHog } from '@ifs/shared/components/providers/PostHogProvider';
import { customLoginWithRedirect } from '../components/utils/auth';

export default function WhyJoinUs() {
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
          location: location || 'whyjoinus_page_hero',
          user_type: 'anonymous'
        });
        const redirectPath = createPageUrl('Onboarding') + '?intent=associate';
        customLoginWithRedirect(redirectPath);
    };

    const handleLearnMore = () => {
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    };

  return (
    <>
            <Helmet>
              <title>Why Join Us - Independent Federation for Safeguarding</title>
              <meta name="description" content="Connect with a growing network of professionals committed to protecting children and vulnerable adults. Access exclusive resources, expert guidance, and a supportive community that understands your work." />
              <link rel="canonical" href="https://ifs-safeguarding.co.uk/WhyJoinUs" />
              <meta property="og:title" content="Why Join IfS - Your Professional Body for Safeguarding" />
              <meta property="og:description" content="Professional development, valuable connections, and comprehensive support for safeguarding practitioners at every career stage." />
              <meta property="og:url" content="https://ifs-safeguarding.co.uk/WhyJoinUs" />
              <meta property="og:type" content="website" />
            </Helmet>
            {/* Hero Section */}
            <section className="relative bg-gray-900 overflow-hidden" style={{ minHeight: '600px' }}>
                
                <div className="absolute inset-0 hidden lg:block">
                    <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
            alt="Professional educators collaborating in a meeting"
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
                            <HeroBreadcrumbs pageName="WhyJoinUs" /> {/* Replaced manual breadcrumbs with component */}
                            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">Welcome to your professional body

              </h1>
                            <div className="text-lg lg:text-xl text-purple-100 mb-8 leading-relaxed space-y-4">
                                <p className="">Connect with a growing network of professionals who share your commitment to protecting children and vulnerable adults.

                </p>
                                <p>
                                    Access exclusive resources, expert guidance, and a supportive community that understands the unique challenges you face in your vital work.
                                </p>
                            </div>
                           <div className="hidden lg:inline-flex items-center gap-4">
                                <Button
                                    onClick={handleLearnMore}
                                    size="lg"
                                    className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm">

                                    Find out more
                                </Button>
                                <Button
                                  onClick={() => handleJoin('whyjoinus_hero_desktop')}
                                  size="lg"
                                  variant="outline"
                                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-800 font-semibold px-8 py-3 text-base rounded-sm transition-all"
                                >
                                  Become a Member for Free
                                </Button>
                            </div>
                            <div className="mt-8 lg:hidden">
                                <Button
                                    onClick={() => handleJoin('whyjoinus_hero_mobile')}
                                    size="lg"
                                    className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm w-full sm:w-auto">
                                    Become a Member for Free
                                </Button>
                            </div>
                        </div>
                        <div className="hidden lg:block"></div>
                    </div>
                </div>
            </section>

            {/* Why Join Description Section */}
            <section className="bg-white py-24">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-start">
                        <div>
                            <h2 className="text-4xl lg:text-5xl font-bold text-black leading-tight">Why safeguarding professionals choose IfS

              </h2>
                        </div>
                        <div>
                            <p className="text-lg text-gray-600 leading-relaxed mb-8">
                                At a time when great safeguarding leaders have never been more important, the IfS offers unparalleled professional development, valuable connections, and influence. We understand the unique challenges you face and provide the support, resources, and community you need to excel in your vital work.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 mt-8">
                                <Button
                  onClick={() => handleJoin('whyjoinus_description_cta_1')} // Updated to call with location
                  size="lg"
                  className="bg-black hover:bg-gray-800 text-white font-semibold px-8 py-3 rounded-sm">

                                    Apply for Membership
                                </Button>
                                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-2 border-black text-black hover:bg-black hover:text-white font-semibold px-8 py-3 rounded-sm transition-all">

                                    <Link to={createPageUrl("JoinUs")}>View Membership Options</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Key Benefits Section - Synced with Homepage */}
            <section className="bg-slate-50 py-20">
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
                                        to={createPageUrl("Membership")}
                                        className="inline-flex items-center bg-white text-purple-600 hover:bg-gray-100 font-semibold px-6 py-3 rounded-sm transition-colors group-hover:scale-105 transform duration-300">
                                        View Membership
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Membership Tiers Section */}
            <section className="bg-white py-20"> {/* Changed background from bg-slate-50 to bg-white */}
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
            onJoinFull={() => handleJoin('membership_table_full')}
          />

                </div>
            </section>

            {/* Call to Action */}
            <section className="bg-gray-900 py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                        Ready to advance your safeguarding practice?
                    </h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                        Join thousands of professionals who trust IfS to support their safeguarding journey. Start your membership application today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
              onClick={() => handleJoin('whyjoinus_cta_bottom')}
              size="lg"
              className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-semibold px-8 py-4 text-lg rounded-sm shadow-lg hover:shadow-xl transition-all">

                            Apply for Membership
                        </Button>
                        <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-8 py-4 text-lg rounded-sm transition-all"
              asChild>

                            <Link to={createPageUrl("JoinUs")}>View Membership Options</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </>
  );
}