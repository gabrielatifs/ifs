import React, { createContext, useContext } from 'react';
import { createPageUrl } from '@ifs/shared/utils';

const BreadcrumbContext = createContext(null);

export const useBreadcrumbs = () => useContext(BreadcrumbContext);

// Static breadcrumb structure based on site hierarchy
const breadcrumbStructure = {
    // Home
    'Home': [],
    
    // Membership section
    'Membership': [{ label: 'Membership', path: createPageUrl('Membership') }],
    'WhyJoinUs': [
        { label: 'Membership', path: createPageUrl('Membership') },
        { label: 'Why Join Us', path: createPageUrl('WhyJoinUs') }
    ],
    'MemberBenefits': [
        { label: 'Membership', path: createPageUrl('Membership') },
        { label: 'Member Benefits', path: createPageUrl('MemberBenefits') }
    ],
    'MembershipTiers': [
        { label: 'Membership', path: createPageUrl('Membership') },
        { label: 'Membership Tiers', path: createPageUrl('MembershipTiers') }
    ],
    'AssociateMembership': [
        { label: 'Membership', path: createPageUrl('Membership') },
        { label: 'Associate Membership', path: createPageUrl('AssociateMembership') }
    ],
    'FullMembership': [
        { label: 'Membership', path: createPageUrl('Membership') },
        { label: 'Full Membership', path: createPageUrl('FullMembership') }
    ],
    
    // Training section
    'Training': [{ label: 'Training', path: createPageUrl('Training') }],
    'TrainingCourseDetails': [
        { label: 'Training', path: createPageUrl('Training') },
        { label: 'Course Details', path: '' } // Dynamic title will be set
    ],
    'CPDTraining': [
        { label: 'Training', path: createPageUrl('Training') },
        { label: 'CPD Training', path: createPageUrl('CPDTraining') }
    ],
    'IntroductoryCourses': [
        { label: 'Training', path: createPageUrl('Training') },
        { label: 'Introductory Courses', path: createPageUrl('IntroductoryCourses') }
    ],
    'AdvancedCourses': [
        { label: 'Training', path: createPageUrl('Training') },
        { label: 'Advanced Courses', path: createPageUrl('AdvancedCourses') }
    ],
    'RefresherCourses': [
        { label: 'Training', path: createPageUrl('Training') },
        { label: 'Refresher Courses', path: createPageUrl('RefresherCourses') }
    ],
    
    // Events section
    'Events': [{ label: 'Events', path: createPageUrl('Events') }],
    // EventDetails is now handled dynamically
    'MemberWorkshops': [
        { label: 'Events', path: createPageUrl('Events') },
        { label: 'Member Workshops', path: createPageUrl('MemberWorkshops') }
    ],
    'WorkshopDetails': [
        { label: 'Events', path: createPageUrl('Events') },
        { label: 'Member Workshops', path: createPageUrl('MemberWorkshops') },
        { label: 'Workshop Details', path: '' } // Dynamic title will be set
    ],
    
    // Supervision
    'SupervisionServicesMarketing': [{ label: 'Supervision', path: createPageUrl('SupervisionServicesMarketing') }],
    'SupervisionServices': [{ label: 'Supervision', path: createPageUrl('SupervisionServices') }],
    
    // Jobs
    'JobsBoardMarketing': [{ label: 'Jobs', path: createPageUrl('JobsBoardMarketing') }],
    'JobsBoard': [{ label: 'Jobs', path: createPageUrl('JobsBoard') }],
    'Jobs': [{ label: 'Jobs', path: createPageUrl('Jobs') }],
    'JobDetails': [
        { label: 'Jobs', path: createPageUrl('JobsBoard') },
        { label: 'Job Details', path: '' } // Dynamic title will be set
    ],
    'JobDetailsPublic': [
        { label: 'Jobs', path: createPageUrl('Jobs') },
        { label: 'Job Details', path: '' }
    ],
    
    // Other pages
    'About': [{ label: 'About', path: createPageUrl('About') }],
    'Team': [
        { label: 'About', path: createPageUrl('About') },
        { label: 'Our Team', path: createPageUrl('Team') }
    ],
    'Contact': [{ label: 'Contact', path: createPageUrl('Contact') }],
    'ResearchAndAdvocacy': [{ label: 'Research & Advocacy', path: createPageUrl('ResearchAndAdvocacy') }],
    
    // Governance section
    'Governance': [{ label: 'Governance', path: createPageUrl('Governance') }],
    'IfSBoard': [
        { label: 'Governance', path: createPageUrl('Governance') },
        { label: 'Board of Trustees', path: createPageUrl('IfSBoard') }
    ],
    'ArticlesOfAssociation': [
        { label: 'Governance', path: createPageUrl('Governance') },
        { label: 'Articles of Association', path: createPageUrl('ArticlesOfAssociation') }
    ],
    'TrusteeElections': [
        { label: 'Governance', path: createPageUrl('Governance') },
        { label: 'Trustee Elections', path: createPageUrl('TrusteeElections') }
    ]
};

export const BreadcrumbProvider = ({ children }) => {
    const getBreadcrumbs = (pageName, { dynamicTitle = null, from = null } = {}) => {
        const baseBreadcrumbs = [{ label: 'Home', path: createPageUrl('Home') }];
        
        // Special dynamic handling for EventDetails
        if (pageName === 'EventDetails') {
            let parentCrumb;
            if (from === 'ForumsAndWorkshops') {
                parentCrumb = { label: 'Forums & Workshops', path: createPageUrl('ForumsAndWorkshops') };
            } else {
                // Default to 'Events' for any other case (including 'Home', 'Events', or no 'from' param)
                parentCrumb = { label: 'Events', path: createPageUrl('Events') };
            }
            
            const eventCrumbs = [
                parentCrumb,
                { label: dynamicTitle || 'Event Details', path: '' }
            ];

            return [...baseBreadcrumbs, ...eventCrumbs];
        }

        // Special dynamic handling for IfSBoard
        if (pageName === 'IfSBoard') {
            let breadcrumbPath;
            if (from === 'Team') {
                // Coming from Team page: Home / About / Our Team / Board of Trustees
                breadcrumbPath = [
                    { label: 'About', path: createPageUrl('About') },
                    { label: 'Our Team', path: createPageUrl('Team') },
                    { label: 'Board of Trustees', path: createPageUrl('IfSBoard') }
                ];
            } else {
                // Default to Governance path: Home / Governance / Board of Trustees
                breadcrumbPath = [
                    { label: 'Governance', path: createPageUrl('Governance') },
                    { label: 'Board of Trustees', path: createPageUrl('IfSBoard') }
                ];
            }
            
            return [...baseBreadcrumbs, ...breadcrumbPath];
        }

        const pageBreadcrumbs = breadcrumbStructure[pageName] || [];
        
        // If there's a dynamic title for the last breadcrumb, update it
        if (dynamicTitle && pageBreadcrumbs.length > 0) {
            const updatedBreadcrumbs = [...pageBreadcrumbs];
            const lastCrumb = updatedBreadcrumbs[updatedBreadcrumbs.length - 1];
            if (!lastCrumb.path) { // Only update if path is empty (indicating dynamic content)
                updatedBreadcrumbs[updatedBreadcrumbs.length - 1] = {
                    ...lastCrumb,
                    label: dynamicTitle
                };
            }
            return [...baseBreadcrumbs, ...updatedBreadcrumbs];
        }
        
        return [...baseBreadcrumbs, ...pageBreadcrumbs];
    };

    const value = { getBreadcrumbs };

    return (
        <BreadcrumbContext.Provider value={value}>
            {children}
        </BreadcrumbContext.Provider>
    );
};