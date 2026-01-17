import React, { useState, useEffect } from 'react';
import { EventSignup } from '@/api/entities';
import { Event } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Video, ExternalLink, Loader2, AlertCircle, Award } from 'lucide-react';
import { format } from 'date-fns';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useToast } from "@/components/ui/use-toast";

const SessionCard = ({ signup, user, search }) => {
    const [event, setEvent] = useState(null);
    const [eventLoadingError, setEventLoadingError] = useState(false);
    const [eventLoading, setEventLoading] = useState(true);
    const { toast } = useToast();
    
    const isPastEvent = new Date(signup.eventDate) < new Date();
    const isToday = new Date(signup.eventDate).toDateString() === new Date().toDateString();
    const isFullMember = user?.membershipType === 'Full';
    
    // Fetch event data with comprehensive error handling and prevention
    useEffect(() => {
        const fetchEvent = async () => {
            // Skip fetching if no eventId or if eventId looks invalid
            if (!signup.eventId || typeof signup.eventId !== 'string' || signup.eventId.length < 10) {
                console.log('Skipping event fetch - invalid or missing eventId:', signup.eventId);
                setEventLoadingError(true);
                setEventLoading(false);
                return;
            }

            try {
                setEventLoading(true);
                
                // Wrap the Event.get call with additional error handling
                let eventData = null;
                
                try {
                    eventData = await Event.get(signup.eventId);
                } catch (fetchError) {
                    // Specifically catch and handle the "not found" error
                    if (fetchError.message && fetchError.message.includes('not found')) {
                        console.log(`Event ${signup.eventId} not found - likely deleted`);
                        setEvent(null);
                        setEventLoadingError(true);
                        setEventLoading(false);
                        return;
                    } else {
                        // Re-throw other types of errors
                        throw fetchError;
                    }
                }
                
                if (eventData && eventData.id) {
                    setEvent(eventData);
                    setEventLoadingError(false);
                } else {
                    setEvent(null);
                    setEventLoadingError(true);
                }
            } catch (error) {
                console.error(`Error fetching event ${signup.eventId}:`, error.message || error);
                setEvent(null);
                setEventLoadingError(true);
            } finally {
                setEventLoading(false);
            }
        };
        
        fetchEvent();
    }, [signup.eventId]);
    
    return (
        <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-wrap gap-2">
                        {isToday && (
                            <Badge className="bg-orange-100 text-orange-800 border-orange-200">Today</Badge>
                        )}
                        {isPastEvent && !isToday && (
                            <Badge variant="secondary">Completed</Badge>
                        )}
                        {!isPastEvent && !isToday && (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">Upcoming</Badge>
                        )}
                        <Badge variant={signup.eventType === 'Workshop' ? 'default' : 'secondary'}>
                            {signup.eventType}
                        </Badge>
                        {eventLoadingError && (
                            <Badge variant="outline" className="text-amber-600 border-amber-300">
                                Event Archived
                            </Badge>
                        )}
                    </div>
                </div>
                <CardTitle className="text-base font-bold text-slate-800 leading-tight">
                    {signup.eventTitle}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow space-y-2 text-sm text-slate-500 p-4 pt-0">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0"/>
                    <span>{format(new Date(signup.eventDate), 'EEE, d MMMM yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 flex-shrink-0"/>
                    <span>{signup.eventTime || 'All day'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0"/>
                    <span>{signup.eventLocation}</span>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-2 flex-col items-start gap-2">
                <div className="flex flex-wrap gap-2 w-full items-center">
                    {/* Join Meeting for upcoming events */}
                    {!isPastEvent && signup.zoomJoinUrl && (
                        <Button asChild size="sm" className="bg-green-600 hover:bg-green-700 flex-grow">
                            <a href={signup.zoomJoinUrl} target="_blank" rel="noopener noreferrer">
                                <Video className="w-4 h-4 mr-2" />
                                Join Meeting
                            </a>
                        </Button>
                    )}
                    
                    {/* Only show recording button if event exists and has recording */}
                    {isPastEvent && isFullMember && event?.recordingUrl && !eventLoadingError && (
                        <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700 flex-grow">
                            <a href={event.recordingUrl} target="_blank" rel="noopener noreferrer">
                                <Video className="w-4 h-4 mr-2" />
                                View Recording
                            </a>
                        </Button>
                    )}


                    
                    {/* View Certificate - only shown if credential exists */}
                    {isPastEvent && signup.certificateUrl && (
                        <Button 
                            asChild
                            size="sm" 
                            variant="outline"
                            className="flex-grow"
                        >
                            <a href={signup.certificateUrl} target="_blank" rel="noopener noreferrer">
                                <Award className="w-4 h-4 mr-2" />
                                View Certificate
                            </a>
                        </Button>
                    )}
                </div>
                
                {/* View Details - FIXED: Changed WorkshopDetails to MasterclassDetails */}
                {!eventLoadingError && event && event.id && (
                    <Button asChild size="sm" variant="ghost" className="w-full justify-start text-slate-500 hover:text-slate-700">
                        <Link to={`${createPageUrl('MasterclassDetails')}?id=${signup.eventId}${search ? `&${search.substring(1)}` : ''}`}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Event Details
                        </Link>
                    </Button>
                )}

                {/* Show message for archived events */}
                {eventLoadingError && (
                    <div className="w-full text-center py-2">
                        <p className="text-xs text-amber-600 bg-amber-50 rounded px-2 py-1">
                            Event details no longer available
                        </p>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
};

export default function BookingManagement({ user, maxItems, showHeader = true, dashboardView = false }) {
    const [signups, setSignups] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const { search } = location;

    useEffect(() => {
        const fetchSignups = async () => {
            if (!user?.id) return;
            setLoading(true);
            try {
                const userSignups = await EventSignup.filter({ userId: user.id }, '-eventDate');
                setSignups(userSignups);
            } catch (error) {
                console.error("Error fetching signups:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSignups();
    }, [user?.id]);



    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        );
    }

    const upcomingSignups = signups.filter(signup => new Date(signup.eventDate) >= new Date());
    const pastSignups = signups.filter(signup => new Date(signup.eventDate) < new Date());

    // If this is the dashboard view and there are no signups at all, don't render anything
    if (dashboardView && signups.length === 0) {
        return null;
    }

    // If this is the dashboard view, only show upcoming sessions
    if (dashboardView) {
        return (
            <div className="space-y-6">
                {showHeader && (
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-1">My Upcoming Sessions</h2>
                        <p className="text-slate-600 text-sm">Your upcoming registered workshops</p>
                    </div>
                )}

                {upcomingSignups.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                        <Calendar className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                        <h3 className="font-medium text-gray-900 mb-1">No upcoming sessions</h3>
                        <p className="text-sm text-gray-500 mb-4">You haven't registered for any workshops yet.</p>
                        <Button asChild size="sm">
                            <Link to={`${createPageUrl('MemberMasterclasses')}${search}`}>
                                Browse Masterclasses
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {upcomingSignups.slice(0, maxItems || upcomingSignups.length).map(signup => (
                                <SessionCard key={signup.id} signup={signup} user={user} search={search} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Full view for MyMasterclassBookings page
    const renderSignupList = (signupsToRender, title, emptyMessage, emptyLink, emptyLinkText) => (
        <div className="mb-10">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">{title} ({signupsToRender.length})</h3>
            {signupsToRender.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {signupsToRender.map(signup => (
                        <SessionCard key={signup.id} signup={signup} user={user} search={search} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-6 bg-white rounded-lg border border-gray-200">
                    <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-md text-gray-500 mb-4">{emptyMessage}</p>
                    <Button asChild variant="outline">
                        <Link to={`${emptyLink}${search}`}>
                            {emptyLinkText}
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-8">
            {showHeader && (
                <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-1">My Masterclass Sessions</h2>
                    <p className="text-slate-600 text-sm">Manage your registered sessions and access resources</p>
                </div>
            )}

            {signups.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions booked</h3>
                    <p className="text-sm text-gray-500 mb-4">You haven't registered for any masterclasses yet.</p>
                    <Button asChild>
                        <Link to={`${createPageUrl('MemberMasterclasses')}${search}`}>
                            Browse Masterclasses
                        </Link>
                    </Button>
                </div>
            ) : (
                <>
                    {/* Upcoming Sessions */}
                    {renderSignupList(
                        upcomingSignups, 
                        "My Upcoming Sessions", 
                        "No upcoming sessions.", 
                        createPageUrl('MemberMasterclasses'), 
                        "Browse Masterclasses"
                    )}

                    {/* Past Sessions */}
                    {renderSignupList(
                        pastSignups, 
                        "Past Sessions", 
                        "No past sessions.", 
                        createPageUrl('MemberMasterclasses'), 
                        "Browse Masterclasses"
                    )}
                </>
            )}
        </div>
    );
}