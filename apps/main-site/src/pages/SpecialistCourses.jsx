
import React, { useState, useEffect } from 'react';
import { Button } from '@ifs/shared/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@ifs/shared/utils';
import { User } from '@ifs/shared/api/entities';
import { Course } from '@ifs/shared/api/entities';
import { ArrowRight, ShieldCheck, Briefcase, Building, CheckCircle2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import MainSiteNav from '../components/marketing/MainSiteNav';
import HeroBreadcrumbs from '../components/marketing/HeroBreadcrumbs';
import { usePostHog } from '@ifs/shared/components/providers/PostHogProvider';

export default function SpecialistCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedSections, setExpandedSections] = React.useState({
        cpdTraining: true,
        webinars: false,
        supervision: false,
        support: false
    });

    const { trackEvent } = usePostHog();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                // Assuming Course.getFeaturedListings('specialist') fetches specialist courses
                const fetchedCourses = await Course.getFeaturedListings('specialist');
                setCourses(fetchedCourses);
            } catch (error) {
                console.error("Failed to fetch specialist courses:", error);
                setCourses([]); // Set to empty array on error
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const toggleSection = (sectionKey) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionKey]: !prev[sectionKey]
        }));
    };

    const handleJoin = (location) => {
        trackEvent('join_button_clicked', {
            intent: 'associate',
            location: location || 'specialist_courses_page_hero',
            user_type: 'anonymous'
        });
        const url = createPageUrl('Onboarding') + '?intent=associate';
        User.loginWithRedirect(url);
    };

    const CourseCard = ({ course }) => (
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200 flex flex-col group overflow-hidden">
            <div className="relative">
                <div className="aspect-[4/3]">
                    <img
                        src={course.imageUrl || "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=400&auto=format&fit=crop"} // Added fallback image
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute top-4 right-4 bg-white/95 text-purple-800 text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
                    {course.level}
                </div>
                {course.accredited && (
                    <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                        CPD Accredited
                    </div>
                )}
            </div>
            <div className="flex flex-col flex-grow p-6">
                <div className="flex items-center gap-2 mb-3">
                    <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                        <span>{course.duration}</span>
                    </div>
                    <div className="text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full font-medium">
                        <span>Expert-Led</span>
                    </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-purple-700 transition-colors line-clamp-2">
                    {course.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3 flex-grow">
                    {course.description}
                </p>
                <div className="mb-5">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">Key Topics:</h4>
                    <div className="flex flex-wrap gap-1">
                        {(course.keyTopics || []).slice(0, 3).map((topic, index) => (
                            <span key={index} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                                {topic}
                            </span>
                        ))}
                        {(course.keyTopics || []).length > 3 && (
                            <span className="text-xs text-gray-500">+{course.keyTopics.length - 3} more</span>
                        )}
                    </div>
                </div>
                <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-bold text-purple-700">{course.price}</span>
                    </div>
                    <Button
                        onClick={() => handleJoin(`course_card_${course.id}`)}
                        className="bg-purple-700 hover:bg-purple-800 text-white w-full shadow-sm hover:shadow-md transition-all group-hover:bg-purple-800"
                    >
                        Book Now <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );

    const RoleBenefitCard = ({ icon, title, description, benefits }) => (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex items-center gap-4 mb-5">
                <div className="bg-purple-100 text-purple-700 p-3 rounded-xl">
                    {icon}
                </div>
                <h3 className="text-xl font-bold text-black">{title}</h3>
            </div>
            <p className="text-gray-600 mb-6 flex-grow">{description}</p>
            <div className="space-y-3 pt-4 border-t border-gray-100">
                {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2.5 shrink-0"></div>
                        <span className="text-gray-800">{benefit}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <>
            <section className="relative bg-gray-900 overflow-hidden" style={{ minHeight: '600px' }}>
                <div className="absolute inset-0 hidden lg:block">
                    <img
                        src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=2070&auto=format&fit=crop"
                        alt="Specialist training in mental health and safeguarding"
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
                            <HeroBreadcrumbs pageName="SpecialistCourses" />
                            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                                Specialist Training Courses
                            </h1>
                            <div className="text-lg lg:text-xl text-purple-100 mb-8 leading-relaxed space-y-4">
                                <p>
                                    Expert-level training for specialized safeguarding areas and complex situations.
                                </p>
                                <p className="hidden lg:block">
                                    Develop expertise in niche areas of safeguarding practice with our specialist courses designed for experienced professionals.
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
                                    onClick={() => handleJoin('specialist_courses_hero_desktop')}
                                    size="lg"
                                    variant="outline"
                                    className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-800 font-semibold px-8 py-3 text-base rounded-sm transition-all"
                                >
                                    Become a Member for Free
                                </Button>
                            </div>
                            <div className="mt-8 lg:hidden">
                                <Button
                                    onClick={() => handleJoin('specialist_courses_hero_mobile')}
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

            <section className="bg-white py-24">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-start">
                        <div>
                            <h2 className="text-4xl lg:text-5xl font-bold text-black leading-tight">
                                Navigate the most complex safeguarding challenges with confidence
                            </h2>
                        </div>
                        <div>
                            <p className="text-lg text-gray-600 leading-relaxed mb-8">
                                Our specialist courses address the evolving landscape of safeguarding risks, from digital exploitation to radicalisation. These intensive programmes are designed for professionals who need deep subject matter expertise to handle complex cases, lead specialist teams, or contribute to policy development in their field.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    onClick={() => handleJoin('specialist_courses_middle_section')}
                                    size="lg"
                                    className="bg-black hover:bg-gray-800 text-white font-semibold px-8 py-3 rounded-sm"
                                >
                                    Book Your Specialist Course
                                </Button>
                                <Button
                                    asChild
                                    size="lg"
                                    variant="outline"
                                    className="border-2 border-black text-black hover:bg-black hover:text-white font-semibold px-8 py-3 rounded-sm transition-all"
                                >
                                    <Link to={createPageUrl("Contact")}>Ask Our Experts</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-slate-50 py-24">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
                            Specialist Expertise for High-Risk Scenarios
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Our specialist courses are designed for professionals who need to develop deep expertise in specific areas of safeguarding practice.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                        <RoleBenefitCard
                            icon={<ShieldCheck className="w-6 h-6" />}
                            title="For Risk Specialists"
                            description="Professionals working directly with high-risk cases who need advanced assessment skills and intervention strategies."
                            benefits={[
                                "Advanced risk assessment",
                                "Specialist intervention techniques",
                                "Complex case management"
                            ]}
                        />
                        <RoleBenefitCard
                            icon={<Briefcase className="w-6 h-6" />}
                            title="For Policy Developers"
                            description="Those responsible for creating organisational policies and procedures that address emerging safeguarding risks."
                            benefits={[
                                "Evidence-based policy development",
                                "Understanding emerging threats",
                                "Legal compliance frameworks"
                            ]}
                        />
                        <RoleBenefitCard
                            icon={<Building className="w-6 h-6" />}
                            title="For Team Leaders"
                            description="Leaders of specialist safeguarding teams who need to guide their staff through the most challenging cases."
                            benefits={[
                                "Leading specialist teams",
                                "Supervising complex cases",
                                "Building specialist expertise"
                            ]}
                        />
                    </div>
                </div>
            </section>

            <section id="courses-section" className="bg-white py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
                            Our Specialist Courses
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Develop deep expertise in the most challenging aspects of safeguarding with our CPD-accredited specialist courses.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {loading ? (
                            <div className="col-span-full text-center py-10">
                                <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto" />
                                <p className="mt-4 text-gray-600">Loading courses...</p>
                            </div>
                        ) : (
                            courses.length > 0 ? (
                                courses.map(course => (
                                    <CourseCard key={course.id} course={course} />
                                ))) : (<p className="col-span-full text-center text-gray-600 py-10">No specialist courses available at the moment.</p>)
                        )}
                    </div>

                    <div className="text-center mt-12">
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="border-2 border-purple-800 text-purple-800 hover:bg-purple-800 hover:text-white font-semibold px-8 py-3 rounded-sm transition-all"
                        >
                            <Link to={createPageUrl("Training")}>
                                View All Training Courses <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            <section id="membership-tiers" className="bg-white py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
                            Unlock more with IfS Membership
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Enhance your professional development with exclusive member discounts on all our training courses. Find the perfect fit for your career stage.
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
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
                        <div className="bg-gray-50 border-t border-gray-200">
                            <div className="grid grid-cols-4">
                                <button onClick={() => toggleSection('cpdTraining')} className="p-4 border-r border-gray-200 bg-gray-100 text-left hover:bg-gray-200 transition-colors flex items-center justify-between w-full">
                                    <h4 className="font-bold text-black text-sm uppercase tracking-wider">Training & CPD</h4>
                                    {expandedSections.cpdTraining ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                                </button>
                                <div className="p-4 border-r border-gray-200"></div><div className="p-4 border-r border-gray-200"></div><div className="p-4"></div>
                            </div>
                        </div>
                        {expandedSections.cpdTraining && (
                            <>
                                <div className="grid grid-cols-4 border-t border-gray-200"><div className="p-4 border-r border-gray-200 bg-gray-50"><span className="text-sm text-gray-700">Training course discounts</span></div><div className="p-4 border-r border-gray-200 text-center"><span className="font-semibold text-black">5% discount</span></div><div className="p-4 border-r border-gray-200 text-center"><span className="font-semibold text-black">15% discount</span></div><div className="p-4 text-center"><span className="font-semibold text-black">30% discount</span></div></div>
                                <div className="grid grid-cols-4 border-t border-gray-200"><div className="p-4 border-r border-gray-200 bg-gray-50"><span className="text-sm text-gray-700">Monthly webinars</span></div><div className="p-4 border-r border-gray-200 text-center"><CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" /></div><div className="p-4 border-r border-gray-200 text-center"><CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" /></div><div className="p-4 text-center"><CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" /></div></div>
                                <div className="grid grid-cols-4 border-t border-gray-200"><div className="p-4 border-r border-gray-200 bg-gray-50"><span className="text-sm text-gray-700">Annual conference access</span></div><div className="p-4 border-r border-gray-200 text-center"><span className="text-gray-400">—</span></div><div className="p-4 border-r border-gray-200 text-center"><CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" /></div><div className="p-4 text-center"><CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" /></div></div>
                            </>
                        )}
                        <div className="grid grid-cols-4 border-t-2 border-gray-300 bg-slate-50">
                            <div className="p-4 border-r border-gray-200 bg-gray-100"><h4 className="font-bold text-black text-sm uppercase tracking-wider">Pricing</h4></div>
                            <div className="p-6 border-r border-gray-200 text-center"><p className="text-black">Free</p></div>
                            <div className="p-6 border-r border-gray-200 text-center bg-purple-50"><p className="text-black">£350 per year</p></div>
                            <div className="p-6 text-center"><p className="text-black">From £980</p></div>
                        </div>
                        <div className="grid grid-cols-4 border-t border-gray-200 bg-gray-50">
                            <div className="p-4 border-r border-gray-200"></div>
                            <div className="p-6 border-r border-gray-200 text-center">
                                <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-sm w-full">
                                    <Link to={createPageUrl("AssociateMembership")}>Join Free</Link>
                                </Button>
                            </div>
                            <div className="p-6 border-r border-gray-200 text-center bg-purple-50">
                                <Button asChild size="lg" className="bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-sm w-full">
                                    <Link to={createPageUrl("FullMembership")}>Become a Member</Link>
                                </Button>
                            </div>
                            <div className="p-6 text-center">
                                <Button asChild size="lg" variant="outline" className="border-gray-400 text-gray-800 hover:bg-gray-100 font-semibold rounded-sm w-full">
                                    <Link to={createPageUrl("CorporateMembership")}>Contact Us</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-gray-900 py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                        Master the complexities of modern safeguarding
                    </h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                        Develop the specialist knowledge and skills needed to address the most challenging aspects of safeguarding practice.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={() => handleJoin('specialist_courses_bottom_section')}
                            size="lg"
                            className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-semibold px-8 py-4 text-lg rounded-sm shadow-lg hover:shadow-xl transition-all"
                        >
                            Book Your Specialist Course
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-8 py-4 text-lg rounded-sm transition-all"
                            asChild
                        >
                            <Link to={createPageUrl("Contact")}>Speak to Our Training Team</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
}
