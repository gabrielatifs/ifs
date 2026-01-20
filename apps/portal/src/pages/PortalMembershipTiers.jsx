import React, { useState, useEffect } from 'react';
import { ifs } from '@ifs/shared/api/ifsClient';
import { useQuery } from '@tanstack/react-query';
import { User } from '@ifs/shared/api/entities';
import { createPageUrl } from '@ifs/shared/utils';
import PortalSidebar from '../components/portal/PortalSidebar';
import PortalHeader from '../components/portal/PortalHeader';
import { useUser } from '@ifs/shared/components/providers/UserProvider';
import LoginPrompt from '../components/portal/LoginPrompt';
import { createCheckout } from '@ifs/shared/api/functions';
import { cancelSubscription } from '@ifs/shared/api/functions';
import { reactivateSubscription } from '@ifs/shared/api/functions';
import { getInvoices } from '@ifs/shared/api/functions';
import { getSubscriptionDetails } from '@ifs/shared/api/functions';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@ifs/shared/components/ui/card';
import { Button } from '@ifs/shared/components/ui/button';
import { Badge } from '@ifs/shared/components/ui/badge';
import {
    Coins,
    TrendingUp,
    TrendingDown,
    Loader2,
    RefreshCw,
    CheckCircle,
    Crown,
    ArrowRight,
    Info,
    XCircle,
    Calendar,
    FileText,
    Download,
    ExternalLink,
    Receipt
} from 'lucide-react';
import { format, addMonths } from 'date-fns';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@ifs/shared/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@ifs/shared/components/ui/alert-dialog";
import { useToast } from "@ifs/shared/components/ui/use-toast";
import { Toaster } from "@ifs/shared/components/ui/toaster";
import CourseBookingsCard from '../components/portal/CourseBookingsCard';

export default function PortalMembershipTiers() {
    const { user, loading, refreshUser } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [isCanceling, setIsCanceling] = useState(false);
    const [isReactivating, setIsReactivating] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (user && !user.onboarding_completed && !user.isUnclaimed) {
            window.location.href = createPageUrl('Onboarding');
            return;
        }
    }, [user]);

    const { data: transactions, isLoading: isLoadingTransactions, refetch } = useQuery({
        queryKey: ['cpdTransactions', user?.id],
        queryFn: async () => {
            const txns = await ifs.entities.CreditTransaction.filter(
                { userId: user.id },
                '-created_date'
            );
            return txns;
        },
        enabled: !!user && (user.membershipType === 'Full' || user.membershipType === 'Associate'),
    });

    const { data: invoicesData, isLoading: isLoadingInvoices, refetch: refetchInvoices } = useQuery({
        queryKey: ['invoices', user?.id],
        queryFn: async () => {
            const { data } = await getInvoices();
            return data.invoices || [];
        },
        enabled: !!user && user.membershipType === 'Full' && !!user.stripeCustomerId,
    });

    const { data: subscription } = useQuery({
        queryKey: ['subscription', user?.id],
        queryFn: async () => {
            const { data } = await getSubscriptionDetails();
            return data.subscription || null;
        },
        enabled: !!user && user.membershipType === 'Full' && !!user.stripeSubscriptionId,
    });

    const handleUpgradeToFull = async () => {
        if (!user) return;

        setIsProcessing(true);
        try {
            const currentUrl = window.location.href;
            const data = await createCheckout({
                priceId: 'price_1STErADJm5OJGimXcBgvYoYn',
                successUrl: `${currentUrl}?payment=success`,
                cancelUrl: `${currentUrl}?payment=canceled`
            });

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (error) {
            console.error('Error selecting plan:', error);
            toast({
                title: "Error",
                description: "Could not start checkout process. Please try again.",
                variant: "destructive"
            });
            setIsProcessing(false);
        }
    };

    const handleCancelSubscription = async () => {
        setIsCanceling(true);
        try {
            const { data } = await cancelSubscription();
            
            if (data.success) {
                toast({
                    title: "Subscription Canceled",
                    description: `Your subscription will remain active until ${format(new Date(data.cancelAt), 'MMM d, yyyy')}`,
                });
                await refreshUser();
            } else {
                throw new Error(data.error || 'Failed to cancel subscription');
            }
        } catch (error) {
            console.error('Error canceling subscription:', error);
            toast({
                title: "Error",
                description: error.message || "Could not cancel subscription. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsCanceling(false);
        }
    };

    const handleReactivateSubscription = async () => {
        setIsReactivating(true);
        try {
            const { data } = await reactivateSubscription();
            
            if (data.success) {
                toast({
                    title: "Subscription Reactivated",
                    description: "Your subscription has been reactivated successfully.",
                });
                await refreshUser();
            } else {
                throw new Error(data.error || 'Failed to reactivate subscription');
            }
        } catch (error) {
            console.error('Error reactivating subscription:', error);
            toast({
                title: "Error",
                description: error.message || "Could not reactivate subscription. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsReactivating(false);
        }
    };

    if (loading) {
        return null;
    }

    if (isProcessing) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
                    <p className="text-lg text-slate-600">Redirecting to checkout...</p>
                </div>
            </div>
        );
    }

    const filteredTransactions = transactions?.filter(txn => {
        if (filterType === 'all') return true;
        return txn.transactionType === filterType;
    }) || [];

    const stats = user ? {
        totalEarned: user.totalCpdEarned || 0,
        totalSpent: user.totalCpdSpent || 0,
        currentBalance: user.cpdHours || 0,
    } : null;

    const showCpd = user && (user.membershipType === 'Full' || user.membershipType === 'Associate');
    const isFullMember = user?.membershipType === 'Full';
    const isAssociate = user?.membershipType === 'Associate';
    const isCanceling_status = user?.stripeSubscriptionStatus === 'canceling';

    // Calculate next CPD allocation date
    const nextAllocationDate = user?.lastCpdAllocationDate 
        ? addMonths(new Date(user.lastCpdAllocationDate), 1)
        : null;

    return (
        <div className="flex h-screen bg-slate-50/30">
            <Toaster />
            <PortalSidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="PortalMembershipTiers" />
            <div className="flex-1 flex flex-col overflow-hidden">
                <PortalHeader setSidebarOpen={setSidebarOpen} user={user} />
                <main className="flex-1 overflow-y-auto p-6 md:p-8 pb-20 md:pb-8">
                    <div className="max-w-5xl mx-auto space-y-6">
                        
                        {user ? (
                            <>
                                {/* Simple Header */}
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900">Membership</h1>
                                    <p className="text-slate-600 mt-1">Manage your membership and CPD hours</p>
                                </div>

                                {/* Membership Overview Card */}
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex flex-wrap items-center gap-6">
                                            <div>
                                                <div className="text-sm text-slate-500 mb-1">Membership</div>
                                                <div className="text-xl font-bold text-slate-900">{user.membershipType} Member</div>
                                            </div>
                                            <div className="h-10 w-px bg-slate-200 hidden sm:block" />
                                            <div>
                                                <div className="text-sm text-slate-500 mb-1">Status</div>
                                                <Badge className={`${
                                                    user.membershipStatus === 'active' 
                                                        ? isCanceling_status ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                } font-semibold`}>
                                                    {isCanceling_status ? 'Canceling' : user.membershipStatus}
                                                </Badge>
                                            </div>
                                            {isFullMember && user.subscriptionStartDate && (
                                                <>
                                                    <div className="h-10 w-px bg-slate-200 hidden sm:block" />
                                                    <div>
                                                        <div className="text-sm text-slate-500 mb-1">Member Since</div>
                                                        <div className="font-semibold text-slate-900">
                                                            {format(new Date(user.subscriptionStartDate), 'MMM yyyy')}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                            {isFullMember && subscription?.trial_end && (
                                                <>
                                                    <div className="h-10 w-px bg-slate-200 hidden sm:block" />
                                                    <div>
                                                        <div className="text-sm text-slate-500 mb-1">Free Until</div>
                                                        <div className="font-semibold text-purple-600">
                                                            {format(new Date(subscription.trial_end * 1000), 'MMM d, yyyy')}
                                                        </div>
                                                    </div>
                                                    <div className="h-10 w-px bg-slate-200 hidden sm:block" />
                                                    <div>
                                                        <div className="text-sm text-slate-500 mb-1">First Charge</div>
                                                        <div className="font-semibold text-slate-900">
                                                            {format(new Date(subscription.trial_end * 1000), 'MMM d, yyyy')}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                            {isFullMember && subscription && !subscription.trial_end && subscription.current_period_end && (
                                                <>
                                                    <div className="h-10 w-px bg-slate-200 hidden sm:block" />
                                                    <div>
                                                        <div className="text-sm text-slate-500 mb-1">Next Billing</div>
                                                        <div className="font-semibold text-slate-900">
                                                            {format(new Date(subscription.current_period_end * 1000), 'MMM d, yyyy')}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Canceling Banner */}
                                {isCanceling_status && isFullMember && (
                                    <Card className="border-amber-300 bg-amber-50">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Info className="w-5 h-5 text-amber-600" />
                                                        <h3 className="font-semibold text-slate-900">Subscription Ending Soon</h3>
                                                    </div>
                                                    <p className="text-sm text-slate-700 mb-1">
                                                        Your subscription will cancel, but you'll have access until your billing period ends.
                                                    </p>
                                                    <p className="text-sm text-slate-600">
                                                        Changed your mind? You can reactivate anytime before it expires.
                                                    </p>
                                                </div>
                                                <Button 
                                                    onClick={handleReactivateSubscription} 
                                                    disabled={isReactivating}
                                                    variant="outline"
                                                    className="flex-shrink-0"
                                                >
                                                    {isReactivating ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                            Reactivating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="w-4 h-4 mr-2" />
                                                            Reactivate
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Upgrade Banner for Associates */}
                                {isAssociate && (
                                    <Card className="border-purple-200 bg-purple-50">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Crown className="w-5 h-5 text-purple-600" />
                                                        <h3 className="font-semibold text-slate-900">Upgrade to Full Membership</h3>
                                                    </div>
                                                    <p className="text-sm text-slate-700 mb-2">
                                                        Get 1 CPD hour monthly, 10% discounts, full masterclass access, and more.
                                                    </p>
                                                    <p className="text-sm font-semibold text-slate-900 mb-3">£20/month or £240/year</p>
                                                    <div className="flex items-start gap-2 bg-white/50 rounded-lg p-3 border border-purple-200">
                                                        <Receipt className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                                                        <p className="text-xs text-slate-700">
                                                            <strong>Organisation reimbursement:</strong> Invoices sent automatically. Forward to your employer for reimbursement.
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button onClick={handleUpgradeToFull} className="flex-shrink-0">
                                                    Upgrade
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Subscription Management - Full Members Only */}
                                {isFullMember && user.stripeSubscriptionId && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Subscription Management</CardTitle>
                                            <CardDescription>Manage your Full Membership subscription</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {/* Next CPD Allocation */}
                                            {!isCanceling_status && nextAllocationDate && (
                                                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                                                    <div className="flex items-center gap-3">
                                                        <Calendar className="w-5 h-5 text-green-600" />
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-900">Next CPD Allocation</p>
                                                            <p className="text-sm text-slate-600">
                                                                {format(new Date(nextAllocationDate), 'MMMM d, yyyy')} - {user.monthlyCpdHours || 1} hour{(user.monthlyCpdHours || 1) !== 1 ? 's' : ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Cancel Subscription Button */}
                                            {!isCanceling_status && (
                                                <div>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full">
                                                                <XCircle className="w-4 h-4 mr-2" />
                                                                Cancel Subscription
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Cancel Your Subscription?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Your subscription will remain active until the end of your current billing period. 
                                                                    You'll keep all your CPD hours and access until then. You can reactivate anytime before it expires.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={handleCancelSubscription}
                                                                    disabled={isCanceling}
                                                                    className="bg-red-600 hover:bg-red-700"
                                                                >
                                                                    {isCanceling ? (
                                                                        <>
                                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                            Canceling...
                                                                        </>
                                                                    ) : (
                                                                        'Cancel Subscription'
                                                                    )}
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* CPD Hours Section */}
                                {showCpd && (
                                    <>
                                        {/* CPD Balance Card */}
                                        <Card className="border-purple-200">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="flex items-center gap-2">
                                                    <Coins className="w-5 h-5 text-purple-600" />
                                                    CPD Hours
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex flex-wrap items-end gap-8 mb-4">
                                                    <div>
                                                        <div className="text-4xl font-bold text-purple-600">
                                                            {stats.currentBalance.toFixed(1)}
                                                        </div>
                                                        <div className="text-sm text-slate-500">Current Balance</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-2xl font-semibold text-slate-700">
                                                            {stats.totalEarned.toFixed(1)}
                                                        </div>
                                                        <div className="text-sm text-slate-500 flex items-center gap-1">
                                                            <TrendingUp className="w-3 h-3" /> Total Earned
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-2xl font-semibold text-slate-700">
                                                            {stats.totalSpent.toFixed(1)}
                                                        </div>
                                                        <div className="text-sm text-slate-500 flex items-center gap-1">
                                                            <TrendingDown className="w-3 h-3" /> Total Spent
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                                                    <p className="mb-1"><strong>1 CPD hour = £20 training value.</strong> Use for accredited courses only.</p>
                                                    <p className="text-slate-500">Hours never expire. {isFullMember && 'Full Members receive 1 hour monthly.'}</p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Transaction History */}
                                        <Card>
                                            <CardHeader className="border-b">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <CardTitle>Transaction History</CardTitle>
                                                        <CardDescription>Your CPD activity</CardDescription>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Select value={filterType} onValueChange={setFilterType}>
                                                            <SelectTrigger className="w-[140px]">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="all">All</SelectItem>
                                                                <SelectItem value="allocation">Earned</SelectItem>
                                                                <SelectItem value="spent">Spent</SelectItem>
                                                                <SelectItem value="refund">Refunds</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => refetch()}
                                                            disabled={isLoadingTransactions}
                                                        >
                                                            <RefreshCw className={`w-4 h-4 ${isLoadingTransactions ? 'animate-spin' : ''}`} />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-0">
                                                {isLoadingTransactions ? (
                                                    <div className="flex items-center justify-center py-12">
                                                        <Loader2 className="w-5 h-5 animate-spin text-slate-400 mr-2" />
                                                        <span className="text-slate-600">Loading...</span>
                                                    </div>
                                                ) : filteredTransactions.length === 0 ? (
                                                    <div className="text-center py-12">
                                                        <Coins className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                                        <p className="text-slate-600 mb-1">No transactions yet</p>
                                                        <p className="text-sm text-slate-500">
                                                            Your CPD activity will appear here
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="divide-y">
                                                        {filteredTransactions.slice(0, 20).map((txn) => (
                                                            <div
                                                                key={txn.id}
                                                                className="flex items-center justify-between p-4 hover:bg-slate-50"
                                                            >
                                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                    <div className={`p-2 rounded-lg ${
                                                                        txn.transactionType === 'allocation' ? 'bg-green-100' :
                                                                        txn.transactionType === 'spent' ? 'bg-blue-100' :
                                                                        'bg-amber-100'
                                                                    }`}>
                                                                        {txn.transactionType === 'allocation' ? (
                                                                            <TrendingUp className="w-4 h-4 text-green-600" />
                                                                        ) : txn.transactionType === 'spent' ? (
                                                                            <TrendingDown className="w-4 h-4 text-blue-600" />
                                                                        ) : (
                                                                            <RefreshCw className="w-4 h-4 text-amber-600" />
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-medium text-slate-900 truncate">
                                                                            {txn.description}
                                                                        </p>
                                                                        <p className="text-sm text-slate-500">
                                                                            {format(new Date(txn.created_date), 'MMM d, yyyy')}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right flex-shrink-0 ml-4">
                                                                    <div className={`text-lg font-semibold ${
                                                                        txn.amount > 0 ? 'text-green-600' : 'text-slate-900'
                                                                    }`}>
                                                                        {txn.amount > 0 && '+'}
                                                                        {txn.amount.toFixed(2)} hrs
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </>
                                )}

                                {/* Receipts & Invoices - Full Members Only */}
                                {isFullMember && user.stripeCustomerId && (
                                    <Card>
                                        <CardHeader className="border-b">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="flex items-center gap-2">
                                                    <FileText className="w-5 h-5 text-slate-500" />
                                                    Payment History
                                                </CardTitle>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => refetchInvoices()}
                                                    disabled={isLoadingInvoices}
                                                >
                                                    <RefreshCw className={`w-4 h-4 ${isLoadingInvoices ? 'animate-spin' : ''}`} />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            {isLoadingInvoices ? (
                                                <div className="flex items-center justify-center py-8">
                                                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                                                </div>
                                            ) : !invoicesData || invoicesData.length === 0 ? (
                                                <div className="text-center py-8 text-slate-500 text-sm">
                                                    No invoices yet
                                                </div>
                                            ) : (
                                                <div className="divide-y">
                                                    {invoicesData.slice(0, 5).map((invoice) => (
                                                        <div
                                                            key={invoice.id}
                                                            className="flex items-center justify-between p-4 hover:bg-slate-50"
                                                        >
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-slate-900 truncate text-sm">
                                                                    {invoice.description}
                                                                </p>
                                                                <p className="text-xs text-slate-500">
                                                                    {format(new Date(invoice.date), 'MMM d, yyyy')}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                                                                <div className="text-right">
                                                                    <div className="font-semibold text-slate-900">
                                                                        £{invoice.amount.toFixed(2)}
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-1">
                                                                    {invoice.pdfUrl && (
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                                            <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer" download title="Download PDF">
                                                                                <Download className="w-4 h-4" />
                                                                            </a>
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        ) : (
                            <LoginPrompt
                                title="Manage Your Membership"
                                description="Sign in to view your membership status and CPD hours."
                                pageName="PortalMembershipTiers"
                            />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
