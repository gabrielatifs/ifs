
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from '@/api/entities';
// Combined icons:
// From original: ArrowRight, CheckCircle2, Megaphone, FileText, Users, ChevronUp, ChevronRight
// From outline: Search, TrendingUp (replacing BarChart3)
import { ArrowRight, CheckCircle2, Search, Megaphone, FileText, TrendingUp, Users, ChevronUp, ChevronRight } from 'lucide-react';
import MainSiteNav from '../components/marketing/MainSiteNav';
import HeroBreadcrumbs from '../components/marketing/HeroBreadcrumbs';
import { usePostHog } from '../components/providers/PostHogProvider';

export default function ResearchAndAdvocacy() {
    const { trackEvent } = usePostHog();

    const [expandedSections, setExpandedSections] = React.useState({
        cpdTraining: false,
        webinars: false,
        supervision: false,
        support: false,
        research: false // Added new section state
    });

    const toggleSection = (sectionKey) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionKey]: !prev[sectionKey]
        }));
    };

    const handleJoin = (location) => {
        trackEvent('join_button_clicked', {
          intent: 'associate',
          location: location || 'research_advocacy_page_hero',
          user_type: 'anonymous'
        });
        const url = createPageUrl('Onboarding') + '?intent=associate';
        User.loginWithRedirect(url);
    };

    return (
        <>
            {/* Hero Section */}
            <section className="relative bg-gray-900 overflow-hidden" style={{ minHeight: '600px' }}>
                <div className="absolute inset-0 hidden lg:block">
                    <img 
                        src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop" 
                        alt="A modern library interior focused on research"
                        className="w-full h-full object-cover object-center"
                        style={{ filter: 'grayscale(100%) contrast(1.1)' }}
                    />
                </div>
                <div 
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to right, #5e028f 45%, rgba(94, 2, 143, 0.2) 65%, transparent 100%)' }}
                ></div>
                <div className="absolute inset-0 bg-purple-800 lg:hidden"></div>
                
                <div className="absolute inset-0 hidden lg:block">
                    <div className="absolute top-16 right-24 w-64 h-64 bg-pink-600/30 rounded-full blur-3xl"></div>
                    <div className="absolute top-32 right-8 w-32 h-32 bg-pink-500/40 rounded-full blur-xl"></div>
                </div>

                <MainSiteNav />

                <div className="relative z-10 max-w-screen-xl mx-auto">
                    <div className="grid lg:grid-cols-2 items-center min-h-[600px]">
                        <div className="px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center lg:text-left">
                            <HeroBreadcrumbs pageName="ResearchAndAdvocacy" />
                            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                                Research & Policy Advocacy
                            </h1>
                            <div className="text-lg lg:text-xl text-purple-100 mb-8 leading-relaxed space-y-4">
                                <p>
                                    Driving evidence-based improvements in safeguarding practice and policy.
                                </p>
                                <p className="hidden lg:block">
                                    Our research initiatives and advocacy work shape the future of safeguarding, ensuring professional voices are heard in policy development.
                                </p>
                            </div>
                            <div className="hidden lg:inline-flex items-center gap-4">
                                <Button
                                    onClick={() => {
                                        const researchSection = document.getElementById('research-areas');
                                        if (researchSection) {
                                            researchSection.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }}
                                    size="lg"
                                    className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm"
                                >
                                    Explore Research
                                </Button>
                                <Button
                                  onClick={() => handleJoin('research_advocacy_hero_desktop')}
                                  size="lg"
                                  variant="outline"
                                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-800 font-semibold px-8 py-3 text-base rounded-sm transition-all"
                                >
                                  Become a Member for Free
                                </Button>
                            </div>
                            <div className="mt-8 lg:hidden">
                                <Button
                                    onClick={() => handleJoin('research_advocacy_hero_mobile')}
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

            {/* Our Mission Section */}
            <section className="bg-white py-24">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-start">
                        {/* Left Column - Headline */}
                        <div>
                            <h2 className="text-4xl lg:text-5xl font-bold text-black leading-tight">
                                Driving Change, Together
                            </h2>
                        </div>
                        
                        {/* Right Column - Description & CTAs */}
                        <div>
                            <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                The IfS is committed to advancing the safeguarding profession through rigorous research and influential advocacy. We collaborate with members, policymakers, and partner organisations to identify emerging challenges, develop evidence-based solutions, and champion the policies that protect vulnerable individuals.
                            </p>
                            <p className="text-lg text-gray-600 leading-relaxed mb-8">
                                Our members feed sentiment directly into policy consultations and get opportunities to join innovative, fully-funded programmes aimed at supporting both individuals and institutions.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button 
                                    asChild
                                    size="lg" 
                                    className="bg-black hover:bg-gray-800 text-white font-semibold px-8 py-3 rounded-sm"
                                >
                                    <Link to={createPageUrl("Membership")}>Join Our Research</Link>
                                </Button>
                                <Button 
                                    onClick={() => handleJoin('research_advocacy_mission_section')}
                                    size="lg" 
                                    variant="outline"
                                    className="border-2 border-black text-black hover:bg-black hover:text-white font-semibold px-8 py-3 rounded-sm transition-all"
                                >
                                    Get Involved Today
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Focus Areas Section */}
            <section id="research-areas" className="bg-slate-50 py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
                            Our Strategic Focus
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            We concentrate our efforts on three key pillars to maximise our impact on the safeguarding landscape.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col">
                            <div className="aspect-[4/3] overflow-hidden">
                                <img 
                                    src="https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?q=80&w=400&auto=format&fit=crop" 
                                    alt="Policymakers in a formal meeting" 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="text-lg font-bold text-black mb-3">Informing National Policy</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    We engage directly with government departments and policymakers, providing expert consultation on statutory guidance and new legislation.
                                </p>
                            </div>
                        </div>

                        <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col">
                            <div className="aspect-[4/3] overflow-hidden">
                                <img 
                                    src="https://images.unsplash.com/photo-1556761175-59736c8def42?q=80&w=400&auto=format&fit=crop" 
                                    alt="Diverse group of professionals collaborating" 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="text-lg font-bold text-black mb-3">Championing the Profession</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    We amplify the voice of our members, ensuring the real-world experiences of practitioners inform public debate and professional standards.
                                </p>
                            </div>
                        </div>

                        <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col">
                            <div className="aspect-[4/3] overflow-hidden">
                                <img 
                                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" 
                                    alt="Data dashboards and analytics" 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="text-lg font-bold text-black mb-3">Data-Driven Insights</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    We conduct and commission independent research to build a robust evidence base, identifying trends and effective interventions in safeguarding.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Get Involved Section */}
            <section className="bg-white py-24">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-4xl lg:text-5xl font-bold text-black leading-tight">
                            Get Involved
                        </h2>
                        <p className="text-lg text-gray-600 leading-relaxed mt-6 max-w-3xl mx-auto">
                            Your expertise is our greatest asset. As an IfS member, you have numerous opportunities to contribute to our research and advocacy work, ensuring it is grounded in current practice.
                        </p>
                    </div>

                    <div className="mt-16 grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="border-l-4 border-purple-600 pl-6">
                                <h3 className="text-xl font-bold text-black mb-2">Participate in Research</h3>
                                <p className="text-gray-600">Contribute to our annual safeguarding surveys and influential research projects that shape sector understanding.</p>
                            </div>
                            <div className="border-l-4 border-pink-600 pl-6">
                                <h3 className="text-xl font-bold text-black mb-2">Join Focus Groups</h3>
                                <p className="text-gray-600">Participate in member-only focus groups to lend your voice to discussions on emerging safeguarding issues.</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="border-l-4 border-blue-600 pl-6">
                                <h3 className="text-xl font-bold text-black mb-2">Shape National Policy</h3>
                                <p className="text-gray-600">Help shape policy submissions by responding to our calls for expert evidence and consultation responses.</p>
                            </div>
                            <div className="border-l-4 border-green-600 pl-6">
                                <h3 className="text-xl font-bold text-black mb-2">Access Funded Programmes</h3>
                                <p className="text-gray-600">Engage in innovative, fully-funded programmes supporting individuals and institutions in safeguarding excellence.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Membership Benefits Section */}
            <section className="bg-slate-50 py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
                            A professional home for every stage of your career
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                          From aspiring professionals to established leaders, IfS provides a tailored membership journey to support your growth and impact.
                        </p>
                    </div>

                    {/* Membership Comparison Grid */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                        {/* Header Row */}
                        <div className="grid grid-cols-4 bg-gray-50">
                            <div className="p-6 border-r border-gray-200"></div>
                            <div className="p-6 border-r border-gray-200 text-center relative">
                                <h3 className="text-xl font-bold text-black mb-2">Associate Member</h3>
                                <p className="text-sm text-gray-600">Essential benefits</p>
                            </div>
                            <div className="p-6 border-r border-gray-200 text-center relative bg-purple-50">
                                <h3 className="text-xl font-bold text-black mb-2">Full Member</h3>
                                <p className="text-sm text-gray-600">Advanced benefits</p>
                            </div>
                            <div className="p-6 text-center relative">
                                <h3 className="text-xl font-bold text-black mb-2">Corporate Member</h3>
                                <p className="text-sm text-gray-600">Staff development</p>
                            </div>
                        </div>

                        {/* CPD & Training Section */}
                        <div className="bg-gray-50 border-t border-gray-200">
                            <div className="grid grid-cols-4">
                                <button
                                    onClick={() => toggleSection('cpdTraining')}
                                    className="p-4 border-r border-gray-200 bg-gray-100 text-left hover:bg-gray-200 transition-colors flex items-center justify-between w-full"
                                >
                                    <h4 className="font-bold text-black text-sm uppercase tracking-wider">CPD & Training</h4>
                                    {expandedSections.cpdTraining ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
                                </button>
                                <div className="p-4 border-r border-gray-200"></div>
                                <div className="p-4 border-r border-gray-200"></div>
                                <div className="p-4"></div>
                            </div>
                        </div>
                        {expandedSections.cpdTraining && (
                            <>
                                <div className="grid grid-cols-4 border-t border-gray-200">
                                    <div className="p-4 border-r border-gray-200 bg-gray-50">
                                        <span className="text-sm text-gray-700">Monthly webinars</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                                    </div>
                                    <div className="p-4 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 border-t border-gray-200">
                                    <div className="p-4 border-r border-gray-200 bg-gray-50">
                                        <span className="text-sm text-gray-700">Annual conference access</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <span className="text-gray-400">—</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                                    </div>
                                    <div className="p-4 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 border-t border-gray-200">
                                    <div className="p-4 border-r border-gray-200 bg-gray-50">
                                        <span className="text-sm text-gray-700">Advanced masterclasses</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <span className="text-gray-400">—</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                                    </div>
                                    <div className="p-4 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Webinars & Resources Section */}
                        <div className="bg-gray-50 border-t border-gray-200">
                            <div className="grid grid-cols-4">
                                <button
                                    onClick={() => toggleSection('webinars')}
                                    className="p-4 border-r border-gray-200 bg-gray-100 text-left hover:bg-gray-200 transition-colors flex items-center justify-between w-full"
                                >
                                    <h4 className="font-bold text-black text-sm uppercase tracking-wider">Resources & Forums</h4>
                                    {expandedSections.webinars ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
                                </button>
                                <div className="p-4 border-r border-gray-200"></div>
                                <div className="p-4 border-r border-gray-200"></div>
                                <div className="p-4"></div>
                            </div>
                        </div>
                        {expandedSections.webinars && (
                            <>
                                <div className="grid grid-cols-4 border-t border-gray-200">
                                    <div className="p-4 border-r border-gray-200 bg-gray-50">
                                        <span className="text-sm text-gray-700">Member forums access</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                                    </div>
                                    <div className="p-4 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 border-t border-gray-200">
                                    <div className="p-4 border-r border-gray-200 bg-gray-50">
                                        <span className="text-sm text-gray-700">Resource library</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <span className="font-semibold text-black">Basic</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <span className="font-semibold text-black">Full Access</span>
                                    </div>
                                    <div className="p-4 text-center">
                                        <span className="font-semibold text-black">Full Access</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 border-t border-gray-200">
                                    <div className="p-4 border-r border-gray-200 bg-gray-50">
                                        <span className="text-sm text-gray-700">AI Policy Analyser</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <span className="text-gray-400">—</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                                    </div>
                                    <div className="p-4 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Supervision Services Section */}
                        <div className="bg-gray-50 border-t border-gray-200">
                            <div className="grid grid-cols-4">
                                <button
                                    onClick={() => toggleSection('supervision')}
                                    className="p-4 border-r border-gray-200 bg-gray-100 text-left hover:bg-gray-200 transition-colors flex items-center justify-between w-full"
                                >
                                    <h4 className="font-bold text-black text-sm uppercase tracking-wider">Supervision Services</h4>
                                    {expandedSections.supervision ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
                                </button>
                                <div className="p-4 border-r border-gray-200"></div>
                                <div className="p-4 border-r border-gray-200"></div>
                                <div className="p-4"></div>
                            </div>
                        </div>
                        {expandedSections.supervision && (
                            <>
                                <div className="grid grid-cols-4 border-t border-gray-200">
                                    <div className="p-4 border-r border-gray-200 bg-gray-50">
                                        <span className="text-sm text-gray-700">Access to matching service</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                                    </div>
                                    <div className="p-4 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 border-t border-gray-200">
                                    <div className="p-4 border-r border-gray-200 bg-gray-50">
                                        <span className="text-sm text-gray-700">Free supervision sessions</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <span className="text-gray-400">—</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <span className="font-semibold text-black">2 sessions</span>
                                    </div>
                                    <div className="p-4 text-center">
                                        <span className="font-semibold text-black">3 per staff member</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 border-t border-gray-200">
                                    <div className="p-4 border-r border-gray-200 bg-gray-50">
                                        <span className="text-sm text-gray-700">Session discounts</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <span className="text-gray-400">—</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <span className="font-semibold text-black">15% discount</span>
                                    </div>
                                    <div className="p-4 text-center">
                                        <span className="font-semibold text-black">15% discount</span>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Support & Advocacy Section */}
                        <div className="bg-gray-50 border-t border-gray-200">
                            <div className="grid grid-cols-4">
                                <button
                                    onClick={() => toggleSection('support')}
                                    className="p-4 border-r border-gray-200 bg-gray-100 text-left hover:bg-gray-200 transition-colors flex items-center justify-between w-full"
                                >
                                    <h4 className="font-bold text-black text-sm uppercase tracking-wider">Support & Advocacy</h4>
                                    {expandedSections.support ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
                                </button>
                                <div className="p-4 border-r border-gray-200"></div>
                                <div className="p-4 border-r border-gray-200"></div>
                                <div className="p-4"></div>
                            </div>
                        </div>
                        {expandedSections.support && (
                            <>
                                <div className="grid grid-cols-4 border-t border-gray-200">
                                    <div className="p-4 border-r border-gray-200 bg-gray-50">
                                        <span className="text-sm text-gray-700">Signposting service</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                                    </div>
                                    <div className="p-4 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 border-t border-gray-200">
                                    <div className="p-4 border-r border-gray-200 bg-gray-50">
                                        <span className="text-sm text-gray-700">Jobs board access</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                                    </div>
                                    <div className="p-4 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 border-t border-gray-200">
                                    <div className="p-4 border-r border-gray-200 bg-gray-50"><span className="text-sm text-gray-700">Daily job views</span></div>
                                    <div className="p-4 border-r border-gray-200 text-center"><span className="font-semibold text-black">Up to 3 per day</span></div>
                                    <div className="p-4 border-r border-gray-200 text-center"><span className="font-semibold text-black">Unlimited</span></div>
                                    <div className="p-4 text-center"><span className="font-semibold text-black">Unlimited</span></div>
                                </div>
                                <div className="grid grid-cols-4 border-t border-gray-200">
                                    <div className="p-4 border-r border-gray-200 bg-gray-50"><span className="text-sm text-gray-700">Job postings</span></div>
                                    <div className="p-4 border-r border-gray-200 text-center"><span className="text-gray-400">—</span></div>
                                    <div className="p-4 border-r border-gray-200 text-center"><span className="text-gray-400">—</span></div>
                                    <div className="p-4 text-center"><span className="font-semibold text-black">6 featured jobs per year</span></div>
                                </div>
                            </>
                        )}

                        {/* Research & Policy Section */}
                        <div className="bg-gray-50 border-t border-gray-200">
                            <div className="grid grid-cols-4">
                                <button
                                    onClick={() => toggleSection('research')}
                                    className="p-4 border-r border-gray-200 bg-gray-100 text-left hover:bg-gray-200 transition-colors flex items-center justify-between w-full"
                                >
                                    <h4 className="font-bold text-black text-sm uppercase tracking-wider">Research & Policy</h4>
                                    {expandedSections.research ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
                                </button>
                                <div className="p-4 border-r border-gray-200"></div>
                                <div className="p-4 border-r border-gray-200"></div>
                                <div className="p-4"></div>
                            </div>
                        </div>
                        {expandedSections.research && (
                            <>
                                <div className="grid grid-cols-4 border-t border-gray-200">
                                    <div className="p-4 border-r border-gray-200 bg-gray-50">
                                        <span className="text-sm text-gray-700">Policy consultation input</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <span className="text-gray-400">—</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                                    </div>
                                    <div className="p-4 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 border-t border-gray-200">
                                    <div className="p-4 border-r border-gray-200 bg-gray-50">
                                        <span className="text-sm text-gray-700">Access to funded programmes</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <span className="text-gray-400">—</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <span className="text-gray-400">—</span>
                                    </div>
                                    <div className="p-4 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 border-t border-gray-200">
                                    <div className="p-4 border-r border-gray-200 bg-gray-50">
                                        <span className="text-sm text-gray-700">Research participation opportunities</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                                    </div>
                                    <div className="p-4 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 border-t border-gray-200">
                                    <div className="p-4 border-r border-gray-200 bg-gray-50">
                                        <span className="text-sm text-gray-700">Exclusive focus groups</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <span className="text-gray-400">—</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                                    </div>
                                    <div className="p-4 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Pricing Row */}
                        <div className="grid grid-cols-4 border-t-2 border-gray-300 bg-slate-50">
                            <div className="p-4 border-r border-gray-200 bg-gray-100">
                                <h4 className="font-bold text-black text-sm uppercase tracking-wider">Pricing</h4>
                            </div>
                            <div className="p-6 border-r border-gray-200 text-center">
                                <p className="text-black">Free</p>
                            </div>
                            <div className="p-6 border-r border-gray-200 text-center bg-purple-50">
                                <p className="text-black">£350 per year</p>
                            </div>
                            <div className="p-6 text-center">
                                <p className="text-black">From £980 per year</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-4 bg-white">
                            <div className="p-4 border-r border-gray-200"></div>
                            <div className="p-6 border-r border-gray-200 text-center">
                                <Button 
                                    onClick={() => handleJoin('research_advocacy_pricing_associate')}
                                    size="sm" 
                                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-sm w-full"
                                >
                                    Join Free
                                </Button>
                            </div>
                            <div className="p-6 border-r border-gray-200 text-center">
                                <Button 
                                    onClick={() => handleJoin('research_advocacy_pricing_full')}
                                    size="sm" 
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-sm w-full"
                                >
                                    Upgrade Now
                                </Button>
                            </div>
                            <div className="p-6 text-center">
                                <Button 
                                    asChild
                                    size="sm" 
                                    variant="outline"
                                    className="border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-4 py-2 rounded-sm w-full"
                                >
                                    <Link to={createPageUrl("Contact")}>Contact Us</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Final CTA */}
            <section className="bg-gray-900 py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                        Make Your Voice Heard
                    </h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                        Join the IfS today to support our vital advocacy work and gain access to our full library of research and publications.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button 
                            onClick={() => handleJoin('research_advocacy_final_cta_become_member')}
                            size="lg" 
                            className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-semibold px-8 py-4 text-lg rounded-sm"
                        >
                            Become a Member
                        </Button>
                        <Button 
                            asChild
                            size="lg" 
                            variant="outline"
                            className="bg-transparent border-white text-white hover:bg-white hover:text-black font-semibold px-8 py-4 text-lg rounded-sm"
                        >
                            <Link to={createPageUrl("Membership")}>Compare Memberships</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
}
