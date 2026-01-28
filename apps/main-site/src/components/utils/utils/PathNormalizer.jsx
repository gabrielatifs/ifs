import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// A canonical list of all valid page names in the correct case.
const validPageNames = [
    'About', 'AdminDashboard', 'AdvancedCourses', 'ApplicationPending', 'ApplicationProcessing', 
    'ArticlesOfAssociation', 'AssociateMembership', 'Contact', 'CourseDetails', 'CPDTraining', 
    'CPDTrainingMarketing', 'Dashboard', 'EditCourse', 'EditEvent', 'EditJob', 'EditUser', 
    'EventDetails', 'Events', 'ForumsAndWorkshops', 'FullMembership', 'Governance', 'Home', 
    'IfSBoard', 'IntroductoryCourses', 'JobDetails', 'JobsBoard', 'JobsBoardMarketing', 'JoinUs', 
    'MemberAccessRequired', 'MemberBenefits', 'MemberWorkshops', 'Membership', 'MembershipTiers', 
    'MyCertificates', 'MyProfile', 'MyWorkshopBookings', 'NotFound', 'Onboarding', 'OrgPayment', 
    'PortalMembershipTiers', 'RefresherCourses', 'RequestOrgPayment', 'ResearchAndAdvocacy', 
    'SignpostingService', 'SupervisionServices', 'SupervisionServicesMarketing', 'Team', 'Training', 
    'TrainingCourseDetails', 'TrusteeElections', 'WhyJoinUs', 'WorkshopDetails', 'Conferences', 'Jobs', 'SpecialistCourses'
];

export default function PathNormalizer() {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        console.log('[PathNormalizer] Running for path:', location.pathname);
        
        const pathSegments = location.pathname.split('/').filter(Boolean);
        console.log('[PathNormalizer] Path segments:', pathSegments);
        
        const firstSegment = pathSegments[0]?.toLowerCase();
        const skipSegments = new Set(['job', 'jobs', 'join', 'events', 'event', 'training', 'membership']);
        if (firstSegment && skipSegments.has(firstSegment)) {
            console.log('[PathNormalizer] Folder or dynamic route detected, skipping normalization');
            return;
        }

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

        // Find the correctly-cased page name from our list
        const canonicalPage = validPageNames.find(name => name.toLowerCase() === pageSegment.toLowerCase());
        console.log('[PathNormalizer] Canonical page found:', canonicalPage);

        if (canonicalPage) {
            // Case 1: Page exists, but casing is wrong. Correct it.
            if (canonicalPage !== pageSegment) {
                const correctPath = location.pathname.substring(0, location.pathname.length - pageSegment.length) + canonicalPage;
                console.log(`[PathNormalizer] Correcting case: ${location.pathname} -> ${correctPath}`);
                navigate(correctPath + location.search + location.hash, { replace: true });
            } else {
                console.log('[PathNormalizer] Page exists and casing is correct');
            }
            // If casing is correct, do nothing.
        } else {
            // Case 2: Page does not exist in our list. Redirect to NotFound.
            const notFoundPath = location.pathname.substring(0, location.pathname.length - pageSegment.length) + 'NotFound';
            console.log(`[PathNormalizer] Page not found. Redirecting: ${location.pathname} -> ${notFoundPath}`);
            navigate(notFoundPath + location.search + location.hash, { replace: true });
        }
    }, [location.pathname, location.search, location.hash, navigate]);

    // This component renders nothing
    return null;
}
