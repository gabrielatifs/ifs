
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Event } from '@/api/entities';
import { User } from '@/api/entities';
import { EventSignup } from '@/api/entities';
import { createPageUrl } from '@/utils';
import MainSiteNav from '../components/marketing/MainSiteNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Clock, MapPin, UserCircle, ArrowRight, CheckCircle, Info, ArrowLeft, GraduationCap, BookOpen, Users, LogIn, Trash2, Link2, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { sendEmail } from '@/api/functions';
import { wrapEmailHtml } from '../../packages/shared/src/emails/wrapper.js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePostHog } from '../components/providers/PostHogProvider';


const EventDetails = () => {
    const [event, setEvent] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Overall loading state for initial data
    const location = useLocation();
    const { toast } = useToast();
    
    const [signup, setSignup] = useState(null);
    const [isSignedUp, setIsSignedUp] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // For signup button
    const [isRemoving, setIsRemoving] = useState(false); // For remove registration button
    const [fromPage, setFromPage] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Track mobile menu state
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

    const { trackEvent } = usePostHog();

    // Effect 1: Fetch Event Details
    // This effect fetches event details and sets the `fromPage` parameter.
    useEffect(() => {
        const fetchEventDetails = async () => {
            setLoading(true); // Start overall loading
            try {
                const searchParams = new URLSearchParams(location.search);
                const eventId = searchParams.get('id');
                const from = searchParams.get('from');
                setFromPage(from);

                if (!eventId) {
                    setEvent(null);
                    setLoading(false); // No event ID, finished loading.
                    return;
                }

                const fetchedEvent = await Event.get(eventId);
                setEvent(fetchedEvent);
                // `setLoading(false)` moved to the user/signup effect, as it's the last piece of initial data.
            } catch (error) {
                console.error("Failed to fetch event:", error);
                setEvent(null);
                setLoading(false); // Error fetching event, finished loading.
            }
        };

        fetchEventDetails();
    }, [location.search]);

    // Effect 2: Fetch User and Check Signup Status
    // This effect runs after the event details are potentially loaded.
    // It also sets the final `loading` state to false after all initial data is fetched.
    useEffect(() => {
        const fetchUserAndSignupStatus = async () => {
            // Only proceed if event has been loaded (or explicitly determined not found).
            // If event is null and not loading, we can stop.
            if (!event && !loading) {
                setUser(null);
                setIsSignedUp(false);
                setSignup(null);
                return;
            }
            if (!event && loading) { // Event is still loading, wait for it.
                return;
            }

            try {
                const currentUser = await User.me();
                setUser(currentUser);

                if (currentUser && event) { // Check signup status only if user and event are available
                    const existingSignup = await EventSignup.filter({ userId: currentUser.id, eventId: event.id });
                    if (existingSignup.length > 0) {
                        setIsSignedUp(true);
                        setSignup(existingSignup[0]);
                    } else {
                        setIsSignedUp(false);
                        setSignup(null);
                    }
                } else {
                    // If no current user, ensure signup states are reset
                    setIsSignedUp(false);
                    setSignup(null);
                }
            } catch (e) {
                // User.me() can throw if not logged in; this is expected behavior.
                setUser(null);
                setIsSignedUp(false);
                setSignup(null);
                console.warn("User not logged in or error fetching user:", e); // Use warn for expected errors
            } finally {
                setLoading(false); // All initial data (event, user, signup) has been processed.
            }
        };
        // Run this effect when `event` or `loading` state changes.
        // `event` changing from null to a value, or `loading` becoming false when event is null (not found).
        fetchUserAndSignupStatus();
    }, [event, loading]); // Dependent on `event` AND `loading` to ensure event data is available and loading state is current.

    const getEmailWrapper = (content) => wrapEmailHtml(content);

    const handleSignup = async () => {
        if (!user) {
            handleJoin('event_details_signup_attempt'); // Trigger login/onboarding if not logged in
            return;
        }
        if (!event) return; // Should ideally not happen if button is shown, but for safety

        setIsSubmitting(true);
        
        trackEvent('workshop_registration_started', {
            event_id: event.id,
            event_title: event.title,
            event_type: event.type,
            user_membership_type: user.membershipStatus
        });

        try {
            const newSignup = await EventSignup.create({
                userId: user.id,
                eventId: event.id,
                userEmail: user.email,
                userName: user.displayName || user.full_name || 'Member',
                eventTitle: event.title,
                eventDate: event.date,
                eventType: event.type,
                eventLocation: event.location,
                // Removed zoomJoinUrl as it's now a generic meetingUrl property on the event itself.
            });

            // Update local state directly instead of relying on a full refresh
            setIsSignedUp(true);
            setSignup(newSignup);

            trackEvent('workshop_registration_completed', {
                event_id: event.id,
                event_title: event.title,
                event_type: event.type
            });

            // Send confirmation email
            try {
                const displayName = user.displayName || user.firstName || user.full_name || 'Member';
                const eventDate = format(new Date(event.date), 'EEEE, d MMMM yyyy');

                let meetingDetailsHtml = '';
                if (event.meetingUrl) {
                    meetingDetailsHtml = `
                        <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 20px 0;">
                            <h3 style="color: #0369a1; margin: 0 0 15px 0; font-size: 18px;">🔗 Join the Event Online</h3>
                            <p style="margin: 10px 0;"><strong>Meeting Link:</strong><br><a href="${event.meetingUrl}" style="color: #0369a1; word-break: break-all;">${event.meetingUrl}</a></p>
                            ${event.meetingId ? `<p style="margin: 10px 0;"><strong>Meeting ID:</strong> ${event.meetingId}</p>` : ''}
                            ${event.meetingPassword ? `<p style="margin: 10px 0;"><strong>Password:</strong> ${event.meetingPassword}</p>` : ''}
                            <p style="margin: 15px 0 0 0; font-size: 14px; color: #64748b;"><em>💡 We recommend joining 5-10 minutes early to test your connection.</em></p>
                        </div>
                    `;
                }

                const confirmationEmailBody = `
                    <td style="padding: 30px 40px; color: #333; line-height: 1.6;">
                        <h1 style="color: #333; font-size: 24px;">✅ Event Registration Confirmed!</h1>
                        <p>Dear ${displayName},</p>
                        <p>You're successfully registered for:</p>
                        <div style="background-color: #fafafa; border-left: 4px solid #5e028f; padding: 20px; margin: 20px 0;">
                            <h2 style="color: #5e028f; margin: 0 0 10px 0; font-size: 20px;">${event.title}</h2>
                            <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${eventDate}</p>
                            <p style="margin: 5px 0;"><strong>🕒 Time:</strong> ${event.time}</p>
                            <p style="margin: 5px 0;"><strong>📍 Location:</strong> ${event.location}</p>
                        </div>
                        ${meetingDetailsHtml}
                        <p>We look forward to seeing you there!</p>
                    </td>
                `;

                await sendEmail({
                    to: user.email,
                    subject: `Registration Confirmed: ${event.title}`,
                    html: getEmailWrapper(confirmationEmailBody)
                });

                toast({
                    title: "Registration Successful!", // Changed title
                    description: `You're now registered for ${event.title}. Check your email for confirmation details.`, // Changed description
                });

            } catch (emailError) {
                console.error('Failed to send confirmation email:', emailError);
                toast({
                    title: "Registered Successfully",
                    description: "You're registered, but the confirmation email couldn't be sent. Please check your details.",
                    variant: "destructive"
                });
            }

        } catch (error) {
            console.error("Failed to sign up for event:", error);
            trackEvent('workshop_registration_failed', {
                event_id: event.id,
                event_title: event.title,
                error_message: error.message
            });
            toast({
                title: "Registration Failed",
                description: "There was an error with your registration. Please try again.", // Changed description
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveRegistration = async () => {
        if (!signup) return;
        setIsRemoving(true);
        try {
            await EventSignup.delete(signup.id);
            setIsSignedUp(false);
            setSignup(null);
            setCancelDialogOpen(false);
            toast({
                title: "Registration Removed",
                description: `You are no longer registered for "${event.title}".`
            });
        } catch (error) {
            console.error("Failed to remove registration:", error);
            toast({
                title: "Error",
                description: "Failed to remove your registration. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsRemoving(false);
        }
    };

    const handleJoin = (location) => {
        trackEvent('join_button_clicked', {
          intent: 'associate',
          location: location || 'event_details',
          user_type: 'anonymous'
        });
        
        // Create redirect URL back to THIS EventDetails page
        const eventDetailsUrl = createPageUrl('EventDetails') + `?id=${event.id}`;
        const onboardingUrl = createPageUrl('Onboarding') + `?intent=associate&redirect=${encodeURIComponent(eventDetailsUrl)}`;
        
        User.loginWithRedirect(onboardingUrl);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="text-center py-20 bg-gray-50 flex-grow">
                <h2 className="text-2xl font-bold">Event Not Found</h2>
                <p className="text-gray-600 mt-2">The event you are looking for does not exist or may have been removed.</p>
                <Button asChild className="mt-4">
                    <Link to={createPageUrl('Events')}>View All Events</Link>
                </Button>
            </div>
        );
    }
    
    // Pricing logic is removed as all events are free for members now.
    // The conditional rendering based on membership status will now only control registration access.

    return (
        <>
            <Toaster />
            {/* Hero Header Section */}
            <section className="relative bg-gray-900 overflow-hidden min-h-[450px] sm:min-h-[500px] lg:min-h-[600px]">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img
                        src={event?.imageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2070&auto=format&fit=crop"}
                        alt={event?.title || "Professional event"}
                        className="w-full h-full object-cover opacity-40"
                    />
                </div>
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-purple-800/80 to-transparent"></div>
                
                <MainSiteNav onMobileMenuToggle={setMobileMenuOpen} />

                {/* Hero Content */}
                <div className="relative z-10 max-w-screen-xl mx-auto h-full">
                    <div className="grid lg:grid-cols-2 items-center min-h-[450px] sm:min-h-[500px] lg:min-h-[600px]">
                        <div className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-32 text-center lg:text-left">
                            {/* Manual Breadcrumbs - Improved Mobile */}
                            <div className="text-xs sm:text-sm text-purple-200 mb-3 sm:mb-4 font-medium tracking-wider uppercase">
                                <Link 
                                    to={createPageUrl('Events')}
                                    className="inline-flex items-center hover:text-white transition-colors group"
                                >
                                    <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 group-hover:-translate-x-1 transition-transform" />
                                    <span className="hidden sm:inline">Back to Events</span>
                                    <span className="sm:hidden">Events</span>
                                </Link>
                                <span className="mx-1 sm:mx-2">/</span>
                                <span className="text-white">Event Details</span>
                            </div>

                            {/* Event Header Info (Badges) - Improved Mobile */}
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 mb-4 sm:mb-6 mt-4 sm:mt-8">
                                <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm text-xs sm:text-sm px-2 py-1">
                                    {event.type}
                                </Badge>
                                <Badge variant="outline" className="border-white/30 text-white backdrop-blur-sm text-xs sm:text-sm px-2 py-1">
                                    <GraduationCap className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                                    CPD Accredited
                                </Badge>
                                <Badge className="bg-green-600/80 text-white border-0 backdrop-blur-sm text-xs sm:text-sm px-2 py-1">
                                    Free for Members
                                </Badge>
                            </div>
                            
                            <h1 className="mt-8 text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-4 sm:mb-6">
                                {event.title}
                            </h1>
                            
                            {/* Description snippet - Improved Mobile */}
                            <div className="text-base sm:text-lg lg:text-xl text-purple-100 mb-6 sm:mb-8 leading-relaxed max-w-3xl mx-auto lg:mx-0">
                                <p className="hidden sm:block">{event.description ? event.description.substring(0, 200) + '...' : 'Join us for this professional development opportunity.'}</p>
                                <p className="sm:hidden">{event.description ? event.description.substring(0, 120) + '...' : 'Join us for this professional development opportunity.'}</p>
                            </div>

                            {/* Event Info - Improved Mobile Layout */}
                            <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 lg:gap-6 text-purple-100 mb-6 sm:mb-8 text-sm sm:text-base">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="text-center sm:text-left">{format(new Date(event.date), 'EEEE, MMMM dd, yyyy')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span>{event.time}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="text-center sm:text-left">{event.location}</span>
                                </div>
                            </div>

                            {/* Desktop View Details Button */}
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
                            
                            {/* Mobile View Details Button removed as requested */}
                        </div>
                        <div className="hidden lg:block"></div> {/* Second grid column for layout */}
                    </div>
                </div>
            </section>

            {/* Main Content - Improved Mobile Spacing */}
            <main className="min-h-[calc(100vh-64px)] bg-slate-50 pb-24 sm:pb-28 lg:pb-0">
                <div id="event-details" className="max-w-screen-xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-12">
                    <section className="pb-8 sm:pb-12">
                        <div className="lg:flex lg:gap-12">
                            {/* Left Column - Event Content - Improved Mobile */}
                            <div className="lg:flex-1">
                                <div className="space-y-6 sm:space-y-8">
                                    {/* Event Overview Card */}
                                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-slate-200 overflow-hidden">
                                        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-slate-200">
                                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center">
                                                <Calendar className="w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7 mr-2 sm:mr-3 text-purple-600" />
                                                Event Overview
                                            </h2>
                                        </div>
                                        <div className="p-4 sm:p-6 lg:p-8">
                                            <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-slate-700">
                                                {event.description.split('\n').map((paragraph, index) => (
                                                    paragraph.trim() && <p key={index} className="mb-3 sm:mb-4 last:mb-0 leading-relaxed">{paragraph}</p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Who is this for */}
                                    {event.whoIsThisFor && (
                                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-slate-200 overflow-hidden">
                                            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-slate-200">
                                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center">
                                                    <Users className="w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7 mr-2 sm:mr-3 text-purple-600" />
                                                    Who is this for?
                                                </h2>
                                            </div>
                                            <div className="p-4 sm:p-6 lg:p-8">
                                                <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-slate-700">
                                                    {event.whoIsThisFor.split('\n').map((paragraph, index) => (
                                                        paragraph.trim() && <p key={index} className="mb-3 sm:mb-4 last:mb-0 leading-relaxed">{paragraph}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* What to expect */}
                                    {event.whatToExpected && (
                                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-slate-200 overflow-hidden">
                                            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-slate-200">
                                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center">
                                                    <Info className="w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7 mr-2 sm:mr-3 text-purple-600" />
                                                    What to Expect
                                                </h2>
                                            </div>
                                            <div className="p-4 sm:p-6 lg:p-8">
                                                <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-slate-700">
                                                    {event.whatToExpected.split('\n').map((paragraph, index) => (
                                                        paragraph.trim() && <p key={index} className="mb-3 sm:mb-4 last:mb-0 leading-relaxed">{paragraph}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* What you will learn */}
                                    {event.whatYouWillLearn && Array.isArray(event.whatYouWillLearn) && event.whatYouWillLearn.length > 0 && (
                                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-slate-200 overflow-hidden">
                                            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-slate-200">
                                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center">
                                                    <BookOpen className="w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7 mr-2 sm:mr-3 text-purple-600" />
                                                    What You Will Learn
                                                </h2>
                                            </div>
                                            <div className="p-4 sm:p-6 lg:p-8">
                                                <ul className="space-y-2 sm:space-y-3">
                                                    {event.whatYouWillLearn.filter((item) => item && item.trim() !== '').map((item, index) => (
                                                        <li key={index} className="flex items-start">
                                                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 sm:mr-3 mt-0.5 sm:mt-1 flex-shrink-0" />
                                                            <span className="text-slate-700 leading-relaxed text-sm sm:text-base">{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}

                                    {/* Session Objectives */}
                                    {event.sessionObjectives && Array.isArray(event.sessionObjectives) && event.sessionObjectives.length > 0 && (
                                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-slate-200 overflow-hidden">
                                            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-slate-200">
                                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center">
                                                    <GraduationCap className="w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7 mr-2 sm:mr-3 text-purple-600" />
                                                    Session Objectives
                                                </h2>
                                            </div>
                                            <div className="p-4 sm:p-6 lg:p-8">
                                                <ul className="space-y-2 sm:space-y-3">
                                                    {event.sessionObjectives.filter((item) => item && item.trim() !== '').map((item, index) => (
                                                        <li key={index} className="flex items-start">
                                                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 sm:mr-3 mt-0.5 sm:mt-1 flex-shrink-0" />
                                                            <span className="text-slate-700 leading-relaxed text-sm sm:text-base">{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}

                                    {/* Facilitator */}
                                    {event.facilitator && (
                                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-slate-200 overflow-hidden">
                                            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-slate-200">
                                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center">
                                                    <UserCircle className="w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7 mr-2 sm:mr-3 text-purple-600" />
                                                    Meet Your Facilitator
                                                </h2>
                                            </div>
                                            <div className="p-4 sm:p-6 lg:p-8">
                                                <div className="flex items-start gap-3 sm:gap-4">
                                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <UserCircle className="w-6 h-6 sm:w-10 sm:h-10 text-gray-500"/>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-base sm:text-lg text-purple-800 mb-2 sm:mb-3">{event.facilitator}</p>
                                                        {event.facilitatorBio ? (
                                                            <div className="prose prose-sm sm:prose-base max-w-none text-slate-700">
                                                                {event.facilitatorBio.split('\n').map((paragraph, index) => (
                                                                    paragraph.trim() && <p key={index} className="mb-2 sm:mb-3 last:mb-0 leading-relaxed">{paragraph}</p>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-slate-700 text-sm sm:text-base leading-relaxed">Further details about the facilitator's expertise and background will be shared upon registration.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Event Resources (if available) */}
                                    {(event.recordingUrl || event.resourcesUrl) && (
                                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-slate-200 overflow-hidden">
                                            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-slate-200">
                                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center">
                                                    <BookOpen className="w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7 mr-2 sm:mr-3 text-purple-600" />
                                                    Event Resources
                                                </h2>
                                            </div>
                                            <div className="p-4 sm:p-6 lg:p-8 space-y-3 sm:space-y-4">
                                                {event.recordingUrl && (
                                                    <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
                                                        <h3 className="font-semibold text-slate-800 mb-2 text-sm sm:text-base">Session Recording</h3>
                                                        <p className="text-slate-600 text-xs sm:text-sm mb-3">Access the complete event recording to review key points and catch anything you missed.</p>
                                                        <Button asChild size="sm" className="text-xs sm:text-sm">
                                                            <a href={event.recordingUrl} target="_blank" rel="noopener noreferrer">
                                                                Watch Recording
                                                            </a>
                                                        </Button>
                                                    </div>
                                                )}
                                                {event.resourcesUrl && (
                                                    <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
                                                        <h3 className="font-semibold text-slate-800 mb-2 text-sm sm:text-base">Session Materials</h3>
                                                        <p className="text-slate-600 text-xs sm:text-sm mb-3">Download presentation slides, handouts, and additional resources from this event.</p>
                                                        <Button asChild size="sm" className="text-xs sm:text-sm">
                                                            <a href={event.resourcesUrl} target="_blank" rel="noopener noreferrer">
                                                                Download Resources
                                                            </a>
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column - Event Info & Booking (DESKTOP) - Improved Mobile Responsive */}
                            <div className="lg:w-96 mt-6 sm:mt-8 lg:mt-0 hidden lg:block">
                                <div className="lg:sticky lg:top-8">
                                    {/* Event Summary Card */}
                                    <Card className="shadow-xl border-0 overflow-hidden">
                                        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
                                            <div className="flex items-center gap-3 mb-4">
                                                <Calendar className="w-6 h-6" />
                                                <span className="font-semibold">Event Details</span>
                                            </div>
                                            <div className="text-center mb-6">
                                                <h3 className="text-3xl font-bold mb-2">Free</h3>
                                                <p className="text-purple-200 font-medium">For IfS Members</p>
                                            </div>
                                        </div>

                                        <CardContent className="p-6">
                                            {user ? (
                                                // Check if user has active membership
                                                user.membershipStatus === 'active' ? (
                                                    isSignedUp ? (
                                                        <div className="text-center space-y-4">
                                                            <div className="p-5 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 mb-4">
                                                                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                                                                <h3 className="font-bold text-xl text-green-900 mb-2">
                                                                    You're Registered!
                                                                </h3>
                                                                <div className="space-y-2">
                                                                    <p className="text-sm text-green-800 font-medium">
                                                                        📧 Check your email for confirmation and joining details
                                                                    </p>
                                                                    <p className="text-xs text-green-700">
                                                                        A confirmation has been sent to <span className="font-semibold">{user.email}</span>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Meeting Details for Booked Users */}
                                                            {event.meetingUrl && (
                                                                <div className="p-5 bg-blue-50 rounded-xl border-2 border-blue-200 mb-4">
                                                                    <h4 className="font-bold text-blue-900 mb-3 flex items-center justify-center gap-2">
                                                                        <Link2 className="w-5 h-5" />
                                                                        Join Online
                                                                    </h4>
                                                                    <Button asChild size="sm" className="w-full mb-3 bg-blue-600 hover:bg-blue-700">
                                                                        <a href={event.meetingUrl} target="_blank" rel="noopener noreferrer">
                                                                            <LogIn className="w-4 h-4 mr-2" />
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
                                                                          {isRemoving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Confirm Cancellation'}
                                                                      </Button>
                                                                  </DialogFooter>
                                                              </DialogContent>
                                                            </Dialog>
                                                        </div>
                                                    ) : (
                                                        <Button onClick={handleSignup} disabled={isSubmitting} size="lg" className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-3 h-auto mb-6">
                                                            {isSubmitting ? (
                                                                <>
                                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                                    Registering...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    Register for Event
                                                                    <ArrowRight className="w-5 h-5 ml-2" />
                                                                </>
                                                            )}
                                                        </Button>
                                                    )
                                                ) : (
                                                    // User is logged in but not an active member
                                                    <div className="text-center">
                                                        <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 mb-4">
                                                            <h3 className="font-bold text-yellow-800 mb-2">Membership Required</h3>
                                                            <p className="text-sm text-yellow-700">This event is exclusively for IfS members.</p>
                                                        </div>
                                                        <Button asChild size="lg" className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-3 h-auto mb-4">
                                                            <Link to={createPageUrl('PortalMembershipTiers')}>
                                                                Upgrade Membership
                                                                <ArrowRight className="w-5 h-5 ml-2" />
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                )
                                            ) : (
                                                // User is not logged in
                                                <div className="text-center">
                                                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 mb-4">
                                                        <h3 className="font-bold text-blue-800 mb-2">Members Only Event</h3>
                                                        <p className="text-sm text-blue-700">New users can join as an Associate Member to access this free event.</p>
                                                        <p className="text-xs text-blue-600 mt-2 italic"><strong>Existing Associate Members:</strong> Please create an account on our new platform to register. This is a one-time process.</p>
                                                    </div>
                                                    <Button onClick={() => handleJoin('event_details_desktop')} size="lg" className="w-full bg-green-600 hover:bg-green-700 text-lg py-3 h-auto mb-4">
                                                        Create an Account to Register
                                                        <ArrowRight className="w-5 h-5 ml-2" />
                                                    </Button>
                                                    <p className="text-xs text-gray-500">
                                                        Already have an account on this site? <button onClick={() => User.loginWithRedirect(window.location.href)} className="text-purple-600 hover:underline font-medium">Log in here</button>
                                                    </p>
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
                                                        <p className="text-sm">{event.time}</p>
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
                                                {event.tags && event.tags.length > 0 && (
                                                    <div className="flex items-start gap-3">
                                                        <BookOpen className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                                                        <div>
                                                            <p className="font-semibold text-black">Topics</p>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {event.tags.map((tag, index) => (
                                                                    <Badge key={index} variant="secondary" className="text-xs">
                                                                        {tag}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {/* Mobile Sticky CTA Bar - Hide when mobile menu is open */}
            <div className={`fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 p-3 sm:p-4 z-50 lg:hidden shadow-lg transition-transform duration-300 ${mobileMenuOpen ? 'translate-y-full' : 'translate-y-0'}`}>
                 {user ? (
                    user.membershipStatus === 'active' ? (
                        isSignedUp ? (
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
                                        <p className="text-xs sm:text-sm text-green-600 font-medium">Exclusively for members</p>
                                    </div>
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center">
                                        <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                                    </div>
                                </div>
                                <Button 
                                    onClick={handleSignup} 
                                    disabled={isSubmitting} 
                                    size="lg" 
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 sm:py-4 text-sm sm:text-lg rounded-lg shadow-lg"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-4 h-4 sm:w-6 sm:h-6 animate-spin mr-2" />
                                    ) : (
                                        <>
                                            Register for Event
                                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        )
                    ) : (
                         <Button asChild size="lg" className="w-full bg-purple-600 hover:bg-purple-700 text-sm sm:text-lg py-3 sm:py-4 h-auto rounded-lg">
                            <Link to={createPageUrl('PortalMembershipTiers')}>
                                Upgrade to Register
                            </Link>
                        </Button>
                    )
                ) : (
                    <div className="text-center">
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                             <p className="text-xs text-blue-800 font-medium">New users can join IfS for free to register for this event.</p>
                             <p className="text-xs text-blue-600 mt-1 italic"><strong>Existing Members:</strong> Please create an account on our new site to register.</p>
                        </div>
                        <Button onClick={() => handleJoin('event_details_mobile')} size="lg" className="w-full bg-green-600 hover:bg-green-700 text-sm sm:text-lg py-3 sm:py-4 h-auto rounded-lg mb-2 sm:mb-3">
                            Create an Account to Register
                        </Button>
                        <p className="text-xs sm:text-sm text-slate-500">
                            Already have an account? <button onClick={() => User.loginWithRedirect(window.location.href)} className="font-semibold text-purple-600 hover:underline">Log in</button>
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};

export default EventDetails;
