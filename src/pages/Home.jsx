import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ifs } from '@/api/ifsClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from '@/api/entities';
import { Event } from '@/api/entities';
import { CommunityEvent } from '@/api/entities';
import { format } from 'date-fns';
import { ArrowRight, BookOpenCheck, Calendar, Loader2, CheckCircle, Users, Award, Check, Receipt, Crown } from 'lucide-react';
import MainSiteNav from '../components/marketing/MainSiteNav';
import ServiceCard from '../components/marketing/ServiceCard';
import { MarketingContent } from '@/api/entities';
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { usePostHog } from '../components/providers/PostHogProvider';
import { verifyOrgPaymentAndUpgrade } from '@/api/functions';
import { getInviteDetails } from '@/api/functions';
import { customLoginWithRedirect } from '../components/utils/auth';
import AcceptInviteModal from '../components/modals/AcceptInviteModal';
import { OrgInvite } from '@/api/entities';

export default function Home() {
  const [nextWorkshop, setNextWorkshop] = useState(null);
  const [loadingWorkshop, setLoadingWorkshop] = useState(true);
  const [cardContents, setCardContents] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [isVerifyingOrgPayment, setIsVerifyingOrgPayment] = useState(false);
  const [pendingInvite, setPendingInvite] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { trackEvent } = usePostHog();

  const location = useLocation();
  const { toast } = useToast();

  console.log('[Home] Page component loaded');

  // Define a static card content item to be merged with dynamic content
  const staticCPDCard = {
    id: 'static-cpd-card',
    title: "1 Free CPD Hour Each Month",
    description: "Receive 1 CPD hour automatically every month to invest in your professional development. Bank it for larger programs or use it immediately – hours roll over and never expire.",
    imageUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=400&auto=format&fit=crop",
    page: 'Shared',
    order: 99,
    active: true,
  };

  const fetchCardContent = async () => {
    setLoadingCards(true);
    try {
      const contents = await MarketingContent.filter({ page: 'Shared' });
      setCardContents([...contents, staticCPDCard]);
    } catch (error) {
      console.error("Failed to fetch marketing content:", error);
    } finally {
      setLoadingCards(false);
    }
  };

  useEffect(() => {
    console.log('[Home] useEffect triggered');
    
    // Check for pending invites - CRITICAL: Show modal BEFORE any redirection
    const checkPendingInvite = async () => {
        const urlParams = new URLSearchParams(location.search);
        const inviteId = urlParams.get('invite');

        if (!inviteId) {
            console.log('[Home] No invite ID in URL');
            return;
        }

        console.log('[Home] 🎯 Invite ID detected in URL:', inviteId);

        try {
            const user = await ifs.auth.me().catch(() => null);
            console.log('[Home] User status:', user ? `✅ Logged in as ${user.email}` : '❌ Not logged in');

            if (!user) {
                // CRITICAL: User not logged in - MUST show modal FIRST
                console.log('[Home] 📧 Fetching invite details to show modal...');
                const { data } = await getInviteDetails({ inviteId });
                console.log('[Home] 📦 Invite data received:', data);

                if (data && data.invite && data.invite.status === 'pending') {
                    console.log('[Home] ✅ Valid pending invite found, showing acceptance modal');
                    setPendingInvite(data.invite);
                    setShowInviteModal(true);
                } else {
                    console.warn('[Home] ⚠️ No valid pending invite found:', data);
                    toast({
                        title: "Invalid Invite",
                        description: "This invitation is no longer valid.",
                        variant: "destructive"
                    });
                }
            } else if (!user.organisationId) {
                // User is logged in but not in org yet, redirect to Dashboard with invite param
                console.log('[Home] 🔄 User logged in without org, redirecting to Dashboard');
                window.location.href = createPageUrl('Dashboard') + `?invite=${inviteId}`;
            } else {
                console.log('[Home] ✅ User already has organisation, ignoring invite');
            }
        } catch (error) {
            console.error('[Home] ❌ Error checking invite:', error);
            toast({
                title: "Error",
                description: "Could not load invitation details.",
                variant: "destructive"
            });
        }
    };

    checkPendingInvite();
    
    const urlParams = new URLSearchParams(location.search);
    const orgPaymentSuccess = urlParams.get('org_payment') === 'success';
    const sessionId = urlParams.get('session_id');
    
    if (orgPaymentSuccess && sessionId) {
      setIsVerifyingOrgPayment(true);
      
      const verify = async () => {
        try {
          await verifyOrgPaymentAndUpgrade({ sessionId });
          toast({
            title: "Payment Successful",
            description: "Thank you for sponsoring a membership. The member has been notified and their account has been upgraded.",
            variant: 'default',
            className: 'bg-green-100 border-green-300 text-green-800',
            duration: 9000
          });
        } catch (error) {
          console.error("Org payment verification failed:", error);
           toast({
            title: "Payment Verification In Progress",
            description: "Thank you for your payment. The membership will be upgraded shortly.",
            variant: "destructive",
            duration: 9000,
          });
        } finally {
          setIsVerifyingOrgPayment(false);
          window.history.replaceState({}, document.title, location.pathname);
        }
      };
      
      verify();
    }

    // Fetch data in parallel for better performance
    const fetchInitialData = async () => {
      console.log('[Home] Starting fetchInitialData');
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [allMasterclasses, contents, allEvents, allCommunityEvents] = await Promise.all([
          Event.filter({ type: 'Masterclass' }, 'date', 50), // Fetch more masterclasses to find the next one
          MarketingContent.filter({ page: 'Shared' }),
          Event.list('date', 20),
          CommunityEvent.list('date', 20)
        ]);
        
        console.log('[Home] Data fetched successfully');
        
        // Find the next upcoming masterclass from allMasterclasses
        const upcomingMasterclasses = allMasterclasses.filter(w => new Date(w.date) >= today)
                                                      .sort((a, b) => new Date(a.date) - new Date(b.date));
        if (upcomingMasterclasses.length > 0) {
          setNextWorkshop(upcomingMasterclasses[0]);
        }
        
        // Combine all events and community events
        const combinedEvents = [
          ...allEvents.map(e => ({ ...e, isCommunityEvent: false })),
          ...allCommunityEvents.map(e => ({ ...e, isCommunityEvent: true }))
        ];
        
        // Filter for upcoming events and sort them
        const upcoming = combinedEvents
          .filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= today;
          })
          .sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA - dateB;
          })
          .slice(0, 3);
        
        setUpcomingEvents(upcoming);
        
        // Merge static card with fetched dynamic content
        setCardContents([...contents, staticCPDCard]);
      } catch (error) {
        console.error("[Home] Failed to fetch initial data:", error);
      } finally {
        setLoadingWorkshop(false);
        setLoadingCards(false);
        setLoadingEvents(false);
        console.log('[Home] fetchInitialData complete');
      }
    };

    fetchInitialData();
  }, [location, toast]);

  const handleJoin = (intent, location) => {
    console.log('[Home] handleJoin called', { intent, location });
    trackEvent('join_button_clicked', {
      intent,
      location: location || 'home_page',
      user_type: 'anonymous'
    });
    const redirectPath = `${createPageUrl('Onboarding')}?intent=${intent}`;
    console.log('[Home] Calling customLoginWithRedirect with path:', redirectPath);
    customLoginWithRedirect(redirectPath);
  };

  const handleLearnMore = () => {
    trackEvent('learn_more_clicked', { location: 'home_hero' });
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  const handleLoginRedirect = async () => {
    console.log('[Home] handleLoginRedirect called');
    try {
      const user = await ifs.auth.me();
      console.log('[Home] User check result:', user);
      if (user) {
        trackEvent('member_portal_accessed', {
          membership_type: user.membershipType,
          membership_status: user.membershipStatus
        });
        console.log('[Home] User found, redirecting to Dashboard');
        window.location.href = createPageUrl('Dashboard');
      } else {
        console.log('[Home] No user, calling customLoginWithRedirect');
        trackEvent('login_attempted', { location: 'home_header' });
        customLoginWithRedirect(createPageUrl('Dashboard'));
      }
    } catch (error) {
      console.error('[Home] Error in handleLoginRedirect:', error);
      trackEvent('login_attempted', { location: 'home_header' });
      customLoginWithRedirect(createPageUrl('Dashboard'));
    }
  };

  // Function to determine the correct link for an event
  const getEventLink = (event) => {
    if (event.isCommunityEvent) {
      return `${createPageUrl("CommunityEventDetails")}?id=${event.id}&from=Events`;
    }
    return `${createPageUrl("EventDetails")}?id=${event.id}&from=Home`;
  };

  console.log('[Home] Rendering page');

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Helmet>
        <title>Home - Independent Federation for Safeguarding</title>
        <meta name="description" content="Join the UK's trusted professional body for safeguarding. Connect with peers, access essential resources, and advance your expertise through our comprehensive platform designed for safeguarding professionals." />
        <link rel="canonical" href="https://ifs-safeguarding.co.uk/" />
        <meta property="og:title" content="Independent Federation for Safeguarding - UK's Professional Body for Safeguarding" />
        <meta property="og:description" content="Join the UK's trusted professional body for safeguarding. Connect with peers, access essential resources, and advance your expertise." />
        <meta property="og:url" content="https://ifs-safeguarding.co.uk/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Independent Federation for Safeguarding" />
        <meta name="twitter:description" content="Join the UK's trusted professional body for safeguarding professionals." />
      </Helmet>
      <Toaster />
      {pendingInvite && (
        <AcceptInviteModal
          open={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          invite={pendingInvite}
          user={null}
        />
      )}

      <main className="flex-grow">
      
      {isVerifyingOrgPayment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl text-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800">Verifying Payment...</h3>
                <p className="text-gray-600 mt-2">Please wait while we confirm the sponsorship.</p>
            </div>
        </div>
      )}

      {/* Hero Section - Full IoD Style */}
      <section className="relative bg-gray-900 overflow-hidden" style={{ minHeight: '600px' }}>

        {/* Full-width Background Image */}
        <div className="absolute inset-0 hidden lg:block">
          <img
              src="https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1920&q=80&auto=format&fit=crop"
              alt="A diverse group of education professionals collaborating"
              className="w-full h-full object-cover object-center"
              style={{ filter: 'grayscale(100%) contrast(1.1)' }} />
        </div>

        {/* Gradient overlay for split effect */}
        <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, #5e028f 45%, rgba(94, 2, 143, 0.2) 65%, transparent 100%)' }}>
        </div>

        {/* Mobile Background */}
        <div className="absolute inset-0 bg-purple-800 lg:hidden"></div>

        {/* Geometric Overlays */}
        <div className="absolute inset-0 hidden lg:block">
          <div className="absolute top-16 right-24 w-64 h-64 bg-pink-600/30 rounded-full blur-3xl"></div>
          <div className="absolute top-32 right-8 w-32 h-32 bg-pink-500/40 rounded-full blur-xl"></div>
          <div className="absolute bottom-24 right-32 w-48 h-48 bg-purple-700/25 rounded-full blur-2xl"></div>
          <div className="absolute bottom-8 right-16 w-24 h-24 bg-purple-500/50 rounded-full blur-lg"></div>
          <div className="absolute top-1/2 right-4 w-20 h-20 bg-pink-600/60 rounded-full blur-md"></div>
        </div>

        <MainSiteNav onLogin={handleLoginRedirect} />

        {/* Hero Content */}
        <div className="relative z-10 max-w-screen-xl mx-auto">
          <div className="grid lg:grid-cols-2 items-center min-h-[600px]">
            {/* Left Column - Content */}
            <div className="px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                Join the UK's trusted professional body for safeguarding.
              </h1>
              <div className="text-lg lg:text-xl text-purple-100 mb-8 leading-relaxed space-y-4">
                <div className="hidden lg:block space-y-4">
                    <p>Connect with peers, access essential resources, and advance your expertise through our comprehensive platform designed for safeguarding professionals.</p>
                    <p className="text-xl font-semibold text-white">Start with free Associate Membership today.</p>
                </div>
                <div className="block lg:hidden">
                    <p>The UK's professional body for safeguarding practitioners. Connect with peers, access resources, and advance your expertise.</p>
                </div>
              </div>
              <div className="hidden lg:inline-flex items-center gap-4">
                <Button
                    onClick={handleLearnMore}
                    size="lg"
                    className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm">
                  Find out more
                </Button>
                <Button
                  onClick={() => handleJoin('associate', 'home_hero_desktop')}
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-800 font-semibold px-8 py-3 text-base rounded-sm transition-all"
                >
                  Join for Free
                </Button>
              </div>

              <div className="mt-8 lg:hidden">
                <Button
                    onClick={() => handleJoin('associate', 'home_hero_mobile')}
                    size="lg"
                    className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm w-full sm:w-auto">
                  Join for Free
                </Button>
              </div>
            </div>

            <div className="hidden lg:block"></div>
          </div>
        </div>
      </section>

      {/* IfS Description Section - Clean Design */}
      <section className="bg-white py-24">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-black leading-tight">
                Your professional body for safeguarding
              </h2>
            </div>

            <div>
                <p className="hidden lg:block text-lg text-gray-600 leading-relaxed mb-8">The Independent Federation for Safeguarding is a thriving membership association for safeguarding professionals in the UK. At a time when developing, recognising and celebrating great safeguarding leaders have never been more important, IfS offers professional development, valuable connections and influence.</p>
                <p className="block lg:hidden text-lg text-gray-600 leading-relaxed mb-8">IfS is a thriving membership association for UK safeguarding professionals, offering professional development, valuable connections, and influence.</p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                    asChild
                    size="lg"
                    className="bg-black hover:bg-gray-800 text-white font-semibold px-8 py-3 rounded-sm">
                  <Link to={createPageUrl("WhyJoinUs")}>Why join IfS?</Link>
                </Button>
                <Button
                    onClick={() => handleJoin('associate', 'home_description_section')}
                    size="lg"
                    variant="outline"
                    className="border-2 border-black text-black hover:bg-black hover:text-white font-semibold px-8 py-3 rounded-sm transition-all">
                  Join for Free
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="bg-gradient-to-br from-purple-50 to-blue-50 py-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Upcoming Events
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join our professional development sessions, networking events, and expert-led workshops
            </p>
          </div>

          {loadingEvents ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : upcomingEvents.length > 0 ? (
            <>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {upcomingEvents.map(event => (
                  <Card key={event.id} className="group hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-purple-300 overflow-hidden bg-white flex flex-col h-full">
                    {/* Image or Placeholder */}
                    <div className="aspect-video overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100 relative">
                      {event.imageUrl ? (
                        <img 
                          src={event.imageUrl} 
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Calendar className="w-16 h-16 text-purple-300" />
                        </div>
                      )}
                      {/* Overlay gradient for better text contrast */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    <CardHeader className="pb-3">
                      {/* Event Type Badges */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                          {event.type}
                        </span>
                        {!event.isCommunityEvent && event.priceFullMember === 0 && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            Free for Members
                          </span>
                        )}
                        {event.isCommunityEvent && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            Community
                          </span>
                        )}
                      </div>

                      {/* Event Title */}
                      <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors leading-tight min-h-[56px]">
                        {event.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="pt-0 flex-grow flex flex-col">
                      {/* Event Details */}
                      <div className="space-y-2 mb-4 flex-grow">
                        <div className="flex items-start text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 text-purple-600 flex-shrink-0 mt-0.5" />
                          <span className="font-medium">{format(new Date(event.date), 'EEEE, do MMMM yyyy')}</span>
                        </div>
                        
                        {(event.time || (event.startTime && event.endTime)) && (
                          <div className="flex items-start text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{event.time || `${event.startTime || ''} - ${event.endTime || ''}`}</span>
                          </div>
                        )}

                        {event.location && typeof event.location === 'string' && (
                          <div className="flex items-start text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="line-clamp-1">{event.location}</span>
                          </div>
                        )}
                      </div>

                      {/* CTA Button */}
                      <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-sm hover:shadow-md transition-all">
                        <Link to={getEventLink(event)}>
                          View Details
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="text-center">
                <Button asChild size="lg" variant="outline" className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white font-semibold shadow-sm hover:shadow-md transition-all">
                  <Link to={createPageUrl("Events")}>
                    View All Events
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Upcoming Events</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Check back soon for new events and workshops. We regularly host professional development sessions and community events.
              </p>
              <Button asChild variant="outline" className="border-2 border-gray-300 hover:border-purple-600 hover:bg-purple-50 hover:text-purple-600 transition-all">
                <Link to={createPageUrl("Events")}>
                  View Past Events
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
              Comprehensive support for your professional journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From peer support and training to career development and advocacy, we provide the resources you need at every stage.
            </p>
          </div>

          {loadingCards ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cardContents.map(content => (
                <ServiceCard
                  key={content.id}
                  content={content}
                  onUpdate={fetchCardContent}
                />
              ))}

              <div className="group bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex items-center justify-center text-center p-8">
                <div className="text-white">
                  <h3 className="text-xl font-bold mb-4">Ready to explore all benefits?</h3>
                  <Link
                    to={createPageUrl("Membership")}
                    className="inline-flex items-center bg-white text-purple-600 hover:bg-gray-100 font-semibold px-6 py-3 rounded-sm transition-colors group-hover:scale-105 transform duration-300">
                    View Membership
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Membership Benefits Section */}
      <section className="bg-white py-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
              Membership options for every career stage
            </h2>
            <p className="hidden lg:block text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Start with free Associate Membership and access essential resources. When you're ready, upgrade to Full Membership for enhanced professional development, monthly CPD credits, and exclusive benefits.
            </p>
             <p className="block lg:hidden text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Start with free Associate Membership. Upgrade to Full Membership for CPD credits and enhanced benefits.
            </p>
          </div>

          {/* Membership Section - Enhanced Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto items-stretch">
            {/* Associate Member Card */}
            <div className="flex flex-col h-full bg-white p-8 border border-slate-200 hover:border-slate-300 transition-all duration-300">
              <div className="mb-6">
                <div className="flex justify-between items-start mb-6">
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                        Community Access
                    </span>
                    <Users className="w-6 h-6 stroke-[1.5] text-slate-300" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight leading-tight">Associate Membership</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-light">Community access for those interested in safeguarding.</p>
              </div>

              <div className="w-12 h-px bg-slate-200 mb-8"></div>

              <div className="flex-grow mb-8">
                <ul className="space-y-4">
                  {[
                    'Monthly professional development workshops',
                    'Community forum access',
                    'AMIFS post-nominal designation',
                    'Digital membership credential',
                    '3 job views per day'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-baseline gap-3 text-sm">
                      <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0 bg-slate-300" />
                      <span className="text-slate-600 font-light">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto pt-8 border-t border-slate-100">
                <div className="flex items-end justify-between gap-4 mb-6">
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-2">
                            Membership Fee
                        </p>
                        <span className="text-xl font-bold text-slate-900 font-sans">Free</span>
                    </div>
                </div>
                <Button 
                  onClick={() => handleJoin('associate', 'home_simplified_membership_associate_card')}
                  variant="outline"
                  className="w-full h-12 text-[13px] font-semibold tracking-[0.1em] uppercase transition-all duration-300 border-slate-200 hover:bg-slate-50 text-slate-600 hover:border-slate-300"
                >
                  Join Free
                </Button>
              </div>
            </div>

            {/* Full Member Card */}
            <div className="flex flex-col h-full bg-white p-8 border-t-4 border-t-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 relative">
              <div className="mb-6">
                <div className="flex justify-between items-start mb-6">
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-900">
                        Professional Standard
                    </span>
                    <Crown className="w-6 h-6 stroke-[1.5] text-slate-900" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight leading-tight">Full Membership (MIFS)</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-light">Critical for career growth. Become a practitioner whose standards are regulated and affirmed by IfS.</p>
              </div>

              <div className="w-12 h-px bg-slate-200 mb-8"></div>

              <div className="flex-grow mb-8">
                <ul className="space-y-4">
                  {[
                    'Standards regulated and affirmed by IfS',
                    'Recognition of professional standing',
                    '1 CPD Hour included monthly',
                    'All Associate Membership benefits',
                    '10% discount on training',
                    'MIFS post-nominal designation',
                    'Full Member digital credential'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-baseline gap-3 text-sm">
                      <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0 bg-slate-900" />
                      <span className="text-slate-900 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto pt-8 border-t border-slate-100">
                <div className="flex items-end justify-between gap-4 mb-6">
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-2">
                            Fee Structure
                        </p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-slate-900 font-sans">£20</span>
                            <span className="text-slate-500 text-xs font-medium font-sans">/month</span>
                        </div>
                    </div>
                </div>
                <Button 
                  onClick={() => handleJoin('full', 'home_simplified_membership_full_card')}
                  className="w-full h-12 text-[13px] font-semibold tracking-[0.1em] uppercase transition-all duration-300 bg-slate-900 hover:bg-slate-800 text-white hover:shadow-lg"
                >
                  Commit to Membership
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Button
              onClick={() => handleJoin('associate', 'home_membership_section_footer')}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 rounded-sm"
            >
              Join as an Associate Member for Free
            </Button>
          </div>
        </div>
      </section>

      {/* Free Training Highlight - Enhanced visual treatment */}
      <section className="bg-white py-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl shadow-2xl overflow-hidden">
            <div className="absolute inset-0">
              <img
                  src={nextWorkshop?.imageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80&auto=format&fit=crop"}
                  alt={nextWorkshop?.title || "Expert speaking at a professional development conference"}
                  className="w-full h-full object-cover" />

              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-purple-800/85 to-pink-600/80"></div>
            </div>
            <div className="relative z-10 px-8 py-16 lg:px-16 lg:py-24">
              <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
                <BookOpenCheck className="w-4 h-4 mr-2" />
                FREE FOR ALL MEMBERS
              </div>
              {loadingWorkshop ?
                <Loader2 className="w-8 h-8 text-white animate-spin" /> :
                nextWorkshop ?
                <>
                  <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                    {nextWorkshop.title}
                  </h2>
                  <p className="hidden lg:block text-xl text-purple-100 mb-8 leading-relaxed max-w-3xl">
                    {nextWorkshop.description && nextWorkshop.description.length > 200 ?
                    `${nextWorkshop.description.substring(0, 200)}...` :
                    nextWorkshop.description}
                  </p>
                   <p className="block lg:hidden text-lg text-purple-100 mb-8 leading-relaxed max-w-3xl">
                    {nextWorkshop.description && nextWorkshop.description.length > 120 ?
                    `${nextWorkshop.description.substring(0, 120)}...` :
                    nextWorkshop.description}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      to={`${createPageUrl("EventDetails")}?id=${nextWorkshop.id}&from=Home`}
                      className="inline-flex items-center bg-white text-purple-900 hover:bg-purple-50 font-semibold px-6 py-3 rounded-sm transition-colors">
                      View Details
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                    <div className="inline-flex items-center text-white/80 text-sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      Next session: {format(new Date(nextWorkshop.date), 'do MMMM yyyy')}
                    </div>
                  </div>
                </> :
                <>
                    <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                        Expert-Led Training Sessions
                    </h2>
                    <p className="text-xl text-purple-100 mb-8 leading-relaxed">
                        Our next workshop will be announced soon. All members get access to free monthly training sessions led by industry experts.
                    </p>
                    <Link
                    to={createPageUrl("Events")}
                    className="inline-flex items-center bg-white text-purple-900 hover:bg-purple-50 font-semibold px-6 py-3 rounded-sm transition-colors">
                      See Past Workshops
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                </>
                }
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Enhanced gradient */}
      <section className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to elevate your safeguarding practice?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Join our community of dedicated professionals and access the resources, connections, and expertise you need to make a meaningful difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
                onClick={() => handleJoin('associate', 'home_cta_footer')}
                size="lg"
                className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-semibold px-8 py-4 text-lg rounded-sm shadow-lg hover:shadow-xl transition-all">
              Join for Free Today
            </Button>
            <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-8 py-4 text-lg rounded-sm transition-all"
                asChild>
              <Link to={createPageUrl("About")}>Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
      </main>
    </div>);
}