
import React from 'react';
import { Button } from '@ifs/shared/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@ifs/shared/utils';
import { User } from '@ifs/shared/api/entities';
import { Vote, Users, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import MainSiteNav from '../components/marketing/MainSiteNav';
import HeroBreadcrumbs from '../components/marketing/HeroBreadcrumbs';
import { usePostHog } from '@ifs/shared/components/providers/PostHogProvider';

export default function TrusteeElections() {
    const { trackEvent } = usePostHog();

    const handleJoin = (location) => {
        trackEvent('join_button_clicked', {
          intent: 'associate',
          location: location || 'trustee_elections_page_hero',
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
                        src="https://images.unsplash.com/photo-1559523161-0fc0d8b38a7a?q=80&w=2070&auto=format&fit=crop"
                        alt="Democratic voting process and elections"
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
                            <HeroBreadcrumbs pageName="TrusteeElections" />
                            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                                Trustee Elections
                            </h1>
                            <div className="text-lg lg:text-xl text-purple-100 mb-8 leading-relaxed space-y-4">
                                <p>
                                    Participate in our democratic governance through trustee elections.
                                </p>
                                <p className="hidden lg:block">
                                    Full members can vote for and stand as trustees, helping shape the future direction of IfS and ensuring member voices are heard.
                                </p>
                            </div>
                            <div className="hidden lg:inline-flex items-center gap-4">
                                <Button
                                    onClick={() => {
                                        const electionsSection = document.getElementById('elections-info');
                                        if (electionsSection) {
                                            electionsSection.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }}
                                    size="lg"
                                    className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm"
                                >
                                    Election Info
                                </Button>
                                <Button
                                  onClick={() => handleJoin('trustee_elections_hero_desktop')}
                                  size="lg"
                                  variant="outline"
                                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-800 font-semibold px-8 py-3 text-base rounded-sm transition-all"
                                >
                                  Become a Member for Free
                                </Button>
                            </div>
                            <div className="mt-8 lg:hidden">
                                <Button
                                    onClick={() => handleJoin('trustee_elections_hero_mobile')}
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

            {/* Current Election Status */}
            <section id="elections-info" className="bg-white py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold text-black mb-6">
                            Election Status
                        </h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Stay informed about upcoming trustee elections at our Annual General Meeting
                        </p>
                    </div>

                    <div className="bg-slate-50 border-l-4 border-purple-600 rounded-r-lg p-8 mb-12">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Next Election at 2025 AGM</h3>
                                <p className="text-gray-600 mb-4">
                                    The next trustee election will take place at our Annual General Meeting in 2025. One third of trustee positions will be up for election, providing opportunities for new leadership to join our board.
                                </p>
                                <div className="text-sm text-gray-500">
                                    Expected AGM date: <strong>Spring 2025</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How Elections Work */}
            <section className="bg-slate-50 py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-black mb-6">
                            How Trustee Elections Work
                        </h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Our democratic election process ensures continuity and fresh perspectives on the board
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl font-bold text-purple-600">⅓</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Rotating Elections</h3>
                            <p className="text-gray-600 leading-relaxed">
                                At each Annual General Meeting, one third of trustee seats come up for election, ensuring board continuity while enabling regular renewal.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Users className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Open Nominations</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Any Full Member or Fellow in good standing may nominate themselves for candidacy to serve as a trustee.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Multiple Voting Options</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Members can vote in person at the AGM, online through our secure platform, or by proxy if unable to attend.
                            </p>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
                        <h3 className="text-xl font-semibold text-blue-900 mb-4">Annual General Meeting</h3>
                        <p className="text-blue-800 leading-relaxed">
                            Trustee elections are conducted as part of our Annual General Meeting, where members gather to review the year's achievements, approve financial reports, and participate in the democratic governance of the IfS. The AGM provides an opportunity for candidates to present their vision and for members to engage directly with the electoral process.
                        </p>
                    </div>
                </div>
            </section>

            {/* Eligibility and Requirements */}
            <section className="bg-white py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl lg:text-4xl font-bold text-black mb-12 text-center">
                        Eligibility Requirements
                    </h2>

                    <div className="grid md:grid-cols-2 gap-12">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Voting Eligibility</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-gray-900">Full Member or Fellow</p>
                                        <p className="text-gray-600 text-sm">Only Full Members and Fellows are eligible to vote in trustee elections</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-gray-900">Current Membership</p>
                                        <p className="text-gray-600 text-sm">Membership must be current and in good standing</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-gray-900">Multiple Voting Methods</p>
                                        <p className="text-gray-600 text-sm">Vote in person, online, or by proxy</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Candidacy Requirements</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-gray-900">Full Member or Fellow</p>
                                        <p className="text-gray-600 text-sm">Must hold Full Member or Fellow status to stand for election</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-gray-900">Self-Nomination</p>
                                        <p className="text-gray-600 text-sm">Candidates must nominate themselves during the nomination period</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-gray-900">Professional Standing</p>
                                        <p className="text-gray-600 text-sm">Demonstrated commitment to safeguarding excellence</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mt-12">
                        <h4 className="text-lg font-semibold text-amber-900 mb-3">Membership Upgrade</h4>
                        <p className="text-amber-800">
                            Associate Members interested in participating in trustee elections should consider upgrading to Full Membership or Fellowship to gain voting rights and candidacy eligibility.
                        </p>
                    </div>
                </div>
            </section>

            {/* Election Timeline */}
            <section className="bg-slate-50 py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl lg:text-4xl font-bold text-black mb-12 text-center">
                        Election Timeline
                    </h2>

                    <div className="space-y-6">
                        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-purple-600">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-purple-600 font-bold text-sm">1</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">AGM Announcement (8 weeks prior)</h3>
                                    <p className="text-gray-600">
                                        Formal notification sent to all members with AGM date, agenda, and trustee positions up for election
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-600">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-blue-600 font-bold text-sm">2</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nomination Period Opens (6 weeks prior)</h3>
                                    <p className="text-gray-600">
                                        Full Members and Fellows may submit their nominations along with candidate statements
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-600">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-green-600 font-bold text-sm">3</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nomination Period Closes (4 weeks prior)</h3>
                                    <p className="text-gray-600">
                                        Final date for nominations and candidate information published to members
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-orange-600">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-orange-600 font-bold text-sm">4</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Online Voting Opens (1 week prior)</h3>
                                    <p className="text-gray-600">
                                        Secure online voting platform opens for members unable to attend the AGM in person
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-red-600">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-red-600 font-bold text-sm">5</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Annual General Meeting</h3>
                                    <p className="text-gray-600">
                                        Elections conducted during AGM with results announced immediately following the vote count
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                        Shape the Future of Safeguarding
                    </h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                        Participate in our democratic governance process and help select the leaders who will guide the IfS forward.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={() => handleJoin('trustee_elections_cta_bottom')}
                            size="lg"
                            className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-semibold px-8 py-4 text-lg rounded-sm shadow-lg hover:shadow-xl transition-all"
                        >
                            Become a Member
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-8 py-4 text-lg rounded-sm transition-all"
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
