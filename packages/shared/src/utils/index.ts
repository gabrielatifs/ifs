


import { isMainSitePage, isPortalPage } from '../config/pages.js';

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

export const fastLogout = () => {
    const mainSiteUrl = import.meta?.env?.VITE_MAIN_SITE_URL || '/';
    const authCookieDomain = import.meta?.env?.VITE_AUTH_COOKIE_DOMAIN || '';
    try {
        const supabaseUrl = import.meta?.env?.VITE_SUPABASE_URL || '';
        const projectRef = new URL(supabaseUrl).host.split('.')[0];
        if (projectRef) {
            const storageKey = `sb-${projectRef}-auth-token`;
            localStorage.removeItem(storageKey);
            sessionStorage.removeItem(storageKey);
            if (typeof document !== 'undefined') {
                const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
                const baseAttrs = [
                    'path=/',
                    'SameSite=Lax',
                    isSecure ? 'Secure' : '',
                    'Max-Age=0'
                ].filter(Boolean);
                const clearCookie = (name, domain) => {
                    const attrs = domain ? [...baseAttrs, `domain=${domain}`] : baseAttrs;
                    document.cookie = `${name}=; ${attrs.join('; ')}`;
                };
                const cookieNames = document.cookie
                    .split(';')
                    .map((item) => item.trim().split('=')[0])
                    .filter(Boolean);
                cookieNames
                    .filter((name) => name.startsWith(storageKey))
                    .forEach((name) => {
                        clearCookie(name, authCookieDomain || null);
                        clearCookie(name, null);
                    });
            }
        }
    } catch (error) {
        // Ignore parsing/storage errors to keep logout fast.
    }
    window.location.replace(mainSiteUrl);
};
