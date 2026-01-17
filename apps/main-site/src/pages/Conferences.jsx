
import React, { useState, useEffect } from 'react';
import { Button } from '@ifs/shared/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@ifs/shared/utils';
import { User } from '@ifs/shared/api/entities';
import { Event } from '@ifs/shared/api/entities';
import { ArrowRight, Calendar, MapPin, Clock, Users, Star, UserCircle, Presentation, Loader2 } from 'lucide-react';
import MainSiteNav from '../components/marketing/MainSiteNav';
import HeroBreadcrumbs from '../components/marketing/HeroBreadcrumbs';
import { format } from 'date-fns';
import { usePostHog } from '@ifs/shared/components/providers/PostHogProvider';

const ConferenceCard = ({ event }) => {
    const speakerMatch = event.description.match(/\*\*([^*]+)\*\*/);
    const speakerName = speakerMatch ? speakerMatch[1].trim() : 'Expert Speakers';

    return (
        <Link 
            to={createPageUrl(`EventDetails?id=${event.id}`)}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-transparent hover:border-purple-200 flex flex-col lg:flex-row group overflow-hidden"
        >
            <div className="lg:w-1/3 relative">
                <div className="aspect-[16/10] lg:aspect-auto lg:h-full">
                    <img 
                        src={event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=400&auto=format&fit=crop'} 
                        alt={event.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute top-4 right-4 bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {event.type}
                </div>
            </div>
            <div className="lg:w-2/3 flex flex-col">
                <div className="p-6 md:p-8 flex-grow">
                    <div className="flex items-start gap-6">
                        <div className="flex-shrink-0 text-center">
                            <div className="text-sm font-semibold text-pink-600 uppercase tracking-wide">
                                {format(new Date(event.date), 'MMM')}
                            </div>
                            <div className="text-4xl font-bold text-gray-900 -mt-1">
                                {format(new Date(event.date), 'dd')}
                            </div>
                        </div>
                        <div className="flex-grow">
                            <div className="mb-3">
                                <span className="inline-flex items-center bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                    <Star className="w-3 h-3 mr-1.5" />
                                    Flagship Event
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold text-black mb-3 leading-tight group-hover:text-purple-800 transition-colors">
                                {event.title}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                                {event.description.split("###")[0].trim()}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-50/70 mt-auto px-6 md:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-x-4 gap-y-2 text-sm text-gray-700 flex-wrap">
                        <div className="flex items-center gap-1.5 font-medium">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>{format(new Date(event.date), 'p')}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium">
                            <UserCircle className="w-4 h-4 text-gray-500" />
                            <span>{speakerName}</span>
                        </div>
                    </div>
                    <Button asChild size="sm" className="bg-purple-700 hover:bg-purple-800 w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow" onClick={(e) => e.stopPropagation()}>
                        <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer">
                            Register Now <ArrowRight className="w-4 h-4 ml-2" />
                        </a>
                    </Button>
                </div>
            </div>
        </Link>
    );
};

export default function Conferences() {
    const [conferences, setConferences] = useState([]);
    const [loading, setLoading] = useState(true);
    const { trackEvent } = usePostHog();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const allEvents = await Event.list('-date');
                const allConferences = allEvents.filter(e => e.type === 'Conference');
                setConferences(allConferences);
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
          location: location || 'conferences_page_hero',
          user_type: 'anonymous'
        });
        const url = createPageUrl('Onboarding') + '?intent=associate';
        User.loginWithRedirect(url);
    };

    const now = new Date();
    const upcomingConferences = conferences.filter(e => new Date(e.date) >= now);
    const pastConferences = conferences.filter(e => new Date(e.date) < now).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort past events descending by date

    return (
        <>
            {/* Hero Section */}
            <section className="relative bg-gray-900 overflow-hidden" style={{ minHeight: '600px' }}>
                <div className="absolute inset-0 hidden lg:block">
                    <img 
                        src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop" 
                        alt="Professional conference with keynote speaker"
                        className="w-full h-full object-cover object-center"
                        style={{ filter: 'grayscale(100%) contrast(1.1)' }}
                    />
                </div>
                <div 
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to right, #5e028f 45%, rgba(94, 2, 143, 0.2) 65%, transparent 100%)' }}
                ></div>
                <div className="absolute inset-0 bg-purple-800 lg:hidden"></div>
                
                <MainSiteNav />

                <div className="relative z-10 max-w-screen-xl mx-auto">
                    <div className="grid lg:grid-cols-2 items-center min-h-[600px]">
                        <div className="px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center lg:text-left">
                            <HeroBreadcrumbs pageName="Conferences" />
                            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                                Professional Conferences
                            </h1>
                            <div className="text-lg lg:text-xl text-purple-100 mb-8 leading-relaxed space-y-4">
                                <p>
                                    Join leading experts and practitioners at our flagship safeguarding conferences.
                                </p>
                                <p className="hidden lg:block">
                                    Connect with the safeguarding community, hear from keynote speakers, and discover the latest research and best practices in our sector.
                                </p>
                            </div>
                            <div className="hidden lg:inline-flex items-center gap-4">
                                <Button
                                    onClick={() => {
                                        const conferencesSection = document.getElementById('conferences-section');
                                        if (conferencesSection) {
                                            conferencesSection.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }}
                                    size="lg"
                                    className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm"
                                >
                                    View Conferences
                                </Button>
                                <Button
                                  onClick={() => handleJoin('conferences_hero_desktop')}
                                  size="lg"
                                  variant="outline"
                                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-800 font-semibold px-8 py-3 text-base rounded-sm transition-all"
                                >
                                  Become a Member for Free
                                </Button>
                            </div>
                            <div className="mt-8 lg:hidden">
                                <Button
                                    onClick={() => handleJoin('conferences_hero_mobile')}
                                    size="lg"
                                    className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm w-full sm:w-auto">
                                    Become a Member for Free
                                </Button>
                            </div>
                        </div>
                        <div className="hidden lg:block"></div>
                    </div>
                </div>
            </section>

            <section className="bg-white py-24">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl lg:text-5xl font-bold text-black leading-tight">
                                Where safeguarding leaders gather to shape the future
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed mt-6">
                                Our conferences bring together over 1,000 safeguarding professionals annually, creating the UK's most important gathering for sector leaders. From policy makers to frontline practitioners, these events drive innovation and excellence across the safeguarding landscape.
                            </p>
                            <Button 
                                onClick={() => handleJoin('conferences_mid_section')}
                                size="lg" 
                                className="bg-black hover:bg-gray-800 text-white font-semibold px-8 py-3 rounded-sm mt-8"
                            >
                                Register for Events
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-slate-50 p-6 rounded-lg">
                                <Users className="w-8 h-8 text-purple-600 mb-3" />
                                <h3 className="font-bold text-lg">Expert Speakers</h3>
                                <p className="text-sm text-gray-600">Leading researchers, policymakers, and practitioners.</p>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-lg">
                                <Calendar className="w-8 h-8 text-purple-600 mb-3" />
                                <h3 className="font-bold text-lg">Annual Programme</h3>
                                <p className="text-sm text-gray-600">Flagship conferences and regional events throughout the year.</p>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-lg">
                                <Star className="w-8 h-8 text-purple-600 mb-3" />
                                <h3 className="font-bold text-lg">CPD Accredited</h3>
                                <p className="text-sm text-gray-600">All events provide recognised professional development hours.</p>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-lg">
                                <MapPin className="w-8 h-8 text-purple-600 mb-3" />
                                <h3 className="font-bold text-lg">National Reach</h3>
                                <p className="text-sm text-gray-600">Events across England, Scotland, Wales, and Northern Ireland.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="conferences-section" className="bg-slate-50 py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-left mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                            Upcoming Conferences
                        </h2>
                        <p className="text-lg text-gray-600 max-w-3xl">
                            Register for our upcoming flagship events and regional conferences.
                        </p>
                    </div>

                    {loading ? (
                        <div className="text-center py-12 px-4">
                            <Loader2 className="w-12 h-12 text-gray-300 mx-auto mb-4 animate-spin" />
                            <p className="text-lg text-gray-500">Loading conferences...</p>
                        </div>
                    ) : upcomingConferences.length > 0 ? (
                        <div className="space-y-6">
                            {upcomingConferences.map(event => (
                                <ConferenceCard key={event.id} event={event} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 px-4 border-2 border-dashed rounded-lg">
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="font-semibold text-gray-800">No upcoming conferences scheduled</h3>
                            <p className="text-sm text-gray-500">Please check back soon for new events or join our mailing list for updates.</p>
                        </div>
                    )}
                </div>
            </section>

            <section className="bg-white py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-left mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                            Past Conferences
                        </h2>
                        <p className="text-lg text-gray-600 max-w-3xl">
                            Explore our archive of previous conferences and access available materials.
                        </p>
                    </div>

                    {loading ? (
                        <div className="text-center py-12 px-4">
                            <Loader2 className="w-12 h-12 text-gray-300 mx-auto mb-4 animate-spin" />
                            <p className="text-lg text-gray-500">Loading conference archive...</p>
                        </div>
                    ) : pastConferences.length > 0 ? (
                        <div className="space-y-6">
                            {pastConferences.map(event => (
                                <ConferenceCard key={event.id} event={event} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 px-4 border-2 border-dashed rounded-lg">
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="font-semibold text-gray-800">Conference archive is empty</h3>
                            <p className="text-sm text-gray-500">Materials will appear here after conference events.</p>
                        </div>
                    )}
                </div>
            </section>
            
            <section className="bg-gray-900 py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                        Join the UK's leading safeguarding community
                    </h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                        Connect with peers, learn from experts, and contribute to the advancement of safeguarding practice at our world-class events.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button 
                            onClick={() => handleJoin('conferences_bottom_cta')}
                            size="lg" 
                            className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-semibold px-8 py-4 text-lg rounded-sm shadow-lg hover:shadow-xl transition-all"
                        >
                            Register for Membership
                        </Button>
                        <Button 
                            size="lg" 
                            variant="outline"
                            className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-8 py-4 text-lg rounded-sm transition-all"
                            asChild
                        >
                            <Link to={createPageUrl("Contact")}>Contact Event Team</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
}
