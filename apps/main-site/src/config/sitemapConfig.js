/**
 * Sitemap Configuration
 *
 * Defines static routes and their SEO properties for the sitemap.
 * Dynamic routes (jobs, events, courses) are fetched at build time.
 */

// Static marketing pages with their priorities and change frequencies
export const staticRoutes = [
  // Homepage - highest priority
  { path: '/', priority: 1.0, changefreq: 'daily' },

  // Main navigation pages
  { path: '/About', priority: 0.9, changefreq: 'monthly' },
  { path: '/Membership', priority: 0.9, changefreq: 'weekly' },
  { path: '/Training', priority: 0.9, changefreq: 'weekly' },
  { path: '/Events', priority: 0.9, changefreq: 'daily' },
  { path: '/Jobs', priority: 0.9, changefreq: 'daily' },
  { path: '/Contact', priority: 0.8, changefreq: 'monthly' },

  // Membership pages
  { path: '/MembershipTiers', priority: 0.8, changefreq: 'monthly' },
  { path: '/MemberBenefits', priority: 0.8, changefreq: 'monthly' },
  { path: '/AssociateMembership', priority: 0.8, changefreq: 'monthly' },
  { path: '/FullMembership', priority: 0.8, changefreq: 'monthly' },
  { path: '/Fellowship', priority: 0.7, changefreq: 'monthly' },
  { path: '/WhyJoinUs', priority: 0.8, changefreq: 'monthly' },
  { path: '/JoinUs', priority: 0.8, changefreq: 'monthly' },
  { path: '/RegisteredOrganisation', priority: 0.7, changefreq: 'monthly' },

  // Training & courses pages
  { path: '/CPDTrainingMarketing', priority: 0.8, changefreq: 'weekly' },
  { path: '/IntroductoryCourses', priority: 0.7, changefreq: 'weekly' },
  { path: '/AdvancedCourses', priority: 0.7, changefreq: 'weekly' },
  { path: '/RefresherCourses', priority: 0.7, changefreq: 'weekly' },
  { path: '/SpecialistCourses', priority: 0.7, changefreq: 'weekly' },

  // Events pages
  { path: '/Conferences', priority: 0.7, changefreq: 'weekly' },
  { path: '/ForumsAndWorkshops', priority: 0.7, changefreq: 'weekly' },

  // Jobs board
  { path: '/JobsBoardMarketing', priority: 0.8, changefreq: 'daily' },

  // Services
  { path: '/SupervisionServicesMarketing', priority: 0.7, changefreq: 'monthly' },
  { path: '/SignpostingService', priority: 0.6, changefreq: 'monthly' },

  // About/Governance
  { path: '/Team', priority: 0.6, changefreq: 'monthly' },
  { path: '/Governance', priority: 0.5, changefreq: 'monthly' },
  { path: '/IfSBoard', priority: 0.5, changefreq: 'monthly' },
  { path: '/ArticlesOfAssociation', priority: 0.4, changefreq: 'yearly' },
  { path: '/ResearchAndAdvocacy', priority: 0.6, changefreq: 'monthly' },

  // Legal pages - lower priority but still indexed
  { path: '/PrivacyPolicy', priority: 0.3, changefreq: 'yearly' },
  { path: '/TermsAndConditions', priority: 0.3, changefreq: 'yearly' },
  { path: '/CookiePolicy', priority: 0.3, changefreq: 'yearly' },

  // Credential verification (public utility)
  { path: '/VerifyCredential', priority: 0.5, changefreq: 'monthly' },

  // Sitemap page
  { path: '/Sitemap', priority: 0.3, changefreq: 'weekly' },
];

// Routes to exclude from sitemap (auth flows, error pages, internal pages)
export const excludedRoutes = [
  '/NotFound',
  '/ApplicationPending',
  '/MemberAccessRequired',
  '/VerifyEmail',
  '/EventRegistrationSuccess',
  '/MembershipPlans', // Internal checkout flow
  '/Onboarding',      // Auth flow
];

// Dynamic route configurations
export const dynamicRoutes = {
  jobs: {
    pathTemplate: '/job/{slug}',
    priority: 0.7,
    changefreq: 'weekly',
  },
  events: {
    pathTemplate: '/EventDetails?id={id}',
    priority: 0.7,
    changefreq: 'weekly',
  },
  courses: {
    pathTemplate: '/TrainingCourseDetails?id={id}',
    priority: 0.7,
    changefreq: 'weekly',
  },
};

export default {
  staticRoutes,
  excludedRoutes,
  dynamicRoutes,
};
