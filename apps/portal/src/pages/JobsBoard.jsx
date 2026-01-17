import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Job } from '@ifs/shared/api/entities';
import { User } from '@ifs/shared/api/entities';
import { createPageUrl } from '@ifs/shared/utils';
import { Card, CardContent } from '@ifs/shared/components/ui/card';
import { Button } from '@ifs/shared/components/ui/button';
import { Badge } from '@ifs/shared/components/ui/badge';
import { Input } from '@ifs/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ifs/shared/components/ui/select';
import { Loader2, ArrowRight, MapPin, Briefcase, Building2, Banknote, CalendarDays, Search, X, Clock, ExternalLink, TrendingUp } from 'lucide-react';
import JobFilters from '@/components/jobs/JobFilters';
import PortalSidebar from '../components/portal/PortalSidebar';
import PortalHeader from '../components/portal/PortalHeader';
import { formatDistanceToNow, isValid } from 'date-fns'; // formatDistanceToNow used in safeFormatDistanceToNow
import { useUser } from '@ifs/shared/components/providers/UserProvider';

const safeFormatDistanceToNow = (dateValue) => {
    if (!dateValue) return null;
    const date = new Date(dateValue);
    if (!isValid(date)) return null;
    return formatDistanceToNow(date, { addSuffix: true });
};
import { usePostHog } from '@ifs/shared/components/providers/PostHogProvider';
import PortalBottomNav from '../components/portal/PortalBottomNav';
import DataTablePagination from '@ifs/shared/components/ui/DataTablePagination';

const PAGE_SIZE = 5;

const JobCard = React.memo(({ job, isActiveMember, onJoinClick }) => (
    <Card className="border-slate-200/60 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200 overflow-hidden group">
        <CardContent className="p-0">
            <div className="p-5 md:p-6">
                {/* Top Row - Company & Status */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="min-w-0 flex-1">
                            <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1 group-hover:text-purple-700 transition-colors truncate">
                                {job.title}
                            </h3>
                            <p className="text-sm font-semibold text-slate-700">{job.companyName}</p>
                        </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 hidden sm:flex">
                        New
                    </Badge>
                </div>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1.5">
                        <span>{job.location}</span>
                    </div>
                    {job.salaryDisplayText && (
                        <div className="flex items-center gap-1.5">
                            <span className="font-medium text-slate-700">{job.salaryDisplayText}</span>
                        </div>
                    )}
                    {safeFormatDistanceToNow(job.created_date) && (
                        <div className="flex items-center gap-1.5">
                            <span>{safeFormatDistanceToNow(job.created_date)}</span>
                        </div>
                    )}
                </div>
                
                {/* Description */}
                <p className="text-slate-700 mb-4 line-clamp-2 leading-relaxed">
                    {job.description?.replace(/<[^>]*>?/gm, '')}
                </p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-5">
                    <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 font-medium">
                        {job.contractType}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
                        {job.workingHours}
                    </Badge>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-medium">
                        {job.sector}
                    </Badge>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-medium">
                        {job.experienceLevel}
                    </Badge>
                </div>
                
                {/* Action Row */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    {safeFormatDistanceToNow(job.applicationDeadline) && (
                        <div className="flex items-center gap-1.5 text-sm text-amber-600">
                            <span className="font-medium">
                                Closes {safeFormatDistanceToNow(job.applicationDeadline)}
                            </span>
                        </div>
                    )}
                    <div className="ml-auto">
                        {isActiveMember ? (
                            <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700 shadow-sm">
                                <Link to={`${createPageUrl('JobDetails')}?id=${job.id}`}>
                                    View Details
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        ) : (
                            <Button size="sm" onClick={onJoinClick} variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                                Join to View
                                <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
));

JobCard.displayName = 'JobCard';

export default function JobsBoard() {
    const { user, loading: userLoading } = useUser();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        locationName: '',
        coordinates: null,
        radius: '0',
        experienceLevel: 'All',
        workPattern: 'All',
        salaryRange: [0, 200000],
        sort: 'newest',
    });
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);
    const location = useLocation();
    const { trackEvent } = usePostHog();

    useEffect(() => {
        if (user && !user.onboarding_completed && !user.isUnclaimed) {
            window.location.href = createPageUrl('Onboarding');
            return;
        }
    }, [user]);

    useEffect(() => {
        let isMounted = true;
        
        const fetchJobs = async () => {
            setLoading(true);
            try {
                // Fetch all active jobs to support client-side filtering with pagination
                // This is necessary because complex filters like radius and salary range are hard to do via DB query API accurately
                const query = { status: 'Active' };
                const allJobs = await Job.filter(query, '-created_date', 1000); // Limit 1000 for performance
                
                if (isMounted) {
                    // Filter out jobs with expired application deadlines
                    const now = new Date();
                    const activeJobs = allJobs.filter(job => {
                        if (!job.applicationDeadline) return true;
                        const deadline = new Date(job.applicationDeadline);
                        deadline.setHours(0, 0, 0, 0); 
                        now.setHours(0, 0, 0, 0);
                        return deadline >= now;
                    });

                    setJobs(activeJobs);
                }
            } catch (error) {
                console.error("Error fetching jobs:", error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchJobs();
        
        return () => {
            isMounted = false;
        };
    }, []);
    
    useEffect(() => {
        setPage(1);
    }, [filters]);

    const handleFilterChange = useCallback((filterType, value) => {
        if (filterType === 'location') {
            if (typeof value === 'object' && value !== null) {
                setFilters(prev => ({
                    ...prev,
                    locationName: value.name || value.formatted_address,
                    coordinates: value.geometry?.location || null,
                    radius: prev.radius === '0' && value.geometry?.location ? '25' : prev.radius
                }));
            } else {
                setFilters(prev => ({
                    ...prev,
                    locationName: value,
                    coordinates: null
                }));
            }
        } else {
            setFilters(prev => ({ ...prev, [filterType]: value }));
        }
    }, []);

    const handleClearFilters = useCallback(() => {
        setFilters({
            search: '',
            locationName: '',
            coordinates: null,
            radius: '0',
            experienceLevel: 'All',
            workPattern: 'All',
            salaryRange: [0, 200000],
            sort: 'newest',
        });
    }, []);

    const handleJoin = useCallback(() => {
        trackEvent('join_button_clicked', {
          intent: 'associate',
          location: 'jobs_board_mobile',
          user_type: 'logged_in'
        });
        const url = createPageUrl('Onboarding') + '?intent=associate';
        User.loginWithRedirect(url);
    }, [trackEvent]);

    // Haversine formula to calculate distance in miles
    const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
        const R = 3959; // Radius of the earth in miles
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in miles
        return d;
    }, []);

    const filteredJobs = useMemo(() => {
        const filtered = jobs.filter(job => {
            if (!job) return false;
            
            const searchLower = (filters.search || '').toLowerCase().trim();
            const searchMatch = !filters.search ||
                (typeof job.title === 'string' && job.title.toLowerCase().includes(searchLower)) ||
                (typeof job.companyName === 'string' && job.companyName.toLowerCase().includes(searchLower)) ||
                (typeof job.description === 'string' && job.description.toLowerCase().includes(searchLower));

            let locationMatch = true;
            if (filters.locationName) {
                const filterLoc = filters.locationName.toLowerCase();
                const radius = parseFloat(filters.radius);

                if (filters.coordinates && radius > 0 && job.latitude && job.longitude) {
                    const distance = calculateDistance(
                        filters.coordinates.lat,
                        filters.coordinates.lng,
                        job.latitude,
                        job.longitude
                    );
                    locationMatch = distance !== null && distance <= radius;
                } else if (filters.locationName && filters.locationName.trim()) {
                    locationMatch = job.location && (
                        job.location.toLowerCase().includes(filterLoc) || 
                        filterLoc.includes(job.location.toLowerCase())
                    );
                }
            }
            
            let seniorityMatch = filters.experienceLevel === 'All' || 
                (job.experienceLevel && job.experienceLevel.toLowerCase() === filters.experienceLevel.toLowerCase());
            
            let workPatternMatch = filters.workPattern === 'All' || 
                (job.workingHours && job.workingHours.toLowerCase() === filters.workPattern.toLowerCase());
            
            let salaryMatch = true;
            // Default to full range if undefined to prevent crashes
            const salaryRange = filters.salaryRange && filters.salaryRange.length === 2 ? filters.salaryRange : [0, 200000];
            const minSalary = salaryRange[0];
            const maxSalary = salaryRange[1];
            
            if (job.salary) {
                salaryMatch = job.salary >= minSalary && (maxSalary === 200000 || job.salary <= maxSalary);
            } else if (job.salaryMin || job.salaryMax) {
                const jobMin = job.salaryMin || 0;
                const jobMax = job.salaryMax || jobMin;
                salaryMatch = jobMax >= minSalary && (maxSalary === 200000 || jobMin <= maxSalary);
            } else if (minSalary > 0) {
                salaryMatch = false;
            }

            return searchMatch && locationMatch && seniorityMatch && workPatternMatch && salaryMatch;
        });

        // Sort by application deadline (soonest first)
        return filtered.sort((a, b) => {
            const deadlineA = a.applicationDeadline ? new Date(a.applicationDeadline).getTime() : Infinity;
            const deadlineB = b.applicationDeadline ? new Date(b.applicationDeadline).getTime() : Infinity;
            return deadlineA - deadlineB;
        });
    }, [jobs, filters, calculateDistance]);

    const paginatedJobs = useMemo(() => {
        const startIndex = (page - 1) * PAGE_SIZE;
        return filteredJobs.slice(startIndex, startIndex + PAGE_SIZE);
    }, [filteredJobs, page]);

    const totalPages = Math.ceil(filteredJobs.length / PAGE_SIZE);

    if (userLoading) {
        return null;
    }

    const isActiveMember = user?.membershipStatus === 'active' && (user?.membershipType === 'Associate' || user?.membershipType === 'Full' || user?.membershipType === 'Fellow');

    return (
        <div className="flex h-screen bg-slate-50/30">
            <PortalSidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="JobsBoard" />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <PortalHeader 
                    setSidebarOpen={setSidebarOpen} 
                    user={user} 
                />

                <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
                    <div className="max-w-5xl mx-auto">
                        {/* Page Header */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <Briefcase className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Jobs Board</h1>
                                    <p className="text-sm text-slate-600">Discover safeguarding opportunities across the UK</p>
                                </div>
                            </div>
                        </div>
                        
                        <JobFilters 
                            filters={filters} 
                            onFilterChange={handleFilterChange} 
                            onClearFilters={handleClearFilters} 
                        />

                        {!isActiveMember && (
                            <Card className="mb-6 border-purple-200 bg-gradient-to-br from-purple-50 to-white overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                    <TrendingUp className="w-5 h-5 text-purple-600" />
                                                </div>
                                                <h3 className="text-lg font-bold text-purple-900">Unlock Full Access</h3>
                                            </div>
                                            <p className="text-purple-800 text-sm">Join as a free Associate Member to view complete job details, application links, and apply directly.</p>
                                        </div>
                                        <Button
                                            onClick={handleJoin}
                                            className="bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transition-all w-full sm:w-auto whitespace-nowrap"
                                        >
                                            Join Free Now
                                            <ArrowRight className="ml-2 w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        
                        {loading ? (
                            <div className="text-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
                                <p className="mt-3 text-slate-600 font-medium">Loading opportunities...</p>
                            </div>
                        ) : (
                            paginatedJobs.length > 0 ? (
                                <div className="space-y-4">
                                    {paginatedJobs.map((job) => (
                                        <JobCard 
                                            key={job.id} 
                                            job={job} 
                                            isActiveMember={isActiveMember}
                                            onJoinClick={handleJoin}
                                        />
                                    ))}
                                    
                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-center space-x-2 py-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                                disabled={page === 1}
                                            >
                                                Previous
                                            </Button>
                                            <div className="text-sm text-slate-600">
                                                Page {page} of {totalPages}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                                disabled={page === totalPages}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Card className="border-slate-200/60 shadow-sm">
                                    <CardContent className="py-16 text-center">
                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Briefcase className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No jobs found</h3>
                                        <p className="text-slate-600 max-w-md mx-auto">
                                            No jobs match your current filters. Try adjusting your search criteria.
                                        </p>
                                        <Button variant="outline" onClick={handleClearFilters} className="mt-4">
                                            Clear Filters
                                        </Button>
                                    </CardContent>
                                </Card>
                            )
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}