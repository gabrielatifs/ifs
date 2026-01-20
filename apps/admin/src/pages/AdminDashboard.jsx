import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User } from '@ifs/shared/api/entities';
import { Event } from '@ifs/shared/api/entities';
import { Job } from '@ifs/shared/api/entities';
import { Course } from '@ifs/shared/api/entities';
import { CourseVariant } from '@ifs/shared/api/entities';
import { CourseDate } from '@ifs/shared/api/entities';
import { CourseBooking } from '@ifs/shared/api/entities';
import { EventSignup } from '@ifs/shared/api/entities';
import { TrainingEnquiry } from '@ifs/shared/api/entities';
import { Organisation } from '@ifs/shared/api/entities';
import { DigitalCredential } from '@ifs/shared/api/entities';
import { CreditTransaction } from '@ifs/shared/api/entities';
import { Survey } from '@ifs/shared/api/entities';
import { SurveyResponse } from '@ifs/shared/api/entities';
import { JobMetric } from '@ifs/shared/api/entities';
import { createPageUrl } from '@ifs/shared/utils';

import { Button } from '@ifs/shared/components/ui/button';
import { Badge } from '@ifs/shared/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@ifs/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ifs/shared/components/ui/tabs';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { format, subDays, parseISO } from 'date-fns';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import {
    Loader2,
    Users,
    Calendar,
    Briefcase,
    GraduationCap,
    Plus,
    Eye,
    TrendingUp,
    Activity,
    Clock,
    CheckCircle2,
    ChevronDown,
    MoreVertical,
    Download,
    Search,
    Edit2,
    UserCheck,
    X,
    Trash2,
    Upload,
    Shield,
    Settings,
    Mail,
    RefreshCw,
    Filter,
    ExternalLink,
    BarChart3,
    CalendarDays,
    Building2,
    Crown,
    Edit,
    Award,
    MessageSquare,
    ListChecks,
    Coffee,
    Send,
    Copy,
    Link as LinkIcon,
    MinusCircle,
    Bell
} from 'lucide-react';
import { useToast } from "@ifs/shared/components/ui/use-toast";
import { Toaster } from "@ifs/shared/components/ui/toaster";
import { useUser } from '@ifs/shared/components/providers/UserProvider';
import { useAdminMode } from '@ifs/shared/components/providers/AdminModeProvider';
import { usePostHog } from '@ifs/shared/components/providers/PostHogProvider';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@ifs/shared/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@ifs/shared/components/ui/dropdown-menu";
import { Input } from '@ifs/shared/components/ui/input';
import { Textarea } from '@ifs/shared/components/ui/textarea';
import { Label } from '@ifs/shared/components/ui/label';
import { Checkbox } from '@ifs/shared/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@ifs/shared/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@ifs/shared/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ifs/shared/components/ui/select';
import { deleteUser, resetUser, reindexJobs, backfillApplicants } from '@ifs/shared/api/functions';
import MembershipAnalyticsTab from '../components/admin/MembershipAnalyticsTab';
import ApplicationDetailsSheet from '../components/admin/ApplicationDetailsSheet';
import AddEventModal from '../components/admin/AddEventModal';
import EventSignupsSheet from '../components/admin/EventSignupsSheet';
import ManageDatesModal from '../components/admin/ManageDatesModal';
import { generateDigitalCredential } from '@ifs/shared/api/functions';
import EditCourseModal from '../components/admin/EditCourseModal';
import CommunityEventModal from '../components/admin/CommunityEventModal'; // Added import
import CommunityEventSignupsSheet from '../components/admin/CommunityEventSignupsSheet'; // Added import
import AddBookingModal from '../components/admin/AddBookingModal';
import WelcomeEmailsTab from '../components/admin/WelcomeEmailsTab';
import JobAnalyticsTab from '../components/admin/JobAnalyticsTab';
import NewsSourceModal from '../components/admin/NewsSourceModal';
import NewsArticleModal from '../components/admin/NewsArticleModal';
import NewsCategoryModal from '../components/admin/NewsCategoryModal';
import DeductCpdModal from '../components/admin/DeductCpdModal';
import EditJob from './EditJob';
import { NewsSource, NewsItem, NewsCategory, CommunityEvent, CommunityEventSignup } from '@ifs/shared/api/entities';
import { Globe, Rss, Newspaper, Tag } from 'lucide-react';

const UsersTable = ({ users, onApprove, onReject, onPreview, onManualUpgrade, onDelete, onReset }) => {
    return (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Membership Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan="5" className="text-center py-8 text-slate-500">No users found matching criteria.</TableCell>
                        </TableRow>
                    ) : (
                        users.map(user => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="font-medium">{user.displayName || user.full_name}</div>
                                    <div className="text-xs text-slate-500">{user.email}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.membershipType === 'Full' ? 'default' : (user.membershipType === 'Associate' ? 'secondary' : 'outline')}>
                                        {user.membershipType}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.membershipStatus === 'active' ? 'default' : (user.membershipStatus === 'pending' ? 'outline' : 'destructive')}>{user.membershipStatus}</Badge>
                                </TableCell>
                                <TableCell>{formatDate(user.created_date, 'dd MMM yyyy')}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {user.membershipStatus === 'pending' && (
                                                <>
                                                    <DropdownMenuItem onClick={() => onApprove(user)}>
                                                        <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onReject(user)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                                        <X className="w-4 h-4 mr-2" /> Reject
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                            <DropdownMenuItem onClick={() => onPreview(user)}>
                                                <Eye className="w-4 h-4 mr-2" /> View Application
                                            </DropdownMenuItem>
                                            {user.membershipType !== 'Full' && user.membershipStatus === 'active' && (
                                                <DropdownMenuItem onClick={() => onManualUpgrade(user)}>
                                                    <Shield className="w-4 h-4 mr-2" /> Upgrade to Full
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem asChild>
                                                <Link to={`${createPageUrl('Dashboard')}?viewAs=${user.id}`}>
                                                    <ExternalLink className="w-4 h-4 mr-2" /> View as User
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onReset(user)} className="text-orange-600 focus:text-orange-600 focus:bg-orange-50">
                                                <RefreshCw className="w-4 h-4 mr-2" /> Reset User
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onDelete(user)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                                <Trash2 className="w-4 h-4 mr-2" /> Delete User
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </Card>
    );
};

const formatDate = (value, formatString, fallback = 'N/A') => {
    if (!value) return fallback;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return fallback;
    return format(date, formatString);
};


export default function AdminDashboard() {
    const adminUrl = import.meta.env.VITE_ADMIN_URL || 'https://admin.join-ifs.org';
    const adminHost = (() => {
        try {
            return new URL(adminUrl).host;
        } catch (error) {
            return 'admin.join-ifs.org';
        }
    })();
    const isAdminDomain = typeof window !== 'undefined' && window.location.host === adminHost;

    if (!isAdminDomain) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="max-w-lg w-full bg-white border border-slate-200 rounded-xl shadow-sm p-6 text-center">
                    <h1 className="text-xl font-semibold text-slate-900 mb-2">Admin Portal Moved</h1>
                    <p className="text-slate-600 mb-4">
                        The admin dashboard is now available at the admin subdomain.
                    </p>
                    <a
                        href={adminUrl}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800"
                    >
                        Go to Admin Portal
                    </a>
                </div>
            </div>
        );
    }

    const { user, loading: userLoading, actualAdmin } = useUser();
    const { setIsAdminMode } = useAdminMode();
    const { posthog, isPostHogReady } = usePostHog();
    const { toast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab) {
            setActiveTab(tab);
        }
    }, [location.search]);

    // Consolidated state for all dashboard data (users, events, jobs, etc.)
    const [data, setData] = useState({
        users: [],
        organisations: [],
        events: [],
        jobs: [],
        courses: [],
        signups: [],
        enquiries: [],
        credentials: [],
        surveys: [],
        surveyResponses: [],
        communityEvents: [], // Added for community events
        communityEventSignups: [], // Added for community event signups
        courseBookings: [], // Added for course bookings
        courseDates: [],
        courseVariants: [],
        jobMetrics: [], // Added for job analytics
        newsSources: [],
        newsItems: [],
        newsCategories: []
    });

    // Loading state for the entire dashboard data fetch
    const [loading, setLoading] = useState(true);

    // Modals states
    const [isAddEventModalOpen, setAddEventModalOpen] = useState(false);
    const [isNewsSourceModalOpen, setNewsSourceModalOpen] = useState(false);
    const [isNewsArticleModalOpen, setNewsArticleModalOpen] = useState(false);
    const [isNewsCategoryModalOpen, setNewsCategoryModalOpen] = useState(false);
    const [editingNewsSource, setEditingNewsSource] = useState(null);
    const [editingNewsArticle, setEditingNewsArticle] = useState(null);
    const [editingNewsCategory, setEditingNewsCategory] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);
    const [selectedUserForSheet, setSelectedUserForSheet] = useState(null);
    const [isSheetOpen, setSheetOpen] = useState(false);
    const [selectedEventForSignups, setSelectedEventForSignups] = useState(null);
    const [isSignupsSheetOpen, setSignupsSheetOpen] = useState(false);
    const [selectedCourseForDates, setSelectedCourseForDates] = useState(null);
    const [isManageDatesModalOpen, setManageDatesModalOpen] = useState(false);
    const [isEditCourseModalOpen, setEditCourseModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);

    // News Selection & Filters
    const [selectedNewsItems, setSelectedNewsItems] = useState([]);
    const [newsCategoryFilter, setNewsCategoryFilter] = useState('all');
    const [newsStatusFilter, setNewsStatusFilter] = useState('all');
    const [newsSearchQuery, setNewsSearchQuery] = useState('');

    // Community Event Modals states
    const [isCommunityEventModalOpen, setCommunityEventModalOpen] = useState(false);
    const [editingCommunityEvent, setEditingCommunityEvent] = useState(null);
    const [selectedCommunityEventForSignups, setSelectedCommunityEventForSignups] = useState(null);
    const [isCommunitySignupsSheetOpen, setCommunitySignupsSheetOpen] = useState(false);

    // Course Booking Modal
    const [isAddBookingModalOpen, setAddBookingModalOpen] = useState(false);
    const [isJobModalOpen, setJobModalOpen] = useState(false);
    const [jobModalKey, setJobModalKey] = useState(0);
    const [jobModalJobId, setJobModalJobId] = useState(null);

    // Counts for related entities (derived from fetched data)
    const [courseDatesCount, setCourseDatesCount] = useState({});
    const [eventSignupsCount, setEventSignupsCount] = useState({});

    // Global alert dialog states
    const [userToDelete, setUserToDelete] = useState(null);
    const [orgToDelete, setOrgToDelete] = useState(null);

    // Sorting state for Associate Members
    const [associateSortField, setAssociateSortField] = useState('credentialDate');
    const [associateSortDirection, setAssociateSortDirection] = useState('desc');

    // Sorting state for Full Members
    const [fullSortField, setFullSortField] = useState('created_date');
    const [fullSortDirection, setFullSortDirection] = useState('desc');

    const [showCredentialModal, setShowCredentialModal] = useState(false);
    const [credentialForm, setCredentialForm] = useState({
        userId: '',
        credentialType: 'Masterclass Attendance',
        masterclassTitle: '',
        courseTitle: '',
        completionDate: '',
        hours: '',
        eventId: '',
        sendEmail: false
    });
    const [isGeneratingCredential, setIsGeneratingCredential] = useState(false);

    // Gift CPD Hours Modal State
    const [showGiftCpdModal, setShowGiftCpdModal] = useState(false);
    const [giftCpdForm, setGiftCpdForm] = useState({
        userId: '',
        hours: '',
        description: ''
    });
    const [isGiftingCpd, setIsGiftingCpd] = useState(false);

    // Gift Org Seats Modal State
    const [showGiftSeatsModal, setShowGiftSeatsModal] = useState(false);
    const [giftSeatsForm, setGiftSeatsForm] = useState({
        organisationId: '',
        seats: '',
        reason: ''
    });
    const [isGiftingSeats, setIsGiftingSeats] = useState(false);

    // Deduct CPD Hours Modal State
    const [showDeductCpdModal, setShowDeductCpdModal] = useState(false);

    // Community Event Reminders State
    const [isSendingReminders, setIsSendingReminders] = useState(false);
    const [reminderHours, setReminderHours] = useState(24);

    const openAddJobModal = () => {
        setJobModalKey((prev) => prev + 1);
        setJobModalJobId(null);
        setJobModalOpen(true);
    };

    const openEditJobModal = (jobId) => {
        setJobModalKey((prev) => prev + 1);
        setJobModalJobId(jobId);
        setJobModalOpen(true);
    };

    const handleJobSaved = () => {
        setJobModalOpen(false);
        setActiveTab('jobs');
        fetchAllDashboardData();
    };

    // Auth redirection
    useEffect(() => {
        if (!userLoading) {
            if (!user) {
                navigate(createPageUrl('JoinUs'));
            } else if (user.role !== 'admin') {
                navigate(createPageUrl('Dashboard'));
            }
            if (user && isPostHogReady) {
                posthog.identify(user.id, { email: user.email, name: user.displayName || user.full_name, role: user.role });
            }
        }
    }, [user, userLoading, navigate, posthog, isPostHogReady]);

    // Admin mode provider
    useEffect(() => {
        setIsAdminMode(true);
        return () => setIsAdminMode(false);
    }, [setIsAdminMode]);

    // Unified data fetching logic to get ALL data for the dashboard
    const fetchAllDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            // Batch 1: Core Entities
            const [
                usersData,
                organisationsData,
                eventsData,
                coursesData,
                jobsData
            ] = await Promise.all([
                User.list('-created_date', 2000),
                Organisation.list('-created_date', 1000),
                Event.list('-date', 1000),
                Course.list('-created_date', 1000),
                Job.list('-created_date', 1000)
            ]);

            // Batch 2: Transactional Data
            const [
                enquiriesData,
                allEventSignups,
                allCourseDates,
                allCredentials,
                courseBookingsData
            ] = await Promise.all([
                TrainingEnquiry.list('-created_date', 1000),
                EventSignup.list('-created_date', 2000),
                CourseDate.list('-date', 1000),
                DigitalCredential.list('-created_date', 2000),
                CourseBooking.list('-created_date', 1000)
            ]);

            // Batch 3: Surveys & Community
            const [
                surveysData,
                surveyResponsesData,
                communityEventsData,
                communityEventSignupsData,
                courseVariantsData
            ] = await Promise.all([
                Survey.list('-created_date', 1000),
                SurveyResponse.list('-created_date', 2000),
                CommunityEvent.list('-date', 1000),
                CommunityEventSignup.list('-created_date', 2000),
                CourseVariant.list('-created_date', 1000)
            ]);

            // Batch 4: News & Metrics
            const [
                jobMetricsData,
                newsSourcesData,
                newsItemsData,
                newsCategoriesData
            ] = await Promise.all([
                JobMetric.list('-date', 2000),
                NewsSource.list('-created_date', 1000),
                NewsItem.list('-publishedDate', 1000),
                NewsCategory.list('displayOrder', 1000)
            ]);

            // Calculate course date counts
            const calculatedCourseDatesCount = allCourseDates.reduce((acc, date) => {
                acc[date.courseId] = (acc[date.courseId] || 0) + 1;
                return acc;
            }, {});
            setCourseDatesCount(calculatedCourseDatesCount);

            // Calculate event signup counts
            const calculatedEventSignupsCount = allEventSignups.reduce((acc, signup) => {
                acc[signup.eventId] = (acc[signup.eventId] || 0) + 1;
                return acc;
            }, {});
            setEventSignupsCount(calculatedEventSignupsCount);

            // Set the consolidated data state
            setData({
                users: usersData,
                organisations: organisationsData,
                events: eventsData,
                courses: coursesData,
                jobs: jobsData,
                signups: allEventSignups,
                enquiries: enquiriesData,
                credentials: allCredentials,
                surveys: surveysData,
                surveyResponses: surveyResponsesData,
                communityEvents: communityEventsData, // Set community events
                communityEventSignups: communityEventSignupsData, // Set community event signups
                courseBookings: courseBookingsData, // Set course bookings
                courseDates: allCourseDates,
                courseVariants: courseVariantsData,
                jobMetrics: jobMetricsData || [],
                newsSources: newsSourcesData,
                newsItems: newsItemsData,
                newsCategories: newsCategoriesData || []
            });

        } catch (error) {
            console.error('Failed to fetch admin dashboard data:', error);
            toast({
                title: 'Error',
                description: `Failed to load dashboard data: ${error.message}`,
                variant: 'destructive'
            });
            setData({
                users: [], organisations: [], events: [], jobs: [], courses: [],
                signups: [], enquiries: [], credentials: [], surveys: [], surveyResponses: [],
                communityEvents: [], communityEventSignups: [], courseBookings: [],
                courseDates: [], courseVariants: [], jobMetrics: [],
                newsSources: [], newsItems: [], newsCategories: []
            });
            setCourseDatesCount({});
            setEventSignupsCount({});
        } finally {
            setLoading(false);
        }
    }, [toast]);

    // Initial data fetch when component mounts or user/userLoading changes
    useEffect(() => {
        if (!userLoading && user && user.role === 'admin') {
            fetchAllDashboardData();
        }
    }, [userLoading, user, fetchAllDashboardData]);

    // Derived data for display
    const activeMembers = useMemo(() => data.users.filter(u => u.membershipStatus === 'active'), [data.users]);
    const pendingApplications = useMemo(() => data.users.filter(u => u.membershipStatus === 'pending' && u.onboarding_completed), [data.users]);
    const newEnquiries = useMemo(() => data.enquiries.filter(e => e.status === 'new'), [data.enquiries]);
    const organisations = data.organisations || [];

    const associateMembers = useMemo(() => {
        const members = data.users.filter(u => u.membershipType === 'Associate' && u.membershipStatus === 'active');

        return members.sort((a, b) => {
            let aValue = a[associateSortField];
            let bValue = b[associateSortField];

            if (associateSortField === 'created_date') {
                aValue = new Date(aValue).getTime();
                bValue = new Date(bValue).getTime();
            } else if (associateSortField === 'credentialDate') {
                const credA = data.credentials.find(c => c.userId === a.id && c.credentialType === 'Associate Membership');
                const credB = data.credentials.find(c => c.userId === b.id && c.credentialType === 'Associate Membership');
                aValue = credA ? new Date(credA.issuedDate).getTime() : 0;
                bValue = credB ? new Date(credB.issuedDate).getTime() : 0;
            }

            if (typeof aValue === 'string') {
                aValue = aValue ? aValue.toLowerCase() : '';
                bValue = bValue ? bValue.toLowerCase() : '';
            } else if (associateSortField === 'organisationName') {
                aValue = a.organisationName ? a.organisationName.toLowerCase() : '';
                bValue = b.organisationName ? b.organisationName.toLowerCase() : '';
            }

            if (aValue < bValue) return associateSortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return associateSortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data.users, data.credentials, associateSortField, associateSortDirection]);

    const fullMembers = useMemo(() => {
        const members = data.users.filter(u => u.membershipType === 'Full' && u.membershipStatus === 'active');

        return members.sort((a, b) => {
            let aValue = a[fullSortField];
            let bValue = b[fullSortField];

            if (fullSortField === 'created_date') {
                aValue = new Date(aValue).getTime();
                bValue = new Date(bValue).getTime();
            }

            if (typeof aValue === 'string') {
                aValue = aValue ? aValue.toLowerCase() : '';
                bValue = bValue ? bValue.toLowerCase() : '';
            } else if (fullSortField === 'organisationName') {
                aValue = a.organisationName ? a.organisationName.toLowerCase() : '';
                bValue = b.organisationName ? b.organisationName.toLowerCase() : '';
            }

            if (aValue < bValue) return fullSortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return fullSortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data.users, fullSortField, fullSortDirection]);


    // Handlers
    const handleApprove = async (profile) => {
        try {
            await User.update(profile.id, { membershipStatus: 'active' });
            toast({ title: "Application Approved", description: `${profile.displayName || profile.full_name} is now an active member.` });
            fetchAllDashboardData();
        } catch (error) {
            toast({ title: "Error", description: `Failed to approve application: ${error.message}`, variant: "destructive" });
        }
    };

    const handleReject = async (profile) => {
        try {
            await User.update(profile.id, { membershipStatus: 'rejected' });
            toast({ title: "Application Rejected", description: `Application for ${profile.displayName || profile.full_name} has been rejected.` });
            fetchAllDashboardData();
        } catch (error) {
            toast({ title: "Error", description: `Failed to reject application: ${error.message}`, variant: "destructive" });
        }
    };

    const handlePreview = (profile) => {
        setSelectedUserForSheet(profile);
        setSheetOpen(true);
    };

    const handleManualUpgradeClick = async (profile) => {
        try {
            await User.update(profile.id, { membershipType: 'Full', membershipStatus: 'active' });
            toast({ title: "User Upgraded", description: `${profile.displayName || profile.full_name} has been upgraded to a Full member.` });
            fetchAllDashboardData();
        } catch (error) {
            toast({ title: "Error", description: `Failed to upgrade user: ${error.message}`, variant: "destructive" });
        }
    };

    const handleDeleteUser = (profile) => {
        setUserToDelete(profile);
    };

    const handleResetUser = async (profile) => {
        const confirmed = confirm(
            `Reset ${profile.displayName || profile.full_name} (${profile.email})?\n\n` +
            `This will:\n` +
            `• Cancel their Stripe subscription\n` +
            `• Clear CPD hours and credentials\n` +
            `• Reset to Associate Member status\n\n` +
            `This cannot be undone.`
        );

        if (!confirmed) return;

        try {
            const { data } = await resetUser({ userId: profile.id });

            if (data.success) {
                toast({
                    title: "User Reset",
                    description: data.message,
                });
                fetchAllDashboardData();
            } else {
                throw new Error(data.error || 'Failed to reset user');
            }
        } catch (error) {
            console.error('Error resetting user:', error);
            toast({
                title: "Reset Failed",
                description: error.message || "Failed to reset user. Please try again.",
                variant: "destructive"
            });
        }
    };

    const handleEventSaved = () => {
        setAddEventModalOpen(false);
        setEditingEvent(null);
        fetchAllDashboardData();
    };

    const handleAddEvent = () => {
        setEditingEvent(null);
        setAddEventModalOpen(true);
    };

    const handleEditEvent = (event) => {
        setEditingEvent(event);
        setAddEventModalOpen(true);
    };

    const handleViewSignups = (event) => {
        setSelectedEventForSignups(event);
        setSignupsSheetOpen(true);
    };

    const handleManageDates = (course) => {
        setSelectedCourseForDates(course);
        setManageDatesModalOpen(true);
    };

    const handleDatesUpdate = () => {
        fetchAllDashboardData();
    };

    const handleAddContent = (type) => {
        if (type === 'course') {
            setEditingCourse(null);
            setEditCourseModalOpen(true);
        } else if (type === 'job') {
            openAddJobModal();
        }
    };

    const handleEditCourse = (course) => {
        setEditingCourse(course);
        setEditCourseModalOpen(true);
    };

    const handleCourseSaved = () => {
        setEditCourseModalOpen(false);
        setEditingCourse(null);
        fetchAllDashboardData();
    };

    const handleEnquiryResolve = async (enquiry) => {
        try {
            await TrainingEnquiry.update(enquiry.id, { status: 'resolved' });
            toast({ title: "Enquiry Resolved", description: `Enquiry from ${enquiry.name} has been marked as resolved.` });
            fetchAllDashboardData();
        } catch (error) {
            toast({ title: "Error", description: `Failed to resolve enquiry: ${error.message}`, variant: "destructive" });
        }
    };

    const handleAssociateSort = (field) => {
        if (associateSortField === field) {
            setAssociateSortDirection(associateSortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setAssociateSortField(field);
            setAssociateSortDirection('asc');
        }
    };

    const handleFullSort = (field) => {
        if (fullSortField === field) {
            setFullDirection(fullSortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setFullSortField(field);
            setFullDirection('asc');
        }
    };

    const handleAddCommunityEvent = () => {
        setEditingCommunityEvent(null);
        setCommunityEventModalOpen(true);
    };

    const handleEditCommunityEvent = (event) => {
        setEditingCommunityEvent(event);
        setCommunityEventModalOpen(true);
    };

    const handleCommunityEventSaved = () => {
        setCommunityEventModalOpen(false);
        setEditingCommunityEvent(null);
        fetchAllDashboardData();
    };

    const handleReindexJobs = async () => {
        try {
            toast({ title: "Reindexing Jobs", description: "Submitting all active jobs to Google..." });
            const response = await reindexJobs();
            if (response && response.results) {
                const successCount = response.results.filter(r => r.success).length;
                toast({
                    title: "Reindexing Complete",
                    description: `Successfully submitted ${successCount} jobs to Google Indexing API.`
                });
            } else {
                toast({ title: "Reindexing Complete", description: response.message || "Process finished." });
            }
        } catch (error) {
            console.error('Reindexing failed:', error);
            toast({
                title: "Reindexing Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const handleBackfillUrls = async () => {
        try {
            toast({ title: "Backfilling URLs", description: "Updating all jobs with public URLs..." });
            // Fetch all jobs with a high limit to ensure we get them all
            const allJobs = await Job.list('-created_date', 1000);
            let updatedCount = 0;

            await Promise.all(allJobs.map(async (job) => {
                const slug = (job.title || 'job').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                const publicJobUrl = `https://www.ifs-safeguarding.co.uk/Job?id=${slug}-${job.id}`;

                if (job.publicJobUrl !== publicJobUrl) {
                    await Job.update(job.id, { publicJobUrl });
                    updatedCount++;
                }
            }));

            toast({
                title: "Backfill Complete",
                description: `Successfully updated ${updatedCount} jobs with public URLs.`
            });
            fetchAllDashboardData();
        } catch (error) {
            console.error('Backfill failed:', error);
            toast({
                title: "Backfill Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const handleBackfillApplicants = async () => {
        try {
            toast({ title: "Backfilling Applicants", description: "Processing user data..." });
            const response = await backfillApplicants();
            if (response && response.success) {
                toast({
                    title: "Backfill Complete",
                    description: response.data.message
                });
            } else {
                throw new Error(response.data?.error || "Unknown error");
            }
        } catch (error) {
            console.error('Backfill failed:', error);
            toast({
                title: "Backfill Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const handleFetchNews = async () => {
        try {
            toast({ title: "Fetching News", description: "Contacting configured sources (Forcing update)..." });
            const response = await ifs.functions.invoke('fetchNewsFromSources', { force: true });
            if (response.data) {
                toast({
                    title: "Fetch Complete",
                    description: `Success: ${response.data.success}, New Items: ${response.data.newItems}`
                });
                fetchAllDashboardData();
            }
        } catch (error) {
            console.error('Fetch failed:', error);
            toast({
                title: "Fetch Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const handleAddNewsSource = () => {
        setEditingNewsSource(null);
        setNewsSourceModalOpen(true);
    };

    const handleEditNewsSource = (source) => {
        setEditingNewsSource(source);
        setNewsSourceModalOpen(true);
    };

    const handleAddNewsArticle = () => {
        setEditingNewsArticle(null);
        setNewsArticleModalOpen(true);
    };

    const handleEditNewsArticle = (article) => {
        setEditingNewsArticle(article);
        setNewsArticleModalOpen(true);
    };

    const handleNewsArticleSaved = (savedArticle) => {
        // Optimistic update to avoid full dashboard refetch
        if (!savedArticle) {
            fetchAllDashboardData();
            return;
        }

        setData(prevData => {
            const newsItems = [...prevData.newsItems];
            const index = newsItems.findIndex(i => i.id === savedArticle.id);

            if (index > -1) {
                newsItems[index] = { ...newsItems[index], ...savedArticle };
            } else {
                newsItems.unshift(savedArticle);
            }

            // Resort by published date
            newsItems.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));

            return { ...prevData, newsItems };
        });
    };

    const handleAddNewsCategory = () => {
        setEditingNewsCategory(null);
        setNewsCategoryModalOpen(true);
    };

    const handleEditNewsCategory = (category) => {
        setEditingNewsCategory(category);
        setNewsCategoryModalOpen(true);
    };

    const handleDeleteNewsCategory = async (id) => {
        if (confirm('Are you sure you want to delete this category?')) {
            try {
                await ifs.entities.NewsCategory.delete(id);
                toast({ title: "Deleted", description: "Category removed." });
                fetchAllDashboardData();
            } catch (error) {
                toast({ title: "Error", description: error.message, variant: "destructive" });
            }
        }
    };

    const handleDeleteNewsArticle = async (id) => {
        if (confirm('Are you sure you want to delete this article?')) {
            try {
                await NewsItem.delete(id);
                toast({ title: "Deleted", description: "Article removed." });
                fetchAllDashboardData();
            } catch (error) {
                toast({ title: "Error", description: error.message, variant: "destructive" });
            }
        }
    };

    const handleDeleteNewsSource = async (id) => {
        if (confirm('Are you sure you want to delete this source?')) {
            try {
                await NewsSource.delete(id);
                toast({ title: "Deleted", description: "Source removed." });
                fetchAllDashboardData();
            } catch (error) {
                toast({ title: "Error", description: error.message, variant: "destructive" });
            }
        }
    };

    const handleSelectNewsItem = (id) => {
        setSelectedNewsItems(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSelectAllNewsItems = (filteredItems) => {
        if (selectedNewsItems.length === filteredItems.length) {
            setSelectedNewsItems([]);
        } else {
            setSelectedNewsItems(filteredItems.map(item => item.id));
        }
    };

    const handleBulkDeleteNews = async () => {
        if (!confirm(`Delete ${selectedNewsItems.length} articles?`)) return;
        try {
            await Promise.all(selectedNewsItems.map(id => NewsItem.delete(id)));
            toast({ title: "Deleted", description: `${selectedNewsItems.length} articles removed.` });
            setSelectedNewsItems([]);
            fetchAllDashboardData();
        } catch (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const handleBulkStatusUpdateNews = async (newStatus) => {
        try {
            await Promise.all(selectedNewsItems.map(id => NewsItem.update(id, { status: newStatus })));
            toast({ title: "Updated", description: `${selectedNewsItems.length} articles set to ${newStatus}.` });
            setSelectedNewsItems([]);
            fetchAllDashboardData();
        } catch (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const handleViewCommunitySignups = (event) => {
        setSelectedCommunityEventForSignups(event);
        setCommunitySignupsSheetOpen(true);
    };

    const handleDeleteOrganisation = (org) => {
        setOrgToDelete(org);
    };

    const handleSendCommunityReminders = async () => {
        setIsSendingReminders(true);
        try {
            toast({ title: "Sending Reminders", description: "Processing community event signups..." });
            const response = await ifs.functions.invoke('sendCommunityEventReminders', {
                hoursBeforeEvent: reminderHours
            });

            if (response.data.success) {
                toast({
                    title: "Reminders Sent",
                    description: `Successfully sent ${response.data.totalEmailsSent} reminder emails for ${response.data.eventsProcessed} event(s)`
                });
            } else {
                throw new Error(response.data.error || 'Failed to send reminders');
            }
        } catch (error) {
            console.error('Failed to send reminders:', error);
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsSendingReminders(false);
        }
    };

    const SortableHeader = ({ field, label, currentField, currentDirection, onSort }) => (
        <TableHead
            className="cursor-pointer hover:bg-slate-100 transition-colors select-none"
            onClick={() => onSort(field)}
        >
            <div className="flex items-center gap-2">
                {label}
                {currentField === field && (
                    <span className="text-xs">
                        {currentDirection === 'asc' ? '↑' : '↓'}
                    </span>
                )}
            </div>
        </TableHead>
    );

    const navBaseClasses = "relative inline-flex items-center gap-2 px-2 pb-3 pt-2 text-sm font-semibold tracking-wide border-b-4 transition-colors";
    const navInactiveClasses = "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300";
    const navActiveClasses = "border-[#7C3AED] text-[#7C3AED]";

    const NavButton = ({ tab, label, icon }) => {
        const isActive = activeTab === tab;
        return (
            <button
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`${navBaseClasses} ${isActive ? navActiveClasses : navInactiveClasses}`}
            >
                <span className="text-slate-400">{icon}</span>
                {label}
            </button>
        );
    };

    const NavDropdown = ({ label, icon, items }) => {
        const isActive = items.some((item) => item.tab === activeTab);
        return (
            <div className="relative group">
                <button
                    type="button"
                    className={`${navBaseClasses} ${isActive ? navActiveClasses : navInactiveClasses}`}
                >
                    <span className="text-slate-400">{icon}</span>
                    {label}
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
                <div className="absolute left-0 top-full z-50 w-56 pt-2">
                    <div className="pointer-events-none translate-y-1 rounded-md border border-slate-200 bg-white py-2 shadow-lg opacity-0 transition group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
                        {items.map((item) => (
                            <button
                                key={item.tab}
                                type="button"
                                onClick={() => setActiveTab(item.tab)}
                                className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition ${
                                    activeTab === item.tab
                                        ? "bg-slate-50 text-[#7C3AED]"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                            >
                                {item.icon && <span className="text-slate-400">{item.icon}</span>}
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const handleExportAllUsers = () => {
        try {
            const headers = [
                'ID',
                'Associate ID',
                'Email',
                'Role',
                'Full Name (Computed)',
                'Display Name',
                'First Name',
                'Last Name',
                'Phone Number',
                'City',
                'Country',
                'Job Role',
                'Organisation',
                'Organisation ID',
                'Organisation Role',
                'Sector',
                'Other Sector',
                'Subsector',
                'Other Subsector',
                'Safeguarding Role',
                'Had Induction',
                'Completed Training',
                'Training Refresh Frequency',
                'Attended Training Topics',
                'Other Training Details',
                'Receives Supervision',
                'Membership Type',
                'Membership Status',
                'Join Date',
                'Onboarding Completed',
                'Stripe Customer ID',
                'Stripe Subscription ID',
                'Stripe Subscription Status',
                'Subscription Start Date',
                'Subscription End Date',
                'CPD Hours',
                'Total CPD Earned',
                'Total CPD Spent',
                'Monthly CPD Hours',
                'Last CPD Allocation Date',
                'Onboarding Checklist Dismissed',
                'Has Seen Portal Tour',
                'Needs Application Processing',
                'Profile Image URL',
                'Is Unclaimed',
                'Welcome Email Sent At',
                'Has Posted Intro',
                'Certificates Count',
                'Job View Date',
                'Notes'
            ];

            const rows = data.users.map(user => {
                const associateCredential = data.credentials?.find(c =>
                    c.userId === user.id &&
                    c.credentialType === 'Associate Membership'
                );
                return [
                    user.id || 'N/A',
                    associateCredential?.id || 'N/A',
                    user.email || 'N/A',
                    user.role || 'N/A',
                    user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.full_name || 'N/A',
                    user.displayName || 'N/A',
                    user.firstName || 'N/A',
                    user.lastName || 'N/A',
                    user.phoneNumber || 'N/A',
                    user.city || 'N/A',
                    user.country || 'N/A',
                    user.jobRole || 'N/A',
                    user.organisationName || 'N/A',
                    user.organisationId || 'N/A',
                    user.organisationRole || 'N/A',
                    user.sector || 'N/A',
                    user.other_sector || 'N/A',
                    user.subsector || 'N/A',
                    user.other_sub_sector || 'N/A',
                    Array.isArray(user.safeguarding_role) ? user.safeguarding_role.join('; ') : (user.safeguarding_role || 'N/A'),
                    user.had_induction ? 'Yes' : 'No',
                    Array.isArray(user.completed_training) ? user.completed_training.join('; ') : (user.completed_training || 'N/A'),
                    user.training_refresh_frequency || 'N/A',
                    Array.isArray(user.attended_training_topics) ? user.attended_training_topics.join('; ') : (user.attended_training_topics || 'N/A'),
                    user.other_training_details || 'N/A',
                    user.receives_supervision ? 'Yes' : 'No',
                    user.membershipType || 'N/A',
                    user.membershipStatus || 'N/A',
                    user.created_date ? formatDate(user.created_date, 'dd/MM/yyyy HH:mm') : 'N/A',
                    user.onboarding_completed ? 'Yes' : 'No',
                    user.stripeCustomerId || 'N/A',
                    user.stripeSubscriptionId || 'N/A',
                    user.stripeSubscriptionStatus || 'N/A',
                    user.subscriptionStartDate ? formatDate(user.subscriptionStartDate, 'dd/MM/yyyy HH:mm') : 'N/A',
                    user.subscriptionEndDate ? formatDate(user.subscriptionEndDate, 'dd/MM/yyyy HH:mm') : 'N/A',
                    user.cpdHours || '0',
                    user.totalCpdEarned || '0',
                    user.totalCpdSpent || '0',
                    user.monthlyCpdHours || '0',
                    user.lastCpdAllocationDate ? formatDate(user.lastCpdAllocationDate, 'dd/MM/yyyy HH:mm') : 'N/A',
                    user.onboardingChecklistDismissed ? 'Yes' : 'No',
                    user.hasSeenPortalTour ? 'Yes' : 'No',
                    user.needsApplicationProcessing ? 'Yes' : 'No',
                    user.profileImageUrl || 'N/A',
                    user.isUnclaimed ? 'Yes' : 'No',
                    user.welcomeEmailSentAt ? formatDate(user.welcomeEmailSentAt, 'dd/MM/yyyy HH:mm') : 'N/A',
                    user.hasPostedIntro ? 'Yes' : 'No',
                    Array.isArray(user.certificates) ? user.certificates.length : 0,
                    user.jobViewTracker?.date || 'N/A',
                    user.notes || 'N/A'
                ];
            });

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', `all-users-detailed-${formatDate(new Date(), 'yyyy-MM-dd-HHmm')}.csv`);
            link.style.visibility = 'hidden';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast({
                title: "Export Successful",
                description: `Exported ${data.users.length} users with complete metadata to CSV`
            });
        } catch (error) {
            console.error('Failed to export users:', error);
            toast({
                title: "Export Failed",
                description: "Could not export user data. Please try again.",
                variant: "destructive"
            });
        }
    };

    const handleExportAssociateCSV = () => {
        try {
            const headers = [
                'Name',
                'Email',
                'Display Name',
                'First Name',
                'Last Name',
                'Organisation',
                'Organisation Role',
                'City',
                'Country',
                'Job Role',
                'Sector',
                'Other Sector',
                'Subsector',
                'Other Subsector',
                'Safeguarding Role',
                'Had Induction',
                'Completed Training',
                'Training Refresh Frequency',
                'Attended Training Topics',
                'Other Training Details',
                'Receives Supervision',
                'CPD Hours Balance',
                'Total CPD Earned',
                'Total CPD Spent',
                'Join Date',
                'Credential ID',
                'Verification Code',
                'Onboarding Completed',
                'Notes'
            ];

            const rows = associateMembers.map(member => {
                // Find the Associate Membership credential for this user
                const associateCredential = data.credentials.find(c =>
                    c.userId === member.id &&
                    c.credentialType === 'Associate Membership' &&
                    c.status === 'active'
                );

                // Safely handle all array fields
                const completedTraining = Array.isArray(member.completed_training)
                    ? member.completed_training.join('; ')
                    : (member.completed_training || 'N/A');

                const attendedTopics = Array.isArray(member.attended_training_topics)
                    ? member.attended_training_topics.join('; ')
                    : (member.attended_training_topics || 'N/A');

                const safeguardingRole = Array.isArray(member.safeguarding_role)
                    ? member.safeguarding_role.join('; ')
                    : (member.safeguarding_role || 'N/A');

                return [
                    member.displayName || `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.full_name || 'N/A',
                    member.email || 'N/A',
                    member.displayName || 'N/A',
                    member.firstName || 'N/A',
                    member.lastName || 'N/A',
                    member.organisationName || 'N/A',
                    member.organisationRole || 'N/A',
                    member.city || 'N/A',
                    member.country || 'N/A',
                    member.jobRole || 'N/A',
                    member.sector || 'N/A',
                    member.other_sector || 'N/A',
                    member.subsector || 'N/A',
                    member.other_sub_sector || 'N/A',
                    safeguardingRole,
                    member.had_induction ? 'Yes' : 'No',
                    completedTraining,
                    member.training_refresh_frequency || 'N/A',
                    attendedTopics,
                    member.other_training_details || 'N/A',
                    member.receives_supervision ? 'Yes' : 'No',
                    (member.cpdHours || 0).toFixed(1),
                    (member.totalCpdEarned || 0).toFixed(1),
                    (member.totalCpdSpent || 0).toFixed(1),
                    member.created_date ? formatDate(member.created_date, 'dd/MM/yyyy HH:mm') : 'N/A',
                    associateCredential?.id || 'N/A',
                    associateCredential?.verificationCode || 'N/A',
                    member.onboarding_completed ? 'Yes' : 'No',
                    member.notes || 'N/A'
                ];
            });

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', `associate-members-detailed-${formatDate(new Date(), 'yyyy-MM-dd-HHmm')}.csv`);
            link.style.visibility = 'hidden';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast({
                title: "Export Successful",
                description: `Exported ${associateMembers.length} Associate Members with complete data to CSV`
            });
        } catch (error) {
            console.error('Failed to export CSV:', error);
            toast({
                title: "Export Failed",
                description: "Could not export member data. Please try again.",
                variant: "destructive"
            });
        }
    };

    const handleExportFullCSV = () => {
        try {
            const headers = ['Name', 'Email', 'Organisation', 'Sector', 'Subsector', 'Safeguarding Role', 'Join Date', 'Subscription Status'];

            const rows = fullMembers.map(member => [
                member.displayName || `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.full_name || 'N/A',
                member.email || 'N/A',
                member.organisationName || 'N/A',
                member.sector || 'N/A',
                member.subsector || 'N/A',
                Array.isArray(member.safeguarding_role) ? member.safeguarding_role.join('; ') : (member.safeguarding_role || 'N/A'),
                member.created_date ? formatDate(member.created_date, 'dd/MM/yyyy') : 'N/A',
                member.stripeSubscriptionStatus || 'N/A'
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', `full-members-${formatDate(new Date(), 'yyyy-MM-dd')}.csv`);
            link.style.visibility = 'hidden';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast({
                title: "Export Successful",
                description: `Exported ${fullMembers.length} Full Members to CSV`
            });
        } catch (error) {
            console.error('Failed to export CSV:', error);
            toast({
                title: "Export Failed",
                description: "Could not export member data. Please try again.",
                variant: "destructive"
            });
        }
    };

    const handleExportAllEmails = () => {
        try {
            const headers = ['Email', 'Name', 'Membership Type', 'Status', 'Onboarding Completed', 'Join Date'];

            const rows = data.users.map(user => [
                user.email || 'N/A',
                user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.full_name || 'N/A',
                user.membershipType || 'N/A',
                user.membershipStatus || 'N/A',
                user.onboarding_completed ? 'Yes' : 'No',
                user.created_date ? formatDate(user.created_date, 'dd/MM/yyyy') : 'N/A'
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', `all-user-emails-${formatDate(new Date(), 'yyyy-MM-dd')}.csv`);
            link.style.visibility = 'hidden';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast({
                title: "Export Successful",
                description: `Exported ${data.users.length} user emails to CSV (including incomplete signups)`
            });
        } catch (error) {
            console.error('Failed to export emails:', error);
            toast({
                title: "Export Failed",
                description: "Could not export email data. Please try again.",
                variant: "destructive"
            });
        }
    };

    const getProgressStage = (user) => {
        if (!user.onboarding_completed) {
            return { stage: 'Signup Incomplete', color: 'bg-gray-100 text-gray-700' };
        }
        if (user.membershipStatus === 'pending') {
            return { stage: 'Application Pending', color: 'bg-yellow-100 text-yellow-700' };
        }
        if (user.membershipStatus === 'rejected') {
            return { stage: 'Application Rejected', color: 'bg-red-100 text-red-700' };
        }
        if (user.membershipStatus === 'active') {
            return { stage: 'Active Member', color: 'bg-green-100 text-green-700' };
        }
        if (user.membershipStatus === 'expired') {
            return { stage: 'Membership Expired', color: 'bg-orange-100 text-orange-700' };
        }
        if (user.membershipStatus === 'canceled') {
            return { stage: 'Membership Canceled', color: 'bg-red-100 text-red-700' };
        }
        return { stage: 'Unknown Status', color: 'bg-gray-100 text-gray-700' };
    };

    const handleGenerateCredential = async () => {
        if (!credentialForm.userId) {
            toast({
                title: "Error",
                description: "Please select a user",
                variant: "destructive"
            });
            return;
        }

        setIsGeneratingCredential(true);
        try {
            const metadata = {};

            if (credentialForm.credentialType === 'Masterclass Attendance') {
                if (!credentialForm.masterclassTitle) {
                    toast({
                        title: "Error",
                        description: "Please enter or select masterclass title",
                        variant: "destructive"
                    });
                    setIsGeneratingCredential(false);
                    return;
                }
                metadata.masterclassTitle = credentialForm.masterclassTitle;
                if (credentialForm.completionDate) metadata.completionDate = credentialForm.completionDate;
                if (credentialForm.hours) metadata.hours = parseFloat(credentialForm.hours);
            }

            if (credentialForm.credentialType === 'Course Completion') {
                if (!credentialForm.courseTitle) {
                    toast({
                        title: "Error",
                        description: "Please enter course title",
                        variant: "destructive"
                    });
                    setIsGeneratingCredential(false);
                    return;
                }
                metadata.courseTitle = credentialForm.courseTitle;
                if (credentialForm.completionDate) metadata.completionDate = credentialForm.completionDate;
                if (credentialForm.hours) metadata.hours = parseFloat(credentialForm.hours);
            }

            console.log('[AdminDashboard] Calling generateDigitalCredential with:', {
                userId: credentialForm.userId,
                credentialType: credentialForm.credentialType,
                metadata,
                sendEmail: credentialForm.sendEmail
            });

            const response = await generateDigitalCredential({
                userId: credentialForm.userId,
                credentialType: credentialForm.credentialType,
                metadata,
                sendEmail: credentialForm.sendEmail
            });

            console.log('[AdminDashboard] generateDigitalCredential response:', response);

            // If this is a masterclass credential and we have an eventId, create/update EventSignup record
            if (credentialForm.credentialType === 'Masterclass Attendance' && credentialForm.eventId && credentialForm.eventId !== '_none_' && response?.data?.credential) {
                try {
                    const selectedUser = data.users.find(u => u.id === credentialForm.userId);
                    const selectedEvent = data.events.find(e => e.id === credentialForm.eventId);

                    // Check if signup already exists
                    const existingSignup = data.signups.find(s =>
                        s.userId === credentialForm.userId && s.eventId === credentialForm.eventId
                    );

                    const verificationUrl = `https://ifs-safeguarding.co.uk/VerifyCredential?code=${response.data.credential.verificationCode}`;

                    if (existingSignup) {
                        // Update existing signup with credential info
                        await EventSignup.update(existingSignup.id, {
                            certificateUrl: verificationUrl,
                            digitalCredentialId: response.data.credential.id
                        });
                    } else if (selectedUser && selectedEvent) {
                        // Create new signup record
                        await EventSignup.create({
                            userId: credentialForm.userId,
                            eventId: credentialForm.eventId,
                            userEmail: selectedUser.email,
                            userName: selectedUser.displayName || selectedUser.full_name,
                            eventTitle: selectedEvent.title,
                            eventDate: selectedEvent.date,
                            eventType: selectedEvent.type,
                            eventLocation: selectedEvent.location,
                            certificateUrl: verificationUrl,
                            digitalCredentialId: response.data.credential.id
                        });
                    }
                } catch (signupError) {
                    console.error('Failed to create/update EventSignup:', signupError);
                    // Don't fail the whole operation, just log it
                }
            }

            toast({
                title: "Success",
                description: "Digital credential generated successfully",
            });

            setShowCredentialModal(false);
            setCredentialForm({
                userId: '',
                credentialType: 'Masterclass Attendance',
                masterclassTitle: '',
                courseTitle: '',
                completionDate: '',
                hours: '',
                eventId: '',
                sendEmail: false
            });
            fetchAllDashboardData(); // Refresh data to show new credential count

        } catch (error) {
            console.error('Failed to generate credential:', error);
            toast({
                title: "Error",
                description: `Failed to generate credential: ${error.message}`,
                variant: "destructive"
            });
        } finally {
            setIsGeneratingCredential(false);
        }
    };

    const handleGiftCpd = async () => {
        if (!giftCpdForm.userId || !giftCpdForm.hours) {
            toast({
                title: "Error",
                description: "Please select a user and enter the number of hours to gift",
                variant: "destructive"
            });
            return;
        }

        const hoursToGift = parseFloat(giftCpdForm.hours);
        if (isNaN(hoursToGift) || hoursToGift <= 0) {
            toast({
                title: "Error",
                description: "Please enter a valid number of hours",
                variant: "destructive"
            });
            return;
        }

        setIsGiftingCpd(true);
        try {
            const selectedUser = data.users.find(u => u.id === giftCpdForm.userId);
            if (!selectedUser) {
                throw new Error('User not found');
            }

            const currentCpdHours = selectedUser.cpdHours || 0;
            const newBalance = currentCpdHours + hoursToGift;

            // Update user's CPD balance
            await User.update(selectedUser.id, {
                cpdHours: newBalance,
                totalCpdEarned: (selectedUser.totalCpdEarned || 0) + hoursToGift
            });

            // Create transaction record using service role to ensure it's created properly
            await ifs.asServiceRole.entities.CreditTransaction.create({
                userId: selectedUser.id,
                userEmail: selectedUser.email,
                transactionType: 'allocation',
                amount: hoursToGift,
                balanceAfter: newBalance,
                description: giftCpdForm.description || 'Admin gift allocation',
                relatedEntityType: 'Manual',
                relatedEntityName: 'Admin Gift'
            });

            toast({
                title: "CPD Hours Gifted",
                description: `Successfully gifted ${hoursToGift.toFixed(1)} hour${hoursToGift !== 1 ? 's' : ''} to ${selectedUser.displayName || selectedUser.full_name}`
            });

            setShowGiftCpdModal(false);
            setGiftCpdForm({ userId: '', hours: '', description: '' });
            fetchAllDashboardData(); // Refresh data

        } catch (error) {
            console.error('Failed to gift CPD hours:', error);
            toast({
                title: "Error",
                description: `Failed to gift CPD hours: ${error.message}`,
                variant: "destructive"
            });
        } finally {
            setIsGiftingCpd(false);
        }
    };

    const handleGiftSeats = async () => {
        if (!giftSeatsForm.organisationId || !giftSeatsForm.seats) {
            toast({
                title: "Error",
                description: "Please select an organisation and enter the number of seats to gift",
                variant: "destructive"
            });
            return;
        }

        const seatsToGift = parseInt(giftSeatsForm.seats);
        if (isNaN(seatsToGift) || seatsToGift <= 0) {
            toast({
                title: "Error",
                description: "Please enter a valid number of seats",
                variant: "destructive"
            });
            return;
        }

        setIsGiftingSeats(true);
        try {
            const response = await ifs.functions.invoke('giftOrgSeats', {
                organisationId: giftSeatsForm.organisationId,
                seatsToGift,
                reason: giftSeatsForm.reason || 'Admin gift allocation'
            });

            if (response.data.success) {
                toast({
                    title: "Seats Gifted",
                    description: response.data.message
                });

                setShowGiftSeatsModal(false);
                setGiftSeatsForm({ organisationId: '', seats: '', reason: '' });
                fetchAllDashboardData();
            } else {
                throw new Error(response.data.error || 'Failed to gift seats');
            }

        } catch (error) {
            console.error('Failed to gift seats:', error);
            toast({
                title: "Error",
                description: `Failed to gift seats: ${error.message}`,
                variant: "destructive"
            });
        } finally {
            setIsGiftingSeats(false);
        }
    };


    if (userLoading || loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
            </div>
        );
    }

    if (!user || user.role !== 'admin') {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-lg text-slate-600">Access denied. Admin privileges required.</p>
            </div>
        );
    }

        return (
        <>
            <Toaster />
            <style>{`
                @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");
            `}</style>
            <div className="min-h-screen flex flex-col bg-[#F1F5F9] text-slate-900" style={{ fontFamily: "Inter, sans-serif" }}>
                <header className="bg-[#1E1B4B] text-white h-16 flex items-center px-6 justify-between sticky top-0 z-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#7C3AED] rounded flex items-center justify-center text-white font-bold text-xl">
                            IFS
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-sm tracking-tight leading-none uppercase">Independent Federation</span>
                            <span className="text-[10px] font-light text-white/70 tracking-widest uppercase">For Safeguarding</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <button className="relative text-white/80 hover:text-white transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-[#1E1B4B]" />
                        </button>
                        <div className="h-8 w-px bg-white/20" />
                        <div className="flex items-center gap-3 cursor-pointer group">
                            <div className="text-right hidden md:block">
                                <p className="text-xs font-semibold">{user.displayName || user.full_name || 'Admin User'}</p>
                                <p className="text-[10px] text-white/60 uppercase">System Manager</p>
                            </div>
                            <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center text-[#1E1B4B]">
                                <UserCheck className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </header>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                    <nav className="sticky top-16 z-40 bg-white border-b border-[#E2E8F0]">
                        <div className="px-6 flex gap-6 h-14 items-end">
                            <div className="flex h-full items-end gap-6">
                                <NavButton tab="overview" label="Overview" icon={<Activity className="w-4 h-4" />} />
                                <NavDropdown
                                    label="Membership & Organisations"
                                    icon={<Users className="w-4 h-4" />}
                                    items={[
                                        { tab: "all_users", label: "All Users", icon: <Users className="w-4 h-4" /> },
                                        { tab: "associates", label: "Associate Member", icon: <Users className="w-4 h-4" /> },
                                        { tab: "full-members", label: "Full Members", icon: <Crown className="w-4 h-4" /> },
                                        { tab: "organisations", label: "Organisations", icon: <Building2 className="w-4 h-4" /> }
                                    ]}
                                />
                                <NavDropdown
                                    label="Training"
                                    icon={<GraduationCap className="w-4 h-4" />}
                                    items={[
                                        { tab: "courses", label: "Courses", icon: <GraduationCap className="w-4 h-4" /> },
                                        { tab: "bookings", label: "Course Bookings", icon: <ListChecks className="w-4 h-4" /> }
                                    ]}
                                />
                                <NavDropdown
                                    label="Events"
                                    icon={<Calendar className="w-4 h-4" />}
                                    items={[
                                        { tab: "events", label: "Events", icon: <Calendar className="w-4 h-4" /> },
                                        { tab: "community", label: "Community Events", icon: <Coffee className="w-4 h-4" /> }
                                    ]}
                                />
                                <NavDropdown
                                    label="Jobs"
                                    icon={<Briefcase className="w-4 h-4" />}
                                    items={[
                                        { tab: "jobs", label: "Jobs", icon: <Briefcase className="w-4 h-4" /> },
                                        { tab: "job-review", label: "Job Review", icon: <Eye className="w-4 h-4" /> }
                                    ]}
                                />
                                <NavButton tab="analytics" label="Analytics" icon={<BarChart3 className="w-4 h-4" />} />
                                <NavButton tab="enquiries" label="Enquiries" icon={<Mail className="w-4 h-4" />} />
                                <NavButton tab="surveys" label="Surveys" icon={<MessageSquare className="w-4 h-4" />} />
                            </div>
                        </div>
                    </nav>

                    <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h1 className="text-2xl font-bold text-[#1E1B4B]">Dashboard Overview</h1>
                                    <p className="text-sm text-slate-500">Welcome back. Here is the latest summary for today.</p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        onClick={handleExportAllUsers}
                                        variant="outline"
                                        className="border-[#E2E8F0] text-sm"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Export All Users
                                    </Button>
                                    <Button
                                        onClick={handleExportAllEmails}
                                        variant="outline"
                                        className="border-[#E2E8F0] text-sm"
                                    >
                                        <Mail className="w-4 h-4 mr-2" />
                                        Export Emails
                                    </Button>
                                    <Button
                                        onClick={fetchAllDashboardData}
                                        className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm"
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Refresh
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-white border border-[#E2E8F0] shadow-sm">
                                <div className="p-6">
                                    <Dialog open={isJobModalOpen} onOpenChange={setJobModalOpen}>
                                        <DialogContent className="max-w-5xl w-full max-h-[90vh] overflow-hidden p-6">
                                            <DialogHeader>
                                                <DialogTitle>{jobModalJobId ? 'Edit Job Posting' : 'Add Job Posting'}</DialogTitle>
                                                <DialogDescription>
                                                    Update the job details and save to publish to the jobs board.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <EditJob
                                                key={jobModalKey}
                                                embedded
                                                jobId={jobModalJobId}
                                                onCancel={() => setJobModalOpen(false)}
                                                onSaved={handleJobSaved}
                                            />
                                        </DialogContent>
                                    </Dialog>
                                    {/* Overview Tab */}
                                    <TabsContent value="overview" className="space-y-6">
                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            <Card>
                                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                                    <Users className="h-4 w-4 text-slate-500" />
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-2xl font-bold">{data.users.length}</div>
                                                    <p className="text-xs text-slate-500">
                                                        Including {data.users.filter(u => !u.onboarding_completed).length} incomplete signups
                                                    </p>
                                                </CardContent>
                                            </Card>

                                            <Card>
                                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                    <CardTitle className="text-sm font-medium">Active Members</CardTitle>
                                                    <CheckCircle2 className="h-4 w-4 text-slate-500" />
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-2xl font-bold">{activeMembers.length}</div>
                                                    <p className="text-xs text-slate-500">
                                                        {associateMembers.length} Associates, {fullMembers.length} Full
                                                    </p>
                                                </CardContent>
                                            </Card>

                                            <Card>
                                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                    <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
                                                    <Clock className="h-4 w-4 text-slate-500" />
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-2xl font-bold">{pendingApplications.length}</div>
                                                    <p className="text-xs text-slate-500">Awaiting review</p>
                                                </CardContent>
                                            </Card>

                                            <Card>
                                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                    <CardTitle className="text-sm font-medium">Organisations</CardTitle>
                                                    <Building2 className="h-4 w-4 text-slate-500" />
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-2xl font-bold">{data.organisations.length}</div>
                                                    <p className="text-xs text-slate-500">
                                                        {data.organisations.filter(o => o.hasOrganisationalMembership && o.orgMembershipStatus === 'active').length} with membership
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                                            <Button asChild variant="outline" className="h-auto py-6 flex-col gap-2">
                                                <Link to={createPageUrl('AdminDashboard') + '?tab=pending_members'}>
                                                    <UserCheck className="w-6 h-6" />
                                                    <span>Review Applications</span>
                                                </Link>
                                            </Button>
                                            <Button onClick={() => setShowGiftCpdModal(true)} variant="outline" className="h-auto py-6 flex-col gap-2">
                                                <Award className="w-6 h-6 text-amber-600" />
                                                <span>Gift CPD Hours</span>
                                            </Button>
                                            <Button onClick={() => setShowDeductCpdModal(true)} variant="outline" className="h-auto py-6 flex-col gap-2">
                                                <MinusCircle className="w-6 h-6 text-red-600" />
                                                <span>Deduct CPD Hours</span>
                                            </Button>
                                            <Button asChild variant="outline" className="h-auto py-6 flex-col gap-2">
                                                <Link to={createPageUrl('EditEvent')}>
                                                    <Plus className="w-6 h-6" />
                                                    <span>Create Event</span>
                                                </Link>
                                            </Button>
                                            <Button asChild variant="outline" className="h-auto py-6 flex-col gap-2">
                                                <button type="button" onClick={openAddJobModal} className="flex flex-col items-center gap-2">
                                                    <Plus className="w-6 h-6" />
                                                    <span>Post Job</span>
                                                </button>
                                            </Button>
                                            <Button asChild variant="outline" className="h-auto py-6 flex-col gap-2">
                                                <Link to={createPageUrl('EditCourse')}>
                                                    <Plus className="w-6 h-6" />
                                                    <span>Add Course</span>
                                                </Link>
                                            </Button>
                                        </div>

                                        {/* Recent Activity Grid */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <Card>
                                                <CardHeader className="flex flex-row items-center justify-between">
                                                    <div>
                                                        <CardTitle>Recent Workshop Signups</CardTitle>
                                                        <CardDescription>Latest registrations</CardDescription>
                                                    </div>
                                                    <Button asChild variant="ghost" size="sm">
                                                        <Link to={createPageUrl('MemberMasterclasses')}>
                                                            View All <ExternalLink className="w-4 h-4 ml-2" />
                                                        </Link>
                                                    </Button>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-4">
                                                        {data.signups.slice(0, 5).map(signup => (
                                                            <div key={signup.id} className="flex items-center justify-between">
                                                                <div>
                                                                    <p className="font-medium text-sm">{signup.userName}</p>
                                                                    <p className="text-xs text-slate-500">{signup.eventTitle}</p>
                                                                </div>
                                                                <Badge variant="outline">{formatDate(signup.created_date, 'MMM d')}</Badge>
                                                            </div>
                                                        ))}
                                                        {data.signups.length === 0 && (
                                                            <p className="text-sm text-slate-500 text-center py-4">No signups yet</p>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card>
                                                <CardHeader className="flex flex-row items-center justify-between">
                                                    <div>
                                                        <CardTitle>Recent Training Enquiries</CardTitle>
                                                        <CardDescription>Latest course interests</CardDescription>
                                                    </div>
                                                    <Button asChild variant="ghost" size="sm">
                                                        <Link to={createPageUrl('CPDTraining')}>
                                                            View All <ExternalLink className="w-4 h-4 ml-2" />
                                                        </Link>
                                                    </Button>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-4">
                                                        {data.enquiries && data.enquiries.slice(0, 5).map(enquiry => (
                                                            <div key={enquiry.id} className="flex items-center justify-between">
                                                                <div>
                                                                    <p className="font-medium text-sm">{enquiry.name}</p>
                                                                    <p className="text-xs text-slate-500">{enquiry.courseTitle}</p>
                                                                </div>
                                                                <Badge variant={enquiry.status === 'new' ? 'default' : 'outline'}>
                                                                    {enquiry.status}
                                                                </Badge>
                                                            </div>
                                                        ))}
                                                        {(!data.enquiries || data.enquiries.length === 0) && (
                                                            <p className="text-sm text-slate-500 text-center py-4">No enquiries yet</p>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </TabsContent>

                                    {/* All Users Tab - NEW */}
                                    <TabsContent value="all_users" className="space-y-6">
                                        <Card>
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <CardTitle className="flex items-center gap-2">
                                                            <Users className="w-5 h-5" />
                                                            All Users ({data.users.length})
                                                        </CardTitle>
                                                        <CardDescription>Complete list of all users in the system, including incomplete signups</CardDescription>
                                                    </div>
                                                    <Button onClick={handleExportAllUsers} variant="outline">
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Export to CSV
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                {data.users.length === 0 ? (
                                                    <div className="text-center py-12">
                                                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                                        <p className="text-slate-600">No users found</p>
                                                    </div>
                                                ) : (
                                                    <div className="border rounded-lg overflow-hidden">
                                                        <Table>
                                                            <TableHeader className="bg-slate-50">
                                                                <TableRow>
                                                                    <TableHead>User</TableHead>
                                                                    <TableHead>Email</TableHead>
                                                                    <TableHead>Membership Type</TableHead>
                                                                    <TableHead>Progress Stage</TableHead>
                                                                    <TableHead>Onboarding</TableHead>
                                                                    <TableHead>Joined</TableHead>
                                                                    <TableHead className="text-right">Actions</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {data.users.map(member => {
                                                                    const progress = getProgressStage(member);
                                                                    return (
                                                                        <TableRow key={member.id} className="hover:bg-slate-50">
                                                                            <TableCell>
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="w-10 h-10 bg-slate-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                                                        {(member.displayName || member.full_name || member.email || 'U').charAt(0).toUpperCase()}
                                                                                    </div>
                                                                                    <div>
                                                                                        <p className="font-semibold text-slate-900">
                                                                                            {member.displayName || member.full_name || 'No name'}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            </TableCell>
                                                                            <TableCell className="text-slate-600">{member.email}</TableCell>
                                                                            <TableCell>
                                                                                <Badge variant={
                                                                                    member.membershipType === 'Full' ? 'default' :
                                                                                        member.membershipType === 'Associate' ? 'secondary' :
                                                                                            'outline'
                                                                                }>
                                                                                    {member.membershipType || 'Applicant'}
                                                                                </Badge>
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${progress.color}`}>
                                                                                    {progress.stage}
                                                                                </span>
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {member.onboarding_completed ? (
                                                                                    <div className="flex items-center gap-1 text-green-600">
                                                                                        <CheckCircle2 className="w-4 h-4" />
                                                                                        <span className="text-xs font-medium">Complete</span>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="flex items-center gap-1 text-gray-400">
                                                                                        <X className="w-4 h-4" />
                                                                                        <span className="text-xs font-medium">Incomplete</span>
                                                                                    </div>
                                                                                )}
                                                                            </TableCell>
                                                                            <TableCell className="text-slate-600">
                                                                                {member.created_date ? formatDate(member.created_date, 'dd MMM yyyy') : 'N/A'}
                                                                            </TableCell>
                                                                            <TableCell className="text-right">
                                                                                <DropdownMenu>
                                                                                    <DropdownMenuTrigger asChild>
                                                                                        <Button variant="ghost" size="icon">
                                                                                            <MoreVertical className="w-4 h-4" />
                                                                                        </Button>
                                                                                    </DropdownMenuTrigger>
                                                                                    <DropdownMenuContent align="end">
                                                                                        <DropdownMenuItem onClick={() => handlePreview(member)}>
                                                                                            <Eye className="w-4 h-4 mr-2" /> View Details
                                                                                        </DropdownMenuItem>
                                                                                        {member.membershipStatus === 'pending' && member.onboarding_completed && (
                                                                                            <>
                                                                                                <DropdownMenuItem onClick={() => handleApprove(member)}>
                                                                                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                                                                                                </DropdownMenuItem>
                                                                                                <DropdownMenuItem onClick={() => handleReject(member)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                                                                                    <X className="w-4 h-4 mr-2" /> Reject
                                                                                                </DropdownMenuItem>
                                                                                            </>
                                                                                        )}
                                                                                        {member.membershipType !== 'Full' && member.membershipStatus === 'active' && (
                                                                                            <DropdownMenuItem onClick={() => handleManualUpgradeClick(member)}>
                                                                                                <Shield className="w-4 h-4 mr-2" /> Upgrade to Full
                                                                                            </DropdownMenuItem>
                                                                                        )}
                                                                                        <DropdownMenuItem asChild>
                                                                                            <Link to={`${createPageUrl('Dashboard')}?viewAs=${member.id}`}>
                                                                                                <ExternalLink className="w-4 h-4 mr-2" /> View as User
                                                                                            </Link>
                                                                                        </DropdownMenuItem>
                                                                                        <DropdownMenuItem onClick={() => handleResetUser(member)} className="text-orange-600 focus:text-orange-600 focus:bg-orange-50">
                                                                                            <RefreshCw className="w-4 h-4 mr-2" /> Reset User
                                                                                        </DropdownMenuItem>
                                                                                        <DropdownMenuItem onClick={() => handleDeleteUser(member)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                                                                            <Trash2 className="w-4 h-4 mr-2" /> Delete User
                                                                                        </DropdownMenuItem>
                                                                                    </DropdownMenuContent>
                                                                                </DropdownMenu>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    );
                                                                })}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="pending_members">
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <h2 className="text-2xl font-bold">Pending Membership Applications</h2>
                                            </div>
                                            <UsersTable
                                                users={pendingApplications}
                                                onApprove={handleApprove}
                                                onReject={handleReject}
                                                onPreview={handlePreview}
                                                onManualUpgrade={handleManualUpgradeClick}
                                                onDelete={handleDeleteUser}
                                                onReset={handleResetUser}
                                            />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="associates" className="space-y-6">
                                        <Card>
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <CardTitle className="flex items-center gap-2">
                                                            <Users className="w-5 h-5" />
                                                            Associate Members ({associateMembers.length})
                                                        </CardTitle>
                                                        <CardDescription>All active Associate members in the system</CardDescription>
                                                    </div>
                                                    <Button onClick={handleExportAssociateCSV} variant="outline">
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Export to CSV
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                {associateMembers.length === 0 ? (
                                                    <div className="text-center py-12">
                                                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                                        <p className="text-slate-600">No Associate members yet</p>
                                                    </div>
                                                ) : (
                                                    <div className="border rounded-lg overflow-x-auto">
                                                        <Table>
                                                            <TableHeader className="bg-slate-50">
                                                                <TableRow>
                                                                    <SortableHeader
                                                                        field="displayName"
                                                                        label="Name"
                                                                        currentField={associateSortField}
                                                                        currentDirection={associateSortDirection}
                                                                        onSort={handleAssociateSort}
                                                                    />
                                                                    <SortableHeader
                                                                        field="email"
                                                                        label="Email"
                                                                        currentField={associateSortField}
                                                                        currentDirection={associateSortDirection}
                                                                        onSort={handleAssociateSort}
                                                                    />
                                                                    <SortableHeader
                                                                        field="organisationName"
                                                                        label="Organisation"
                                                                        currentField={associateSortField}
                                                                        currentDirection={associateSortDirection}
                                                                        onSort={handleAssociateSort}
                                                                    />
                                                                    <SortableHeader
                                                                        field="sector"
                                                                        label="Sector"
                                                                        currentField={associateSortField}
                                                                        currentDirection={associateSortDirection}
                                                                        onSort={handleAssociateSort}
                                                                    />
                                                                    <SortableHeader
                                                                        field="created_date"
                                                                        label="Joined"
                                                                        currentField={associateSortField}
                                                                        currentDirection={associateSortDirection}
                                                                        onSort={handleAssociateSort}
                                                                    />
                                                                    <SortableHeader
                                                                        field="credentialDate"
                                                                        label="Credential Date"
                                                                        currentField={associateSortField}
                                                                        currentDirection={associateSortDirection}
                                                                        onSort={handleAssociateSort}
                                                                    />
                                                                    <TableHead>Phone</TableHead>
                                                                    <TableHead className="text-right">Actions</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {associateMembers.map(member => (
                                                                    <TableRow key={member.id} className="hover:bg-slate-50">
                                                                        <TableCell>
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                                                    {(member.displayName || member.full_name || 'U').charAt(0).toUpperCase()}
                                                                                </div>
                                                                                <div>
                                                                                    <p className="font-semibold text-slate-900">{member.displayName || member.full_name}</p>
                                                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                                                                                        Associate
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell className="text-slate-600">{member.email}</TableCell>
                                                                        <TableCell>
                                                                            {member.organisationName ? (
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                                                                    <span className="text-sm text-slate-600">{member.organisationName}</span>
                                                                                </div>
                                                                            ) : (
                                                                                <span className="text-sm text-slate-400">No organisation</span>
                                                                            )}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            {member.sector ? (
                                                                                <Badge variant="outline">{member.sector}</Badge>
                                                                            ) : (
                                                                                <span className="text-sm text-slate-400">N/A</span>
                                                                            )}
                                                                        </TableCell>
                                                                        <TableCell className="text-slate-600">
                                                                            {member.created_date ? formatDate(member.created_date, 'dd MMM yyyy') : 'N/A'}
                                                                        </TableCell>
                                                                        <TableCell className="text-slate-600">
                                                                            {(() => {
                                                                                const cred = data.credentials && data.credentials.find(c => c.userId === member.id && c.credentialType === 'Associate Membership');
                                                                                return (cred && cred.issuedDate) ? formatDate(cred.issuedDate, 'dd MMM yyyy') : 'N/A';
                                                                            })()}
                                                                        </TableCell>
                                                                        <TableCell className="text-slate-600">
                                                                            {member.phoneNumber || 'N/A'}
                                                                        </TableCell>
                                                                        <TableCell className="text-right">
                                                                            <div className="flex gap-1 justify-end">
                                                                                <Button
                                                                                    asChild
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                >
                                                                                    <Link to={`${createPageUrl('EditUser')}?id=${member.id}`}>
                                                                                        <Edit className="w-4 h-4 mr-1" />
                                                                                        Edit
                                                                                    </Link>
                                                                                </Button>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    onClick={() => handleResetUser(member)}
                                                                                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                                                                >
                                                                                    <RefreshCw className="w-4 h-4" />
                                                                                </Button>
                                                                            </div>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="full-members" className="space-y-6">
                                        <Card>
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <CardTitle className="flex items-center gap-2">
                                                            <Crown className="w-5 h-5 text-amber-600" />
                                                            Full Members ({fullMembers.length})
                                                        </CardTitle>
                                                        <CardDescription>All active Full members with premium benefits</CardDescription>
                                                    </div>
                                                    <Button onClick={handleExportFullCSV} variant="outline">
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Export to CSV
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                {fullMembers.length === 0 ? (
                                                    <div className="text-center py-12">
                                                        <Crown className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                                        <p className="text-slate-600">No Full members yet</p>
                                                    </div>
                                                ) : (
                                                    <div className="border rounded-lg overflow-hidden">
                                                        <Table>
                                                            <TableHeader className="bg-slate-50">
                                                                <TableRow>
                                                                    <SortableHeader
                                                                        field="displayName"
                                                                        label="Name"
                                                                        currentField={fullSortField}
                                                                        currentDirection={fullSortDirection}
                                                                        onSort={handleFullSort}
                                                                    />
                                                                    <SortableHeader
                                                                        field="email"
                                                                        label="Email"
                                                                        currentField={fullSortField}
                                                                        currentDirection={fullSortDirection}
                                                                        onSort={handleFullSort}
                                                                    />
                                                                    <SortableHeader
                                                                        field="organisationName"
                                                                        label="Organisation"
                                                                        currentField={fullSortField}
                                                                        currentDirection={fullSortDirection}
                                                                        onSort={handleFullSort}
                                                                    />
                                                                    <SortableHeader
                                                                        field="created_date"
                                                                        label="Joined"
                                                                        currentField={fullSortField}
                                                                        currentDirection={fullSortDirection}
                                                                        onSort={handleFullSort}
                                                                    />
                                                                    <TableHead className="text-right">Actions</TableHead>
                                                                </TableRow>
                                                            </TableHeader>

                                                            <TableBody>
                                                                {fullMembers.map(member => (
                                                                    <TableRow key={member.id} className="hover:bg-slate-50">
                                                                        <TableCell>
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                                                    {(member.displayName || member.full_name || 'U').charAt(0).toUpperCase()}
                                                                                </div>
                                                                                <div>
                                                                                    <p className="font-semibold text-slate-900">{member.displayName || member.full_name}</p>
                                                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                                                                                        Full Member
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell className="text-slate-600">{member.email}</TableCell>
                                                                        <TableCell>
                                                                            {member.organisationName ? (
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                                                                    <span className="text-sm text-slate-600">{member.organisationName}</span>
                                                                                </div>
                                                                            ) : (
                                                                                <span className="text-sm text-slate-400">No organisation</span>
                                                                            )}
                                                                        </TableCell>
                                                                        <TableCell className="text-slate-600">
                                                                            {formatDate(member.created_date, 'dd MMM yyyy')}
                                                                        </TableCell>
                                                                        <TableCell className="text-right">
                                                                            <div className="flex gap-1 justify-end">
                                                                                <Button variant="ghost" size="sm" asChild>
                                                                                    <Link to={createPageUrl(`EditUser?id=${member.id}`)}>
                                                                                        <Edit className="w-4 h-4" />
                                                                                    </Link>
                                                                                </Button>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    onClick={() => handleResetUser(member)}
                                                                                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                                                                >
                                                                                    <RefreshCw className="w-4 h-4" />
                                                                                </Button>
                                                                            </div>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="organisations" className="space-y-6">
                                        <Card>
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <CardTitle className="flex items-center gap-2">
                                                            <Building2 className="w-5 h-5" />
                                                            Organisations ({data.organisations.length})
                                                        </CardTitle>
                                                        <CardDescription>All organisations registered on the platform</CardDescription>
                                                    </div>
                                                    <Button onClick={() => setShowGiftSeatsModal(true)}>
                                                        <Award className="w-4 h-4 mr-2" />
                                                        Gift Seats
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                {data.organisations.length === 0 ? (
                                                    <div className="text-center py-12">
                                                        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                                        <p className="text-slate-600">No organisations yet</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {data.organisations.map(org => {
                                                            const memberCount = data.users.filter(u => u.organisationId === org.id).length;
                                                            const hasOrgMembership = org.hasOrganisationalMembership && org.orgMembershipStatus === 'active';

                                                            return (
                                                                <div key={org.id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group">
                                                                    <div className="flex items-center gap-4">
                                                                        {org.logoUrl ? (
                                                                            <img src={org.logoUrl} alt={org.name} className="w-12 h-12 rounded-lg object-cover" />
                                                                        ) : (
                                                                            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white font-semibold text-lg">
                                                                                {org.name.charAt(0).toUpperCase()}
                                                                            </div>
                                                                        )}
                                                                        <div>
                                                                            <p className="font-semibold text-slate-900">{org.name}</p>
                                                                            <div className="flex items-center gap-3 mt-1">
                                                                                <div className="flex items-center gap-1">
                                                                                    <Users className="w-3 h-3 text-slate-400" />
                                                                                    <span className="text-xs text-slate-600">{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
                                                                                </div>
                                                                                {org.sector && (
                                                                                    <>
                                                                                        <span className="text-xs text-slate-400">•</span>
                                                                                        <span className="text-xs text-slate-600">{org.sector}</span>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        {org.organisationType === 'member' ? (
                                                                            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-green-100 text-green-700 border border-green-200 flex items-center gap-1">
                                                                                <Crown className="w-3 h-3" />
                                                                                Member Org
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-200 text-slate-700">
                                                                                Registered
                                                                            </span>
                                                                        )}
                                                                        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-200 text-slate-700">
                                                                            {org.status}
                                                                        </span>
                                                                        {org.organisationType === 'registered' && (
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={async () => {
                                                                                    try {
                                                                                        await Organisation.update(org.id, {
                                                                                            organisationType: 'member',
                                                                                            subscriptionStatus: 'active',
                                                                                            subscriptionStartDate: new Date().toISOString()
                                                                                        });
                                                                                        toast({
                                                                                            title: "Organisation Upgraded",
                                                                                            description: `${org.name} is now a Member Organisation`
                                                                                        });
                                                                                        fetchAllDashboardData();
                                                                                    } catch (error) {
                                                                                        toast({
                                                                                            title: "Upgrade Failed",
                                                                                            description: error.message,
                                                                                            variant: "destructive"
                                                                                        });
                                                                                    }
                                                                                }}
                                                                                className="text-green-600 border-green-600 hover:bg-green-50"
                                                                            >
                                                                                <Crown className="w-3 h-3 mr-1" />
                                                                                Upgrade
                                                                            </Button>
                                                                        )}
                                                                        <DropdownMenu>
                                                                            <DropdownMenuTrigger asChild>
                                                                                <Button variant="ghost" size="sm">
                                                                                    <MoreVertical className="w-4 h-4" />
                                                                                </Button>
                                                                            </DropdownMenuTrigger>
                                                                            <DropdownMenuContent align="end">
                                                                                <DropdownMenuItem onClick={() => {
                                                                                    const url = `${createPageUrl('ManageOrganisation')}?viewAs=${org.primaryContactId}`;
                                                                                    window.open(url, '_blank');
                                                                                }}>
                                                                                    <ExternalLink className="w-4 h-4 mr-2" /> View
                                                                                </DropdownMenuItem>
                                                                                <DropdownMenuItem
                                                                                    onClick={() => handleDeleteOrganisation(org)}
                                                                                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                                                >
                                                                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                                                </DropdownMenuItem>
                                                                            </DropdownMenuContent>
                                                                        </DropdownMenu>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    {/* Credentials Management Tab - NEW */}
                                    <TabsContent value="credentials" className="space-y-6">
                                        <Card>
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <CardTitle className="flex items-center gap-2">
                                                            <Award className="w-5 h-5" />
                                                            Digital Credentials Management
                                                        </CardTitle>
                                                        <CardDescription>Issue and manage digital credentials for members</CardDescription>
                                                    </div>
                                                    <Button onClick={() => setShowCredentialModal(true)}>
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Generate Credential
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <Award className="w-8 h-8 text-purple-600" />
                                                            <div>
                                                                <p className="text-sm text-purple-600 font-medium">Total Credentials</p>
                                                                <p className="text-2xl font-bold text-purple-900">
                                                                    {data.credentials.length}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <Users className="w-8 h-8 text-blue-600" />
                                                            <div>
                                                                <p className="text-sm text-blue-600 font-medium">Associate Credentials</p>
                                                                <p className="text-2xl font-bold text-blue-900">
                                                                    {data.credentials.filter(c => c.credentialType === 'Associate Membership').length}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <Crown className="w-8 h-8 text-green-600" />
                                                            <div>
                                                                <p className="text-sm text-green-600 font-medium">Full Member Credentials</p>
                                                                <p className="text-2xl font-bold text-green-900">
                                                                    {data.credentials.filter(c => c.credentialType === 'Full Membership').length}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <GraduationCap className="w-8 h-8 text-orange-600" />
                                                            <div>
                                                                <p className="text-sm text-orange-600 font-medium">Course/Workshop</p>
                                                                <p className="text-2xl font-bold text-orange-900">
                                                                    {data.credentials.filter(c => c.credentialType === 'Masterclass Attendance' || c.credentialType === 'Course Completion').length}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                    <h3 className="text-sm font-semibold text-blue-900 mb-2">About Digital Credentials</h3>
                                                    <p className="text-sm text-blue-800">
                                                        Digital credentials are automatically generated for Associate and Full memberships.
                                                        Use this panel to manually issue credentials for masterclass attendance, course completion,
                                                        or to regenerate membership credentials if needed.
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    {/* Surveys Management Tab */}
                                    <TabsContent value="surveys" className="space-y-6">
                                        <Card>
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <CardTitle className="flex items-center gap-2">
                                                            <MessageSquare className="w-5 h-5" />
                                                            Surveys ({data.surveys.length})
                                                        </CardTitle>
                                                        <CardDescription>Create and manage member feedback surveys</CardDescription>
                                                    </div>
                                                    <Button asChild>
                                                        <Link to={createPageUrl('EditSurvey')}>
                                                            <Plus className="w-4 h-4 mr-2" />
                                                            Create Survey
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                {data.surveys.length === 0 ? (
                                                    <div className="text-center py-12">
                                                        <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                                        <p className="text-slate-600 mb-4">No surveys created yet</p>
                                                        <Button asChild>
                                                            <Link to={createPageUrl('EditSurvey')}>
                                                                <Plus className="w-4 h-4 mr-2" />
                                                                Create Your First Survey
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {data.surveys.map(survey => {
                                                            const surveyResponses = data.surveyResponses.filter(r => r.surveyId === survey.id);

                                                            return (
                                                                <div key={survey.id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200">
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-3 mb-2">
                                                                            <h3 className="font-semibold text-slate-900">{survey.title}</h3>
                                                                            <Badge variant={
                                                                                survey.status === 'active' ? 'default' :
                                                                                    survey.status === 'draft' ? 'secondary' : 'outline'
                                                                            }>
                                                                                {survey.status}
                                                                            </Badge>
                                                                        </div>
                                                                        <div className="flex items-center gap-4 text-sm text-slate-600">
                                                                            <div className="flex items-center gap-1">
                                                                                <Users className="w-3.5 h-3.5" />
                                                                                <span>{surveyResponses.length} response{surveyResponses.length !== 1 ? 's' : ''}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-1">
                                                                                <ListChecks className="w-3.5 h-3.5" />
                                                                                <span>{survey.questions?.length || 0} question{survey.questions?.length !== 1 ? 's' : ''}</span>
                                                                            </div>
                                                                            {!survey.isAlwaysAvailable && survey.endDate && (
                                                                                <Badge variant="outline" className="text-xs">
                                                                                    Closes {formatDate(survey.endDate, 'MMM d')}
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <Button variant="outline" size="sm" asChild>
                                                                            <Link to={createPageUrl('SurveyResponses') + `?id=${survey.id}`}>
                                                                                <BarChart3 className="w-4 h-4 mr-2" />
                                                                                View Responses
                                                                            </Link>
                                                                        </Button>
                                                                        <Button variant="outline" size="sm" asChild>
                                                                            <Link to={createPageUrl('EditSurvey') + `?id=${survey.id}`}>
                                                                                <Edit2 className="w-4 h-4 mr-2" />
                                                                                Edit
                                                                            </Link>
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="analytics">
                                        <div>
                                            <h2 className="text-2xl font-bold mb-4">Membership Analytics</h2>
                                            <MembershipAnalyticsTab
                                                users={data.users}
                                                bookings={data.courseBookings}
                                                organisations={data.organisations}
                                            />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="courses">
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <h2 className="text-2xl font-bold">Courses</h2>
                                                <Button onClick={() => handleAddContent('course')}><Plus className="w-4 h-4 mr-2" /> Add Course</Button>
                                            </div>
                                            <Card>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Title</TableHead>
                                                            <TableHead>Level</TableHead>
                                                            <TableHead>Scheduled Dates</TableHead>
                                                            <TableHead className="text-right w-[200px]">Actions</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {data.courses.length === 0 ? (
                                                            <TableRow><TableCell colSpan="4" className="py-12 text-center text-slate-500">No courses found. Click "Add Course" to create one.</TableCell></TableRow>
                                                        ) : (
                                                            data.courses.map(course => (
                                                                <TableRow key={course.id}>
                                                                    <TableCell className="font-medium">{course.title}</TableCell>
                                                                    <TableCell><Badge variant="secondary">{course.level}</Badge></TableCell>
                                                                    <TableCell>{courseDatesCount[course.id] || 0}</TableCell>
                                                                    <TableCell className="text-right">
                                                                        <div className="flex gap-2 justify-end">
                                                                            <Button variant="outline" size="sm" onClick={() => handleManageDates(course)}>
                                                                                <CalendarDays className="w-4 h-4 mr-2" /> Dates
                                                                            </Button>
                                                                            <Button variant="outline" size="sm" onClick={() => handleEditCourse(course)}>
                                                                                <Edit2 className="w-4 h-4 mr-2" /> Edit
                                                                            </Button>
                                                                        </div>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </Card>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="events">
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <h2 className="text-2xl font-bold">Events</h2>
                                                <Button onClick={handleAddEvent}><Plus className="w-4 h-4 mr-2" /> Add Event</Button>
                                            </div>
                                            <Card>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Title</TableHead>
                                                            <TableHead>Date</TableHead>
                                                            <TableHead>Type</TableHead>
                                                            <TableHead>Signups</TableHead>
                                                            <TableHead className="text-right w-[120px]">Actions</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {data.events.length === 0 ? (
                                                            <TableRow><TableCell colSpan="5" className="py-12 text-center text-slate-500">No events found. Click "Add Event" to create one.</TableCell></TableRow>
                                                        ) : (
                                                            data.events.map(event => (
                                                                <TableRow key={event.id}>
                                                                    <TableCell className="font-medium">{event.title}</TableCell>
                                                                    <TableCell>{formatDate(event.date, 'dd MMM yyyy')}</TableCell>
                                                                    <TableCell><Badge variant="outline">{event.type}</Badge></TableCell>
                                                                    <TableCell>{eventSignupsCount[event.id] || 0}</TableCell>
                                                                    <TableCell className="text-right">
                                                                        <div className="flex gap-2 justify-end">
                                                                            <Button variant="outline" size="sm" onClick={() => handleViewSignups(event)}>
                                                                                <Users className="w-4 h-4 mr-2" /> Signups
                                                                            </Button>
                                                                            <Button variant="outline" size="sm" onClick={() => handleEditEvent(event)}>
                                                                                <Edit2 className="w-4 h-4 mr-2" /> Edit
                                                                            </Button>
                                                                        </div>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </Card>
                                        </div>
                                    </TabsContent>

                                    {/* Course Bookings Tab */}
                                    <TabsContent value="bookings">
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <h2 className="text-2xl font-bold">Course Bookings</h2>
                                                <Button onClick={() => setAddBookingModalOpen(true)}>
                                                    <Plus className="w-4 h-4 mr-2" /> Manual Booking
                                                </Button>
                                            </div>
                                            <Card>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>User</TableHead>
                                                            <TableHead>Course</TableHead>
                                                            <TableHead>Date/Time</TableHead>
                                                            <TableHead>Payment Method</TableHead>
                                                            <TableHead>Status</TableHead>
                                                            <TableHead className="text-right">Actions</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {data.courseBookings.length === 0 ? (
                                                            <TableRow><TableCell colSpan="6" className="py-12 text-center text-slate-500">No bookings found.</TableCell></TableRow>
                                                        ) : (
                                                            data.courseBookings.map(booking => (
                                                                <TableRow key={booking.id}>
                                                                    <TableCell>
                                                                        <div className="font-medium">{booking.userName}</div>
                                                                        <div className="text-xs text-slate-500">{booking.userEmail}</div>
                                                                    </TableCell>
                                                                    <TableCell>{booking.courseTitle}</TableCell>
                                                                    <TableCell>
                                                                        <div className="text-sm">{formatDate(booking.selectedDate, 'dd MMM yyyy')}</div>
                                                                        <div className="text-xs text-slate-500">{booking.selectedTime}</div>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Badge variant="outline" className="uppercase text-[10px]">
                                                                            {booking.paymentMethod}
                                                                        </Badge>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                                                                            {booking.status}
                                                                        </Badge>
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        {booking.status === 'pending' && (
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                className="text-green-600 border-green-200 hover:bg-green-50"
                                                                                onClick={async () => {
                                                                                    try {
                                                                                        await CourseBooking.update(booking.id, { status: 'confirmed' });
                                                                                        toast({ title: "Booking Confirmed", description: "The booking has been confirmed." });
                                                                                        fetchAllDashboardData();
                                                                                    } catch (e) {
                                                                                        toast({ title: "Error", description: e.message, variant: "destructive" });
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <CheckCircle2 className="w-4 h-4 mr-1" /> Confirm
                                                                            </Button>
                                                                        )}
                                                                        {booking.status !== 'cancelled' && (
                                                                            <Button
                                                                                size="sm"
                                                                                variant="ghost"
                                                                                className="text-red-600 hover:bg-red-50 ml-1"
                                                                                onClick={async () => {
                                                                                    if (confirm('Are you sure you want to cancel this booking?')) {
                                                                                        try {
                                                                                            await CourseBooking.update(booking.id, { status: 'cancelled' });
                                                                                            toast({ title: "Booking Cancelled", description: "The booking has been cancelled." });
                                                                                            fetchAllDashboardData();
                                                                                        } catch (e) {
                                                                                            toast({ title: "Error", description: e.message, variant: "destructive" });
                                                                                        }
                                                                                    }
                                                                                }}
                                                                            >
                                                                                Cancel
                                                                            </Button>
                                                                        )}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </Card>
                                        </div>
                                    </TabsContent>

                                    {/* Community Events Tab - NEW */}
                                    <TabsContent value="community" className="space-y-6">
                                        <Card>
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <CardTitle className="flex items-center gap-2">
                                                            <Coffee className="w-5 h-5" />
                                                            Community Events ({data.communityEvents.length})
                                                        </CardTitle>
                                                        <CardDescription>Manage forums, coffee mornings, and networking events</CardDescription>
                                                    </div>
                                                    <Button onClick={handleAddCommunityEvent}>
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Add Event
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                {data.communityEvents.length === 0 ? (
                                                    <div className="text-center py-12">
                                                        <Coffee className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                                        <p className="text-slate-600 mb-4">No community events yet</p>
                                                        <Button onClick={handleAddCommunityEvent}>
                                                            <Plus className="w-4 h-4 mr-2" />
                                                            Create First Event
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Title</TableHead>
                                                                <TableHead>Type</TableHead>
                                                                <TableHead>Date</TableHead>
                                                                <TableHead>Location</TableHead>
                                                                <TableHead>Participants</TableHead>
                                                                <TableHead>Status</TableHead>
                                                                <TableHead className="text-right">Actions</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {data.communityEvents.map(event => {
                                                                const signupCount = data.communityEventSignups.filter(s => s.eventId === event.id).length;

                                                                return (
                                                                    <TableRow key={event.id}>
                                                                        <TableCell className="font-medium">{event.title}</TableCell>
                                                                        <TableCell>
                                                                            <Badge variant="outline">{event.type}</Badge>
                                                                        </TableCell>
                                                                        <TableCell>{formatDate(event.date, 'dd MMM yyyy')}</TableCell>
                                                                        <TableCell className="text-sm text-slate-600">{event.location}</TableCell>
                                                                        <TableCell>
                                                                            {signupCount}
                                                                            {event.maxParticipants && ` / ${event.maxParticipants}`}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Badge variant={
                                                                                event.status === 'Active' ? 'default' :
                                                                                    event.status === 'Full' ? 'secondary' :
                                                                                        event.status === 'Cancelled' ? 'destructive' : 'outline'
                                                                            }>
                                                                                {event.status}
                                                                            </Badge>
                                                                        </TableCell>
                                                                        <TableCell className="text-right">
                                                                            <div className="flex gap-2 justify-end">
                                                                                <Button
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    onClick={() => handleViewCommunitySignups(event)}
                                                                                >
                                                                                    <Users className="w-4 h-4 mr-1" />
                                                                                    Signups
                                                                                </Button>
                                                                                <Button
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    onClick={() => handleEditCommunityEvent(event)}
                                                                                >
                                                                                    <Edit2 className="w-4 h-4 mr-1" />
                                                                                    Edit
                                                                                </Button>
                                                                            </div>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                );
                                                            })}
                                                        </TableBody>
                                                    </Table>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="jobs">
                                        <Tabs defaultValue="listings" className="w-full">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <h2 className="text-2xl font-bold">Job Postings</h2>
                                                    <TabsList>
                                                        <TabsTrigger value="listings">Listings</TabsTrigger>
                                                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                                                    </TabsList>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" onClick={handleBackfillUrls}>
                                                        <LinkIcon className="w-4 h-4 mr-2" /> Backfill URLs
                                                    </Button>
                                                    <Button variant="outline" onClick={handleReindexJobs}>
                                                        <RefreshCw className="w-4 h-4 mr-2" /> Reindex Jobs
                                                    </Button>
                                                    <Button onClick={openAddJobModal}>
                                                        <Plus className="w-4 h-4 mr-2" /> Add Job
                                                    </Button>
                                                </div>
                                            </div>

                                            <TabsContent value="analytics" className="mt-0">
                                                {/* Job Analytics Dashboard */}
                                                <JobAnalyticsTab jobs={data.jobs} jobMetrics={data.jobMetrics} />
                                            </TabsContent>

                                            <TabsContent value="listings" className="mt-0">
                                                <Card>
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Title</TableHead>
                                                                <TableHead>Company</TableHead>
                                                                <TableHead>Status</TableHead>
                                                                <TableHead>Public Link</TableHead>
                                                                <TableHead className="text-center">Views</TableHead>
                                                                <TableHead className="text-center">Clicks</TableHead>
                                                                <TableHead className="text-right w-[120px]">Actions</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {data.jobs.length === 0 ? (
                                                                <TableRow><TableCell colSpan="6" className="py-12 text-center text-slate-500">No jobs found. Click "Add Job" to create one.</TableCell></TableRow>
                                                            ) : (
                                                                data.jobs.map(job => (
                                                                    <TableRow key={job.id}>
                                                                        <TableCell className="font-medium">{job.title}</TableCell>
                                                                        <TableCell>{job.companyName}</TableCell>
                                                                        <TableCell>
                                                                            <Badge variant={job.status === 'Active' ? 'default' : 'secondary'}>
                                                                                {job.status}
                                                                            </Badge>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <div className="flex items-center gap-2">
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    className="h-8 w-8"
                                                                                    onClick={() => {
                                                                                        const slug = (job.title || 'job').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                                                                                        const url = `https://www.ifs-safeguarding.co.uk/Job?id=${slug}-${job.id}`;
                                                                                        navigator.clipboard.writeText(url);
                                                                                        toast({ title: "Copied", description: "Public Job URL copied to clipboard" });
                                                                                    }}
                                                                                    title="Copy Link"
                                                                                >
                                                                                    <Copy className="w-4 h-4 text-slate-500" />
                                                                                </Button>
                                                                                <a
                                                                                    href={job.publicJobUrl || `https://www.ifs-safeguarding.co.uk/Job?id=${(job.title || 'job').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${job.id}`}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="text-purple-600 hover:text-purple-800"
                                                                                    title="Open Public Page"
                                                                                >
                                                                                    <ExternalLink className="w-4 h-4" />
                                                                                </a>
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell className="text-center">
                                                                            <div className="flex items-center justify-center gap-1 text-slate-600">
                                                                                <Eye className="w-3 h-3" />
                                                                                {job.views || 0}
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell className="text-center">
                                                                            <div className="flex items-center justify-center gap-1 text-slate-600">
                                                                                <ExternalLink className="w-3 h-3" />
                                                                                {job.applicationClicks || 0}
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell className="text-right">
                                                                            <Button variant="outline" size="sm" onClick={() => openEditJobModal(job.id)}>
                                                                                <Edit2 className="w-4 h-4 mr-2" /> Edit
                                                                            </Button>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </Card>
                                            </TabsContent>
                                        </Tabs>
                                    </TabsContent>

                                    {/* Job Review Tab - NEW */}
                                    <TabsContent value="job-review">
                                        <Card>
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <CardTitle className="flex items-center gap-2">
                                                            <Eye className="w-5 h-5" />
                                                            Job Submissions Pending Review
                                                        </CardTitle>
                                                        <CardDescription>Review and approve job postings submitted by organisations</CardDescription>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                {(() => {
                                                    const pendingJobs = data.jobs.filter(job => job.status === 'Pending Review');

                                                    if (pendingJobs.length === 0) {
                                                        return (
                                                            <div className="text-center py-12">
                                                                <CheckCircle2 className="w-12 h-12 text-green-300 mx-auto mb-4" />
                                                                <h3 className="text-lg font-semibold text-slate-900 mb-2">All caught up!</h3>
                                                                <p className="text-slate-600">No job submissions pending review at the moment.</p>
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead>Job Title</TableHead>
                                                                    <TableHead>Organisation</TableHead>
                                                                    <TableHead>Submitted By</TableHead>
                                                                    <TableHead>Submitted On</TableHead>
                                                                    <TableHead className="text-right">Actions</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {pendingJobs.map(job => (
                                                                    <TableRow key={job.id}>
                                                                        <TableCell>
                                                                            <div className="font-medium">{job.title}</div>
                                                                            <div className="text-xs text-slate-500">{job.companyName}</div>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <div className="text-sm">{job.submittedByOrganisationName}</div>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <div className="text-sm">{job.submittedByUserEmail}</div>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            {formatDate(job.created_date, 'dd MMM yyyy, HH:mm')}
                                                                        </TableCell>
                                                                        <TableCell className="text-right">
                                                                            <div className="flex gap-2 justify-end">
                                                                                <Button
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    onClick={() => openEditJobModal(job.id)}
                                                                                >
                                                                                    <Eye className="w-4 h-4 mr-1" />
                                                                                    Review
                                                                                </Button>
                                                                                <Button
                                                                                    size="sm"
                                                                                    className="bg-green-600 hover:bg-green-700"
                                                                                    onClick={async () => {
                                                                                        try {
                                                                                            await Job.update(job.id, { status: 'Active' });

                                                                                            if (job.submittedByUserEmail) {
                                                                                                const emailRes = await ifs.functions.invoke('sendJobStatusEmail', {
                                                                                                    jobId: job.id,
                                                                                                    jobTitle: job.title,
                                                                                                    companyName: job.companyName,
                                                                                                    toEmail: job.submittedByUserEmail,
                                                                                                    newStatus: 'Active',
                                                                                                    reviewNotes: ''
                                                                                                });

                                                                                                if (emailRes.data?.success) {
                                                                                                    toast({ title: "Approved & Email Sent", description: `${job.title} is live. Email sent to ${job.submittedByUserEmail}` });
                                                                                                } else {
                                                                                                    toast({ title: "Approved (Email Failed)", description: "Job is live but email failed to send", variant: "destructive" });
                                                                                                }
                                                                                            } else {
                                                                                                toast({ title: "Job Approved", description: `${job.title} is now live` });
                                                                                            }

                                                                                            fetchAllDashboardData();
                                                                                        } catch (error) {
                                                                                            toast({ title: "Error", description: error.message, variant: "destructive" });
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                                                                    Approve
                                                                                </Button>
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    className="text-red-600 border-red-300 hover:bg-red-50"
                                                                                    onClick={async () => {
                                                                                        const reason = prompt('Please provide a reason for rejection (this will be sent to the organisation):');
                                                                                        if (reason === null) return;

                                                                                        try {
                                                                                            await Job.update(job.id, { status: 'Rejected', reviewNotes: reason });

                                                                                            if (job.submittedByUserEmail) {
                                                                                                const emailRes = await ifs.functions.invoke('sendJobStatusEmail', {
                                                                                                    jobId: job.id,
                                                                                                    jobTitle: job.title,
                                                                                                    companyName: job.companyName,
                                                                                                    toEmail: job.submittedByUserEmail,
                                                                                                    newStatus: 'Rejected',
                                                                                                    reviewNotes: reason || 'Please review and resubmit.'
                                                                                                });

                                                                                                if (emailRes.data?.success) {
                                                                                                    toast({ title: "Rejected & Email Sent", description: `Notification sent to ${job.submittedByUserEmail}` });
                                                                                                } else {
                                                                                                    toast({ title: "Rejected (Email Failed)", description: "Job rejected but email failed", variant: "destructive" });
                                                                                                }
                                                                                            } else {
                                                                                                toast({ title: "Job Rejected", description: `${job.title} rejected` });
                                                                                            }

                                                                                            fetchAllDashboardData();
                                                                                        } catch (error) {
                                                                                            toast({ title: "Error", description: error.message, variant: "destructive" });
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    <X className="w-4 h-4 mr-1" />
                                                                                    Reject
                                                                                </Button>
                                                                            </div>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    );
                                                })()}
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="news">
                                        <Tabs defaultValue="articles" className="w-full">
                                            <div className="flex flex-col gap-4 mb-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <h2 className="text-2xl font-bold">News & Updates</h2>
                                                        <TabsList>
                                                            <TabsTrigger value="articles">Articles</TabsTrigger>
                                                            <TabsTrigger value="sources">Sources</TabsTrigger>
                                                            <TabsTrigger value="categories">Categories</TabsTrigger>
                                                        </TabsList>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" onClick={handleFetchNews}>
                                                            <RefreshCw className="w-4 h-4 mr-2" />
                                                            Fetch Now
                                                        </Button>
                                                        <Button onClick={handleAddNewsArticle}>
                                                            <Plus className="w-4 h-4 mr-2" />
                                                            Add Article
                                                        </Button>
                                                    </div>
                                                </div>

                                                <TabsContent value="articles" className="mt-0">
                                                    {/* News Filter Bar */}
                                                    <div className="flex flex-wrap gap-4 mb-4 items-center bg-white p-3 rounded-lg border border-slate-200">
                                                        <div className="flex-1 min-w-[200px]">
                                                            <div className="relative">
                                                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                                                                <Input
                                                                    placeholder="Search articles..."
                                                                    value={newsSearchQuery}
                                                                    onChange={(e) => setNewsSearchQuery(e.target.value)}
                                                                    className="pl-9"
                                                                />
                                                            </div>
                                                        </div>
                                                        <Select value={newsStatusFilter} onValueChange={setNewsStatusFilter}>
                                                            <SelectTrigger className="w-[140px]">
                                                                <SelectValue placeholder="Status" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="all">All Status</SelectItem>
                                                                <SelectItem value="Draft">Draft</SelectItem>
                                                                <SelectItem value="Published">Published</SelectItem>
                                                                <SelectItem value="Archived">Archived</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <Select value={newsCategoryFilter} onValueChange={setNewsCategoryFilter}>
                                                            <SelectTrigger className="w-[160px]">
                                                                <SelectValue placeholder="Category" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="all">All Categories</SelectItem>
                                                                {[...new Set(data.newsItems.map(i => i.category).filter(Boolean))].sort().map(cat => (
                                                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    {/* Bulk Actions Bar */}
                                                    {selectedNewsItems.length > 0 && (
                                                        <div className="flex items-center gap-2 mb-4 p-2 bg-purple-50 border border-purple-200 rounded-md text-sm text-purple-900 animate-in fade-in slide-in-from-top-1">
                                                            <span className="font-semibold ml-2">{selectedNewsItems.length} selected</span>
                                                            <div className="h-4 w-px bg-purple-200 mx-2" />
                                                            <Button size="sm" variant="outline" className="bg-white hover:bg-purple-100 border-purple-200 text-purple-700" onClick={() => handleBulkStatusUpdateNews('Published')}>
                                                                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Publish
                                                            </Button>
                                                            <Button size="sm" variant="outline" className="bg-white hover:bg-purple-100 border-purple-200 text-purple-700" onClick={() => handleBulkStatusUpdateNews('Draft')}>
                                                                <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Revert to Draft
                                                            </Button>
                                                            <Button size="sm" variant="outline" className="bg-white hover:bg-purple-100 border-purple-200 text-purple-700" onClick={() => handleBulkStatusUpdateNews('Archived')}>
                                                                <Clock className="w-3.5 h-3.5 mr-1.5" /> Archive
                                                            </Button>
                                                            <div className="flex-1" />
                                                            <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={handleBulkDeleteNews}>
                                                                <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                                                            </Button>
                                                        </div>
                                                    )}

                                                    <Card>
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead className="w-[40px]">
                                                                        <Checkbox
                                                                            checked={
                                                                                selectedNewsItems.length > 0 &&
                                                                                selectedNewsItems.length === data.newsItems.filter(item => {
                                                                                    const matchesStatus = newsStatusFilter === 'all' || item.status === newsStatusFilter;
                                                                                    const matchesCategory = newsCategoryFilter === 'all' || item.category === newsCategoryFilter;
                                                                                    const matchesSearch = !newsSearchQuery || item.title.toLowerCase().includes(newsSearchQuery.toLowerCase());
                                                                                    return matchesStatus && matchesCategory && matchesSearch;
                                                                                }).length
                                                                            }
                                                                            onCheckedChange={() => handleSelectAllNewsItems(
                                                                                data.newsItems.filter(item => {
                                                                                    const matchesStatus = newsStatusFilter === 'all' || item.status === newsStatusFilter;
                                                                                    const matchesCategory = newsCategoryFilter === 'all' || item.category === newsCategoryFilter;
                                                                                    const matchesSearch = !newsSearchQuery || item.title.toLowerCase().includes(newsSearchQuery.toLowerCase());
                                                                                    return matchesStatus && matchesCategory && matchesSearch;
                                                                                })
                                                                            )}
                                                                        />
                                                                    </TableHead>
                                                                    <TableHead>Title</TableHead>
                                                                    <TableHead>Source</TableHead>
                                                                    <TableHead>Category</TableHead>
                                                                    <TableHead>Date</TableHead>
                                                                    <TableHead>Status</TableHead>
                                                                    <TableHead className="text-right">Actions</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {(() => {
                                                                    const filteredItems = data.newsItems.filter(item => {
                                                                        const matchesStatus = newsStatusFilter === 'all' || item.status === newsStatusFilter;
                                                                        const matchesCategory = newsCategoryFilter === 'all' || item.category === newsCategoryFilter;
                                                                        const matchesSearch = !newsSearchQuery || item.title.toLowerCase().includes(newsSearchQuery.toLowerCase());
                                                                        return matchesStatus && matchesCategory && matchesSearch;
                                                                    });

                                                                    if (filteredItems.length === 0) {
                                                                        return <TableRow><TableCell colSpan="7" className="py-12 text-center text-slate-500">No articles match your filters.</TableCell></TableRow>;
                                                                    }

                                                                    return filteredItems.map(item => (
                                                                        <TableRow key={item.id}>
                                                                            <TableCell>
                                                                                <Checkbox
                                                                                    checked={selectedNewsItems.includes(item.id)}
                                                                                    onCheckedChange={() => handleSelectNewsItem(item.id)}
                                                                                />
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <div className="flex items-center gap-3">
                                                                                    {item.imageUrl ? (
                                                                                        <img src={item.imageUrl} alt="" className="w-10 h-10 rounded-md object-cover bg-slate-100 border border-slate-200" onError={(e) => e.target.style.display = 'none'} />
                                                                                    ) : (
                                                                                        <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                                                                                            <Newspaper className="w-5 h-5" />
                                                                                        </div>
                                                                                    )}
                                                                                    <span className="font-medium max-w-[240px] truncate" title={item.title}>
                                                                                        {item.title}
                                                                                    </span>
                                                                                </div>
                                                                            </TableCell>
                                                                            <TableCell className="text-slate-600">{item.sourceName}</TableCell>
                                                                            <TableCell>
                                                                                {item.category && <Badge variant="outline">{item.category}</Badge>}
                                                                            </TableCell>
                                                                            <TableCell>{formatDate(item.publishedDate, 'dd MMM yyyy')}</TableCell>
                                                                            <TableCell>
                                                                                <Badge variant={
                                                                                    item.status === 'Published' ? 'default' :
                                                                                        item.status === 'Draft' ? 'secondary' : 'outline'
                                                                                }>
                                                                                    {item.status}
                                                                                </Badge>
                                                                            </TableCell>
                                                                            <TableCell className="text-right">
                                                                                <div className="flex gap-2 justify-end">
                                                                                    <Button variant="ghost" size="sm" onClick={() => handleEditNewsArticle(item)}>
                                                                                        <Edit2 className="w-4 h-4" />
                                                                                    </Button>
                                                                                    <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteNewsArticle(item.id)}>
                                                                                        <Trash2 className="w-4 h-4" />
                                                                                    </Button>
                                                                                </div>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ));
                                                                })()}
                                                            </TableBody>
                                                        </Table>
                                                    </Card>
                                                </TabsContent>
                                            </div>

                                            <TabsContent value="sources" className="mt-0">
                                                <div className="flex justify-end mb-4">
                                                    <Button onClick={handleAddNewsSource} variant="outline">
                                                        <Plus className="w-4 h-4 mr-2" /> Add Source
                                                    </Button>
                                                </div>
                                                <Card>
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Name</TableHead>
                                                                <TableHead>Type</TableHead>
                                                                <TableHead>URL</TableHead>
                                                                <TableHead>Status</TableHead>
                                                                <TableHead>Last Fetched</TableHead>
                                                                <TableHead className="text-right">Actions</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {data.newsSources.length === 0 ? (
                                                                <TableRow><TableCell colSpan="6" className="py-12 text-center text-slate-500">No news sources configured.</TableCell></TableRow>
                                                            ) : (
                                                                data.newsSources.map(source => (
                                                                    <TableRow key={source.id}>
                                                                        <TableCell className="font-medium">{source.name}</TableCell>
                                                                        <TableCell><Badge variant="outline">{source.type}</Badge></TableCell>
                                                                        <TableCell className="max-w-xs truncate text-slate-500 text-xs" title={source.url}>{source.url}</TableCell>
                                                                        <TableCell>
                                                                            <Badge variant={source.status === 'Active' ? 'default' : 'destructive'}>
                                                                                {source.status}
                                                                            </Badge>
                                                                            {source.status === 'Error' && (
                                                                                <p className="text-xs text-red-500 mt-1 max-w-xs truncate" title={source.errorMessage}>
                                                                                    {source.errorMessage}
                                                                                </p>
                                                                            )}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            {source.lastFetchedAt ? formatDate(source.lastFetchedAt, 'dd MMM HH:mm') : 'Never'}
                                                                        </TableCell>
                                                                        <TableCell className="text-right">
                                                                            <div className="flex gap-2 justify-end">
                                                                                <Button variant="ghost" size="sm" onClick={() => handleEditNewsSource(source)}>
                                                                                    <Edit2 className="w-4 h-4" />
                                                                                </Button>
                                                                                <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteNewsSource(source.id)}>
                                                                                    <Trash2 className="w-4 h-4" />
                                                                                </Button>
                                                                            </div>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </Card>
                                            </TabsContent>

                                            <TabsContent value="categories" className="mt-0">
                                                <div className="flex justify-end mb-4">
                                                    <Button onClick={handleAddNewsCategory} variant="outline">
                                                        <Plus className="w-4 h-4 mr-2" /> Add Category
                                                    </Button>
                                                </div>
                                                <Card>
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Name</TableHead>
                                                                <TableHead>Description</TableHead>
                                                                <TableHead>Order</TableHead>
                                                                <TableHead className="text-right">Actions</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {data.newsCategories.length === 0 ? (
                                                                <TableRow><TableCell colSpan="4" className="py-12 text-center text-slate-500">No news categories configured.</TableCell></TableRow>
                                                            ) : (
                                                                data.newsCategories.map(category => (
                                                                    <TableRow key={category.id}>
                                                                        <TableCell className="font-medium">
                                                                            <Badge variant="outline">{category.name}</Badge>
                                                                        </TableCell>
                                                                        <TableCell className="text-slate-600">{category.description}</TableCell>
                                                                        <TableCell>{category.displayOrder}</TableCell>
                                                                        <TableCell className="text-right">
                                                                            <div className="flex gap-2 justify-end">
                                                                                <Button variant="ghost" size="sm" onClick={() => handleEditNewsCategory(category)}>
                                                                                    <Edit2 className="w-4 h-4" />
                                                                                </Button>
                                                                                <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteNewsCategory(category.id)}>
                                                                                    <Trash2 className="w-4 h-4" />
                                                                                </Button>
                                                                            </div>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </Card>
                                            </TabsContent>

                                            <TabsContent value="categories" className="mt-0">
                                                <div className="flex justify-end mb-4">
                                                    <Button onClick={handleAddNewsCategory} variant="outline">
                                                        <Plus className="w-4 h-4 mr-2" /> Add Category
                                                    </Button>
                                                </div>
                                                <Card>
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Name</TableHead>
                                                                <TableHead>Description</TableHead>
                                                                <TableHead>Order</TableHead>
                                                                <TableHead className="text-right">Actions</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {data.newsCategories.length === 0 ? (
                                                                <TableRow><TableCell colSpan="4" className="py-12 text-center text-slate-500">No news categories configured.</TableCell></TableRow>
                                                            ) : (
                                                                data.newsCategories.map(category => (
                                                                    <TableRow key={category.id}>
                                                                        <TableCell className="font-medium">
                                                                            <Badge variant="outline">{category.name}</Badge>
                                                                        </TableCell>
                                                                        <TableCell className="text-slate-600">{category.description}</TableCell>
                                                                        <TableCell>{category.displayOrder}</TableCell>
                                                                        <TableCell className="text-right">
                                                                            <div className="flex gap-2 justify-end">
                                                                                <Button variant="ghost" size="sm" onClick={() => handleEditNewsCategory(category)}>
                                                                                    <Edit2 className="w-4 h-4" />
                                                                                </Button>
                                                                                <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteNewsCategory(category.id)}>
                                                                                    <Trash2 className="w-4 h-4" />
                                                                                </Button>
                                                                            </div>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </Card>
                                            </TabsContent>
                                        </Tabs>
                                    </TabsContent>

                                    <TabsContent value="enquiries">
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <h2 className="text-2xl font-bold">Training Enquiries</h2>
                                            </div>
                                            <Card>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Course</TableHead>
                                                            <TableHead>Enquirer</TableHead>
                                                            <TableHead>Date & Time</TableHead>
                                                            <TableHead>Date Submitted</TableHead>
                                                            <TableHead className="text-right w-[120px]">Actions</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {newEnquiries.length === 0 ? (
                                                            <TableRow><TableCell colSpan="5" className="py-12 text-center text-slate-500">No new enquiries found.</TableCell></TableRow>
                                                        ) : (
                                                            newEnquiries.map((enquiry) => (
                                                                <TableRow key={enquiry.id}>
                                                                    <TableCell className="font-medium">{enquiry.courseTitle}</TableCell>
                                                                    <TableCell>
                                                                        <div>{enquiry.name}</div>
                                                                        <div className="text-xs text-gray-500">{enquiry.email}</div>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {enquiry.selectedDate ? (
                                                                            <>
                                                                                <div>{formatDate(enquiry.selectedDate, 'do MMMM yyyy')}</div>
                                                                                <div className="text-xs text-gray-500">{enquiry.selectedTime}</div>
                                                                            </>
                                                                        ) : (
                                                                            <span className="text-gray-500">General Enquiry</span>
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell>{formatDate(enquiry.created_date, 'do MMM yyyy, h:mm a')}</TableCell>
                                                                    <TableCell className="text-right">
                                                                        <Button variant="outline" size="sm" onClick={() => handleEnquiryResolve(enquiry)}>Mark as Resolved</Button>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </Card>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="welcome-emails">
                                        <WelcomeEmailsTab users={data.users} />
                                    </TabsContent>

                                    <TabsContent value="system">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>System Tasks & Configuration</CardTitle>
                                                <CardDescription>Manage automated tasks and system settings</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-6">
                                                    <div className="p-4 border rounded-lg bg-slate-50">
                                                        <div className="flex items-start gap-4">
                                                            <div className="p-2 bg-white rounded-lg border">
                                                                <RefreshCw className="w-6 h-6 text-blue-600" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="font-medium text-slate-900 mb-1">Job Expiration Cron Job</h3>
                                                                <p className="text-sm text-slate-600 mb-4">
                                                                    Configure your external cron service (e.g., cron-job.org) to call this URL daily.
                                                                    This will automatically expire jobs that have passed their deadline and remove them from Google Search.
                                                                </p>

                                                                <div className="space-y-4">
                                                                    <div>
                                                                        <Label className="text-xs font-semibold uppercase text-slate-500">Function URL</Label>
                                                                        <div className="flex items-center mt-1 gap-2">
                                                                            <code className="flex-1 p-2 bg-white border rounded text-xs font-mono break-all">
                                                                                https://www.ifs-safeguarding.co.uk/api/functions/archiveExpiredJobs
                                                                            </code>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => {
                                                                                    navigator.clipboard.writeText('https://www.ifs-safeguarding.co.uk/api/functions/archiveExpiredJobs');
                                                                                    toast({ title: "Copied", description: "URL copied to clipboard" });
                                                                                }}
                                                                            >
                                                                                Copy
                                                                            </Button>
                                                                        </div>
                                                                    </div>

                                                                    <div>
                                                                        <Label className="text-xs font-semibold uppercase text-slate-500">Authentication Header</Label>
                                                                        <div className="p-2 bg-white border rounded text-xs font-mono mt-1">
                                                                            Authorization: Bearer [YOUR_CRON_SECRET]
                                                                        </div>
                                                                        <p className="text-[10px] text-slate-500 mt-1">
                                                                            Replace <span className="font-mono bg-slate-200 px-1 rounded">[YOUR_CRON_SECRET]</span> with the value of the <strong>CRON_SECRET</strong> environment variable you set in the dashboard.
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="p-4 border rounded-lg bg-slate-50">
                                                        <div className="flex items-start gap-4">
                                                            <div className="p-2 bg-white rounded-lg border">
                                                                <Newspaper className="w-6 h-6 text-indigo-600" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="font-medium text-slate-900 mb-1">News Auto-Fetch Cron Job</h3>
                                                                <p className="text-sm text-slate-600 mb-4">
                                                                    Configure your external cron service (e.g., cron-job.org) to call this URL every hour (or as preferred).
                                                                    This will automatically fetch latest articles from all active sources.
                                                                </p>

                                                                <div className="space-y-4">
                                                                    <div>
                                                                        <Label className="text-xs font-semibold uppercase text-slate-500">Function URL (Published)</Label>
                                                                        <div className="flex items-center mt-1 gap-2">
                                                                            <code className="flex-1 p-2 bg-white border rounded text-xs font-mono break-all">
                                                                                https://www.ifs-safeguarding.co.uk/api/functions/fetchNewsFromSources
                                                                            </code>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => {
                                                                                    navigator.clipboard.writeText('https://www.ifs-safeguarding.co.uk/api/functions/fetchNewsFromSources');
                                                                                    toast({ title: "Copied", description: "URL copied to clipboard" });
                                                                                }}
                                                                            >
                                                                                Copy
                                                                            </Button>
                                                                        </div>
                                                                        <p className="text-[10px] text-slate-500 mt-1">
                                                                            Note: This URL may return a 307 Redirect. Ensure your cron service is set to <strong>Follow Redirects</strong>.
                                                                        </p>
                                                                    </div>

                                                                    <div className="mt-3">
                                                                        <Label className="text-xs font-semibold uppercase text-slate-500">Direct App URL (No Redirects)</Label>
                                                                        <div className="flex items-center mt-1 gap-2">
                                                                            <code className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded text-xs font-mono break-all text-slate-600">
                                                                                {window.location.origin}/api/functions/fetchNewsFromSources
                                                                            </code>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => {
                                                                                    navigator.clipboard.writeText(`${window.location.origin}/api/functions/fetchNewsFromSources`);
                                                                                    toast({ title: "Copied", description: "Direct URL copied to clipboard" });
                                                                                }}
                                                                            >
                                                                                Copy
                                                                            </Button>
                                                                        </div>
                                                                        <p className="text-[10px] text-slate-500 mt-1">
                                                                            Use this URL if the published URL fails or drops the Authorization header.
                                                                        </p>
                                                                    </div>

                                                                    <div>
                                                                        <Label className="text-xs font-semibold uppercase text-slate-500">Authentication Header</Label>
                                                                        <div className="p-2 bg-white border rounded text-xs font-mono mt-1">
                                                                            Authorization: Bearer [YOUR_CRON_SECRET]
                                                                        </div>
                                                                        <p className="text-[10px] text-slate-500 mt-1">
                                                                            Replace <span className="font-mono bg-slate-200 px-1 rounded">[YOUR_CRON_SECRET]</span> with the value of the <strong>CRON_SECRET</strong> environment variable.
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="p-4 border rounded-lg bg-slate-50">
                                                        <div className="flex items-start gap-4">
                                                            <div className="p-2 bg-white rounded-lg border">
                                                                <Users className="w-6 h-6 text-purple-600" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="font-medium text-slate-900 mb-1">Applicant Tracking Backfill</h3>
                                                                <p className="text-sm text-slate-600 mb-4">
                                                                    Run this to populate the Applicant Tracking entity with existing user data. This will scan all users and create tracking records based on their current membership status.
                                                                </p>
                                                                <Button onClick={handleBackfillApplicants} variant="outline">
                                                                    <RefreshCw className="w-4 h-4 mr-2" />
                                                                    Run Backfill
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="p-4 border rounded-lg bg-slate-50">
                                                        <div className="flex items-start gap-4">
                                                            <div className="p-2 bg-white rounded-lg border">
                                                                <Globe className="w-6 h-6 text-blue-600" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="font-medium text-slate-900 mb-1">Salesforce Sync Backfill</h3>
                                                                <p className="text-sm text-slate-600 mb-4">
                                                                    Sync all existing users to Salesforce contacts. This creates new contacts or updates existing ones based on email address.
                                                                </p>
                                                                <Button onClick={async () => {
                                                                    try {
                                                                        toast({ title: "Processing...", description: "Syncing users to Salesforce..." });
                                                                        const res = await ifs.functions.invoke('backfillSalesforce', { limit: 1000 });
                                                                        if (res.data.success) {
                                                                            toast({
                                                                                title: "Sync Complete",
                                                                                description: `Processed ${res.data.totalProcessed} users. Success: ${res.data.successCount}, Errors: ${res.data.errorCount}`
                                                                            });
                                                                        } else {
                                                                            throw new Error(res.data.error);
                                                                        }
                                                                    } catch (e) {
                                                                        toast({ title: "Error", description: e.message, variant: "destructive" });
                                                                    }
                                                                }} variant="outline">
                                                                    <RefreshCw className="w-4 h-4 mr-2" />
                                                                    Run Salesforce Sync
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="p-4 border rounded-lg bg-slate-50">
                                                        <div className="flex items-start gap-4">
                                                            <div className="p-2 bg-white rounded-lg border">
                                                                <Mail className="w-6 h-6 text-amber-600" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="font-medium text-slate-900 mb-1">Job Alerts Backfill (Members)</h3>
                                                                <p className="text-sm text-slate-600 mb-4">
                                                                    Enable weekly job alerts for all Associate and Full Members. Validates and creates missing records.
                                                                </p>
                                                                <Button onClick={async () => {
                                                                    try {
                                                                        toast({ title: "Processing...", description: "Enabling job alerts for members..." });
                                                                        const res = await ifs.functions.invoke('backfillJobAlerts');
                                                                        if (res.data.success) {
                                                                            toast({ title: "Success", description: res.data.message });
                                                                        } else {
                                                                            throw new Error(res.data.error);
                                                                        }
                                                                    } catch (e) {
                                                                        toast({ title: "Error", description: e.message, variant: "destructive" });
                                                                    }
                                                                }} variant="outline">
                                                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                                                    Enable Member Alerts
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="p-4 border rounded-lg bg-slate-50">
                                                        <div className="flex items-start gap-4">
                                                            <div className="p-2 bg-white rounded-lg border">
                                                                <Bell className="w-6 h-6 text-green-600" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="font-medium text-slate-900 mb-1">Community Event Reminders</h3>
                                                                <p className="text-sm text-slate-600 mb-4">
                                                                    Send reminder emails to participants of upcoming community events. Emails mention calendar invites and provide contact info if not received.
                                                                </p>
                                                                <div className="flex items-center gap-3 mb-4">
                                                                    <Label htmlFor="reminderHours" className="text-sm font-medium whitespace-nowrap">Send reminders</Label>
                                                                    <Input
                                                                        id="reminderHours"
                                                                        type="number"
                                                                        min="1"
                                                                        max="168"
                                                                        value={reminderHours}
                                                                        onChange={(e) => setReminderHours(parseInt(e.target.value) || 24)}
                                                                        className="w-20"
                                                                    />
                                                                    <span className="text-sm text-slate-600">hours before event</span>
                                                                </div>
                                                                <Button
                                                                    onClick={handleSendCommunityReminders}
                                                                    disabled={isSendingReminders}
                                                                    variant="outline"
                                                                >
                                                                    {isSendingReminders ? (
                                                                        <>
                                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                            Sending...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Bell className="w-4 h-4 mr-2" />
                                                                            Send Reminders
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                </div>
                            </div>
                        </div>
                    </main>
                </Tabs>
                <footer className="bg-white border-t border-[#E2E8F0] py-4 px-6 flex flex-col md:flex-row justify-between items-center text-[11px] text-slate-400 uppercase tracking-widest">
                    <span>© 2024 Independent Federation for Safeguarding</span>
                    <div className="flex gap-4 mt-2 md:mt-0">
                        <a className="hover:text-[#7C3AED] transition-colors" href="/PrivacyPolicy">Privacy Policy</a>
                        <a className="hover:text-[#7C3AED] transition-colors" href="/TermsAndConditions">Terms of Service</a>
                        <a className="hover:text-[#7C3AED] transition-colors" href="mailto:it@ifs-safeguarding.co.uk">IT Support</a>
                    </div>
                </footer>
            </div>

            {/* Generate Credential Modal */}
            <Dialog open={showCredentialModal} onOpenChange={setShowCredentialModal}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Generate Digital Credential</DialogTitle>
                        <DialogDescription>
                            Issue a verified digital credential to a member
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Select Member</label>
                            <Select
                                value={credentialForm.userId}
                                onValueChange={(value) => setCredentialForm({ ...credentialForm, userId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a member" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    {data.users
                                        .filter(u => u.membershipStatus === 'active')
                                        .map(member => (
                                            <SelectItem key={member.id} value={member.id}>
                                                {member.displayName || member.full_name} ({member.email}) - {member.membershipType}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Credential Type</label>
                            <Select
                                value={credentialForm.credentialType}
                                onValueChange={(value) => setCredentialForm({
                                    ...credentialForm,
                                    credentialType: value,
                                    masterclassTitle: '',
                                    courseTitle: '',
                                    eventId: ''
                                })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Associate Membership">Associate Membership</SelectItem>
                                    <SelectItem value="Full Membership">Full Membership</SelectItem>
                                    <SelectItem value="Masterclass Attendance">Masterclass Attendance</SelectItem>
                                    <SelectItem value="Course Completion">Course Completion</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {credentialForm.credentialType === 'Masterclass Attendance' && (
                            <>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Select Existing Masterclass (Optional)</label>
                                    <Select
                                        value={credentialForm.eventId}
                                        onValueChange={(value) => {
                                            const selectedEvent = data.events.find(e => e.id === value);
                                            setCredentialForm({
                                                ...credentialForm,
                                                eventId: value,
                                                masterclassTitle: selectedEvent?.title || '',
                                                completionDate: selectedEvent?.date ? formatDate(selectedEvent.date, 'yyyy-MM-dd') : '',
                                                hours: selectedEvent?.duration ? (selectedEvent.duration / 60).toString() : ''
                                            });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a masterclass or enter manually below" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[300px]">
                                            <SelectItem value="_none_">Enter manually</SelectItem>
                                            {data.events
                                                .filter(e => e.type === 'Masterclass')
                                                .map(event => (
                                                    <SelectItem key={event.id} value={event.id}>
                                                        {event.title} - {formatDate(event.date, 'dd MMM yyyy')}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-slate-500 mt-1">
                                        This will auto-populate the fields below and create a signup record
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">Masterclass Title *</label>
                                    <Input
                                        value={credentialForm.masterclassTitle}
                                        onChange={(e) => setCredentialForm({ ...credentialForm, masterclassTitle: e.target.value })}
                                        placeholder="e.g., Advanced Safeguarding Practices Masterclass"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        Enter the title of the masterclass attended
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Completion/Attendance Date</label>
                                    <Input
                                        type="date"
                                        value={credentialForm.completionDate}
                                        onChange={(e) => setCredentialForm({ ...credentialForm, completionDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">CPD Hours</label>
                                    <Input
                                        type="number"
                                        step="0.5"
                                        value={credentialForm.hours}
                                        onChange={(e) => setCredentialForm({ ...credentialForm, hours: e.target.value })}
                                        placeholder="e.g., 3"
                                    />
                                </div>
                            </>
                        )}

                        {credentialForm.credentialType === 'Course Completion' && (
                            <>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Course Title *</label>
                                    <Input
                                        value={credentialForm.courseTitle}
                                        onChange={(e) => setCredentialForm({ ...credentialForm, courseTitle: e.target.value })}
                                        placeholder="e.g., DSL Level 3 Training"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Completion Date</label>
                                    <Input
                                        type="date"
                                        value={credentialForm.completionDate}
                                        onChange={(e) => setCredentialForm({ ...credentialForm, completionDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">CPD Hours</label>
                                    <Input
                                        type="number"
                                        step="0.5"
                                        value={credentialForm.hours}
                                        onChange={(e) => setCredentialForm({ ...credentialForm, hours: e.target.value })}
                                        placeholder="e.g., 6"
                                    />
                                </div>
                            </>
                        )}

                        {(credentialForm.credentialType === 'Associate Membership' || credentialForm.credentialType === 'Full Membership') && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    <strong>Note:</strong> Membership credentials are automatically generated when members join or upgrade.
                                    Use this option only to regenerate a credential if needed.
                                </p>
                            </div>
                        )}

                        {/* Email Option - ONLY for Masterclass and Course credentials */}
                        {(credentialForm.credentialType === 'Masterclass Attendance' || credentialForm.credentialType === 'Course Completion') && (
                            <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                <Checkbox
                                    id="sendEmail"
                                    checked={credentialForm.sendEmail}
                                    onCheckedChange={(checked) => setCredentialForm({ ...credentialForm, sendEmail: checked })}
                                />
                                <div className="flex-1">
                                    <Label
                                        htmlFor="sendEmail"
                                        className="text-sm font-medium cursor-pointer"
                                    >
                                        Send email notification to member
                                    </Label>
                                    <p className="text-xs text-slate-500 mt-1">
                                        The member will receive an email with their certificate and instructions to add it to LinkedIn
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowCredentialModal(false);
                                setCredentialForm({
                                    userId: '',
                                    credentialType: 'Masterclass Attendance',
                                    masterclassTitle: '',
                                    courseTitle: '',
                                    completionDate: '',
                                    hours: '',
                                    eventId: '',
                                    sendEmail: false
                                });
                            }}
                            disabled={isGeneratingCredential}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleGenerateCredential}
                            disabled={isGeneratingCredential || !credentialForm.userId || (credentialForm.credentialType === 'Masterclass Attendance' && !credentialForm.masterclassTitle) || (credentialForm.credentialType === 'Course Completion' && !credentialForm.courseTitle)}
                        >
                            {isGeneratingCredential ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Award className="w-4 h-4 mr-2" />
                                    Generate Credential
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Gift CPD Hours Modal */}
            <Dialog open={showGiftCpdModal} onOpenChange={setShowGiftCpdModal}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-600" />
                            Gift CPD Hours
                        </DialogTitle>
                        <DialogDescription>
                            Award CPD hours to a member as a reward, compensation, or special allocation
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="giftUser" className="text-sm font-medium mb-2 block">Select Member *</Label>
                            <Select
                                value={giftCpdForm.userId}
                                onValueChange={(value) => setGiftCpdForm({ ...giftCpdForm, userId: value })}
                            >
                                <SelectTrigger id="giftUser">
                                    <SelectValue placeholder="Choose a member" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    {data.users
                                        .filter(u => u.membershipStatus === 'active')
                                        .map(member => {
                                            const currentHours = member.cpdHours || 0;
                                            return (
                                                <SelectItem key={member.id} value={member.id}>
                                                    <div className="flex items-center justify-between w-full">
                                                        <span>{member.displayName || member.full_name} ({member.email})</span>
                                                        <span className="ml-2 text-xs text-slate-500">
                                                            {currentHours.toFixed(1)} hrs
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            );
                                        })}
                                </SelectContent>
                            </Select>
                            {giftCpdForm.userId && (
                                <p className="text-xs text-slate-500 mt-1">
                                    Current balance: {(data.users.find(u => u.id === giftCpdForm.userId)?.cpdHours || 0).toFixed(1)} hours
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="giftHours" className="text-sm font-medium mb-2 block">CPD Hours to Gift *</Label>
                            <Input
                                id="giftHours"
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={giftCpdForm.hours}
                                onChange={(e) => setGiftCpdForm({ ...giftCpdForm, hours: e.target.value })}
                                placeholder="e.g., 5"
                            />
                            {giftCpdForm.hours && !isNaN(parseFloat(giftCpdForm.hours)) && (
                                <p className="text-xs text-amber-600 mt-1">
                                    Worth ≈ £{(parseFloat(giftCpdForm.hours) * 20).toFixed(2)} in training discounts
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="giftDescription" className="text-sm font-medium mb-2 block">Description/Reason</Label>
                            <Textarea
                                id="giftDescription"
                                value={giftCpdForm.description}
                                onChange={(e) => setGiftCpdForm({ ...giftCpdForm, description: e.target.value })}
                                placeholder="e.g., Compensation for event cancellation, Reward for community contribution, etc."
                                rows={3}
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                This description will appear in the member's CPD transaction history
                            </p>
                        </div>

                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <p className="text-sm text-purple-800">
                                <strong>Note:</strong> Gifted hours will be added to the member's current balance and logged in their transaction history.
                                The member will see this allocation in their CPD Hours section.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowGiftCpdModal(false);
                                setGiftCpdForm({ userId: '', hours: '', description: '' });
                            }}
                            disabled={isGiftingCpd}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleGiftCpd}
                            disabled={isGiftingCpd || !giftCpdForm.userId || !giftCpdForm.hours}
                            className="bg-amber-600 hover:bg-amber-700"
                        >
                            {isGiftingCpd ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Gifting...
                                </>
                            ) : (
                                <>
                                    <Award className="w-4 h-4 mr-2" />
                                    Gift CPD Hours
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <EditCourseModal
                isOpen={isEditCourseModalOpen}
                onClose={() => {
                    setEditCourseModalOpen(false);
                    setEditingCourse(null);
                }}
                courseToEdit={editingCourse}
                onCourseSaved={handleCourseSaved}
            />
            <ApplicationDetailsSheet
                profile={selectedUserForSheet}
                open={isSheetOpen}
                onOpenChange={setSheetOpen}
                onApprove={handleApprove}
                onReject={handleReject}
            />
            <AddEventModal
                isOpen={isAddEventModalOpen}
                onClose={() => {
                    setAddEventModalOpen(false);
                    setEditingEvent(null);
                }}
                onEventSaved={handleEventSaved}
                eventToEdit={editingEvent}
            />
            <EventSignupsSheet
                event={selectedEventForSignups}
                signups={data.signups}
                open={isSignupsSheetOpen}
                onOpenChange={setSignupsSheetOpen}
            />
            <ManageDatesModal
                isOpen={isManageDatesModalOpen}
                onClose={() => setManageDatesModalOpen(false)}
                course={selectedCourseForDates}
                onDatesUpdate={handleDatesUpdate}
            />

            <CommunityEventModal
                open={isCommunityEventModalOpen}
                onOpenChange={setCommunityEventModalOpen}
                event={editingCommunityEvent}
                onSave={handleCommunityEventSaved}
            />

            <CommunityEventSignupsSheet
                open={isCommunitySignupsSheetOpen}
                onOpenChange={setCommunitySignupsSheetOpen}
                event={selectedCommunityEventForSignups}
                communityEventSignups={data.communityEventSignups}
            />

            <AddBookingModal
                isOpen={isAddBookingModalOpen}
                onClose={() => setAddBookingModalOpen(false)}
                onBookingAdded={fetchAllDashboardData}
                users={data.users}
                courses={data.courses}
                variants={data.courseVariants}
                dates={data.courseDates}
            />

            {userToDelete && (
                <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the user "{userToDelete.displayName || userToDelete.full_name}" and all their associated data.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={async () => {
                                try {
                                    await deleteUser({ userId: userToDelete.id });
                                    toast({ title: "User Deleted", description: `${userToDelete.displayName || userToDelete.full_name} has been removed.` });
                                    setUserToDelete(null);
                                    fetchAllDashboardData();
                                } catch (error) {
                                    toast({ title: "Error", description: `Failed to delete user: ${error.message}`, variant: "destructive" });
                                }
                            }} className="bg-red-600 hover:bg-red-700">
                                Yes, delete user
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            {orgToDelete && (
                <AlertDialog open={!!orgToDelete} onOpenChange={() => setOrgToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Organisation?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete "{orgToDelete.name}" and all associated data.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={async () => {
                                try {
                                    await Organisation.delete(orgToDelete.id);
                                    toast({ title: "Organisation Deleted", description: `${orgToDelete.name} has been removed.` });
                                    setOrgToDelete(null);
                                    fetchAllDashboardData();
                                } catch (error) {
                                    toast({ title: "Error", description: `Failed to delete organisation: ${error.message}`, variant: "destructive" });
                                }
                            }} className="bg-red-600 hover:bg-red-700">
                                Yes, delete organisation
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            <NewsSourceModal
                open={isNewsSourceModalOpen}
                onOpenChange={setNewsSourceModalOpen}
                sourceToEdit={editingNewsSource}
                onSave={fetchAllDashboardData}
            />

            <NewsArticleModal
                open={isNewsArticleModalOpen}
                onOpenChange={setNewsArticleModalOpen}
                articleToEdit={editingNewsArticle}
                onSave={handleNewsArticleSaved}
                existingCategories={data.newsCategories || []}
            />

            <NewsCategoryModal
                open={isNewsCategoryModalOpen}
                onOpenChange={setNewsCategoryModalOpen}
                categoryToEdit={editingNewsCategory}
                onSave={fetchAllDashboardData}
            />

            <DeductCpdModal
                open={showDeductCpdModal}
                onOpenChange={setShowDeductCpdModal}
                users={data.users}
                onDeducted={fetchAllDashboardData}
            />

            {/* Gift Org Seats Modal */}
            <Dialog open={showGiftSeatsModal} onOpenChange={setShowGiftSeatsModal}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-purple-600" />
                            Gift Full Membership Seats
                        </DialogTitle>
                        <DialogDescription>
                            Award complimentary Full Membership seats to an organisation
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="giftOrg" className="text-sm font-medium mb-2 block">Select Organisation *</Label>
                            <Select
                                value={giftSeatsForm.organisationId}
                                onValueChange={(value) => setGiftSeatsForm({ ...giftSeatsForm, organisationId: value })}
                            >
                                <SelectTrigger id="giftOrg">
                                    <SelectValue placeholder="Choose an organisation" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    {data.organisations.map(org => (
                                        <SelectItem key={org.id} value={org.id}>
                                            <div className="flex items-center justify-between w-full">
                                                <span>{org.name}</span>
                                                <span className="ml-2 text-xs text-slate-500">
                                                    {org.availableSeats || 0}/{org.totalSeats || 0} seats
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {giftSeatsForm.organisationId && (
                                <p className="text-xs text-slate-500 mt-1">
                                    Current seats: {(data.organisations.find(o => o.id === giftSeatsForm.organisationId)?.totalSeats || 0)} total,
                                    {' '}{(data.organisations.find(o => o.id === giftSeatsForm.organisationId)?.availableSeats || 0)} available
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="giftSeats" className="text-sm font-medium mb-2 block">Number of Seats to Gift *</Label>
                            <Input
                                id="giftSeats"
                                type="number"
                                min="1"
                                value={giftSeatsForm.seats}
                                onChange={(e) => setGiftSeatsForm({ ...giftSeatsForm, seats: e.target.value })}
                                placeholder="e.g., 5"
                            />
                            {giftSeatsForm.seats && !isNaN(parseInt(giftSeatsForm.seats)) && (
                                <p className="text-xs text-purple-600 mt-1">
                                    Worth ≈ £{(parseInt(giftSeatsForm.seats) * 20).toFixed(2)}/month
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="giftReason" className="text-sm font-medium mb-2 block">Reason/Notes</Label>
                            <Textarea
                                id="giftReason"
                                value={giftSeatsForm.reason}
                                onChange={(e) => setGiftSeatsForm({ ...giftSeatsForm, reason: e.target.value })}
                                placeholder="e.g., Partnership agreement, Promotional offer, etc."
                                rows={3}
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                This is for internal reference only
                            </p>
                        </div>

                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <p className="text-sm text-purple-800">
                                <strong>Note:</strong> Gifted seats will be added to the organisation's total and available seat count.
                                The organisation admin can then assign these seats to team members.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowGiftSeatsModal(false);
                                setGiftSeatsForm({ organisationId: '', seats: '', reason: '' });
                            }}
                            disabled={isGiftingSeats}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleGiftSeats}
                            disabled={isGiftingSeats || !giftSeatsForm.organisationId || !giftSeatsForm.seats}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            {isGiftingSeats ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Gifting...
                                </>
                            ) : (
                                <>
                                    <Award className="w-4 h-4 mr-2" />
                                    Gift Seats
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
