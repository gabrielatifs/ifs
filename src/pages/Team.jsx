import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from '@/api/entities';
import MainSiteNav from '../components/marketing/MainSiteNav';
import HeroBreadcrumbs from '../components/marketing/HeroBreadcrumbs';
import { Mail, Linkedin, ArrowRight, Loader2 } from 'lucide-react';
import { usePostHog } from '../components/providers/PostHogProvider';
import { TeamMember } from '@/api/entities';
import { LeadershipCard, TrusteeCard } from '../components/marketing/EditableTeamMemberCard';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast"; // This is imported in the outline, but not directly used here. It's likely used within EditableTeamMemberCard or related components.

export default function Team() {
    const { trackEvent } = usePostHog();
    const [leadership, setLeadership] = useState([]);
    const [trustees, setTrustees] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const fetchData = async () => {
        setLoading(true);
        try {
            const members = await TeamMember.list('displayOrder');
            setLeadership(members.filter(m => m.category === 'Leadership'));
            setTrustees(members.filter(m => m.category === 'Trustee'));
        } catch (error) {
            console.error("Failed to fetch team members:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleJoin = (location) => {
        trackEvent('join_button_clicked', {
          intent: 'associate',
          location: location || 'team_page_hero',
          user_type: 'anonymous'
        });
        const url = createPageUrl('Onboarding') + '?intent=associate';
        User.loginWithRedirect(url);
    };

    return (
        <>
            <Helmet>
              <title>Our Team - Independent Federation for Safeguarding</title>
              <meta name="description" content="Meet the dedicated professionals leading IfS forward. Our team combines decades of safeguarding expertise with a passion for supporting professionals across the UK." />
              <link rel="canonical" href="https://ifs-safeguarding.co.uk/Team" />
              <meta property="og:title" content="Meet Our Expert Team - IfS" />
              <meta property="og:description" content="Discover the leadership team and Board of Trustees guiding the Independent Federation for Safeguarding." />
              <meta property="og:url" content="https://ifs-safeguarding.co.uk/Team" />
              <meta property="og:type" content="website" />
            </Helmet>
            <Toaster />
            {/* Hero Section */}
            <section className="relative bg-gray-900 overflow-hidden" style={{ minHeight: '600px' }}>
                <div className="absolute inset-0 hidden lg:block">
                    <img 
                        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop" 
                        alt="A professional team in a modern office environment"
                        className="w-full h-full object-cover object-center"
                        style={{ filter: 'grayscale(100%) contrast(1.1)' }}
                    />
                </div>
                <div 
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to right, #5e028f 45%, rgba(94, 2, 143, 0.2) 65%, transparent 100%)' }}
                ></div>
                <div className="absolute inset-0 bg-purple-800 lg:hidden"></div>
                <MainSiteNav />
                <div className="relative z-10 max-w-screen-xl mx-auto">
                    <div className="grid lg:grid-cols-2 items-center min-h-[600px]">
                        <div className="px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center lg:text-left">
                            <HeroBreadcrumbs pageName="Team" />
                            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                                Meet Our Expert Team
                            </h1>
                            <div className="text-lg lg:text-xl text-purple-100 mb-8 leading-relaxed space-y-4">
                                <p>
                                    Get to know the dedicated professionals leading IfS forward.
                                </p>
                                <p className="hidden lg:block">
                                    Our team combines decades of safeguarding expertise with a passion for supporting professionals across the UK.
                                </p>
                            </div>
                            <div className="hidden lg:inline-flex items-center gap-4">
                                <Button
                                    onClick={() => {
                                        const teamSection = document.getElementById('team-members');
                                        if (teamSection) {
                                            teamSection.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }}
                                    size="lg"
                                    className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm"
                                >
                                    Meet the Team
                                </Button>
                                <Button
                                  onClick={() => handleJoin('team_hero_desktop')}
                                  size="lg"
                                  variant="outline"
                                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-800 font-semibold px-8 py-3 text-base rounded-sm transition-all"
                                >
                                  Become a Member for Free
                                </Button>
                            </div>
                            <div className="mt-8 lg:hidden">
                                <Button
                                    onClick={() => handleJoin('team_hero_mobile')}
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

            {/* Leadership Team Section */}
            <section id="team-members" className="bg-white py-24">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 text-sm font-semibold rounded-full mb-6">
                            EXECUTIVE LEADERSHIP
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
                            Driving Our Mission Forward
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Our leadership team brings strategic vision, operational excellence, and a deep commitment to the safeguarding community.
                        </p>
                    </div>
                    
                    {loading ? (
                        <div className="flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>
                    ) : (
                        <div className="max-w-4xl mx-auto space-y-16">
                            {leadership.map((leader) => (
                                <div key={leader.id} className="relative">
                                    <LeadershipCard member={leader} onUpdate={fetchData} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Board of Trustees Section */}
            <section className="bg-slate-50 py-24">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 text-sm font-semibold rounded-full mb-6">
                            GOVERNANCE
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
                            Our Board of Trustees
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
                            Our distinguished trustees provide strategic oversight and governance, ensuring we maintain the highest standards of integrity and accountability.
                        </p>
                    </div>
                    
                    {loading ? (
                         <div className="flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>
                    ) : (
                        <div className="flex justify-center items-center">
                            <div className="flex gap-x-4 sm:gap-x-6 lg:gap-x-8">
                                {trustees.map((trustee) => (
                                     <TrusteeCard key={trustee.id} member={trustee} onUpdate={fetchData} />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="text-center mt-16">
                        <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-full px-8 py-3">
                            <Link to={`${createPageUrl("IfSBoard")}?from=Team`}>
                                Meet the Full Board <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gray-900 py-24 relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-gray-900 to-black"></div>
                <div className="absolute inset-0 opacity-10" style={{backgroundImage: "url('/public/assets/grid-pattern.svg')", backgroundSize: '50px'}}></div>
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
                    <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                        Join a Community Led by Experts
                    </h2>
                    <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                        Become part of the IfS and benefit from the expertise and guidance of our experienced team and trustees.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Button 
                            onClick={() => handleJoin('team_cta_section')}
                            size="lg" 
                            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
                        >
                            Apply for Membership
                        </Button>
                        <Button 
                            size="lg" 
                            variant="outline"
                            className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-8 py-4 text-lg rounded-full transition-all"
                            asChild
                        >
                            <Link to={createPageUrl("Contact")}>Get in Touch</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
}