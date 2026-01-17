
import React from 'react';
import { Link } from 'react-router-dom';
import { useBreadcrumbs } from '@/components/providers/BreadcrumbProvider';

export default function HeroBreadcrumbs({ 
    pageName, 
    options = {}, // Changed from dynamicTitle to options object
    baseColor = 'text-purple-200', 
    activeColor = 'text-white' 
}) {
    const { getBreadcrumbs } = useBreadcrumbs();
    const breadcrumbs = getBreadcrumbs(pageName, options);

    if (!breadcrumbs || breadcrumbs.length < 2) {
        return null;
    }

    return (
        <div className={`text-sm ${baseColor} mb-4 font-medium tracking-wider uppercase`}>
            {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={`${crumb.path}-${index}`}>
                    {index > 0 && <span className="mx-2">/</span>}
                    {index === breadcrumbs.length - 1 ? (
                        <span className={activeColor}>{crumb.label}</span>
                    ) : (
                        <Link to={crumb.path} className={`hover:${activeColor} transition-colors`}>
                            {crumb.label}
                        </Link>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}
