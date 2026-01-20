import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@ifs/shared/utils';
import { Button } from '@ifs/shared/components/ui/button';
import { Calendar, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardEventsSection({ events, upcomingBooking, loading }) {
    if (loading) {
        return (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                </div>
            </div>
        );
    }

    const hasContent = upcomingBooking || (events && events.length > 0);

    return (
        <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-slate-900">Events & Masterclasses</h2>
                    <span className="text-xs text-green-600 font-medium">Free for members</span>
                </div>
            </div>
            
            <div className="p-5 space-y-4">
                {/* User's Next Booked Session */}
                {upcomingBooking && (
                    <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                        <p className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-2">Your next session</p>
                        <h3 className="font-medium text-slate-900 mb-2">{upcomingBooking.eventTitle}</h3>
                        <p className="text-sm text-slate-600 mb-3">
                            {format(new Date(upcomingBooking.eventDate), "EEEE, d MMMM")}
                        </p>
                        <Link 
                            to={createPageUrl(`MasterclassDetails?id=${upcomingBooking.eventId}`)}
                            className="text-sm font-medium text-purple-600 hover:text-purple-700"
                        >
                            View details →
                        </Link>
                    </div>
                )}

                {/* Other Upcoming Events */}
                {events && events.length > 0 ? (
                    <div className="space-y-3">
                        {upcomingBooking && (
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide pt-1">
                                Upcoming
                            </p>
                        )}
                        {events.slice(0, 3).map(event => (
                            <Link
                                key={`${event.eventType}-${event.id}`}
                                to={createPageUrl(event.linkTo)}
                                className="flex items-start gap-4 p-3 -mx-3 rounded-lg hover:bg-slate-50 transition-colors group"
                            >
                                <div className="flex-shrink-0 w-12 text-center">
                                    <div className="text-xs font-medium text-slate-500 uppercase">
                                        {format(new Date(event.date), 'MMM')}
                                    </div>
                                    <div className="text-xl font-semibold text-slate-900">
                                        {format(new Date(event.date), 'd')}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-slate-900 line-clamp-1 group-hover:text-purple-700 transition-colors text-sm">
                                            {event.title}
                                        </h4>
                                        {event.isBooked && (
                                            <span className="flex-shrink-0 text-xs font-medium text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                                                Booked
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                        {event.startTime && (
                                            <span>{event.startTime}</span>
                                        )}
                                        {event.eventType === 'community' && event.type && (
                                            <span className="text-slate-400">{event.type}</span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : !upcomingBooking && (
                    <div className="text-center py-6">
                        <p className="text-sm text-slate-500 mb-3">No upcoming events</p>
                        <Button asChild variant="outline" size="sm">
                            <Link to={createPageUrl('MemberMasterclasses')}>Browse events</Link>
                        </Button>
                    </div>
                )}
            </div>
            
            {hasContent && (
                <div className="px-5 py-3 border-t border-slate-100 flex gap-4">
                    <Link to={createPageUrl('MemberMasterclasses')} className="text-sm text-slate-600 hover:text-slate-900">
                        All masterclasses →
                    </Link>
                    <Link to={createPageUrl('CommunityEvents')} className="text-sm text-slate-600 hover:text-slate-900">
                        Community events →
                    </Link>
                </div>
            )}
        </div>
    );
}