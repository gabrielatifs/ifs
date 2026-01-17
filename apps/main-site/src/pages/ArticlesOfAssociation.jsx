
import React from 'react';
import { Button } from '@ifs/shared/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@ifs/shared/utils';
// import { User } from '@ifs/shared/api/entities'; // User import is removed as per the changes
import { FileText, Download, Scale, Shield, ArrowRight } from 'lucide-react';
import MainSiteNav from '../components/marketing/MainSiteNav';
import HeroBreadcrumbs from '../components/marketing/HeroBreadcrumbs';
import { usePostHog } from '@ifs/shared/components/providers/PostHogProvider';
import { customLoginWithRedirect } from '../components/utils/auth'; // Added new import

export default function ArticlesOfAssociation() {
    const { trackEvent } = usePostHog();

    // Modified handleJoin to include tracking and intent and use customLoginWithRedirect
    const handleJoin = (location) => {
        trackEvent('join_button_clicked', {
          intent: 'associate',
          location: location || 'articles_association_page_hero', // Default location if not provided
          user_type: 'anonymous'
        });
        const redirectPath = createPageUrl('Onboarding') + '?intent=associate'; // Renamed url to redirectPath
        customLoginWithRedirect(redirectPath); // Changed to customLoginWithRedirect
    };

    // handleLearnMore is removed as per the outline

    return (
        <>
            {/* Hero Section */}
            <section className="relative bg-gray-900 overflow-hidden" style={{ minHeight: '600px' }}>
                <div className="absolute inset-0 hidden lg:block">
                    <img
                        src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070&auto=format&fit=crop"
                        alt="Legal documents and constitutional papers"
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
                            <HeroBreadcrumbs pageName="ArticlesOfAssociation" />
                            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                                Articles of Association
                            </h1>
                            {/* Updated text content */}
                            <div className="text-lg lg:text-xl text-purple-100 mb-8 leading-relaxed space-y-4">
                                <p>
                                    Review our foundational governing documents and legal framework.
                                </p>
                                <p className="hidden lg:block">
                                    Our Articles of Association define our purpose, governance structure, and operational framework as a professional membership organization.
                                </p>
                            </div>
                            {/* Desktop buttons */}
                            <div className="hidden lg:inline-flex items-center gap-4">
                                <Button
                                    onClick={() => {
                                        const articlesSection = document.getElementById('articles-content');
                                        if (articlesSection) {
                                            articlesSection.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }}
                                    size="lg"
                                    className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm"
                                >
                                    View Documents
                                </Button>
                                <Button
                                  onClick={() => handleJoin('articles_association_hero_desktop')}
                                  size="lg"
                                  variant="outline"
                                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-800 font-semibold px-8 py-3 text-base rounded-sm transition-all"
                                >
                                  Become a Member for Free
                                </Button>
                            </div>
                            {/* Mobile CTA */}
                            <div className="mt-8 lg:hidden">
                                <Button
                                    onClick={() => handleJoin('articles_association_hero_mobile')}
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

            {/* Document Overview Section */}
            <section className="bg-white py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="border-l-4 border-slate-600 pl-6 mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">
                            Constitutional Foundation
                        </h2>
                        <p className="text-lg text-slate-700 leading-relaxed">
                            The Articles of Association constitute the primary governing document of the Independent Federation for Safeguarding, a company limited by guarantee incorporated under the Companies Act 2006.
                        </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 mb-8">
                        <h3 className="text-xl font-semibold text-slate-900 mb-4">Document Status</h3>
                        <div className="grid md:grid-cols-2 gap-6 text-sm">
                            <div>
                                <dt className="font-medium text-slate-600">Date of Incorporation:</dt>
                                <dd className="text-slate-900">3rd June 2025</dd>
                            </div>
                            <div>
                                <dt className="font-medium text-slate-600">Company Number:</dt>
                                <dd className="text-slate-900">16491485</dd>
                            </div>
                            <div>
                                <dt className="font-medium text-slate-600">Company Type:</dt>
                                <dd className="text-slate-900">Limited by Guarantee</dd>
                            </div>
                            <div>
                                <dt className="font-medium text-slate-600">Last Updated:</dt>
                                <dd className="text-slate-900">3rd June 2025</dd>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Document Access Section - Added id for scrolling */}
            <section id="articles-content" className="bg-slate-50 py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">
                            Official Documentation
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Access our complete constitutional documents and regulatory filings
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-slate-100">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900">Articles of Association</h3>
                                        <p className="text-sm text-slate-600 mt-1">Complete constitutional document</p>
                                    </div>
                                    <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">Current</span>
                                </div>
                                <p className="text-slate-700 mt-3 mb-4">
                                    The complete constitutional framework establishing our objects, governance structure, membership provisions, and operational procedures.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button asChild className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-6 py-2">
                                        <a href="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/9388d4179_ArticlesofAssociation-IfS.pdf" download="IfS_Articles_of_Association.pdf">
                                            <Download className="mr-2 h-4 w-4" /> Download PDF
                                        </a>
                                    </Button>
                                    <Button asChild variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                                        <a href="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d662af168696381e05/9388d4179_ArticlesofAssociation-IfS.pdf" target="_blank" rel="noopener noreferrer">
                                            <FileText className="mr-2 h-4 w-4" /> View Online
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-slate-900">Companies House Filing</h3>
                                <p className="text-sm text-slate-600 mt-1">Corporate registration details</p>
                                <p className="text-slate-700 mt-3 mb-4">
                                    Company incorporation documents and statutory filings maintained at Companies House.
                                </p>
                                <Button asChild variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                                    <a href="https://find-and-update.company-information.service.gov.uk/company/16491485" target="_blank" rel="noopener noreferrer">
                                        <Scale className="mr-2 h-4 w-4" /> View on Companies House Website
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Key Provisions Section */}
            <section className="bg-white py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
                        Key Constitutional Provisions
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            {
                                title: "Objects and Purpose",
                                icon: <ArrowRight className="h-5 w-5 text-purple-600 mr-3" />,
                                content: "The advancement of education in safeguarding practice and the promotion of professional excellence, including the provision of training, resources, and professional development opportunities."
                            },
                            {
                                title: "Membership Framework",
                                icon: <ArrowRight className="h-5 w-5 text-purple-600 mr-3" />,
                                content: "Comprehensive provisions governing membership categories, rights and obligations, democratic participation, and the processes for admission, renewal, and termination of membership."
                            },
                            {
                                title: "Governance Structure",
                                icon: <ArrowRight className="h-5 w-5 text-purple-600 mr-3" />,
                                content: "Establishment of the Board of Trustees with defined powers, responsibilities, and procedures for appointment, including provisions for strategic oversight and fiduciary duties."
                            },
                            {
                                title: "Financial Stewardship",
                                icon: <ArrowRight className="h-5 w-5 text-purple-600 mr-3" />,
                                content: "Requirements for prudent financial management, including audit provisions, reserves policy, and restrictions on the use and application of company funds and assets."
                            },
                            {
                                title: "Amendment Procedures",
                                icon: <ArrowRight className="h-5 w-5 text-purple-600 mr-3" />,
                                content: "Formal processes for constitutional amendments requiring member consultation, trustee approval, and compliance with company law and regulatory requirements."
                            },
                            {
                                title: "Dissolution Safeguards",
                                icon: <ArrowRight className="h-5 w-5 text-purple-600 mr-3" />,
                                content: "Protective provisions ensuring proper distribution of assets to similar organizations in the event of dissolution, maintaining our purpose in perpetuity."
                            }
                        ].map((provision, index) => (
                            <div key={index} className="border border-slate-200 rounded-lg p-6 hover:border-slate-300 transition-colors">
                                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                                    {provision.icon} {provision.title}
                                </h3>
                                <p className="text-slate-700 text-sm leading-relaxed">{provision.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Legal Notice Section */}
            <section className="bg-slate-100 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white border border-slate-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">Legal Notice</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            These documents are provided for informational purposes. For official legal purposes, please refer to the documents filed with Companies House.
                            The Independent Federation for Safeguarding is a company limited by guarantee registered in England and Wales (Company No. 16491485).
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                        Join Our Constitutionally Governed Community
                    </h2>
                    <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
                        Become part of an organization built on strong governance principles, transparent accountability, and unwavering commitment to professional excellence.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={() => handleJoin('articles_association_cta')}
                            size="lg"
                            className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-semibold px-8 py-4 text-lg rounded-sm shadow-lg hover:shadow-xl transition-all"
                        >
                            Apply for Membership
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-8 py-4 text-lg rounded-sm"
                            asChild
                        >
                            <Link to={createPageUrl("Governance")}>Return to Governance</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
}
