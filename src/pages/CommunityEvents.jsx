import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useUser } from '../components/providers/UserProvider';
import { createPageUrl } from '@/utils';
import PortalSidebar from '../components/portal/PortalSidebar';
import PortalHeader from '../components/portal/PortalHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Loader2,
    Users2,
    Calendar,
    Clock,
    MapPin,
    CheckCircle2,
    Coffee,
    MessageSquare,
    Sparkles,
    UserPlus,
    Video,
    UserCheck,
    AlertCircle,
    ArrowRight
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { format, isBefore, startOfDay } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { addZoomRegistrant } from '@/api/functions';
import { sendEmail } from '@/api/functions';

const EventTypeIcon = ({ type }) => {
    switch (type) {
        case 'Forum':
            return <MessageSquare className="w-5 h-5" />;
        case 'Coffee Morning':
            return <Coffee className="w-5 h-5" />;
        case 'Networking':
            return <Users2 className="w-5 h-5" />;
        default:
            return <Sparkles className="w-5 h-5" />;
    }
};

const CommunityEventCard = ({ event, userSignup }) => {
    return (
        <Card className="hover:shadow-lg transition-all overflow-hidden h-full flex flex-col">
            {event.imageUrl && (
                <div className="h-40 md:h-48 bg-gradient-to-br from-purple-100 to-blue-100 overflow-hidden">
                    <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge className="bg-purple-100 text-purple-700 text-xs">
                        <EventTypeIcon type={event.type} />
                        <span className="ml-1">{event.type}</span>
                    </Badge>
                </div>
                <CardTitle className="text-lg md:text-xl leading-tight">{event.title}</CardTitle>
                <CardDescription className="line-clamp-2 text-sm">{event.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-2 pb-3 flex-1">
                <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600">
                    <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-600 flex-shrink-0" />
                    <span className="font-medium">{format(new Date(event.date), 'EEE, MMM d, yyyy')}</span>
                </div>

                {event.startTime && event.endTime && (
                    <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600">
                        <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-600 flex-shrink-0" />
                        <span>{event.startTime} - {event.endTime}</span>
                    </div>
                )}

                <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600">
                    {event.location === 'Online' ? (
                        <>
                            <Video className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-600 flex-shrink-0" />
                            <span className="font-medium">Online Event</span>
                        </>
                    ) : (
                        <>
                            <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-600 flex-shrink-0" />
                            <span className="truncate">{event.location}</span>
                        </>
                    )}
                </div>

                {event.facilitator && (
                    <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600">
                        <UserCheck className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-600 flex-shrink-0" />
                        <span className="truncate">Facilitated by {event.facilitator}</span>
                    </div>
                )}

                {event.maxParticipants && (
                    <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600">
                        <Users2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-600 flex-shrink-0" />
                        <span>{event.currentParticipants || 0} / {event.maxParticipants} registered</span>
                    </div>
                )}

                {event.tags && event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                        {event.tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                                {tag}
                            </Badge>
                        ))}
                        {event.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">+{event.tags.length - 3}</Badge>
                        )}
                    </div>
                )}
            </CardContent>

            <CardFooter className="border-t bg-slate-50 pt-3">
                <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full"
                >
                    <a href={createPageUrl(`CommunityEventDetails?id=${event.id}`)}>
                        View Details
                        <ArrowRight className="w-3.5 h-3.5 ml-2" />
                    </a>
                </Button>
            </CardFooter>
        </Card>
    );
};

export default function CommunityEvents() {
    const { user, loading: userLoading } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [events, setEvents] = useState([]);
    const [userSignups, setUserSignups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('all');
    const { toast } = useToast();

    useEffect(() => {
        if (!userLoading && user && !user.onboarding_completed && !user.isUnclaimed) {
            window.location.href = createPageUrl('Onboarding');
            return;
        }
    }, [user, userLoading]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [fetchedEvents, signups] = await Promise.all([
                    base44.entities.CommunityEvent.list('date', 50),
                    user ? base44.entities.CommunityEventSignup.filter({ userId: user.id }) : Promise.resolve([])
                ]);

                setEvents(fetchedEvents || []);
                setUserSignups(signups || []);
            } catch (error) {
                console.error('Failed to fetch events:', error);
                toast({
                    title: "Error",
                    description: "Failed to load events. Please refresh the page.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        if (!userLoading) {
            fetchData();
        }
    }, [user, userLoading, toast]); // Added toast to dependency array as it's used in fetchData

    // This handler remains for potential future use (e.g., from a details page),
    // but is no longer directly called by CommunityEventCard on this page.
    // The handleRegisterClick and handleRegisterConfirm logic was part of the in-page dialog,
    // which has now been removed. Registration now occurs on the CommunityEventDetails page.

    if (userLoading || loading) { // Removed initialCheckComplete as it's not destructured from useUser anymore
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const upcomingEvents = events
        .filter(e => !isBefore(new Date(e.date), startOfDay(new Date())))
        .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort upcoming events chronologically

    const pastEvents = events
        .filter(e => isBefore(new Date(e.date), startOfDay(new Date())))
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort past events reverse chronologically (most recent first)

    const getUserSignupForEvent = (eventId) => {
        return userSignups.find(signup => signup.eventId === eventId);
    };

    return (
        <div className="flex h-screen bg-slate-50/30">
            <Toaster />
            <PortalSidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="CommunityEvents" />

            <div className="flex-1 flex flex-col overflow-hidden">
                <PortalHeader setSidebarOpen={setSidebarOpen} user={user} />

                <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
                    <div className="max-w-6xl mx-auto">
                        {/* Header */}
                        <div className="mb-6 md:mb-8 relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 p-6 md:p-12 text-white shadow-2xl">
                            <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-white/10 rounded-full -mr-24 md:-mr-32 -mt-24 md:-mt-32 blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 md:w-48 md:h-48 bg-white/10 rounded-full -ml-16 md:-ml-24 -mb-16 md:-mb-24 blur-2xl"></div>

                            <div className="relative">
                                <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                                    <div className="p-2 md:p-3 bg-white/20 backdrop-blur-sm rounded-lg md:rounded-xl">
                                        <Users2 className="w-6 h-6 md:w-8 md:h-8" />
                                    </div>
                                    <h1 className="text-2xl md:text-4xl font-bold">Events</h1>
                                </div>
                                <p className="text-sm md:text-xl text-purple-100 max-w-3xl leading-relaxed">
                                    Connect with fellow safeguarding professionals through forums, coffee mornings, and networking events.
                                </p>
                                <div className="mt-4 md:mt-6 flex flex-wrap gap-2 md:gap-3">
                                    <div className="flex items-center gap-1.5 md:gap-2 bg-white/20 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-sm md:text-base">
                                        <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                                        <span className="font-semibold">Free for Members</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 md:gap-2 bg-white/20 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-sm md:text-base">
                                        <Coffee className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                                        <span className="font-semibold">{upcomingEvents.length} Upcoming</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Events */}
                        <div className="mb-8 md:mb-12">
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 md:mb-6 px-1">Upcoming Events</h2>
                            {upcomingEvents.length === 0 ? (
                                <Card className="border-2 border-dashed">
                                    <CardContent className="py-12 md:py-16 text-center px-4">
                                        <Calendar className="w-16 h-16 md:w-20 md:h-20 text-slate-300 mx-auto mb-4 md:mb-6" />
                                        <h3 className="text-xl md:text-2xl font-semibold text-slate-800 mb-2 md:mb-3">
                                            No Upcoming Events
                                        </h3>
                                        <p className="text-sm md:text-base text-slate-600 max-w-md mx-auto">
                                            Check back soon for new community events and networking opportunities.
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                    {upcomingEvents.map(event => (
                                        <CommunityEventCard
                                            key={event.id}
                                            event={event}
                                            userSignup={getUserSignupForEvent(event.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Past Events */}
                        {pastEvents.length > 0 && (
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 md:mb-6 px-1">Past Events</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 opacity-60">
                                    {pastEvents.slice(0, 6).map(event => (
                                        <Card key={event.id} className="hover:shadow-md transition-all">
                                            {event.imageUrl && (
                                                <div className="h-28 md:h-32 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                                                    <img
                                                        src={event.imageUrl}
                                                        alt={event.title}
                                                        className="w-full h-full object-cover grayscale"
                                                    />
                                                </div>
                                            )}
                                            <CardHeader className="pb-3">
                                                <Badge variant="outline" className="w-fit mb-2 text-xs">
                                                    <EventTypeIcon type={event.type} />
                                                    <span className="ml-1">{event.type}</span>
                                                </Badge>
                                                <CardTitle className="text-base md:text-lg">{event.title}</CardTitle>
                                                <CardDescription className="line-clamp-2 text-sm">
                                                    {format(new Date(event.date), 'MMM d, yyyy')}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardFooter className="pt-3">
                                                <Button
                                                    asChild
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-full text-sm"
                                                >
                                                    <a href={createPageUrl(`CommunityEventDetails?id=${event.id}`)}>
                                                        View Details
                                                    </a>
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
            {/* The Registration Dialog component and its related logic (selectedEvent, showRegisterDialog, registrationNotes, isRegistering, handleRegisterClick, handleRegisterConfirm)
                have been removed as registration functionality is now handled on the CommunityEventDetails page. */}
        </div>
    );
}