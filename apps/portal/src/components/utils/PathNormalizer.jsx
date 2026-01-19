import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// A canonical list of all valid page names in the correct case.
const validPageNames = [
    // Portal pages
    'AdminDashboard', 'AdminSupport', 'ApplicationProcessing', 'CommunityEventDetails', 'CommunityEvents',
    'CourseDetails', 'CPDTraining', 'Dashboard', 'EditCourse', 'EditEvent', 'EditJob', 'EditSurvey', 'EditUser',
    'Forum', 'ForumPostDetails', 'Job', 'JobDetails', 'JobsBoard', 'ManageOrganisation', 'ManageOrgSubscription',
    'MasterclassDetails', 'MemberMasterclasses', 'MyCertificates', 'MyCreditHistory', 'MyMasterclassBookings',
    'MyProfile', 'Onboarding', 'OrgAnalytics', 'Organisation', 'OrganisationMembership', 'OrgInvoices',
    'OrgJobs', 'OrgMembers', 'OrgPayment', 'OrgProfile', 'PortalMembershipTiers', 'RequestOrgPayment',
    'SupervisionServices', 'Support', 'Survey', 'SurveyResponses', 'TrusteeElections', 'YourVoice',
    // Main site pages
    'About', 'AdvancedCourses', 'ApplicationPending', 'ArticlesOfAssociation', 'AssociateMembership',
    'Conferences', 'Contact', 'CookiePolicy', 'CPDTrainingMarketing', 'EventDetails', 'EventRegistrationSuccess',
    'Events', 'Fellowship', 'ForumsAndWorkshops', 'FullMembership', 'Governance', 'Home', 'IfSBoard',
    'IntroductoryCourses', 'Jobs', 'JobsBoardMarketing', 'JoinUs', 'MemberAccessRequired', 'MemberBenefits',
    'Membership', 'MembershipPlans', 'MembershipTiers', 'MemberWorkshops', 'NotFound', 'PrivacyPolicy',
    'RefresherCourses', 'RegisteredOrganisation', 'ResearchAndAdvocacy', 'SignpostingService',
    'SpecialistCourses', 'SupervisionServicesMarketing', 'Team', 'TermsAndConditions', 'Training',
    'TrainingCourseDetails', 'VerifyCredential', 'WhyJoinUs', 'WorkshopDetails'
];

export default function PathNormalizer() {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        console.log('[PathNormalizer] Running for path:', location.pathname);
        
        const pathSegments = location.pathname.split('/').filter(Boolean);
        console.log('[PathNormalizer] Path segments:', pathSegments);
        
        // This handles root paths like / or /app-slug/
        if (pathSegments.length < 2) {
            console.log('[PathNormalizer] Path too short, returning');
            return;
        }

        const pageSegment = pathSegments[pathSegments.length - 1];
        console.log('[PathNormalizer] Page segment:', pageSegment);
        
        // Don't do anything if we are already on the NotFound page
        if (pageSegment.toLowerCase() === 'notfound') {
            console.log('[PathNormalizer] Already on NotFound page, returning');
            return;
        }

        // Check if the page exists in our valid list (case-insensitive)
        const isValidPage = validPageNames.some(name => name.toLowerCase() === pageSegment.toLowerCase());
        console.log('[PathNormalizer] Is valid page:', isValidPage);

        if (isValidPage) {
            // Page is valid, no action needed - routes are lowercase in the portal
            console.log('[PathNormalizer] Page is valid, no redirect needed');
        } else {
            // Page does not exist in our list. Redirect to NotFound.
            const notFoundPath = location.pathname.substring(0, location.pathname.length - pageSegment.length) + 'notfound';
            console.log(`[PathNormalizer] Page not found. Redirecting: ${location.pathname} -> ${notFoundPath}`);
            navigate(notFoundPath + location.search + location.hash, { replace: true });
        }
    }, [location.pathname, location.search, location.hash, navigate]);

    // This component renders nothing
    return null;
}
