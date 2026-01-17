
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from '@/api/entities';
import { Course } from '@/api/entities';
import { BookOpen, Award, Users, Clock, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'; // Added CheckCircle2
import MainSiteNav from '../components/marketing/MainSiteNav';
import HeroBreadcrumbs from '../components/marketing/HeroBreadcrumbs';
import MembershipTable from '../components/membership/MembershipTable';
import { usePostHog } from '../components/providers/PostHogProvider';

export default function IntroductoryCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const { trackEvent } = usePostHog();

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            try {
                const allCourses = await Course.list('-created_date');
                // Filter courses by a specific category for introductory courses
                // Assuming 'category' field on Course entity is 'Introduction to Safeguarding'
                const introductory = allCourses.filter(c => c.category === 'Introduction to Safeguarding');
                setCourses(introductory);
            } catch (error) {
                console.error("Failed to fetch introductory courses:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const handleJoin = (location) => {
        trackEvent('join_button_clicked', {
          intent: 'associate',
          location: location || 'introductory_courses_page_hero',
          user_type: 'anonymous'
        });
        const url = createPageUrl('Onboarding') + '?intent=associate';
        User.loginWithRedirect(url);
    };

    const handleBookCourse = () => {
        trackEvent('book_course_clicked_from_hero', {
          location: 'intro_courses_page'
        });
        const url = createPageUrl('Onboarding') + '?intent=associate';
        User.loginWithRedirect(url);
    };

    const CourseCard = ({ course }) => (
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200 flex flex-col group overflow-hidden">
            {/* Image Section */}
            <div className="relative">
                <div className="aspect-[4/3]">
                    <img
                        src={course.imageUrl || 'https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=400&auto=format&fit=crop'} // Fallback image
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/40 to-transparent"></div>
                {/* Hardcoded 'Introductory' for the level on this page */}
                <div className="absolute top-4 right-4 bg-white/95 text-purple-800 text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
                    Introductory
                </div>
                {/* Use course.certification instead of course.accredited */}
                {course.certification && (
                    <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                        {course.certification}
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="flex flex-col flex-grow p-6">
                <div className="flex items-center gap-2 mb-3">
                    {course.duration && (
                        <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                            <span>{course.duration}</span>
                        </div>
                    )}
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

                {/* Use course.objectives instead of course.keyTopics */}
                {course.objectives && course.objectives.length > 0 && (
                    <div className="mb-5">
                        <h4 className="font-semibold text-sm text-gray-800 mb-2">Learning Objectives:</h4>
                        <div className="flex flex-wrap gap-1">
                            {course.objectives.slice(0, 3).map((topic, index) => (
                                <span key={index} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                                    {topic}
                                </span>
                            ))}
                            {course.objectives.length > 3 && (
                                <span className="text-xs text-gray-500">+{course.objectives.length - 3} more</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Pricing and CTA */}
                <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-bold text-purple-700">£{course.price}</span>
                    </div>
                    <Button
                        onClick={() => handleJoin('course_card_book_now')}
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
            {/* Hero Section - Matching Homepage Design */}
            <section className="relative bg-gray-900 overflow-hidden" style={{ minHeight: '600px' }}>
                <div className="absolute inset-0 hidden lg:block">
                    <img 
                        src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop" 
                        alt="Professional learning new safeguarding skills"
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
                            <HeroBreadcrumbs pageName="IntroductoryCourses" />
                            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                                Foundation Safeguarding Training
                            </h1>
                            <div className="text-lg lg:text-xl text-purple-100 mb-8 leading-relaxed space-y-4">
                                <p>
                                    Essential training courses to build your safeguarding knowledge and confidence.
                                </p>
                                <p className="hidden lg:block">
                                    Perfect for newcomers to safeguarding or those seeking to refresh their foundational understanding with our comprehensive introductory courses.
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
                                    View Courses
                                </Button>
                                <Button
                                  onClick={() => handleJoin('introductory_courses_hero_desktop')}
                                  size="lg"
                                  variant="outline"
                                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-800 font-semibold px-8 py-3 text-base rounded-sm transition-all"
                                >
                                  Become a Member for Free
                                </Button>
                            </div>
                            <div className="mt-8 lg:hidden">
                                <Button
                                    onClick={() => handleJoin('introductory_courses_hero_mobile')}
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

            {/* Description Section */}
            <section className="bg-white py-24">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-start">
                        <div>
                            <h2 className="text-4xl lg:text-5xl font-bold text-black leading-tight">
                                Start your safeguarding journey with confidence
                            </h2>
                        </div>
                        <div>
                            <p className="text-lg text-gray-600 leading-relaxed mb-8">
                                Our introductory courses are specifically designed for professionals who are new to safeguarding roles, including newly appointed DSLs, deputy DSLs, governors, and HR professionals. These courses provide comprehensive foundation knowledge covering legal frameworks, statutory guidance, and essential practical skills.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button 
                                    onClick={() => handleJoin('description_section_book_course')}
                                    size="lg" 
                                    className="bg-black hover:bg-gray-800 text-white font-semibold px-8 py-3 rounded-sm"
                                >
                                    Book Your Course
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

            {/* Reimagined "Essential Training" Section */}
            <section className="bg-slate-50 py-24">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
                            Role-Specific Training for Immediate Impact
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Our introductory courses deliver targeted knowledge, ensuring every professional gains the precise skills needed for their unique responsibilities in safeguarding.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                        <RoleBenefitCard
                            icon={<BookOpen className="w-6 h-6" />}
                            title="For Safeguarding Leads"
                            description="Newly appointed DSLs and Deputies gain a comprehensive understanding of their statutory duties and leadership responsibilities."
                            benefits={[
                                "Mastering legal frameworks",
                                "Leading multi-agency working",
                                "Effective recognition & response"
                            ]}
                        />
                        <RoleBenefitCard
                            icon={<Award className="w-6 h-6" />}
                            title="For HR & Recruitment"
                            description="HR professionals learn to embed safeguarding into every stage of the employee lifecycle, from hiring to training."
                            benefits={[
                                "Executing safer recruitment",
                                "Best practice documentation",
                                "Ensuring staff compliance"
                            ]}
                        />
                        <RoleBenefitCard
                            icon={<Users className="w-6 h-6" />}
                            title="For Governors & Trustees"
                            description="Board members acquire the strategic oversight skills needed to ensure robust safeguarding governance and accountability."
                            benefits={[
                                "Fulfilling oversight duties",
                                "Understanding statutory guidance",
                                "Championing a culture of safety"
                            ]}
                        />
                    </div>
                </div>
            </section>
            
            {/* Courses Section */}
            <section id="courses-section" className="bg-white py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
                            Our Introductory Courses
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Choose from our range of expert-designed introductory courses, all CPD-accredited and delivered by experienced safeguarding professionals.
                        </p>
                    </div>

                    {loading ? (
                         <div className="flex justify-center items-center py-20">
                            <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {courses.map(course => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                        </div>
                    )}

                    {/* View All Training */}
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

            {/* Membership Tiers Section */}
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
                    
                    <MembershipTable 
                        includeCorporate={false}
                        initialExpandedSections={{
                            cpdTraining: true,
                            webinars: false,
                            supervision: false,
                            support: false,
                            recognition: false,
                            democracy: false
                        }}
                    />
                </div>
            </section>
            
            {/* CPD Hours & Member Discounts Explanation */}
            <section className="bg-gradient-to-br from-purple-50 to-blue-50 py-16">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl shadow-xl border border-purple-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-8 text-center">
                            <h2 className="text-3xl font-bold text-white mb-3">Save More as an IfS Member</h2>
                            <p className="text-lg text-purple-100">Unlock exclusive discounts and CPD hours with Full Membership</p>
                        </div>
                        
                        <div className="p-8">
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* CPD Hours Explanation */}
                                <div className="bg-amber-50 rounded-xl p-6 border-2 border-amber-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center">
                                            <Award className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">CPD Hours</h3>
                                    </div>
                                    <p className="text-gray-700 mb-4 leading-relaxed">
                                        <strong>Full Members</strong> receive <strong>1 free CPD hour every month</strong> – that's free training credit to invest in your professional development.
                                    </p>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-gray-700"><strong>Each CPD hour = £20 discount</strong> on any training course</p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-gray-700"><strong>Hours never expire</strong> – bank them up for larger courses</p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-gray-700"><strong>Use all at once or spread</strong> across multiple sessions</p>
                                        </div>
                                    </div>
                                </div>

                                {/* 10% Discount Explanation */}
                                <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                                            <Users className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">10% Member Discount</h3>
                                    </div>
                                    <p className="text-gray-700 mb-4 leading-relaxed">
                                        <strong>Full Members</strong> also receive an <strong>additional 10% discount</strong> on all training courses – on top of any CPD hours used.
                                    </p>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-gray-700"><strong>Applies to all courses</strong> – no restrictions</p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-gray-700"><strong>Stacks with CPD hours</strong> for maximum savings</p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-gray-700"><strong>Automatic at checkout</strong> – no codes needed</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Example Calculation */}
                            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                                <h4 className="text-lg font-bold text-gray-900 mb-4 text-center">Example: Full Member Savings</h4>
                                <div className="grid sm:grid-cols-3 gap-6 text-center">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Course Price</p>
                                        <p className="text-2xl font-bold text-gray-900">£300</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">With 5 CPD Hours + 10%</p>
                                        <p className="text-2xl font-bold text-green-600">£170</p>
                                        <p className="text-xs text-gray-500 mt-1">(£100 CPD + £30 discount)</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">You Save</p>
                                        <p className="text-2xl font-bold text-purple-600">£130</p>
                                        <p className="text-xs text-gray-500 mt-1">(43% off)</p>
                                    </div>
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="mt-8 text-center">
                                <Button
                                    onClick={() => handleJoin('cpd_explanation_section')}
                                    size="lg"
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-10 py-4 text-lg"
                                >
                                    Become a Full Member for £20/month
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                                <p className="text-sm text-gray-600 mt-3">Start saving on training immediately</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* CTA Section */}
            <section className="bg-gray-900 py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                        Start your safeguarding career with expert training
                    </h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                        Join thousands of professionals who have built their safeguarding expertise with IfS introductory training courses.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={() => handleJoin('cta_section_book_course')}
                            size="lg"
                            className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-semibold px-8 py-4 text-lg rounded-sm shadow-lg hover:shadow-xl transition-all"
                        >
                            Book Your Course Today
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
