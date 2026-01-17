import React, { useState, useEffect } from 'react';
import { useUser } from '../providers/UserProvider';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function IncompleteApplicationModal() {
    const { user, loading } = useUser();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        console.log('[IncompleteApplicationModal] === useEffect TRIGGERED ===');
        
        if (loading) {
            console.log('[IncompleteApplicationModal] ❌ Exiting - still loading');
            return;
        }
        
        if (!user) {
            console.log('[IncompleteApplicationModal] ❌ Exiting - no user found');
            return;
        }

        console.log('[IncompleteApplicationModal] 📊 User Details:', {
            email: user.email,
            membershipStatus: user.membershipStatus,
            membershipType: user.membershipType,
            onboarding_completed: user.onboarding_completed,
            needsApplicationProcessing: user.needsApplicationProcessing
        });

        // SIMPLIFIED LOGIC: Show modal if user hasn't completed onboarding
        // This catches all cases: new signups, pending applications, etc.
        const hasIncompleteApplication = !user.onboarding_completed;

        console.log('[IncompleteApplicationModal] 🔍 Checking onboarding_completed:', user.onboarding_completed);
        console.log('[IncompleteApplicationModal] 🔍 hasIncompleteApplication?', hasIncompleteApplication);

        if (!hasIncompleteApplication) {
            console.log('[IncompleteApplicationModal] ✅ User has completed application - not showing modal');
            return;
        }

        // Check if user has dismissed the modal in this session
        const dismissedThisSession = sessionStorage.getItem('incompleteAppModalDismissed');
        console.log('[IncompleteApplicationModal] 💾 Session dismissal status:', dismissedThisSession);
        
        if (dismissedThisSession) {
            console.log('[IncompleteApplicationModal] 🚫 Modal was dismissed this session - not showing');
            return;
        }

        // Show modal after a short delay for better UX
        console.log('[IncompleteApplicationModal] ⏰ Setting timer to show modal in 1.5s');
        const timer = setTimeout(() => {
            console.log('[IncompleteApplicationModal] 🎉 OPENING MODAL NOW!');
            setIsOpen(true);
        }, 1500);

        return () => {
            console.log('[IncompleteApplicationModal] 🧹 Cleanup - clearing timer');
            clearTimeout(timer);
        };
    }, [user, loading]);

    const handleContinue = () => {
        console.log('[IncompleteApplicationModal] 👆 Continue button clicked');
        window.location.href = createPageUrl('Onboarding');
    };

    const handleDismiss = () => {
        console.log('[IncompleteApplicationModal] 👆 Dismiss button clicked');
        sessionStorage.setItem('incompleteAppModalDismissed', 'true');
        setIsOpen(false);
    };

    console.log('[IncompleteApplicationModal] 🎨 Rendering with isOpen:', isOpen);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-purple-600" />
                        </div>
                        <DialogTitle className="text-xl">Complete Your Application</DialogTitle>
                    </div>
                    <DialogDescription className="text-base leading-relaxed">
                        You're almost there! Finish your membership application to unlock access to:
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-4">
                    <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2" />
                        <p className="text-sm text-gray-600">Expert-led workshops and training sessions</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2" />
                        <p className="text-sm text-gray-600">Professional networking opportunities</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2" />
                        <p className="text-sm text-gray-600">Exclusive member resources and benefits</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2" />
                        <p className="text-sm text-gray-600">Access to the jobs board</p>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={handleDismiss}
                        className="w-full sm:w-auto"
                    >
                        Maybe Later
                    </Button>
                    <Button
                        onClick={handleContinue}
                        className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
                    >
                        Complete Application
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}