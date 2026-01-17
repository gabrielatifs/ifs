# Site Restructure Plan

## Overview
Splitting the IFS App into two separate deployments:
- **Main Site**: Public marketing pages on primary domain
- **Portal**: Member-only pages on subdomain

## Directory Structure

```
c:\IFS App/
├── packages/
│   └── shared/           # Shared code between apps
│       ├── src/
│       │   ├── components/ (UI, providers)
│       │   ├── hooks/
│       │   ├── lib/
│       │   ├── utils/
│       │   └── api/
│       └── package.json
├── apps/
│   ├── main-site/        # Public website
│   │   ├── src/
│   │   │   ├── components/marketing/
│   │   │   ├── pages/
│   │   │   ├── main.jsx
│   │   │   └── App.jsx
│   │   ├── index.html
│   │   ├── vite.config.js
│   │   └── package.json
│   └── portal/           # Member portal (subdomain)
│       ├── src/
│       │   ├── components/portal/
│       │   ├── pages/
│       │   ├── main.jsx
│       │   └── App.jsx
│       ├── index.html
│       ├── vite.config.js
│       └── package.json
└── package.json          # Root workspace config

## Main Site Pages (29 pages)
- Home (Index)
- About
- Contact
- WhyJoinUs
- JoinUs
- Membership
- MembershipPlans
- MembershipTiers
- AssociateMembership
- FullMembership
- MemberBenefits
- Training
- CPDTrainingMarketing
- IntroductoryCourses
- AdvancedCourses
- RefresherCourses
- SpecialistCourses
- TrainingCourseDetails
- Events
- Conferences
- EventDetails
- EventRegistrationSuccess
- SupervisionServicesMarketing
- SignpostingService
- ForumsAndWorkshops
- Governance
- Team
- IfSBoard
- Fellowship
- ResearchAndAdvocacy
- JobsBoardMarketing
- Jobs
- ArticlesOfAssociation
- TermsAndConditions
- PrivacyPolicy
- CookiePolicy
- Referral
- RegisteredOrganisation
- VerifyCredential

## Portal Pages (39 pages)
- Dashboard
- MyProfile
- MyCertificates
- MyCreditHistory
- MyMasterclassBookings
- CPDTraining
- CourseDetails
- MemberMasterclasses
- MasterclassDetails
- CommunityEvents
- CommunityEventDetails
- Support
- AdminSupport
- News
- Forum
- ForumPostDetails
- AdminDashboard
- ManageOrganisation
- ManageOrgSubscription
- OrgAnalytics
- OrgInvoices
- OrgJobs
- OrgMembers
- OrgPayment
- OrgProfile
- Organisation
- OrganisationMembership
- PortalMembershipTiers
- EditEvent
- EditJob
- EditCourse
- EditSurvey
- EditUser
- Onboarding
- ApplicationProcessing
- YourVoice
- Survey
- SurveyResponses
- JobsBoard
- JobDetails
- SupervisionServices

## Cross-Domain Redirect Logic

### Main Site → Portal
If user visits main site page that should be on portal:
```javascript
if (portalPageRequested) {
  window.location.href = `${PORTAL_DOMAIN}${pathname}`;
}
```

### Portal → Main Site
If user visits portal page that should be on main site:
```javascript
if (mainSitePageRequested) {
  window.location.href = `${MAIN_SITE_DOMAIN}${pathname}`;
}
```

## Environment Variables

### Main Site (.env)
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_PORTAL_URL=https://portal.yourdomain.com
VITE_MAIN_SITE_URL=https://yourdomain.com
```

### Portal (.env)
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_PORTAL_URL=https://portal.yourdomain.com
VITE_MAIN_SITE_URL=https://yourdomain.com
```

## Navigation Updates

### Main Site
- Links to portal pages use: `${VITE_PORTAL_URL}/PageName`
- Links to main site pages use: `/PageName`

### Portal
- Links to main site pages use: `${VITE_MAIN_SITE_URL}/PageName`
- Links to portal pages use: `/PageName`

## Development Commands

```bash
# Install dependencies
npm install

# Run main site (port 3000)
cd apps/main-site && npm run dev

# Run portal (port 3001)
cd apps/portal && npm run dev

# Build main site
cd apps/main-site && npm run build

# Build portal
cd apps/portal && npm run build
```

## Deployment

- **Main Site**: Deploy to primary domain (yourdomain.com)
- **Portal**: Deploy to subdomain (portal.yourdomain.com)

Both apps can be deployed to same hosting provider with different subdomain configurations.
