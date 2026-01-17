


export function createPageUrl(pageName: string) {
    return '/' + pageName.toLowerCase().replace(/ /g, '-');
}

export const fastLogout = () => {
    const mainSiteUrl = import.meta?.env?.VITE_MAIN_SITE_URL || '/';
    try {
        const supabaseUrl = import.meta?.env?.VITE_SUPABASE_URL || '';
        const projectRef = new URL(supabaseUrl).host.split('.')[0];
        if (projectRef) {
            const storageKey = `sb-${projectRef}-auth-token`;
            localStorage.removeItem(storageKey);
            sessionStorage.removeItem(storageKey);
        }
    } catch (error) {
        // Ignore parsing/storage errors to keep logout fast.
    }
    window.location.replace(mainSiteUrl);
};