


import { isMainSitePage, isPortalPage } from '../../config/pages.js';

const ADMIN_PAGES = new Set(['admindashboard', 'adminsupport']);
const ADMIN_URL_FALLBACK = 'https://admin.ifs-safeguarding.co.uk';
const PORTAL_URL_FALLBACK = 'http://localhost:3001';
const MAIN_SITE_URL_FALLBACK = 'http://localhost:3000';

const getAdminUrl = () => {
    return import.meta?.env?.VITE_ADMIN_URL || ADMIN_URL_FALLBACK;
};

const getPortalUrl = () => {
    const envUrl = import.meta?.env?.VITE_PORTAL_URL;
    if (envUrl) {
        return envUrl;
    }
    if (typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
        return PORTAL_URL_FALLBACK;
    }
    return null;
};

const getMainSiteUrl = () => {
    const envUrl = import.meta?.env?.VITE_MAIN_SITE_URL;
    if (envUrl) {
        return envUrl;
    }
    if (typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
        return MAIN_SITE_URL_FALLBACK;
    }
    return null;
};

const getOrigin = (url: string | null) => {
    if (!url) {
        return null;
    }
    try {
        return new URL(url).origin;
    } catch (error) {
        return null;
    }
};

const getAdminHost = (adminUrl: string) => {
    try {
        return new URL(adminUrl).host;
    } catch (error) {
        return new URL(ADMIN_URL_FALLBACK).host;
    }
};

export const isAdminDomain = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    const adminHost = getAdminHost(getAdminUrl());
    return window.location.host === adminHost;
};

export function createPageUrl(pageName: string) {
    const [rawPath, query] = pageName.split('?');
    const normalizedPath = '/' + rawPath.toLowerCase().replace(/ /g, '-');
    const fullPath = query ? `${normalizedPath}?${query}` : normalizedPath;
    const normalizedKey = rawPath.toLowerCase().replace(/ /g, '-');

    if (!ADMIN_PAGES.has(normalizedKey)) {
        if (typeof window === 'undefined') {
            return fullPath;
        }

        const currentOrigin = window.location.origin;
        const portalOrigin = getOrigin(getPortalUrl());
        const mainOrigin = getOrigin(getMainSiteUrl());

        if (portalOrigin && isPortalPage(rawPath) && currentOrigin !== portalOrigin) {
            return `${portalOrigin}${fullPath}`;
        }

        if (mainOrigin && isMainSitePage(rawPath) && currentOrigin !== mainOrigin) {
            return `${mainOrigin}${fullPath}`;
        }

        return fullPath;
    }

    const adminUrl = getAdminUrl();
    if (isAdminDomain()) {
        return fullPath;
    }

    return `${adminUrl}${fullPath}`;
}

export function navigateToUrl(navigate: (to: string) => void, url: string) {
    if (typeof window !== 'undefined' && /^https?:\/\//i.test(url)) {
        window.location.href = url;
        return;
    }

    navigate(url);
}
