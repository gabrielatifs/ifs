# Testing Guide: Dual-App Setup

## ✅ Setup Complete!

Your IFS App has been successfully restructured into two separate applications:

### Structure
```
Main Site (Port 3000)     →  43 public pages
Portal (Port 3001)        →  45 member pages
Shared Package            →  Common components, hooks, utils
```

## Testing Without Domains

Everything is configured to work with `localhost:3000` and `localhost:3001` - no domain setup needed!

### How the Redirect Works

**Example 1: Portal page on main site**
1. Visit: `http://localhost:3000/Dashboard`
2. App detects "Dashboard" is a portal page
3. Auto-redirects to: `http://localhost:3001/Dashboard`

**Example 2: Main site page on portal**
1. Visit: `http://localhost:3001/About`
2. App detects "About" is a main site page
3. Auto-redirects to: `http://localhost:3000/About`

## Running the Apps

### Option 1: Run Both Together
```bash
npm run dev
```
This starts both apps simultaneously using `concurrently`.

### Option 2: Run Separately
```bash
# Terminal 1 - Main Site
npm run dev:main

# Terminal 2 - Portal
npm run dev:portal
```

## Testing Checklist

### 1. Main Site (localhost:3000)
- [ ] Visit `http://localhost:3000` - should show Home page
- [ ] Click around marketing pages (About, Membership, Training, etc.)
- [ ] Try to visit `http://localhost:3000/Dashboard` - should redirect to port 3001

### 2. Portal (localhost:3001)
- [ ] Visit `http://localhost:3001` - should show Dashboard
- [ ] Click around portal pages (MyProfile, CPDTraining, etc.)
- [ ] Try to visit `http://localhost:3001/About` - should redirect to port 3000

### 3. Cross-Domain Navigation
Test that links between apps work correctly:
- From main site → portal pages should redirect
- From portal → main site pages should redirect

## Common Issues & Fixes

### Issue: Import errors like "Cannot find module '@ifs/shared'"
**Fix:** The shared package uses workspace protocol. Make sure npm install completed:
```bash
npm install
```

### Issue: Pages show blank or error
**Fix:** Check browser console for import errors. The pages might have imports that need updating to use the shared package:
```javascript
// Old (won't work):
import { Button } from '@/components/ui/button'

// New (correct):
import { Button } from '@ifs/shared/components/ui/button'
```

### Issue: Styles not loading
**Fix:** Make sure the CSS imports in `main.jsx` point to the shared package:
```javascript
import '@ifs/shared/index.css'
```

### Issue: Infinite redirect loop
**Fix:** Check that the page is correctly categorized in `packages/shared/src/config/pages.js`

## Environment Variables

Both apps use these variables (already configured):

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_PORTAL_URL=http://localhost:3001
VITE_MAIN_SITE_URL=http://localhost:3000
```

## What Pages Go Where?

### Main Site (43 pages)
About, AdvancedCourses, ApplicationPending, ArticlesOfAssociation, AssociateMembership, Conferences, Contact, CookiePolicy, CPDTrainingMarketing, EventDetails, EventRegistrationSuccess, Events, Fellowship, ForumsAndWorkshops, FullMembership, Governance, Home, IfSBoard, IntroductoryCourses, Jobs, JobsBoardMarketing, JoinUs, MemberAccessRequired, MemberBenefits, Membership, MembershipPlans, MembershipTiers, NotFound, PrivacyPolicy, Referral, RefresherCourses, RegisteredOrganisation, ResearchAndAdvocacy, SignpostingService, SpecialistCourses, SupervisionServicesMarketing, Team, TermsAndConditions, Training, TrainingCourseDetails, VerifyCredential, WhyJoinUs

### Portal (45 pages)
AdminDashboard, AdminSupport, ApplicationProcessing, CommunityEventDetails, CommunityEvents, CourseDetails, CPDTraining, Dashboard, EditCourse, EditEvent, EditJob, EditSurvey, EditUser, Forum, ForumPostDetails, Job, JobDetails, JobsBoard, ManageOrganisation, ManageOrgSubscription, MasterclassDetails, MemberMasterclasses, MyCertificates, MyCreditHistory, MyMasterclassBookings, MyProfile, News, Onboarding, OrgAnalytics, Organisation, OrganisationMembership, OrgInvoices, OrgJobs, OrgMembers, OrgPayment, OrgProfile, PortalMembershipTiers, RequestOrgPayment, SupervisionServices, Support, Survey, SurveyResponses, TrusteeElections, YourVoice

## Next Steps After Testing

Once everything works locally:

1. **Fix import paths** - Update any remaining `@/` imports to use `@ifs/shared`
2. **Production deployment** - Update .env files with actual domain URLs
3. **Build for production**:
   ```bash
   npm run build
   ```
4. **Deploy**:
   - `apps/main-site/dist/` → your main domain
   - `apps/portal/dist/` → your subdomain

## Need Help?

If you encounter issues:
1. Check browser console for errors
2. Check terminal for build errors
3. Verify import paths use `@ifs/shared` not `@/`
4. Make sure npm install completed successfully
