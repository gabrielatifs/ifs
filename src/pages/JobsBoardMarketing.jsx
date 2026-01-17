import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from '@/api/entities';
import { base44 } from '@/api/base44Client';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, Briefcase, MapPin, Clock, Loader2, Building2, Star } from 'lucide-react';
import MainSiteNav from '../components/marketing/MainSiteNav';
import HeroBreadcrumbs from '../components/marketing/HeroBreadcrumbs';
import { usePostHog } from '../components/providers/PostHogProvider';

export default function JobsBoardMarketing() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null); // Added user state
    const { trackEvent } = usePostHog();

    useEffect(() => {
        const checkUser = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
            } catch (error) {
                // If there's an error (e.g., user not logged in), set user to null
                setUser(null);
            }
        };
        checkUser();
    }, []);

    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            try {
                // Fetch the 8 most recently created, active jobs
                const recentJobs = await base44.entities.Job.filter({ status: 'Active' }, '-created_date', 8);
                
                // Filter out jobs with expired application deadlines
                const now = new Date();
                const activeJobs = recentJobs.filter(job => {
                    if (!job.applicationDeadline) return true; // If no deadline, it's considered active
                    const deadline = new Date(job.applicationDeadline);
                    return deadline >= now;
                });
                
                // Take first 4 active jobs
                const jobsToShow = activeJobs.slice(0, 4);
                
                const formattedJobs = jobsToShow.map(job => ({
                    id: job.id,
                    title: job.title,
                    company: job.companyName,
                    location: job.location,
                    postedDate: formatDistanceToNow(new Date(job.created_date), { addSuffix: true }),
                    type: job.contractType
                }));

                setJobs(formattedJobs);
            } catch (error) {
                console.error("Failed to fetch featured jobs:", error);
                setJobs([]); // Ensure jobs is an empty array on error
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    const handleJoin = (location) => {
        trackEvent('join_button_clicked', {
            intent: 'associate',
            location: location || 'jobs_board_page_general', // Default location if not provided
            user_type: user ? 'logged_in' : 'anonymous'
        });
        const url = createPageUrl('Onboarding') + '?intent=associate';
        User.loginWithRedirect(url);
    };

    const handleLogin = () => {
        User.loginWithRedirect(createPageUrl('JobsBoard'));
    };

    return (
        <>
            {/* Hero Section */}
            <section className="relative bg-gray-900 overflow-hidden" style={{ minHeight: '600px' }}>
                <div className="absolute inset-0 hidden lg:block">
                    <img
                        src="https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2069&auto=format&fit=crop"
                        alt="Professionals collaborating around a board with sticky notes"
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
                </div>

                <MainSiteNav />

                <div className="relative z-10 max-w-screen-xl mx-auto">
                    <div className="grid lg:grid-cols-2 items-center min-h-[600px]">
                        <div className="px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center lg:text-left">
                            <HeroBreadcrumbs pageName="JobsBoardMarketing" />
                            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                                Safeguarding Jobs Board
                            </h1>
                            <div className="text-lg lg:text-xl text-purple-100 mb-8 leading-relaxed space-y-4">
                                <p>
                                    Find your next career move with our comprehensive safeguarding jobs board.
                                </p>
                                <p className="hidden lg:block">
                                    Discover exclusive opportunities across all sectors and experience levels, from entry-level to senior leadership roles.
                                </p>
                            </div>
                            <div className="hidden lg:inline-flex items-center gap-4">
                                <Button
                                    asChild
                                    size="lg"
                                    className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm"
                                >
                                    <Link to={createPageUrl('Jobs')}>
                                        Browse Jobs
                                    </Link>
                                </Button>
                                <Button
                                    onClick={() => handleJoin('jobs_board_hero_desktop')}
                                    size="lg"
                                    variant="outline"
                                    className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-800 font-semibold px-8 py-3 text-base rounded-sm transition-all"
                                >
                                    Become a Member for Free
                                </Button>
                            </div>
                            <div className="mt-8 lg:hidden"> {/* Mobile CTA */}
                                <Button
                                    onClick={() => handleJoin('jobs_board_hero_mobile')}
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

            {/* About Section */}
            <section className="bg-white py-24">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl lg:text-5xl font-bold text-black leading-tight">
                                Your Hub for Premier Safeguarding Roles
                            </h2>
                        </div>
                        <div>
                            <p className="text-lg text-gray-600 leading-relaxed mb-8">
                                The IfS Jobs Board is more than just a listing service; it's a dedicated career platform for the safeguarding community. We partner with schools, charities, healthcare providers, and leading organisations to bring you roles that match your expertise and passion for protecting others.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button onClick={() => handleJoin('jobs_board_about_section')} size="lg" className="bg-black hover:bg-gray-800 text-white font-semibold px-8 py-3 rounded-sm">
                                    Become a Member
                                </Button>
                                <Button onClick={handleLogin} size="lg" variant="outline" className="border-2 border-black text-black hover:bg-black hover:text-white font-semibold px-8 py-3 rounded-sm transition-all">
                                    Member Login
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Use Our Jobs Board Section */}
            <section id="jobs-section" className="bg-slate-50 py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
                            The IfS Advantage
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Find your next role with confidence on a platform built for and by safeguarding professionals.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
                            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                                <Star className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-black mb-3">Curated Roles</h3>
                            <p className="text-gray-600">Every posting is relevant to safeguarding professionals, from entry-level to executive leadership. No more sifting through irrelevant listings.</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
                            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                                <Building2 className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-black mb-3">Top Employers</h3>
                            <p className="text-gray-600">We partner with organisations that value safeguarding, ensuring you find a workplace that shares your commitment to high standards.</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
                            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                                <Briefcase className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-black mb-3">Career Growth</h3>
                            <p className="text-gray-600">Access roles that offer clear progression paths and opportunities to expand your skills and influence within the sector.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Jobs Preview */}
            <section className="bg-white py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
                            Featured Opportunities
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Here's a glimpse of the high-calibre roles available to our members right now.
                        </p>
                    </div>
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                            <p className="ml-3 text-lg text-gray-600">Loading jobs...</p>
                        </div>
                    ) : (
                        <div className="space-y-4 max-w-4xl mx-auto">
                            {jobs.length > 0 ? (
                                jobs.map((job) => (
                                    <div key={job.id} className="bg-white rounded-xl p-6 border-2 border-gray-100 shadow-md hover:border-purple-200 transition-all">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                            <div>
                                                <h3 className="text-xl font-bold text-purple-800 hover:text-purple-900 transition-colors">
                                                    <Link to={createPageUrl(`JobDetailsPublic?id=${job.id}`)}>{job.title}</Link>
                                                </h3>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-gray-600 mt-2">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="w-4 h-4" />
                                                        <span>{job.company}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>{job.location}</span>
                                                    </div>
                                                    {job.postedDate && (
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-4 h-4" />
                                                            <span>{job.postedDate}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-4 sm:mt-0">
                                                <Button asChild variant="outline" className="bg-gray-100 hover:bg-gray-200">
                                                    <Link to={createPageUrl(`JobDetailsPublic?id=${job.id}`)}>
                                                        View Details
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-lg text-gray-600">No featured jobs found at the moment. Please check back later!</p>
                            )}
                        </div>
                    )}
                    <div className="text-center mt-12">
                        <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 rounded-sm">
                            <Link to={createPageUrl('Jobs')}>
                                Access Dozens More Listings <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-20 relative">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
                    <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                        Ready to Find Your Next Role?
                    </h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                        Become an IfS member today to gain full access to our jobs board, apply for exclusive roles, and take the next step in your safeguarding career.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={() => handleJoin('jobs_board_final_cta')}
                            size="lg"
                            className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-semibold px-8 py-4 text-lg rounded-sm shadow-lg hover:shadow-xl transition-all"
                        >
                            Become a Member
                        </Button>
                        <Button
                            onClick={handleLogin}
                            size="lg"
                            variant="outline"
                            className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-8 py-4 text-lg rounded-sm transition-all"
                        >
                            Member Login
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
}