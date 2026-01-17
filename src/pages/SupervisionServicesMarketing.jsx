import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from '@/api/entities';
import { customLoginWithRedirect } from '../components/utils/auth';
// Combined lucide-react imports: CheckCircle2 is used in the component's JSX,
// and Heart, Users, Shield, ArrowRight are added as per the outline.
import { CheckCircle2, Heart, Users, Shield, ArrowRight } from 'lucide-react';
import MainSiteNav from '../components/marketing/MainSiteNav';
import HeroBreadcrumbs from '../components/marketing/HeroBreadcrumbs';
import ServiceCard from '../components/marketing/ServiceCard'; // ServiceCard is used in the component and kept.
import { usePostHog } from '../components/providers/PostHogProvider';

export default function SupervisionServicesMarketing() {
    const { trackEvent } = usePostHog();

    const handleJoin = (location) => {
        // Track the event when the join button is clicked
        trackEvent('join_button_clicked', {
          intent: 'associate',
          // Updated default location as per outline
          location: location || 'supervision_services_page_hero',
          user_type: 'anonymous'
        });
        // Redirect to onboarding with an intent parameter
        const path = createPageUrl('Onboarding') + '?intent=associate';
        customLoginWithRedirect(path);
    };

    // The scrollToServices function is removed as its functionality is now inline
    // with a changed target ID, as per the outline.

    return (
        <>
            {/* Hero Section */}
            <section className="relative bg-gray-900 overflow-hidden" style={{ minHeight: '600px' }}>
                <div className="absolute inset-0 hidden lg:block">
                    <img
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2070&auto=format&fit=crop"
                        alt="Professional supervision session - one-on-one meeting"
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
                </div>

                <MainSiteNav />

                <div className="relative z-10 max-w-screen-xl mx-auto">
                    <div className="grid lg:grid-cols-2 items-center min-h-[600px]">
                        <div className="px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center lg:text-left">
                            {/* pageName prop remains the same */}
                            <HeroBreadcrumbs pageName="SupervisionServicesMarketing" />
                            {/* H1 text remains the same */}
                            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                                Professional Supervision Services
                            </h1>
                            {/* Updated description paragraphs as per outline */}
                            <div className="text-lg lg:text-xl text-purple-100 mb-8 leading-relaxed space-y-4">
                                <p>
                                    Support your well-being and enhance your professional practice with our dedicated supervision services.
                                </p>
                                <p className="hidden lg:block">
                                    Our qualified supervisors provide a supportive space for reflective practice, helping you navigate complex cases and maintain resilience.
                                </p>
                            </div>
                            {/* Desktop CTA buttons */}
                            <div className="hidden lg:inline-flex items-center gap-4">
                                <Button
                                    // Updated the onClick handler and target ID as per outline
                                    onClick={() => {
                                        const servicesSection = document.getElementById('services-section');
                                        if (servicesSection) {
                                            servicesSection.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }}
                                    size="lg"
                                    className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm"
                                >
                                    Find a Supervisor
                                </Button>
                                <Button
                                  onClick={() => handleJoin('supervision_services_hero_desktop')}
                                  size="lg"
                                  variant="outline"
                                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-800 font-semibold px-8 py-3 text-base rounded-sm transition-all"
                                >
                                  Become a Member for Free
                                </Button>
                            </div>
                            {/* Mobile CTA button - already present and confirmed in outline */}
                            <div className="mt-8 lg:hidden">
                                <Button
                                    onClick={() => handleJoin('supervision_services_hero_mobile')}
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

            {/* Services Overview */}
            <section className="bg-white py-24">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-start">
                        <div>
                            <h2 className="text-4xl lg:text-5xl font-bold text-black leading-tight">
                                Supporting your professional growth and wellbeing
                            </h2>
                        </div>
                        <div>
                            <p className="text-lg text-gray-600 leading-relaxed mb-8">
                                Working in safeguarding can be emotionally demanding and professionally challenging. Our supervision services provide a safe, confidential space to reflect on practice, develop skills, and maintain your wellbeing while protecting the vulnerable individuals in your care.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    onClick={() => handleJoin('supervision_services_overview')}
                                    size="lg"
                                    className="bg-black hover:bg-gray-800 text-white font-semibold px-8 py-3 rounded-sm"
                                >
                                    Access Supervision Services
                                </Button>
                                <Button
                                    asChild
                                    size="lg"
                                    variant="outline"
                                    className="border-2 border-black text-black hover:bg-black hover:text-white font-semibold px-8 py-3 rounded-sm transition-all"
                                >
                                    <Link to={createPageUrl("Contact")}>Speak to Our Team</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Supervision Matters */}
            <section className="bg-slate-50 py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
                            Why professional supervision matters
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Quality supervision is essential for effective safeguarding practice, professional development, and maintaining your wellbeing in this demanding field.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ServiceCard
                            content={{
                                title: "Enhance Practice Quality",
                                description: "Reflect on cases, explore different approaches, and develop your professional judgment through guided discussion with experienced supervisors.",
                                imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/760156095_cdc-gsRi9cWCIB0-unsplash4.jpg"
                            }}
                        />
                        <ServiceCard
                             content={{
                                title: "Support Wellbeing",
                                description: "Address the emotional impact of safeguarding work and develop strategies for maintaining your mental health and resilience.",
                                imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/e2a11a3b1_dylan-ferreira-HJmxky8Fvmo-unsplash.jpg"
                            }}
                        />
                        <ServiceCard
                            content={{
                                title: "Professional Development",
                                description: "Identify learning needs, set development goals, and track your professional growth with expert guidance.",
                                imageUrl: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/6c5b3cfc9_unseen-studio-s9CC2SKySJM-unsplash1.jpg"
                            }}
                        />
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="bg-white py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
                            How our supervision service works
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Our streamlined process ensures you're matched with the right supervisor for your needs and professional context.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl font-bold text-purple-600">1</span>
                            </div>
                            <h3 className="text-xl font-bold text-black mb-4">Complete Your Profile</h3>
                            <p className="text-gray-600">
                                Tell us about your role, experience level, and supervision preferences to help us find the right match.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl font-bold text-purple-600">2</span>
                            </div>
                            <h3 className="text-xl font-bold text-black mb-4">Get Matched</h3>
                            <p className="text-gray-600">
                                Our team will match you with qualified supervisors who have experience in your sector and understand your challenges.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl font-bold text-purple-600">3</span>
                            </div>
                            <h3 className="text-xl font-bold text-black mb-4">Start Your Sessions</h3>
                            <p className="text-gray-600">
                                Begin regular supervision sessions via video call, phone, or in-person (where available) at times that work for you.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Supervision Options - ID updated to 'services-section' to match hero CTA */}
            <section id="services-section" className="bg-slate-50 py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
                            Supervision benefits by membership level
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            All members have access to our supervision matching service, with additional benefits available for Full members.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Associate Member */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-black mb-2">Associate Member</h3>
                                <p className="text-gray-600">Free supervision matching</p>
                                <div className="text-3xl font-bold text-green-600 mt-4">Free</div>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">Access to supervisor matching service</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">Directory of qualified supervisors</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">Guidance on supervision standards</span>
                                </li>
                            </ul>
                            <Button
                                onClick={() => handleJoin('supervision_services_associate_member')}
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                            >
                                Join Free
                            </Button>
                        </div>

                        {/* Full Member */}
                        <div className="bg-purple-50 rounded-2xl p-8 shadow-xl border-2 border-purple-200 relative">
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                <div className="bg-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold">
                                    RECOMMENDED
                                </div>
                            </div>
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-black mb-2">Full Member</h3>
                                <p className="text-gray-600">Enhanced supervision support</p>
                                <div className="text-3xl font-bold text-black mt-4">£350<span className="text-lg font-normal text-gray-600">/year</span></div>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">All Associate benefits</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">Complimentary supervision session annually</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">10% discount on additional sessions</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">Priority booking for preferred supervisors</span>
                                </li>
                            </ul>
                            <Button
                                onClick={() => handleJoin('supervision_services_full_member')}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                Upgrade Now
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-20 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                </div>
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
                    <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                        Ready to enhance your professional practice?
                    </h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                        Join IfS today and access the supervision support you need to thrive in your safeguarding role.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={() => handleJoin('supervision_services_call_to_action')}
                            size="lg"
                            className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-semibold px-8 py-4 text-lg rounded-sm shadow-lg hover:shadow-xl transition-all"
                        >
                            Access Supervision Services
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