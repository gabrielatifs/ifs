
import React, { useState, useEffect } from 'react';
import { Button } from '@ifs/shared/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@ifs/shared/utils';
import { User } from '@ifs/shared/api/entities';
import { Event } from '@ifs/shared/api/entities';
import { ArrowRight, Calendar, Video, Clock, Users, Mic, Archive, Star, UserCircle, Shield, MessageSquare, Loader2 } from 'lucide-react';
import MainSiteNav from '../components/marketing/MainSiteNav';
import HeroBreadcrumbs from '../components/marketing/HeroBreadcrumbs';
import { format } from 'date-fns';
import { usePostHog } from '@ifs/shared/components/providers/PostHogProvider';

const WorkshopCard = ({ event, isPast = false }) => {
  // Extract speaker name if available in the description
  // The regex changed to look for names enclosed in double asterisks (**)
  const speakerMatch = event.description ? event.description.match(/\*\*([^*]+)\*\*/) : null;
  const speakerName = speakerMatch ? speakerMatch[1].trim() : 'Expert Trainer';
  const descriptionText = event.description ? event.description.split("###")[0].trim() : "Details for this event will be available soon.";

  return (
    <Link
      to={`${createPageUrl('EventDetails')}?id=${event.id}&from=ForumsAndWorkshops`}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-transparent hover:border-purple-200 flex flex-col lg:flex-row group overflow-hidden">

            {/* Image Section */}
            <div className="lg:w-1/3 relative">
                <div className="aspect-[16/10] lg:aspect-auto lg:h-full">
                    <img
            src={event.imageUrl || 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=400&auto=format&fit=crop'}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute top-4 right-4 bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {event.type}
                </div>
            </div>

            {/* Content Section */}
            <div className="lg:w-2/3 flex flex-col">
                <div className="p-6 md:p-8 flex-grow">
                    <div className="flex items-start gap-6">
                        {/* Date Block */}
                        <div className="flex-shrink-0 text-center">
                            <div className="text-sm font-semibold text-pink-600 uppercase tracking-wide">
                                {format(new Date(event.date), 'MMM')}
                            </div>
                            <div className="text-4xl font-bold text-gray-900 -mt-1">
                                {format(new Date(event.date), 'dd')}
                            </div>
                        </div>

                        {/* Main Info */}
                        <div className="flex-grow">
                            <div className="mb-3">
                                <span className="inline-flex items-center bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                    <Star className="w-3 h-3 mr-1.5" />
                                    Expert-Led Session
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold text-black mb-3 leading-tight group-hover:text-purple-800 transition-colors">
                                {event.title}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                                {descriptionText}
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Footer Section */}
                <div className="bg-slate-50/70 mt-auto px-6 md:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-x-4 gap-y-2 text-sm text-gray-700 flex-wrap">
                        <div className="flex items-center gap-1.5 font-medium">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>{format(new Date(event.date), 'p')}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium">
                            <Video className="w-4 h-4 text-gray-500" />
                            <span>{event.location}</span>
                        </div>
                         <div className="flex items-center gap-1.5 font-medium">
                            <UserCircle className="w-4 h-4 text-gray-500" />
                            <span>{speakerName}</span>
                        </div>
                    </div>
                    {isPast ?
          <Button variant="outline" size="sm" disabled className="w-full sm:w-auto">
                            <Archive className="w-4 h-4 mr-2" />
                            Recording Unavailable
                        </Button> :

          <Button asChild size="sm" className="bg-purple-700 hover:bg-purple-800 w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow" onClick={(e) => {e.stopPropagation();e.preventDefault();window.open(createPageUrl(`EventDetails?id=${event.id}&from=ForumsAndWorkshops`), '_self');}}>
                           <span className="cursor-pointer">
                                Register Now <ArrowRight className="w-4 h-4 ml-2" />
                           </span>
                        </Button>
          }
                </div>
            </div>
        </Link>);

};

export default function ForumsAndWorkshops() {
  const [loading, setLoading] = useState(true); // Fixed: Changed 'workshops' to 'loading'
  const { trackEvent } = usePostHog();
  const [workshops, setWorkshops] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const allEvents = await Event.list('-date');
        const allWorkshops = allEvents.filter((e) => e.type === 'Workshop');
        const now = new Date();

        // Only store upcoming workshops in the 'workshops' state
        setWorkshops(allWorkshops.filter((e) => new Date(e.date) >= now));
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleJoin = (location) => {
      trackEvent('join_button_clicked', {
        intent: 'associate',
        location: location || 'forums_workshops_page_hero',
        user_type: 'anonymous'
      });
      const url = createPageUrl('Onboarding') + '?intent=associate';
      User.loginWithRedirect(url);
  };

  return (
    <>
            {/* Hero Section - Full IoD Style */}
            <section className="relative bg-gray-900 overflow-hidden" style={{ minHeight: '600px' }}>
                
                {/* Full-width Background Image */}
                <div className="absolute inset-0 hidden lg:block">
                    <img
            src="https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=2070&auto=format&fit=crop"
            alt="Professionals in a workshop"
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

                <MainSiteNav />

                {/* Hero Content */}
                <div className="relative z-10 max-w-screen-xl mx-auto">
                    <div className="grid lg:grid-cols-2 items-center min-h-[600px]">
                        {/* Left Column - Content */}
                        <div className="px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center lg:text-left">
                            <HeroBreadcrumbs pageName="ForumsAndWorkshops" />
                            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                                Member Forums & Workshops
                            </h1>
                            <div className="text-lg lg:text-xl text-purple-100 mb-8 leading-relaxed space-y-4">
                                <p>
                                    Connect with peers and learn from experts in our exclusive member workshops.
                                </p>
                                <p className="hidden lg:block">
                                    Join moderated discussions, participate in expert-led workshops, and build lasting professional relationships with fellow safeguarding practitioners.
                                </p>
                            </div>
                            <div className="hidden lg:inline-flex items-center gap-4">
                                <Button
                                    onClick={() => {
                                        const workshopsSection = document.getElementById('workshops-section');
                                        if (workshopsSection) {
                                            workshopsSection.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }}
                                    size="lg"
                                    className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm"
                                >
                                    View Workshops
                                </Button>
                                <Button
                                  onClick={() => handleJoin('forums_workshops_hero_desktop')}
                                  size="lg"
                                  variant="outline"
                                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-800 font-semibold px-8 py-3 text-base rounded-sm transition-all"
                                >
                                  Become a Member for Free
                                </Button>
                            </div>
                             <div className="mt-8 lg:hidden">
                                <Button
                                    onClick={() => handleJoin('forums_workshops_hero_mobile')}
                                    size="lg"
                                    className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm w-full sm:w-auto">
                                    Become a Member for Free
                                </Button>
                            </div>
                        </div>
                        
                        {/* Right column is empty, space is filled by the background image */}
                        <div className="hidden lg:block"></div>
                    </div>
                </div>
            </section>

            {/* Forum Description Section */}
            <section className="bg-white py-24">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl lg:text-5xl font-bold text-black leading-tight">Your space for professional dialogue

              </h2>
                            <p className="text-lg text-gray-600 leading-relaxed mt-6">
                                Our member-only forums provide a confidential and supportive environment to discuss complex cases, share best practices, and seek advice from a community of trusted safeguarding professionals. Moderated by experts, our forums are the heart of our peer support network.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-slate-50 p-6 rounded-lg">
                                <Users className="w-8 h-8 text-purple-600 mb-3" />
                                <h3 className="font-bold text-lg">Peer Support</h3>
                                <p className="text-sm text-gray-600">Connect with fellow DSLs and safeguarding practitioners.</p>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-lg">
                                <Mic className="w-8 h-8 text-purple-600 mb-3" />
                                <h3 className="font-bold text-lg">Expert Moderation</h3>
                                <p className="text-sm text-gray-600">Discussions guided by seasoned professionals.</p>
                            </div>
                             <div className="bg-slate-50 p-6 rounded-lg">
                                <Archive className="w-8 h-8 text-purple-600 mb-3" />
                                <h3 className="font-bold text-lg">Resource Sharing</h3>
                                <p className="text-sm text-gray-600">Exchange templates, policies, and useful materials.</p>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-lg">
                                <Shield className="w-8 h-8 text-purple-600 mb-3" />
                                <h3 className="font-bold text-lg">Confidential Space</h3>
                                <p className="text-sm text-gray-600">Secure environment for sensitive professional discussions.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Upcoming Workshops Section */}
            <section id="workshops-section" className="bg-slate-50 py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-left mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                            Upcoming Workshops
                        </h2>
                        <p className="text-lg text-gray-600 max-w-3xl">
                            Register for our upcoming live sessions to enhance your skills and knowledge.
                        </p>
                    </div>

                    {loading ?
          <p>Loading workshops...</p> :
          workshops.length > 0 ?
          <div className="space-y-6">
                            {workshops.map((event) =>
            <WorkshopCard key={event.id} event={event} />
            )}
                        </div> :

          <div className="text-center py-12 px-4 border-2 border-dashed rounded-lg">
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="font-semibold text-gray-800">No upcoming workshops scheduled</h3>
                            <p className="text-sm text-gray-500">Please check back soon for new events.</p>
                        </div>
          }
                </div>
            </section>
            
            {/* Call to Action */}
            <section className="bg-gray-900 py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                        Ready to join the conversation?
                    </h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                        Become a member today to access our exclusive forums, register for workshops, and unlock a wealth of resources.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
              onClick={handleJoin}
              size="lg"
              className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-semibold px-8 py-4 text-lg rounded-sm shadow-lg hover:shadow-xl transition-all">

                            Apply for Membership
                        </Button>
                        <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-8 py-4 text-lg rounded-sm transition-all"
              asChild>

                            <Link to={createPageUrl("Membership")}>Compare Membership Tiers</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </>);

}
