
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CreditCard, Building2, CheckCircle2, Sparkles, Crown } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { createCheckout } from '@/api/functions';
import { useToast } from "@/components/ui/use-toast";

export default function PendingMembershipCard({ user }) {
    const { toast } = useToast();

    const handleSelfPayment = async () => {
        try {
            toast({
                title: "Redirecting to Payment...",
                description: "Please wait while we prepare your checkout session.",
                className: "bg-blue-50 border-blue-200 text-blue-900",
            });

            const successUrl = `${window.location.origin}${createPageUrl('Dashboard')}?payment=success`;
            const cancelUrl = `${window.location.origin}${createPageUrl('Dashboard')}`;

            const { data } = await createCheckout({
                successUrl,
                cancelUrl,
            });

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.error || 'Failed to create checkout session.');
            }
        } catch (error) {
            console.error('Payment initiation failed:', error);
            toast({
                title: "Payment Failed",
                description: "There was an error initiating payment. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleOrgSponsorship = () => {
        window.location.href = createPageUrl('RequestOrgPayment');
    };

    // Only show for Full membership that's pending
    if (user.membershipType !== 'Full' || user.membershipStatus !== 'pending') {
        return null;
    }

    return (
        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-blue-50 border-purple-200 shadow-xl">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100/50 to-blue-100/50 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100/30 to-purple-100/30 rounded-full -ml-12 -mb-12"></div>
            
            <CardHeader className="relative">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-100 rounded-xl">
                            <Crown className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
                                Full Membership
                                <Sparkles className="w-4 h-4 text-purple-500" />
                            </CardTitle>
                            <p className="text-slate-600 text-sm">Complete your upgrade</p>
                        </div>
                    </div>
                    <Badge className="bg-green-100 border-green-300 text-green-800 font-medium">
                        ✓ Approved
                    </Badge>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center gap-2 text-sm text-green-700 mb-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="font-medium">Application approved!</span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">
                        Congratulations! Your Full Membership application has been approved. 
                        Choose your preferred payment method below to unlock all exclusive benefits.
                    </p>
                </div>
            </CardHeader>
            
            <CardContent className="relative space-y-6">
                <div className="space-y-3">
                    <h4 className="font-semibold text-slate-900 text-center">Complete Your Membership</h4>
                    
                    {/* Self Payment Option */}
                    <div className="bg-white rounded-xl p-4 border border-purple-200 hover:border-purple-300 transition-all duration-200 hover:shadow-md group">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                                <CreditCard className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                                <h5 className="font-semibold text-slate-900">Pay Directly</h5>
                                <p className="text-xs text-slate-500">Instant activation</p>
                            </div>
                        </div>
                        <div className="mb-4">
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-slate-900">£350</span>
                                <span className="text-slate-500 text-sm">/year</span>
                            </div>
                        </div>
                        <Button 
                            onClick={handleSelfPayment}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium"
                        >
                            Pay Now
                        </Button>
                    </div>

                    {/* Organization Payment Option */}
                    <div className="bg-white rounded-xl p-4 border border-blue-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md group">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                <Building2 className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <h5 className="font-semibold text-slate-900">Company Sponsored</h5>
                                <p className="text-xs text-slate-500">Request payment from employer</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 mb-4">
                            We'll send a payment request to your manager or HR department.
                        </p>
                        <Button 
                            onClick={handleOrgSponsorship}
                            variant="outline"
                            className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 font-medium"
                        >
                            Request Sponsorship
                        </Button>
                    </div>
                </div>

                {/* Benefits Preview */}
                <div className="bg-gradient-to-r from-slate-50 to-purple-50 rounded-xl p-4 border border-slate-200">
                    <h5 className="font-semibold text-slate-900 mb-2 text-sm">Your Full Member Benefits:</h5>
                    <ul className="text-xs text-slate-600 space-y-1">
                        <li>• Annual refresher training (free)</li>
                        <li>• Two complimentary supervision sessions</li>
                        <li>• 15% discount on additional training</li>
                        <li>• Priority access to conferences</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
