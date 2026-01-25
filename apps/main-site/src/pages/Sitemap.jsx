import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@ifs/shared/utils';
import { Job, Course, CourseDate, CommunityEvent } from '@ifs/shared/api/entities';
import { ifs } from '@ifs/shared/api/ifsClient';
import { Loader2, FileText, Briefcase, Calendar, BookOpen, Building2, Users, Shield, HelpCircle } from 'lucide-react';
import MainSiteNav from '../components/marketing/MainSiteNav';
import HeroBreadcrumbs from '../components/marketing/HeroBreadcrumbs';

// Sitemap sections with their pages
const sitemapSections = [
  {
    title: 'Main Pages',
    icon: FileText,
    pages: [
      { name: 'Home', path: '/' },
      { name: 'About Us', path: '/About' },
      { name: 'Contact', path: '/Contact' },
      { name: 'Our Team', path: '/Team' },
    ],
  },
  {
    title: 'Membership',
    icon: Users,
    pages: [
      { name: 'Membership Overview', path: '/Membership' },
      { name: 'Membership Tiers', path: '/MembershipTiers' },
      { name: 'Member Benefits', path: '/MemberBenefits' },
      { name: 'Associate Membership', path: '/AssociateMembership' },
      { name: 'Full Membership', path: '/FullMembership' },
      { name: 'Fellowship', path: '/Fellowship' },
      { name: 'Why Join Us', path: '/WhyJoinUs' },
      { name: 'Join Us', path: '/JoinUs' },
      { name: 'For Organisations', path: '/RegisteredOrganisation' },
    ],
  },
  {
    title: 'Training & CPD',
    icon: BookOpen,
    pages: [
      { name: 'Training Overview', path: '/Training' },
      { name: 'CPD Training', path: '/CPDTrainingMarketing' },
      { name: 'Foundation Courses', path: '/IntroductoryCourses' },
      { name: 'Advanced Courses', path: '/AdvancedCourses' },
      { name: 'Refresher Courses', path: '/RefresherCourses' },
      { name: 'Specialist Courses', path: '/SpecialistCourses' },
    ],
  },
  {
    title: 'Events',
    icon: Calendar,
    pages: [
      { name: 'All Events', path: '/Events' },
      { name: 'Conferences', path: '/Conferences' },
      { name: 'Forums & Workshops', path: '/ForumsAndWorkshops' },
    ],
  },
  {
    title: 'Jobs',
    icon: Briefcase,
    pages: [
      { name: 'Jobs Board', path: '/job' },
      { name: 'Post a Job', path: '/JobsBoardMarketing' },
    ],
  },
  {
    title: 'Services',
    icon: HelpCircle,
    pages: [
      { name: 'Supervision Services', path: '/SupervisionServicesMarketing' },
      { name: 'Signposting Service', path: '/SignpostingService' },
      { name: 'Research & Advocacy', path: '/ResearchAndAdvocacy' },
    ],
  },
  {
    title: 'Governance',
    icon: Building2,
    pages: [
      { name: 'Governance', path: '/Governance' },
      { name: 'IfS Board', path: '/IfSBoard' },
      { name: 'Articles of Association', path: '/ArticlesOfAssociation' },
    ],
  },
  {
    title: 'Legal',
    icon: Shield,
    pages: [
      { name: 'Privacy Policy', path: '/PrivacyPolicy' },
      { name: 'Terms & Conditions', path: '/TermsAndConditions' },
      { name: 'Cookie Policy', path: '/CookiePolicy' },
    ],
  },
];

function generateJobSlug(job) {
  const title = job.title || '';
  const company = job.companyName || '';
  const id = job.id || '';

  const slugPart = `${title}-${company}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);

  return `${slugPart}-${id.slice(0, 8)}`;
}

export default function Sitemap() {
  const [loading, setLoading] = useState(true);
  const [activeJobs, setActiveJobs] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);

  useEffect(() => {
    const fetchDynamicContent = async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Fetch all data in parallel
        const [jobs, events, communityEvents, courseDates, courses] = await Promise.all([
          Job.list('-created_at').catch(() => []),
          ifs.entities.Event.list('date').catch(() => []),
          CommunityEvent.filter({ status: 'Active' }, 'date').catch(() => []),
          CourseDate.filter({ status: 'Available' }, 'date').catch(() => []),
          Course.list().catch(() => []),
        ]);

        // Filter active jobs (not expired)
        const filteredJobs = (jobs || []).filter((job) => {
          if (!job.applicationDeadline) return true;
          return new Date(job.applicationDeadline) >= today;
        });
        setActiveJobs(filteredJobs.slice(0, 20)); // Limit for display

        // Filter upcoming events
        const allEvents = [
          ...(events || []).map((e) => ({ ...e, source: 'Event' })),
          ...(communityEvents || []).map((e) => ({ ...e, source: 'CommunityEvent' })),
        ];
        const filteredEvents = allEvents.filter((e) => new Date(e.date) >= today);
        filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
        setUpcomingEvents(filteredEvents.slice(0, 20)); // Limit for display

        // Filter courses with available dates
        const upcomingCourseDates = (courseDates || []).filter((cd) => new Date(cd.date) >= today);
        const courseIdsWithDates = [...new Set(upcomingCourseDates.map((cd) => cd.courseId))];
        const filteredCourses = (courses || []).filter((c) => courseIdsWithDates.includes(c.id));
        setAvailableCourses(filteredCourses.slice(0, 20)); // Limit for display
      } catch (error) {
        console.error('Error fetching sitemap data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDynamicContent();
  }, []);

  return (
    <>
      <Helmet>
        <title>Sitemap | Independent Federation for Safeguarding</title>
        <meta name="description" content="Navigate all pages on the Independent Federation for Safeguarding website. Find information about membership, training, events, jobs, and more." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${window.location.origin}/Sitemap`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero Section */}
        <div className="relative bg-purple-800 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 lg:pt-24 pb-12 lg:pb-16">
            <MainSiteNav />
            <div className="mt-8">
              <HeroBreadcrumbs currentPage="Sitemap" />
              <h1 className="text-3xl lg:text-4xl font-bold text-white mt-4">
                Sitemap
              </h1>
              <p className="mt-4 text-lg text-purple-100 max-w-2xl">
                Find everything on our website. Browse all pages, active job listings, upcoming events, and available training courses.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Static Pages */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {sitemapSections.map((section) => (
              <div key={section.title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <section.icon className="w-5 h-5 text-purple-700" />
                  </div>
                  <h2 className="font-bold text-gray-900">{section.title}</h2>
                </div>
                <ul className="space-y-2">
                  {section.pages.map((page) => (
                    <li key={page.path}>
                      <Link
                        to={createPageUrl(page.path === '/' ? 'Home' : page.path.replace('/', ''))}
                        className="text-gray-600 hover:text-purple-700 hover:underline text-sm transition-colors"
                      >
                        {page.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Dynamic Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <span className="ml-3 text-gray-600">Loading dynamic content...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Active Jobs */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Briefcase className="w-5 h-5 text-blue-700" />
                  </div>
                  <h2 className="font-bold text-gray-900">Active Job Listings</h2>
                  <span className="ml-auto text-sm text-gray-500">{activeJobs.length}</span>
                </div>
                {activeJobs.length === 0 ? (
                  <p className="text-gray-500 text-sm">No active job listings at the moment.</p>
                ) : (
                  <ul className="space-y-2 max-h-96 overflow-y-auto">
                    {activeJobs.map((job) => (
                      <li key={job.id}>
                        <Link
                          to={`/job/${generateJobSlug(job)}`}
                          className="text-gray-600 hover:text-purple-700 hover:underline text-sm transition-colors block truncate"
                          title={job.title}
                        >
                          {job.title}
                          {job.companyName && (
                            <span className="text-gray-400"> - {job.companyName}</span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  to={createPageUrl('Job')}
                  className="mt-4 inline-block text-purple-700 hover:text-purple-800 text-sm font-medium"
                >
                  View all jobs &rarr;
                </Link>
              </div>

              {/* Upcoming Events */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-green-700" />
                  </div>
                  <h2 className="font-bold text-gray-900">Upcoming Events</h2>
                  <span className="ml-auto text-sm text-gray-500">{upcomingEvents.length}</span>
                </div>
                {upcomingEvents.length === 0 ? (
                  <p className="text-gray-500 text-sm">No upcoming events scheduled.</p>
                ) : (
                  <ul className="space-y-2 max-h-96 overflow-y-auto">
                    {upcomingEvents.map((event) => (
                      <li key={event.id}>
                        <Link
                          to={`${createPageUrl('EventDetails')}?id=${event.id}`}
                          className="text-gray-600 hover:text-purple-700 hover:underline text-sm transition-colors block truncate"
                          title={event.title}
                        >
                          {event.title}
                          <span className="text-gray-400 text-xs ml-2">
                            {new Date(event.date).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  to={createPageUrl('Events')}
                  className="mt-4 inline-block text-purple-700 hover:text-purple-800 text-sm font-medium"
                >
                  View all events &rarr;
                </Link>
              </div>

              {/* Available Courses */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <BookOpen className="w-5 h-5 text-orange-700" />
                  </div>
                  <h2 className="font-bold text-gray-900">Available Courses</h2>
                  <span className="ml-auto text-sm text-gray-500">{availableCourses.length}</span>
                </div>
                {availableCourses.length === 0 ? (
                  <p className="text-gray-500 text-sm">No courses with available dates.</p>
                ) : (
                  <ul className="space-y-2 max-h-96 overflow-y-auto">
                    {availableCourses.map((course) => (
                      <li key={course.id}>
                        <Link
                          to={`${createPageUrl('TrainingCourseDetails')}?id=${course.id}`}
                          className="text-gray-600 hover:text-purple-700 hover:underline text-sm transition-colors block truncate"
                          title={course.title}
                        >
                          {course.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  to={createPageUrl('Training')}
                  className="mt-4 inline-block text-purple-700 hover:text-purple-800 text-sm font-medium"
                >
                  View all training &rarr;
                </Link>
              </div>
            </div>
          )}

          {/* XML Sitemap Note */}
          <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">For Search Engines</h3>
            <p className="text-gray-600 text-sm">
              An XML sitemap for search engine crawlers is available at{' '}
              <a
                href="/sitemap.xml"
                className="text-purple-700 hover:underline font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                /sitemap.xml
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
