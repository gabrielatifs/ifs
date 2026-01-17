import React, { useState, useEffect } from 'react';
import { useUser } from '../components/providers/UserProvider';
import OrgPortalSidebar from '../components/portal/OrgPortalSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CreditCard, Users, Calendar, AlertCircle, Download, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ManageOrgSubscription() {
    const { user, loading: userLoading } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { toast } = useToast();
    const [organisation, setOrganisation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState([]);
    const [newSeats, setNewSeats] = useState(0);
    const [updating, setUpdating] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        if (!userLoading && user?.organisationId) {
            fetchSubscriptionData();
        }
    }, [userLoading, user?.organisationId]);

    const fetchSubscriptionData = async () => {
        try {
            setLoading(true);
            
            // Fetch organisation details
            const orgs = await base44.entities.Organisation.filter({ id: user.organisationId });
            const org = orgs[0];
            setOrganisation(org);
            setNewSeats(org.totalSeats || 0);

            // Fetch invoices if there's a Stripe customer
            if (org.stripeCustomerId) {
                const invoicesResponse = await base44.functions.invoke('getInvoices', {
                    customerId: org.stripeCustomerId
                });
                if (invoicesResponse.data?.invoices) {
                    setInvoices(invoicesResponse.data.invoices);
                }
            }
        } catch (error) {
            console.error("Failed to fetch subscription data:", error);
            toast({ 
                title: 'Error', 
                description: 'Could not load subscription data.', 
                variant: 'destructive' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSeats = async () => {
        if (newSeats < organisation.usedSeats) {
            toast({
                title: 'Cannot reduce seats',
                description: `You currently have ${organisation.usedSeats} seats in use. Please remove team members before reducing seats.`,
                variant: 'destructive'
            });
            return;
        }

        try {
            setUpdating(true);
            
            // Update subscription quantity via Stripe
            const response = await base44.functions.invoke('updateOrgSubscription', {
                organisationId: user.organisationId,
                newQuantity: newSeats
            });

            if (response.data?.success) {
                toast({
                    title: 'Subscription updated',
                    description: `Your subscription now includes ${newSeats} seats.`
                });
                await fetchSubscriptionData();
            } else {
                throw new Error(response.data?.error || 'Failed to update subscription');
            }
        } catch (error) {
            console.error('Failed to update seats:', error);
            toast({
                title: 'Update failed',
                description: error.message || 'Could not update subscription.',
                variant: 'destructive'
            });
        } finally {
            setUpdating(false);
        }
    };

    const handleCancelSubscription = async () => {
        try {
            setCancelling(true);
            
            const response = await base44.functions.invoke('cancelSubscription', {
                subscriptionId: organisation.stripeSubscriptionId
            });

            if (response.data?.success) {
                toast({
                    title: 'Subscription cancelled',
                    description: 'Your organisation membership has been cancelled. Access will continue until the end of the billing period.'
                });
                await fetchSubscriptionData();
            } else {
                throw new Error(response.data?.error || 'Failed to cancel subscription');
            }
        } catch (error) {
            console.error('Failed to cancel subscription:', error);
            toast({
                title: 'Cancellation failed',
                description: error.message || 'Could not cancel subscription.',
                variant: 'destructive'
            });
        } finally {
            setCancelling(false);
            setShowCancelDialog(false);
        }
    };

    const handleReactivate = async () => {
        try {
            setUpdating(true);
            
            const response = await base44.functions.invoke('reactivateSubscription', {
                subscriptionId: organisation.stripeSubscriptionId
            });

            if (response.data?.success) {
                toast({
                    title: 'Subscription reactivated',
                    description: 'Your organisation membership has been reactivated.'
                });
                await fetchSubscriptionData();
            } else {
                throw new Error(response.data?.error || 'Failed to reactivate subscription');
            }
        } catch (error) {
            console.error('Failed to reactivate subscription:', error);
            toast({
                title: 'Reactivation failed',
                description: error.message || 'Could not reactivate subscription.',
                variant: 'destructive'
            });
        } finally {
            setUpdating(false);
        }
    };

    if (userLoading || loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
            </div>
        );
    }

    if (!user || !organisation || (user.organisationRole !== 'Admin' && user.role !== 'admin')) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
                    <p className="text-slate-600">Only organisation admins can manage subscriptions.</p>
                </div>
            </div>
        );
    }

    const isActive = organisation.subscriptionStatus === 'active';
    const isPastDue = organisation.subscriptionStatus === 'past_due';
    const isCanceled = organisation.subscriptionStatus === 'canceled';
    const isFreeRegistered = !organisation.stripeSubscriptionId || organisation.subscriptionStatus === 'none';

    const handleUpgrade = async () => {
        try {
            setUpdating(true);
            
            const response = await base44.functions.invoke('createOrgMembershipCheckout', {
                organisationId: user.organisationId,
                seats: 5 // Default to 5 seats
            });

            if (response.data?.url) {
                window.location.href = response.data.url;
            } else {
                throw new Error('Failed to create checkout session');
            }
        } catch (error) {
            console.error('Failed to start upgrade:', error);
            toast({
                title: 'Upgrade failed',
                description: 'Could not start upgrade process.',
                variant: 'destructive'
            });
            setUpdating(false);
        }
    };

    return (
        <div className="flex h-screen bg-slate-50/30">
            <Toaster />
            <OrgPortalSidebar 
                organisation={organisation}
                user={user} 
                sidebarOpen={sidebarOpen} 
                setSidebarOpen={setSidebarOpen} 
                currentPage="ManageOrgSubscription" 
            />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto bg-slate-50">
                    <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
                        <div className="mb-12">
                            <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Manage Subscription</h1>
                            <p className="text-lg text-slate-600">View and manage your organisation membership</p>
                        </div>

                        {/* Subscription Status Banner */}
                        {isPastDue && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-red-900">Payment Required</h3>
                                    <p className="text-sm text-red-700 mt-1">Your payment method failed. Please update your payment information to continue your subscription.</p>
                                </div>
                            </div>
                        )}

                        {isCanceled && organisation.subscriptionEndDate && new Date(organisation.subscriptionEndDate) > new Date() && (
                            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-amber-900">Subscription Cancelled</h3>
                                    <p className="text-sm text-amber-700 mt-1">
                                        Your subscription will end on {format(new Date(organisation.subscriptionEndDate), 'dd MMM yyyy')}. 
                                        You can reactivate before this date to continue without interruption.
                                    </p>
                                </div>
                            </div>
                        )}

                        {isFreeRegistered ? (
                            /* Upgrade CTA for Free Registered Organisations */
                            <div className="lg:col-span-3 bg-white border-t-4 border-t-slate-900 shadow-sm">
                                <div className="p-8 md:p-12">
                                    <div className="max-w-3xl mx-auto text-center">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-6">
                                            <Users className="w-8 h-8 text-slate-600" />
                                        </div>
                                        <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Upgrade to Member Organisation</h2>
                                        <p className="text-lg text-slate-600 mb-8 font-light">
                                            Give your team Full Member seats with access to exclusive training, events, and professional development opportunities.
                                        </p>
                                        <div className="bg-slate-50 border border-slate-200 p-6 mb-8">
                                            <div className="text-center mb-6">
                                                <div className="text-4xl font-bold text-slate-900 mb-2 font-sans">£14 <span className="text-xl font-normal text-slate-600">per seat/month</span></div>
                                                <p className="text-sm text-slate-500">Each Full Member seat includes:</p>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                                                <div>
                                                    <div className="text-sm font-semibold text-slate-900 mb-2">Per Member Benefits</div>
                                                    <ul className="text-sm text-slate-700 space-y-1">
                                                        <li>✓ 1 CPD Hour per month</li>
                                                        <li>✓ Access to all events</li>
                                                        <li>✓ Digital credentials</li>
                                                        <li>✓ MIFS designation</li>
                                                    </ul>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-slate-900 mb-2">Flexible</div>
                                                    <ul className="text-sm text-slate-700 space-y-1">
                                                        <li>✓ Monthly billing</li>
                                                        <li>✓ Add/remove seats anytime</li>
                                                        <li>✓ Cancel anytime</li>
                                                        <li>✓ No long-term contract</li>
                                                    </ul>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-slate-900 mb-2">Management</div>
                                                    <ul className="text-sm text-slate-700 space-y-1">
                                                        <li>✓ Team analytics dashboard</li>
                                                        <li>✓ CPD tracking</li>
                                                        <li>✓ Centralized billing</li>
                                                        <li>✓ Admin controls</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={handleUpgrade}
                                            disabled={updating}
                                            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 h-12 font-semibold text-sm tracking-wide uppercase"
                                        >
                                            {updating ? (
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            ) : (
                                                <Users className="w-4 h-4 mr-2" />
                                            )}
                                            Get Started with Member Organisation
                                        </Button>
                                        <p className="text-sm text-slate-500 mt-4">
                                            No commitment • Cancel anytime • Instant activation
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                                {/* Current Plan Card */}
                                <div className="bg-white border border-slate-200 shadow-sm">
                                    <div className="border-b border-slate-200 px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                                <CreditCard className="w-5 h-5 text-slate-600" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Current Plan</h2>
                                                <p className="text-sm text-slate-500 mt-0.5">Organisation Membership</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="space-y-4">
                                            <div>
                                                <div className="text-sm text-slate-600 mb-1">Status</div>
                                                <div className="flex items-center gap-2">
                                                    {isActive ? (
                                                        <>
                                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                                            <span className="font-medium text-slate-900">Active</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="w-4 h-4 text-red-600" />
                                                            <span className="font-medium text-slate-900 capitalize">{organisation.subscriptionStatus}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-slate-600 mb-1">Monthly Cost</div>
                                                <div className="text-2xl font-bold text-slate-900">
                                                    £{((organisation.monthlyPrice || 0) * (organisation.totalSeats || 0)).toFixed(2)}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1">
                                                    £{organisation.monthlyPrice?.toFixed(2)} per seat
                                                </div>
                                            </div>
                                            {organisation.subscriptionStartDate && (
                                                <div>
                                                    <div className="text-sm text-slate-600 mb-1">Started</div>
                                                    <div className="text-sm font-medium text-slate-900">
                                                        {format(new Date(organisation.subscriptionStartDate), 'dd MMM yyyy')}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                            {/* Seats Card */}
                            <div className="bg-white border border-slate-200 shadow-sm">
                                <div className="border-b border-slate-200 px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                            <Users className="w-5 h-5 text-slate-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Seats</h2>
                                            <p className="text-sm text-slate-500 mt-0.5">Team member capacity</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <div className="text-sm text-slate-600 mb-1">Total</div>
                                                <div className="text-2xl font-bold text-slate-900">{organisation.totalSeats || 0}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-slate-600 mb-1">Used</div>
                                                <div className="text-2xl font-bold text-slate-900">{organisation.usedSeats || 0}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-slate-600 mb-1">Available</div>
                                                <div className="text-2xl font-bold text-green-600">{organisation.availableSeats || 0}</div>
                                            </div>
                                        </div>
                                        
                                        {isActive && (
                                            <div className="pt-4 border-t border-slate-200">
                                                <Label htmlFor="seats" className="text-sm font-medium text-slate-900 mb-2 block">
                                                    Update Seats
                                                </Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        id="seats"
                                                        type="number"
                                                        min={organisation.usedSeats || 1}
                                                        value={newSeats}
                                                        onChange={(e) => setNewSeats(parseInt(e.target.value) || 0)}
                                                        className="flex-1"
                                                    />
                                                    <Button 
                                                        onClick={handleUpdateSeats}
                                                        disabled={updating || newSeats === organisation.totalSeats}
                                                    >
                                                        {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update'}
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-2">
                                                    Minimum: {organisation.usedSeats || 1} (seats in use)
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Next Billing Card */}
                            <div className="bg-white border border-slate-200 shadow-sm">
                                <div className="border-b border-slate-200 px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-slate-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Next Billing</h2>
                                            <p className="text-sm text-slate-500 mt-0.5">Upcoming payment</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {organisation.subscriptionEndDate ? (
                                            <>
                                                <div>
                                                    <div className="text-sm text-slate-600 mb-1">Date</div>
                                                    <div className="text-lg font-medium text-slate-900">
                                                        {format(new Date(organisation.subscriptionEndDate), 'dd MMM yyyy')}
                                                    </div>
                                                </div>
                                                {!isCanceled && (
                                                    <div>
                                                        <div className="text-sm text-slate-600 mb-1">Amount</div>
                                                        <div className="text-2xl font-bold text-slate-900">
                                                            £{((organisation.monthlyPrice || 0) * (organisation.totalSeats || 0)).toFixed(2)}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-sm text-slate-500">No upcoming billing scheduled</p>
                                        )}

                                        <div className="pt-4 border-t border-slate-200">
                                            {isActive ? (
                                                <Button 
                                                    variant="outline" 
                                                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                                                    onClick={() => setShowCancelDialog(true)}
                                                >
                                                    Cancel Subscription
                                                </Button>
                                            ) : isCanceled && organisation.subscriptionEndDate && new Date(organisation.subscriptionEndDate) > new Date() ? (
                                                <Button 
                                                    className="w-full"
                                                    onClick={handleReactivate}
                                                    disabled={updating}
                                                >
                                                    {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                                    Reactivate Subscription
                                                </Button>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            </div>
                        )}

                        {/* Billing History - Only show if there's a subscription */}
                        {!isFreeRegistered && (
                        <div className="bg-white border border-slate-200 shadow-sm">
                            <div className="border-b border-slate-200 px-8 py-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                        <Download className="w-5 h-5 text-slate-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Billing History</h2>
                                        <p className="text-sm text-slate-500 mt-0.5">Your payment history and invoices</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8">
                                {invoices.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-slate-200 text-left">
                                                    <th className="pb-3 text-sm font-semibold text-slate-900">Date</th>
                                                    <th className="pb-3 text-sm font-semibold text-slate-900">Description</th>
                                                    <th className="pb-3 text-sm font-semibold text-slate-900">Amount</th>
                                                    <th className="pb-3 text-sm font-semibold text-slate-900">Status</th>
                                                    <th className="pb-3 text-sm font-semibold text-slate-900 text-right">Invoice</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {invoices.map((invoice) => (
                                                    <tr key={invoice.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                        <td className="py-4 text-sm text-slate-900">
                                                            {format(new Date(invoice.created * 1000), 'dd MMM yyyy')}
                                                        </td>
                                                        <td className="py-4 text-sm text-slate-900">
                                                            {invoice.description || 'Organisation Membership'}
                                                        </td>
                                                        <td className="py-4 text-sm font-medium text-slate-900">
                                                            £{(invoice.amount_paid / 100).toFixed(2)}
                                                        </td>
                                                        <td className="py-4">
                                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                                                invoice.status === 'paid' 
                                                                    ? 'bg-green-100 text-green-800' 
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {invoice.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 text-right">
                                                            {invoice.invoice_pdf ? (
                                                                <a 
                                                                    href={invoice.invoice_pdf} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                                                                >
                                                                    Download
                                                                </a>
                                                            ) : (
                                                                <span className="text-slate-400 text-sm">N/A</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-slate-500 text-center py-8">No billing history available</p>
                                )}
                            </div>
                        </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Cancel Confirmation Dialog */}
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel your organisation membership? Your team will lose access at the end of the current billing period.
                            You can reactivate before then to continue without interruption.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancelSubscription}
                            disabled={cancelling}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {cancelling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Cancel Subscription
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}