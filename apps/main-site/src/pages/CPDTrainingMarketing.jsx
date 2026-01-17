import React, { useState, useEffect } from 'react';
import { Button } from '@ifs/shared/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@ifs/shared/utils';
import { User } from '@ifs/shared/api/entities';
import { Course } from '@ifs/shared/api/entities'; // Updated import
import { Award, Clock, Users, CheckCircle2, Star, ArrowRight, Loader2 } from 'lucide-react';
import MainSiteNav from '../components/marketing/MainSiteNav';
import HeroBreadcrumbs from '../components/marketing/HeroBreadcrumbs';
import { usePostHog } from '@ifs/shared/components/providers/PostHogProvider';

export default function CPDTrainingMarketing() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const { trackEvent } = usePostHog();

    // Function to fetch courses from database
    const fetchCourses = async () => {
        try {
            setLoading(true);
            const fetchedCourses = await Course.list('-created_date', 4); // Get only 4 courses for one row
            setCourses(fetchedCourses);
        } catch (error) {
            console.error("Failed to fetch courses:", error);
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleJoin = (location) => {
        trackEvent('join_button_clicked', {
          intent: 'associate',
          location: location || 'cpd_training_page_hero',
          user_type: 'anonymous'
        });
        const path = createPageUrl('Onboarding') + '?intent=associate';
        customLoginWithRedirect(path);
    };

    // Course Card Component
    const CourseCard = ({ course }) => (
        <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col">
            <div className="aspect-[4/3] overflow-hidden">
                <img
                    src={course.imageUrl || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=400&auto=format&fit=crop'}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex-grow">
                    <h3 className="text-lg font-bold text-black mb-3">{course.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">
                        {course.description || course.overview}
                    </p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {course.duration && (
                            <span className="text-sm font-medium text-purple-600 flex items-center">
                                <Clock className="w-4 h-4 mr-1" /> {course.duration}
                            </span>
                        )}
                        {course.certification && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                                {course.certification}
                            </span>
                        )}
                    </div>
                    <Button asChild variant="ghost" size="sm" className="text-purple-600 hover:bg-purple-50">
                        <Link to={`${createPageUrl('TrainingCourseDetails')}?id=${course.id}`}>
                            View Details <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Hero Section */}
            <section className="relative bg-gray-900 overflow-hidden" style={{ minHeight: '600px' }}>
                <div className="absolute inset-0 hidden lg:block">
                    <img
                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2070&auto=format&fit=crop"
                        alt="Professional development training session with diverse participants"
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
                            <HeroBreadcrumbs pageName="CPDTrainingMarketing" />
                            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                                CPD Accredited Training
                            </h1>
                            <div className="text-lg lg:text-xl text-purple-100 mb-8 leading-relaxed space-y-4">
                                <p>
                                    Advance your career with our best-in-class, CPD-accredited training courses.
                                </p>
                                <p className="hidden lg:block">
                                    From foundational knowledge to advanced specialisms, our training is designed to build your expertise and confidence.
                                </p>
                            </div>
                            <div className="hidden lg:inline-flex items-center gap-4">
                                <Button
                                    onClick={() => {
                                        const coursesSection = document.getElementById('courses-section');
                                        if (coursesSection) {
                                            coursesSection.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }}
                                    size="lg"
                                    className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm"
                                >
                                    Explore Courses
                                </Button>
                                <Button
                                  onClick={() => handleJoin('cpd_training_hero_desktop')}
                                  size="lg"
                                  variant="outline"
                                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-800 font-semibold px-8 py-3 text-base rounded-sm transition-all"
                                >
                                  Become a Member for Free
                                </Button>
                            </div>
                            <div className="mt-8 lg:hidden">
                                <Button
                                    onClick={() => handleJoin('cpd_training_hero_mobile')}
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

            {/* Training Overview */}
            <section id="training-overview" className="bg-white py-24">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-start">
                        <div>
                            <h2 className="text-4xl lg:text-5xl font-bold text-black leading-tight">
                                Professional development that makes a difference
                            </h2>
                        </div>
                        <div>
                            <p className="text-lg text-gray-600 leading-relaxed mb-8">
                                Our training programme combines the latest research, statutory guidance, and real-world case studies to deliver practical skills you can apply immediately. All courses are CPD-accredited and designed to meet the diverse needs of safeguarding professionals across all sectors.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    onClick={() => handleJoin('training_overview_start_learning')}
                                    size="lg"
                                    className="bg-black hover:bg-gray-800 text-white font-semibold px-8 py-3 rounded-sm"
                                >
                                    Start Learning Today
                                </Button>
                                <Button
                                    asChild
                                    size="lg"
                                    variant="outline"
                                    className="border-2 border-black text-black hover:bg-black hover:text-white font-semibold px-8 py-3 rounded-sm transition-all"
                                >
                                    <Link to={createPageUrl("JoinUs")}>View Membership Options</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Courses Section - Updated to show only one row */}
            <section id="courses-section" className="bg-white py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
                            Explore our comprehensive training courses
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Browse our CPD-accredited courses designed for every stage of your professional journey.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
                        </div>
                    ) : courses.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {courses.map(course => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 text-lg mt-8">
                            No courses available at the moment. Please check back later!
                        </div>
                    )}

                    <div className="text-center mt-12">
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white font-semibold px-8 py-3 rounded-sm transition-all"
                        >
                            <Link to={createPageUrl('Training')}>View All Courses</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Training Features */}
            <section className="bg-slate-50 py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
                            Why choose IfS training?
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Award className="w-8 h-8 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-black mb-2">CPD Accredited</h3>
                            <p className="text-gray-600">All our courses are CPD accredited, ensuring you receive recognised professional development.</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-black mb-2">Expert Facilitators</h3>
                            <p className="text-gray-600">Learn from experienced practitioners and sector leaders with real-world expertise.</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Clock className="w-8 h-8 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-black mb-2">Flexible Delivery</h3>
                            <p className="text-gray-600">Online, in-person, and hybrid options to fit your schedule and learning preferences.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Membership Training Benefits Section */}
            <section className="bg-gradient-to-b from-white to-slate-50 py-24">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                            Save significantly on professional development
                        </h2>
                        <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                            IfS membership transforms your training investment. From instant discounts to free courses,
                            we make world-class professional development accessible and affordable.
                        </p>
                    </div>

                    <div className="max-w-6xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20">

                            {/* Associate Membership */}
                            <div className="relative">
                                <div className="text-center lg:text-left">
                                    <div className="inline-flex items-center gap-3 mb-6">
                                        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
                                            <Award className="w-7 h-7 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900">Associate Member</h3>
                                            <p className="text-emerald-600 font-medium">Free Forever</p>
                                        </div>
                                    </div>

                                    <div className="mb-8">
                                        <div className="flex items-baseline justify-center lg:justify-start gap-2 mb-2">
                                            <span className="text-6xl font-bold text-emerald-600">5%</span>
                                            <span className="text-2xl font-medium text-gray-600">off</span>
                                        </div>
                                        <p className="text-lg text-gray-700 font-medium">All CPD-accredited training courses</p>
                                        <p className="text-gray-500 mt-1">Discount applied automatically at checkout</p>
                                    </div>

                                    <div className="space-y-5 mb-10">
                                        <div className="flex items-start gap-4">
                                            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">Priority booking access</p>
                                                <p className="text-gray-600 text-sm">Reserve your spot before general availability</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">Member-only webinars</p>
                                                <p className="text-gray-600 text-sm">Exclusive monthly sessions with industry experts</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">Community access</p>
                                                <p className="text-gray-600 text-sm">Connect with 5,000+ safeguarding professionals</p>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => handleJoin('associate_member_cta')}
                                        size="lg"
                                        className="w-full lg:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-4 text-base rounded-lg shadow-lg hover:shadow-xl transition-all"
                                    >
                                        Start Free Membership
                                    </Button>
                                </div>
                            </div>

                            {/* Full Membership */}
                            <div className="relative">
                                {/* Best Value Badge */}
                                <div className="absolute -top-4 left-1/2 lg:left-8 transform -translate-x-1/2 lg:transform-none z-10">
                                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                                        BEST VALUE FOR TRAINING
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl p-8 lg:p-10 shadow-xl border border-purple-200 text-center lg:text-left mt-6">
                                    <div className="inline-flex items-center gap-3 mb-6">
                                        <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                                            <Star className="w-7 h-7 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900">Full Member</h3>
                                            <p className="text-purple-600 font-medium">£350 annually</p>
                                        </div>
                                    </div>

                                    <div className="mb-8">
                                        <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-4 mb-4">
                                            <div className="text-center lg:text-left">
                                                <div className="text-4xl font-bold text-purple-600">FREE</div>
                                                <p className="text-sm text-gray-600">Full-day course</p>
                                            </div>
                                            <div className="text-2xl font-light text-gray-400 hidden lg:block">+</div>
                                            <div className="text-center lg:text-left">
                                                <div className="text-4xl font-bold text-purple-600">15% OFF</div>
                                                <p className="text-sm text-gray-600">All additional training</p>
                                            </div>
                                        </div>
                                        <p className="text-gray-500 text-sm">Average annual savings: £800+</p>
                                    </div>

                                    <div className="space-y-5 mb-10">
                                        <div className="flex items-start gap-4">
                                            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">One free training course annually</p>
                                                <p className="text-gray-600 text-sm">Choose from our complete catalog of accredited courses</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">15% discount on all additional courses</p>
                                                <p className="text-gray-600 text-sm">Significant savings on masterclasses and specialist training</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">Complimentary Annual Conference ticket</p>
                                                <p className="text-gray-600 text-sm">£295 value included with membership</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">First access to new courses</p>
                                                <p className="text-gray-600 text-sm">Be the first to access cutting-edge training content</p>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => handleJoin('full_member_cta')}
                                        size="lg"
                                        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold px-8 py-4 text-base rounded-lg shadow-lg hover:shadow-xl transition-all"
                                    >
                                        Become a Full Member
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Bottom CTA */}
                        <div className="text-center mt-20">
                            <p className="text-lg text-gray-600 mb-6">
                                Join thousands of professionals who are advancing their careers with IfS training
                            </p>
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white font-semibold px-8 py-3 rounded-lg transition-all"
                            >
                                <Link to={createPageUrl("MembershipTiers")}>Compare All Membership Benefits</Link>
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
                        Ready to advance your expertise?
                    </h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                        Join thousands of safeguarding professionals who trust IfS for their professional development needs.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={() => handleJoin('bottom_cta_register')}
                            size="lg"
                            className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-semibold px-8 py-4 text-lg rounded-sm shadow-lg hover:shadow-xl transition-all"
                        >
                            Register as a Member
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-8 py-4 text-lg rounded-sm transition-all"
                            asChild
                        >
                            <Link to={createPageUrl("Contact")}>Speak to Our Team</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
}