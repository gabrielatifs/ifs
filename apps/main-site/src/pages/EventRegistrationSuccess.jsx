import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@ifs/shared/api/base44Client';
import { useUser } from '@ifs/shared/components/providers/UserProvider';
import { createPageUrl } from '@ifs/shared/utils';
import { Button } from '@ifs/shared/components/ui/button';
import { Card, CardContent } from '@ifs/shared/components/ui/card';
import { Badge } from '@ifs/shared/components/ui/badge';
import {
    CheckCircle,
    Calendar,
    Clock,
    MapPin,
    Download,
    Loader2,
    ArrowLeft,
    Link2,
    ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';

export default function EventRegistrationSuccess() {
    const { user } = useUser();
    const location = useLocation();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    const urlParams = new URLSearchParams(location.search);
    const eventId = urlParams.get('eventId');
    const eventType = urlParams.get('type'); // 'masterclass' or 'community'

    console.log('[EventRegistrationSuccess] Component rendered', { eventId, eventType, search: location.search, fullUrl: window.location.href });

    useEffect(() => {
        console.log('[EventRegistrationSuccess] useEffect running', { eventId, eventType });
        // Trigger confetti on mount
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });

        fetchEventDetails();
    }, [eventId]);

    const fetchEventDetails = async () => {
        if (!eventId) {
            console.error('[EventRegistrationSuccess] No eventId provided');
            setLoading(false);
            return;
        }

        console.log('[EventRegistrationSuccess] Fetching event:', { eventId, eventType });

        try {
            let fetchedEvent = null;
            
            if (eventType === 'community') {
                fetchedEvent = await base44.entities.CommunityEvent.get(eventId);
                console.log('[EventRegistrationSuccess] Community event fetched:', fetchedEvent);
            } else {
                // For both 'masterclass' and regular 'event' types
                fetchedEvent = await base44.entities.Event.get(eventId);
                console.log('[EventRegistrationSuccess] Event fetched:', fetchedEvent);
            }

            if (fetchedEvent && fetchedEvent.id) {
                setEvent(fetchedEvent);
                console.log('[EventRegistrationSuccess] Event state updated successfully');
            } else {
                console.error('[EventRegistrationSuccess] Fetched event is invalid:', fetchedEvent);
            }
        } catch (error) {
            console.error('[EventRegistrationSuccess] Failed to fetch event:', error);
            setEvent(null);
        } finally {
            setLoading(false);
        }
    };

    const generateGoogleCalendarUrl = () => {
        if (!event) return '#';

        const startDateTime = new Date(event.date);
        const endDateTime = new Date(event.date);
        
        // Set times if available
        if (event.startTime) {
            const [hours, minutes] = event.startTime.split(':');
            startDateTime.setHours(parseInt(hours), parseInt(minutes));
        }
        if (event.endTime) {
            const [hours, minutes] = event.endTime.split(':');
            endDateTime.setHours(parseInt(hours), parseInt(minutes));
        } else {
            // Default to 1 hour duration
            endDateTime.setHours(startDateTime.getHours() + 1);
        }

        const formatDateForGoogle = (date) => {
            return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
        };

        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: event.title,
            dates: `${formatDateForGoogle(startDateTime)}/${formatDateForGoogle(endDateTime)}`,
            details: event.description || '',
            location: event.location || ''
        });

        if (event.meetingUrl) {
            params.set('details', `${event.description || ''}\n\nJoin Online: ${event.meetingUrl}${event.meetingId ? `\nMeeting ID: ${event.meetingId}` : ''}${event.meetingPassword ? `\nPassword: ${event.meetingPassword}` : ''}`);
        }

        return `https://calendar.google.com/calendar/render?${params.toString()}`;
    };

    const generateICalFile = () => {
        if (!event) return;

        const startDateTime = new Date(event.date);
        const endDateTime = new Date(event.date);

        if (event.startTime) {
            const [hours, minutes] = event.startTime.split(':');
            startDateTime.setHours(parseInt(hours), parseInt(minutes));
        }
        if (event.endTime) {
            const [hours, minutes] = event.endTime.split(':');
            endDateTime.setHours(parseInt(hours), parseInt(minutes));
        } else {
            endDateTime.setHours(startDateTime.getHours() + 1);
        }

        const formatDateForICal = (date) => {
            return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
        };

        let description = event.description || '';
        if (event.meetingUrl) {
            description += `\\n\\nJoin Online: ${event.meetingUrl}`;
            if (event.meetingId) description += `\\nMeeting ID: ${event.meetingId}`;
            if (event.meetingPassword) description += `\\nPassword: ${event.meetingPassword}`;
        }

        const ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Independent Federation for Safeguarding//NONSGML Event//EN
BEGIN:VEVENT
UID:${eventId}@ifs-safeguarding.co.uk
DTSTAMP:${formatDateForICal(new Date())}
DTSTART:${formatDateForICal(startDateTime)}
DTEND:${formatDateForICal(endDateTime)}
SUMMARY:${event.title}
DESCRIPTION:${description.replace(/\n/g, '\\n')}
LOCATION:${event.location || ''}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

        const blob = new Blob([ical], { type: 'text/calendar;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const generateOutlookUrl = () => {
        if (!event) return '#';

        const startDateTime = new Date(event.date);
        const endDateTime = new Date(event.date);
        
        if (event.startTime) {
            const [hours, minutes] = event.startTime.split(':');
            startDateTime.setHours(parseInt(hours), parseInt(minutes));
        }
        if (event.endTime) {
            const [hours, minutes] = event.endTime.split(':');
            endDateTime.setHours(parseInt(hours), parseInt(minutes));
        } else {
            endDateTime.setHours(startDateTime.getHours() + 1);
        }

        const formatDateForOutlook = (date) => {
            return date.toISOString();
        };

        let body = event.description || '';
        if (event.meetingUrl) {
            body += `\n\nJoin Online: ${event.meetingUrl}`;
            if (event.meetingId) body += `\nMeeting ID: ${event.meetingId}`;
            if (event.meetingPassword) body += `\nPassword: ${event.meetingPassword}`;
        }

        const params = new URLSearchParams({
            path: '/calendar/action/compose',
            rru: 'addevent',
            subject: event.title,
            startdt: formatDateForOutlook(startDateTime),
            enddt: formatDateForOutlook(endDateTime),
            body: body,
            location: event.location || ''
        });

        return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Event Not Found</h2>
                    <Button onClick={() => window.location.href = createPageUrl(eventType === 'community' ? 'CommunityEvents' : 'MemberMasterclasses')}>
                        Back to Events
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8 px-4 overflow-y-auto">
            <div className="max-w-3xl mx-auto w-full flex flex-col justify-center min-h-full">
                {/* Success Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-bounce">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-3">
                        Registration Confirmed! 🎉
                    </h1>
                    <p className="text-lg text-slate-600">
                        You're all set for this event. We've sent a confirmation email to <strong>{user?.email}</strong>
                    </p>
                </div>

                {/* Event Details Card */}
                <Card className="mb-6 shadow-xl border-0 overflow-hidden">
                    {event.imageUrl && (
                        <div className="relative h-48 bg-gradient-to-r from-purple-600 to-purple-700">
                            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover opacity-80" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        </div>
                    )}
                    
                    <CardContent className="p-8">
                        <div className="mb-6">
                            <Badge className="mb-3 bg-purple-100 text-purple-700">{event.type}</Badge>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">{event.title}</h2>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-slate-900">Date</p>
                                    <p className="text-slate-600">{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</p>
                                </div>
                            </div>

                            {(event.startTime || event.time) && (
                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-slate-900">Time</p>
                                        <p className="text-slate-600">{event.time || `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}`}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-slate-900">Location</p>
                                    <p className="text-slate-600">{event.location}</p>
                                </div>
                            </div>
                        </div>

                        {/* Meeting Details */}
                        {event.meetingUrl && (
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-6">
                                <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                                    <Link2 className="w-5 h-5" />
                                    Online Meeting Details
                                </h4>
                                <Button asChild size="sm" className="w-full mb-3 bg-blue-600 hover:bg-blue-700">
                                    <a href={event.meetingUrl} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        Join Meeting
                                    </a>
                                </Button>
                                <div className="text-xs text-blue-800 bg-blue-100 p-3 rounded border border-blue-200 space-y-1">
                                    <p className="break-all"><strong>Meeting Link:</strong> {event.meetingUrl}</p>
                                    {event.meetingId && (
                                        <p><strong>Meeting ID:</strong> {event.meetingId}</p>
                                    )}
                                    {event.meetingPassword && (
                                        <p><strong>Password:</strong> {event.meetingPassword}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Add to Calendar Section - Prominent */}
                <Card className="mb-6 shadow-2xl border-4 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                    <CardContent className="p-8">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-3">
                                <Calendar className="w-8 h-8 text-purple-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">
                                📅 Add to Your Calendar
                            </h3>
                            <p className="text-slate-600 text-lg">
                                Don't miss this event! Add it to your calendar now.
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Button
                                asChild
                                size="lg"
                                className="w-full h-auto py-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all"
                            >
                                <a href={generateGoogleCalendarUrl()} target="_blank" rel="noopener noreferrer">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-6 h-6" />
                                        <div className="text-left">
                                            <p className="font-bold">Google Calendar</p>
                                            <p className="text-xs opacity-90">Most popular</p>
                                        </div>
                                    </div>
                                </a>
                            </Button>

                            <Button
                                asChild
                                size="lg"
                                className="w-full h-auto py-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all"
                            >
                                <a href={generateOutlookUrl()} target="_blank" rel="noopener noreferrer">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-6 h-6" />
                                        <div className="text-left">
                                            <p className="font-bold">Outlook Calendar</p>
                                            <p className="text-xs opacity-90">Web version</p>
                                        </div>
                                    </div>
                                </a>
                            </Button>

                            <Button
                                onClick={generateICalFile}
                                size="lg"
                                className="w-full h-auto py-6 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg hover:shadow-xl transition-all sm:col-span-2"
                            >
                                <div className="flex items-center gap-3">
                                    <Download className="w-6 h-6" />
                                    <div className="text-left">
                                        <p className="font-bold">Download .ics File</p>
                                        <p className="text-xs opacity-90">Apple Calendar, Outlook desktop & more</p>
                                    </div>
                                </div>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        onClick={() => window.location.href = createPageUrl(eventType === 'community' ? 'CommunityEvents' : 'MemberMasterclasses')}
                        variant="outline"
                        className="flex-1"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Events
                    </Button>
                    <Button
                        onClick={() => window.location.href = createPageUrl('Dashboard')}
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                        Go to Dashboard
                    </Button>
                </div>
            </div>
        </div>
    );
}