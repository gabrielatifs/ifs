
import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MarketingHeader from '../components/marketing/MarketingHeader';
import MarketingFooter from '../components/marketing/MarketingFooter';
import { BreadcrumbProvider } from '../components/providers/BreadcrumbProvider';
import { UserProvider, useUser } from '../components/providers/UserProvider';
import { AdminModeProvider } from '../components/providers/AdminModeProvider';
import { PostHogProvider, usePostHog } from '../components/providers/PostHogProvider';
import PathNormalizer from '../components/utils/PathNormalizer';
import AdminModeToggle from '../components/admin/AdminModeToggle';
import PortalBottomNav from '../components/portal/PortalBottomNav';
import { Loader2 } from 'lucide-react';
import IncompleteApplicationModal from '../components/marketing/IncompleteApplicationModal';
import CookieBanner from '../components/marketing/CookieBanner';
import { ifs } from '@/api/ifsClient';
import MetaTitleManager from '../components/utils/MetaTitleManager';
import { HelmetProvider } from 'react-helmet-async';

const portalPages = ['Dashboard', 'AdminDashboard', 'EditEvent', 'EditJob', 'EditCourse', 'EditSurvey', 'SurveyResponses', 'CPDTraining', 'CourseDetails', 'MemberMasterclasses', 'MasterclassDetails', 'JobsBoard', 'JobDetails', 'SupervisionServices', 'PortalMembershipTiers', 'MyProfile', 'MyCertificates', 'ManageOrganisation', 'OrganisationMembership', 'MyMasterclassBookings', 'RequestOrgPayment', 'Onboarding', 'ApplicationProcessing', 'YourVoice', 'Survey', 'EditUser', 'CommunityEvents', 'CommunityEventDetails', 'Support', 'AdminSupport', 'Forum', 'ForumPostDetails', 'News', 'OrgMembers', 'OrgJobs', 'OrgAnalytics', 'ManageOrgSubscription', 'OrgProfile', 'OrgInvoices'];

const noLayoutPages = ['NotFound', 'MembershipPlans', 'EventRegistrationSuccess'];

const pagesWithoutBottomNav = ['MasterclassDetails', 'Onboarding'];

// Apollo tracking script initialization
const initApolloTracking = () => {
  if (window.trackingFunctions) {
    // Already initialized
    return;
  }
  
  const randomString = Math.random().toString(36).substring(7);
  const script = document.createElement("script");
  script.src = "https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache=" + randomString;
  script.async = true;
  script.defer = true;
  script.onload = function() {
    if (window.trackingFunctions) {
      window.trackingFunctions.onLoad({ appId: "690226cf117a9c0015d72390" });
    }
  };
  document.head.appendChild(script);
};

// Global error handler that catches all unhandled errors
window.addEventListener('unhandledrejection', (event) => {
  console.log('[DEBUG] Unhandled promise rejection:', event.reason);
  if (event.reason && event.reason.message && event.reason.message.includes("can't import file pages/")) {
    console.log('[DEBUG] Page import failure detected, redirecting to NotFound');
    event.preventDefault();
    // Force navigation to NotFound
    const currentPath = window.location.pathname;
    const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));
    window.location.replace(basePath + '/NotFound');
  }
});

window.addEventListener('error', (event) => {
  console.log('[DEBUG] Global error caught:', event.error);
  if (event.error && event.error.message && event.error.message.includes("can't import file pages/")) {
    console.log('[DEBUG] Page import failure detected in global error handler');
    // Force navigation to NotFound
    const currentPath = window.location.pathname;
    const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));
    window.location.replace(basePath + '/NotFound');
  }
});

// Error Boundary Component to catch page import errors
class PageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    console.log('[DEBUG] PageErrorBoundary constructor called');
  }

  static getDerivedStateFromError(error) {
    console.log('[DEBUG] PageErrorBoundary.getDerivedStateFromError called with error:', error);
    console.log('[DEBUG] Error message:', error.message);
    console.log('[DEBUG] Error stack:', error.stack);
    
    // Check for page import errors
    if (error.message && (
      error.message.includes("can't import file pages/") ||
      error.message.includes("Cannot resolve module") ||
      error.message.includes("Failed to fetch") ||
      error.message.includes("doesn't exist")
    )) {
      console.log('[DEBUG] Page import error detected, setting hasError to true');
      return { hasError: true, error };
    }
    
    console.log('[DEBUG] Other error detected, setting hasError to true anyway');
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[DEBUG] PageErrorBoundary.componentDidCatch called');
    console.error('[DEBUG] Error:', error);
    console.error('[DEBUG] Error info:', errorInfo);
  }

  render() {
    console.log('[DEBUG] PageErrorBoundary.render called, hasError:', this.state.hasError);
    
    if (this.state.hasError) {
      console.log('[DEBUG] Rendering NotFound content due to error');
      // Render NotFound page content directly to avoid import issues
      return (
        <div className="bg-white">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-40">
            <div className="text-center">
              <div className="flex justify-center items-center mb-8">
                <svg className="w-16 h-16 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 13l6 6" />
                </svg>
              </div>
              <p className="text-base font-semibold text-purple-600 uppercase tracking-wide">404 error</p>
              <h1 className="mt-2 text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl">
                This page does not exist.
              </h1>
              <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
              </p>
              <div className="mt-10">
                <button 
                  onClick={() => window.location.href = '/'}
                  className="bg-purple-800 hover:bg-purple-900 text-white font-semibold px-8 py-3 rounded-sm inline-flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Return to Homepage
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    console.log('[DEBUG] Rendering children normally');
    return this.props.children;
  }
}

// This new component wraps portal pages and adds the bottom nav
function PortalLayout({ children, currentPageName }) {
    const { user, initialCheckComplete } = useUser();
    const location = useLocation();

    console.log('[PortalLayout] Render:', { 
        page: currentPageName, 
        hasUser: !!user, 
        initialCheckComplete,
        path: location.pathname 
    });

    // Handle authentication for portal pages
    useEffect(() => {
        console.log('[PortalLayout] Auth check:', { initialCheckComplete, hasUser: !!user });
        if (!initialCheckComplete) return;
        
        if (!user) {
            console.log('[PortalLayout] No user, redirecting to login');
            const currentUrl = location.pathname + location.search + location.hash;
            ifs.auth.redirectToLogin(currentUrl);
        }
    }, [user, initialCheckComplete, location]);

    return (
        <>
            {children}
            <AdminModeToggle />
            {!pagesWithoutBottomNav.includes(currentPageName) && user && (
              <PortalBottomNav user={user} currentPage={currentPageName} />
            )}
        </>
    );
}



function LayoutContent({ children, currentPageName }) {
  const { pathname, search } = useLocation();
  const { trackPage, isReady: isPostHogReady, handleConsentChange } = usePostHog();
  const { user } = useUser();
  const prevPathnameRef = useRef(pathname);

  console.log(`[DEBUG] Layout rendering page: '${currentPageName}' for path: '${pathname}'`);

  // Check if this is a public event details page accessed from marketing site
  const urlParams = new URLSearchParams(search);
  const fromEvents = urlParams.get('from') === 'Events';
  const isPublicEventView = currentPageName === 'CommunityEventDetails' && fromEvents;

  useEffect(() => {
    // FIXED: Only scroll to top if the pathname actually changed AND it's not just a hash or query param change
    const currentPathOnly = pathname.split('?')[0].split('#')[0];
    const prevPathOnly = prevPathnameRef.current.split('?')[0].split('#')[0];
    
    if (prevPathOnly !== currentPathOnly) {
      window.scrollTo(0, 0);
      prevPathnameRef.current = pathname;
    }

    if (isPostHogReady) {
      trackPage(currentPageName, {
        path: pathname,
        is_portal_page: portalPages.includes(currentPageName) && !isPublicEventView
      });
    }
  }, [pathname, currentPageName, trackPage, isPostHogReady, isPublicEventView]);

  useEffect(() => {
    // Only initialize Apollo tracking on public marketing pages, not portal pages
    const isPortalPage = portalPages.includes(currentPageName) && !isPublicEventView;
    if (!isPortalPage) {
      initApolloTracking();
    }
  }, [currentPageName, isPublicEventView]);

  // Add noindex meta tag for portal pages to prevent search engine crawling
  useEffect(() => {
    const isPortalPage = portalPages.includes(currentPageName) && !isPublicEventView;
    
    // Check if meta tag already exists
    let metaRobots = document.querySelector('meta[name="robots"]');
    
    if (isPortalPage) {
      // Add or update noindex meta tag for portal pages
      if (!metaRobots) {
        metaRobots = document.createElement('meta');
        metaRobots.name = 'robots';
        document.head.appendChild(metaRobots);
      }
      metaRobots.content = 'noindex, nofollow';
    } else {
      // Remove noindex for public pages (or set to default)
      if (metaRobots) {
        metaRobots.content = 'index, follow';
      }
    }

    // Cleanup function
    return () => {
      // Reset to default when navigating away from a portal page or unmounting
      if (metaRobots && isPortalPage) {
        metaRobots.content = 'index, follow';
      }
    };
  }, [currentPageName, isPublicEventView]);

  if (noLayoutPages.includes(currentPageName)) {
    console.log(`[DEBUG] Page '${currentPageName}' is in noLayoutPages. Rendering without Marketing Layout.`);
    return (
      <PageErrorBoundary>
        {children}
        <AdminModeToggle />
        <CookieBanner onConsentChange={handleConsentChange} />
      </PageErrorBoundary>
    );
  }

  // Check if this is a portal page BUT NOT a public event view
  if (portalPages.includes(currentPageName) && !isPublicEventView) {
    console.log(`[DEBUG] Page '${currentPageName}' is a portal page. Rendering with Portal Layout.`);
    return (
      <PortalLayout currentPageName={currentPageName}>
        <PageErrorBoundary>
          {children}
        </PageErrorBoundary>
        <CookieBanner onConsentChange={handleConsentChange} />
      </PortalLayout>
    );
  }

  console.log(`[DEBUG] Page '${currentPageName}' is a standard marketing page. Rendering with full Marketing Layout.`);
  return (
    <BreadcrumbProvider>
      <MarketingHeader />
      <IncompleteApplicationModal />
      <main>
        <PageErrorBoundary>
          {children}
        </PageErrorBoundary>
      </main>
      <MarketingFooter />
      <AdminModeToggle />
      <CookieBanner onConsentChange={handleConsentChange} />
    </BreadcrumbProvider>
  );
}

export default function Layout({ children, currentPageName }) {
  console.log(`[DEBUG] Main Layout component called with currentPageName: '${currentPageName}'`);
  
  return (
    <PageErrorBoundary>
      <HelmetProvider>
        {/* AdminModeProvider and UserProvider moved here to ensure contexts are available globally for LayoutContent and its children */}
        <AdminModeProvider>
          <UserProvider>
            <PostHogProvider>
              <PathNormalizer />
              <MetaTitleManager pageName={currentPageName} />
              <LayoutContent currentPageName={currentPageName}>
                {children}
              </LayoutContent>
            </PostHogProvider>
          </UserProvider>
        </AdminModeProvider>
      </HelmetProvider>
    </PageErrorBoundary>
  );
}
