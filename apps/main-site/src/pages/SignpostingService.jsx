
import React from 'react';
import { Button } from '@ifs/shared/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@ifs/shared/utils';
import { ArrowRight, CheckCircle2, Phone, Mail, MessageCircle, Clock, Shield, Users, Compass, Search, FileText, AlertTriangle, ChevronUp, ChevronRight } from 'lucide-react';
import { User } from '@ifs/shared/api/entities';
import MainSiteNav from '../components/marketing/MainSiteNav';
import HeroBreadcrumbs from '../components/marketing/HeroBreadcrumbs';
import { usePostHog } from '@ifs/shared/components/providers/PostHogProvider';

export default function SignpostingService() {
    const { trackEvent } = usePostHog();

    const [expandedSections, setExpandedSections] = React.useState({
        resources: true,
        cpdTraining: false,
        webinars: false,
        supervision: false,
        support: false
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
          location: location || 'signposting_service_page_hero',
          user_type: 'anonymous'
        });
        const url = createPageUrl('Onboarding') + '?intent=associate';
        User.loginWithRedirect(url);
    };

    // handleLearnMore is removed as its functionality is integrated directly into the new 'Get Support' button's onClick

    return (
        <>
            {/* Hero Section */}
            <section className="relative bg-gray-900 overflow-hidden" style={{ minHeight: '600px' }}>
                
                <div className="absolute inset-0 hidden lg:block">
                    <img 
                        src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=2070&auto=format&fit=crop" 
                        alt="Professional guidance and support consultation"
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
                    <div className="absolute bottom-24 right-32 w-48 h-48 bg-purple-700/25 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-8 right-16 w-24 h-24 bg-purple-500/50 rounded-full blur-lg"></div>
                    <div className="absolute top-1/2 right-4 w-20 h-20 bg-pink-600/60 rounded-full blur-md"></div>
                </div>

                <MainSiteNav />

                <div className="relative z-10 max-w-screen-xl mx-auto">
                    <div className="grid lg:grid-cols-2 items-center min-h-[600px]">
                        <div className="px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center lg:text-left">
                            <HeroBreadcrumbs pageName="SignpostingService" />
                            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                                Professional Signposting Service
                            </h1>
                            <div className="text-lg lg:text-xl text-purple-100 mb-8 leading-relaxed space-y-4">
                                <p>
                                    Get directed to the right support services and resources for your safeguarding needs.
                                </p>
                                <p className="hidden lg:block">
                                    Our expert team can help connect you with appropriate professional support, training opportunities, and specialist services.
                                </p>
                            </div>
                            <div className="hidden lg:inline-flex items-center gap-4">
                                <Button
                                    onClick={() => {
                                        const servicesSection = document.getElementById('signposting-services');
                                        if (servicesSection) {
                                            servicesSection.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }}
                                    size="lg"
                                    className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm"
                                >
                                    Get Support
                                </Button>
                                <Button
                                  onClick={() => handleJoin('signposting_service_hero_desktop')}
                                  size="lg"
                                  variant="outline"
                                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-800 font-semibold px-8 py-3 text-base rounded-sm transition-all"
                                >
                                  Become a Member for Free
                                </Button>
                            </div>
                            <div className="mt-8 lg:hidden">
                                <Button
                                    onClick={() => handleJoin('signposting_service_hero_mobile')}
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
            <section id="signposting-services" className="bg-white py-24">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-start">
                        <div>
                            <h2 className="text-4xl lg:text-5xl font-bold text-black leading-tight">
                                Connect with services you won't find elsewhere
                            </h2>
                        </div>
                        
                        <div>
                            <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                Go beyond standard directories. Our digital signposting platform provides instant access to a curated database of specialist services, including many non-statutory organisations that provide critical, targeted support.
                            </p>
                            <p className="text-lg text-gray-600 leading-relaxed mb-8">
                                This powerful tool is available exclusively to IfS members through the secure Member Portal.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button 
                                    onClick={() => handleJoin('signposting_service_mission_section')}
                                    size="lg" 
                                    className="bg-black hover:bg-gray-800 text-white font-semibold px-8 py-3 rounded-sm"
                                >
                                    Access Platform
                                </Button>
                                <Button 
                                    asChild
                                    size="lg" 
                                    variant="outline"
                                    className="border-2 border-black text-black hover:bg-black hover:text-white font-semibold px-8 py-3 rounded-sm transition-all"
                                >
                                    <Link to={createPageUrl("Membership")}>View Membership Options</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Platform Features Section */}
            <section className="bg-white py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
                            Powerful digital tools for professional signposting
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Our platform combines comprehensive databases with intelligent search to help you find the right support quickly.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Search,
                                title: "Advanced Search & Filtering",
                                description: "Find specialist services by location, expertise, age group, and specific safeguarding concerns."
                            },
                            {
                                icon: Users,
                                title: "Verified Service Directory",
                                description: "Access our curated database of verified specialist services, experts, and support organizations."
                            },
                            {
                                icon: FileText,
                                title: "Resource Library Integration",
                                description: "Direct links to relevant guidance, templates, and best practice resources for each service area."
                            },
                            {
                                icon: MessageCircle,
                                title: "Expert Contact Details",
                                description: "Instant access to contact information for specialists, including preferred contact methods and availability."
                            },
                            {
                                icon: Compass,
                                title: "Case-Specific Recommendations",
                                description: "Get tailored service recommendations based on specific case characteristics and requirements."
                            },
                            {
                                icon: Clock,
                                title: "Real-Time Updates",
                                description: "Stay informed about service availability, new resources, and changes to contact information."
                            }
                        ].map((item, index) => (
                            <div key={index} className="bg-slate-50 p-6 rounded-xl hover:bg-slate-100 transition-colors">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                                    <item.icon className="w-6 h-6 text-purple-800" />
                                </div>
                                <h3 className="text-lg font-bold text-black mb-3">{item.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Membership Access Levels Section */}
            <section className="bg-slate-50 py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
                            Access levels by membership tier
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Different membership levels provide varying access to platform features and capabilities.
                        </p>
                    </div>

                    {/* Membership Comparison Grid */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                        {/* Header Row */}
                        <div className="grid grid-cols-4 bg-gray-50">
                            <div className="p-6 border-r border-gray-200"></div>
                            <div className="p-6 border-r border-gray-200 text-center relative">
                                <h3 className="text-xl font-bold text-black mb-2">Associate Member</h3>
                                <p className="text-sm text-gray-600">Full platform access</p>
                            </div>
                            <div className="p-6 border-r border-gray-200 text-center relative bg-purple-50">
                                <h3 className="text-xl font-bold text-black mb-2">Full Member</h3>
                                <p className="text-sm text-gray-600">Enhanced features</p>
                            </div>
                            <div className="p-6 text-center relative">
                                <h3 className="text-xl font-bold text-black mb-2">Corporate Member</h3>
                                <p className="text-sm text-gray-600">Team-wide access</p>
                            </div>
                        </div>

                        {/* Resources & Services Section */}
                        <div className="bg-gray-50 border-t border-gray-200">
                            <div className="grid grid-cols-4">
                                <button
                                    onClick={() => toggleSection('resources')}
                                    className="p-4 border-r border-gray-200 bg-gray-100 text-left hover:bg-gray-200 transition-colors flex items-center justify-between w-full"
                                >
                                    <h4 className="font-bold text-black text-sm uppercase tracking-wider">Resources & Services</h4>
                                    {expandedSections.resources ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
                                </button>
                                <div className="p-4 border-r border-gray-200"></div>
                                <div className="p-4 border-r border-gray-200"></div>
                                <div className="p-4"></div>
                            </div>
                        </div>

                        {/* Resources & Services Content - Collapsible */}
                        {expandedSections.resources && (
                            <>
                                <div className="grid grid-cols-4 border-t border-gray-200">
                                    <div className="p-4 border-r border-gray-200 bg-gray-50">
                                        <span className="text-sm text-gray-700 font-medium">Unlimited service searches</span>
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
                                        <span className="text-sm text-gray-700 font-medium">Access to all service categories</span>
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
                                        <span className="text-sm text-gray-700 font-medium">Expert contact information</span>
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
                                        <span className="text-sm text-gray-700 font-medium">Save services to personal lists</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <span className="text-gray-400">—</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-purple-600 mx-auto" />
                                    </div>
                                    <div className="p-4 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-blue-600 mx-auto" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 border-t border-gray-200">
                                    <div className="p-4 border-r border-gray-200 bg-gray-50">
                                        <span className="text-sm text-gray-700 font-medium">Create custom service collections</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <span className="text-gray-400">—</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-purple-600 mx-auto" />
                                    </div>
                                    <div className="p-4 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-blue-600 mx-auto" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 border-t border-gray-200">
                                    <div className="p-4 border-r border-gray-200 bg-gray-50">
                                        <span className="text-sm text-gray-700 font-medium">Advanced filtering options</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <span className="text-gray-400">—</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-purple-600 mx-auto" />
                                    </div>
                                    <div className="p-4 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-blue-600 mx-auto" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 border-t border-gray-200">
                                    <div className="p-4 border-r border-gray-200 bg-gray-50">
                                        <span className="text-sm text-gray-700 font-medium">Team-wide platform access</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <span className="text-gray-400">—</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <span className="text-gray-400">—</span>
                                    </div>
                                    <div className="p-4 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-blue-600 mx-auto" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 border-t border-gray-200">
                                    <div className="p-4 border-r border-gray-200 bg-gray-50">
                                        <span className="text-sm text-gray-700 font-medium">Shared team service lists</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <span className="text-gray-400">—</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <span className="text-gray-400">—</span>
                                    </div>
                                    <div className="p-4 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-blue-600 mx-auto" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 border-t border-gray-200">
                                    <div className="p-4 border-r border-gray-200 bg-gray-50">
                                        <span className="text-sm text-gray-700 font-medium">Usage analytics and reporting</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <span className="text-gray-400">—</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <span className="text-gray-400">—</span>
                                    </div>
                                    <div className="p-4 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-blue-600 mx-auto" />
                                    </div>
                                </div>
                            </>
                        )}

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
                                        <CheckCircle2 className="w-5 h-5 text-purple-600 mx-auto" />
                                    </div>
                                    <div className="p-4 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-blue-600 mx-auto" />
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
                                        <CheckCircle2 className="w-5 h-5 text-purple-600 mx-auto" />
                                    </div>
                                    <div className="p-4 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-blue-600 mx-auto" />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Resources & Forums Section */}
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
                                        <CheckCircle2 className="w-5 h-5 text-purple-600 mx-auto" />
                                    </div>
                                    <div className="p-4 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-blue-600 mx-auto" />
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
                                <div className="grid grid-cols-4 border-t border-gray-200">
                                    <div className="p-4 border-r border-gray-200 bg-gray-50">
                                        <span className="text-sm text-gray-700">Policy consultation input</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <span className="text-gray-400">—</span>
                                    </div>
                                    <div className="p-4 border-r border-gray-200 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-purple-600 mx-auto" />
                                    </div>
                                    <div className="p-4 text-center">
                                        <CheckCircle2 className="w-5 h-5 text-blue-600 mx-auto" />
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
                        <div className="grid grid-cols-4 bg-white border-t border-gray-200">
                            <div className="p-4 border-r border-gray-200"></div>
                            <div className="p-6 border-r border-gray-200 text-center">
                                <Button 
                                    onClick={() => handleJoin('signposting_service_pricing_associate')}
                                    size="sm" 
                                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-sm w-full"
                                >
                                    Join Free
                                </Button>
                            </div>
                            <div className="p-6 border-r border-gray-200 text-center">
                                <Button 
                                    onClick={() => handleJoin('signposting_service_pricing_full')}
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

            {/* Access via Member Portal Section */}
            <section className="bg-slate-50 py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Compass className="w-8 h-8 text-purple-800" />
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
                            Ready to start exploring?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
                            The Signposting Service is a digital platform available exclusively within the secure Member Portal. Log in to access the directory, search for services, and manage your saved lists.
                        </p>
                        <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 text-base rounded-sm">
                            <Link to={createPageUrl("Dashboard")}>Go to Member Portal</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Membership Benefits Section */}
            <section className="bg-white py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 lg:p-12 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-300/20 rounded-full blur-lg"></div>
                        
                        <div className="relative z-10 text-center">
                            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                                Exclusive member benefit
                            </h2>
                            <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
                                The signposting service is available exclusively to IfS members. Join our community today to access expert guidance when you need it most.
                            </p>
                            
                            <div className="grid md:grid-cols-3 gap-6 mb-8">
                                {[
                                    "Confidential expert guidance",
                                    "24-hour email response time",
                                    "Access to specialist networks"
                                ].map((benefit, index) => (
                                    <div key={index} className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                        <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />
                                        <span className="text-sm font-medium">{benefit}</span>
                                    </div>
                                ))}
                            </div>
                            
                            <Button 
                                onClick={() => handleJoin('signposting_service_benefits_cta')}
                                size="lg" 
                                className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 py-4 text-lg rounded-sm shadow-lg"
                            >
                                Become a Member Today
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="bg-gray-900 py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                        Ready to access our signposting platform?
                    </h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                        Join the IfS community and gain instant access to our comprehensive digital signposting platform.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button 
                            onClick={() => handleJoin('signposting_service_final_cta')}
                            size="lg" 
                            className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-semibold px-8 py-4 text-lg rounded-sm shadow-lg hover:shadow-xl transition-all"
                        >
                            Apply for Membership
                        </Button>
                        <Button 
                            size="lg" 
                            variant="outline"
                            className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-8 py-4 text-lg rounded-sm transition-all"
                            asChild
                        >
                            <Link to={createPageUrl("Contact")}>Learn More</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
}
