import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CourseDate } from '@ifs/shared/api/entities';
import { Course } from '@ifs/shared/api/entities';
import { CourseVariant } from '@ifs/shared/api/entities';
import { User } from '@ifs/shared/api/entities';
import { Organisation } from '@ifs/shared/api/entities';
import { createPageUrl } from '@ifs/shared/utils';
import { createCheckout } from '@ifs/shared/api/functions';
import { Loader2, ArrowRight, MapPin, ShieldCheck, TrendingUp, Puzzle, RefreshCw, Calendar, Clock, ChevronLeft, X, Coins, Crown, Award, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import PortalSidebar from '@/components/portal/PortalSidebar';
import PortalHeader from '@/components/portal/PortalHeader';
import { useUser } from '@ifs/shared/components/providers/UserProvider';
import { Badge } from "@ifs/shared/components/ui/badge";
import { Button } from "@ifs/shared/components/ui/button";
import { Card, CardContent } from "@ifs/shared/components/ui/card";
import PortalBottomNav from '@/components/portal/PortalBottomNav';
import { format } from 'date-fns';
import { useToast } from "@ifs/shared/components/ui/use-toast";
import { Toaster } from "@ifs/shared/components/ui/toaster";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ifs/shared/components/ui/tabs";

const FeaturedCourseCard = ({ course, nextDate, user, userOrganisation }) => {
    const pricingInfo = useMemo(() => {
        const isFullMember = user?.membershipStatus === 'active' && (user?.membershipType === 'Full' || user?.membershipType === 'Fellow');
        const hasOrgMembership = userOrganisation?.hasOrganisationalMembership && userOrganisation?.orgMembershipStatus === 'active';
        
        // Calculate base price from CPD hours
        const cpdHours = course.cpdHours || 0;
        const basePrice = cpdHours * 20; // £20 per CPD hour
        
        // Step 1: Apply CPD hours discount FIRST
        const userAvailableHours = user?.cpdHours || 0;
        const maxApplicableHours = Math.floor(basePrice / 20);
        const applicableHours = Math.min(maxApplicableHours, userAvailableHours);
        
        const priceAfterCpdHours = Math.max(0, basePrice - (applicableHours * 20));
        
        // Step 2: Apply membership discounts to the remaining amount (FULL MEMBERS AND ORG MEMBERSHIP ONLY)
        let finalPrice = priceAfterCpdHours;
        let memberDiscountApplied = false;
        let memberDiscountPercentage = 0;

        if (priceAfterCpdHours > 0) {
            if (hasOrgMembership) {
                finalPrice = priceAfterCpdHours * 0.8;
                memberDiscountApplied = true;
                memberDiscountPercentage = 20;
            } else if (isFullMember) {
                finalPrice = priceAfterCpdHours * 0.9;
                memberDiscountApplied = true;
                memberDiscountPercentage = 10;
            }
        }
        
        return { 
            basePrice,
            priceAfterCpdHours: priceAfterCpdHours.toFixed(0),
            finalPrice: finalPrice.toFixed(0),
            memberDiscountApplied,
            memberDiscountPercentage,
            cpdHours,
            applicableHours,
            hasCpdDiscount: applicableHours > 0 && basePrice > 0
        };
    }, [course, user, userOrganisation]);

    return (
        <Card className="group overflow-hidden border border-slate-200 hover:border-purple-400 hover:shadow-lg transition-all duration-300 rounded-lg h-full bg-white">
            <CardContent className="p-5 flex flex-col flex-grow">
                <h3 className="text-base font-bold text-gray-900 mb-3 leading-snug line-clamp-2">
                    {course.title}
                </h3>

                {nextDate && (
                    <div className="space-y-1.5 mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                            <Calendar className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                            <span className="font-medium">
                                {format(new Date(nextDate.date), 'd MMM yyyy')}
                            </span>
                        </div>
                        {nextDate.startTime && nextDate.endTime && (
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>{nextDate.startTime} - {nextDate.endTime}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{nextDate.location}</span>
                        </div>
                    </div>
                )}

                <div className="mt-auto pt-3 border-t border-slate-100">
                    {/* CPD Hours Info */}
                    {pricingInfo.cpdHours > 0 && (
                        <div className="mb-3 p-2 bg-purple-50 rounded-lg border border-purple-100">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-purple-900">CPD Hours:</span>
                                <span className="text-sm font-bold text-purple-700">{pricingInfo.cpdHours} hour{pricingInfo.cpdHours !== 1 ? 's' : ''}</span>
                            </div>
                        </div>
                    )}
                    
                    {/* Pricing with CPD Discount */}
                    {pricingInfo.basePrice > 0 && (
                        <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-slate-600">Course Price:</span>
                                <div className="flex items-center gap-2">
                                    {pricingInfo.memberDiscountApplied ? (
                                        <>
                                            <span className="text-sm text-slate-500 line-through">£{pricingInfo.basePrice}</span>
                                            <span className="text-base font-bold text-slate-900">£{pricingInfo.finalPrice}</span>
                                        </>
                                    ) : (
                                        <span className="text-base font-bold text-slate-900">£{pricingInfo.basePrice}</span>
                                    )}
                                </div>
                            </div>
                            
                            {pricingInfo.memberDiscountApplied && (
                                <div className="text-xs text-green-700 font-medium text-right mb-2">
                                    {pricingInfo.memberDiscountPercentage}% member discount
                                </div>
                            )}
                            
                            {pricingInfo.hasCpdDiscount && (
                                <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200">
                                    <div className="flex items-start gap-1.5">
                                        <Coins className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-xs font-semibold text-amber-900">
                                                Use {pricingInfo.applicableHours} CPD hour{pricingInfo.applicableHours !== 1 ? 's' : ''}
                                            </p>
                                            <p className="text-xs text-amber-700 mt-0.5">
                                                Applied first, then discount
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <Button
                        asChild
                        size="sm"
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                        <Link to={`${createPageUrl('CourseDetails')}?courseId=${course.id}`}>
                            View Course & Book
                            <ArrowRight className="w-3 h-3 ml-1" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

const CourseCard = ({ course, user, userOrganisation }) => {
    const pricingInfo = useMemo(() => {
        const isFullMember = user?.membershipStatus === 'active' && (user?.membershipType === 'Full' || user?.membershipType === 'Fellow');
        const hasOrgMembership = userOrganisation?.hasOrganisationalMembership && userOrganisation?.orgMembershipStatus === 'active';
        
        // Calculate base price from CPD hours
        const cpdHours = course.cpdHours || 0;
        const basePrice = cpdHours * 20; // £20 per CPD hour
        
        // Step 1: Apply CPD hours discount FIRST
        const userAvailableHours = user?.cpdHours || 0;
        const maxApplicableHours = Math.floor(basePrice / 20);
        const applicableHours = Math.min(maxApplicableHours, userAvailableHours);
        
        const priceAfterCpdHours = Math.max(0, basePrice - (applicableHours * 20));
        
        // Step 2: Apply membership discounts to the remaining amount (FULL MEMBERS AND ORG MEMBERSHIP ONLY)
        let finalPrice = priceAfterCpdHours;
        let memberDiscountApplied = false;
        let memberDiscountPercentage = 0;

        if (priceAfterCpdHours > 0) {
            if (hasOrgMembership) {
                finalPrice = priceAfterCpdHours * 0.8;
                memberDiscountApplied = true;
                memberDiscountPercentage = 20;
            } else if (isFullMember) {
                finalPrice = priceAfterCpdHours * 0.9;
                memberDiscountApplied = true;
                memberDiscountPercentage = 10;
            }
        }
        
        return { 
            basePrice,
            finalPrice: finalPrice.toFixed(0),
            memberDiscountApplied,
            memberDiscountPercentage,
            cpdHours,
            applicableHours,
            hasCpdDiscount: applicableHours > 0 && basePrice > 0
        };
    }, [course, user, userOrganisation]);

    return (
        <Card className="group overflow-hidden border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all duration-300 rounded-lg">
            <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-1">
                        {course.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Badge variant="outline" className="text-xs">{course.level}</Badge>
                        {pricingInfo.cpdHours > 0 && (
                            <span className="text-xs text-purple-700 font-medium">
                                {pricingInfo.cpdHours} CPD hour{pricingInfo.cpdHours !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    {/* Pricing Info */}
                    <div className="text-right">
                        {pricingInfo.basePrice > 0 && (
                            <>
                                <div className="flex items-center gap-1.5 justify-end mb-1">
                                    {pricingInfo.memberDiscountApplied && (
                                        <span className="text-sm text-slate-500 line-through">£{pricingInfo.basePrice}</span>
                                    )}
                                    <span className="text-base font-bold text-slate-900">£{pricingInfo.finalPrice}</span>
                                </div>
                                {pricingInfo.memberDiscountApplied && (
                                    <Badge className="bg-green-100 text-green-700 text-xs">
                                        {pricingInfo.memberDiscountPercentage}% off
                                    </Badge>
                                )}
                            </>
                        )}
                    </div>
                    
                    <Button
                        asChild
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-white whitespace-nowrap">
                        <Link to={`${createPageUrl('CourseDetails')}?courseId=${course.id}`}>
                            View
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default function CPDTraining() {
    const { user, loading: userLoading } = useUser();
    const { toast } = useToast();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [courses, setCourses] = useState([]);
    const [featuredCourses, setFeaturedCourses] = useState([]);
    const [loadingFeatured, setLoadingFeatured] = useState(true);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [userOrganisation, setUserOrganisation] = useState(null);
    const [showUpgradeBanner, setShowUpgradeBanner] = useState(true);
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [activeTab, setActiveTab] = useState('upcoming');
    const [expandedMonths, setExpandedMonths] = useState(new Set());

    useEffect(() => {
        if (user && !user.onboarding_completed && !user.isUnclaimed) {
            window.location.href = createPageUrl('Onboarding');
            return;
        }
    }, [user]);

    useEffect(() => {
        const fetchUserOrg = async () => {
            if (user?.organisationId) {
                try {
                    const orgs = await Organisation.filter({ id: user.organisationId });
                    if (orgs.length > 0) {
                        setUserOrganisation(orgs[0]);
                    }
                } catch (error) {
                    console.error('Failed to fetch organisation:', error);
                }
            } else {
                setUserOrganisation(null);
            }
        };
        fetchUserOrg();
    }, [user?.organisationId]);

    useEffect(() => {
        const fetchFeaturedCourses = async () => {
            setLoadingFeatured(true);
            try {
                const allCourses = await Course.list('-created_date', 100);
                
                if (!allCourses || allCourses.length === 0) {
                    setFeaturedCourses([]);
                    setLoadingFeatured(false);
                    return;
                }

                const allDates = await CourseDate.filter({ status: 'Available' }, 'date', 100);
                
                if (!allDates || allDates.length === 0) {
                    setFeaturedCourses([]);
                    setLoadingFeatured(false);
                    return;
                }

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const upcomingDates = allDates.filter(date => {
                    const eventDate = new Date(date.date);
                    return eventDate >= today;
                });

                if (upcomingDates.length === 0) {
                    setFeaturedCourses([]);
                    setLoadingFeatured(false);
                    return;
                }

                const courseMap = new Map(allCourses.map(course => [course.id, course]));

                const coursesWithDates = upcomingDates
                    .map(date => {
                        const course = courseMap.get(date.courseId);
                        if (course) {
                            return { course, nextDate: date };
                        }
                        return null;
                    })
                    .filter(Boolean)
                    .sort((a, b) => {
                        const dateA = new Date(a.nextDate.date);
                        const dateB = new Date(b.nextDate.date);
                        return dateA - dateB;
                    });

                const uniqueCourses = [];
                const seenCourseIds = new Set();
                for (const item of coursesWithDates) {
                    if (!seenCourseIds.has(item.course.id)) {
                        seenCourseIds.add(item.course.id);
                        uniqueCourses.push(item);
                    }
                }

                setFeaturedCourses(uniqueCourses);
            } catch (error) {
                console.error("Failed to fetch featured courses:", error);
                setFeaturedCourses([]);
            } finally {
                setLoadingFeatured(false);
            }
        };

        fetchFeaturedCourses();
    }, []);

    useEffect(() => {
        if (!selectedCategory) {
            setCourses([]);
            return;
        }

        const fetchCourses = async () => {
            setLoadingCourses(true);
            try {
                const fetchedCourses = await Course.filter({ level: selectedCategory }, '-created_date', 50);
                setCourses(fetchedCourses || []);
            } catch (error) {
                console.error("Failed to fetch courses:", error);
                setCourses([]);
            } finally {
                setLoadingCourses(false);
            }
        };

        fetchCourses();
    }, [selectedCategory]);

    const handleUpgradeToFull = async () => {
        setIsUpgrading(true);
        try {
            window.location.href = createPageUrl('MembershipPlans');
        } catch (error) {
            console.error('Failed to navigate to membership plans:', error);
            toast({
                title: "Error",
                description: "Could not open membership plans. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsUpgrading(false);
        }
    };

    const categories = [
        { name: 'Foundation', description: 'Essential training for those new to safeguarding roles.', icon: ShieldCheck },
        { name: 'Advanced', description: 'In-depth courses for experienced practitioners.', icon: TrendingUp },
        { name: 'Short & Specialist', description: 'Focused workshops on specific topics.', icon: Puzzle },
        { name: 'Refresher', description: 'Update your knowledge and skills.', icon: RefreshCw },
    ];
    

    
    if (userLoading) {
        return null;
    }

    const userCpdHours = user?.cpdHours || 0;

    return (
        <div className="flex h-screen bg-slate-50/30">
            <Toaster />
            <PortalSidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="CPDTraining" />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <PortalHeader setSidebarOpen={setSidebarOpen} user={user} />
                
                <main className="flex-1 overflow-y-auto pb-20 md:pb-6 bg-gradient-to-br from-slate-50 via-purple-50/20 to-slate-50">
                    <div className="max-w-7xl mx-auto">
                        {/* Page Header */}
                        <div className="px-4 md:px-6 py-8 md:py-10 bg-white/80 backdrop-blur-sm border-b border-slate-200/50">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 bg-gradient-to-r from-slate-900 to-purple-900 bg-clip-text text-transparent">CPD & Training</h1>
                                    <p className="text-sm md:text-base text-slate-600">
                                        Accredited professional development courses
                                    </p>
                                </div>
                                {userCpdHours > 0 && (
                                    <div className="flex-shrink-0 px-4 py-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-white rounded-lg shadow-sm">
                                                <Coins className="w-4 h-4 text-purple-600" />
                                            </div>
                                            <div>
                                                <div className="text-xl font-bold text-purple-900">{userCpdHours.toFixed(1)}</div>
                                                <div className="text-xs text-purple-600 font-medium">CPD hours</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Upgrade Banner for Associate Members */}
                        {user?.membershipType === 'Associate' && user?.membershipStatus === 'active' && showUpgradeBanner && (
                            <div className="px-4 md:px-6 pt-4 md:pt-6">
                                <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 rounded-2xl shadow-xl">
                                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
                                    <button 
                                        onClick={() => setShowUpgradeBanner(false)}
                                        className="absolute top-3 right-3 z-10 text-white/70 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <div className="relative px-4 md:px-6 py-5 md:py-6">
                                        <div className="flex items-center gap-4 md:gap-6">
                                            <div className="p-3 md:p-4 bg-white/15 backdrop-blur-sm rounded-2xl flex-shrink-0 shadow-lg">
                                                <Crown className="w-7 h-7 md:w-8 md:h-8 text-white drop-shadow" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg md:text-xl font-bold text-white mb-2">Unlock Full Membership Benefits</h3>
                                                <p className="text-sm text-purple-50 mb-4">
                                                    Get 1 CPD hour monthly (£20 value), 10% training discounts, and professional recognition
                                                </p>
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <Button 
                                                        onClick={handleUpgradeToFull}
                                                        disabled={isUpgrading}
                                                        size="sm"
                                                        className="bg-white text-purple-700 hover:bg-purple-50 font-semibold shadow-lg hover:shadow-xl transition-all"
                                                    >
                                                        {isUpgrading ? (
                                                            <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" />Processing</>
                                                        ) : (
                                                            <>Upgrade Now<ArrowRight className="w-3 h-3 ml-1.5" /></>
                                                        )}
                                                    </Button>
                                                    <span className="text-sm text-white font-semibold bg-white/10 backdrop-blur px-3 py-1.5 rounded-lg">From £20/month</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tabs Navigation */}
                        <div className="px-4 md:px-6 pt-4 md:pt-6">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                <div className="px-4 md:px-6 border-b border-slate-200 bg-slate-50/50">
                                    <TabsList className="bg-transparent h-auto p-0 gap-8">
                                        <TabsTrigger 
                                            value="upcoming" 
                                            className="bg-transparent data-[state=active]:bg-transparent border-b-3 border-transparent data-[state=active]:border-purple-600 rounded-none px-0 pb-4 pt-5 text-sm md:text-base font-semibold data-[state=active]:text-purple-700 text-slate-600 data-[state=active]:shadow-none transition-all relative group"
                                        >
                                            <span className="relative z-10">Upcoming Sessions</span>
                                            <div className="absolute inset-x-0 bottom-0 h-1 bg-purple-600 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform rounded-t-full"></div>
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="catalogue" 
                                            className="bg-transparent data-[state=active]:bg-transparent border-b-3 border-transparent data-[state=active]:border-purple-600 rounded-none px-0 pb-4 pt-5 text-sm md:text-base font-semibold data-[state=active]:text-purple-700 text-slate-600 data-[state=active]:shadow-none transition-all relative group"
                                        >
                                            <span className="relative z-10">Course Catalogue</span>
                                            <div className="absolute inset-x-0 bottom-0 h-1 bg-purple-600 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform rounded-t-full"></div>
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                            {/* Upcoming Tab */}
                            <TabsContent value="upcoming" className="m-0">
                                {loadingFeatured ? (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <div className="relative">
                                            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                                            <Calendar className="w-6 h-6 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                        </div>
                                        <p className="text-sm text-slate-500 mt-4">Loading sessions...</p>
                                    </div>
                                ) : featuredCourses.length > 0 ? (
                                    (() => {
                                        // Group courses by month
                                        const coursesByMonth = featuredCourses.reduce((acc, { course, nextDate }) => {
                                            const date = new Date(nextDate.date);
                                            const monthKey = format(date, 'MMMM yyyy');
                                            if (!acc[monthKey]) {
                                                acc[monthKey] = [];
                                            }
                                            acc[monthKey].push({ course, nextDate, date });
                                            return acc;
                                        }, {});

                                        return (
                                            <div>
                                                {Object.entries(coursesByMonth).map(([monthKey, sessions]) => {
                                                    const isExpanded = expandedMonths.has(monthKey);
                                                    const displayedSessions = isExpanded ? sessions : sessions.slice(0, 3);
                                                    
                                                    return (
                                                        <div key={monthKey} className="border-b border-slate-100 last:border-b-0">
                                                            {/* Month Header */}
                                                            <div className="px-6 py-4 bg-slate-50/80">
                                                                <h3 className="text-base font-bold text-slate-900">{monthKey}</h3>
                                                                <p className="text-xs text-slate-600 mt-0.5">{sessions.length} session{sessions.length !== 1 ? 's' : ''} available</p>
                                                            </div>

                                                            {/* Sessions List */}
                                                            <div className="divide-y divide-slate-100">
                                                                {displayedSessions.map(({ course, nextDate, date }) => {
                                                                    const isFullMember = user?.membershipStatus === 'active' && (user?.membershipType === 'Full' || user?.membershipType === 'Fellow');
                                                                    const hasOrgMembership = userOrganisation?.hasOrganisationalMembership && userOrganisation?.orgMembershipStatus === 'active';
                                                                    const cpdHours = course.cpdHours || 0;
                                                                    const basePrice = cpdHours * 20;

                                                                    let finalPrice = basePrice;
                                                                    let hasDiscount = false;
                                                                    let cpdDiscount = 0;
                                                                    let memberDiscount = 0;
                                                                    let applicableHours = 0;

                                                                    if (basePrice > 0) {
                                                                        const userAvailableHours = user?.cpdHours || 0;
                                                                        const maxApplicableHours = Math.floor(basePrice / 20);
                                                                        applicableHours = Math.min(maxApplicableHours, userAvailableHours);
                                                                        const priceAfterCpdHours = Math.max(0, basePrice - (applicableHours * 20));

                                                                        cpdDiscount = applicableHours * 20;
                                                                        finalPrice = priceAfterCpdHours;
                                                                        hasDiscount = applicableHours > 0;

                                                                        if (priceAfterCpdHours > 0) {
                                                                            if (hasOrgMembership) {
                                                                                memberDiscount = priceAfterCpdHours * 0.2;
                                                                                finalPrice = priceAfterCpdHours * 0.8;
                                                                                hasDiscount = true;
                                                                            } else if (isFullMember) {
                                                                                memberDiscount = priceAfterCpdHours * 0.1;
                                                                                finalPrice = priceAfterCpdHours * 0.9;
                                                                                hasDiscount = true;
                                                                            }
                                                                        }
                                                                    }

                                                                    return (
                                                                        <Link
                                                                            key={course.id}
                                                                            to={`${createPageUrl('CourseDetails')}?courseId=${course.id}`}
                                                                            className="flex items-start gap-6 px-6 py-5 hover:bg-slate-50 transition-colors group"
                                                                        >
                                                                            {/* Date Block */}
                                                                            <div className="flex flex-col items-center justify-center text-center min-w-[70px] flex-shrink-0">
                                                                                <div className="text-sm font-semibold text-purple-600 uppercase tracking-wide">
                                                                                    {format(date, 'MMM')}
                                                                                </div>
                                                                                <div className="text-4xl font-bold text-slate-900 leading-none mt-1">
                                                                                    {format(date, 'd')}
                                                                                </div>
                                                                                <div className="text-xs text-slate-500 mt-1">
                                                                                    {format(date, 'yyyy')}
                                                                                </div>
                                                                            </div>

                                                                            {/* Content */}
                                                                            <div className="flex-1 min-w-0">
                                                                                <h3 className="font-semibold text-slate-900 mb-3 text-lg group-hover:text-purple-600 transition-colors">
                                                                                    {course.title}
                                                                                </h3>
                                                                                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                                                                                    {nextDate.startTime && (
                                                                                        <span className="flex items-center gap-1.5">
                                                                                            <Clock className="w-4 h-4" />
                                                                                            {nextDate.startTime}
                                                                                        </span>
                                                                                    )}
                                                                                    {nextDate.location && (
                                                                                        <>
                                                                                            <span className="text-slate-300">•</span>
                                                                                            <span className="flex items-center gap-1.5">
                                                                                                <MapPin className="w-4 h-4" />
                                                                                                {nextDate.location}
                                                                                            </span>
                                                                                        </>
                                                                                    )}
                                                                                    {cpdHours > 0 && (
                                                                                        <>
                                                                                            <span className="text-slate-300">•</span>
                                                                                            <span className="flex items-center gap-1.5 text-purple-600 font-medium">
                                                                                                <Coins className="w-4 h-4" />
                                                                                                {cpdHours} CPD hours
                                                                                            </span>
                                                                                        </>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            {/* Price */}
                                                                            {basePrice > 0 && (
                                                                                <div className="text-right flex-shrink-0">
                                                                                    {hasDiscount ? (
                                                                                        <div>
                                                                                            <div className="text-sm text-slate-400 line-through mb-1">£{basePrice}</div>
                                                                                            <div className="text-3xl font-bold text-slate-900 mb-2">£{finalPrice.toFixed(0)}</div>
                                                                                            <div className="text-xs text-slate-500 space-y-0.5">
                                                                                                {cpdDiscount > 0 && (
                                                                                                    <div>CPD Hours: -£{cpdDiscount}</div>
                                                                                                )}
                                                                                                {memberDiscount > 0 && (
                                                                                                    <div>{hasOrgMembership ? 'Org' : 'Member'} Discount: -£{memberDiscount.toFixed(0)}</div>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div className="text-3xl font-bold text-slate-900">£{basePrice}</div>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </Link>
                                                                    );
                                                                })}
                                                            </div>

                                                            {/* Show More/Less Button */}
                                                            {sessions.length > 3 && (
                                                                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100">
                                                                    <button
                                                                        onClick={() => {
                                                                            setExpandedMonths(prev => {
                                                                                const newSet = new Set(prev);
                                                                                if (isExpanded) {
                                                                                    newSet.delete(monthKey);
                                                                                } else {
                                                                                    newSet.add(monthKey);
                                                                                }
                                                                                return newSet;
                                                                            });
                                                                        }}
                                                                        className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                                                                    >
                                                                        {isExpanded ? (
                                                                            <>
                                                                                Show less
                                                                                <ChevronUp className="w-4 h-4" />
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                Show {sessions.length - 3} more session{sessions.length - 3 !== 1 ? 's' : ''}
                                                                                <ChevronDown className="w-4 h-4" />
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })()
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 px-4">
                                        <div className="relative mb-6">
                                            <div className="absolute inset-0 bg-purple-200 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                                            <div className="relative p-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full">
                                                <Calendar className="w-12 h-12 text-slate-400" />
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">No upcoming sessions</h3>
                                        <p className="text-sm text-slate-500 text-center max-w-md mb-6 leading-relaxed">
                                            We're currently scheduling new sessions. Browse our full catalogue in the meantime!
                                        </p>
                                        <Button 
                                            size="sm"
                                            onClick={() => setActiveTab('catalogue')}
                                            className="bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-xl transition-all"
                                        >
                                            Browse Catalogue
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>

                            {/* Course Catalogue Tab */}
                            <TabsContent value="catalogue" className="m-0">
                                {!selectedCategory ? (
                                    <div className="p-4 md:p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                                            {categories.map(({ name, description, icon: Icon }) => (
                                                <button
                                                    key={name}
                                                    onClick={() => setSelectedCategory(name)}
                                                    className="group relative p-6 rounded-2xl border-2 border-slate-200 hover:border-purple-400 hover:shadow-xl transition-all duration-300 text-left bg-gradient-to-br from-white to-slate-50 overflow-hidden"
                                                >
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 via-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-bl-[100px]"></div>
                                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                    <div className="relative">
                                                        <div className="flex items-start justify-between gap-3 mb-4">
                                                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                                                                {name}
                                                            </h3>
                                                            <div className="p-2.5 bg-slate-100 group-hover:bg-purple-100 group-hover:scale-110 rounded-xl transition-all duration-300 shadow-sm">
                                                                <Icon className="w-5 h-5 text-slate-600 group-hover:text-purple-600 transition-colors flex-shrink-0" />
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                                                            {description}
                                                        </p>
                                                        <span className="inline-flex items-center text-sm font-bold text-purple-600 group-hover:text-purple-700 group-hover:gap-2 transition-all">
                                                            Explore courses
                                                            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="px-4 md:px-6 py-4 md:py-5 border-b border-slate-100">
                                            <button
                                                onClick={() => setSelectedCategory(null)}
                                                className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 mb-3 -ml-1 px-1 transition-colors"
                                            >
                                                <ChevronLeft className="w-4 h-4 mr-1" />
                                                Back to Categories
                                            </button>
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-1 h-5 bg-purple-600 rounded-full"></div>
                                                <h2 className="text-base md:text-lg font-semibold text-slate-900">{selectedCategory} Courses</h2>
                                            </div>
                                            <p className="text-xs md:text-sm text-slate-500 ml-3">
                                                {categories.find(c => c.name === selectedCategory)?.description}
                                            </p>
                                        </div>

                                        {loadingCourses ? (
                                            <div className="flex flex-col items-center justify-center py-20">
                                                <div className="relative">
                                                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                                                    <BookOpen className="w-6 h-6 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                                </div>
                                                <p className="text-sm text-slate-500 mt-4">Loading courses...</p>
                                            </div>
                                        ) : courses.length > 0 ? (
                                            <div className="divide-y divide-slate-100">
                                                {courses.map(course => {
                                                    const courseCpdHours = course.cpdHours || 0;
                                                    const basePrice = courseCpdHours * 20;

                                                    return (
                                                        <Link
                                                            key={course.id}
                                                            to={`${createPageUrl('CourseDetails')}?courseId=${course.id}`}
                                                            className="block px-4 md:px-6 py-5 hover:bg-gradient-to-r hover:from-purple-50/30 hover:to-transparent transition-all group relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-purple-600 before:transform before:scale-y-0 hover:before:scale-y-100 before:transition-transform"
                                                        >
                                                            <div className="flex items-start justify-between gap-4 relative z-10">
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="font-bold text-slate-900 line-clamp-2 group-hover:text-purple-700 transition-colors text-sm md:text-base mb-3">
                                                                        {course.title}
                                                                    </h4>
                                                                    <div className="flex items-center gap-3 text-xs">
                                                                        <Badge variant="outline" className="text-xs font-semibold border-slate-300">
                                                                            {course.level}
                                                                        </Badge>
                                                                        {courseCpdHours > 0 && (
                                                                            <span className="flex items-center gap-1 text-purple-700 font-bold bg-purple-50 px-2 py-1 rounded-md">
                                                                                <Coins className="w-3.5 h-3.5" />
                                                                                {courseCpdHours} CPD hrs
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {basePrice > 0 && (
                                                                    <div className="flex-shrink-0 text-right bg-slate-50 px-3 py-2 rounded-lg">
                                                                        <div className="text-lg md:text-xl font-bold text-slate-900">£{basePrice}</div>
                                                                        <div className="text-xs text-slate-500 font-medium">per person</div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-20 px-4">
                                                <div className="relative mb-6">
                                                    <div className="absolute inset-0 bg-purple-200 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                                                    <div className="relative p-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full">
                                                        <BookOpen className="w-12 h-12 text-slate-400" />
                                                    </div>
                                                </div>
                                                <h3 className="text-xl font-bold text-slate-900 mb-2">No courses available yet</h3>
                                                <p className="text-sm text-slate-500 text-center max-w-md leading-relaxed">
                                                    We're currently preparing courses for this category. Check back soon for new professional development opportunities!
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </TabsContent>
                            </Tabs>
                            </div>
                    </div>
                </main>
                <PortalBottomNav currentPage="CPDTraining" />
            </div>
        </div>
    );
}