
import React from 'react';
import { Button } from '@ifs/shared/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@ifs/shared/utils';
import { User } from '@ifs/shared/api/entities';
import { Shield, Users, FileText, Scale, ArrowRight } from 'lucide-react';
import MainSiteNav from '../components/marketing/MainSiteNav';
import HeroBreadcrumbs from '../components/marketing/HeroBreadcrumbs';
import { usePostHog } from '@ifs/shared/components/providers/PostHogProvider';

export default function Governance() {
    const { trackEvent } = usePostHog();
    
    const handleJoin = (location) => {
        trackEvent('join_button_clicked', {
          intent: 'associate',
          location: location || 'governance_page_hero',
          user_type: 'anonymous'
        });
        const url = createPageUrl('Onboarding') + '?intent=associate';
        User.loginWithRedirect(url);
    };

    return (
        <>
            {/* Hero Section */}
            <section className="relative bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 hidden lg:block">
                    <img 
                        src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2070&auto=format&fit=crop" 
                        alt="A formal meeting discussing governance and strategy"
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
                            <HeroBreadcrumbs pageName="Governance" />
                            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                                Transparent Leadership & Governance
                            </h1>
                            <div className="text-lg lg:text-xl text-purple-100 mb-8 leading-relaxed space-y-4">
                                <p>
                                    Discover how IfS is governed and led by experienced safeguarding professionals.
                                </p>
                                <p className="hidden lg:block">
                                    Our transparent governance structure ensures accountability, democratic participation, and professional excellence in everything we do.
                                </p>
                            </div>
                            <div className="hidden lg:inline-flex items-center gap-4">
                                <Button
                                    onClick={() => {
                                        const governanceSection = document.getElementById('governance-structure');
                                        if (governanceSection) {
                                            governanceSection.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }}
                                    size="lg"
                                    className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm"
                                >
                                    Learn More
                                </Button>
                                <Button
                                  onClick={() => handleJoin('governance_hero_desktop')}
                                  size="lg"
                                  variant="outline"
                                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-800 font-semibold px-8 py-3 text-base rounded-sm transition-all"
                                >
                                  Become a Member for Free
                                </Button>
                            </div>
                            <div className="mt-8 lg:hidden">
                                <Button
                                    onClick={() => handleJoin('governance_hero_mobile')}
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

            {/* Governance Principles Section */}
            <section id="governance-structure" className="bg-white py-24">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl lg:text-5xl font-bold text-black leading-tight">
                                Our commitment to excellence
                            </h2>
                        </div>
                        <div>
                            <p className="text-lg text-gray-600 leading-relaxed mb-8">
                                Effective governance is at the heart of the IfS. We are dedicated to upholding the highest standards of integrity, accountability, and transparency in all our operations. Our governance structure is designed to ensure we remain a trusted, independent voice for safeguarding professionals.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Key Governance Areas */}
            <section className="bg-slate-50 py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* IfS Board Card */}
                            <Link to={createPageUrl("IfSBoard")} className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col">
                                <div className="aspect-[4/3] overflow-hidden">
                                    <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop" alt="IfS Board" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"/>
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex-grow">
                                        <h3 className="text-lg font-bold text-black mb-3 group-hover:text-purple-800 transition-colors">IfS Board</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">Meet the dedicated individuals responsible for the strategic direction of the IfS.</p>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <span className="inline-flex items-center font-semibold text-purple-700 hover:text-purple-900 transition-colors">
                                            Learn More <ArrowRight className="w-4 h-4 ml-2" />
                                        </span>
                                    </div>
                                </div>
                            </Link>

                            {/* Articles of Association Card */}
                            <Link to={createPageUrl("ArticlesOfAssociation")} className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col">
                                <div className="aspect-[4/3] overflow-hidden">
                                    <img src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=800&auto=format&fit=crop" alt="Articles of Association" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"/>
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex-grow">
                                        <h3 className="text-lg font-bold text-black mb-3 group-hover:text-purple-800 transition-colors">Articles of Association</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">The constitutional documents that govern our organization and operations.</p>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <span className="inline-flex items-center font-semibold text-purple-700 hover:text-purple-900 transition-colors">
                                            View Document <ArrowRight className="w-4 h-4 ml-2" />
                                        </span>
                                    </div>
                                </div>
                            </Link>

                            {/* Trustee Elections Card */}
                            <Link to={createPageUrl("TrusteeElections")} className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col">
                                <div className="aspect-[4/3] overflow-hidden">
                                    <img src="https://images.unsplash.com/photo-1559523161-0fc0d8b38a7a?q=80&w=800&auto=format&fit=crop" alt="Trustee Elections" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"/>
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex-grow">
                                        <h3 className="text-lg font-bold text-black mb-3 group-hover:text-purple-800 transition-colors">Trustee Elections</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">Learn about our democratic election process and how to participate in governance.</p>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <span className="inline-flex items-center font-semibold text-purple-700 hover:text-purple-900 transition-colors">
                                            View Process <ArrowRight className="w-4 h-4 ml-2" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* CTA Section */}
            <section className="bg-gray-900 py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                        Become a part of our trusted community
                    </h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                        Join the IfS and contribute to a community dedicated to the highest standards of safeguarding practice.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button 
                            onClick={() => handleJoin('governance_page_cta')}
                            size="lg" 
                            className="bg-pink-600 hover:bg-pink-700 text-white font-semibold px-8 py-4 text-lg rounded-sm"
                        >
                            Join as a Member
                        </Button>
                        <Button 
                            size="lg" 
                            variant="outline"
                            className="bg-transparent border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-8 py-4 text-lg rounded-sm"
                            asChild
                        >
                            <Link to={createPageUrl("Contact")}>Contact Us</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
}
