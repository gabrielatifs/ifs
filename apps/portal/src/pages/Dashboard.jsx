import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User } from '@ifs/shared/api/entities';
import CourseBookingsCard from '../components/portal/CourseBookingsCard';
import { Event } from '@ifs/shared/api/entities';
import { Job } from '@ifs/shared/api/entities';
import { EventSignup } from '@ifs/shared/api/entities';
import { Course } from '@ifs/shared/api/entities';
import { CourseDate } from '@ifs/shared/api/entities';
import { createPageUrl } from '@ifs/shared/utils';
import PortalSidebar from '../components/portal/PortalSidebar';
import PortalHeader from '../components/portal/PortalHeader';
import UpgradeSuccessModal from '../components/modals/UpgradeSuccessModal';
import WelcomeRewardsModal from '../components/modals/WelcomeRewardsModal';
import PortalTour from '../components/portal/PortalTour';
import DashboardEventsSection from '../components/dashboard/DashboardEventsSection';
import DashboardTrainingSection from '../components/dashboard/DashboardTrainingSection';
import DashboardSurveysSection from '../components/dashboard/DashboardSurveysSection';
import AcceptInviteModal from '../components/modals/AcceptInviteModal';
import { OrgInvite, CommunityEvent, CommunityEventSignup } from '@ifs/shared/api/entities';

import { Button } from '@ifs/shared/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@ifs/shared/components/ui/card';
import { Badge } from '@ifs/shared/components/ui/badge';
import { ArrowRight, Bell, X, Shield, Building2, Loader2, Play, Crown } from 'lucide-react';
import { Toaster } from "@ifs/shared/components/ui/toaster";
import { useToast } from "@ifs/shared/components/ui/use-toast";
import { approveAssociateMembership } from '@ifs/shared/api/functions';
import { useUser } from '@ifs/shared/components/providers/UserProvider';
import { format } from 'date-fns';
import { ifs } from '@ifs/shared/api/ifsClient';

export default function Dashboard() {
    const { user, loading, initialCheckComplete, refreshUser, updateUserProfile } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { toast } = useToast();
    const [isApproving, setIsApproving] = useState(false);
    const [showApplicationPending, setShowApplicationPending] = useState(true);
    const [showOrgWelcome, setShowOrgWelcome] = useState(false);
    const [dashboardData, setDashboardData] = useState({ nextWorkshop: null, latestJobs: [], upcomingBooking: null, allUpcomingEvents: [], upcomingCourses: [], upcomingCommunityEvents: [] });
    const [loadingDashboard, setLoadingDashboard] = useState(true);
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [billingPeriod, setBillingPeriod] = useState('monthly');
    const [showUpgradeSuccessModal, setShowUpgradeSuccessModal] = useState(false);
    const [showWelcomeRewardsModal, setShowWelcomeRewardsModal] = useState(false);
    const [forceShowTour, setForceShowTour] = useState(false);
    const [tourCompleted, setTourCompleted] = useState(false);
    const [pendingInvite, setPendingInvite] = useState(null);
    const [showInviteModal, setShowInviteModal] = useState(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('new_user') === 'true') {
            toast({
                title: "Welcome to your IfS Portal",
                description: "Your account has been created. Complete your onboarding to access all member benefits.",
            });
        }

        const justJoined = sessionStorage.getItem('just_joined_org');
        const orgName = sessionStorage.getItem('org_name');

        if (justJoined === 'true' && orgName) {
            setShowOrgWelcome(true);
            sessionStorage.removeItem('just_joined_org');
            sessionStorage.removeItem('org_name');
        } else if (user?.organisationId && user?.organisationName) {
            const dismissedIds = user.dismissedOrgWelcomeIds || [];
            if (!dismissedIds.includes(user.organisationId)) {
                setShowOrgWelcome(true);
            }
        }

        sessionStorage.removeItem('coming_from_membership_plans');
    }, [toast, user]);

    // REMOVED: useEffect that sets showOnboardingChecklist

    useEffect(() => {
        if (!initialCheckComplete) {
            return;
        }

        if (!user) {
            User.loginWithRedirect(window.location.href);
            return;
        }

        // Check for pending job redirect (e.g. user came from job advert)
        const pendingJobRedirect = sessionStorage.getItem('pending_job_redirect');
        if (pendingJobRedirect) {
            sessionStorage.removeItem('pending_job_redirect');
            sessionStorage.removeItem('pending_job_intent');
            window.location.href = pendingJobRedirect;
            return;
        }

        if (user.needsApplicationProcessing) {
            window.location.href = createPageUrl('ApplicationProcessing');
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const isFreshLogin = urlParams.get('new_user') === 'true';

        if (!user.onboarding_completed && !user.isUnclaimed && !isFreshLogin) {
            window.location.href = createPageUrl('Onboarding');
            return;
        }
    }, [user, initialCheckComplete]);

    useEffect(() => {
        const checkPendingInvite = async () => {
            if (!user || !user.email) {
                console.log('[Dashboard] User not ready for invite check');
                return;
            }

            console.log('[Dashboard] 🔍 Checking for invites. User:', user.email, 'User ID:', user.id, 'Has Org:', !!user.organisationId);

            // Check URL params first
            const urlParams = new URLSearchParams(window.location.search);
            const inviteId = urlParams.get('invite');

            console.log('[Dashboard] URL invite param:', inviteId);

            if (!inviteId) {
                console.log('[Dashboard] No invite ID in URL, checking by email');
                // Check for any pending invites for this user email
                if (!user.organisationId) {
                    try {
                        // Use backend function to bypass RLS
                        const { data } = await ifs.functions.invoke('getMyInvites');

                        if (data?.success) {
                            console.log('[Dashboard] 📋 Invites received:', data.invites);

                            const pendingInvites = (data.invites || []).filter(inv => inv.status === 'pending');
                            console.log('[Dashboard] 🎯 Pending invites:', pendingInvites);

                            if (pendingInvites && pendingInvites.length > 0) {
                                console.log('[Dashboard] ✅ Found pending invite via email:', pendingInvites[0]);
                                setPendingInvite(pendingInvites[0]);
                                setShowInviteModal(true);
                            } else {
                                console.log('[Dashboard] ❌ No pending invites found');
                            }
                        }
                    } catch (error) {
                        console.error('[Dashboard] ❌ Failed to check for invites:', error);
                    }
                }
                return;
            }

            console.log('[Dashboard] 🎯 Invite ID in URL:', inviteId);

            try {
                // Use backend function to fetch invite with service role
                const { data } = await ifs.functions.invoke('getMyInvites');

                if (!data || !data.success) {
                    throw new Error(data?.error || 'Failed to fetch invites');
                }

                console.log('[Dashboard] Received invites from backend:', data.invites);

                // Find the specific invite by ID
                const invites = data.invites.filter(inv =>
                    inv.id === inviteId && inv.status === 'pending'
                );

                console.log('[Dashboard] Filtered for invite ID', inviteId, ':', invites);

                if (invites && invites.length > 0) {
                    const invite = invites[0];
                    console.log('[Dashboard] 📧 Processing invite:', invite);

                    // Check if user already has this organisation
                    if (user.organisationId === invite.organisationId) {
                        console.log('[Dashboard] ⚠️ User already in this organisation');
                        toast({
                            title: "Already a Member",
                            description: `You're already part of ${invite.organisationName}.`,
                        });
                        window.history.replaceState({}, '', createPageUrl('Dashboard'));
                        return;
                    }

                    // Check if user has a different organisation
                    if (user.organisationId && user.organisationId !== invite.organisationId) {
                        console.log('[Dashboard] ⚠️ User has different organisation');
                        toast({
                            title: "Cannot Accept Invite",
                            description: `You're already part of ${user.organisationName}. You can only belong to one organisation.`,
                            variant: "destructive"
                        });
                        window.history.replaceState({}, '', createPageUrl('Dashboard'));
                        return;
                    }

                    console.log('[Dashboard] ✅ Setting modal to show. Invite:', invite.organisationName);
                    setPendingInvite(invite);
                    setShowInviteModal(true);
                    console.log('[Dashboard] Modal state updated. showInviteModal should be true now');

                    // Don't clean URL immediately - let modal render first
                    setTimeout(() => {
                        window.history.replaceState({}, '', createPageUrl('Dashboard'));
                    }, 500);
                } else {
                    console.log('[Dashboard] ⚠️ No valid pending invite found');
                    toast({
                        title: "Invite Not Found",
                        description: "This invitation is no longer valid.",
                        variant: "destructive"
                    });
                    window.history.replaceState({}, '', createPageUrl('Dashboard'));
                }
            } catch (error) {
                console.error('[Dashboard] ❌ Failed to fetch invite:', error);
                toast({
                    title: "Error",
                    description: "Could not load invitation details.",
                    variant: "destructive"
                });
            }
        };

        // Add a small delay to ensure user is fully loaded
        const timer = setTimeout(() => {
            checkPendingInvite();
        }, 100);

        return () => clearTimeout(timer);
    }, [user, toast]);

    useEffect(() => {
        if (!user) {
            return;
        }

        const fetchDashboardData = async () => {
            setLoadingDashboard(true);
            try {
                const [workshops, jobs, signups, allEvents, allCourses, allCourseDates, communityEvents, communitySignups] = await Promise.all([
                    Event.filter({ type: 'Masterclass' }, '-date', 1),
                    Job.filter({ status: 'Active' }, '-created_date', 3),
                    EventSignup.filter({ userId: user.id }, '-eventDate'),
                    Event.filter({ type: 'Masterclass' }, 'date', 50),
                    Course.list('-created_date', 50),
                    CourseDate.list('date', 200),
                    CommunityEvent.list('date', 50),
                    CommunityEventSignup.filter({ userId: user.id })
                ]);

                console.log('[Dashboard] Raw community events:', communityEvents);
                console.log('[Dashboard] Raw masterclass events:', allEvents);

                const now = new Date();
                now.setHours(0, 0, 0, 0);

                const futureAvailableDates = allCourseDates.filter(d =>
                    d.status === 'Available' && new Date(d.date) >= now
                );

                const coursesWithDates = allCourses
                    .map(course => {
                        const courseDates = futureAvailableDates
                            .filter(d => d.courseId === course.id)
                            .sort((a, b) => new Date(a.date) - new Date(b.date));

                        return courseDates.length > 0 ? {
                            ...course,
                            upcomingDates: courseDates.slice(0, 3),
                            nextDate: courseDates[0]
                        } : null;
                    })
                    .filter(course => course !== null)
                    .sort((a, b) => new Date(a.nextDate.date) - new Date(b.nextDate.date))
                    .slice(0, 4);

                let upcomingBooking = null;
                if (signups.length > 0) {
                    const futureSignups = signups.filter(s => new Date(s.eventDate) >= now);
                    if (futureSignups.length > 0) {
                        futureSignups.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
                        upcomingBooking = futureSignups[0];
                    }
                }

                const bookedEventIds = signups.map(s => s.eventId);
                const upcomingEvents = allEvents.filter(e => {
                    const eventDate = new Date(e.date);
                    const isUpcoming = eventDate >= now;
                    console.log('[Dashboard] Masterclass:', e.title, 'Date:', e.date, 'Is upcoming:', isUpcoming);
                    return isUpcoming;
                }).map(e => ({
                    ...e,
                    isBooked: bookedEventIds.includes(e.id)
                }));

                // Get upcoming community events (include ones user is registered for)
                const registeredCommunityEventIds = (communitySignups || []).map(s => s.eventId);
                const upcomingCommunityEvents = (communityEvents || []).filter(e => {
                    const eventDate = new Date(e.date);
                    const isUpcoming = eventDate >= now;
                    const isActive = !e.status || e.status === 'Active';
                    console.log('[Dashboard] Community Event:', e.title, 'Date:', e.date, 'Is upcoming:', isUpcoming, 'Is active:', isActive, 'Status:', e.status);
                    return isUpcoming && isActive;
                }).map(e => ({
                    ...e,
                    isBooked: registeredCommunityEventIds.includes(e.id)
                }));

                console.log('[Dashboard] Filtered upcoming events:', upcomingEvents.length);
                console.log('[Dashboard] Filtered community events:', upcomingCommunityEvents.length);

                setDashboardData({
                    nextWorkshop: workshops.length > 0 ? workshops[0] : null,
                    latestJobs: jobs,
                    upcomingBooking: upcomingBooking,
                    allUpcomingEvents: upcomingEvents,
                    upcomingCourses: coursesWithDates,
                    upcomingCommunityEvents: upcomingCommunityEvents
                });
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
                toast({ title: "Could not load dashboard data", description: error.message, variant: "destructive" });
            } finally {
                setLoadingDashboard(false);
            }
        };
        fetchDashboardData();
    }, [user, toast]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentSuccess = urlParams.get('payment') === 'success';

        if (paymentSuccess && user && user.membershipType === 'Full') {
            const hasSeenUpgradeModal = sessionStorage.getItem('has_seen_upgrade_modal');
            if (!hasSeenUpgradeModal) {
                setShowUpgradeSuccessModal(true);
                sessionStorage.setItem('has_seen_upgrade_modal', 'true');
                window.history.replaceState({}, '', createPageUrl('Dashboard'));
            }
        }
    }, [user]);

    useEffect(() => {
        // DISABLED: Welcome rewards modal no longer shows
        // Users no longer receive a welcome bonus - they earn CPD only through surveys
        const justCompletedOnboarding = sessionStorage.getItem('just_completed_onboarding');

        if (justCompletedOnboarding === 'true') {
            // Clear the flag but don't show the modal
            sessionStorage.removeItem('just_completed_onboarding');
            sessionStorage.setItem('has_seen_welcome_modal', 'true');
        }
    }, [user, tourCompleted]);

    const handleCloseUpgradeSuccessModal = () => {
        setShowUpgradeSuccessModal(false);
    };

    const handleCloseWelcomeRewardsModal = () => {
        setShowWelcomeRewardsModal(false);
    };

    const handleTourComplete = () => {
        console.log('[Dashboard] Tour completed, setting tourCompleted flag');
        setTourCompleted(true);
    };

    const handleApprove = async () => {
        if (!user) return;

        const displayName = user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Member';
        const confirmed = window.confirm(
            `Approve Associate Membership for ${displayName} (${user.email})?\n\nThis will grant Associate Member status and access.`
        );

        if (!confirmed) return;

        setIsApproving(true);
        try {
            const result = await approveAssociateMembership({ userId: user.id });

            if (result.data.creditsAwarded && result.data.creditsAwarded > 0) {
                toast({
                    title: "Membership Approved",
                    description: `Welcome! You've been awarded ${result.data.creditsAwarded} credits.`,
                });
            } else {
                toast({
                    title: "Membership Approved",
                    description: "Your Associate Membership is now active.",
                });
            }

            await refreshUser();
        } catch (error) {
            toast({
                title: "Approval Failed",
                description: error.message || "There was an issue approving the membership.",
                variant: "destructive",
            });
        } finally {
            setIsApproving(false);
        }
    };

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
            setIsUpgrading(false);
        }
    };

    const handleStartTour = async () => {
        try {
            console.log('[Tour] Starting tour, resetting hasSeenPortalTour flag');
            await updateUserProfile({ hasSeenPortalTour: false });
            setForceShowTour(true);
            setTimeout(() => {
                setForceShowTour(false);
            }, 100);
            toast({
                title: "Tour Starting",
                description: "The portal tour will begin in a moment...",
            });
        } catch (error) {
            console.error('Failed to restart tour:', error);
            toast({
                title: "Error",
                description: "Could not restart the tour. Please refresh the page.",
                variant: "destructive"
            });
        }
    };

    if (loading || !initialCheckComplete) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const isApplicant = user.membershipStatus === 'pending' || user.membershipStatus === 'applicant';
    const displayName = user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Member';
    const isFullMember = user.membershipType === 'Full';
    const isAssociate = user.membershipType === 'Associate';
    const isGabriel = user?.email === 'gabriel@cause.cx';

    const monthlyPrice = '20';
    const annualPrice = '240';

    // Combine all free upcoming events (Masterclasses + Community Events)
    const allFreeUpcomingEvents = [
        ...(dashboardData.allUpcomingEvents || []).map(e => ({
            ...e,
            eventType: 'masterclass',
            linkTo: `MasterclassDetails?id=${e.id}`
        })),
        ...(dashboardData.upcomingCommunityEvents || []).map(e => ({
            ...e,
            eventType: 'community',
            linkTo: `CommunityEventDetails?id=${e.id}`
        }))
    ].sort((a, b) => new Date(a.date) - new Date(b.date));

    console.log('[Dashboard] Community Events Count:', dashboardData.upcomingCommunityEvents?.length || 0);
    console.log('[Dashboard] Masterclass Events Count:', dashboardData.allUpcomingEvents?.length || 0);
    console.log('[Dashboard] Combined Events Count:', allFreeUpcomingEvents.length);

    return (
        <div className="flex h-screen bg-slate-50/30">
            <Toaster />
            <PortalTour key={forceShowTour ? 'force-show' : 'normal'} onComplete={handleTourComplete} />
            <UpgradeSuccessModal
                open={showUpgradeSuccessModal}
                onClose={handleCloseUpgradeSuccessModal}
                user={user}
            />
            <WelcomeRewardsModal
                open={false}
                onClose={handleCloseWelcomeRewardsModal}
                user={user}
            />
            {pendingInvite && (
                <AcceptInviteModal
                    open={showInviteModal}
                    onClose={() => setShowInviteModal(false)}
                    invite={pendingInvite}
                    user={user}
                />
            )}

            <PortalSidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="Dashboard" />

            <div className="flex-1 flex flex-col overflow-hidden">
                <PortalHeader setSidebarOpen={setSidebarOpen} user={user} />

                {showOrgWelcome && user.organisationName && (
                    <div className="bg-purple-600 border-b border-purple-700">
                        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                            <div className="flex items-start justify-between flex-wrap gap-4">
                                <div className="flex-1 flex items-start gap-4">
                                    <div className="flex-shrink-0 p-2 rounded-lg bg-white/20">
                                        <Building2 className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-lg font-semibold text-white mb-1">
                                            Welcome to {user.organisationName}
                                        </h2>
                                        <p className="text-white/90 text-sm">
                                            You've successfully joined your organisation on the IfS platform.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        asChild
                                        size="sm"
                                        variant="secondary"
                                    >
                                        <Link to={createPageUrl('ManageOrganisation')}>
                                            View Organisation
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Link>
                                    </Button>
                                    <button
                                        type="button"
                                        className="p-2 rounded-md hover:bg-white/10"
                                        onClick={async () => {
                                            setShowOrgWelcome(false);
                                            if (user?.organisationId) {
                                                const currentIds = user.dismissedOrgWelcomeIds || [];
                                                if (!currentIds.includes(user.organisationId)) {
                                                    try {
                                                        await updateUserProfile({
                                                            dismissedOrgWelcomeIds: [...currentIds, user.organisationId]
                                                        });
                                                    } catch (e) {
                                                        console.error("Failed to save dismissal preference", e);
                                                    }
                                                }
                                            }
                                        }}
                                    >
                                        <X className="h-5 w-5 text-white" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isApplicant && showApplicationPending && (
                    <div className="bg-yellow-50 border-b border-yellow-200">
                        <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center justify-between flex-wrap">
                                <div className="flex-1 flex items-center gap-3">
                                    <Bell className="h-5 w-5 text-yellow-600" />
                                    <p className="font-medium text-yellow-900 text-sm">
                                        Your membership application is pending approval.
                                    </p>
                                </div>
                                {user.role === 'admin' && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="bg-white border-yellow-300 text-yellow-900 hover:bg-yellow-50"
                                        onClick={handleApprove}
                                        disabled={isApproving}
                                    >
                                        <Shield className="w-4 h-4 mr-2" />
                                        {isApproving ? 'Approving...' : 'Admin: Approve'}
                                    </Button>
                                )}
                                <button
                                    type="button"
                                    className="p-2 rounded-md hover:bg-yellow-100"
                                    onClick={() => setShowApplicationPending(false)}
                                >
                                    <X className="h-5 w-5 text-yellow-700" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <main className="flex-1 overflow-y-auto p-6 md:p-8 pb-20 md:pb-8">
                    <div className="max-w-7xl mx-auto w-full space-y-8">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="flex-1 min-w-0">
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, {displayName.split(' ')[0]}</h1>
                                <p className="text-slate-600">
                                    {isFullMember
                                        ? "Your professional development dashboard and member resources."
                                        : "Access your member resources and professional development opportunities."
                                    }
                                </p>
                            </div>

                            {isGabriel && (
                                <div className="flex-shrink-0">
                                    <Button
                                        onClick={handleStartTour}
                                        variant="outline"
                                        size="sm"
                                        className="border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400"
                                    >
                                        <Play className="w-4 h-4 mr-2" />
                                        Start Tour
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* REMOVED: OnboardingChecklist rendering */}

                        {/* Quick Actions */}
                        <div className="flex gap-3 flex-wrap">
                            <Link
                                to={createPageUrl('CPDTraining')}
                                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:text-slate-900 transition-colors"
                            >
                                Training
                            </Link>
                            <Link
                                to={createPageUrl('MemberMasterclasses')}
                                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:text-slate-900 transition-colors"
                            >
                                Events
                            </Link>
                            <Link
                                to={createPageUrl('JobsBoard')}
                                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:text-slate-900 transition-colors"
                            >
                                Jobs
                            </Link>
                            <Link
                                to={createPageUrl('MyCertificates')}
                                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:text-slate-900 transition-colors"
                            >
                                Credentials
                            </Link>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* LEFT COLUMN - Main Content */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Events Section */}
                                <DashboardEventsSection
                                    events={allFreeUpcomingEvents}
                                    upcomingBooking={dashboardData.upcomingBooking}
                                    loading={loadingDashboard}
                                />


                                <CourseBookingsCard user={user} hideIfEmpty={true} limit={3} />

                                {/* Training Section */}
                                <DashboardTrainingSection
                                    courses={dashboardData.upcomingCourses}
                                    user={user}
                                    loading={loadingDashboard}
                                />
                            </div>

                            {/* RIGHT COLUMN - Sidebar */}
                            <div className="space-y-6">
                                {/* Organisation Portal - Show to users WITH an organisation */}
                                {user.organisationId && (
                                    <div className="bg-white rounded-lg border-t-4 border-t-purple-600 border border-slate-200 shadow-sm overflow-hidden">
                                        <div className="p-5">
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                                                    <Building2 className="w-5 h-5 text-white stroke-[1.5]" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-slate-900 mb-1">Organisation Portal</h3>
                                                    <p className="text-sm text-slate-600 leading-relaxed">
                                                        Manage your organisation, team members, and membership seats.
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                asChild
                                                size="sm"
                                                className="w-full h-10 text-sm font-medium bg-purple-600 hover:bg-purple-700"
                                            >
                                                <Link to={createPageUrl('ManageOrganisation')}>
                                                    View Organisation Portal
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Surveys Section - Only shows if active surveys exist */}
                                <DashboardSurveysSection />

                                {/* Organisation Registration - Show to all users without an org */}
                                {!user.organisationId && (
                                    <div className="bg-white rounded-lg border-t-4 border-t-purple-600 border border-slate-200 shadow-sm overflow-hidden">
                                        <div className="p-5">
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                                                    <Building2 className="w-5 h-5 text-white stroke-[1.5]" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-slate-900">Register Your Organisation</h3>
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Free</span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 leading-relaxed">
                                                        Add your organisation to our directory and optionally purchase Full Membership seats for your team.
                                                    </p>
                                                </div>
                                            </div>
                                            <ul className="space-y-2 mb-4">
                                                <li className="flex items-center gap-2 text-sm text-slate-700">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                                                    <span className="font-medium">Free directory listing</span>
                                                </li>
                                                <li className="flex items-center gap-2 text-sm text-slate-600">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                    Connect unlimited team members
                                                </li>
                                                <li className="flex items-center gap-2 text-sm text-slate-600">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                    Option to purchase team seats
                                                </li>
                                            </ul>
                                            <Button
                                                asChild
                                                size="sm"
                                                className="w-full h-10 text-sm font-medium bg-purple-600 hover:bg-purple-700"
                                            >
                                                <Link to={createPageUrl('MembershipPlans') + '?tab=organisations'}>
                                                    Register Organisation
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Upgrade & Organisation Options - Equal prominence */}
                                {/* Membership & Organisation Options - Side by side for Associates without org */}
                                {isAssociate && user.membershipStatus === 'active' && !user.organisationId && (
                                    <div className="bg-white rounded-lg border-t-4 border-t-slate-900 border border-slate-200 shadow-sm overflow-hidden">
                                        <div className="p-5" data-tour="upgrade">
                                            {/* Full Membership Upgrade */}
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0">
                                                    <Shield className="w-5 h-5 text-white stroke-[1.5]" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-slate-900">Full Membership (MIFS)</h3>
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">£20/month</span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 leading-relaxed">
                                                        Professional recognition with CPD hours and training discounts.
                                                    </p>
                                                </div>
                                            </div>
                                            <ul className="space-y-2 mb-4">
                                                <li className="flex items-center gap-2 text-sm text-slate-700">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                                                    <span className="font-medium">1 CPD Hour/month included</span>
                                                </li>
                                                <li className="flex items-center gap-2 text-sm text-slate-600">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                    MIFS post-nominal designation
                                                </li>
                                                <li className="flex items-center gap-2 text-sm text-slate-600">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                    10% discount on all training
                                                </li>
                                            </ul>
                                            <Button
                                                onClick={handleUpgradeToFull}
                                                disabled={isUpgrading}
                                                size="sm"
                                                className="w-full h-10 text-sm font-medium bg-slate-900 hover:bg-slate-800"
                                            >
                                                {isUpgrading ? 'Processing...' : 'Upgrade to Full Membership'}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Only upgrade card for Associates WITH an organisation */}
                                {isAssociate && user.membershipStatus === 'active' && user.organisationId && (
                                    <div className="bg-white rounded-lg border-t-4 border-t-slate-900 border border-slate-200 shadow-sm overflow-hidden" data-tour="upgrade">
                                        <div className="p-5">
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0">
                                                    <Shield className="w-5 h-5 text-white stroke-[1.5]" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-slate-900">Full Membership (MIFS)</h3>
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">£20/month</span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 leading-relaxed">
                                                        Professional recognition with CPD hours and training discounts.
                                                    </p>
                                                </div>
                                            </div>
                                            <ul className="space-y-2 mb-4">
                                                <li className="flex items-center gap-2 text-sm text-slate-700">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                                                    <span className="font-medium">1 CPD Hour/month included</span>
                                                </li>
                                                <li className="flex items-center gap-2 text-sm text-slate-600">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                    MIFS post-nominal designation
                                                </li>
                                                <li className="flex items-center gap-2 text-sm text-slate-600">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                    10% discount on all training
                                                </li>
                                            </ul>
                                            <Button
                                                onClick={handleUpgradeToFull}
                                                disabled={isUpgrading}
                                                size="sm"
                                                className="w-full h-10 text-sm font-medium bg-slate-900 hover:bg-slate-800"
                                            >
                                                {isUpgrading ? 'Processing...' : 'Upgrade to Full Membership'}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {isFullMember && (
                                    <div className="bg-white rounded-lg border border-slate-200">
                                        <div className="px-4 py-3 border-b border-slate-100">
                                            <h3 className="font-medium text-slate-900 text-sm">CPD Hours</h3>
                                        </div>
                                        <div className="p-4">
                                            <div className="text-center mb-4">
                                                <div className="text-3xl font-bold text-slate-900">
                                                    {(user.cpdHours || 0).toFixed(1)}
                                                </div>
                                                <div className="text-xs text-slate-500">hours available</div>
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Monthly</span>
                                                    <span className="font-medium">{user.monthlyCpdHours || 1} hr</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Total earned</span>
                                                    <span className="font-medium">{(user.totalCpdEarned || 0).toFixed(1)} hrs</span>
                                                </div>
                                            </div>
                                            <Link
                                                to={createPageUrl('PortalMembershipTiers')}
                                                className="block text-center text-sm text-slate-600 hover:text-slate-900 mt-4 pt-3 border-t border-slate-100"
                                            >
                                                View history →
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                {/* Membership Card */}
                                <div className="bg-white rounded-lg border border-slate-200">
                                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                        <h3 className="font-medium text-slate-900 text-sm">Membership</h3>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${user.membershipStatus === 'active'
                                            ? 'bg-green-50 text-green-700'
                                            : 'bg-yellow-50 text-yellow-700'
                                            }`}>
                                            {user.membershipStatus}
                                        </span>
                                    </div>
                                    <div className="p-4">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Type</span>
                                                <span className="font-medium">{user.membershipType}</span>
                                            </div>
                                            {isFullMember && user.subscriptionStartDate && (
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Since</span>
                                                    <span className="font-medium">
                                                        {format(new Date(user.subscriptionStartDate), 'MMM yyyy')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <Link
                                            to={createPageUrl('MyProfile')}
                                            className="block text-center text-sm text-slate-600 hover:text-slate-900 mt-4 pt-3 border-t border-slate-100"
                                        >
                                            Manage membership →
                                        </Link>
                                    </div>
                                </div>

                                {/* Quick Links */}
                                <div className="bg-white rounded-lg border border-slate-200">
                                    <div className="px-4 py-3 border-b border-slate-100">
                                        <h3 className="font-medium text-slate-900 text-sm">Quick Links</h3>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <Link
                                            to={createPageUrl('SupervisionServices')}
                                            className="block text-sm text-slate-600 hover:text-slate-900 transition-colors"
                                        >
                                            Supervision Services
                                        </Link>
                                        <Link
                                            to={createPageUrl('MyCertificates')}
                                            className="block text-sm text-slate-600 hover:text-slate-900 transition-colors"
                                        >
                                            My Credentials
                                        </Link>
                                        <Link
                                            to={createPageUrl('JobsBoard')}
                                            className="block text-sm text-slate-600 hover:text-slate-900 transition-colors"
                                        >
                                            Jobs Board
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
