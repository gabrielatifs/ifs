import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Building2, Loader2, CheckCircle } from 'lucide-react';
import { ifs } from '@/api/ifsClient';
import { useToast } from '@/components/ui/use-toast';
import { createPageUrl } from '@/utils';
import { customLoginWithRedirect } from '../utils/auth';

export default function AcceptInviteModal({ open, onClose, invite, user }) {
    const [accepting, setAccepting] = useState(false);
    const { toast } = useToast();

    const handleAccept = async () => {
        setAccepting(true);
        
        // If user is not logged in (new user flow), store invite and redirect to login
        if (!user) {
            console.log('[AcceptInviteModal] ✅ User accepted invite, storing invite ID and redirecting to auth');
            // Store invite ID so it persists through auth flow
            sessionStorage.setItem('pending_invite_id', invite.id);
            // Redirect to auth, which will come back to Onboarding after registration
            const onboardingUrl = createPageUrl('Onboarding') + `?intent=associate&invite=${invite.id}`;
            ifs.auth.redirectToLogin(onboardingUrl);
            return;
        }
        
        // Existing user flow
        try {
            const { data } = await ifs.functions.invoke('acceptInvite', {
                inviteId: invite.id
            });

            if (!data.success) {
                throw new Error(data.error || 'Failed to accept invite');
            }

            // Set session flag for welcome message
            sessionStorage.setItem('just_joined_org', 'true');
            sessionStorage.setItem('org_name', data.organisationName);

            toast({
                title: "Invitation Accepted",
                description: `You've joined ${data.organisationName}!`,
                duration: 5000
            });

            // Reload to update user context
            window.location.reload();
        } catch (error) {
            console.error('Failed to accept invitation:', error);
            toast({
                title: "Error",
                description: error.message || "Could not accept invitation. Please try again.",
                variant: "destructive"
            });
            setAccepting(false);
        }
    };

    const handleDecline = async () => {
        try {
            // Update the invite status to revoked
            await ifs.entities.OrgInvite.update(invite.id, {
                status: 'revoked'
            });

            toast({
                title: "Invitation Declined",
                description: "The invitation has been declined.",
            });

            onClose();
        } catch (error) {
            console.error('Failed to decline invitation:', error);
            toast({
                title: "Error",
                description: "Could not decline invitation. Please try again.",
                variant: "destructive"
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-purple-600" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-slate-900">
                            Organisation Invitation
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-slate-600 text-base leading-relaxed pt-2">
                        You've been invited by <strong>{invite.inviterName}</strong> to join <strong>{invite.organisationName}</strong> on the IfS platform.
                    </DialogDescription>
                </DialogHeader>

                <div className="my-6 p-6 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-slate-900">Organisation Access</p>
                                <p className="text-sm text-slate-600">Connect with your team members and colleagues</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-slate-900">Team Benefits</p>
                                <p className="text-sm text-slate-600">Access organisation features and shared resources</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-slate-900">Free Associate Membership</p>
                                <p className="text-sm text-slate-600">Join as an Associate Member at no cost</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        onClick={handleAccept}
                        disabled={accepting}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 h-11"
                    >
                        {accepting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Accepting...
                            </>
                        ) : (
                            <>Accept Invitation</>
                        )}
                    </Button>
                    <Button
                        onClick={handleDecline}
                        disabled={accepting}
                        variant="outline"
                        className="flex-1 border-slate-300 h-11"
                    >
                        Decline
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}