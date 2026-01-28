import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * PathNormalizer ensures all marketing site URLs are lowercase.
 * If a user visits /About or /CONTACT, they will be redirected to /about or /contact.
 * This is important for SEO (avoiding duplicate content) and consistent URL presentation.
 */
export default function PathNormalizer() {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const currentPath = location.pathname;
        const lowercasePath = currentPath.toLowerCase();

        // If the path contains any uppercase characters, redirect to lowercase
        if (currentPath !== lowercasePath) {
            console.log(`[PathNormalizer] Redirecting to lowercase: ${currentPath} -> ${lowercasePath}`);
            navigate(lowercasePath + location.search + location.hash, { replace: true });
        }
    }, [location.pathname, location.search, location.hash, navigate]);

    // This component renders nothing
    return null;
}
