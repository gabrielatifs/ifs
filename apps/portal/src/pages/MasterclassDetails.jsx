import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ifs } from '@ifs/shared/api/ifsClient';
import { createPageUrl } from '@ifs/shared/utils';
import PortalSidebar from '../components/portal/PortalSidebar';
import PortalHeader from '../components/portal/PortalHeader';
import { useUser } from '@ifs/shared/components/providers/UserProvider';
import { Button } from '@ifs/shared/components/ui/button';
import { Badge } from '@ifs/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@ifs/shared/components/ui/card';
import { Loader2, Calendar, Clock, MapPin, User as UserIcon, Users, Check, ExternalLink, Download, Coins, CreditCard, Link2, Lock, Trash2, PlayCircle, FileText, FileImage, File, Award } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { useToast } from "@ifs/shared/components/ui/use-toast";
import { Toaster } from "@ifs/shared/components/ui/toaster";
import { bookEventWithCredits } from '@ifs/shared/api/functions';
import { sendEmail } from '@ifs/shared/api/functions';
import { wrapEmailHtml } from '@ifs/shared/emails/wrapper';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ifs/shared/components/ui/dialog";

const useQuery = () => new URLSearchParams(useLocation().search);

const InfoItem = ({ icon: Icon, label, children }) => (
    <div className="flex items-start gap-4">
        <Icon className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
        <div>
            <p className="font-semibold text-slate-800">{label}</p>
            <div className="text-slate-600">{children}</div>
        </div>
    </div>
);

const getEmailWrapper = (content) => wrapEmailHtml(content);
const RESEND_REGISTRATION_TEMPLATE_ID = "516478cf-b7f9-4232-a295-c1a8465ed4ce";

export default function MasterclassDetails() {
    const { user, loading } = useUser();
    const navigate = useNavigate();
    const query = useQuery();
    const eventId = query.get('id');
    const { toast } = useToast();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [event, setEvent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    console.log('[MasterclassDetails] Component rendered', { 
        eventId, 
        hasUser: !!user, 
        loading,
        isLoading,
        fullUrl: window.location.href,
        search: window.location.search
    });
    const [isBooking, setIsBooking] = useState(false);
    const [userSignup, setUserSignup] = useState(null);
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);

    useEffect(() => {
        const fetchEventAndSignup = async () => {
            console.log('[MasterclassDetails] fetchEventAndSignup called', { eventId });
            if (!eventId) {
                console.log('[MasterclassDetails] No eventId, stopping');
                setIsLoading(false);
                return;
            }
            
            setIsLoading(true);
            
            try {
                console.log('[MasterclassDetails] Fetching event with id:', eventId);
                const events = await ifs.entities.Event.filter({ id: eventId });
                console.log('[MasterclassDetails] Fetched events:', events);
                
                if (events && events.length > 0) {
                    console.log('[MasterclassDetails] Event found:', events[0].title);
                    setEvent(events[0]);
                } else {
                    console.log('[MasterclassDetails] No event found');
                    setEvent(null);
                }
            } catch (error) {
                console.error('[MasterclassDetails] Failed to fetch event:', error);
                setEvent(null);
            } finally {
                console.log('[MasterclassDetails] Fetch complete, isLoading = false');
                setIsLoading(false);
            }
        };
        
        if (eventId) {
            fetchEventAndSignup();
        } else {
            console.log('[MasterclassDetails] No eventId in URL');
        }
    }, [eventId]);

    // Separate effect for fetching user signup
    useEffect(() => {
        const fetchSignup = async () => {
            if (user && eventId) {
                try {
                    const signups = await ifs.entities.EventSignup.filter({ eventId: eventId, userId: user.id });
                    if (signups && signups.length > 0) {
                        setUserSignup(signups[0]);
                    }
                } catch (error) {
                    console.error("Failed to fetch signup:", error);
                }
            }
        };
        
        fetchSignup();
    }, [eventId, user?.id]);
    
    const handleInitiateBooking = () => {
        if (event.creditCost && event.creditCost > 0 && user.membershipType === 'Full') {
            setShowPaymentDialog(true);
        } else {
            handleBookNow('free');
        }
    };

    const handlePaymentMethodSelected = async (method) => {
        setSelectedPaymentMethod(method);
        setShowPaymentDialog(false);
        await handleBookNow(method);
    };

    const handleBookNow = async (paymentMethod = 'free') => {
        if (!user || !event) return;
        
        setIsBooking(true);
        try {
            if (paymentMethod === 'credits') {
                const { data } = await bookEventWithCredits({
                    eventId: event.id,
                    paymentMethod: 'credits'
                });

                if (data.success) {
                    setUserSignup(data.booking);
                    
                    console.log('[MasterclassDetails] Sending confirmation email (credits)', {
                        signupId: data.booking?.id,
                        userEmail: user?.email
                    });
                    await sendConfirmationEmail(data.booking);
                    
                    toast({ 
                        title: "🎉 Booking Confirmed!", 
                        description: `You paid ${data.creditsSpent} credits. New balance: ${data.newBalance} credits.`,
                        duration: 2000
                    });
                    
                    console.log('[MasterclassDetails] Navigating to success page with credits');
                    // Redirect to success page
                    setTimeout(() => {
                        navigate(`${createPageUrl('EventRegistrationSuccess')}?eventId=${event.id}&type=masterclass`);
                    }, 1000);
                    return;
                } else {
                    throw new Error(data.error || 'Booking failed');
                }
            }

            // Free booking
            const signupData = {
                userId: user.id,
                eventId: event.id,
                userEmail: user.email,
                userName: user.displayName || user.full_name,
                eventTitle: event.title,
                eventDate: event.date,
                eventType: event.type,
                eventLocation: event.location
            };
            const newSignup = await ifs.entities.EventSignup.create(signupData);
            setUserSignup(newSignup);
            
            console.log('[MasterclassDetails] Sending confirmation email (free)', {
                signupId: newSignup?.id,
                userEmail: user?.email
            });
            await sendConfirmationEmail(newSignup);
            
            toast({ title: "Booking Confirmed!", description: `You're all set for "${event.title}". Check your email for details.`, duration: 2000 });

            console.log('[MasterclassDetails] Navigating to success page (free)');
            // Redirect to success page
            setTimeout(() => {
                navigate(`${createPageUrl('EventRegistrationSuccess')}?eventId=${event.id}&type=masterclass`);
            }, 1000);
        } catch (error) {
            console.error("Booking failed:", error);
            toast({ 
                title: "Booking Failed", 
                description: error.message || "Could not save your booking. Please try again.", 
                variant: "destructive" 
            });
        } finally {
            setIsBooking(false);
            setSelectedPaymentMethod(null);
        }
    };
    const sendConfirmationEmail = async (signup) => {
        try {
            const displayName = user.displayName || user.firstName || user.full_name || 'Member';
            const eventDate = format(new Date(event.date), 'EEEE, d MMMM yyyy');
            const meetingLink = event.meetingUrl || '';

            console.log('[MasterclassDetails] Invoking sendEmail function', {
                to: user?.email
            });
            await sendEmail({
                to: user.email,
                template: {
                    id: RESEND_REGISTRATION_TEMPLATE_ID,
                    variables: {
                        firstName: user.firstName || displayName.split(' ')[0] || 'Member',
                        eventTitle: event.title,
                        eventDate,
                        eventTime: event.time || 'Time TBA',
                        eventLocation: event.location || 'Online',
                        joinLink: meetingLink || undefined,
                        meetingId: event.meetingId || undefined,
                        meetingPassword: event.meetingPassword || undefined,
                    },
                },
            });
        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
        }
    };

    const handleRemoveRegistration = async () => {
        if (!userSignup) return;
        setIsRemoving(true);
        try {
            await ifs.entities.EventSignup.delete(userSignup.id);
            setUserSignup(null);
            setCancelDialogOpen(false);
            toast({
                title: "Registration Removed",
                description: `You are no longer registered for "${event.title}".`
            });
        } catch (error) {
            console.error("Failed to remove registration:", error);
            toast({
                title: "Error",
                description: "Failed to remove your registration. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsRemoving(false);
        }
    };

    console.log('[MasterclassDetails] Rendering decision:', { isLoading, hasEvent: !!event, eventId });

    if (isLoading) {
        console.log('[MasterclassDetails] Showing loading spinner');
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
            </div>
        );
    }
    
    if (!event) {
        console.log('[MasterclassDetails] Event not found, showing error');
        return (
             <div className="flex h-screen bg-slate-50/30">
                <PortalSidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <PortalHeader setSidebarOpen={setSidebarOpen} user={user} />
                    <main className="flex-1 overflow-y-auto p-6 md:p-8">
                        <div className="text-center py-20">
                            <h2 className="text-xl font-semibold">Event Not Found</h2>
                            <p className="text-slate-600 mt-2">The event you are looking for does not exist or has been removed.</p>
                        </div>
                    </main>
                </div>
             </div>
        );
    }

    const isEventPast = isPast(new Date(event.date));
    const canPayWithCredits = event.creditCost && event.creditCost > 0 && user.membershipType === 'Full';
    const hasEnoughCredits = canPayWithCredits && (user.creditBalance || 0) >= event.creditCost;


    return (
        <>
            <Toaster />
            {/* Payment Method Dialog */}
            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Choose Payment Method</DialogTitle>
                        <DialogDescription>
                            Select how you'd like to pay for this masterclass
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-4">
                        <button
                            onClick={() => handlePaymentMethodSelected('credits')}
                            disabled={!hasEnoughCredits || isBooking}
                            className={`w-full p-4 rounded-lg border-2 transition-all ${
                                hasEnoughCredits
                                    ? 'border-purple-300 hover:border-purple-500 hover:bg-purple-50 cursor-pointer'
                                    : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                            }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-lg ${hasEnoughCredits ? 'bg-purple-100' : 'bg-gray-200'}`}>
                                    <Coins className={`w-6 h-6 ${hasEnoughCredits ? 'text-purple-600' : 'text-gray-400'}`} />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-semibold text-slate-900 mb-1">
                                        Pay with Credits
                                    </div>
                                    <div className="text-sm text-slate-600">
                                        {event.creditCost} credits • Your balance: {user.creditBalance || 0} credits
                                    </div>
                                    {!hasEnoughCredits && (
                                        <div className="text-sm text-red-600 mt-1">
                                            Insufficient credits
                                        </div>
                                    )}
                                </div>
                            </div>
                        </button>

                        <div className="relative">
                            <button
                                disabled
                                className="w-full p-4 rounded-lg border-2 border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-gray-200">
                                        <CreditCard className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="font-semibold text-slate-600 mb-1">
                                            Pay with Card
                                        </div>
                                        <div className="text-sm text-slate-500">
                                            £{event.priceFullMember || event.priceStandard || 0}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">
                                            Coming soon
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex h-screen bg-slate-50/30">
                <PortalSidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="MemberMasterclasses" />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <PortalHeader setSidebarOpen={setSidebarOpen} user={user} />
                    <main className="flex-1 overflow-y-auto p-6 md:p-8 pb-20 md:pb-8">
                        <div className="max-w-5xl mx-auto">
                            <div className="relative rounded-xl overflow-hidden mb-8">
                                <img src={event.imageUrl || 'https://images.unsplash.com/photo-1544717297-fa95b9ee9643?q=80&w=2070&auto=format&fit=crop'} alt={event.title} className="w-full h-64 object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                <div className="absolute bottom-0 left-0 p-6">
                                    <Badge className="bg-white/80 text-slate-800 backdrop-blur-sm mb-2">{event.type}</Badge>
                                    <h1 className="text-3xl md:text-4xl font-bold text-white">{event.title}</h1>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Main Content */}
                                <div className="lg:col-span-2 space-y-8">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>About this Event</CardTitle>
                                        </CardHeader>
                                        <CardContent className="prose max-w-none text-slate-600">
                                            <p>{event.description}</p>
                                            
                                            {event.whoIsThisFor && (
                                                <>
                                                    <h4>Who is this for?</h4>
                                                    <p>{event.whoIsThisFor}</p>
                                                </>
                                            )}
                                            
                                            {event.whatYouWillLearn && Array.isArray(event.whatYouWillLearn) && event.whatYouWillLearn.length > 0 && (
                                                <>
                                                    <h4>What you will learn</h4>
                                                    <ul>
                                                        {event.whatYouWillLearn.filter((item) => item && item.trim() !== '').map((item, i) => <li key={i}>{item}</li>)}
                                                    </ul>
                                                </>
                                            )}

                                            {event.whatToExpected && (
                                                <>
                                                    <h4>What to Expect</h4>
                                                    <p>{event.whatToExpected}</p>
                                                </>
                                            )}

                                            {event.sessionObjectives && Array.isArray(event.sessionObjectives) && event.sessionObjectives.length > 0 && (
                                                <>
                                                    <h4>Session Objectives</h4>
                                                    <ul>
                                                        {event.sessionObjectives.filter((item) => item && item.trim() !== '').map((item, i) => <li key={i}>{item}</li>)}
                                                    </ul>
                                                </>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {event.facilitator && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>About the Facilitator</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                <p className="text-lg font-semibold text-slate-800">{event.facilitator}</p>
                                                <p className="text-slate-600">{event.facilitatorBio}</p>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>

                                {/* Sidebar */}
                                <div className="space-y-6">
                                    <Card className="bg-white">
                                        <CardContent className="p-6">
                                            <div className="space-y-5">
                                                <InfoItem icon={Calendar} label="Date">{format(new Date(event.date), 'EEEE, dd MMMM yyyy')}</InfoItem>
                                                <InfoItem icon={Clock} label="Time">{event.time}</InfoItem>
                                                <InfoItem icon={MapPin} label="Location">{event.location}</InfoItem>
                                                
                                                {canPayWithCredits && (
                                                    <div className="pt-4 border-t border-slate-200">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm font-semibold text-slate-700">Credit Cost</span>
                                                            <div className="flex items-center gap-1">
                                                                <Coins className="w-4 h-4 text-amber-500" />
                                                                <span className="text-lg font-bold text-slate-900">{event.creditCost}</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-slate-500">
                                                            Your balance: {user.creditBalance || 0} credits
                                                        </p>
                                                        {!hasEnoughCredits && (
                                                            <p className="text-xs text-red-600 mt-1">
                                                                ⚠️ Insufficient credits for this event
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-6">
                                                {userSignup ? (
                                                    <div className="space-y-4">
                                                        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                                                            <Check className="w-8 h-8 text-green-600 mx-auto mb-2"/>
                                                            <p className="font-semibold text-green-800">You are booked!</p>
                                                            <p className="text-sm text-green-700">Check your email for details.</p>
                                                        </div>
                                                        
                                                        {/* Meeting Details Card */}
                                                        {event.meetingUrl && (
                                                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                                <h4 className="font-bold text-blue-900 mb-3 flex items-center justify-center gap-2">
                                                                    <Link2 className="w-5 h-5" />
                                                                    Join Online
                                                                </h4>
                                                                <Button asChild size="sm" className="w-full mb-3 bg-blue-600 hover:bg-blue-700">
                                                                    <a href={event.meetingUrl} target="_blank" rel="noopener noreferrer">
                                                                        <ExternalLink className="w-4 h-4 mr-2" />
                                                                        Join Meeting
                                                                    </a>
                                                                </Button>
                                                                <div className="text-xs text-blue-800 bg-blue-100 p-3 rounded border border-blue-200 space-y-1">
                                                                    {event.meetingId && (
                                                                        <p className="font-medium"><strong>Meeting ID:</strong> {event.meetingId}</p>
                                                                    )}
                                                                    {event.meetingPassword && (
                                                                        <p className="font-medium"><strong>Password:</strong> {event.meetingPassword}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Certificate - only show if exists */}
                                                        {userSignup.certificateUrl && (
                                                            <Button
                                                                asChild
                                                                variant="outline"
                                                                size="sm"
                                                                className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                                                            >
                                                                <a href={userSignup.certificateUrl} target="_blank" rel="noopener noreferrer">
                                                                    <Award className="w-4 h-4 mr-2" />
                                                                    View Certificate
                                                                </a>
                                                            </Button>
                                                        )}

                                                        {/* Cancel Button */}
                                                        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                                                            <DialogTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                                                                    disabled={isRemoving}
                                                                >
                                                                    {isRemoving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                                                    Cancel Booking
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>Cancel Booking?</DialogTitle>
                                                                    <DialogDescription>
                                                                        Are you sure you want to cancel your booking for "{event.title}"? You can always book again if there's space available.
                                                                    </DialogDescription>
                                                                </DialogHeader>
                                                                <DialogFooter className="gap-2 sm:gap-0">
                                                                    <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                                                                        Keep Booking
                                                                    </Button>
                                                                    <Button
                                                                        onClick={handleRemoveRegistration}
                                                                        className="bg-red-600 hover:bg-red-700"
                                                                        disabled={isRemoving}
                                                                    >
                                                                        {isRemoving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Confirm Cancellation'}
                                                                    </Button>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </div>
                                                ) : isEventPast ? (
                                                     <Button disabled className="w-full" size="lg">Event has passed</Button>
                                                ) : (
                                                    <>
                                                        <Button 
                                                            onClick={handleInitiateBooking} 
                                                            disabled={isBooking} 
                                                            className="w-full" 
                                                            size="lg"
                                                        >
                                                            {isBooking && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
                                                            {canPayWithCredits ? 'Book with Credits or Card' : 'Book Your Place'}
                                                        </Button>
                                                        {canPayWithCredits && (
                                                            <p className="text-xs text-center text-slate-500 mt-2">
                                                                Choose your payment method in the next step
                                                            </p>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {isEventPast && (event.recordingUrl || event.resourcesUrl || (event.resources && event.resources.length > 0)) && (
                                        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white overflow-hidden">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="flex items-center gap-2 text-purple-900">
                                                    <Download className="w-5 h-5 text-purple-600" />
                                                    Session Resources
                                                </CardTitle>
                                                <p className="text-sm text-purple-700/70">Access recordings and materials from this session</p>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                {event.recordingUrl && (
                                                    <a href={event.recordingUrl} target="_blank" rel="noopener noreferrer" className="block group">
                                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 transition-all shadow-sm hover:shadow-md">
                                                            <div className="p-2 bg-white/20 rounded-lg">
                                                                <PlayCircle className="w-5 h-5" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-semibold">Watch Recording</p>
                                                                <p className="text-xs text-white/80">View the full session video</p>
                                                            </div>
                                                            <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                                                        </div>
                                                    </a>
                                                )}
                                                
                                                {(event.resources && event.resources.length > 0) && (
                                                    <div className="space-y-2 pt-1">
                                                        <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider px-1">Downloadable Materials</p>
                                                        {event.resources.map((resource, index) => {
                                                            const isPdf = resource.type?.includes('pdf') || resource.name?.toLowerCase().endsWith('.pdf');
                                                            const isImage = resource.type?.includes('image') || /\.(png|jpg|jpeg|gif|webp)$/i.test(resource.name);
                                                            const ResourceIcon = isPdf ? FileText : isImage ? FileImage : File;
                                                            
                                                            return (
                                                                <a key={index} href={resource.url} target="_blank" rel="noopener noreferrer" className="block group">
                                                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-purple-100 hover:border-purple-300 hover:bg-purple-50 transition-all">
                                                                        <div className={`p-2 rounded-lg ${isPdf ? 'bg-red-100 text-red-600' : isImage ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                                                                            <ResourceIcon className="w-4 h-4" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="font-medium text-slate-800 truncate text-sm">{resource.name}</p>
                                                                            <p className="text-xs text-slate-500">{isPdf ? 'PDF Document' : isImage ? 'Image' : 'File'}</p>
                                                                        </div>
                                                                        <Download className="w-4 h-4 text-purple-400 group-hover:text-purple-600" />
                                                                    </div>
                                                                </a>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                                
                                                {event.resourcesUrl && (
                                                    <a href={event.resourcesUrl} target="_blank" rel="noopener noreferrer" className="block group mt-2">
                                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-100 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all">
                                                            <div className="p-2 bg-slate-200 rounded-lg">
                                                                <Download className="w-4 h-4 text-slate-600" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-medium text-slate-700 text-sm">Additional Resources</p>
                                                                <p className="text-xs text-slate-500">Download all materials</p>
                                                            </div>
                                                            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                                                        </div>
                                                    </a>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
