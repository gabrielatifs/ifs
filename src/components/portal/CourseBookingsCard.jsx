import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, CalendarCheck, Download, Calendar, Clock, MapPin, Video, ExternalLink, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ifs } from '@/api/ifsClient';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const BookingCard = ({ booking }) => {
    const isConfirmed = booking.status === 'confirmed';
    const isPast = new Date(booking.selectedDate) < new Date(); // This is an approximation as selectedDate is string
    
    // Parse date for display if needed, but booking.selectedDate is already formatted text often
    // If it's formatted text, we can't easily check isPast without parsing. 
    // Assuming booking.selectedDate is "YYYY-MM-DD" or similar? 
    // Actually in CourseDetails it's saved as: selectedDate: selectedDateForBooking.datePatternDescription || formatDateRange(...)
    // So it's text. We can't easily check isPast. Let's assume upcoming for now or rely on status.
    
    return (
        <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-wrap gap-2">
                        <Badge variant={isConfirmed ? 'default' : 'secondary'} className={isConfirmed ? "bg-green-100 text-green-800 border-green-200" : ""}>
                            {booking.status === 'confirmed' ? 'Confirmed' : booking.status}
                        </Badge>
                        {booking.paymentMethod === 'credits' && (
                            <Badge variant="outline" className="text-purple-600 border-purple-300">
                                CPD Funded
                            </Badge>
                        )}
                    </div>
                </div>
                <CardTitle className="text-base font-bold text-slate-800 leading-tight line-clamp-2">
                    {booking.courseTitle}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow space-y-2 text-sm text-slate-500 p-4 pt-0">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0"/>
                    <span>{booking.selectedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 flex-shrink-0"/>
                    <span>{booking.selectedTime}</span>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0"/>
                    <span>{booking.selectedLocation}</span>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-2 flex-col items-start gap-2">
                <div className="flex flex-wrap gap-2 w-full items-center">
                    {booking.stripeInvoiceUrl && (
                        <Button asChild size="sm" variant="outline" className="flex-grow">
                            <a href={booking.stripeInvoiceUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="w-4 h-4 mr-2" />
                                Receipt
                            </a>
                        </Button>
                    )}
                    
                    <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700 flex-grow">
                        <Link to={createPageUrl(`CourseDetails?courseId=${booking.courseId}`)}>
                            <BookOpen className="w-4 h-4 mr-2" />
                            Course Details
                        </Link>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};

export default function CourseBookingsCard({ user, hideIfEmpty = false, limit = 0, mode = 'list' }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            if (!user?.email) return;

            try {
                const result = await ifs.entities.CourseBooking.list('-created_date');
                // Filter in frontend by userEmail
                const filtered = result.filter(booking => booking.userEmail === user.email);
                setBookings(filtered || []);
            } catch (error) {
                console.error("Error fetching course bookings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [user?.email]);

    if (loading) {
        if (hideIfEmpty) return null;
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Course Bookings</CardTitle>
                    <CardDescription>Your upcoming and past training sessions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (hideIfEmpty && bookings.length === 0) {
        return null;
    }

    const displayBookings = limit > 0 ? bookings.slice(0, limit) : bookings;

    if (mode === 'grid') {
        return (
            <div>
                {bookings.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <CalendarCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No courses booked</h3>
                        <p className="text-sm text-gray-500 mb-4">You haven't booked any training courses yet.</p>
                        <Button asChild>
                            <Link to={createPageUrl('CPDTraining')}>
                                Browse Training
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">My Courses ({bookings.length})</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {displayBookings.map((booking) => (
                                <BookingCard key={booking.id} booking={booking} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    }

    // List mode (original design)
    return (
        <Card>
            <CardHeader>
                <CardTitle>Course Bookings</CardTitle>
                <CardDescription>Your upcoming and past training sessions.</CardDescription>
            </CardHeader>
            <CardContent>
                {bookings.length > 0 ? (
                    <div className="space-y-3">
                        {displayBookings.map((booking) => (
                            <div key={booking.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-purple-600 flex-shrink-0">
                                        <CalendarCheck className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-semibold text-slate-900 text-base">{booking.courseTitle}</h4>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                                            <span className="flex items-center gap-1.5">
                                                {booking.selectedDate}
                                            </span>
                                            <span className="hidden sm:inline text-slate-300">•</span>
                                            <span className="flex items-center gap-1.5">
                                                {booking.selectedTime}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-3">
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 font-normal">
                                                {booking.selectedLocation}
                                            </Badge>
                                            <Badge className={booking.status === 'confirmed' ? 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}>
                                                {booking.status === 'confirmed' ? 'Confirmed' : booking.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:gap-2 pl-16 sm:pl-0 border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0 mt-2 sm:mt-0">
                                    <div className="text-right">
                                        {booking.paymentMethod === 'credits' ? (
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs text-slate-500 font-medium">Paid</span>
                                                <span className="font-semibold text-purple-700 text-lg">{booking.creditsUsed} CPD Hours</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs text-slate-500 font-medium">Paid</span>
                                                <span className="font-semibold text-slate-900 text-lg">£{((booking.gbpAmount || 0) / 100).toFixed(2)}</span>
                                            </div>
                                        )}
                                        {booking.paymentMethod === 'partial' && (
                                            <p className="text-xs text-slate-500">
                                                + {booking.creditsUsed} CPD Hours
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center">
                                         {booking.stripeInvoiceUrl ? (
                                            <Button variant="outline" size="sm" className="h-9 px-4 text-xs font-medium bg-white hover:bg-slate-50 border-slate-200" asChild>
                                                <a href={booking.stripeInvoiceUrl} target="_blank" rel="noopener noreferrer">
                                                    <Download className="w-3.5 h-3.5 mr-2 text-slate-500" />
                                                    Receipt
                                                </a>
                                            </Button>
                                        ) : (booking.gbpAmount > 0 || booking.paymentMethod === 'gbp') && (
                                            <Button variant="outline" size="sm" className="h-9 px-4 text-xs font-medium opacity-50 cursor-not-allowed bg-slate-50" disabled title="Receipt not available">
                                                <Download className="w-3.5 h-3.5 mr-2" />
                                                Receipt
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-slate-500 text-center py-4">You haven't booked any courses yet.</p>
                )}
            </CardContent>
        </Card>
    );
}