import React, { useState, useEffect } from 'react';
import { User } from '@ifs/shared/api/entities';
import { customLoginWithRedirect } from '../components/utils/auth';
import { createPageUrl } from '@ifs/shared/utils';
import PortalSidebar from '../components/portal/PortalSidebar';
import PortalHeader from '../components/portal/PortalHeader';
import { useUser } from '@ifs/shared/components/providers/UserProvider';
import SupervisionClaiming from '../components/portal/SupervisionClaiming';
import SupervisionEnquiry from '../components/portal/SupervisionEnquiry';
import PendingMembershipCard from '../components/portal/PendingMembershipCard';
import LoginPrompt from '../components/portal/LoginPrompt';
import { createCheckout } from '@ifs/shared/api/functions';
import { useToast } from "@ifs/shared/components/ui/use-toast";
import { Toaster } from "@ifs/shared/components/ui/toaster";
import { X, ArrowRight, Loader2, Award, Crown, Coins, ShieldCheck } from 'lucide-react';
import { Button } from '@ifs/shared/components/ui/button';

export default function SupervisionServices() {
    const { user, loading } = useUser();
    const { toast } = useToast();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showUpgradeBanner, setShowUpgradeBanner] = useState(true);
    const [isUpgrading, setIsUpgrading] = useState(false);

    useEffect(() => {
        if (!user && !loading) {
            // No need to auto-redirect here usually, but if this is a protected page:
            // The previous code was forcing login on page load if not logged in. 
            // Assuming we want to keep that behavior but use the correct function.
            // Passing window.location.href might be absolute, customLoginWithRedirect usually expects path.
            // But customLoginWithRedirect prepends APP_DOMAIN. If window.location.href is already absolute, it might double up.
            // Let's check customLoginWithRedirect implementation. It does `APP_DOMAIN + redirectPath`.
            // So we should pass the pathname + search + hash.
            const path = window.location.pathname + window.location.search + window.location.hash;
            customLoginWithRedirect(path);
            return;
        }
        if (user && !user.onboarding_completed && !user.isUnclaimed) {
            window.location.href = createPageUrl('Onboarding');
            return;
        }
    }, [user, loading]);

    const handleUpgradeToFull = async () => {
        setIsUpgrading(true);
        try {
            window.location.href = createPageUrl('MembershipPlans');
        } catch (error) {
            console.error('Failed to navigate to membership plans:', error);
            toast({
                title: "Error",
                description: "Could not open membership plans. Please try again.",
                variant: "destructive"
            });
            setIsUpgrading(false);
        }
    };

    const renderContent = () => {
        if (!user) {
            return <LoginPrompt title="Supervision Services" description="Sign in to access professional supervision and support services." pageName="SupervisionServices" />;
        }

        if (user.membershipType === 'Full') {
            return <SupervisionClaiming />;
        }

        if (user.membershipType === 'Associate' || user.membershipStatus === 'active') {
            return <SupervisionEnquiry />;
        }

        return <PendingMembershipCard />;
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50/30">
            <Toaster />
            <PortalSidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="SupervisionServices" />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <PortalHeader setSidebarOpen={setSidebarOpen} user={user} />
                
                <main className="flex-1 overflow-y-auto p-6 md:p-8 pb-20 md:pb-8">
                    <div className="max-w-5xl mx-auto">
                        {/* Upgrade Banner for Associate Members */}
                        {user?.membershipType === 'Associate' && user?.membershipStatus === 'active' && showUpgradeBanner && (
                            <div className="mb-8 relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                                <div className="absolute top-0 left-0 w-full h-1 bg-slate-900"></div>
                                <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-900">
                                                Professional Standard
                                            </span>
                                            <Crown className="w-5 h-5 stroke-[1.5] text-slate-900" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2 font-sans">Full Membership</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed font-light max-w-2xl mb-4">
                                            Upgrade to get 10% off all supervision sessions, 1 CPD hour monthly, and regulated status.
                                        </p>
                                        <div className="flex flex-wrap gap-4 text-sm text-slate-700 font-light">
                                            <span className="flex items-center gap-1.5">
                                                <Award className="w-4 h-4 text-slate-900" />
                                                10% Off Supervision
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Coins className="w-4 h-4 text-slate-900" />
                                                12 CPD Hours/Year
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <ShieldCheck className="w-4 h-4 text-slate-900" />
                                                Regulated Status
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-3 min-w-[200px]">
                                         <div className="text-right">
                                            <span className="text-lg font-bold text-slate-900">£20</span>
                                            <span className="text-slate-500 text-sm font-light">/month</span>
                                        </div>
                                        <Button 
                                            onClick={handleUpgradeToFull}
                                            disabled={isUpgrading}
                                            className="bg-slate-900 hover:bg-slate-800 text-white hover:shadow-lg text-xs font-semibold tracking-[0.1em] uppercase transition-all w-full md:w-auto"
                                        >
                                            {isUpgrading ? (
                                                <>
                                                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    Upgrade Now
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </>
                                            )}
                                        </Button>
                                        <button 
                                            onClick={() => setShowUpgradeBanner(false)}
                                            className="text-[10px] text-slate-400 uppercase tracking-wider hover:text-slate-600"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
}