import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { BASE_URL, DEFAULT_OG_IMAGE, pageSEO, pathToPageName } from '../../seo-config.js';

// Organization JSON-LD (rendered on every marketing page)
const ORGANIZATION_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Independent Federation for Safeguarding',
  alternateName: 'IfS',
  url: BASE_URL,
  logo: DEFAULT_OG_IMAGE,
  description: "The UK's trusted professional body for safeguarding. Supporting professionals through training, events, supervision, and community.",
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: 'info@ifs-safeguarding.co.uk',
    url: `${BASE_URL}/Contact`,
  },
};

// Breadcrumb hierarchy mapping: pageName -> { label, parent (pageName) }
const breadcrumbHierarchy = {
  Home: { label: 'Home', parent: null },
  About: { label: 'About Us', parent: 'Home' },
  Contact: { label: 'Contact', parent: 'Home' },
  Team: { label: 'Our Team', parent: 'About' },
  Governance: { label: 'Governance', parent: 'About' },
  IfSBoard: { label: 'Board of Trustees', parent: 'Governance' },
  ArticlesOfAssociation: { label: 'Articles of Association', parent: 'Governance' },
  Events: { label: 'Events', parent: 'Home' },
  EventDetails: { label: 'Event Details', parent: 'Events' },
  Conferences: { label: 'Conferences', parent: 'Events' },
  ForumsAndWorkshops: { label: 'Forums & Workshops', parent: 'Events' },
  Training: { label: 'Training', parent: 'Home' },
  TrainingCourseDetails: { label: 'Course Details', parent: 'Training' },
  CPDTrainingMarketing: { label: 'CPD & Training', parent: 'Training' },
  IntroductoryCourses: { label: 'Foundation Courses', parent: 'Training' },
  AdvancedCourses: { label: 'Advanced Courses', parent: 'Training' },
  RefresherCourses: { label: 'Refresher Courses', parent: 'Training' },
  SpecialistCourses: { label: 'Specialist Courses', parent: 'Training' },
  Jobs: { label: 'Jobs', parent: 'Home' },
  JobsBoardMarketing: { label: 'Jobs Board', parent: 'Home' },
  JobDetailsPublic: { label: 'Job Details', parent: 'Jobs' },
  Membership: { label: 'Membership', parent: 'Home' },
  MembershipTiers: { label: 'Membership Tiers', parent: 'Membership' },
  MemberBenefits: { label: 'Member Benefits', parent: 'Membership' },
  AssociateMembership: { label: 'Associate Membership', parent: 'Membership' },
  FullMembership: { label: 'Full Membership', parent: 'Membership' },
  Fellowship: { label: 'Fellowship', parent: 'Membership' },
  WhyJoinUs: { label: 'Why Join Us', parent: 'Membership' },
  JoinUs: { label: 'Join Us', parent: 'Membership' },
  SupervisionServicesMarketing: { label: 'Supervision Services', parent: 'Home' },
  SignpostingService: { label: 'Signposting Service', parent: 'Home' },
  ResearchAndAdvocacy: { label: 'Research & Advocacy', parent: 'Home' },
  PrivacyPolicy: { label: 'Privacy Policy', parent: 'Home' },
  TermsAndConditions: { label: 'Terms & Conditions', parent: 'Home' },
  CookiePolicy: { label: 'Cookie Policy', parent: 'Home' },
  VerifyCredential: { label: 'Verify Credential', parent: 'Home' },
  RegisteredOrganisation: { label: 'Registered Organisation', parent: 'Home' },
  Sitemap: { label: 'Sitemap', parent: 'Home' },
};

function buildBreadcrumbJsonLd(resolvedPageName) {
  const entry = breadcrumbHierarchy[resolvedPageName];
  if (!entry) return null;

  // Walk up the hierarchy to build the breadcrumb trail
  const trail = [];
  let current = resolvedPageName;
  while (current) {
    const node = breadcrumbHierarchy[current];
    if (!node) break;
    const seo = pageSEO[current];
    trail.unshift({ name: node.label, url: seo ? `${BASE_URL}${seo.canonical}` : BASE_URL });
    current = node.parent;
  }

  if (trail.length < 2) return null; // No breadcrumb for homepage alone

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

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
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(resolvedPageName);

  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <link rel="canonical" href={canonicalUrl} />

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

      {/* Structured Data - Organization */}
      <script type="application/ld+json">{JSON.stringify(ORGANIZATION_JSONLD)}</script>

      {/* Structured Data - Breadcrumbs */}
      {breadcrumbJsonLd && (
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      )}
    </Helmet>
  );
}
