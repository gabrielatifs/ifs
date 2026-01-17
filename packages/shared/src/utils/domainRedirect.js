import { isPortalPage, isMainSitePage, isAdminPage, getPageFromPath } from '../config/pages.js';

/**
 * Check if current page should redirect to a different domain
 * @param {string} currentDomain - 'main' or 'portal'
 * @returns {string|null} - Redirect URL if redirect needed, null otherwise
 */
export const checkDomainRedirect = (currentDomain) => {
  const pathname = window.location.pathname;
  const pageName = getPageFromPath(pathname);

  const PORTAL_URL = import.meta.env.VITE_PORTAL_URL || 'http://localhost:3001';
  const MAIN_SITE_URL = import.meta.env.VITE_MAIN_SITE_URL || 'http://localhost:3000';

  // Portal root should not redirect away; let the portal app handle it.
  if (currentDomain === 'portal' && !pageName) {
    return null;
  }

  // If on main site but page should be on portal
  if (currentDomain === 'main' && pageName && isPortalPage(pageName)) {
    return `${PORTAL_URL}${pathname}${window.location.search}${window.location.hash}`;
  }

  // If on portal but page should be on main site
  if (currentDomain === 'portal' && pageName && isMainSitePage(pageName) && !isPortalPage(pageName)) {
    return `${MAIN_SITE_URL}${pathname}${window.location.search}${window.location.hash}`;
  }

  return null;
};

/**
 * Get the correct domain URL for a given page
 * @param {string} pageName - Name of the page
 * @param {string} currentDomain - Current domain ('main' or 'portal')
 * @returns {string} - Base URL for the page
 */
export const getPageDomain = (pageName, currentDomain) => {
  const PORTAL_URL = import.meta.env.VITE_PORTAL_URL || 'http://localhost:3001';
  const MAIN_SITE_URL = import.meta.env.VITE_MAIN_SITE_URL || 'http://localhost:3000';
  const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || 'https://admin.ifs-safeguarding.co.uk';

  if (isAdminPage(pageName)) {
    return ADMIN_URL;
  }

  if (isPortalPage(pageName)) {
    return PORTAL_URL;
  }

  return MAIN_SITE_URL;
};

/**
 * Build a cross-domain aware link
 * @param {string} path - Path like '/Dashboard' or '/About'
 * @param {string} currentDomain - Current domain ('main' or 'portal')
 * @returns {string} - Full URL with correct domain
 */
export const buildLink = (path, currentDomain) => {
  // Remove leading slash to get page name
  const pageName = path.startsWith('/') ? path.slice(1).split('/')[0] : path.split('/')[0];

  // Check if this page belongs to a different domain
  const targetDomain = getPageDomain(pageName, currentDomain);
  const PORTAL_URL = import.meta.env.VITE_PORTAL_URL || 'http://localhost:3001';
  const MAIN_SITE_URL = import.meta.env.VITE_MAIN_SITE_URL || 'http://localhost:3000';
  const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || 'https://admin.ifs-safeguarding.co.uk';

  const currentDomainUrl = currentDomain === 'portal'
    ? PORTAL_URL
    : currentDomain === 'admin'
      ? ADMIN_URL
      : MAIN_SITE_URL;

  // If target domain is same as current, return relative path
  if (targetDomain === currentDomainUrl) {
    return path;
  }

  // Otherwise return full URL
  return `${targetDomain}${path}`;
};
