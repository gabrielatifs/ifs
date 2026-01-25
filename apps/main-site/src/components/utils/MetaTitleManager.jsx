import { Helmet } from 'react-helmet-async';

// Page title mapping for proper meta titles
export const pageTitles = {
  Home: 'Independent Federation for Safeguarding',
  Dashboard: 'Dashboard - IfS Member Portal',
  AdminDashboard: 'Admin Dashboard - IfS',
  MemberMasterclasses: 'Masterclasses & Events - IfS Member Portal',
  MasterclassDetails: 'Masterclass Details - IfS Member Portal',
  CPDTraining: 'CPD & Training - IfS Member Portal',
  CPDTrainingMarketing: 'CPD & Training - Independent Federation for Safeguarding',
  CourseDetails: 'Course Details - IfS Member Portal',
  JobsBoard: 'Jobs Board - IfS Member Portal',
  JobDetails: 'Job Details - IfS Member Portal',
  JobsBoardMarketing: 'Jobs Board - Independent Federation for Safeguarding',
  MyProfile: 'My Profile - IfS Member Portal',
  MyCertificates: 'My Certificates - IfS Member Portal',
  MyCreditHistory: 'My Credit History - IfS Member Portal',
  MyMasterclassBookings: 'My Bookings - IfS Member Portal',
  ManageOrganisation: 'Manage Organisation - IfS',
  OrganisationMembership: 'Organisation Membership - IfS',
  RequestOrgPayment: 'Request Organisation Payment - IfS',
  WhyJoinUs: 'Why Join Us - Independent Federation for Safeguarding',
  MembershipTiers: 'Membership Tiers - IfS',
  PortalMembershipTiers: 'Membership Tiers - IfS Member Portal',
  MembershipPlans: 'Membership Plans - Independent Federation for Safeguarding',
  FullMembership: 'Full Membership - IfS',
  AssociateMembership: 'Associate Membership - IfS',
  Fellowship: 'Fellowship - IfS',
  MemberBenefits: 'Member Benefits - Independent Federation for Safeguarding',
  Training: 'Training - Independent Federation for Safeguarding',
  TrainingCourseDetails: 'Course Details - Independent Federation for Safeguarding',
  IntroductoryCourses: 'Introductory Courses - Independent Federation for Safeguarding',
  AdvancedCourses: 'Advanced Courses - Independent Federation for Safeguarding',
  RefresherCourses: 'Refresher Courses - Independent Federation for Safeguarding',
  SpecialistCourses: 'Specialist Courses - Independent Federation for Safeguarding',
  Events: 'Events - Independent Federation for Safeguarding',
  EventDetails: 'Event Details - Independent Federation for Safeguarding',
  CommunityEvents: 'Community Events - IfS Member Portal',
  CommunityEventDetails: 'Community Event Details - IfS',
  Conferences: 'Conferences - Independent Federation for Safeguarding',
  ForumsAndWorkshops: 'Forums & Workshops - Independent Federation for Safeguarding',
  SupervisionServices: 'Supervision Services - IfS Member Portal',
  SupervisionServicesMarketing: 'Supervision Services - Independent Federation for Safeguarding',
  SignpostingService: 'Signposting Service - Independent Federation for Safeguarding',
  ResearchAndAdvocacy: 'Research & Advocacy - Independent Federation for Safeguarding',
  About: 'About Us - Independent Federation for Safeguarding',
  Contact: 'Contact Us - Independent Federation for Safeguarding',
  Team: 'Our Team - Independent Federation for Safeguarding',
  Governance: 'Governance - Independent Federation for Safeguarding',
  IfSBoard: 'IfS Board - Independent Federation for Safeguarding',
  Forum: 'Community Forum - IfS Member Portal',
  ForumPostDetails: 'Forum Post - IfS Member Portal',
  Support: 'Support - IfS Member Portal',
  AdminSupport: 'Support Admin - IfS',
  YourVoice: 'Your Voice - IfS Member Portal',
  Survey: 'Survey - IfS Member Portal',
  News: 'News & Updates - IfS',
  Onboarding: 'Welcome - IfS Member Portal',
  ApplicationProcessing: 'Application Processing - IfS',
  JoinUs: 'Join Us - Independent Federation for Safeguarding',
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
  PrivacyPolicy: 'Privacy Policy - Independent Federation for Safeguarding',
  TermsAndConditions: 'Terms & Conditions - Independent Federation for Safeguarding',
  CookiePolicy: 'Cookie Policy - Independent Federation for Safeguarding',
  NotFound: 'Page Not Found - Independent Federation for Safeguarding',
  EventRegistrationSuccess: 'Registration Confirmed - IfS',
  VerifyEmail: 'Verify Email - Independent Federation for Safeguarding'
};

export default function MetaTitleManager({ pageName }) {
  const normalizedPageName = pageName.charAt(0).toUpperCase() + pageName.slice(1);
  const title = pageTitles[normalizedPageName] || `${normalizedPageName} - Independent Federation for Safeguarding`;
  
  return (
    <Helmet>
      <title>{title}</title>
      <meta property="og:title" content={title} />
      <meta name="twitter:title" content={title} />
    </Helmet>
  );
}
