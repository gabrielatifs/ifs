import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, User, Calendar, Download, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";

export default function CommunityEventSignupsSheet({ open, onOpenChange, event, communityEventSignups = [] }) {
    const [signups, setSignups] = useState([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (open && event) {
            const filteredSignups = communityEventSignups.filter(s => s.eventId === event.id);
            setSignups(filteredSignups);
        }
    }, [open, event, communityEventSignups]);

    const exportToCSV = () => {
        if (signups.length === 0) {
            toast({
                title: "No Data",
                description: "There are no signups to export.",
                variant: "destructive"
            });
            return;
        }

        const headers = ['Name', 'Email', 'Registration Date', 'Notes'];
        const rows = signups.map(signup => [
            signup.userName,
            signup.userEmail,
            format(new Date(signup.created_date), 'dd/MM/yyyy HH:mm'),
            signup.notes || 'N/A'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}_signups.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();

        toast({
            title: "Export Successful",
            description: "Signups have been exported to CSV."
        });
    };

    if (!event) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-2xl overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Event Registrations</SheetTitle>
                    <SheetDescription>
                        View all members registered for this event
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-4">
                    {/* Event Info */}
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <h3 className="font-semibold text-slate-900 mb-2">{event.title}</h3>
                        <div className="space-y-1 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">{event.type}</Badge>
                                {event.maxParticipants && (
                                    <Badge className="bg-blue-100 text-blue-700">
                                        {signups.length} / {event.maxParticipants} participants
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    {signups.length > 0 && (
                        <div className="flex justify-end">
                            <Button onClick={exportToCSV} variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Export to CSV
                            </Button>
                        </div>
                    )}

                    {/* Signups List */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-slate-900">
                            Registered Members ({signups.length})
                        </h4>

                        {signups.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-600">No registrations yet</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {signups.map((signup) => (
                                    <div
                                        key={signup.id}
                                        className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <User className="w-4 h-4 text-slate-400" />
                                                    <span className="font-medium text-slate-900">{signup.userName}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    <a href={`mailto:${signup.userEmail}`} className="hover:underline">
                                                        {signup.userEmail}
                                                    </a>
                                                </div>
                                                <div className="mt-2 text-xs text-slate-500">
                                                    Registered: {format(new Date(signup.created_date), 'MMM d, yyyy @ HH:mm')}
                                                </div>
                                                {signup.notes && (
                                                    <div className="mt-2 p-2 bg-slate-50 rounded text-xs text-slate-600">
                                                        <strong>Notes:</strong> {signup.notes}
                                                    </div>
                                                )}
                                                {signup.zoomJoinUrl && (
                                                    <div className="mt-2">
                                                        <a
                                                            href={signup.zoomJoinUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                                        >
                                                            <ExternalLink className="w-3 h-3" />
                                                            Zoom Join URL
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}