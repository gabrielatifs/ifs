import React, { useState, useEffect } from 'react';
import { ifs } from '@/api/ifsClient';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, Building2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

export default function InvitesSection({ user }) {
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(null);
    const [declining, setDeclining] = useState(null);
    const { toast } = useToast();

    const fetchInvites = async () => {
        try {
            console.log('[InvitesSection] 🔍 Fetching invites for user:', user.email, 'User ID:', user.id);
            
            // Use backend function with service role to bypass RLS
            const { data } = await ifs.functions.invoke('getMyInvites');
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch invites');
            }
            
            console.log('[InvitesSection] 📋 Invites received:', data.invites);
            
            // Sort by status and date
            const sorted = data.invites.sort((a, b) => {
                if (a.status === 'pending' && b.status !== 'pending') return -1;
                if (a.status !== 'pending' && b.status === 'pending') return 1;
                return new Date(b.created_date) - new Date(a.created_date);
            });
            
            setInvites(sorted);
        } catch (error) {
            console.error('[InvitesSection] ❌ Failed to fetch invites:', error);
            toast({
                title: "Error",
                description: "Could not load invitations.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvites();
    }, [user]);

    const handleAccept = async (invite) => {
        setAccepting(invite.id);
        try {
            const { data } = await ifs.functions.invoke('acceptInvite', {
                inviteId: invite.id
            });

            if (!data.success) {
                throw new Error(data.error || 'Failed to accept invite');
            }

            toast({
                title: "Invitation Accepted",
                description: `You've joined ${data.organisationName}!`,
                duration: 5000
            });

            // Refresh the page to update user context
            window.location.reload();
        } catch (error) {
            console.error('Failed to accept invitation:', error);
            toast({
                title: "Error",
                description: error.message || "Could not accept invitation. Please try again.",
                variant: "destructive"
            });
        } finally {
            setAccepting(null);
        }
    };

    const handleDecline = async (invite) => {
        setDeclining(invite.id);
        try {
            const { data } = await ifs.functions.invoke('declineInvite', {
                inviteId: invite.id
            });

            if (!data.success) {
                throw new Error(data.error || 'Failed to decline invite');
            }

            toast({
                title: "Invitation Declined",
                description: "The invitation has been declined.",
            });

            // Refresh the list
            await fetchInvites();
        } catch (error) {
            console.error('Failed to decline invitation:', error);
            toast({
                title: "Error",
                description: error.message || "Could not decline invitation. Please try again.",
                variant: "destructive"
            });
        } finally {
            setDeclining(null);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
            case 'accepted':
                return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>;
            case 'revoked':
                return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" />Declined</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Organisation Invitations</CardTitle>
                <CardDescription>View and manage invitations to join organisations.</CardDescription>
            </CardHeader>
            <CardContent>
                {invites.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                            <Mail className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Invitations</h3>
                        <p className="text-slate-600 text-sm">You don't have any organisation invitations at the moment.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {invites.map((invite) => (
                            <div key={invite.id} className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Building2 className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold text-slate-900">{invite.organisationName}</h4>
                                                {getStatusBadge(invite.status)}
                                            </div>
                                            <p className="text-sm text-slate-600 mb-2">
                                                Invited by <span className="font-medium">{invite.inviterName}</span>
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {format(new Date(invite.created_date), 'PPP')}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {invite.status === 'pending' && !user.organisationId && (
                                        <div className="flex gap-2 flex-shrink-0">
                                            <Button
                                                size="sm"
                                                onClick={() => handleAccept(invite)}
                                                disabled={accepting === invite.id || declining === invite.id}
                                                className="bg-purple-600 hover:bg-purple-700"
                                            >
                                                {accepting === invite.id ? (
                                                    <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Accepting...</>
                                                ) : (
                                                    'Accept'
                                                )}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDecline(invite)}
                                                disabled={accepting === invite.id || declining === invite.id}
                                            >
                                                {declining === invite.id ? (
                                                    <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Declining...</>
                                                ) : (
                                                    'Decline'
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                    
                                    {invite.status === 'pending' && user.organisationId && (
                                        <div className="text-sm text-slate-500 italic">
                                            Already in an organisation
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}