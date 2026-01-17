import React, { useState, useEffect } from 'react';
import { base44 } from '@ifs/shared/api/base44Client';
import { useUser } from '@ifs/shared/components/providers/UserProvider';
import { createPageUrl } from '@ifs/shared/utils';
import { useLocation, Link } from 'react-router-dom';
import PortalSidebar from '../components/portal/PortalSidebar';
import PortalHeader from '../components/portal/PortalHeader';
import MainSiteNav from '../components/marketing/MainSiteNav';
import { Button } from '@ifs/shared/components/ui/button';
import { Card, CardContent } from '@ifs/shared/components/ui/card';
import { Badge } from '@ifs/shared/components/ui/badge';
import { Textarea } from '@ifs/shared/components/ui/textarea';
import { Label } from '@ifs/shared/components/ui/label';
import { Input } from '@ifs/shared/components/ui/input';
import {
    Loader2,
    Calendar,
    Clock,
    MapPin,
    CheckCircle,
    Coffee,
    MessageSquare,
    UserCheck,
    ArrowLeft,
    Users,
    Info,
    BookOpen,
    LogIn,
    Trash2,
    ChevronRight,
    Link2, // Added for portal view
    ExternalLink // Added for marketing view
} from 'lucide-react';
import { useToast } from "@ifs/shared/components/ui/use-toast";
import { Toaster } from "@ifs/shared/components/ui/toaster";
import { format, isBefore, startOfDay } from 'date-fns';
import { addZoomRegistrant } from '@ifs/shared/api/functions';
import { registerForCommunityEvent } from '@ifs/shared/api/functions';
import { cancelCommunityEventRegistration } from '@ifs/shared/api/functions';
import { sendEmail } from '@ifs/shared/api/functions';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@ifs/shared/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@ifs/shared/components/ui/alert-dialog";


const EventTypeIcon = ({ type, className = "w-5 h-5" }) => {
    switch (type) {
        case 'Forum':
            return <MessageSquare className={className} />;
        case 'Coffee Morning':
            return <Coffee className={className} />;
        case 'Networking':
            return <Users className={className} />;
        case 'Membership Information Sessions':
            return <Info className={className} />;
        default:
            return <Users className={className} />;
    }
};

export default function CommunityEventDetails() {
    const { user, loading: userLoading, initialCheckComplete } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [event, setEvent] = useState(null);
    const [userSignup, setUserSignup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registrationNotes, setRegistrationNotes] = useState('');
    const [isRegistering, setIsRegistering] = useState(false); // Used for guest registration
    const [isBooking, setIsBooking] = useState(false); // Used for logged-in user registration
    const [isRemoving, setIsRemoving] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

    // For guest registration (Membership Info Sessions)
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');

    const { toast } = useToast();
    const location = useLocation();

    // Check if coming from Events (marketing site) - this determines the layout
    const urlParams = new URLSearchParams(window.location.search);
    const fromEvents = urlParams.get('from') === 'Events';

    // Determine if this should use portal layout
    // Use portal layout ONLY if user is logged in AND NOT coming from marketing site
    const isPortalView = !!user && !fromEvents;

    useEffect(() => {
        // Only redirect to onboarding if:
        // 1. User is logged in
        // 2. User hasn't completed onboarding
        // 3. User is not unclaimed
        // 4. NOT coming from marketing site (fromEvents) - This condition remains relevant
        if (!userLoading && user && !user.onboarding_completed && !user.isUnclaimed && !fromEvents) {
            window.location.href = createPageUrl('Onboarding');
            return;
        }
    }, [user, userLoading, fromEvents]);

    useEffect(() => {
        fetchEventDetails();
    }, [location.search, user]); // Added user dependency

    const fetchEventDetails = async () => {
        setLoading(true);
        try {
            const eventId = urlParams.get('id');

            if (!eventId) {
                toast({
                    title: "Error",
                    description: "No event ID provided",
                    variant: "destructive"
                });
                // Redirect back to appropriate page
                window.location.href = createPageUrl(fromEvents ? 'Events' : 'CommunityEvents');
                return;
            }

            // Fetch event (no auth required for viewing)
            const events = await base44.entities.CommunityEvent.filter({ id: eventId });

            if (!events || events.length === 0) {
                toast({
                    title: "Event Not Found",
                    description: "The event you're looking for doesn't exist",
                    variant: "destructive"
                });
                window.location.href = createPageUrl(fromEvents ? 'Events' : 'CommunityEvents');
                return;
            }

            setEvent(events[0]);

            // CRITICAL FIX: Check signup status when user is available
            if (user) {
                console.log('[CommunityEventDetails] Checking signup for user:', user.id, 'event:', eventId);
                const signups = await base44.entities.CommunityEventSignup.filter({ eventId, userId: user.id });
                console.log('[CommunityEventDetails] Found signups:', signups);
                setUserSignup(signups && signups.length > 0 ? signups[0] : null);
            } else {
                console.log('[CommunityEventDetails] No user logged in, skipping signup check');
                setUserSignup(null);
            }

        } catch (error) {
            console.error('Failed to fetch event details:', error);
            toast({
                title: "Error",
                description: "Could not load event details. Please try again.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    // This function is no longer called in handleRegister, but kept as it was not explicitly removed in the outline.
    const getEmailWrapper = (content) => {
        const year = new Date().getFullYear();
        const emailFooter = `<td align="center" style="padding: 20px; background-color: #f4f4f7; font-size: 12px; color: #777777; border-top: 1px solid #e2e2e2;"><p style="margin: 0;">&copy; ${year} Independent Federation for Safeguarding. All rights reserved.</p><p style="margin: 5px 0 0 0;">6-8 Revenge Road, Chatham, ME5 8UD</p><p style="margin: 5px 0 0 0;">This is an automated message, please do not reply to this email.</p></td>`;

        return `
            <!DOCTYPE html><html lang="en"><body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; background-color: #f4f4f7;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f4f4f7" style="padding: 20px 0;"><tr><td align="center">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e2e2;">
            <tr>${content}</tr><tr>${emailFooter}</tr>
            </table></td></tr></table></body></html>
        `;
    };

    // Handle guest registration for Membership Info Sessions
    const handleRegister = async () => {
        if (!event) return;

        const isMembershipInfoSession = event.type === 'Membership Information Sessions';

        if (!isMembershipInfoSession || user) {
            // This function is specifically for *guest* registration on info sessions.
            // If it's not an info session, or if a user is logged in, it should not be called this way.
            // Logged-in users will use handleInitiateBooking.
            return;
        }

        if (!guestEmail.trim() || !guestName.trim()) {
            toast({
                title: "Required Fields",
                description: "Please provide your name and email address.",
                variant: "destructive"
            });
            return;
        }

        setIsRegistering(true);
        try {
            let zoomJoinUrl = null;

            // Handle Zoom registration for online events if event.zoomMeetingId is provided
            if (event.zoomMeetingId && event.location === 'Online') {
                try {
                    const nameParts = guestName.trim().split(' ');
                    const firstName = nameParts[0] || 'Guest';
                    const lastName = nameParts.slice(1).join(' ') || '';

                    const { data: zoomResult } = await addZoomRegistrant({
                        meetingId: event.zoomMeetingId,
                        firstName,
                        lastName,
                        email: guestEmail
                    });

                    if (zoomResult.success && zoomResult.joinUrl) {
                        zoomJoinUrl = zoomResult.joinUrl;
                    }
                } catch (zoomError) {
                    console.error('Zoom registration error for guest:', zoomError);
                }
            }

            // Register via backend function
            const { data } = await registerForCommunityEvent({
                eventId: event.id,
                guestName,
                guestEmail,
                registrationNotes,
                zoomJoinUrl // Pass the generated Zoom join URL if any
            });

            if (data.error) {
                throw new Error(data.error);
            }

            // Update local state
            setUserSignup(data.signup);
            setEvent(data.event);

            toast({
                title: "Registration Successful!",
                description: `Check ${guestEmail} for confirmation details.`,
            });

            // Redirect to success page with event data
            setTimeout(() => {
                window.location.href = createPageUrl('EventRegistrationSuccess') + `?eventId=${event.id}&type=community`;
            }, 1000);

        } catch (error) {
            console.error('Guest registration failed:', error);
            toast({
                title: "Registration Failed",
                description: error.message || "There was an error with your registration. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsRegistering(false);
        }
    };

    // Handle registration for logged-in users
    const handleInitiateBooking = async () => {
        if (!event || !user) return; // This function should only be called by logged-in users

        const isMembershipInfoSession = event.type === 'Membership Information Sessions';

        // Check membership requirement (only for non-Info Session events)
        if (!isMembershipInfoSession) {
            const isAssociate = user.membershipType === 'Associate' || user.membershipType === 'Full';
            if (!isAssociate) {
                toast({
                    title: "Membership Required",
                    description: "This event requires an Associate or Full membership. Please join first.",
                    variant: "destructive"
                });
                return;
            }
        }

        setIsBooking(true);
        try {
            let zoomJoinUrl = null;

            // Handle Zoom registration for online events if event.zoomMeetingId is provided
            if (event.zoomMeetingId && event.location === 'Online') {
                try {
                    const { data: zoomResult } = await addZoomRegistrant({
                        meetingId: event.zoomMeetingId,
                        firstName: user.firstName || user.displayName?.split(' ')[0] || 'Member',
                        lastName: user.lastName || user.displayName?.split(' ').slice(1).join(' ') || '',
                        email: user.email
                    });

                    if (zoomResult.success && zoomResult.joinUrl) {
                        zoomJoinUrl = zoomResult.joinUrl;
                    }
                } catch (zoomError) {
                    console.error('Zoom registration error:', zoomError);
                }
            }

            // Register via backend function
            const { data } = await registerForCommunityEvent({
                eventId: event.id,
                registrationNotes,
                zoomJoinUrl // Pass the generated Zoom join URL if any
            });

            if (data.error) {
                throw new Error(data.error);
            }

            // Update local state
            setUserSignup(data.signup);
            setEvent(data.event);

            toast({
                title: "Registration Successful!",
                description: `You're now registered for ${event.title}. Check your email for confirmation details.`,
            });

            // Redirect to success page with event data
            setTimeout(() => {
                window.location.href = createPageUrl('EventRegistrationSuccess') + `?eventId=${event.id}&type=community`;
            }, 1000);

        } catch (error) {
            console.error('Registration failed:', error);
            toast({
                title: "Registration Failed",
                description: error.message || "There was an error with your registration. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsBooking(false);
        }
    };


    const handleRemoveRegistration = async () => {
        if (!userSignup) return;
        setIsRemoving(true);
        try {
            const { data } = await cancelCommunityEventRegistration({
                signupId: userSignup.id
            });

            if (data.error) {
                throw new Error(data.error);
            }

            setUserSignup(null);
            setEvent(data.event);
            setCancelDialogOpen(false);


            toast({
                title: "Registration Removed",
                description: `You are no longer registered for "${event.title}".`
            });
        } catch (error) {
            console.error("Failed to remove registration:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to remove your registration. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsRemoving(false);
        }
    };

    const handleJoin = () => {
        // Create redirect URL back to THIS event details page
        const eventDetailsUrl = window.location.href;
        const onboardingUrl = createPageUrl('Onboarding') + `?intent=associate&redirect=${encodeURIComponent(eventDetailsUrl)}`;

        window.location.href = onboardingUrl;
    };

    // Show loading only if we're actually loading data
    // Don't show loading if we're just waiting for user auth in marketing context
    // The `isPortalView` condition here might need re-evaluation based on the new logic.
    // If isPortalView is true just because a user is logged in, but they came from a marketing event,
    // they might still see a loading spinner unnecessarily.
    // However, the original intent was to show loading for portal view regardless,
    // and marketing view only if data is loading. The new `isPortalView` logic aligns better
    // with showing a full-page loader if a logged-in user is present and data is still being fetched.
    if (loading || (userLoading && user)) { // Simplified: if user is loading and a user object is eventually expected
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
            </div>
        );
    }

    if (!event) {
        return null;
    }

    const isFullOrCancelled = event.status === 'Full' || event.status === 'Cancelled';
    const isPast = isBefore(new Date(event.date), startOfDay(new Date()));
    const isRegistered = !!userSignup;

    // Check if membership is required
    const isMembershipInfoSession = event.type === 'Membership Information Sessions';
    const requiresMembership = !isMembershipInfoSession;
    const isAssociate = user && (user.membershipType === 'Associate' || user.membershipType === 'Full');

    // Main content component for portal view
    const PortalEventContent = () => (
        <div className="max-w-4xl mx-auto">
            <Button
                variant="ghost"
                className="mb-6"
                onClick={() => window.location.href = createPageUrl('CommunityEvents')}
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
            </Button>

            {event.imageUrl && (
                <div className="mb-8 rounded-2xl overflow-hidden shadow-xl">
                    <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-80 object-cover"
                    />
                </div>
            )}

            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <Badge className="bg-purple-100 text-purple-700 px-4 py-2">
                        <EventTypeIcon type={event.type} className="w-4 h-4 mr-2" />
                        {event.type}
                    </Badge>
                    {isRegistered && (
                        <Badge className="bg-green-100 text-green-700 px-4 py-2">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            You're Registered
                        </Badge>
                    )}
                    {event.status === 'Full' && !isRegistered && (
                        <Badge variant="destructive" className="px-4 py-2">Event Full</Badge>
                    )}
                    {isPast && (
                        <Badge variant="outline" className="px-4 py-2">Past Event</Badge>
                    )}
                </div>
                <h1 className="text-4xl font-bold text-slate-900 mb-4">{event.title}</h1>
                {event.description && (
                    <p className="text-lg text-slate-600 leading-relaxed">{event.description}</p>
                )}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <div className="p-6">
                            <h3 className="font-bold text-lg mb-4">Event Details</h3>
                            <div className="space-y-3">
                                <div><strong>Date:</strong> {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</div>
                                {event.startTime && event.endTime && (
                                    <div><strong>Time:</strong> {event.startTime} - {event.endTime}</div>
                                )}
                                <div><strong>Location:</strong> {event.location}</div>
                                {event.facilitator && <div><strong>Facilitator:</strong> {event.facilitator}</div>}
                                {event.maxParticipants && (
                                    <div><strong>Capacity:</strong> {event.currentParticipants || 0} / {event.maxParticipants}</div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {event.tags && event.tags.length > 0 && (
                        <Card>
                            <div className="p-6">
                                <h3 className="font-bold text-lg mb-3">Topics</h3>
                                <div className="flex flex-wrap gap-2">
                                    {event.tags.map((tag, idx) => (
                                        <Badge key={idx} variant="outline">{tag}</Badge>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Meeting Details for Registered Users */}
                    {isRegistered && event.meetingUrl && (
                        <Card className="border-blue-200 bg-blue-50">
                            <div className="p-6">
                                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                    <Link2 className="w-5 h-5 text-blue-600" />
                                    Join Online
                                </h3>
                                <Button asChild className="w-full mb-3 bg-blue-600 hover:bg-blue-700">
                                    <a href={event.meetingUrl} target="_blank" rel="noopener noreferrer">
                                        <LogIn className="w-4 h-4 mr-2" />
                                        Join Meeting
                                    </a>
                                </Button>
                                <div className="text-sm text-blue-800 bg-blue-100 p-3 rounded space-y-1">
                                    {event.meetingId && (
                                        <p><strong>Meeting ID:</strong> {event.meetingId}</p>
                                    )}
                                    {event.meetingPassword && (
                                        <p><strong>Password:</strong> {event.meetingPassword}</p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                <div>
                    <Card className="sticky top-6">
                        <div className="p-6">
                            <h3 className="font-bold text-lg mb-4">Registration</h3>
                            {isRegistered ? (
                                <div className="text-center py-4">
                                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                                    <p className="font-bold text-lg mb-2">You're Registered!</p>
                                    <p className="text-sm text-gray-600">Check your email for details</p>
                                    {userSignup?.userId === 'guest' && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            Registered as guest. To manage future registrations, consider <button onClick={() => window.location.href = createPageUrl('Onboarding')} className="text-purple-600 hover:underline">creating an account</button>.
                                        </p>
                                    )}
                                    <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 mt-4"
                                                disabled={isRemoving}
                                            >
                                                {isRemoving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                                Cancel Registration
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Cancel Registration?</DialogTitle>
                                                <DialogDescription>
                                                    Are you sure you want to cancel your registration for "{event.title}"?
                                                </DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter className="gap-2 sm:gap-0">
                                                <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                                                    Keep Registration
                                                </Button>
                                                <Button
                                                    onClick={handleRemoveRegistration}
                                                    className="bg-red-600 hover:bg-red-700"
                                                    disabled={isRemoving}
                                                >
                                                    {isRemoving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Cancellation'}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            ) : isPast ? (
                                <p className="text-center text-gray-600 py-4">This event has ended</p>
                            ) : isFullOrCancelled ? (
                                <p className="text-center text-gray-600 py-4">This event is {event.status.toLowerCase()}</p>
                            ) : (
                                <>
                                    <div className="mb-4">
                                        <Label htmlFor="notes" className="text-sm mb-2 block">
                                            Additional Notes (Optional)
                                        </Label>
                                        <Textarea
                                            id="notes"
                                            value={registrationNotes}
                                            onChange={(e) => setRegistrationNotes(e.target.value)}
                                            placeholder="Any dietary requirements, accessibility needs, or questions?"
                                            rows={3}
                                        />
                                    </div>
                                    <Button
                                        onClick={handleInitiateBooking} // Use handleInitiateBooking for logged-in users
                                        disabled={isBooking}
                                        className="w-full bg-purple-600 hover:bg-purple-700"
                                    >
                                        {isBooking ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Registering...
                                            </>
                                        ) : (
                                            'Register for This Event'
                                        )}
                                    </Button>
                                </>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );

    // Render with appropriate layout
    if (isPortalView) {
        return (
            <div className="flex h-screen bg-slate-50/30">
                <Toaster />
                <PortalSidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="CommunityEvents" />

                <div className="flex-1 flex flex-col overflow-hidden">
                    <PortalHeader setSidebarOpen={setSidebarOpen} user={user} />

                    <main className="flex-1 overflow-y-auto p-6 md:p-8 pb-20 md:pb-8">
                        <PortalEventContent />
                    </main>
                </div>
            </div>
        );
    }

    // Marketing site view - with guest registration for info sessions
    return (
        <>
            <Toaster />
            {/* Hero Header Section */}
            <section className="relative bg-gray-900 overflow-hidden min-h-[450px] sm:min-h-[500px] lg:min-h-[600px]">
                <div className="absolute inset-0">
                    <img
                        src={event?.imageUrl || "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2069&auto=format&fit=crop"}
                        alt={event?.title || "Community event"}
                        className="w-full h-full object-cover opacity-40"
                    />
                </div>

                <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-purple-800/80 to-transparent"></div>

                <MainSiteNav onMobileMenuToggle={setMobileMenuOpen} />

                <div className="relative z-10 max-w-screen-xl mx-auto h-full">
                    <div className="grid lg:grid-cols-2 items-center min-h-[450px] sm:min-h-[500px] lg:min-h-[600px]">
                        <div className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-32 text-center lg:text-left">
                            <div className="text-xs sm:text-sm text-purple-200 mb-3 sm:mb-4 font-medium tracking-wider uppercase">
                                <button
                                    onClick={() => window.location.href = createPageUrl('Events')}
                                    className="inline-flex items-center hover:text-white transition-colors group cursor-pointer"
                                >
                                    <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 group-hover:-translate-x-1 transition-transform" />
                                    <span className="hidden sm:inline">Back to Events</span>
                                    <span className="sm:hidden">Events</span>
                                </button>
                                <span className="mx-1 sm:mx-2">/</span>
                                <span className="text-white">Event Details</span>
                            </div>

                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 mb-4 sm:mb-6 mt-4 sm:mt-8">
                                <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm text-xs sm:text-sm px-2 py-1">
                                    {event.type}
                                </Badge>
                                {isMembershipInfoSession && (
                                    <Badge className="bg-blue-600/80 text-white border-0 backdrop-blur-sm text-xs sm:text-sm px-2 py-1">
                                        <Info className="w-2.5 h-2.5 sm:w-3 h-3 mr-1" />
                                        Open to All
                                    </Badge>
                                )}
                                <Badge className="bg-green-600/80 text-white border-0 backdrop-blur-sm text-xs sm:text-sm px-2 py-1">
                                    Free
                                </Badge>
                            </div>

                            <h1 className="mt-8 text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-4 sm:mb-6">
                                {event.title}
                            </h1>

                            <div className="text-base sm:text-lg lg:text-xl text-purple-100 mb-6 sm:mb-8 leading-relaxed max-w-3xl mx-auto lg:mx-0">
                                <p className="hidden sm:block">{event.description ? event.description.substring(0, 200) + '...' : 'Join us for this community event.'}</p>
                                <p className="sm:hidden">{event.description ? event.description.substring(0, 120) + '...' : 'Join us for this community event.'}</p>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 lg:gap-6 text-purple-100 mb-6 sm:mb-8 text-sm sm:text-base">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="text-center sm:text-left">{format(new Date(event.date), 'EEEE, MMMM dd, yyyy')}</span>
                                </div>
                                {event.startTime && event.endTime && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span>{event.startTime} - {event.endTime}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="text-center sm:text-left">{event.location}</span>
                                </div>
                            </div>

                            <div className="hidden lg:inline-flex items-center gap-4">
                                <Button
                                    onClick={() => {
                                        const detailsSection = document.getElementById('event-details');
                                        if (detailsSection) {
                                            detailsSection.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }}
                                    size="lg"
                                    className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm"
                                >
                                    View Details
                                </Button>
                            </div>
                        </div>
                        <div className="hidden lg:block"></div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="min-h-[calc(100vh-64px)] bg-slate-50 pb-24 sm:pb-28 lg:pb-0">
                <div id="event-details" className="max-w-screen-xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-12">
                    <section className="pb-8 sm:pb-12">
                        <div className="lg:flex lg:gap-12">
                            <div className="lg:flex-1">
                                <div className="space-y-6 sm:space-y-8">
                                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-slate-200 overflow-hidden">
                                        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-slate-200">
                                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center">
                                                <Calendar className="w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7 mr-2 sm:mr-3 text-purple-600" />
                                                Event Overview
                                            </h2>
                                        </div>
                                        <div className="p-4 sm:p-6 lg:p-8">
                                            <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-slate-700">
                                                {event.description?.split('\n').map((paragraph, index) => (
                                                    paragraph.trim() && <p key={index} className="mb-3 sm:mb-4 last:mb-0 leading-relaxed">{paragraph}</p>
                                                )) || <p>Join us for this community event.</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {event.facilitator && (
                                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-slate-200 overflow-hidden">
                                            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-slate-200">
                                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center">
                                                    <UserCheck className="w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7 mr-2 sm:mr-3 text-purple-600" />
                                                    Facilitator
                                                </h2>
                                            </div>
                                            <div className="p-4 sm:p-6 lg:p-8">
                                                <div className="flex items-start gap-3 sm:gap-4">
                                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <UserCheck className="w-6 h-6 sm:w-10 sm:h-10 text-gray-500" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-base sm:text-lg text-purple-800">{event.facilitator}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {event.tags && event.tags.length > 0 && (
                                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-slate-200 overflow-hidden">
                                            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-slate-200">
                                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center">
                                                    <BookOpen className="w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7 mr-2 sm:mr-3 text-purple-600" />
                                                    Topics
                                                </h2>
                                            </div>
                                            <div className="p-4 sm:p-6 lg:p-8">
                                                <div className="flex flex-wrap gap-2">
                                                    {event.tags.map((tag, idx) => (
                                                        <Badge key={idx} variant="secondary" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column - Desktop Registration */}
                            <div className="lg:w-96 mt-6 sm:mt-8 lg:mt-0 hidden lg:block">
                                <div className="lg:sticky lg:top-8">
                                    <Card className="shadow-xl border-0 overflow-hidden">
                                        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
                                            <div className="flex items-center gap-3 mb-4">
                                                <Calendar className="w-6 h-6" />
                                                <span className="font-semibold">Event Details</span>
                                            </div>
                                            <div className="text-center mb-6">
                                                <h3 className="text-3xl font-bold mb-2">Free</h3>
                                                <p className="text-purple-200 font-medium">
                                                    {isMembershipInfoSession ? 'Open to Everyone' : 'For IfS Members'}
                                                </p>
                                            </div>
                                        </div>

                                        <CardContent className="p-6">
                                            {user ? (
                                                (user.membershipStatus === 'active' || isMembershipInfoSession) ? (
                                                    isRegistered ? (
                                                        <div className="text-center space-y-4">
                                                            <div className="p-5 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300">
                                                                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                                                                <h3 className="font-bold text-xl text-green-900 mb-2">You're Registered!</h3>
                                                                <div className="space-y-2">
                                                                    <p className="text-sm text-green-800 font-medium">
                                                                        📧 Check your email for confirmation and joining details
                                                                    </p>
                                                                    <p className="text-xs text-green-700">
                                                                        A confirmation has been sent to <span className="font-semibold">{user.email}</span>
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Meeting Details for Registered Users */}
                                                            {event.meetingUrl && (
                                                                <div className="p-5 bg-blue-50 rounded-xl border-2 border-blue-200">
                                                                    <h4 className="font-bold text-blue-900 mb-3 flex items-center justify-center gap-2">
                                                                        <Link2 className="w-5 h-5" />
                                                                        Join Online
                                                                    </h4>
                                                                    <Button asChild size="sm" className="w-full mb-3 bg-blue-600 hover:bg-blue-700">
                                                                        <a href={event.meetingUrl} target="_blank" rel="noopener noreferrer">
                                                                            <ExternalLink className="w-4 h-4 mr-2" />
                                                                            Join Meeting
                                                                        </a>
                                                                    </Button>
                                                                    <div className="text-xs text-blue-800 bg-blue-100 p-3 rounded border border-blue-200 space-y-1">
                                                                        {event.meetingId && (
                                                                            <p className="font-medium"><strong>Meeting ID:</strong> {event.meetingId}</p>
                                                                        )}
                                                                        {event.meetingPassword && (
                                                                            <p className="font-medium"><strong>Password:</strong> {event.meetingPassword}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                                                                <DialogTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                                                                        disabled={isRemoving}
                                                                    >
                                                                        {isRemoving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                                                        Cancel Registration
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent>
                                                                    <DialogHeader>
                                                                        <DialogTitle>Cancel Registration?</DialogTitle>
                                                                        <DialogDescription>
                                                                            Are you sure you want to cancel your registration for "{event.title}"? You can always register again if there's space available.
                                                                        </DialogDescription>
                                                                    </DialogHeader>
                                                                    <DialogFooter className="gap-2 sm:gap-0">
                                                                        <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                                                                            Keep Registration
                                                                        </Button>
                                                                        <Button
                                                                            onClick={handleRemoveRegistration}
                                                                            className="bg-red-600 hover:bg-red-700"
                                                                            disabled={isRemoving}
                                                                        >
                                                                            {isRemoving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Cancellation'}
                                                                        </Button>
                                                                    </DialogFooter>
                                                                </DialogContent>
                                                            </Dialog>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="mb-4">
                                                                <Label htmlFor="notes" className="text-sm font-medium mb-2 block">
                                                                    Additional Notes (Optional)
                                                                </Label>
                                                                <Textarea
                                                                    id="notes"
                                                                    value={registrationNotes}
                                                                    onChange={(e) => setRegistrationNotes(e.target.value)}
                                                                    placeholder="Any dietary requirements, accessibility needs, or questions?"
                                                                    rows={3}
                                                                    className="text-sm"
                                                                />
                                                            </div>
                                                            <Button onClick={handleInitiateBooking} disabled={isBooking} size="lg" className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-3 h-auto mb-6">
                                                                {isBooking ? (
                                                                    <>
                                                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                                        Registering...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        Register for Event
                                                                        <ChevronRight className="w-5 h-5 ml-2" />
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </>
                                                    )
                                                ) : (
                                                    <div className="text-center">
                                                        <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 mb-4">
                                                            <h3 className="font-bold text-yellow-800 mb-2">Membership Required</h3>
                                                            <p className="text-sm text-yellow-700">This event is exclusively for IfS members.</p>
                                                        </div>
                                                        <Button asChild size="lg" className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-3 h-auto mb-4">
                                                            <Link to={createPageUrl('AssociateMembership')}>
                                                                Join Now
                                                                <ChevronRight className="w-5 h-5 ml-2" />
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                )
                                            ) : (
                                                <div className="text-center">
                                                    {isMembershipInfoSession ? (
                                                        <>
                                                            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 mb-4">
                                                                <h3 className="font-bold text-blue-800 mb-2">Register for This Session</h3>
                                                                <p className="text-sm text-blue-700">
                                                                    This information session is free and open to everyone. Just provide your details below.
                                                                </p>
                                                            </div>
                                                            <div className="space-y-3 mb-4">
                                                                <div>
                                                                    <Label htmlFor="guestName" className="text-sm font-medium mb-1 block text-left">
                                                                        Full Name *
                                                                    </Label>
                                                                    <Input
                                                                        id="guestName"
                                                                        type="text"
                                                                        value={guestName}
                                                                        onChange={(e) => setGuestName(e.target.value)}
                                                                        placeholder="Your name"
                                                                        required
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label htmlFor="guestEmail" className="text-sm font-medium mb-1 block text-left">
                                                                        Email Address *
                                                                    </Label>
                                                                    <Input
                                                                        id="guestEmail"
                                                                        type="email"
                                                                        value={guestEmail}
                                                                        onChange={(e) => setGuestEmail(e.target.value)}
                                                                        placeholder="your.email@example.com"
                                                                        required
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label htmlFor="guestNotes" className="text-sm font-medium mb-1 block text-left">
                                                                        Additional Notes (Optional)
                                                                    </Label>
                                                                    <Textarea
                                                                        id="guestNotes"
                                                                        value={registrationNotes}
                                                                        onChange={(e) => setRegistrationNotes(e.target.value)}
                                                                        placeholder="Any questions or specific topics you'd like to discuss?"
                                                                        rows={3}
                                                                        className="text-sm"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <Button onClick={handleRegister} disabled={isRegistering || !guestEmail.trim() || !guestName.trim()} size="lg" className="w-full bg-green-600 hover:bg-green-700 text-lg py-3 h-auto mb-4">
                                                                {isRegistering ? (
                                                                    <>
                                                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                                        Registering...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        Register Now
                                                                        <ChevronRight className="w-5 h-5 ml-2" />
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 mb-4">
                                                                <h3 className="font-bold text-blue-800 mb-2">Members Only Event</h3>
                                                                <p className="text-sm text-blue-700">
                                                                    New users can join as an Associate Member to access this free event.
                                                                </p>
                                                                <p className="text-xs text-blue-600 mt-2 italic">
                                                                    <strong>Existing Associate Members:</strong> Please create an account on our new platform to register. This is a one-time process.
                                                                </p>
                                                            </div>
                                                            <Button onClick={handleJoin} size="lg" className="w-full bg-green-600 hover:bg-green-700 text-lg py-3 h-auto mb-4">
                                                                Create an Account to Register
                                                                <ChevronRight className="w-5 h-5 ml-2" />
                                                            </Button>
                                                            <p className="text-xs text-gray-500">
                                                                Already have an account on this site? <button onClick={() => window.location.href = createPageUrl('Onboarding')} className="text-purple-600 hover:underline font-medium">Log in here</button>
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            <div className="space-y-4 text-gray-700 mt-6">
                                                <div className="flex items-start gap-3">
                                                    <MapPin className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-semibold text-black">Location</p>
                                                        <p className="text-sm">{event.location}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <Calendar className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-semibold text-black">Date & Time</p>
                                                        <p className="text-sm">{format(new Date(event.date), 'EEEE, d MMMM yyyy')}</p>
                                                        {event.startTime && event.endTime && (
                                                            <p className="text-sm">{event.startTime} - {event.endTime}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <CheckCircle className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-semibold text-black">Event Type</p>
                                                        <p className="text-sm">{event.type}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <Info className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-semibold text-black">Registration</p>
                                                        <p className="text-sm">Confirmation and joining details will be emailed to you after registration.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {/* Mobile Sticky CTA Bar */}
            <div className={`fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 p-3 sm:p-4 z-50 lg:hidden shadow-lg transition-transform duration-300 ${mobileMenuOpen ? 'translate-y-full' : 'translate-y-0'}`}>
                {user ? (
                    (user.membershipStatus === 'active' || isMembershipInfoSession) ? (
                        isRegistered ? (
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-center text-green-700 bg-green-100 p-2.5 sm:p-3 rounded-lg mb-2">
                                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="font-semibold text-sm sm:text-base">You're Registered!</span>
                                </div>
                                <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="link"
                                            className="text-red-600 h-auto p-0 text-xs sm:text-sm"
                                            disabled={isRemoving}
                                        >
                                            Cancel Registration
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="mx-4">
                                        <DialogHeader>
                                            <DialogTitle>Cancel Registration?</DialogTitle>
                                            <DialogDescription>
                                                Are you sure you want to cancel your registration for "{event.title}"?
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter className="gap-2 sm:gap-0">
                                            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                                                Keep Registration
                                            </Button>
                                            <Button
                                                onClick={handleRemoveRegistration}
                                                className="bg-red-600 hover:bg-red-700"
                                                disabled={isRemoving}
                                            >
                                                {isRemoving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Cancellation'}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        ) : (
                            <div className="space-y-2 sm:space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xl sm:text-2xl font-bold text-slate-900">Free</p>
                                        <p className="text-xs sm:text-sm text-green-600 font-medium">
                                            {isMembershipInfoSession ? 'Open to everyone' : 'Exclusively for members'}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center">
                                        <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                                    </div>
                                </div>
                                <Button
                                    onClick={handleInitiateBooking} // Use handleInitiateBooking for logged-in users
                                    disabled={isBooking}
                                    size="lg"
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 sm:py-4 text-sm sm:text-lg rounded-lg shadow-lg"
                                >
                                    {isBooking ? (
                                        <Loader2 className="w-4 h-4 sm:w-6 sm:h-6 animate-spin mr-2" />
                                    ) : (
                                        <>
                                            Register for Event
                                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        )
                    ) : (
                        <Button asChild size="lg" className="w-full bg-purple-600 hover:bg-purple-700 text-sm sm:text-lg py-3 sm:py-4 h-auto rounded-lg">
                            <Link to={createPageUrl('AssociateMembership')}>
                                Join to Register
                            </Link>
                        </Button>
                    )
                ) : (
                    <div className="text-center">
                        {isMembershipInfoSession ? (
                            <div className="space-y-3">
                                <p className="text-xs text-blue-800 font-medium">Free information session - provide your details to register</p>
                                <div className="space-y-2">
                                    <Input
                                        type="text"
                                        placeholder="Your name"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        className="text-sm"
                                    />
                                    <Input
                                        type="email"
                                        placeholder="your.email@example.com"
                                        value={guestEmail}
                                        onChange={(e) => setGuestEmail(e.target.value)}
                                        className="text-sm"
                                    />
                                </div>
                                <Button onClick={handleRegister} disabled={isRegistering || !guestEmail.trim() || !guestName.trim()} size="lg" className="w-full bg-green-600 hover:bg-green-700 text-sm sm:text-lg py-3 sm:py-4 h-auto rounded-lg">
                                    {isRegistering ? (
                                        <Loader2 className="w-4 h-4 sm:w-6 sm:h-6 animate-spin mr-2" />
                                    ) : (
                                        <>
                                            Register Now
                                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                                    <p className="text-xs text-blue-800 font-medium">New users can join IfS for free to register for this event.</p>
                                    <p className="text-xs text-blue-600 mt-1 italic"><strong>Existing Members:</strong> Please create an account on our new site to register.</p>
                                </div>
                                <Button onClick={handleJoin} size="lg" className="w-full bg-green-600 hover:bg-green-700 text-sm sm:text-lg py-3 sm:py-4 h-auto rounded-lg mb-2 sm:mb-3">
                                    Create an Account to Register
                                </Button>
                                <p className="text-xs sm:text-sm text-slate-500">
                                    Already have an account? <button onClick={() => window.location.href = createPageUrl('Onboarding')} className="font-semibold text-purple-600 hover:underline">Log in</button>
                                </p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}