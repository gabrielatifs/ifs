import { ifs } from './ifsClient';


export const createCheckout = ifs.functions.createCheckout;

export const stripeWebhook = ifs.functions.stripeWebhook;

export const generateCertificate = ifs.functions.generateCertificate;

export const sendEmail = ifs.functions.sendEmail;

export const createCourseCheckout = ifs.functions.createCourseCheckout;

export const postUserSignup = ifs.functions.postUserSignup;

export const verifySubscription = ifs.functions.verifySubscription;

export const cancelSubscription = ifs.functions.cancelSubscription;

export const approveFullMembership = ifs.functions.approveFullMembership;

export const getSubscriptionDetails = ifs.functions.getSubscriptionDetails;

export const addZoomRegistrant = ifs.functions.addZoomRegistrant;

export const createZoomMeeting = ifs.functions.createZoomMeeting;

export const generateWorkshopCertificate = ifs.functions.generateWorkshopCertificate;

export const requestOrgPayment = ifs.functions.requestOrgPayment;

export const createOrgCheckout = ifs.functions.createOrgCheckout;

export const getFundingRequestDetails = ifs.functions.getFundingRequestDetails;

export const migrateUsersToProfiles = ifs.functions.migrateUsersToProfiles;

export const debugUserProfile = ifs.functions.debugUserProfile;

export const migrateUsersToUserProfiles = ifs.functions.migrateUsersToUserProfiles;

export const getAllUserProfiles = ifs.functions.getAllUserProfiles;

export const approveAssociateMembership = ifs.functions.approveAssociateMembership;

export const linkProfileOnLogin = ifs.functions.linkProfileOnLogin;

export const deletePendingApplication = ifs.functions.deletePendingApplication;

export const rejectApplication = ifs.functions.rejectApplication;

export const syncCourseWithStripe = ifs.functions.syncCourseWithStripe;

export const forceUpgradeToFull = ifs.functions.forceUpgradeToFull;

export const manualUpgrade = ifs.functions.manualUpgrade;

export const checkMembershipStatus = ifs.functions.checkMembershipStatus;

export const verifyPaymentAndUpgrade = ifs.functions.verifyPaymentAndUpgrade;

export const verifyOrgPaymentAndUpgrade = ifs.functions.verifyOrgPaymentAndUpgrade;

export const zapierOrgPaymentWebhook = ifs.functions.zapierOrgPaymentWebhook;

export const webhookTest = ifs.functions.webhookTest;

export const deleteUser = ifs.functions.deleteUser;

export const registerGuestForEvent = ifs.functions.registerGuestForEvent;

export const inviteOrgMember = ifs.functions.inviteOrgMember;

export const getOrganisationMembers = ifs.functions.getOrganisationMembers;

export const createOrgMembershipCheckout = ifs.functions.createOrgMembershipCheckout;

export const generateDigitalCredential = ifs.functions.generateDigitalCredential;

export const migrateOldCertificatesToDigitalCredentials = ifs.functions.migrateOldCertificatesToDigitalCredentials;

export const addToMailerLite = ifs.functions.addToMailerLite;

export const addToApollo = ifs.functions.addToApollo;

export const archiveExpiredJobs = ifs.functions.archiveExpiredJobs;

export const syncToSupabase = ifs.functions.syncToSupabase;

export const initPostHog = ifs.functions.initPostHog;

export const allocateMonthlyCredits = ifs.functions.allocateMonthlyCredits;

export const checkAndAllocateCredits = ifs.functions.checkAndAllocateCredits;

export const bookEventWithCredits = ifs.functions.bookEventWithCredits;

export const reactivateSubscription = ifs.functions.reactivateSubscription;

export const getInvoices = ifs.functions.getInvoices;

export const getCitySuggestions = ifs.functions.getCitySuggestions;

export const getCountries = ifs.functions.getCountries;

export const registerForCommunityEvent = ifs.functions.registerForCommunityEvent;

export const cancelCommunityEventRegistration = ifs.functions.cancelCommunityEventRegistration;

export const sendWelcomeEmail = ifs.functions.sendWelcomeEmail;

export const createDynamicCourseCheckout = ifs.functions.createDynamicCourseCheckout;

export const createForumPost = ifs.functions.createForumPost;

export const createForumReply = ifs.functions.createForumReply;

export const voteForumItem = ifs.functions.voteForumItem;

export const sitemap = ifs.functions.sitemap;

export const submitToGoogle = ifs.functions.submitToGoogle;

export const trackJobAnalytics = ifs.functions.trackJobAnalytics;

export const getGoogleMapsApiKey = ifs.functions.getGoogleMapsApiKey;

export const reindexJobs = ifs.functions.reindexJobs;

export const backfillApplicants = ifs.functions.backfillApplicants;

export const fetchNewsFromSources = ifs.functions.fetchNewsFromSources;

export const trackApplicationSubmission = ifs.functions.trackApplicationSubmission;

export const backfillJobAlerts = ifs.functions.backfillJobAlerts;

export const salesforceSync = ifs.functions.salesforceSync;

export const backfillSalesforce = ifs.functions.backfillSalesforce;

export const sendEventReminder = ifs.functions.sendEventReminder;

export const searchUsers = ifs.functions.searchUsers;

export const backfillNewsPreferences = ifs.functions.backfillNewsPreferences;

export const submitJobForReview = ifs.functions.submitJobForReview;

export const sendJobStatusEmail = ifs.functions.sendJobStatusEmail;

export const getInviteDetails = ifs.functions.getInviteDetails;

export const acceptOrgInvite = ifs.functions.acceptOrgInvite;

export const getMyInvites = ifs.functions.getMyInvites;

export const acceptInvite = ifs.functions.acceptInvite;

export const declineInvite = ifs.functions.declineInvite;

export const revokeInvite = ifs.functions.revokeInvite;

export const getOrgAnalytics = ifs.functions.getOrgAnalytics;

export const updateOrgSubscription = ifs.functions.updateOrgSubscription;

export const giftOrgSeats = ifs.functions.giftOrgSeats;

export const createOrgBulkCourseBooking = ifs.functions.createOrgBulkCourseBooking;

export const adminBookCourseForUser = ifs.functions.adminBookCourseForUser;

export const deductCpdHours = ifs.functions.deductCpdHours;

export const resetUser = ifs.functions.resetUser;

export const sendCommunityEventReminders = ifs.functions.sendCommunityEventReminders;

export const createJobPostingCheckout = ifs.functions.createJobPostingCheckout;

