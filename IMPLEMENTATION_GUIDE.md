# Implementation Guide: Restructuring IFS App

This guide will help you complete the restructuring of your IFS App into separate main site and portal deployments.

## Current Status

✅ Directory structure created (`apps/`, `packages/`)
✅ Shared package created with common code
✅ Root workspace package.json configured
✅ Main site and portal package.json files created
✅ Vite configs created for both apps

## Next Steps

### Step 1: Copy Page Files

You need to copy the individual page files from `src/pages/` to the appropriate app.

#### For Main Site (`apps/main-site/src/pages/`):
Copy these page files:
- About.jsx
- Contact.jsx
- WhyJoinUs.jsx
- JoinUs.jsx
- Membership.jsx
- MembershipPlans.jsx
- MembershipTiers.jsx
- AssociateMembership.jsx
- FullMembership.jsx
- MemberBenefits.jsx
- Training.jsx
- CPDTrainingMarketing.jsx
- IntroductoryCourses.jsx
- AdvancedCourses.jsx
- RefresherCourses.jsx
- SpecialistCourses.jsx
- TrainingCourseDetails.jsx
- Events.jsx
- Conferences.jsx
- EventDetails.jsx
- EventRegistrationSuccess.jsx
- SupervisionServicesMarketing.jsx
- SignpostingService.jsx
- ForumsAndWorkshops.jsx
- Governance.jsx
- Team.jsx
- IfSBoard.jsx
- Fellowship.jsx
- ResearchAndAdvocacy.jsx
- JobsBoardMarketing.jsx
- Jobs.jsx
- ArticlesOfAssociation.jsx
- TermsAndConditions.jsx
- PrivacyPolicy.jsx
- CookiePolicy.jsx
- Referral.jsx
- RegisteredOrganisation.jsx
- VerifyCredential.jsx
- Home.jsx (or Index)
- NotFound.jsx
- MemberAccessRequired.jsx

**PowerShell Command** (run from root):
```powershell
$mainSitePages = @('About', 'Contact', 'WhyJoinUs', 'JoinUs', 'Membership', 'MembershipPlans', 'MembershipTiers', 'AssociateMembership', 'FullMembership', 'MemberBenefits', 'Training', 'CPDTrainingMarketing', 'IntroductoryCourses', 'AdvancedCourses', 'RefresherCourses', 'SpecialistCourses', 'TrainingCourseDetails', 'Events', 'Conferences', 'EventDetails', 'EventRegistrationSuccess', 'SupervisionServicesMarketing', 'SignpostingService', 'ForumsAndWorkshops', 'Governance', 'Team', 'IfSBoard', 'Fellowship', 'ResearchAndAdvocacy', 'JobsBoardMarketing', 'Jobs', 'ArticlesOfAssociation', 'TermsAndConditions', 'PrivacyPolicy', 'CookiePolicy', 'Referral', 'RegisteredOrganisation', 'VerifyCredential', 'Home', 'NotFound', 'MemberAccessRequired', 'about', 'ApplicationPending')

foreach ($page in $mainSitePages) {
    $sourcePath = "c:\IFS App\src\pages\$page.jsx"
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination "c:\IFS App\apps\main-site\src\pages\$page.jsx" -Force
    }
}
```

#### For Portal (`apps/portal/src/pages/`):
Copy these page files:
- Dashboard.jsx
- MyProfile.jsx
- MyCertificates.jsx
- MyCreditHistory.jsx
- MyMasterclassBookings.jsx
- CPDTraining.jsx
- CourseDetails.jsx
- MemberMasterclasses.jsx
- MasterclassDetails.jsx
- CommunityEvents.jsx
- CommunityEventDetails.jsx
- Support.jsx
- AdminSupport.jsx
- News.jsx
- Forum.jsx
- ForumPostDetails.jsx
- AdminDashboard.jsx
- ManageOrganisation.jsx
- ManageOrgSubscription.jsx
- OrgAnalytics.jsx
- OrgInvoices.jsx
- OrgJobs.jsx
- OrgMembers.jsx
- OrgPayment.jsx
- OrgProfile.jsx
- Organisation.jsx
- OrganisationMembership.jsx
- PortalMembershipTiers.jsx
- EditEvent.jsx
- EditJob.jsx
- EditCourse.jsx
- EditSurvey.jsx
- EditUser.jsx
- Onboarding.jsx
- ApplicationProcessing.jsx
- YourVoice.jsx
- Survey.jsx
- SurveyResponses.jsx
- JobsBoard.jsx
- JobDetails.jsx
- SupervisionServices.jsx
- Job.jsx
- TrusteeElections.jsx
- RequestOrgPayment.jsx

**PowerShell Command** (run from root):
```powershell
$portalPages = @('Dashboard', 'MyProfile', 'MyCertificates', 'MyCreditHistory', 'MyMasterclassBookings', 'CPDTraining', 'CourseDetails', 'MemberMasterclasses', 'MasterclassDetails', 'CommunityEvents', 'CommunityEventDetails', 'Support', 'AdminSupport', 'News', 'Forum', 'ForumPostDetails', 'AdminDashboard', 'ManageOrganisation', 'ManageOrgSubscription', 'OrgAnalytics', 'OrgInvoices', 'OrgJobs', 'OrgMembers', 'OrgPayment', 'OrgProfile', 'Organisation', 'OrganisationMembership', 'PortalMembershipTiers', 'EditEvent', 'EditJob', 'EditCourse', 'EditSurvey', 'EditUser', 'Onboarding', 'ApplicationProcessing', 'YourVoice', 'Survey', 'SurveyResponses', 'JobsBoard', 'JobDetails', 'SupervisionServices', 'Job', 'TrusteeElections', 'RequestOrgPayment')

foreach ($page in $portalPages) {
    $sourcePath = "c:\IFS App\src\pages\$page.jsx"
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination "c:\IFS App\apps\portal\src\pages\$page.jsx" -Force
    }
}
```

### Step 2: Copy Component Files

#### Main Site Marketing Components:
```powershell
Copy-Item -Path "c:\IFS App\src\components\marketing" -Destination "c:\IFS App\apps\main-site\src\components\marketing" -Recurse -Force
Copy-Item -Path "c:\IFS App\src\components\admin" -Destination "c:\IFS App\apps\main-site\src\components\admin" -Recurse -Force
Copy-Item -Path "c:\IFS App\src\components\utils" -Destination "c:\IFS App\apps\main-site\src\components\utils" -Recurse -Force
```

#### Portal Components:
```powershell
Copy-Item -Path "c:\IFS App\src\components\portal" -Destination "c:\IFS App\apps\portal\src\components\portal" -Recurse -Force
Copy-Item -Path "c:\IFS App\src\components\admin" -Destination "c:\IFS App\apps\portal\src\components\admin" -Recurse -Force
Copy-Item -Path "c:\IFS App\src\components\utils" -Destination "c:\IFS App\apps\portal\src\components\utils" -Recurse -Force
```

### Step 3: Create Entry Files

I'll create these files for you in the next steps.

### Step 4: Create Environment Files

#### `apps/main-site/.env`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_PORTAL_URL=http://localhost:3001
VITE_MAIN_SITE_URL=http://localhost:3000
```

#### `apps/portal/.env`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_PORTAL_URL=http://localhost:3001
VITE_MAIN_SITE_URL=http://localhost:3000
```

Copy values from your existing `.env` file.

### Step 5: Install Dependencies

```bash
# From root directory
npm install
```

### Step 6: Update Import Paths

After copying files, you'll need to update import paths in the copied files:

- Change `@/components/ui/*` to `@ifs/shared/components/ui/*`
- Change `@/hooks/*` to `@ifs/shared/hooks/*`
- Change `@/lib/*` to `@ifs/shared/lib/*`
- Change `@/utils/*` to `@ifs/shared/utils/*`
- Change `@/api/*` to `@ifs/shared/api/*`

### Step 7: Test

```bash
# Terminal 1 - Run main site
npm run dev:main

# Terminal 2 - Run portal
npm run dev:portal
```

Visit:
- Main site: http://localhost:3000
- Portal: http://localhost:3001

### Step 8: Deploy

Deploy each app to your hosting provider:
- **Main site** → yourdomain.com
- **Portal** → portal.yourdomain.com

Update environment variables for production URLs.

## Automation Option

Instead of manual copying, I can create these remaining files for you:
1. Routing files for both apps
2. App.jsx files
3. main.jsx files
4. index.html files
5. Domain redirect logic

Would you like me to proceed with creating these files?
