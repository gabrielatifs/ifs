import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { User } from '@ifs/shared/api/entities';
import { createPageUrl } from '@ifs/shared/utils';
import { Button } from '@ifs/shared/components/ui/button';
import { Input } from '@ifs/shared/components/ui/input';
import { Label } from '@ifs/shared/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@ifs/shared/components/ui/card';
import { Loader2, Save, User as UserIcon, Upload, Bell, Crown, Coins, Calendar, FileText, Download, ExternalLink, CalendarCheck, ArrowRight, Gift, TrendingUp, TrendingDown } from 'lucide-react';
import { Switch } from '@ifs/shared/components/ui/switch';
import { UploadFile } from '@ifs/shared/api/integrations';
import PortalSidebar from '../components/portal/PortalSidebar';
import PortalHeader from '../components/portal/PortalHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ifs/shared/components/ui/tabs';

import { useToast } from "@ifs/shared/components/ui/use-toast";
import { Toaster } from "@ifs/shared/components/ui/toaster";
import { cancelSubscription } from '@ifs/shared/api/functions';
import { createCheckout } from '@ifs/shared/api/functions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@ifs/shared/components/ui/alert-dialog";
import { Badge } from '@ifs/shared/components/ui/badge';
import { useUser } from '@ifs/shared/components/providers/UserProvider';
import { UserProfile } from '@ifs/shared/api/entities/UserProfile';
import { ifs } from '@ifs/shared/api/ifsClient';
import CourseBookingsCard from '../components/portal/CourseBookingsCard';
import BookingManagement from '../components/portal/BookingManagement';
import InvitesSection from '../components/profile/InvitesSection';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

const UpgradeCard = ({ user }) => {
    const { toast } = useToast();
    const [upgrading, setUpgrading] = useState(false);

    const handleUpgrade = async (billingPeriod) => {
        setUpgrading(true);
        try {
            const productionOrigin = 'https://www.ifs-safeguarding.co.uk';
            const successUrl = `${productionOrigin}${createPageUrl('MyProfile')}?upgrade_success=true`;
            const cancelUrl = `${productionOrigin}${createPageUrl('MyProfile')}`;

            const data = await createCheckout({
                priceId: 'price_1STErADJm5OJGimXcBgvYoYn',
                successUrl,
                cancelUrl
            });

            if (data?.url) {
                window.location.href = data.url;
            } else {
                throw new Error('Failed to create checkout session');
            }
        } catch (error) {
            console.error('Upgrade error:', error);
            toast({
                title: "Upgrade Failed",
                description: "Could not start upgrade process. Please try again.",
                variant: "destructive"
            });
            setUpgrading(false);
        }
    };

    return (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-4 md:p-6">
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <Crown className="w-5 h-5 md:w-6 md:h-6 text-purple-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base md:text-lg font-bold text-slate-900 mb-2">Upgrade to Full Membership</h3>
                            <p className="text-xs md:text-sm text-slate-700 mb-3">
                                Get 1 CPD hour monthly, 10% discounts, voting rights, and more.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <Button 
                            onClick={() => handleUpgrade('monthly')}
                            disabled={upgrading}
                            className="bg-purple-600 hover:bg-purple-700 w-full sm:flex-1 text-sm"
                        >
                            {upgrading ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                            ) : (
                                <>£20/month</>
                            )}
                        </Button>
                        <Button 
                            onClick={() => handleUpgrade('annual')}
                            disabled={upgrading}
                            variant="outline"
                            className="border-purple-600 text-purple-600 hover:bg-purple-50 w-full sm:flex-1 text-sm"
                        >
                            {upgrading ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                            ) : (
                                <>£240/year</>
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const InvoicesCard = ({ user }) => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoices = async () => {
            if (!user?.stripeCustomerId) {
                setLoading(false);
                return;
            }

            try {
                const { data } = await ifs.functions.invoke('getInvoices');
                if (data?.invoices) {
                    setInvoices(data.invoices);
                }
            } catch (error) {
                console.error("Error fetching invoices:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInvoices();
    }, [user]);

    if (!user.stripeCustomerId) return null;

    return (
        <Card>
            <CardHeader className="px-4 md:px-6">
                <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    Payment History & Invoices
                </CardTitle>
                <CardDescription className="text-sm">Download your receipts and view billing details</CardDescription>
            </CardHeader>
            <CardContent className="px-4 md:px-6">
                {/* SUBSCRIPTION INFO ALWAYS VISIBLE FOR FULL MEMBERS */}
                {user.membershipType === 'Full' && (
                    <div className="mb-6 p-4 bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-lg">
                        <div className="flex items-start gap-3 mb-4">
                            <Calendar className="w-6 h-6 text-purple-600 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="text-base font-bold text-slate-900 mb-2">Subscription Status</h3>
                                {user.subscriptionTrialEnd && new Date(user.subscriptionTrialEnd) > new Date() ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge className="bg-green-100 text-green-800 border-green-300">FREE TRIAL ACTIVE</Badge>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <p className="text-slate-700">
                                                <strong>Trial Ends:</strong> {new Date(user.subscriptionTrialEnd).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                            <p className="text-slate-700">
                                                <strong>First Payment:</strong> £20.00 on trial end date
                                            </p>
                                            <p className="text-slate-700">
                                                <strong>Billing Cycle:</strong> Monthly (£20/month)
                                            </p>
                                        </div>
                                    </div>
                                ) : user.subscriptionCurrentPeriodEnd ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge className="bg-purple-100 text-purple-800 border-purple-300">ACTIVE SUBSCRIPTION</Badge>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <p className="text-slate-700">
                                                <strong>Next Billing Date:</strong> {new Date(user.subscriptionCurrentPeriodEnd).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                            <p className="text-slate-700">
                                                <strong>Amount:</strong> £20.00
                                            </p>
                                            <p className="text-slate-700">
                                                <strong>Billing Cycle:</strong> Monthly
                                            </p>
                                            <p className="text-slate-700">
                                                <strong>Includes:</strong> 1 CPD Hour per month (£20 training value)
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-600">Loading subscription details...</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* INVOICE LIST */}
                <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Past Invoices</h3>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                        </div>
                    ) : invoices.length > 0 ? (
                        <div className="space-y-3">
                            {invoices.map((invoice) => (
                                <div key={invoice.id} className="p-4 bg-white rounded-lg border-2 border-slate-200 hover:border-purple-300 transition-all">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-bold text-slate-900">{invoice.description}</p>
                                                {invoice.isTrial && (
                                                    <Badge className="bg-green-100 text-green-800 text-xs">Trial Invoice</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-600">
                                                {new Date(invoice.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-slate-900">
                                                {invoice.currency === 'GBP' ? '£' : invoice.currency}{invoice.amount.toFixed(2)}
                                            </p>
                                            <Badge className="bg-green-100 text-green-800 text-xs mt-1">Paid</Badge>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-3 border-t">
                                        {invoice.hostedUrl && (
                                            <Button variant="outline" size="sm" className="flex-1" asChild>
                                                <a href={invoice.hostedUrl} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="w-4 h-4 mr-2" />
                                                    View in Stripe
                                                </a>
                                            </Button>
                                        )}
                                        {invoice.pdfUrl && (
                                            <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700" asChild>
                                                <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer">
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Download PDF
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm text-slate-500">No invoices yet</p>
                            <p className="text-xs text-slate-400 mt-1">Your payment history will appear here</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

const SubscriptionCard = ({ user, onSubscriptionChange }) => {
    const { toast } = useToast();
    const [isCanceling, setIsCanceling] = useState(false);
    const [isReactivating, setIsReactivating] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);

    const handleCancelSubscription = async () => {
        setIsCanceling(true);
        try {
            const { data } = await cancelSubscription();
            if (data.success) {
                toast({
                    title: "Subscription Canceled",
                    description: "Your Full Membership will end at the end of your current billing period.",
                });
                onSubscriptionChange();
            } else {
                throw new Error(data.details || "Failed to cancel subscription.");
            }
        } catch (error) {
            console.error("Cancellation error:", error);
            toast({
                title: "Error",
                description: "Could not cancel your subscription. Please try again or contact support.",
                variant: "destructive",
            });
        } finally {
            setIsCanceling(false);
            setShowCancelDialog(false);
        }
    };

    const handleReactivateSubscription = async () => {
        setIsReactivating(true);
        try {
            const { data } = await ifs.functions.invoke('reactivateSubscription');
            if (data.success) {
                toast({
                    title: "Subscription Reactivated",
                    description: "Your Full Membership has been reactivated and will continue as normal.",
                });
                onSubscriptionChange();
            } else {
                throw new Error(data.error || "Failed to reactivate subscription.");
            }
        } catch (error) {
            console.error("Reactivation error:", error);
            toast({
                title: "Error",
                description: "Could not reactivate your subscription. Please try again or contact support.",
                variant: "destructive",
            });
        } finally {
            setIsReactivating(false);
        }
    };

    const isCanceled = user.stripeSubscriptionStatus === 'canceled';

    // Use Stripe's actual billing date
    const nextBillingDate = user.subscriptionCurrentPeriodEnd ? new Date(user.subscriptionCurrentPeriodEnd) : null;

    // Check if user is in trial period
    const isInTrial = user.subscriptionTrialEnd && new Date(user.subscriptionTrialEnd) > new Date();
    const trialEndDate = user.subscriptionTrialEnd ? new Date(user.subscriptionTrialEnd) : null;

    return (
        <>
            <Card>
                <CardHeader className="px-4 md:px-6">
                    <CardTitle className="text-lg md:text-xl">Subscription</CardTitle>
                    <CardDescription className="text-sm">Manage your IfS membership plan.</CardDescription>
                </CardHeader>
                <CardContent className="px-4 md:px-6">
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 p-3 md:p-4 border rounded-lg">
                            <div>
                                <p className="text-sm md:text-base font-semibold text-slate-800">Current Plan</p>
                                <p className="text-xs md:text-sm text-slate-600">{user.membershipType} Member</p>
                            </div>
                            <Badge variant={isCanceled ? "secondary" : "default"} className={`text-xs ${isCanceled ? "" : "bg-green-100 text-green-800"} w-fit`}>
                                {isCanceled ? "Cancellation Pending" : isInTrial ? "Active (Trial)" : "Active"}
                            </Badge>
                        </div>
                        {isInTrial && trialEndDate && (
                            <div className="p-3 md:p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg shadow-sm">
                                <div className="flex items-start gap-2 md:gap-3">
                                    <div className="p-1.5 md:p-2 bg-white rounded-full border-2 border-green-300 flex-shrink-0">
                                        <Gift className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm md:text-base font-bold text-green-900 mb-2">🎉 Free Trial Active</p>
                                        <div className="space-y-2">
                                            <div className="flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-1.5 flex-shrink-0"></div>
                                                <p className="text-xs md:text-sm text-green-800 leading-relaxed">
                                                    <span className="font-semibold">Trial ends:</span> {trialEndDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-1.5 flex-shrink-0"></div>
                                                <p className="text-xs md:text-sm text-green-800 leading-relaxed">
                                                    <span className="font-semibold">First payment:</span> Charged on trial end date
                                                </p>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-1.5 flex-shrink-0"></div>
                                                <p className="text-xs md:text-sm text-green-800 leading-relaxed">
                                                    <span className="font-semibold">First CPD hour:</span> Allocated on trial end date
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {!isCanceled && !isInTrial && nextBillingDate && (
                            <div className="p-3 md:p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2">
                                        <Coins className="w-4 h-4 md:w-5 md:h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-xs md:text-sm font-semibold text-slate-900 mb-1">Next Billing & CPD Allocation</p>
                                            <p className="text-xs md:text-sm text-slate-700">
                                                <span className="font-bold">{nextBillingDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="pl-6 space-y-1.5 text-xs text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                                            <span>Payment: £20</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                                            <span>1 CPD hour allocated (£20 training value)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {isCanceled && (
                            <div className="p-3 md:p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-xs md:text-sm leading-relaxed">
                                Your Full Membership benefits will expire at the end of your current billing period. You will then be downgraded to an Associate Member.
                            </div>
                        )}
                    </div>
                </CardContent>
                {!isCanceled && (
                    <CardFooter className="border-t pt-4 md:pt-6 px-4 md:px-6 flex-col sm:flex-row gap-3 sm:gap-0">
                        <p className="text-xs md:text-sm text-slate-600 text-center sm:text-left">Want to end your Full Membership?</p>
                        <Button 
                            variant="destructive" 
                            onClick={() => setShowCancelDialog(true)}
                            disabled={isCanceling}
                            className="w-full sm:w-auto text-sm sm:ml-auto"
                        >
                            {isCanceling ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Processing...</> : "Cancel Subscription"}
                        </Button>
                    </CardFooter>
                    )}
                    {isCanceled && (
                    <CardFooter className="border-t pt-4 md:pt-6 px-4 md:px-6 flex-col gap-3">
                        <Button 
                            onClick={handleReactivateSubscription}
                            disabled={isReactivating}
                            className="w-full bg-green-600 hover:bg-green-700 text-sm"
                        >
                            {isReactivating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Processing...</> : "Reactivate Subscription"}
                        </Button>
                        <p className="text-xs text-slate-500 text-center">Changed your mind? Reactivate to continue your Full Membership benefits.</p>
                    </CardFooter>
                    )}
                    </Card>

            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Your subscription will remain active until the end of your current billing period. You will lose access to Full Member benefits after that date and be downgraded to an Associate Member.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Go Back</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancelSubscription} className="bg-red-600 hover:bg-red-700">
                            Yes, Cancel Subscription
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

const RecentCpdTransactions = ({ userId }) => {
    const { data: transactions, isLoading } = useQuery({
        queryKey: ['recentCpdTransactions', userId],
        queryFn: async () => {
            const txns = await ifs.entities.CreditTransaction.list('-created_date', 5);
            return txns.filter(t => t.userId === userId);
        },
        enabled: !!userId,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
            </div>
        );
    }

    if (!transactions || transactions.length === 0) {
        return (
            <div className="text-center py-6">
                <p className="text-sm text-slate-500">No CPD transactions yet</p>
                <p className="text-xs text-slate-400 mt-1">Your CPD hours will appear here</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {transactions.map((txn) => (
                <div
                    key={txn.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-purple-200 transition-colors"
                >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`p-1.5 md:p-2 rounded-lg flex-shrink-0 ${
                            txn.transactionType === 'allocation' ? 'bg-green-100' :
                            txn.transactionType === 'spent' ? 'bg-red-100' :
                            'bg-blue-100'
                        }`}>
                            {txn.transactionType === 'allocation' ? (
                                <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-green-700" />
                            ) : (
                                <TrendingDown className="w-3 h-3 md:w-4 md:h-4 text-red-700" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs md:text-sm font-medium text-slate-900 truncate">
                                {txn.description}
                            </p>
                            <p className="text-xs text-slate-500">
                                {format(new Date(txn.created_date), 'MMM d, yyyy')}
                            </p>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                        <div className={`text-sm md:text-base font-bold ${
                            txn.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                            {txn.amount > 0 ? '+' : ''}{txn.amount}
                        </div>
                    </div>
                </div>
            ))}
            <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs mt-2"
                onClick={() => window.location.href = createPageUrl('MyCreditHistory')}
            >
                View Full History
                <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
        </div>
    );
};

export default function MyProfile() {
    const { user, loading, updateUserProfile, refreshUser, isViewingAs, actualAdmin, exitViewAs } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newProfileImage, setNewProfileImage] = useState(null);
    const [notificationPrefId, setNotificationPrefId] = useState(null);
    const { toast } = useToast();

    useEffect(() => {
        if (!user && !loading) {
            User.loginWithRedirect(window.location.href);
            return;
        }

        const isActiveMember = user?.membershipStatus === 'active' && (user?.membershipType === 'Associate' || user?.membershipType === 'Full');
        
        if (user && !user.onboarding_completed && !isActiveMember) {
            window.location.href = createPageUrl('Onboarding');
            return;
        }
    }, [user, loading]);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                displayName: user.displayName || '',
                organisationName: user.organisationName || user.organisation || '',
                organisationRole: user.organisationRole || '',
                sector: user.sector || '',
                subsector: user.subsector || '',
                safeguarding_role: user.safeguarding_role || '',
                email: user.email || '',
                profileImageUrl: user.profileImageUrl || '',
            }));

            // Fetch notification preferences
            const fetchPreferences = async () => {
                try {
                    const result = await ifs.entities.NotificationPreference.filter({ userId: user.id });
                    // Handle both array and paginated response
                    const prefs = Array.isArray(result) ? result : (result.data || []);
                    
                    if (prefs && prefs.length > 0) {
                        setNotificationPrefId(prefs[0].id);
                        setFormData(prev => ({ 
                            ...prev, 
                            weeklyJobAlerts: !!prefs[0].weeklyJobAlerts,
                            newsUpdates: prefs[0].newsUpdates !== false // Default to true if undefined
                        }));
                    } else {
                        setFormData(prev => ({ ...prev, weeklyJobAlerts: false, newsUpdates: true }));
                    }
                } catch (error) {
                    console.error("Error fetching notification preferences:", error);
                }
            };
            fetchPreferences();
        }
    }, [user]);

    useEffect(() => {
        let isMounted = true;

        const fetchOrganisationName = async () => {
            if (!user?.organisationId || user?.organisationName) {
                return;
            }

            try {
                const organisation = await ifs.entities.Organisation.get(user.organisationId);
                if (!isMounted || !organisation?.name) {
                    return;
                }

                setFormData(prev => (
                    prev.organisationName ? prev : { ...prev, organisationName: organisation.name }
                ));
            } catch (error) {
                console.error("Error fetching organisation name:", error);
            }
        };

        fetchOrganisationName();

        return () => {
            isMounted = false;
        };
    }, [user?.organisationId, user?.organisationName]);

    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setNewProfileImage(file);
            
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData(prev => ({ ...prev, profileImageUrl: event.target.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            let dataToSubmit = { ...formData };

            if (newProfileImage) {
                try {
                    toast({
                        title: "Uploading image...",
                        description: "Please wait while we upload your profile picture.",
                    });
                    
                    const uploadResult = await UploadFile({ file: newProfileImage });
                    console.log("Upload result:", uploadResult);
                    
                    if (!uploadResult.file_url) {
                        throw new Error("No file URL returned from upload");
                    }
                    
                    dataToSubmit.profileImageUrl = uploadResult.file_url;
                    console.log("Profile image uploaded successfully:", uploadResult.file_url);
                } catch (uploadError) {
                    console.error("Profile image upload failed:", uploadError);
                    toast({
                        title: "Image Upload Failed",
                        description: "Could not upload your profile picture. Please try again.",
                        variant: "destructive",
                    });
                    setIsSubmitting(false);
                    return;
                }
            }
            
            dataToSubmit.displayName = `${dataToSubmit.firstName || ''} ${dataToSubmit.lastName || ''}`.trim();
            
            // Update Notification Preferences
            try {
                const prefUpdateData = {
                    email: dataToSubmit.email || user.email,
                    weeklyJobAlerts: !!dataToSubmit.weeklyJobAlerts,
                    newsUpdates: !!dataToSubmit.newsUpdates
                };

                if (notificationPrefId) {
                    await ifs.entities.NotificationPreference.update(notificationPrefId, prefUpdateData);
                } else {
                    // Check one more time if it exists to avoid race conditions/duplicates
                    const existing = await ifs.entities.NotificationPreference.filter({ userId: user.id });
                    const existingPrefs = Array.isArray(existing) ? existing : (existing.data || []);
                    
                    if (existingPrefs.length > 0) {
                         await ifs.entities.NotificationPreference.update(existingPrefs[0].id, prefUpdateData);
                         setNotificationPrefId(existingPrefs[0].id);
                    } else {
                        const newPref = await ifs.entities.NotificationPreference.create({
                            userId: user.id,
                            ...prefUpdateData
                        });
                        setNotificationPrefId(newPref.id);
                    }
                }
            } catch (prefError) {
                console.error("Error updating notification preferences:", prefError);
                toast({
                    title: "Preference Update Failed",
                    description: "Could not save notification settings: " + prefError.message,
                    variant: "destructive",
                });
            }
            
            // Remove fields not belonging to User entity before submitting
            const { weeklyJobAlerts, newsUpdates, ...userProfileData } = dataToSubmit;
            
            console.log("Submitting profile data:", userProfileData);
            
            await updateUserProfile(userProfileData);
            
            setNewProfileImage(null);

            toast({
                title: "Profile Updated",
                description: "Your changes have been saved successfully.",
            });

        } catch (error) {
            console.error("Error updating profile:", error);
            toast({
                title: 'Update Failed',
                description: 'Could not save your changes. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return null;
    }

    if (!user) return null;

    const displayName = formData.displayName || `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 'User';

    return (
        <div className="flex h-screen bg-slate-50/30">
            <Toaster />
            <PortalSidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="MyProfile" />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <PortalHeader setSidebarOpen={setSidebarOpen} user={user} title="My Profile" />

                <main className="flex-1 overflow-y-auto p-6 md:p-8 pb-20 md:pb-8">
                    <div className="max-w-4xl mx-auto">
                        {isViewingAs && (
                             <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded-r-lg">
                                <p className="font-bold">Admin View</p>
                                <p>You are viewing this profile as an administrator. Any changes made will affect this user's account directly.</p>
                             </div>
                        )}
                        <div className="mb-6 md:mb-8">
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1 md:mb-2">My Profile & Settings</h1>
                            <p className="text-slate-600 text-sm md:text-lg">View and edit your personal information and manage your subscription.</p>
                        </div>

                        <Tabs defaultValue="profile" className="space-y-4 md:space-y-6">
                            <TabsList className="grid w-full grid-cols-4 gap-1 h-auto bg-slate-100 p-1 md:w-auto md:inline-flex">
                                <TabsTrigger value="profile" className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3 py-2">
                                    <UserIcon className="w-3 h-3 md:w-4 md:h-4" />
                                    <span className="hidden sm:inline">Profile</span>
                                </TabsTrigger>
                                <TabsTrigger value="membership" className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3 py-2">
                                    <Crown className="w-3 h-3 md:w-4 md:h-4" />
                                    <span className="hidden sm:inline">Member</span>
                                </TabsTrigger>
                                <TabsTrigger value="bookings" className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3 py-2">
                                    <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                                    <span className="hidden sm:inline">Bookings</span>
                                </TabsTrigger>
                                <TabsTrigger value="invites" className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3 py-2">
                                    <Bell className="w-3 h-3 md:w-4 md:h-4" />
                                    <span className="hidden sm:inline">Invites</span>
                                </TabsTrigger>
                            </TabsList>

                            {/* Profile Tab */}
                            <TabsContent value="profile" className="space-y-4 md:space-y-6">
                                <form onSubmit={handleSubmit}>
                                    <Card>
                                        <CardHeader className="px-4 md:px-6">
                                            <CardTitle className="text-lg md:text-xl">Personal Information</CardTitle>
                                            <CardDescription className="text-sm">Update your personal details and profile picture.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6 md:space-y-8 pt-4 md:pt-6 px-4 md:px-6">
                                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                                                <div className="relative flex-shrink-0">
                                                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 rounded-full flex items-center justify-center">
                                                        {formData.profileImageUrl ? (
                                                            <img src={formData.profileImageUrl} alt="Profile" className="w-full h-full object-cover rounded-full" />
                                                        ) : (
                                                            <UserIcon className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
                                                        )}
                                                    </div>
                                                    <Label htmlFor="profile-image-upload" className="absolute -bottom-1 -right-1 cursor-pointer bg-white p-2 rounded-full shadow border hover:bg-slate-50">
                                                        <Upload className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600" />
                                                    </Label>
                                                    <Input id="profile-image-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                                </div>
                                                <div className="text-center sm:text-left flex-1">
                                                    <h3 className="text-lg sm:text-xl font-bold text-slate-800">{displayName}</h3>
                                                    <p className="text-sm sm:text-base text-slate-500 break-all">{formData.email}</p>
                                                    <span className="inline-block mt-2 text-xs sm:text-sm font-semibold px-3 py-1 rounded-full bg-purple-100 text-purple-800">{user?.membershipType} Member</span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="firstName">First Name</Label>
                                                    <Input id="firstName" value={formData.firstName} onChange={(e) => handleFormChange('firstName', e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="lastName">Last Name</Label>
                                                    <Input id="lastName" value={formData.lastName} onChange={(e) => handleFormChange('lastName', e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="email">Email Address</Label>
                                                    <Input id="email" value={formData.email} disabled />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="organisationName">Organisation</Label>
                                                    <Input id="organisationName" value={formData.organisationName} onChange={(e) => handleFormChange('organisationName', e.target.value)} placeholder="Your school or company" />
                                                </div>
                                            </div>

                                            <div className="p-3 md:p-4 border rounded-lg bg-slate-50 space-y-4">
                                                <div className="flex items-start sm:items-center gap-3 md:gap-4">
                                                    <div className="p-1.5 md:p-2 bg-white rounded-full border shadow-sm flex-shrink-0">
                                                        <Bell className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <Label htmlFor="weekly-job-alerts" className="text-sm md:text-base font-semibold text-slate-900 cursor-pointer">Weekly Job Alerts</Label>
                                                        <p className="text-xs md:text-sm text-slate-500 mt-0.5">Receive a weekly summary of new job opportunities.</p>
                                                    </div>
                                                    <Switch
                                                        id="weekly-job-alerts"
                                                        checked={formData.weeklyJobAlerts}
                                                        onCheckedChange={(checked) => handleFormChange('weeklyJobAlerts', checked)}
                                                        className="flex-shrink-0"
                                                    />
                                                </div>
                                                <div className="flex items-start sm:items-center gap-3 md:gap-4 pt-4 border-t">
                                                    <div className="p-1.5 md:p-2 bg-white rounded-full border shadow-sm flex-shrink-0">
                                                        <Bell className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <Label htmlFor="news-updates" className="text-sm md:text-base font-semibold text-slate-900 cursor-pointer">News Updates</Label>
                                                        <p className="text-xs md:text-sm text-slate-500 mt-0.5">Receive emails about safeguarding news and service updates.</p>
                                                    </div>
                                                    <Switch
                                                        id="news-updates"
                                                        checked={formData.newsUpdates}
                                                        onCheckedChange={(checked) => handleFormChange('newsUpdates', checked)}
                                                        className="flex-shrink-0"
                                                    />
                                                </div>
                                            </div>

                                            {formData.firstName && formData.lastName && (
                                                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                                    <p className="text-xs md:text-sm text-purple-700">
                                                        <strong>Display Name:</strong> {displayName}
                                                    </p>
                                                    <p className="text-xs text-purple-600 mt-1">This is how your name will appear throughout the platform and on certificates.</p>
                                                </div>
                                            )}
                                            </CardContent>
                                            <CardFooter className="bg-slate-50/50 py-3 md:py-4 px-4 md:px-6 border-t flex-col sm:flex-row gap-2 sm:gap-0">
                                            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto sm:ml-auto">
                                                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Save className="w-4 h-4 mr-2" />}
                                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                            </CardFooter>
                                    </Card>
                                </form>
                            </TabsContent>

                            {/* Membership Tab */}
                            <TabsContent value="membership" className="space-y-4 md:space-y-6">
                                {/* Membership Overview */}
                                <Card className={user.stripeSubscriptionStatus === 'canceled' ? 'border-red-200' : ''}>
                                    {user.stripeSubscriptionStatus === 'canceled' && (
                                        <div className="bg-red-50 border-b border-red-200 p-3 md:p-4">
                                            <p className="text-sm font-semibold text-red-900">⚠️ Subscription Ending</p>
                                            <p className="text-xs text-red-700 mt-1">Your Full Membership will end on {user.subscriptionCurrentPeriodEnd ? new Date(user.subscriptionCurrentPeriodEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'the current period end'}. Reactivate below to continue.</p>
                                        </div>
                                    )}
                                    <CardContent className="p-4 md:p-6">
                                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:gap-6">
                                            <div>
                                                <div className="text-xs md:text-sm text-slate-500 mb-1">Membership</div>
                                                <div className="text-base md:text-xl font-bold text-slate-900">{user.membershipType} Member</div>
                                            </div>
                                            <div className="hidden sm:block h-10 w-px bg-slate-200" />
                                            <div>
                                                <div className="text-xs md:text-sm text-slate-500 mb-1">Status</div>
                                                <Badge className={`text-xs ${
                                                    user.stripeSubscriptionStatus === 'canceled' ? 'bg-red-100 text-red-700' :
                                                    user.membershipStatus === 'active' ? 'bg-green-100 text-green-700' : 
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {user.stripeSubscriptionStatus === 'canceled' ? 'Canceling' : user.membershipStatus}
                                                </Badge>
                                            </div>
                                            <div className="hidden sm:block h-10 w-px bg-slate-200" />
                                            <div>
                                                <div className="text-xs md:text-sm text-slate-500 mb-1">Sector</div>
                                                <div className="text-sm md:text-base font-medium text-slate-900 truncate">{formData.sector || 'N/A'}</div>
                                            </div>
                                            <div className="hidden sm:block h-10 w-px bg-slate-200" />
                                            <div className="col-span-2 sm:col-span-1">
                                                <div className="text-xs md:text-sm text-slate-500 mb-1">Role</div>
                                                <div className="text-sm md:text-base font-medium text-slate-900 truncate">{formData.safeguarding_role || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* CPD Hours Summary for Full Members */}
                                {user.membershipType === 'Full' && (
                                    <Card className="border-purple-200">
                                        <CardHeader className="pb-2 px-4 md:px-6">
                                            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                                                <Coins className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                                                CPD Hours
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="px-4 md:px-6">
                                            <div className="flex items-end gap-4 md:gap-8 mb-4">
                                                <div>
                                                    <div className="text-3xl md:text-4xl font-bold text-purple-600">
                                                        {(user.cpdHours || 0).toFixed(1)}
                                                    </div>
                                                    <div className="text-xs md:text-sm text-slate-500">Current Balance</div>
                                                </div>
                                            </div>
                                            
                                            {/* Show trial or subscription period status */}
                                            {user.subscriptionTrialEnd && new Date(user.subscriptionTrialEnd) > new Date() ? (
                                                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                    <p className="text-xs font-semibold text-green-900 mb-1">🎉 Trial Period</p>
                                                    <p className="text-xs text-green-700">
                                                        You're currently in your free trial. Your first CPD hour will be allocated when your trial ends on {new Date(user.subscriptionTrialEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                                    <p className="text-xs font-semibold text-purple-900 mb-1">Active Subscription</p>
                                                    <p className="text-xs text-purple-700">
                                                        You receive 1 CPD hour monthly (£20 training value per hour).
                                                    </p>
                                                </div>
                                            )}
                                            
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                                <p className="text-xs md:text-sm text-slate-600">Use CPD hours to book training courses at £20/hour value.</p>
                                                <Button asChild variant="outline" size="sm" className="w-full sm:w-auto text-xs md:text-sm">
                                                    <Link to={createPageUrl('PortalMembershipTiers')}>
                                                        View Details
                                                        <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-2" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Upgrade Banner for Associates */}
                                {user.membershipType === 'Associate' && (
                                    <div className="px-1">
                                        <UpgradeCard user={user} />
                                    </div>
                                )}

                                {/* Subscription Management for Full Members */}
                                {user.membershipType === 'Full' && (
                                    <div className="px-1">
                                        <SubscriptionCard user={user} onSubscriptionChange={refreshUser} />
                                    </div>
                                )}

                                {/* Payment History */}
                                <div className="px-1">
                                    <InvoicesCard user={user} />
                                </div>

                                {/* CPD Transactions */}
                                {user.membershipType === 'Full' && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base md:text-lg flex items-center gap-2">
                                                <Coins className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                                                Recent CPD Transactions
                                            </CardTitle>
                                            <CardDescription className="text-xs md:text-sm">
                                                Your latest CPD hour allocations and usage
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <RecentCpdTransactions userId={user.id} />
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            {/* Bookings Tab */}
                            <TabsContent value="bookings" className="space-y-4 md:space-y-6">
                                <div className="px-1">
                                    <CourseBookingsCard user={user} mode="grid" />
                                </div>
                                <div className="px-1">
                                    <BookingManagement user={user} showHeader={true} />
                                </div>
                            </TabsContent>

                            {/* Invites Tab */}
                            <TabsContent value="invites" className="space-y-4 md:space-y-6 px-1">
                                <InvitesSection user={user} />
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </div>
        </div>
    );
}
