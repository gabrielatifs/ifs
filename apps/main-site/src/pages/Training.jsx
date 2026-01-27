import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Button } from '@ifs/shared/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@ifs/shared/utils';
import { User } from '@ifs/shared/api/entities';
import { customLoginWithRedirect } from '../components/utils/auth';
import { Course } from '@ifs/shared/api/entities';
import { CourseVariant } from '@ifs/shared/api/entities';
import { CourseDate } from '@ifs/shared/api/entities';
import { ArrowRight, Clock, Award, BookOpen, Search, Loader2, MapPin, Calendar, CheckCircle2, Users, Sparkles, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardContent } from "@ifs/shared/components/ui/card";
import { Badge } from "@ifs/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ifs/shared/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@ifs/shared/components/ui/collapsible";
import MainSiteNav from '../components/marketing/MainSiteNav';
import HeroBreadcrumbs from '../components/marketing/HeroBreadcrumbs';
import { usePostHog } from '@ifs/shared/components/providers/PostHogProvider';
import { format, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';

const COURSES_PER_PAGE = 8;

const uiCategories = [
    { id: 'introductory', name: 'Foundation' },
    { id: 'advanced', name: 'Advanced' },
    { id: 'refresher', name: 'Refresher' },
    { id: 'specialist', name: 'Short & Specialist' }
];

const SessionListItem = React.memo(({ course, session }) => {
    const sessionDate = new Date(session.date);
    const price = (course.cpdHours || 0) * 20;
    
    return (
        <div className="group hover:bg-slate-50 transition-colors px-6 py-6 border-b border-slate-200 last:border-b-0">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                {/* Date Column - Compact on mobile */}
                <div className="flex items-center gap-4 lg:flex-col lg:items-center lg:text-center lg:min-w-[80px]">
                    <div className="flex flex-col items-center text-center lg:w-full">
                        <span className="text-xs lg:text-sm font-bold text-purple-600 uppercase">
                            {format(sessionDate, 'MMM')}
                        </span>
                        <span className="text-3xl lg:text-4xl font-bold text-slate-900 leading-none">
                            {format(sessionDate, 'd')}
                        </span>
                        <span className="text-xs lg:text-sm text-slate-500">
                            {format(sessionDate, 'yyyy')}
                        </span>
                    </div>
                    {/* Mobile Price */}
                    <div className="lg:hidden ml-auto">
                        <div className="text-right">
                            <div className="text-2xl font-bold text-slate-900">
                                £{price}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Session Details */}
                <div className="flex-1 min-w-0">
                    <Link 
                        to={`${createPageUrl('TrainingCourseDetails')}?id=${course.id}`}
                        className="block group/link"
                    >
                        <h3 className="text-lg lg:text-xl font-bold text-slate-900 mb-2 lg:mb-3 group-hover/link:text-purple-700 transition-colors">
                            {course.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 lg:gap-4 text-xs lg:text-sm text-slate-600">
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-slate-400" />
                                <span>{session.startTime}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-slate-400" />
                                <span>{session.location}</span>
                            </div>
                            {course.cpdHours > 0 && (
                                <div className="flex items-center gap-1.5 bg-purple-50 px-2 py-1 rounded">
                                    <Sparkles className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-purple-600" />
                                    <span className="font-semibold text-purple-700">
                                        {course.cpdHours} CPD hours
                                    </span>
                                </div>
                            )}
                        </div>
                    </Link>
                </div>

                {/* Desktop Pricing */}
                <div className="hidden lg:block text-right min-w-[140px]">
                    <div className="text-3xl font-bold text-slate-900">
                        £{price}
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-1">
                        Standard price
                    </div>
                </div>
            </div>
        </div>
    );
});

SessionListItem.displayName = 'SessionListItem';

const CourseCard = React.memo(({ course, variants }) => {
    const courseVariants = useMemo(() => 
        variants.filter(v => v.courseId === course.id), 
        [variants, course.id]
    );
    const hasVariants = courseVariants.length > 0;
    
    const displayPrice = useMemo(() => {
        // Calculate price based on CPD hours: £20 per CPD hour
        const calculatedPrice = (course.cpdHours || 0) * 20;
        
        if (hasVariants) {
            const prices = courseVariants.map(v => {
                const variantCpdHours = v.cpdHours || course.cpdHours || 0;
                return variantCpdHours * 20;
            }).filter(p => p > 0);
            if (prices.length === 0) return calculatedPrice > 0 ? calculatedPrice.toFixed(0) : 'N/A';
            const minPrice = Math.min(...prices);
            return prices.length > 1 ? `${minPrice.toFixed(0)}+` : minPrice.toFixed(0);
        }
        return calculatedPrice > 0 ? calculatedPrice.toFixed(0) : 'N/A';
    }, [hasVariants, courseVariants, course.cpdHours]);

    const displayDuration = useMemo(() => {
        if (hasVariants) {
            const durations = [...new Set(courseVariants.map(v => v.duration).filter(d => d))];
            return durations.length === 1 ? durations[0] : '';
        }
        return course.duration || '';
    }, [hasVariants, courseVariants, course.duration]);

    return (
        <Card className="flex flex-col group overflow-hidden border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 rounded-xl h-full">
            <CardContent className="p-4 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-purple-700">{course.level}</p>
                    <div className="flex items-center gap-2">
                        {displayDuration && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>{displayDuration}</span>
                            </div>
                        )}
                        {course.certification && (
                            <Badge className="bg-green-500 text-white font-bold flex items-center gap-1 shadow-lg text-xs">
                                <Award className="w-3 h-3" />
                                CPD
                            </Badge>
                        )}
                    </div>
                </div>

                {course.tags && course.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                        {course.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                                {tag}
                            </Badge>
                        ))}
                        {course.tags.length > 2 && (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                                +{course.tags.length - 2}
                            </Badge>
                        )}
                    </div>
                )}

                <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug group-hover:text-purple-700 transition-colors line-clamp-2">
                    {course.title}
                </h3>
                
                <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-3 flex-grow">
                    {course.description || course.overview}
                </p>

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                    <span className="text-xl font-bold text-purple-700">£{displayPrice}</span>
                    <Button
                        asChild
                        size="sm"
                        className="bg-purple-700 hover:bg-purple-800 text-white text-xs px-3 py-2"
                    >
                        <Link to={`${createPageUrl('TrainingCourseDetails')}?id=${course.id}`}>
                            View Details
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
});

CourseCard.displayName = 'CourseCard';

export default function Training() {
    const location = useLocation();
    const { trackEvent } = usePostHog();

    const [courses, setCourses] = useState([]);
    const [variants, setVariants] = useState([]);
    const [featuredCourses, setFeaturedCourses] = useState([]);
    const [loadingFeatured, setLoadingFeatured] = useState(true);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('introductory');
    const [searchTerm, setSearchTerm] = useState('');
    const [displayCount, setDisplayCount] = useState(COURSES_PER_PAGE);
    const [activeTab, setActiveTab] = useState('upcoming');
    const [upcomingByMonth, setUpcomingByMonth] = useState({});
    const [openMonths, setOpenMonths] = useState({});
    const [monthVisibleCounts, setMonthVisibleCounts] = useState({});

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const category = params.get('category');
        if (category && uiCategories.some(cat => cat.id === category)) {
            setSelectedCategory(category);
        }
    }, [location.search]);

    useEffect(() => {
        let isMounted = true;
        
        const fetchFeaturedCourses = async () => {
            setLoadingFeatured(true);
            try {
                const allDates = await CourseDate.filter({ status: 'Available' }, 'date', 100);
                
                if (isMounted && allDates && allDates.length > 0) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    const upcomingDates = allDates.filter(date => {
                        const eventDate = new Date(date.date);
                        return eventDate >= today;
                    });

                    if (upcomingDates.length > 0) {
                        // Group by month for the expandable view
                        const byMonth = {};
                        const firstMonthOpen = {};
                        
                        for (const date of upcomingDates) {
                            const monthKey = format(new Date(date.date), 'yyyy-MM');
                            if (!byMonth[monthKey]) {
                                byMonth[monthKey] = [];
                                if (Object.keys(firstMonthOpen).length === 0) {
                                    firstMonthOpen[monthKey] = true;
                                }
                            }
                            byMonth[monthKey].push(date);
                        }
                        
                        // Fetch course details for each date
                        const courseIds = [...new Set(upcomingDates.map(d => d.courseId))];
                        const coursesPromises = courseIds.map(id => Course.get(id));
                        const fetchedCourses = await Promise.all(coursesPromises);
                        const coursesMap = {};
                        fetchedCourses.filter(Boolean).forEach(c => coursesMap[c.id] = c);
                        
                        // Attach course data to each date
                        Object.keys(byMonth).forEach(monthKey => {
                            byMonth[monthKey] = byMonth[monthKey].map(date => ({
                                ...date,
                                course: coursesMap[date.courseId]
                            })).filter(d => d.course);
                        });
                        
                        if (isMounted) {
                            setUpcomingByMonth(byMonth);
                            setOpenMonths(firstMonthOpen);
                            
                            // Set featured courses (first 3)
                            const firstThree = upcomingDates.slice(0, 3).map(date => ({
                                course: coursesMap[date.courseId],
                                nextDate: date
                            })).filter(item => item.course);
                            
                            setFeaturedCourses(firstThree);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch featured courses:", error);
            } finally {
                if (isMounted) {
                    setLoadingFeatured(false);
                }
            }
        };

        fetchFeaturedCourses();
        
        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        let isMounted = true;
        
        const fetchData = async () => {
            setLoading(true);
            try {
                const categoryLevel = uiCategories.find(cat => cat.id === selectedCategory)?.name;
                
                const [fetchedCourses, fetchedVariants] = await Promise.all([
                    Course.filter({ level: categoryLevel }, '-created_date', 50),
                    CourseVariant.list('-created_date', 200)
                ]);
                
                if (isMounted) {
                    setCourses(fetchedCourses || []);
                    setVariants(fetchedVariants || []);
                    setDisplayCount(COURSES_PER_PAGE);
                }
            } catch (error) {
                console.error("Failed to fetch courses:", error);
                if (isMounted) {
                    setCourses([]);
                    setVariants([]);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();
        
        return () => {
            isMounted = false;
        };
    }, [selectedCategory]);

    const filteredCourses = useMemo(() => {
        if (!searchTerm) return courses;
        
        const searchLower = searchTerm.toLowerCase();
        return courses.filter(course => {
            return (
                course.title?.toLowerCase().includes(searchLower) ||
                course.description?.toLowerCase().includes(searchLower) ||
                course.overview?.toLowerCase().includes(searchLower) ||
                course.tags?.some(tag => tag.toLowerCase().includes(searchLower))
            );
        });
    }, [courses, searchTerm]);

    const displayedCourses = useMemo(() => 
        filteredCourses.slice(0, displayCount), 
        [filteredCourses, displayCount]
    );
    
    const hasMore = displayCount < filteredCourses.length;

    const handleJoin = useCallback((clickLocation) => {
        trackEvent('join_button_clicked', {
            intent: 'associate',
            location: clickLocation || 'training_page_hero',
            user_type: 'anonymous'
        });
        const path = createPageUrl('Onboarding') + '?intent=associate';
        customLoginWithRedirect(path);
    }, [trackEvent]);

    const handleLoadMore = useCallback(() => {
        setDisplayCount(prev => prev + COURSES_PER_PAGE);
    }, []);

    return (
        <>
            <div className="lg:hidden">
                <MainSiteNav variant="solid-mobile" />
            </div>

            <section className="relative bg-gray-900 overflow-hidden hidden lg:block" style={{ minHeight: '600px' }}>
                <div className="absolute inset-0">
                    <img 
                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2070&auto=format&fit=crop" 
                        alt="Professional training"
                        className="w-full h-full object-cover"
                        style={{ filter: 'grayscale(100%) contrast(1.1)' }}
                    />
                </div>
                <div 
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to right, #5e028f 45%, rgba(94, 2, 143, 0.2) 65%, transparent 100%)' }}
                />

                <MainSiteNav />

                <div className="relative z-10 max-w-screen-xl mx-auto">
                    <div className="grid lg:grid-cols-2 items-center min-h-[600px]">
                        <div className="px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
                            <HeroBreadcrumbs pageName="Training" />
                            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                                Expert Training for Safeguarding Excellence
                            </h1>
                            <p className="text-lg lg:text-xl text-purple-100 mb-8 leading-relaxed">
                                Advance your safeguarding expertise with our comprehensive, CPD-accredited training portfolio.
                            </p>
                            <div className="hidden lg:inline-flex items-center gap-4">
                                <Button
                                    onClick={() => document.getElementById('course-search')?.scrollIntoView({ behavior: 'smooth' })}
                                    size="lg"
                                    className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3"
                                >
                                    Browse Courses
                                </Button>
                                <Button
                                    onClick={() => handleJoin('training_hero')}
                                    size="lg"
                                    variant="outline"
                                    className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-800 font-semibold px-8 py-3"
                                >
                                    Become a Member
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="bg-slate-50 min-h-screen">
                {!loadingFeatured && (
                    <section className="bg-white py-12 lg:py-16">
                        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <div className="mb-8 border-b border-slate-200 -mx-4 sm:mx-0">
                                    <div className="flex gap-0 px-4 sm:px-0">
                                        <button
                                            onClick={() => setActiveTab('upcoming')}
                                            className={`px-4 sm:px-6 py-3 font-semibold text-sm sm:text-base border-b-3 transition-all ${
                                                activeTab === 'upcoming'
                                                    ? 'border-purple-600 text-purple-600'
                                                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                                            }`}
                                        >
                                            Upcoming Sessions
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('catalogue')}
                                            className={`px-4 sm:px-6 py-3 font-semibold text-sm sm:text-base border-b-3 transition-all ${
                                                activeTab === 'catalogue'
                                                    ? 'border-purple-600 text-purple-600'
                                                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                                            }`}
                                        >
                                            Course Catalogue
                                        </button>
                                    </div>
                                </div>

                                <TabsContent value="upcoming" className="mt-6">
                                    <div className="text-center mb-8 lg:mb-12">
                                        <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-3">
                                            Upcoming Training Sessions
                                        </h2>
                                        <p className="text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                                            Book your place on upcoming courses, organized by month
                                        </p>
                                    </div>

                                    {Object.keys(upcomingByMonth).length > 0 ? (
                                        <div className="space-y-6">
                                            {Object.keys(upcomingByMonth).sort().map((monthKey) => {
                                                const monthDate = new Date(monthKey + '-01');
                                                const sessions = upcomingByMonth[monthKey];
                                                const visibleCount = monthVisibleCounts[monthKey] || 3;
                                                const hasMore = sessions.length > visibleCount;
                                                const visibleSessions = sessions.slice(0, visibleCount);
                                                
                                                return (
                                                    <div key={monthKey} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                                        <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-200">
                                                            <h3 className="text-xl lg:text-2xl font-bold text-slate-900">
                                                                {format(monthDate, 'MMMM yyyy')}
                                                            </h3>
                                                            <p className="text-sm text-slate-600 mt-0.5">
                                                                {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'} available
                                                            </p>
                                                        </div>
                                                        
                                                        <div>
                                                            {visibleSessions.map(session => (
                                                                <SessionListItem 
                                                                    key={`${session.courseId}-${session.date}`} 
                                                                    course={session.course} 
                                                                    session={session} 
                                                                />
                                                            ))}
                                                        </div>
                                                        
                                                        {hasMore && (
                                                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                                                                <button
                                                                    onClick={() => setMonthVisibleCounts(prev => ({
                                                                        ...prev,
                                                                        [monthKey]: visibleCount + 3
                                                                    }))}
                                                                    className="w-full sm:w-auto mx-auto block text-purple-600 hover:text-purple-700 hover:bg-purple-50 font-semibold text-sm px-4 py-2 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
                                                                >
                                                                    Show {Math.min(3, sessions.length - visibleCount)} more {sessions.length - visibleCount === 1 ? 'session' : 'sessions'}
                                                                    <ChevronDown className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                                            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-xl font-bold text-gray-700 mb-2">No upcoming sessions</h3>
                                            <p className="text-gray-500">Check back soon for new training dates</p>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="catalogue" className="mt-6">
                                    <div className="space-y-8">
                                        <div id="course-search">
                                            <div className="text-center mb-6 lg:mb-10">
                                                <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-3">
                                                    Course Catalogue
                                                </h2>
                                                <p className="text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                                                    Explore our full range of CPD-accredited safeguarding training
                                                </p>
                                            </div>

                                            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100 mb-8">
                                                <div className="mb-4 lg:mb-6">
                                                    <div className="relative max-w-2xl mx-auto">
                                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                        <input
                                                            type="text"
                                                            placeholder="Search courses..."
                                                            value={searchTerm}
                                                            onChange={(e) => setSearchTerm(e.target.value)}
                                                            className="w-full pl-12 pr-4 py-3 lg:py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap justify-center gap-2 mb-4">
                                                    {uiCategories.map(category => (
                                                        <button
                                                            key={category.id}
                                                            onClick={() => setSelectedCategory(category.id)}
                                                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                                                selectedCategory === category.id
                                                                    ? 'bg-purple-700 text-white shadow-md'
                                                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            {category.name}
                                                        </button>
                                                    ))}
                                                </div>

                                                <div className="pt-4 border-t border-gray-200 text-center">
                                                    <p className="text-gray-700">
                                                        <span className="font-bold text-gray-900">{filteredCourses.length}</span> 
                                                        {' '}{filteredCourses.length === 1 ? 'course' : 'courses'}
                                                        {searchTerm && <span> for "{searchTerm}"</span>}
                                                    </p>
                                                    {searchTerm && (
                                                        <button
                                                            onClick={() => setSearchTerm('')}
                                                            className="mt-2 text-purple-700 hover:text-purple-900 font-semibold underline text-sm"
                                                        >
                                                            Clear search
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {loading ? (
                                            <div className="flex justify-center items-center py-12">
                                                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                                            </div>
                                        ) : filteredCourses.length > 0 ? (
                                            <>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                                                    {displayedCourses.map(course => (
                                                        <CourseCard key={course.id} course={course} variants={variants} />
                                                    ))}
                                                </div>
                                                
                                                {hasMore && (
                                                    <div className="flex justify-center mt-8">
                                                        <Button
                                                            onClick={handleLoadMore}
                                                            variant="outline"
                                                            className="px-8 py-3"
                                                        >
                                                            Load More Courses
                                                        </Button>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-center py-12 bg-white rounded-xl border border-gray-100 max-w-md mx-auto">
                                                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                                <h3 className="text-xl font-bold text-gray-700 mb-2">No courses found</h3>
                                                <p className="text-gray-500 mb-6">
                                                    {searchTerm ? `No courses match "${searchTerm}"` : "No courses available"}
                                                </p>
                                                {searchTerm && (
                                                    <Button
                                                        onClick={() => setSearchTerm('')}
                                                        className="bg-purple-700 hover:bg-purple-800 text-white"
                                                    >
                                                        Clear Search
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </section>
                )}



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
                                    <div className="bg-amber-50 rounded-xl p-6 border-2 border-amber-200">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center">
                                                <Sparkles className="w-6 h-6 text-white" />
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

                                    <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                                                <Award className="w-6 h-6 text-white" />
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

                <section className="bg-white py-12 lg:py-16">
                    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-8 lg:mb-12">
                            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                                Why Choose IfS Training?
                            </h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <Award className="w-8 h-8 text-purple-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">CPD Accredited</h3>
                                <p className="text-gray-600">Recognised professional development hours.</p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <MapPin className="w-8 h-8 text-purple-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Flexible Delivery</h3>
                                <p className="text-gray-600">Online and in-person options available.</p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <BookOpen className="w-8 h-8 text-purple-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Practical Focus</h3>
                                <p className="text-gray-600">Tools you can implement immediately.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}