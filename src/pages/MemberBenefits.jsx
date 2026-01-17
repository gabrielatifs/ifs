
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import MainSiteNav from '../components/marketing/MainSiteNav';
import HeroBreadcrumbs from '../components/marketing/HeroBreadcrumbs';
import ServiceCard from '../components/marketing/ServiceCard';
import { ArrowRight } from 'lucide-react'; // Import ArrowRight icon

export default function MemberBenefits() {
    return (
        <>
            {/* Hero Section */}
            <section className="relative bg-gray-900 overflow-hidden" style={{ minHeight: '600px' }}>
                <div className="absolute inset-0 hidden lg:block">
                    <img 
                        src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
                        alt="A team strategizing with sticky notes on a glass wall"
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
                            <HeroBreadcrumbs pageName="MemberBenefits" />
                            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                                Exclusive Member Benefits
                            </h1>
                            <p className="text-lg lg:text-xl text-purple-100 mb-8 leading-relaxed">
                                Explore the comprehensive suite of resources, tools, and support services designed to elevate your professional practice and career.
                            </p>
                        </div>
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
                                Support at Every Stage of Your Career
                            </h2>
                        </div>
                        
                        {/* Right Column - Description & CTAs */}
                        <div>
                            <p className="text-lg text-gray-600 leading-relaxed mb-8">
                                IfS membership provides you with the essential tools, expert knowledge, and supportive community needed to excel in your safeguarding role. We are committed to fostering professional growth and elevating standards across the sector.
                            </p>
                          
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                  asChild
                                  size="lg"
                                  className="bg-black hover:bg-gray-800 text-white font-semibold px-8 py-3 rounded-sm">
                                  <Link to={createPageUrl("MembershipTiers")}>Compare Membership Tiers</Link>
                                </Button>
                                <Button
                                  asChild
                                  size="lg"
                                  variant="outline"
                                  className="border-2 border-black text-black hover:bg-black hover:text-white font-semibold px-8 py-3 rounded-sm transition-all">
                                  <Link to={createPageUrl("JoinUs")}>Become a Member</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Grid Section */}
            <section className="bg-slate-50 py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ServiceCard
                            title="Member Workshops"
                            description="Engage with peers and experts in our moderated forums and exclusive member workshops."
                            imageUrl="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/69a51d492_saikrishna-saketh-yellapragada-LKDEI6JiAHE-unsplash.jpg"
                            linkTo={createPageUrl("Events")}
                            linkText="Explore Workshops"
                        />
                        <ServiceCard
                            title="Best-in-Class CPD & Training"
                            description="Advance your practice with our CPD-accredited training, masterclasses, and qualifications."
                            imageUrl="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/890f45c73_centre-for-ageing-better-cPyO3GEYjZ4-unsplash4.jpg"
                            linkTo={createPageUrl("CPDTrainingMarketing")}
                            linkText="View Training"
                        />
                        <ServiceCard
                            title="Supervision Services"
                            description="Access professional supervision designed to support your wellbeing, enhance reflective practice, and promote professional growth."
                            imageUrl="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/1193a457c_amy-hirschi-JaoVGh5aJ3E-unsplash.jpg"
                            linkTo={createPageUrl("SupervisionServicesMarketing")}
                            linkText="Find a Supervisor"
                        />
                        <ServiceCard
                            title="Jobs Board"
                            description="Find your next career move with our exclusive jobs board for safeguarding professionals."
                            imageUrl="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/b4dcca56d_agence-olloweb-Z2ImfOCafFk-unsplash.jpg"
                            linkTo={createPageUrl("JobsBoardMarketing")}
                            linkText="Find Roles"
                        />
                        <ServiceCard
                            title="Research & Advocacy"
                            description="Contribute to and benefit from our cutting-edge research and policy advocacy work."
                            imageUrl="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/eb79fdefc_jason-goodman-m2TU2gfqSeE-unsplash.jpg"
                            linkTo={createPageUrl("ResearchAndAdvocacy")}
                            linkText="Read More"
                        />
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
                </div>
            </section>

            {/* Final CTA */}
            <section className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
                    <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                        Ready to Access Your Benefits?
                    </h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                        Join our community of dedicated professionals to unlock these exclusive benefits and elevate your safeguarding practice.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild size="lg" className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-semibold px-8 py-4 text-lg rounded-sm shadow-lg hover:shadow-xl transition-all">
                            <Link to={createPageUrl("JoinUs")}>Become a Member Today</Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-8 py-4 text-lg rounded-sm transition-all">
                            <Link to={createPageUrl("MembershipTiers")}>Compare Tiers</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
}
