import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import {
  BASE_URL,
  DEFAULT_OG_IMAGE,
  pageSEO,
  pathToPageName,
} from '../../seo-config.js';

// Re-export pageSEO so existing imports from this file still work
export { pageSEO } from '../../seo-config.js';

// Portal pages - these are noindexed and just need basic titles
export const portalPageTitles = {
  Dashboard: 'Dashboard - IfS Member Portal',
  AdminDashboard: 'Admin Dashboard - IfS',
  MemberMasterclasses: 'Masterclasses & Events - IfS Member Portal',
  MasterclassDetails: 'Masterclass Details - IfS Member Portal',
  CPDTraining: 'CPD & Training - IfS Member Portal',
  CourseDetails: 'Course Details - IfS Member Portal',
  JobsBoard: 'Jobs Board - IfS Member Portal',
  JobDetails: 'Job Details - IfS Member Portal',
  MyProfile: 'My Profile - IfS Member Portal',
  MyCertificates: 'My Certificates - IfS Member Portal',
  MyCreditHistory: 'My Credit History - IfS Member Portal',
  MyMasterclassBookings: 'My Bookings - IfS Member Portal',
  ManageOrganisation: 'Manage Organisation - IfS',
  OrganisationMembership: 'Organisation Membership - IfS',
  RequestOrgPayment: 'Request Organisation Payment - IfS',
  PortalMembershipTiers: 'Membership Tiers - IfS Member Portal',
  SupervisionServices: 'Supervision Services - IfS Member Portal',
  CommunityEvents: 'Community Events - IfS Member Portal',
  CommunityEventDetails: 'Community Event Details - IfS',
  Forum: 'Community Forum - IfS Member Portal',
  ForumPostDetails: 'Forum Post - IfS Member Portal',
  Support: 'Support - IfS Member Portal',
  AdminSupport: 'Support Admin - IfS',
  YourVoice: 'Your Voice - IfS Member Portal',
  Survey: 'Survey - IfS Member Portal',
  News: 'News & Updates - IfS',
  Onboarding: 'Welcome - IfS Member Portal',
  ApplicationProcessing: 'Application Processing - IfS',
  EditEvent: 'Edit Event - IfS Admin',
  EditJob: 'Edit Job - IfS Admin',
  EditCourse: 'Edit Course - IfS Admin',
  EditSurvey: 'Edit Survey - IfS Admin',
  EditUser: 'Edit User - IfS Admin',
  SurveyResponses: 'Survey Responses - IfS Admin',
  OrgMembers: 'Organisation Members - IfS',
  OrgJobs: 'Organisation Jobs - IfS',
  OrgAnalytics: 'Organisation Analytics - IfS',
  OrgProfile: 'Organisation Profile - IfS',
  OrgInvoices: 'Organisation Invoices - IfS',
  ManageOrgSubscription: 'Manage Subscription - IfS',
};

export default function SEOManager({ pageName, isPortalPage = false }) {
  const location = useLocation();

  // Derive the actual page name from URL path (since pageName might be "MainSite")
  const pathname = location.pathname;

  // Check for dynamic routes first (job details, course details, event details)
  let resolvedPageName = pageName;
  if (pathname.startsWith('/job/') && pathname !== '/job') {
    resolvedPageName = 'JobDetailsPublic';
  } else if (pathname.startsWith('/course/')) {
    resolvedPageName = 'TrainingCourseDetails';
  } else if (pathname.startsWith('/event/')) {
    resolvedPageName = 'EventDetails';
  } else {
    // Use path mapping for static routes
    resolvedPageName = pathToPageName[pathname] || pageName;
  }

  // For portal pages, just set a simple title (they're noindexed anyway)
  if (isPortalPage && portalPageTitles[resolvedPageName]) {
    const title = portalPageTitles[resolvedPageName] || `${resolvedPageName} - IfS Member Portal`;
    return (
      <Helmet>
        <title>{title}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
    );
  }

  // For marketing pages, use full SEO config
  const seo = pageSEO[resolvedPageName];

  // Fallback for pages not in config
  if (!seo) {
    const fallbackTitle = resolvedPageName === 'MainSite'
      ? 'Independent Federation for Safeguarding'
      : `${resolvedPageName} - Independent Federation for Safeguarding`;
    return (
      <Helmet>
        <title>{fallbackTitle}</title>
        <meta property="og:title" content={fallbackTitle} />
        <meta name="twitter:title" content={fallbackTitle} />
      </Helmet>
    );
  }

  const canonicalUrl = `${BASE_URL}${seo.canonical}`;

  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Language */}
      <html lang="en-gb" />
      <link rel="alternate" hrefLang="en-gb" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={seo.ogTitle || seo.title} />
      <meta property="og:description" content={seo.ogDescription || seo.description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Independent Federation for Safeguarding" />
      <meta property="og:image" content={seo.ogImage || DEFAULT_OG_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.ogTitle || seo.title} />
      <meta name="twitter:description" content={seo.ogDescription || seo.description} />
      <meta name="twitter:image" content={seo.ogImage || DEFAULT_OG_IMAGE} />

      {/* Robots */}
      {seo.noindex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
}
