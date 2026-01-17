import { invokeFunction } from './supabaseFunctions.js';

export const createCheckout = invokeFunction('createCheckout');

export const stripeWebhook = invokeFunction('stripeWebhook');

export const generateCertificate = invokeFunction('generateCertificate');

export const sendEmail = invokeFunction('sendEmail');

export const createCourseCheckout = invokeFunction('createCourseCheckout');

export const postUserSignup = invokeFunction('postUserSignup');

export const verifySubscription = invokeFunction('verifySubscription');

export const cancelSubscription = invokeFunction('cancelSubscription');

export const approveFullMembership = invokeFunction('approveFullMembership');

export const getSubscriptionDetails = invokeFunction('getSubscriptionDetails');

export const addZoomRegistrant = invokeFunction('addZoomRegistrant');

export const createZoomMeeting = invokeFunction('createZoomMeeting');

export const generateWorkshopCertificate = invokeFunction('generateWorkshopCertificate');

export const requestOrgPayment = invokeFunction('requestOrgPayment');

export const createOrgCheckout = invokeFunction('createOrgCheckout');

export const getFundingRequestDetails = invokeFunction('getFundingRequestDetails');

export const migrateUsersToProfiles = invokeFunction('migrateUsersToProfiles');

export const debugUserProfile = invokeFunction('debugUserProfile');

export const migrateUsersToUserProfiles = invokeFunction('migrateUsersToUserProfiles');

export const getAllUserProfiles = invokeFunction('getAllUserProfiles');

export const approveAssociateMembership = invokeFunction('approveAssociateMembership');

export const linkProfileOnLogin = invokeFunction('linkProfileOnLogin');

export const deletePendingApplication = invokeFunction('deletePendingApplication');

export const rejectApplication = invokeFunction('rejectApplication');

export const syncCourseWithStripe = invokeFunction('syncCourseWithStripe');

export const forceUpgradeToFull = invokeFunction('forceUpgradeToFull');

export const manualUpgrade = invokeFunction('manualUpgrade');

export const checkMembershipStatus = invokeFunction('checkMembershipStatus');

export const verifyPaymentAndUpgrade = invokeFunction('verifyPaymentAndUpgrade');

export const verifyOrgPaymentAndUpgrade = invokeFunction('verifyOrgPaymentAndUpgrade');

export const zapierOrgPaymentWebhook = invokeFunction('zapierOrgPaymentWebhook');

export const webhookTest = invokeFunction('webhookTest');

export const deleteUser = invokeFunction('deleteUser');

export const registerGuestForEvent = invokeFunction('registerGuestForEvent');

export const inviteOrgMember = invokeFunction('inviteOrgMember');

export const getOrganisationMembers = invokeFunction('getOrganisationMembers');

export const createOrgMembershipCheckout = invokeFunction('createOrgMembershipCheckout');

export const generateDigitalCredential = invokeFunction('generateDigitalCredential');

export const migrateOldCertificatesToDigitalCredentials = invokeFunction('migrateOldCertificatesToDigitalCredentials');

export const addToMailerLite = invokeFunction('addToMailerLite');

export const addToApollo = invokeFunction('addToApollo');

export const archiveExpiredJobs = invokeFunction('archiveExpiredJobs');

export const syncToSupabase = invokeFunction('syncToSupabase');

export const initPostHog = invokeFunction('initPostHog');

export const allocateMonthlyCredits = invokeFunction('allocateMonthlyCredits');

export const checkAndAllocateCredits = invokeFunction('checkAndAllocateCredits');

export const bookEventWithCredits = invokeFunction('bookEventWithCredits');

export const reactivateSubscription = invokeFunction('reactivateSubscription');

export const getInvoices = invokeFunction('getInvoices');

export const getCitySuggestions = invokeFunction('getCitySuggestions');

export const getCountries = invokeFunction('getCountries');

export const registerForCommunityEvent = invokeFunction('registerForCommunityEvent');

export const cancelCommunityEventRegistration = invokeFunction('cancelCommunityEventRegistration');

export const sendWelcomeEmail = invokeFunction('sendWelcomeEmail');

export const createDynamicCourseCheckout = invokeFunction('createDynamicCourseCheckout');

export const createForumPost = invokeFunction('createForumPost');

export const createForumReply = invokeFunction('createForumReply');

export const voteForumItem = invokeFunction('voteForumItem');

export const sitemap = invokeFunction('sitemap');

export const submitToGoogle = invokeFunction('submitToGoogle');

export const trackJobAnalytics = invokeFunction('trackJobAnalytics');

export const getGoogleMapsApiKey = invokeFunction('getGoogleMapsApiKey');

export const reindexJobs = invokeFunction('reindexJobs');

export const backfillApplicants = invokeFunction('backfillApplicants');

export const fetchNewsFromSources = invokeFunction('fetchNewsFromSources');

export const trackApplicationSubmission = invokeFunction('trackApplicationSubmission');

export const backfillJobAlerts = invokeFunction('backfillJobAlerts');

export const salesforceSync = invokeFunction('salesforceSync');

export const backfillSalesforce = invokeFunction('backfillSalesforce');

export const sendEventReminder = invokeFunction('sendEventReminder');

export const searchUsers = invokeFunction('searchUsers');

export const backfillNewsPreferences = invokeFunction('backfillNewsPreferences');

export const submitJobForReview = invokeFunction('submitJobForReview');

export const sendJobStatusEmail = invokeFunction('sendJobStatusEmail');

export const getInviteDetails = invokeFunction('getInviteDetails');

export const acceptOrgInvite = invokeFunction('acceptOrgInvite');

export const getMyInvites = invokeFunction('getMyInvites');

export const acceptInvite = invokeFunction('acceptInvite');

export const declineInvite = invokeFunction('declineInvite');

export const revokeInvite = invokeFunction('revokeInvite');

export const getOrgAnalytics = invokeFunction('getOrgAnalytics');

export const updateOrgSubscription = invokeFunction('updateOrgSubscription');

export const giftOrgSeats = invokeFunction('giftOrgSeats');

export const createOrgBulkCourseBooking = invokeFunction('createOrgBulkCourseBooking');

export const adminBookCourseForUser = invokeFunction('adminBookCourseForUser');

export const deductCpdHours = invokeFunction('deductCpdHours');

export const resetUser = invokeFunction('resetUser');

export const sendCommunityEventReminders = invokeFunction('sendCommunityEventReminders');

export const createJobPostingCheckout = invokeFunction('createJobPostingCheckout');
