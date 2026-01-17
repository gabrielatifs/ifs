import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User } from '@/api/entities';
import { Event } from '@/api/entities';
import { createPageUrl } from '@/utils';
import PortalSidebar from '../components/portal/PortalSidebar';
import PortalHeader from '../components/portal/PortalHeader';
import { useUser } from '../components/providers/UserProvider';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Search, Tag, Users, Loader2, Coins, ArrowRight, Video, Coffee, MessageSquare, Users2, Sparkles, UserCheck, CheckCircle2, BookOpen, X } from 'lucide-react';
import { format, isFuture, isPast, parseISO, isBefore, startOfDay } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { base44 } from '@/api/base44Client';
import BookingManagement from '../components/portal/BookingManagement';
import CourseBookingsCard from '../components/portal/CourseBookingsCard';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

const EventCard = React.memo(({ event, user }) => {
    const eventDate = parseISO(event.date);
    const isFullMember = user?.membershipType === 'Full';
    
    return (
        <Card className="flex flex-col h-full hover:shadow-lg transition-shadow overflow-hidden">
            {event.imageUrl && (
                <div className="h-32 md:h-36 bg-gradient-to-br from-amber-100 via-orange-100 to-amber-50 overflow-hidden">
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                </div>
            )}
            <CardHeader className="flex-grow pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">{event.type}</Badge>
                    {event.creditCost && event.creditCost > 0 && isFullMember && (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1 text-xs">
                            <Coins className="w-3 h-3" />
                            {event.creditCost}
                        </Badge>
                    )}
                </div>
                <CardTitle className="text-base md:text-lg leading-tight line-clamp-2">{event.title}</CardTitle>
                {event.facilitator && (
                    <p className="text-xs md:text-sm text-slate-600 truncate">with {event.facilitator}</p>
                )}
            </CardHeader>
            <CardContent className="space-y-2 pb-3">
                <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600">
                    <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                    <span className="truncate">{format(eventDate, 'eee, dd MMM yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600">
                    <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                    <span className="truncate">{event.time}</span>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600">
                    <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                </div>
                {event.creditCost && event.creditCost > 0 && isFullMember && (
                    <div className="pt-2 border-t border-slate-200">
                        <div className="flex items-center justify-between text-xs md:text-sm">
                            <span className="text-slate-600">Cost:</span>
                            <div className="flex items-center gap-1 font-semibold text-slate-900">
                                <Coins className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500" />
                                {event.creditCost} credits
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            Balance: {user?.creditBalance || 0} credits
                        </p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="pt-3">
                <Button asChild className="w-full" size="sm">
                    <Link to={createPageUrl(`MasterclassDetails?id=${event.id}`)}>
                        View Details
                        <ArrowRight className="w-3.5 h-3.5 ml-2" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
});

EventCard.displayName = 'EventCard';

// Community Event Type Icon
const EventTypeIcon = ({ type }) => {
    switch (type) {
        case 'Forum':
            return <MessageSquare className="w-4 h-4" />;
        case 'Coffee Morning':
            return <Coffee className="w-4 h-4" />;
        case 'Networking':
            return <Users2 className="w-4 h-4" />;
        default:
            return <Sparkles className="w-4 h-4" />;
    }
};

// Community Event Card
const CommunityEventCard = React.memo(({ event }) => {
    return (
        <Card className="flex flex-col h-full hover:shadow-lg transition-shadow overflow-hidden">
            {event.imageUrl && (
                <div className="h-28 md:h-32 bg-gradient-to-br from-purple-100 to-blue-100 overflow-hidden">
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                </div>
            )}
            <CardHeader className="flex-grow pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge className="bg-purple-100 text-purple-700 text-xs">
                        <EventTypeIcon type={event.type} />
                        <span className="ml-1">{event.type}</span>
                    </Badge>
                </div>
                <CardTitle className="text-base md:text-lg leading-tight line-clamp-2">{event.title}</CardTitle>
                {event.facilitator && (
                    <p className="text-xs md:text-sm text-slate-600 truncate">with {event.facilitator}</p>
                )}
            </CardHeader>
            <CardContent className="space-y-2 pb-3">
                <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600">
                    <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                    <span className="truncate">{format(new Date(event.date), 'eee, dd MMM yyyy')}</span>
                </div>
                {event.startTime && event.endTime && (
                    <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600">
                        <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                        <span className="truncate">{event.startTime} - {event.endTime}</span>
                    </div>
                )}
                <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600">
                    {event.location === 'Online' ? (
                        <><Video className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" /><span>Online Event</span></>
                    ) : (
                        <><MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" /><span className="truncate">{event.location}</span></>
                    )}
                </div>
            </CardContent>
            <CardFooter className="pt-3">
                <Button asChild className="w-full" variant="outline" size="sm">
                    <Link to={createPageUrl(`CommunityEventDetails?id=${event.id}`)}>
                        View Details
                        <ArrowRight className="w-3.5 h-3.5 ml-2" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
});

CommunityEventCard.displayName = 'CommunityEventCard';

export default function MemberMasterclasses() {
    const { user, loading } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [events, setEvents] = useState([]);
    const [communityEvents, setCommunityEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [showBookings, setShowBookings] = useState(false);

    console.log('[MemberMasterclasses] Render:', { hasUser: !!user, loading, isLoading });




    useEffect(() => {
        let isMounted = true;
        
        const fetchEvents = async () => {
            setIsLoading(true);
            try {
                const [fetchedEvents, fetchedCommunityEvents] = await Promise.all([
                    Event.list('-date'),
                    base44.entities.CommunityEvent.list('date', 50)
                ]);
                if (isMounted) {
                    setEvents(fetchedEvents || []);
                    setCommunityEvents(fetchedCommunityEvents || []);
                }
            } catch (error) {
                console.error("Failed to fetch events", error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };
        fetchEvents();
        
        return () => {
            isMounted = false;
        };
    }, []);

    const filteredEvents = useMemo(() => {
        return events
            .filter(event => {
                const searchTermMatch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                      (event.tags && event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
                const typeMatch = filterType === 'all' || event.type === filterType;
                return searchTermMatch && typeMatch;
            });
    }, [events, searchTerm, filterType]);

    const filteredCommunityEvents = useMemo(() => {
        return communityEvents.filter(event => {
            const searchTermMatch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  (event.tags && event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
            const typeMatch = filterType === 'all' || event.type === filterType;
            return searchTermMatch && typeMatch;
        });
    }, [communityEvents, searchTerm, filterType]);

    const upcomingEvents = useMemo(() => 
        filteredEvents.filter(event => isFuture(parseISO(event.date))), 
        [filteredEvents]
    );
    
    const pastEvents = useMemo(() => 
        filteredEvents.filter(event => isPast(parseISO(event.date))), 
        [filteredEvents]
    );

    const upcomingCommunityEvents = useMemo(() => 
        filteredCommunityEvents
            .filter(e => !isBefore(new Date(e.date), startOfDay(new Date())))
            .sort((a, b) => new Date(a.date) - new Date(b.date)),
        [filteredCommunityEvents]
    );

    const pastCommunityEvents = useMemo(() => 
        filteredCommunityEvents
            .filter(e => isBefore(new Date(e.date), startOfDay(new Date())))
            .sort((a, b) => new Date(b.date) - new Date(a.date)),
        [filteredCommunityEvents]
    );



    return (
        <>
            <Toaster />
            <div className="flex h-screen bg-slate-50/30">
                <PortalSidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="MemberMasterclasses" />
                
                <div className="flex-1 flex flex-col overflow-hidden">
                    <PortalHeader
                        setSidebarOpen={setSidebarOpen}
                        user={user}
                    />
                    <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
                        <div className="max-w-7xl mx-auto">
                            {/* Hero Header */}
                            <div className="mb-6 md:mb-8 relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 p-6 md:p-8 text-white shadow-xl">
                                <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-white/10 rounded-full -mr-24 md:-mr-32 -mt-24 md:-mt-32 blur-3xl"></div>
                                <div className="absolute bottom-0 left-0 w-32 h-32 md:w-48 md:h-48 bg-white/10 rounded-full -ml-16 md:-ml-24 -mb-16 md:-mb-24 blur-2xl"></div>
                                <div className="relative">
                                    <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                                        <div className="p-2 md:p-2.5 bg-white/20 backdrop-blur-sm rounded-lg md:rounded-xl">
                                            <Calendar className="w-5 h-5 md:w-6 md:h-6" />
                                        </div>
                                        <h1 className="text-xl md:text-3xl font-bold">Events & Masterclasses</h1>
                                    </div>
                                    <p className="text-sm md:text-base text-purple-100 max-w-2xl leading-relaxed">
                                        Exclusive CPD masterclasses, webinars, and community networking events for members.
                                    </p>
                                    <div className="mt-3 md:mt-4 flex flex-wrap gap-2 md:gap-3">
                                        <div className="flex items-center gap-1.5 md:gap-2 bg-white/20 backdrop-blur-sm px-2.5 md:px-3 py-1.5 rounded-lg text-xs md:text-sm">
                                            <Users2 className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                                            <span className="font-medium">{upcomingEvents.length + upcomingCommunityEvents.length} Upcoming</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 md:gap-2 bg-white/20 backdrop-blur-sm px-2.5 md:px-3 py-1.5 rounded-lg text-xs md:text-sm">
                                            <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                                            <span className="font-medium">Free for Members</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Search and My Bookings */}
                            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 md:mb-8 items-start sm:items-center justify-between">
                                <div className="relative flex-grow w-full sm:max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400" />
                                    <Input
                                        placeholder="Search events..."
                                        className="pl-9 md:pl-10 bg-white text-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Button 
                                    onClick={() => setShowBookings(true)}
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md w-full sm:w-auto"
                                    size="sm"
                                >
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    My Bookings
                                </Button>
                            </div>

                            {/* Masterclasses Section */}
                            <section className="mb-8 md:mb-12">
                                <div className="flex items-center justify-between mb-4 md:mb-6 px-1">
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="p-2 md:p-2.5 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg md:rounded-xl">
                                            <Coins className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-base md:text-xl font-bold text-slate-900">Masterclasses & Webinars</h2>
                                            <p className="text-xs md:text-sm text-slate-500 hidden sm:block">Earn CPD hours with professional sessions</p>
                                        </div>
                                    </div>
                                    {upcomingEvents.length > 0 && (
                                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                                            {upcomingEvents.length}
                                        </Badge>
                                    )}
                                </div>

                                {isLoading ? (
                                    <div className="text-center py-12"><Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin mx-auto text-purple-600" /></div>
                                ) : upcomingEvents.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                        {upcomingEvents.map(event => (
                                            <EventCard key={event.id} event={event} user={user} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 md:py-12 bg-slate-50 border border-dashed border-slate-200 rounded-xl px-4">
                                        <Calendar className="w-8 h-8 md:w-10 md:h-10 mx-auto text-slate-300" />
                                        <h3 className="mt-3 text-sm md:text-base font-medium text-slate-700">No Upcoming Masterclasses</h3>
                                        <p className="mt-1 text-xs md:text-sm text-slate-500">Check back soon for new sessions.</p>
                                    </div>
                                )}

                                {pastEvents.length > 0 && (
                                    <details className="mt-4 md:mt-6 group px-1">
                                        <summary className="cursor-pointer text-xs md:text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-2">
                                            <span>View past masterclasses ({pastEvents.length})</span>
                                            <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 transition-transform group-open:rotate-90" />
                                        </summary>
                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                            {pastEvents.map(event => (
                                                <EventCard key={event.id} event={event} user={user} />
                                            ))}
                                        </div>
                                    </details>
                                )}
                            </section>

                            <Separator className="my-6 md:my-8" />

                            {/* Community Events Section */}
                            <section>
                                <div className="flex items-center justify-between mb-4 md:mb-6 px-1">
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="p-2 md:p-2.5 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg md:rounded-xl">
                                            <Coffee className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-base md:text-xl font-bold text-slate-900">Community Events</h2>
                                            <p className="text-xs md:text-sm text-slate-500 hidden sm:block">Forums, coffee mornings & networking</p>
                                        </div>
                                    </div>
                                    {upcomingCommunityEvents.length > 0 && (
                                        <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                                            {upcomingCommunityEvents.length}
                                        </Badge>
                                    )}
                                </div>

                                {isLoading ? (
                                    <div className="text-center py-12"><Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin mx-auto text-purple-600" /></div>
                                ) : upcomingCommunityEvents.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                        {upcomingCommunityEvents.map(event => (
                                            <CommunityEventCard key={event.id} event={event} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 md:py-12 bg-slate-50 border border-dashed border-slate-200 rounded-xl px-4">
                                        <Coffee className="w-8 h-8 md:w-10 md:h-10 mx-auto text-slate-300" />
                                        <h3 className="mt-3 text-sm md:text-base font-medium text-slate-700">No Upcoming Community Events</h3>
                                        <p className="mt-1 text-xs md:text-sm text-slate-500">Check back soon for networking opportunities.</p>
                                    </div>
                                )}

                                {pastCommunityEvents.length > 0 && (
                                    <details className="mt-4 md:mt-6 group px-1">
                                        <summary className="cursor-pointer text-xs md:text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-2">
                                            <span>View past community events ({pastCommunityEvents.length})</span>
                                            <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 transition-transform group-open:rotate-90" />
                                        </summary>
                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                            {pastCommunityEvents.map(event => (
                                                <CommunityEventCard key={event.id} event={event} />
                                            ))}
                                        </div>
                                    </details>
                                )}
                            </section>
                        </div>
                    </main>
                </div>
            </div>

            {/* My Bookings Sheet */}
            <Sheet open={showBookings} onOpenChange={setShowBookings}>
                <SheetContent className="w-full sm:max-w-2xl lg:max-w-4xl overflow-y-auto">
                    <SheetHeader className="pb-6">
                        <SheetTitle className="text-2xl">My Bookings</SheetTitle>
                        <SheetDescription>
                            Your registered sessions and training courses
                        </SheetDescription>
                    </SheetHeader>
                    
                    <div className="space-y-8">
                        {/* Course Bookings */}
                        <CourseBookingsCard user={user} mode="grid" />
                        
                        {/* Masterclass Bookings */}
                        <BookingManagement user={user} showHeader={false} />
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}