import React, { useState, useEffect } from 'react';
import { base44 } from '@ifs/shared/api/base44Client';
import { useUser } from '@ifs/shared/components/providers/UserProvider';
import OrgPortalSidebar from '@/components/portal/OrgPortalSidebar';
import PortalHeader from '@/components/portal/PortalHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@ifs/shared/components/ui/card";
import { Badge } from "@ifs/shared/components/ui/badge";
import { Button } from "@ifs/shared/components/ui/button";
import { Loader2, FileText, ExternalLink, CreditCard, Users, Calendar, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function OrgInvoices() {
    const { user, loading: userLoading } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [organisation, setOrganisation] = useState(null);

    useEffect(() => {
        if (user?.organisationId) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Fetch organisation
            const org = await base44.entities.Organisation.get(user.organisationId);
            setOrganisation(org);

            // Fetch all bookings that have an invoice ID
            const allBookings = await base44.entities.CourseBooking.list();
            
            // Filter bookings that belong to this organisation and have an invoice
            const orgBookings = allBookings.filter(booking => 
                booking.organisationName === org.name && 
                booking.stripeInvoiceId
            );

            console.log('Organisation bookings with invoices:', orgBookings);

            // Group bookings by invoice ID
            const groupedByInvoice = orgBookings.reduce((acc, booking) => {
                const invoiceId = booking.stripeInvoiceId;
                if (!acc[invoiceId]) {
                    acc[invoiceId] = [];
                }
                acc[invoiceId].push(booking);
                return acc;
            }, {});

            // Convert to array
            const invoiceGroups = Object.entries(groupedByInvoice)
                .map(([invoiceId, items]) => ({
                    invoiceId,
                    bookings: items,
                    status: items[0].status,
                    invoiceUrl: items[0].stripeInvoiceUrl,
                    createdDate: items[0].created_date,
                    courseTitle: items[0].courseTitle,
                    totalAmount: items.reduce((sum, b) => sum + (b.gbpAmount || 0), 0)
                }))
                .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

            console.log('Invoice groups:', invoiceGroups);
            setBookings(invoiceGroups);
        } catch (error) {
            console.error('Failed to fetch invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            pending: { label: 'Pending Payment', variant: 'secondary' },
            confirmed: { label: 'Paid', variant: 'default' },
            cancelled: { label: 'Cancelled', variant: 'destructive' }
        };
        const config = variants[status] || variants.pending;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    if (userLoading || loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <OrgPortalSidebar 
                user={user} 
                sidebarOpen={sidebarOpen} 
                setSidebarOpen={setSidebarOpen}
                currentPage="OrgInvoices"
            />

            <div className="flex-1 flex flex-col overflow-hidden">
                <PortalHeader 
                    toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    user={user}
                />

                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-slate-900">Invoices</h1>
                            <p className="text-slate-600 mt-2">
                                View and manage invoices for your organisation
                            </p>
                        </div>

                        {/* Invoices List */}
                        <div className="space-y-6">
                            {bookings.length === 0 ? (
                                <Card>
                                    <CardContent className="py-12 text-center">
                                        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                            No invoices yet
                                        </h3>
                                        <p className="text-slate-600">
                                            Course booking invoices will appear here
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                bookings.map((invoice) => (
                                    <Card key={invoice.invoiceId}>
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <CardTitle className="text-xl">
                                                            {invoice.courseTitle}
                                                        </CardTitle>
                                                        {getStatusBadge(invoice.status)}
                                                    </div>
                                                    <div className="text-sm text-slate-500 space-y-1">
                                                        <p className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4" />
                                                            Invoice created: {format(new Date(invoice.createdDate), 'dd MMM yyyy')}
                                                        </p>
                                                        <p className="flex items-center gap-2">
                                                            <Users className="w-4 h-4" />
                                                            {invoice.bookings.length} participant{invoice.bookings.length !== 1 ? 's' : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-slate-900">
                                                        £{(invoice.totalAmount / 100).toFixed(2)}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1">Total Amount</p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            {/* Participant Details */}
                                            <div className="mb-4">
                                                <h4 className="font-semibold text-slate-900 mb-3">Participants</h4>
                                                <div className="space-y-2">
                                                    {invoice.bookings.map((booking) => (
                                                        <div 
                                                            key={booking.id}
                                                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                                                        >
                                                            <div className="flex-1">
                                                                <p className="font-medium text-slate-900">
                                                                    {booking.userName}
                                                                </p>
                                                                <p className="text-sm text-slate-500">
                                                                    {booking.userEmail}
                                                                </p>
                                                                {booking.selectedDate && (
                                                                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                                                                        {booking.selectedDate && (
                                                                            <span className="flex items-center gap-1">
                                                                                <Calendar className="w-3 h-3" />
                                                                                {booking.selectedDate}
                                                                            </span>
                                                                        )}
                                                                        {booking.selectedTime && (
                                                                            <span className="flex items-center gap-1">
                                                                                <Clock className="w-3 h-3" />
                                                                                {booking.selectedTime}
                                                                            </span>
                                                                        )}
                                                                        {booking.selectedLocation && (
                                                                            <span className="flex items-center gap-1">
                                                                                <MapPin className="w-3 h-3" />
                                                                                {booking.selectedLocation}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-semibold text-slate-900">
                                                                    £{(booking.gbpAmount / 100).toFixed(2)}
                                                                </p>
                                                                {booking.creditsUsed > 0 && (
                                                                    <p className="text-xs text-green-600">
                                                                        -{booking.creditsUsed.toFixed(1)} CPD hrs
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            {invoice.status === 'pending' && invoice.invoiceUrl && (
                                                <div className="flex gap-3 pt-4 border-t">
                                                    <Button
                                                        onClick={() => window.open(invoice.invoiceUrl, '_blank')}
                                                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                                                    >
                                                        <CreditCard className="w-4 h-4 mr-2" />
                                                        Pay Invoice
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => window.open(invoice.invoiceUrl, '_blank')}
                                                    >
                                                        <ExternalLink className="w-4 h-4 mr-2" />
                                                        View Details
                                                    </Button>
                                                </div>
                                            )}
                                            {invoice.status === 'confirmed' && invoice.invoiceUrl && (
                                                <div className="pt-4 border-t">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => window.open(invoice.invoiceUrl, '_blank')}
                                                        className="w-full"
                                                    >
                                                        <FileText className="w-4 h-4 mr-2" />
                                                        View Receipt
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}