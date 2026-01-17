// Mock Base44 Client for local development without Base44 backend
// This replaces the @base44/sdk completely

// Mock user data
const mockUser = {
  id: 'mock-user-123',
  email: 'demo@example.com',
  name: 'Demo User',
  firstName: 'Demo',
  lastName: 'User',
  displayName: 'Demo User',
  role: 'user',
  membershipTier: 'full',
  membershipType: 'Full',
  membershipStatus: 'active',
  onboarding_completed: true,
  hasSeenPortalTour: true,
  cpdHours: 5.0,
  monthlyCpdHours: 1,
  totalCpdEarned: 12.0,
  createdAt: new Date().toISOString(),
  subscriptionStartDate: new Date().toISOString(),
  organisationId: null,
  organisationName: null,
};

// Mock data collections
const mockData = {
  events: [],
  jobs: [],
  courses: [],
  organisations: [],
  surveys: [],
  forumPosts: [],
  news: [],
  certificates: [],
};

// Helper to create a mock query result
const createMockQuery = (collection) => ({
  find: async () => ({ items: mockData[collection] || [], total: mockData[collection]?.length || 0 }),
  findOne: async (id) => mockData[collection]?.[0] || null,
  findMany: async () => mockData[collection] || [],
  count: async () => mockData[collection]?.length || 0,
  create: async (data) => ({ id: `mock-${Date.now()}`, ...data }),
  update: async (id, data) => ({ id, ...data }),
  delete: async (id) => ({ success: true }),
});

// Mock auth object
const mockAuth = {
  me: async () => mockUser,
  updateMe: async (data) => ({ ...mockUser, ...data }),
  signUp: async (data) => mockUser,
  signIn: async (email, password) => mockUser,
  signOut: async () => ({ success: true }),
  resetPassword: async (email) => ({ success: true }),
  redirectToLogin: (returnUrl) => {
    console.log('[MOCK] redirectToLogin called with returnUrl:', returnUrl);
    // In mock mode, we don't redirect - we just log
  },
};

// Mock entities - create mock queries for each entity
const createMockEntity = (name) => ({
  find: async (query = {}) => ({ items: mockData[name] || [], total: 0 }),
  findOne: async (id) => null,
  findMany: async (query = {}) => [],
  count: async (query = {}) => 0,
  create: async (data) => ({ id: `mock-${Date.now()}`, ...data }),
  update: async (id, data) => ({ id, ...data }),
  delete: async (id) => ({ success: true }),
  upsert: async (query, data) => ({ id: `mock-${Date.now()}`, ...data }),
});

// Mock functions - return empty or success responses
const createMockFunction = (name) => async (...args) => {
  console.log(`[MOCK] Function called: ${name}`, args);
  return { success: true, message: 'Mock function executed' };
};

// Create mock client
export const createClient = ({ appId, requiresAuth }) => {
  console.log('[MOCK] Creating Base44 client with appId:', appId);

  return {
    auth: mockAuth,

    entities: {
      Event: createMockEntity('events'),
      EventSignup: createMockEntity('eventSignups'),
      Job: createMockEntity('jobs'),
      Course: createMockEntity('courses'),
      TrainingEnquiry: createMockEntity('trainingEnquiries'),
      FundingRequest: createMockEntity('fundingRequests'),
      CourseVariant: createMockEntity('courseVariants'),
      MarketingContent: createMockEntity('marketingContent'),
      TeamMember: createMockEntity('teamMembers'),
      Organisation: createMockEntity('organisations'),
      CourseDate: createMockEntity('courseDates'),
      OrgInvite: createMockEntity('orgInvites'),
      DigitalCredential: createMockEntity('digitalCredentials'),
      CreditTransaction: createMockEntity('creditTransactions'),
      CourseBooking: createMockEntity('courseBookings'),
      Survey: createMockEntity('surveys'),
      SurveyResponse: createMockEntity('surveyResponses'),
      SurveyDemographic: createMockEntity('surveyDemographics'),
      CommunityEvent: createMockEntity('communityEvents'),
      CommunityEventSignup: createMockEntity('communityEventSignups'),
      OrganisationSeat: createMockEntity('organisationSeats'),
      EmailTemplate: createMockEntity('emailTemplates'),
      SupportTicket: createMockEntity('supportTickets'),
      ForumPost: createMockEntity('forumPosts'),
      ForumReply: createMockEntity('forumReplies'),
      ForumVote: createMockEntity('forumVotes'),
      JobMetric: createMockEntity('jobMetrics'),
      NotificationPreference: createMockEntity('notificationPreferences'),
      ApplicantTracking: createMockEntity('applicantTracking'),
      NewsSource: createMockEntity('newsSources'),
      NewsItem: createMockEntity('newsItems'),
      NewsCategory: createMockEntity('newsCategories'),
      FellowshipApplication: createMockEntity('fellowshipApplications'),
      UserProfile: createMockEntity('userProfiles'),
      CourseCategory: createMockEntity('courseCategories'),
    },

    functions: {
      createCheckout: createMockFunction('createCheckout'),
      stripeWebhook: createMockFunction('stripeWebhook'),
      generateCertificate: createMockFunction('generateCertificate'),
      sendEmail: createMockFunction('sendEmail'),
      createCourseCheckout: createMockFunction('createCourseCheckout'),
      postUserSignup: createMockFunction('postUserSignup'),
      verifySubscription: createMockFunction('verifySubscription'),
      cancelSubscription: createMockFunction('cancelSubscription'),
      approveFullMembership: createMockFunction('approveFullMembership'),
      getSubscriptionDetails: createMockFunction('getSubscriptionDetails'),
      addZoomRegistrant: createMockFunction('addZoomRegistrant'),
      createZoomMeeting: createMockFunction('createZoomMeeting'),
      generateWorkshopCertificate: createMockFunction('generateWorkshopCertificate'),
      requestOrgPayment: createMockFunction('requestOrgPayment'),
      createOrgCheckout: createMockFunction('createOrgCheckout'),
      getFundingRequestDetails: createMockFunction('getFundingRequestDetails'),
      migrateUsersToProfiles: createMockFunction('migrateUsersToProfiles'),
      debugUserProfile: createMockFunction('debugUserProfile'),
      migrateUsersToUserProfiles: createMockFunction('migrateUsersToUserProfiles'),
      getAllUserProfiles: createMockFunction('getAllUserProfiles'),
      approveAssociateMembership: createMockFunction('approveAssociateMembership'),
      linkProfileOnLogin: createMockFunction('linkProfileOnLogin'),
      deletePendingApplication: createMockFunction('deletePendingApplication'),
      rejectApplication: createMockFunction('rejectApplication'),
      syncCourseWithStripe: createMockFunction('syncCourseWithStripe'),
      forceUpgradeToFull: createMockFunction('forceUpgradeToFull'),
      manualUpgrade: createMockFunction('manualUpgrade'),
      checkMembershipStatus: createMockFunction('checkMembershipStatus'),
      verifyPaymentAndUpgrade: createMockFunction('verifyPaymentAndUpgrade'),
      verifyOrgPaymentAndUpgrade: createMockFunction('verifyOrgPaymentAndUpgrade'),
      zapierOrgPaymentWebhook: createMockFunction('zapierOrgPaymentWebhook'),
      webhookTest: createMockFunction('webhookTest'),
      deleteUser: createMockFunction('deleteUser'),
      registerGuestForEvent: createMockFunction('registerGuestForEvent'),
      inviteOrgMember: createMockFunction('inviteOrgMember'),
      getOrganisationMembers: createMockFunction('getOrganisationMembers'),
      createOrgMembershipCheckout: createMockFunction('createOrgMembershipCheckout'),
      generateDigitalCredential: createMockFunction('generateDigitalCredential'),
      migrateOldCertificatesToDigitalCredentials: createMockFunction('migrateOldCertificatesToDigitalCredentials'),
      addToMailerLite: createMockFunction('addToMailerLite'),
      addToApollo: createMockFunction('addToApollo'),
      archiveExpiredJobs: createMockFunction('archiveExpiredJobs'),
      syncToSupabase: createMockFunction('syncToSupabase'),
      initPostHog: createMockFunction('initPostHog'),
      allocateMonthlyCredits: createMockFunction('allocateMonthlyCredits'),
      checkAndAllocateCredits: createMockFunction('checkAndAllocateCredits'),
      bookEventWithCredits: createMockFunction('bookEventWithCredits'),
      reactivateSubscription: createMockFunction('reactivateSubscription'),
      getInvoices: createMockFunction('getInvoices'),
      getCitySuggestions: createMockFunction('getCitySuggestions'),
      getCountries: createMockFunction('getCountries'),
      registerForCommunityEvent: createMockFunction('registerForCommunityEvent'),
      cancelCommunityEventRegistration: createMockFunction('cancelCommunityEventRegistration'),
      sendWelcomeEmail: createMockFunction('sendWelcomeEmail'),
      createDynamicCourseCheckout: createMockFunction('createDynamicCourseCheckout'),
      createForumPost: createMockFunction('createForumPost'),
      createForumReply: createMockFunction('createForumReply'),
      voteForumItem: createMockFunction('voteForumItem'),
      sitemap: createMockFunction('sitemap'),
      submitToGoogle: createMockFunction('submitToGoogle'),
      trackJobAnalytics: createMockFunction('trackJobAnalytics'),
      getGoogleMapsApiKey: createMockFunction('getGoogleMapsApiKey'),
      reindexJobs: createMockFunction('reindexJobs'),
      backfillApplicants: createMockFunction('backfillApplicants'),
      fetchNewsFromSources: createMockFunction('fetchNewsFromSources'),
      trackApplicationSubmission: createMockFunction('trackApplicationSubmission'),
      backfillJobAlerts: createMockFunction('backfillJobAlerts'),
      salesforceSync: createMockFunction('salesforceSync'),
      backfillSalesforce: createMockFunction('backfillSalesforce'),
      sendEventReminder: createMockFunction('sendEventReminder'),
      searchUsers: createMockFunction('searchUsers'),
      backfillNewsPreferences: createMockFunction('backfillNewsPreferences'),
      submitJobForReview: createMockFunction('submitJobForReview'),
      sendJobStatusEmail: createMockFunction('sendJobStatusEmail'),
      getInviteDetails: createMockFunction('getInviteDetails'),
      acceptOrgInvite: createMockFunction('acceptOrgInvite'),
      getMyInvites: createMockFunction('getMyInvites'),
      acceptInvite: createMockFunction('acceptInvite'),
      declineInvite: createMockFunction('declineInvite'),
      revokeInvite: createMockFunction('revokeInvite'),
      getOrgAnalytics: createMockFunction('getOrgAnalytics'),
      updateOrgSubscription: createMockFunction('updateOrgSubscription'),
      giftOrgSeats: createMockFunction('giftOrgSeats'),
      createOrgBulkCourseBooking: createMockFunction('createOrgBulkCourseBooking'),
      adminBookCourseForUser: createMockFunction('adminBookCourseForUser'),
      deductCpdHours: createMockFunction('deductCpdHours'),
      resetUser: createMockFunction('resetUser'),
      sendCommunityEventReminders: createMockFunction('sendCommunityEventReminders'),
      createJobPostingCheckout: createMockFunction('createJobPostingCheckout'),
    },

    integrations: {
      Core: {
        InvokeLLM: createMockFunction('InvokeLLM'),
        SendEmail: createMockFunction('SendEmail'),
        UploadFile: createMockFunction('UploadFile'),
        GenerateImage: createMockFunction('GenerateImage'),
        ExtractDataFromUploadedFile: createMockFunction('ExtractDataFromUploadedFile'),
        CreateFileSignedUrl: createMockFunction('CreateFileSignedUrl'),
        UploadPrivateFile: createMockFunction('UploadPrivateFile'),
      },
    },

    // Additional properties that might be needed
    appId,
    requiresAuth,
  };
};

// Export mock utilities
export const mockUtils = {
  mockUser,
  mockData,
  updateMockUser: (updates) => Object.assign(mockUser, updates),
  addMockData: (collection, items) => {
    mockData[collection] = mockData[collection] || [];
    mockData[collection].push(...items);
  },
};
