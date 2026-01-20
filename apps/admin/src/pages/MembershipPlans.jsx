import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@ifs/shared/utils';
import { useUser } from '@ifs/shared/components/providers/UserProvider';
import { createCheckout } from '@ifs/shared/api/functions';
import { Button } from '@ifs/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@ifs/shared/components/ui/card';
import { Badge } from '@ifs/shared/components/ui/badge';
import { CheckCircle, X, Loader2, Crown, Users, Award, ArrowRight, Coins, Receipt, BookOpenCheck, Building2, Minus, Plus, Gift } from 'lucide-react';
import { useToast } from "@ifs/shared/components/ui/use-toast";
import { Toaster } from "@ifs/shared/components/ui/toaster";
import { ifs } from '@ifs/shared/api/ifsClient';

// Updated Price ID - Full Membership £20 monthly pricing
const PRICE_IDS = {
    full: {
        monthly: 'price_1STErADJm5OJGimXcBgvYoYn', // £20/month
        annual: 'price_1STErADJm5OJGimXcBgvYoYn' // £240/year
    }
};

const PlanCard = ({ 
    title, 
    price, 
    annualPrice,
    billingPeriod,
    period, 
    description, 
    features, 
    badge,
    icon: Icon,
    onSelect,
    isProcessing,
    isCurrent,
    isPopular,
    highlightedFeatures = []
}) => {
    // "Institutional" style card - minimal, text-heavy, dignified.
    const isFull = title.includes('Full') || title.includes('Member Organisation');
    const showPromo = title.includes('Full') && !title.includes('Organisation');
    
    return (
        <div className={`relative flex flex-col h-full bg-white p-5 sm:p-6 lg:p-10 transition-all duration-300 ${
            isFull 
                ? 'border-t-4 border-t-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)]' 
                : 'border border-slate-200 hover:border-slate-300'
        }`}>
            {showPromo && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-1.5 rounded-full shadow-lg">
                        <p className="text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                            End of Year Offer
                        </p>
                    </div>
                </div>
            )}
            {/* Top Section: Badge & Title */}
            <div className="mb-6 lg:mb-8">
                <div className="flex justify-between items-start mb-4 lg:mb-6">
                    {badge && (
                        <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] ${
                            isFull ? 'text-slate-900' : 'text-slate-400'
                        }`}>
                            {badge}
                        </span>
                    )}
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5] ${isFull ? 'text-slate-900' : 'text-slate-300'}`} />
                </div>
                
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-3 lg:mb-4 tracking-tight leading-tight">{title}</h3>
                <p className="text-sm lg:text-base text-slate-600 leading-relaxed font-light">{description}</p>
            </div>

            <div className="w-12 h-px bg-slate-200 mb-6 lg:mb-8"></div>
            
            {/* Features List */}
            <div className="flex-grow mb-6 lg:mb-10">
                <ul className="space-y-3 lg:space-y-4">
                    {features.map((feature, index) => {
                       const isHighlighted = highlightedFeatures.includes(index);
                       const isCreditLine = feature.includes('CPD hour');
                       return (
                           <li key={index} className="flex items-baseline gap-2.5 lg:gap-3 text-sm lg:text-[15px]">
                               <span className={`mt-1.5 w-1 h-1 rounded-full flex-shrink-0 ${
                                   isHighlighted ? 'bg-slate-900' : 'bg-slate-300'
                               }`} />
                               <span className={`${isHighlighted ? 'text-slate-900 font-medium' : 'text-slate-600 font-light'} ${isCreditLine ? 'font-semibold text-slate-900' : ''}`}>
                                   {feature}
                               </span>
                           </li>
                       );
                    })}
                </ul>
            </div>
            
            {/* Bottom Section: Price & Action */}
            <div className="mt-auto pt-6 lg:pt-8 border-t border-slate-100">
                <div className="flex items-end justify-between gap-4 mb-5 lg:mb-6">
                    <div>
                        <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-2">
                            {period ? (showPromo ? 'Introductory Offer' : 'Membership Fee') : 'Fee Structure'}
                        </p>
                        {period ? (
                            showPromo ? (
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xl sm:text-2xl font-bold text-green-700 font-sans">
                                            First month free
                                        </span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-sm text-slate-500 font-medium font-sans">
                                            then {billingPeriod === 'annual' ? annualPrice + '/year' : price + '/' + period}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl sm:text-2xl font-bold text-slate-900 font-sans">
                                        {billingPeriod === 'annual' ? annualPrice : price}
                                    </span>
                                    <span className="text-slate-500 text-xs font-medium font-sans">
                                        /{billingPeriod === 'annual' ? 'year' : period}
                                    </span>
                                </div>
                            )
                        ) : (
                            <span className="text-lg sm:text-xl font-bold text-slate-900 font-sans">{price}</span>
                        )}
                    </div>
                </div>

                <Button 
                    onClick={onSelect}
                    disabled={isProcessing || isCurrent}
                    variant={isFull ? "default" : "outline"}
                    className={`w-full h-11 sm:h-12 lg:h-14 text-xs sm:text-[13px] font-semibold tracking-[0.1em] uppercase transition-all duration-300 ${
                        isFull 
                            ? 'bg-slate-900 hover:bg-slate-800 text-white hover:shadow-lg' 
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600 hover:border-slate-300'
                    }`}
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                            Processing...
                        </>
                    ) : isCurrent ? (
                        'Current Status'
                    ) : title.includes('Full') ? (
                        'Commit to Membership'
                    ) : title.includes('Fellowship') ? (
                        'Enquire'
                    ) : title.includes('Member Organisation') ? (
                        'Get Team Seats'
                    ) : title.includes('Registered') ? (
                        'Register Free'
                    ) : (
                        'Continue as Associate'
                    )}
                </Button>
            </div>
        </div>
    );
};

export default function MembershipPlans() {
    const { user, loading } = useUser();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [billingPeriod, setBillingPeriod] = useState('monthly');
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingPlan, setProcessingPlan] = useState(null);
    const [membershipTab, setMembershipTab] = useState(() => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('tab') === 'organisations' ? 'organisations' : 'individuals';
    });
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [orgSeats, setOrgSeats] = useState(3);

    // Tiered pricing calculation
    const getPricePerSeat = (seats) => {
        if (seats <= 2) return 20;
        if (seats <= 5) return 16;
        if (seats <= 8) return 15;
        if (seats <= 10) return 14;
        return 12;
    };

    const orgPricePerSeat = getPricePerSeat(orgSeats);
    const orgTotalMonthly = orgSeats * orgPricePerSeat;

    useEffect(() => {
        // Check for invite ID in URL and store in sessionStorage
        const urlParams = new URLSearchParams(window.location.search);
        const inviteId = urlParams.get('invite');
        if (inviteId) {
            sessionStorage.setItem('pending_invite_id', inviteId);
        }
    }, []);

    const handleSkip = async () => {
        // Preserve invite ID when skipping
        const inviteId = sessionStorage.getItem('pending_invite_id');
        const dashboardUrl = inviteId 
            ? createPageUrl('Dashboard') + `?invite=${inviteId}`
            : createPageUrl('Dashboard');
        
        sessionStorage.setItem('coming_from_membership_plans', 'true');
        window.location.href = dashboardUrl;
    };

    const handleSelectPlan = async (planType) => {
        processPlanSelection(planType);
    };

    const processPlanSelection = async (planType) => {
        setIsProcessing(true);
        setProcessingPlan(planType);

        try {
            if (planType === 'associate') {
                // Preserve invite ID when selecting associate
                const inviteId = sessionStorage.getItem('pending_invite_id');
                const dashboardUrl = inviteId 
                    ? createPageUrl('Dashboard') + `?invite=${inviteId}`
                    : createPageUrl('Dashboard');
                
                sessionStorage.setItem('coming_from_membership_plans', 'true');
                window.location.href = dashboardUrl;
                return;
            }

            if (planType === 'full') {
                sessionStorage.setItem('coming_from_membership_plans', 'true');
                
                // Get the correct price ID based on billing period
                const priceId = PRICE_IDS[planType][billingPeriod];
                
                if (!priceId || priceId.includes('YOUR_')) {
                    toast({
                        title: "Configuration Required",
                        description: "Full membership price ID is not configured.",
                        variant: "destructive"
                    });
                    setIsProcessing(false);
                    setProcessingPlan(null);
                    return;
                }
                
                const currentUrl = window.location.origin + createPageUrl('Dashboard');
                const data = await createCheckout({
                    successUrl: `${currentUrl}?payment=success`,
                    cancelUrl: window.location.href,
                    priceId: priceId,
                    membershipTier: 'full',
                    billingPeriod: billingPeriod
                });

                if (data.url) {
                    window.location.href = data.url;
                } else {
                    throw new Error('No checkout URL returned');
                }
            } else if (planType === 'fellowship') {
                toast({
                    title: "Fellowship Application",
                    description: "Fellowship requires Full membership history. Contact us to learn more.",
                    variant: "default",
                });
                setIsProcessing(false);
                setProcessingPlan(null);
            } else if (planType === 'registered' || planType === 'member-org') {
                const url = planType === 'member-org' 
                    ? createPageUrl('OrganisationMembership') + '?type=member'
                    : createPageUrl('OrganisationMembership');
                navigate(url);
                return;
            }
        } catch (error) {
            console.error('Error selecting plan:', error);
            toast({
                title: "Error",
                description: "Could not process your selection. Please try again.",
                variant: "destructive"
            });
            setIsProcessing(false);
            setProcessingPlan(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    // Get features based on billing period
    const getFullMembershipFeatures = (period) => [
        period === 'annual' ? '12 CPD hours included (training credits worth £240)' : '1 CPD hour included monthly (training credit worth £20)',
        'MIFS post-nominal designation',
        'Full Member digital credential',
        'Recognition of professional standing',
        '10% discount on training courses',
        'All Associate Membership benefits'
    ];

    const organisationPlans = [
        {
            id: 'registered',
            title: 'Registered Organisation',
            price: 'Free',
            annualPrice: 'Free',
            period: null,
            description: 'Join our directory and connect your team to the safeguarding community.',
            icon: Building2,
            badge: 'Directory Listing',
            isCurrent: false,
            isPopular: false,
            features: [
                'Organisation profile in IfS directory',
                'Connect team members to your organisation',
                'Organisation dashboard access',
                'Public visibility badge',
                'Team communication tools',
                'No cost to register'
            ],
            highlightedFeatures: [],
            panelTitle: 'Registered Organisation',
            panelDescription: 'Add your organisation to the IfS directory and connect your safeguarding team. Free registration with no ongoing costs.',
            panelBenefits: [
                'Public profile in the IfS organisation directory',
                'Connect unlimited team members to your organisation',
                'Organisation dashboard for team oversight',
                'Display IfS Registered badge on your website',
                'Access to organisation-level resources',
                'Foundation for upgrading to Member Organisation'
            ],
            panelCtaText: 'Register Free',
            panelInfoSections: [
                {
                    icon: Building2,
                    title: 'Directory Visibility',
                    description: 'Your organisation will be listed in our public directory, demonstrating your commitment to safeguarding standards.'
                },
                {
                    icon: Users,
                    title: 'Team Connection',
                    description: 'Link your staff members to your organisation profile. They can join as individual Associate or Full members.'
                }
            ]
        },
        {
            id: 'member-org',
            title: 'Member Organisation',
            price: 'From £14',
            annualPrice: 'From £14',
            period: 'seat/month',
            description: 'Provide Full Membership benefits to your staff with bulk seat pricing.',
            icon: Crown,
            badge: 'Team Benefits',
            isCurrent: false,
            isPopular: true,
            features: [
                'All Registered Organisation benefits',
                'Assign Full Membership seats to staff',
                'Staff receive CPD Hours monthly',
                'Staff get 10% training discount',
                'Centralised billing & management',
                'Volume pricing from 5+ seats'
            ],
            highlightedFeatures: [1, 2, 3],
            panelTitle: 'Member Organisation',
            panelDescription: 'Purchase Full Membership seats in bulk for your team. Staff receive all MIFS benefits with centralised billing.',
            panelBenefits: [
                'Purchase Full Membership seats for your staff',
                'Each seat includes 1 CPD Hour per month',
                '10% discount on all training for seat holders',
                'MIFS post-nominal for all assigned staff',
                'Centralised billing and seat management',
                'Volume discounts from 5+ seats'
            ],
            panelCtaText: 'Get Team Seats',
            panelInfoSections: [
                {
                    icon: Receipt,
                    title: 'Volume Pricing',
                    description: 'Pricing starts at £20/seat/month for 1-2 seats and reduces to £12/seat/month for 11+ seats.'
                },
                {
                    icon: Users,
                    title: 'Flexible Seat Management',
                    description: 'Assign and reassign seats as your team changes. Add more seats at any time through your dashboard.'
                }
            ]
        }
    ];

    const individualPlans = [
        {
            id: 'associate',
            title: 'Associate Membership (AMIfS)',
            price: 'Free',
            annualPrice: 'Free',
            period: null,
            description: 'Community access for those interested in safeguarding.',
            icon: Users,
            badge: 'Community Access',
            isCurrent: user?.membershipType === 'Associate' && user?.onboarding_completed,
            isPopular: false,
            features: [
                'Monthly professional development workshops',
                'Community forum access',
                'Essential resources library',
                'AMIFS post-nominal designation',
                'Digital membership credential',
                '3 job views per day'
            ],
            highlightedFeatures: [],
            panelTitle: 'Associate Membership',
            panelDescription: 'Join our safeguarding community at no cost. Access essential resources and connect with fellow professionals.',
            panelBenefits: [
                'Monthly professional development workshops',
                'Community forum access',
                'Essential resources library',
                'AMIFS post-nominal designation',
                'Digital membership credential',
                '3 job views per day'
            ],
            panelCtaText: 'Continue as Associate',
            panelInfoSections: [
                {
                    icon: Users,
                    title: 'Community Access',
                    description: 'Connect with safeguarding professionals across sectors. Share knowledge, ask questions, and grow together.'
                },
                {
                    icon: BookOpenCheck,
                    title: 'Foundation for Growth',
                    description: 'Associate membership is the perfect starting point. Upgrade to Full membership anytime to unlock professional recognition.'
                }
            ]
        },
        {
            id: 'full',
            title: 'Full Membership (MIfS)',
            price: '£20',
            annualPrice: '£240',
            period: 'month',
            description: 'Critical for career growth. Become a practitioner whose standards are regulated and affirmed by IfS.',
            icon: Crown,
            badge: 'Professional Standard',
            isCurrent: user?.membershipType === 'Full',
            isPopular: true,
            features: getFullMembershipFeatures(billingPeriod),
            highlightedFeatures: [0],
            panelTitle: 'Full Membership',
            panelDescription: 'Join the Independent Federation for Safeguarding. Elevate your practice, evidence your development, and demonstrate your commitment to the highest standards.',
            panelBenefits: getFullMembershipFeatures(billingPeriod),
            panelCtaText: 'Commit to Membership',
            panelInfoSections: [
                {
                    icon: Gift,
                    title: 'End of Year Offer',
                    description: 'We are welcoming the first 50 new members to join with a complimentary first month. Experience the full value of professional membership—including monthly CPD hours, training discounts, and MIFS designation—before your regular subscription begins.'
                },
                {
                    icon: Receipt,
                    title: 'Organisation Reimbursement',
                    description: 'Paying for Full Membership yourself? We automatically send invoices that can be forwarded to your organisation for reimbursement.'
                },
                {
                    icon: BookOpenCheck,
                    title: 'Development-Led',
                    description: 'Our membership model is designed to support your growth. We provide the tools and resources—via allocated CPD hours—to help you meet your professional commitments.'
                }
            ]
        },
        {
            id: 'fellowship',
            title: 'Fellowship (FIfS)',
            price: 'By Application',
            annualPrice: 'By Application',
            period: null,
            description: 'Recognition of significant contribution to the field.',
            icon: Award,
            badge: 'Distinguished',
            isCurrent: user?.membershipType === 'Fellow',
            isPopular: false,
            features: [
                'All Full Membership benefits',
                'FIFS post-nominal designation',
                'Expert recognition',
                'Exclusive fellowship events',
                'Policy contribution opportunities',
                'Advanced networking'
            ],
            highlightedFeatures: [],
            panelTitle: 'Fellowship (FIFS)',
            panelDescription: 'Fellowship is the highest level of recognition within IfS, awarded to those who have made significant contributions to safeguarding.',
            panelBenefits: [
                'All Full Membership benefits',
                'FIFS post-nominal designation',
                'Expert recognition in the field',
                'Exclusive fellowship events and networking',
                'Policy contribution opportunities',
                'Invitation to mentor emerging professionals'
            ],
            panelCtaText: 'Enquire About Fellowship',
            panelInfoSections: [
                {
                    icon: Award,
                    title: 'By Application Only',
                    description: 'Fellowship requires a track record of Full membership and demonstrated contribution to the safeguarding profession.'
                },
                {
                    icon: Users,
                    title: 'Peer Recognition',
                    description: 'Fellows are nominated and endorsed by existing members, recognising your expertise and leadership in the field.'
                }
            ]
        }
    ];

    return (
        <div className="fixed inset-0 w-full h-full bg-slate-50 flex flex-col lg:flex-row overflow-hidden z-50">
            <Toaster />
            
            {/* Exit button in top right */}
            <button
                onClick={handleSkip}
                className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 p-2 sm:p-2.5 bg-white rounded-full hover:bg-slate-100 transition-all border border-slate-200 shadow-sm hover:shadow-md"
                aria-label="Exit to dashboard"
            >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />
            </button>
            
            {/* Left: Plans Area */}
            <div className="flex-1 relative h-full overflow-y-auto overflow-x-hidden flex flex-col order-2 lg:order-1">
                 {/* Segmented Control with Underline */}
                 <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-10 py-4 sm:py-6 shadow-sm">
                     <div className="max-w-md mx-auto">
                         <div className="flex gap-1 relative">
                             <button
                                 onClick={() => { setMembershipTab('individuals'); setSelectedPlan(null); }}
                                 className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-center text-sm sm:text-base font-semibold transition-all duration-200 relative ${
                                     membershipTab === 'individuals'
                                         ? 'text-slate-900'
                                         : 'text-slate-500 hover:text-slate-700'
                                 }`}
                             >
                                 <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                                     <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                                     <span className="hidden xs:inline">Individuals</span>
                                     <span className="xs:hidden">Individual</span>
                                 </div>
                                 {membershipTab === 'individuals' && (
                                     <div className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-slate-900 rounded-t-full" />
                                 )}
                             </button>
                             <button
                                 onClick={() => { setMembershipTab('organisations'); setSelectedPlan(null); }}
                                 className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-center text-sm sm:text-base font-semibold transition-all duration-200 relative ${
                                     membershipTab === 'organisations'
                                         ? 'text-slate-900'
                                         : 'text-slate-500 hover:text-slate-700'
                                 }`}
                             >
                                 <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                                     <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                     <span className="hidden xs:inline">Organisations</span>
                                     <span className="xs:hidden">Organisation</span>
                                 </div>
                                 {membershipTab === 'organisations' && (
                                     <div className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-slate-900 rounded-t-full" />
                                 )}
                             </button>
                         </div>
                     </div>
                 </div>

                 <div className="flex-1 p-4 sm:p-6 lg:p-10 flex items-center justify-center min-h-min">
                     {membershipTab === 'individuals' ? (
                         <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 w-full max-w-[1600px] items-stretch">
                             {individualPlans.map((plan, index) => (
                                 <div
                                     key={plan.id}
                                     className={plan.id === 'full' ? 'order-1 lg:order-2' : plan.id === 'associate' ? 'order-2 lg:order-1' : 'order-3'}
                                 >
                                     <PlanCard
                                         {...plan}
                                         billingPeriod={billingPeriod}
                                         onSelect={() => setSelectedPlan(plan)}
                                         isProcessing={isProcessing && processingPlan === plan.id}
                                     />
                                 </div>
                             ))}
                         </div>
                     ) : (
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full max-w-[1100px] items-stretch">
                             {organisationPlans.map((plan) => (
                                 <PlanCard
                                     key={plan.id}
                                     {...plan}
                                     billingPeriod={billingPeriod}
                                     onSelect={() => setSelectedPlan(plan)}
                                     isProcessing={isProcessing && processingPlan === plan.id}
                                 />
                             ))}
                         </div>
                     )}
                 </div>
            </div>

            {/* Right: Info Panel - Only shows when a plan is selected */}
            {selectedPlan && (
                <div className="w-full lg:w-[480px] xl:w-[550px] bg-white h-full border-l border-slate-200 shadow-2xl flex flex-col overflow-y-auto relative z-20 flex-shrink-0 order-1 lg:order-2">
                    
                    <button
                        onClick={() => setSelectedPlan(null)}
                        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-all border border-slate-200"
                        aria-label="Close panel"
                    >
                        <X className="w-5 h-5 text-slate-600" />
                    </button>

                    <div className="p-6 sm:p-8 lg:p-12 flex flex-col min-h-full">
                        {/* Header Info */}
                        <div className="mt-8 sm:mt-10 mb-8 sm:mb-10">
                           {selectedPlan.id === 'full' && (
                               <div className="mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-4 sm:p-6">
                                   <div className="flex items-start gap-3">
                                       <div className="p-2 bg-white rounded-full border border-emerald-200 flex-shrink-0">
                                           <Gift className="w-5 h-5 text-emerald-600" />
                                       </div>
                                       <div className="flex-1">
                                           <h3 className="text-lg font-bold text-emerald-900 mb-2">End of Year Offer</h3>
                                           <p className="text-sm text-emerald-900 leading-relaxed">
                                               We are welcoming the <strong>first 50 new members</strong> with a <strong>complimentary first month</strong>. Experience full access to professional recognition, monthly CPD hours, and training discounts before your regular subscription begins.
                                           </p>
                                           <p className="text-xs text-emerald-700 mt-3 font-semibold">
                                               First month free, then {billingPeriod === 'annual' ? '£240/year' : '£20/month'}
                                           </p>
                                       </div>
                                   </div>
                               </div>
                           )}
                           <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 sm:mb-6 tracking-tight font-sans">
                               {selectedPlan.panelTitle}
                           </h1>
                           <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed mb-6 sm:mb-8">
                               {selectedPlan.panelDescription}
                           </p>
                            
                            {/* Billing Toggle - Only for Full membership */}
                            {selectedPlan.id === 'full' && (
                                <div className="inline-flex items-center p-1 sm:p-1.5 rounded-full border border-slate-200 bg-slate-50 w-full sm:w-auto">
                                    <button
                                        onClick={() => setBillingPeriod('monthly')}
                                        className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                            billingPeriod === 'monthly' 
                                                ? 'bg-slate-900 text-white shadow-sm' 
                                                : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                    >
                                        Monthly
                                    </button>
                                    <button
                                        onClick={() => setBillingPeriod('annual')}
                                        className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                            billingPeriod === 'annual' 
                                                ? 'bg-slate-900 text-white shadow-sm' 
                                                : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                    >
                                        Annual
                                    </button>
                                </div>
                            )}

                            {/* Seats Calculator - Only for Member Organisation */}
                            {selectedPlan.id === 'member-org' && (
                                <div className="bg-slate-50 rounded-xl p-4 sm:p-6 border border-slate-200">
                                    <label className="block text-sm font-semibold text-slate-700 mb-4">
                                        How many seats do you need?
                                    </label>
                                    <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                                        <button
                                            onClick={() => setOrgSeats(Math.max(1, orgSeats - 1))}
                                            disabled={orgSeats <= 1}
                                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                                        >
                                            <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />
                                        </button>
                                        <div className="flex-1 text-center">
                                            <span className="text-3xl sm:text-4xl font-bold text-slate-900">{orgSeats}</span>
                                            <span className="text-slate-500 ml-2 text-sm sm:text-base">seats</span>
                                        </div>
                                        <button
                                            onClick={() => setOrgSeats(orgSeats + 1)}
                                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 transition-colors flex-shrink-0"
                                        >
                                            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />
                                        </button>
                                    </div>
                                    
                                    <div className="border-t border-slate-200 pt-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Price per seat</span>
                                            <span className="font-medium text-slate-700">£{orgPricePerSeat}/month</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">CPD hours per seat</span>
                                            <span className="font-medium text-slate-700">1 hour/month</span>
                                        </div>
                                        <div className="flex justify-between pt-2 border-t border-slate-200">
                                            <span className="font-semibold text-slate-900">Estimated total</span>
                                            <span className="text-xl font-bold text-slate-900">£{orgTotalMonthly}/month</span>
                                        </div>
                                    </div>
                                    
                                    {orgSeats >= 5 && (
                                        <div className="mt-4 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                                            Volume discount applied! You save £{(20 - orgPricePerSeat) * orgSeats}/month
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="w-12 h-0.5 sm:h-1 bg-slate-900 mb-8 sm:mb-10"></div>

                        {/* Benefits List */}
                        <div className="mb-8 sm:mb-10">
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4 font-sans">Benefits</h3>
                            <ul className="space-y-3">
                                {(selectedPlan.id === 'full' ? getFullMembershipFeatures(billingPeriod) : selectedPlan.panelBenefits).map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3 text-sm text-slate-600">
                                        <CheckCircle className="w-4 h-4 text-slate-900 mt-0.5 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Extra Info Sections */}
                        {selectedPlan.panelInfoSections && (
                            <div className="space-y-8 sm:space-y-10">
                                {selectedPlan.panelInfoSections.map((section, index) => {
                                    const SectionIcon = section.icon;
                                    return (
                                        <div key={index}>
                                            <div className="flex items-center gap-2.5 sm:gap-3 mb-2.5 sm:mb-3">
                                                <SectionIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0" />
                                                <h3 className="text-base sm:text-lg font-bold text-slate-900 font-sans">{section.title}</h3>
                                            </div>
                                            <p className="text-slate-600 text-sm leading-relaxed">
                                                {section.description}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        
                        <div className="mt-auto pt-8 sm:pt-12 pb-4 sm:pb-6">
                            <Button 
                                onClick={() => handleSelectPlan(selectedPlan.id)}
                                disabled={isProcessing}
                                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white hover:shadow-lg text-[13px] font-semibold tracking-[0.1em] uppercase transition-all duration-300"
                            >
                                {isProcessing && processingPlan === selectedPlan.id ? (
                                    <>
                                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    selectedPlan.panelCtaText
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Skip button when no panel is open */}
            {!selectedPlan && (
                <button
                    onClick={handleSkip}
                    className="fixed bottom-6 right-6 z-50 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center gap-2 font-medium text-sm"
                    aria-label="Skip to dashboard"
                >
                    <span>Skip for now</span>
                    <ArrowRight className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}

