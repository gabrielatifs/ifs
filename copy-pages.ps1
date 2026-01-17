# PowerShell script to copy pages and components to the new structure

Write-Host "Starting IFS App restructuring..." -ForegroundColor Green

# Create directories if they don't exist
Write-Host "`nCreating directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "c:\IFS App\apps\main-site\src\pages" | Out-Null
New-Item -ItemType Directory -Force -Path "c:\IFS App\apps\portal\src\pages" | Out-Null
New-Item -ItemType Directory -Force -Path "c:\IFS App\apps\main-site\src\components" | Out-Null
New-Item -ItemType Directory -Force -Path "c:\IFS App\apps\portal\src\components" | Out-Null

# Main site pages
$mainSitePages = @(
    'About', 'Contact', 'WhyJoinUs', 'JoinUs', 'Membership', 'MembershipPlans',
    'MembershipTiers', 'AssociateMembership', 'FullMembership', 'MemberBenefits',
    'Training', 'CPDTrainingMarketing', 'IntroductoryCourses', 'AdvancedCourses',
    'RefresherCourses', 'SpecialistCourses', 'TrainingCourseDetails', 'Events',
    'Conferences', 'EventDetails', 'EventRegistrationSuccess', 'SupervisionServicesMarketing',
    'SignpostingService', 'ForumsAndWorkshops', 'Governance', 'Team', 'IfSBoard',
    'Fellowship', 'ResearchAndAdvocacy', 'JobsBoardMarketing', 'Jobs',
    'ArticlesOfAssociation', 'TermsAndConditions', 'PrivacyPolicy', 'CookiePolicy',
    'Referral', 'RegisteredOrganisation', 'VerifyCredential', 'Home', 'NotFound',
    'MemberAccessRequired', 'about', 'ApplicationPending'
)

# Portal pages
$portalPages = @(
    'Dashboard', 'MyProfile', 'MyCertificates', 'MyCreditHistory', 'MyMasterclassBookings',
    'CPDTraining', 'CourseDetails', 'MemberMasterclasses', 'MasterclassDetails',
    'CommunityEvents', 'CommunityEventDetails', 'Support', 'AdminSupport', 'News',
    'Forum', 'ForumPostDetails', 'AdminDashboard', 'ManageOrganisation',
    'ManageOrgSubscription', 'OrgAnalytics', 'OrgInvoices', 'OrgJobs', 'OrgMembers',
    'OrgPayment', 'OrgProfile', 'Organisation', 'OrganisationMembership',
    'PortalMembershipTiers', 'EditEvent', 'EditJob', 'EditCourse', 'EditSurvey',
    'EditUser', 'Onboarding', 'ApplicationProcessing', 'YourVoice', 'Survey',
    'SurveyResponses', 'JobsBoard', 'JobDetails', 'SupervisionServices', 'Job',
    'TrusteeElections', 'RequestOrgPayment'
)

# Copy main site pages
Write-Host "`nCopying main site pages..." -ForegroundColor Yellow
$mainSiteCopied = 0
foreach ($page in $mainSitePages) {
    $sourcePath = "c:\IFS App\src\pages\$page.jsx"
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination "c:\IFS App\apps\main-site\src\pages\$page.jsx" -Force
        $mainSiteCopied++
    } else {
        Write-Host "  Warning: $page.jsx not found" -ForegroundColor DarkYellow
    }
}
Write-Host "  Copied $mainSiteCopied main site page files" -ForegroundColor Green

# Copy portal pages
Write-Host "`nCopying portal pages..." -ForegroundColor Yellow
$portalCopied = 0
foreach ($page in $portalPages) {
    $sourcePath = "c:\IFS App\src\pages\$page.jsx"
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination "c:\IFS App\apps\portal\src\pages\$page.jsx" -Force
        $portalCopied++
    } else {
        Write-Host "  Warning: $page.jsx not found" -ForegroundColor DarkYellow
    }
}
Write-Host "  Copied $portalCopied portal page files" -ForegroundColor Green

# Copy Layout.jsx to both apps
Write-Host "`nCopying Layout files..." -ForegroundColor Yellow
if (Test-Path "c:\IFS App\src\pages\Layout.jsx") {
    Copy-Item -Path "c:\IFS App\src\pages\Layout.jsx" -Destination "c:\IFS App\apps\main-site\src\pages\Layout.jsx" -Force
    Copy-Item -Path "c:\IFS App\src\pages\Layout.jsx" -Destination "c:\IFS App\apps\portal\src\pages\Layout.jsx" -Force
    Write-Host "  Layout.jsx copied to both apps" -ForegroundColor Green
}

# Copy marketing components to main site
Write-Host "`nCopying marketing components to main site..." -ForegroundColor Yellow
if (Test-Path "c:\IFS App\src\components\marketing") {
    Copy-Item -Path "c:\IFS App\src\components\marketing" -Destination "c:\IFS App\apps\main-site\src\components\marketing" -Recurse -Force
    Write-Host "  Marketing components copied" -ForegroundColor Green
}

# Copy portal components to portal
Write-Host "`nCopying portal components to portal..." -ForegroundColor Yellow
if (Test-Path "c:\IFS App\src\components\portal") {
    Copy-Item -Path "c:\IFS App\src\components\portal" -Destination "c:\IFS App\apps\portal\src\components\portal" -Recurse -Force
    Write-Host "  Portal components copied" -ForegroundColor Green
}

# Copy admin components to both
Write-Host "`nCopying admin components to both apps..." -ForegroundColor Yellow
if (Test-Path "c:\IFS App\src\components\admin") {
    Copy-Item -Path "c:\IFS App\src\components\admin" -Destination "c:\IFS App\apps\main-site\src\components\admin" -Recurse -Force
    Copy-Item -Path "c:\IFS App\src\components\admin" -Destination "c:\IFS App\apps\portal\src\components\admin" -Recurse -Force
    Write-Host "  Admin components copied to both apps" -ForegroundColor Green
}

# Copy utils to both
Write-Host "`nCopying utils to both apps..." -ForegroundColor Yellow
if (Test-Path "c:\IFS App\src\components\utils") {
    Copy-Item -Path "c:\IFS App\src\components\utils" -Destination "c:\IFS App\apps\main-site\src\components\utils" -Recurse -Force
    Copy-Item -Path "c:\IFS App\src\components\utils" -Destination "c:\IFS App\apps\portal\src\components\utils" -Recurse -Force
    Write-Host "  Utils copied to both apps" -ForegroundColor Green
}

# Copy environment files
Write-Host "`nSetting up environment files..." -ForegroundColor Yellow
if (Test-Path "c:\IFS App\.env") {
    Copy-Item -Path "c:\IFS App\.env" -Destination "c:\IFS App\apps\main-site\.env" -Force
    Copy-Item -Path "c:\IFS App\.env" -Destination "c:\IFS App\apps\portal\.env" -Force
    Write-Host "  Environment files copied" -ForegroundColor Green
    Write-Host "  Remember to add VITE_PORTAL_URL and VITE_MAIN_SITE_URL to both .env files!" -ForegroundColor Cyan
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "Restructuring complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Add these lines to both .env files:" -ForegroundColor White
Write-Host "   VITE_PORTAL_URL=http://localhost:3001" -ForegroundColor Gray
Write-Host "   VITE_MAIN_SITE_URL=http://localhost:3000" -ForegroundColor Gray
Write-Host "`n2. Install dependencies:" -ForegroundColor White
Write-Host "   npm install" -ForegroundColor Gray
Write-Host "`n3. Create routing files (see IMPLEMENTATION_GUIDE.md)" -ForegroundColor White
Write-Host "`n4. Test the applications:" -ForegroundColor White
Write-Host "   npm run dev:main   (runs on port 3000)" -ForegroundColor Gray
Write-Host "   npm run dev:portal (runs on port 3001)" -ForegroundColor Gray

Write-Host "`nFor detailed instructions, see:" -ForegroundColor Cyan
Write-Host "- IMPLEMENTATION_GUIDE.md" -ForegroundColor White
Write-Host "- RESTRUCTURE_PLAN.md" -ForegroundColor White
