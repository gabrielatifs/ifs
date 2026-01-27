import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@ifs/shared/components/ui/button';
import { Badge } from '@ifs/shared/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@ifs/shared/utils';
import { User } from '@ifs/shared/api/entities';
import { customLoginWithRedirect } from '../components/utils/auth';
import { ifs } from '@ifs/shared/api/ifsClient';
import { Loader2, ArrowRight, Clock, Users, Award, Calendar, Search, Filter, MapPin, Video } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ifs/shared/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ifs/shared/components/ui/tabs';
import LocationSearchInput from '@ifs/shared/components/ui/LocationSearchInput';
import MainSiteNav from '../components/marketing/MainSiteNav';
import HeroBreadcrumbs from '../components/marketing/HeroBreadcrumbs';
import { format } from 'date-fns';
import { usePostHog } from '@ifs/shared/components/providers/PostHogProvider';

const EventCard = React.memo(({ event, isPast = false }) => {
    // Determine if this is a masterclass or community event
    const isMasterclass = event.source === 'Event';
    const detailsPage = isMasterclass ? 'EventDetails' : 'CommunityEventDetails';
    const eventType = event.type || (isMasterclass ? 'Masterclass' : 'Community Event');

    return (
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200 flex flex-col group overflow-hidden">
            {/* Content Section */}
            <div className="flex flex-col flex-grow p-6">
                <div className="flex items-start justify-between gap-2 mb-3">
                    <Badge className="bg-white/95 text-purple-800 text-xs font-bold px-3 py-1.5 rounded-full border border-purple-200">
                        {eventType}
                    </Badge>
                    <div className="flex gap-2">
                        {!isMasterclass && (
                            <Badge className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                                Free
                            </Badge>
                        )}
                        {isPast && (
                            <Badge className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full">
                                Past Event
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 mb-3 text-sm">
                    <div className="flex items-center gap-1.5 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{event.time || event.startTime || 'Time TBA'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-purple-600">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                    </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-purple-700 transition-colors line-clamp-2">
                    <Link to={`${createPageUrl(detailsPage)}?id=${event.id}&from=Events`}>
                        {event.title}
                    </Link>
                </h3>
                
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3 flex-grow">
                    {event.description}
                </p>

                {event.whatYouWillLearn && Array.isArray(event.whatYouWillLearn) && event.whatYouWillLearn.length > 0 && (
                    <div className="mb-5">
                        <h4 className="font-semibold text-sm text-gray-800 mb-2">Key Topics:</h4>
                        <div className="flex flex-wrap gap-1">
                            {event.whatYouWillLearn.filter((item) => item && item.trim() !== '').slice(0, 3).map((topic, index) => (
                                <span key={index} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                                    {topic}
                                </span>
                            ))}
                            {event.whatYouWillLearn.filter((item) => item && item.trim() !== '').length > 3 && (
                                <span className="text-xs text-gray-500">+{event.whatYouWillLearn.filter((item) => item && item.trim() !== '').length - 3} more</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Date and CTA */}
                <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                            {new Date(event.date).toLocaleDateString('en-GB', { 
                                day: 'numeric', 
                                month: 'short', 
                                year: 'numeric' 
                            })}
                        </span>
                    </div>
                    {!isPast && (
                        <Button
                            asChild
                            className="bg-purple-700 hover:bg-purple-800 text-white w-full shadow-sm hover:shadow-md transition-all group-hover:bg-purple-800"
                        >
                            <Link to={`${createPageUrl(detailsPage)}?id=${event.id}&from=Events`}>
                                {isMasterclass ? 'Register Now' : 'Join Event'}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                    )}
                    {isPast && (
                        <Button
                            asChild
                            variant="outline"
                            className="w-full"
                        >
                            <Link to={`${createPageUrl(detailsPage)}?id=${event.id}&from=Events`}>
                                View Details
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
});

EventCard.displayName = 'EventCard';

export default function Events() {
    const { trackEvent } = usePostHog();

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [locationFilter, setLocationFilter] = useState({ name: '', coordinates: null, radius: '0' });
    const [activeTab, setActiveTab] = useState('upcoming');

    useEffect(() => {
        let isMounted = true;
        
        const fetchEvents = async () => {
            setLoading(true);
            try {
                // Fetch both Masterclass Events and Community Events
                const [masterclassEvents, communityEvents] = await Promise.all([
                    ifs.entities.Event.list('-date'),
                    ifs.entities.CommunityEvent.list('-date')
                ]);

                if (isMounted) {
                    // Combine both, adding source identifier
                    const allEvents = [
                        ...masterclassEvents.map(e => ({ ...e, source: 'Event' })),
                        ...communityEvents
                            .filter(e => e.status === 'Active')
                            .map(e => ({ ...e, source: 'CommunityEvent' }))
                    ];

                    setEvents(allEvents);
                }
            } catch (error) {
                console.error("Failed to fetch events:", error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        fetchEvents();
        
        return () => {
            isMounted = false;
        };
    }, []);

    const handleJoin = useCallback((location) => {
        trackEvent('join_button_clicked', {
          intent: 'associate',
          location: location || 'events_page_hero',
          user_type: 'anonymous'
        });
        const path = createPageUrl('Onboarding') + '?intent=associate';
        customLoginWithRedirect(path);
    }, [trackEvent]);

    // Split events into upcoming and past
    const { upcomingEvents, pastEvents } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = events
            .filter(e => new Date(e.date) >= today)
            .sort((a, b) => new Date(a.date) - new Date(b.date)); // Ascending: soonest first

        const past = events
            .filter(e => new Date(e.date) < today)
            .sort((a, b) => new Date(b.date) - new Date(a.date)); // Descending: most recent first

        return { upcomingEvents: upcoming, pastEvents: past };
    }, [events]);

    // Haversine formula
    const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;
        const R = 3959; // miles
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }, []);

    const filterEvents = useCallback((eventsList) => {
        return eventsList.filter(event => {
            if (!event) return false;
            
            let matchesLocation = true;
            if (locationFilter.name) {
                const radius = parseFloat(locationFilter.radius);
                if (locationFilter.coordinates && radius > 0) {
                    if (event.latitude && event.longitude) {
                        const distance = calculateDistance(
                            locationFilter.coordinates.lat,
                            locationFilter.coordinates.lng,
                            event.latitude,
                            event.longitude
                        );
                        matchesLocation = distance <= radius;
                    } else {
                        // Fallback to string match
                        matchesLocation = event.location && event.location.toLowerCase().includes(locationFilter.name.toLowerCase());
                    }
                } else {
                    // String match
                    matchesLocation = event.location && (
                        event.location.toLowerCase().includes(locationFilter.name.toLowerCase()) ||
                        locationFilter.name.toLowerCase().includes(event.location.toLowerCase())
                    );
                }
            }
            
            const searchLower = (searchTerm || '').toLowerCase();
            const matchesSearch = !searchTerm ||
                (typeof event.title === 'string' && event.title.toLowerCase().includes(searchLower)) ||
                (typeof event.description === 'string' && event.description.toLowerCase().includes(searchLower));
                
            return matchesSearch && matchesLocation;
        });
    }, [locationFilter, searchTerm, calculateDistance]);

    const filteredUpcomingEvents = useMemo(() => filterEvents(upcomingEvents), [upcomingEvents, filterEvents]);
    const filteredPastEvents = useMemo(() => filterEvents(pastEvents), [pastEvents, filterEvents]);

    const handleClearFilters = useCallback(() => {
        setSearchTerm('');
        setLocationFilter({ name: '', coordinates: null, radius: '0' });
        const searchSection = document.getElementById('event-search');
        if (searchSection) {
            searchSection.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    return (
        <>
            {/* Mobile Navigation - Show only on mobile */}
            <div className="lg:hidden">
                <MainSiteNav variant="solid-mobile" />
            </div>

            {/* --- Desktop Hero --- */}
            <section className="relative bg-gray-900 overflow-hidden hidden lg:block" style={{ minHeight: '600px' }}>
                <div className="absolute inset-0">
                    <img 
                        src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop" 
                        alt="Professional conference audience"
                        className="w-full h-full object-cover object-center"
                        style={{ filter: 'grayscale(100%) contrast(1.1)' }}
                    />
                </div>
                <div 
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to right, #5e028f 45%, rgba(94, 2, 143, 0.2) 65%, transparent 100%)' }}
                ></div>
                
                <div className="absolute inset-0">
                    <div className="absolute top-16 right-24 w-64 h-64 bg-pink-600/30 rounded-full blur-3xl"></div>
                    <div className="absolute top-32 right-8 w-32 h-32 bg-pink-500/40 rounded-full blur-xl"></div>
                    <div className="absolute bottom-24 right-32 w-48 h-48 bg-purple-700/25 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-8 right-16 w-24 h-24 bg-purple-500/50 rounded-full blur-lg"></div>
                    <div className="absolute top-1/2 right-4 w-20 h-20 bg-pink-600/60 rounded-full blur-md"></div>
                </div>

                <MainSiteNav />

                {/* Hero Content */}
                <div className="relative z-10 max-w-screen-xl mx-auto">
                    <div className="grid lg:grid-cols-2 items-center min-h-[600px]">
                        {/* Left Column - Content */}
                        <div className="px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center lg:text-left">
                            <HeroBreadcrumbs pageName="Events" />
                            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                                Professional Events & Networking
                            </h1>
                            <div className="text-lg lg:text-xl text-purple-100 mb-8 leading-relaxed space-y-4">
                                <p>
                                    Connect with peers, share knowledge, and advance your practice through our expert-led events.
                                </p>
                                <p>
                                    From masterclasses and forums to info sessions and networking events, discover opportunities to enhance your professional development.
                                </p>
                            </div>
                            <div className="inline-flex items-center gap-4">
                                <Button
                                    onClick={() => {
                                        const searchSection = document.getElementById('event-search');
                                        if (searchSection) {
                                            searchSection.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }}
                                    size="lg"
                                    className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm"
                                >
                                    Browse Events
                                </Button>
                                <Button
                                  onClick={() => handleJoin('events_hero_desktop')}
                                  size="lg"
                                  variant="outline"
                                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-800 font-semibold px-8 py-3 text-base rounded-sm transition-all"
                                >
                                  Become a Member for Free
                                </Button>
                            </div>
                        </div>
                        {/* Right column is empty, space is filled by the background image */}
                        <div className="hidden lg:block"></div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="bg-slate-50">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 lg:pt-16">
                    {/* Event Directory Section */}
                    <section id="event-search" className="bg-white py-8 lg:py-16 rounded-xl border border-gray-100 shadow-sm">
                        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-8 lg:mb-12">
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">Find Your Next Event</h2>
                                <p className="text-gray-600 text-lg max-w-2xl mx-auto">Discover masterclasses, forums, info sessions, and networking events tailored to your professional development needs</p>
                            </div>

                            <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
                                {/* Search Bar and Filters */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
                                    <div className="relative">
                                        <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                                        <input
                                            type="text"
                                            placeholder="Search events..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-14 pr-6 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500 shadow-sm text-lg"
                                        />
                                    </div>
                                    <div className="w-full">
                                        <LocationSearchInput 
                                            value={locationFilter.name} 
                                            onChange={(val) => {
                                                if (typeof val === 'object' && val !== null) {
                                                    setLocationFilter(prev => ({
                                                        ...prev,
                                                        name: val.name,
                                                        coordinates: val.geometry?.location || null,
                                                        radius: prev.radius === '0' && val.geometry?.location ? '50' : prev.radius
                                                    }));
                                                } else {
                                                    setLocationFilter(prev => ({ ...prev, name: val, coordinates: null }));
                                                }
                                            }} 
                                            placeholder="Filter by location..."
                                            className="w-full h-full text-lg" 
                                        />
                                    </div>
                                    <div className="w-full">
                                        <Select 
                                            value={locationFilter.radius} 
                                            onValueChange={(val) => setLocationFilter(prev => ({ ...prev, radius: val }))}
                                            disabled={!locationFilter.coordinates}
                                        >
                                            <SelectTrigger className="w-full py-4 text-lg border-gray-200 rounded-xl shadow-sm h-[60px]">
                                                <SelectValue placeholder="Radius" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">Exact Location</SelectItem>
                                                <SelectItem value="25">Within 25 miles</SelectItem>
                                                <SelectItem value="50">Within 50 miles</SelectItem>
                                                <SelectItem value="100">Within 100 miles</SelectItem>
                                                <SelectItem value="200">Within 200 miles</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Results Summary */}
                                <div className="mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-gray-200 text-center">
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                        <p className="text-gray-700 text-lg">
                                            <span className="font-bold text-gray-900">
                                                {activeTab === 'upcoming' ? filteredUpcomingEvents.length : filteredPastEvents.length}
                                            </span> 
                                            {(activeTab === 'upcoming' ? filteredUpcomingEvents.length : filteredPastEvents.length) === 1 ? ' event' : ' events'} available
                                            {searchTerm && (
                                                <span> for "{searchTerm}"</span>
                                            )}

                                            {locationFilter.name && (
                                                <span> in {locationFilter.name}</span>
                                            )}
                                        </p>
                                        {(searchTerm || locationFilter.name) && (
                                            <button
                                                onClick={handleClearFilters}
                                                className="text-purple-700 hover:text-purple-900 font-semibold underline underline-offset-4 transition-colors"
                                            >
                                                Clear all filters
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Events Grid with Tabs */}
                    <section className="bg-slate-50 py-12 lg:py-16">
                        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                                    <TabsTrigger value="upcoming" className="text-base">
                                        Upcoming ({filteredUpcomingEvents.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="past" className="text-base">
                                        Past Events ({filteredPastEvents.length})
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="upcoming">
                                    {loading ? (
                                        <div className="text-center py-20">
                                            <Loader2 className="w-12 h-12 text-purple-600 mx-auto animate-spin" />
                                            <p className="mt-4 text-gray-600">Loading events...</p>
                                        </div>
                                    ) : filteredUpcomingEvents.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                            {filteredUpcomingEvents.map(event => (
                                                <EventCard key={`${event.source}-${event.id}`} event={event} isPast={false} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 px-4">
                                            <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 max-w-lg mx-auto">
                                                <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                                                <h3 className="text-2xl font-bold text-gray-700 mb-3">No upcoming events found</h3>
                                                <p className="text-gray-500 mb-8 text-lg">
                                                    {searchTerm 
                                                        ? `No upcoming events match your search for "${searchTerm}"`
                                                        : "Try adjusting your filters or check back later for new events"
                                                    }
                                                </p>
                                                <Button
                                                    onClick={handleClearFilters}
                                                    className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-3 text-lg"
                                                >
                                                    Show All Events
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="past">
                                    {loading ? (
                                        <div className="text-center py-20">
                                            <Loader2 className="w-12 h-12 text-purple-600 mx-auto animate-spin" />
                                            <p className="mt-4 text-gray-600">Loading events...</p>
                                        </div>
                                    ) : filteredPastEvents.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                            {filteredPastEvents.map(event => (
                                                <EventCard key={`${event.source}-${event.id}`} event={event} isPast={true} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 px-4">
                                            <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 max-w-lg mx-auto">
                                                <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                                                <h3 className="text-2xl font-bold text-gray-700 mb-3">No past events found</h3>
                                                <p className="text-gray-500 mb-8 text-lg">
                                                    {searchTerm 
                                                        ? `No past events match your search for "${searchTerm}"`
                                                        : "Try adjusting your filters to see past events"
                                                    }
                                                </p>
                                                <Button
                                                    onClick={handleClearFilters}
                                                    className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-3 text-lg"
                                                >
                                                    Clear Filters
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>
                    </section>
                </div>
            </div>

            {/* Benefits Section */}
            <section className="bg-white py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                            Why Attend IfS Events?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Our events are designed by experts to provide practical value, meaningful connections, and actionable insights for your safeguarding practice.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center group">
                            <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors">
                                <Users className="w-10 h-10 text-purple-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Expert-Led Content</h3>
                            <p className="text-gray-600 text-lg">Learn from experienced practitioners and thought leaders who understand the real-world challenges you face.</p>
                        </div>

                        <div className="text-center group">
                            <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors">
                                <Award className="w-10 h-10 text-purple-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">CPD Accredited</h3>
                            <p className="text-gray-600 text-lg">All our masterclasses and conferences count towards your continuing professional development requirements.</p>
                        </div>

                        <div className="text-center group">
                            <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors">
                                <Video className="w-10 h-10 text-purple-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Flexible Access</h3>
                            <p className="text-gray-600 text-lg">Join online forums and events that fit your schedule, plus access to recordings for future reference.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gray-900 py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                        Ready to connect with your professional community?
                    </h2>
                    <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
                        Join fellow safeguarding professionals at our next event and take your practice to the next level.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Button
                            asChild
                            size="lg"
                            className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-semibold px-10 py-4 text-lg shadow-lg hover:shadow-xl transition-all"
                        >
                            <Link to={createPageUrl('AssociateMembership')}>Join as Member</Link>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-10 py-4 text-lg transition-all"
                            asChild
                        >
                            <Link to={createPageUrl("Contact")}>Contact Events Team</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
}