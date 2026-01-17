// Page configuration for cross-domain routing

export const PORTAL_PAGES = [
  'Dashboard',
  'EditEvent',
  'EditJob',
  'EditCourse',
  'EditSurvey',
  'SurveyResponses',
  'CPDTraining',
  'CourseDetails',
  'MemberMasterclasses',
  'MasterclassDetails',
  'JobsBoard',
  'JobDetails',
  'SupervisionServices',
  'PortalMembershipTiers',
  'MyProfile',
  'MyCertificates',
  'ManageOrganisation',
  'OrganisationMembership',
  'MyMasterclassBookings',
  'RequestOrgPayment',
  'Onboarding',
  'ApplicationProcessing',
  'YourVoice',
  'Survey',
  'EditUser',
  'CommunityEvents',
  'CommunityEventDetails',
  'Support',
  'Forum',
  'ForumPostDetails',
  'News',
  'OrgMembers',
  'OrgJobs',
  'OrgAnalytics',
  'ManageOrgSubscription',
  'OrgProfile',
  'OrgInvoices',
  'MyCreditHistory',
  'Job',
  'TrusteeElections',
  'Organisation'
];

export const ADMIN_PAGES = [
  'AdminDashboard',
  'AdminSupport'
];

export const MAIN_SITE_PAGES = [
  'Home',
  'About',
  'Contact',
  'WhyJoinUs',
  'JoinUs',
  'Membership',
  'MembershipPlans',
  'MembershipTiers',
  'AssociateMembership',
  'FullMembership',
  'MemberBenefits',
  'Training',
  'CPDTrainingMarketing',
  'IntroductoryCourses',
  'AdvancedCourses',
  'RefresherCourses',
  'SpecialistCourses',
  'TrainingCourseDetails',
  'Events',
  'Conferences',
  'EventDetails',
  'EventRegistrationSuccess',
  'SupervisionServicesMarketing',
  'SignpostingService',
  'ForumsAndWorkshops',
  'Governance',
  'Team',
  'IfSBoard',
  'Fellowship',
  'ResearchAndAdvocacy',
  'JobsBoardMarketing',
  'Jobs',
  'ArticlesOfAssociation',
  'TermsAndConditions',
  'PrivacyPolicy',
  'CookiePolicy',
  'RegisteredOrganisation',
  'VerifyCredential',
  'NotFound',
  'MemberAccessRequired',
  'ApplicationPending'
];

export const getPageFromPath = (pathname) => {
  // Remove trailing slash
  if (pathname.endsWith('/') && pathname !== '/') {
    pathname = pathname.slice(0, -1);
  }

  // Get last part of URL
  let urlLastPart = pathname.split('/').pop();

  // Remove query string
  if (urlLastPart.includes('?')) {
    urlLastPart = urlLastPart.split('?')[0];
  }

  // Return the page name or null if root
  return urlLastPart || null;
};

export const isPortalPage = (pageName) => {
  if (!pageName) return false;
  return PORTAL_PAGES.some(page => page.toLowerCase() === pageName.toLowerCase());
};

export const isAdminPage = (pageName) => {
  if (!pageName) return false;
  return ADMIN_PAGES.some(page => page.toLowerCase() === pageName.toLowerCase());
};

export const isMainSitePage = (pageName) => {
  if (!pageName) return true; // Root is main site
  return MAIN_SITE_PAGES.some(page => page.toLowerCase() === pageName.toLowerCase());
};
