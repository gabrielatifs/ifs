
import { ifs } from '@/api/ifsClient';

// Use current origin to support both preview and production
const APP_DOMAIN = window.location.origin;

/**
 * Use the SDK but with an absolute URL to force the correct domain
 * @param {string} redirectPath - The path to redirect to after login (e.g., '/Onboarding?intent=associate')
 */
export const customLoginWithRedirect = (redirectPath) => {
    try {
        // Construct the full, absolute URL
        const fullRedirectUrl = redirectPath.startsWith('http') ? redirectPath : `${APP_DOMAIN}${redirectPath}`;
        
        console.log('Attempting SDK login with absolute URL:', fullRedirectUrl);
        
        // Use ifs.auth.redirectToLogin instead of User.loginWithRedirect
        ifs.auth.redirectToLogin(fullRedirectUrl);
    } catch (error) {
        console.error('Login redirect failed:', error);
        // Fallback to regular login
        ifs.auth.redirectToLogin();
    }
};

// --- Standard SDK calls for other purposes ---

export const login = async () => {
    try {
        ifs.auth.redirectToLogin();
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
};

export const logout = async () => {
    try {
        await ifs.auth.logout();
    } catch (error) {
        console.error('Logout failed:', error);
        throw error;
    }
};
