import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import JobDetailsView from '@/components/jobs/JobDetailsView';
import { Loader2, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import MainSiteNav from '@/components/marketing/MainSiteNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import { base44 } from '@/api/base44Client';

export default function Job() {
    const location = useLocation();
    const [jobId, setJobId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const extractJobId = () => {
            const searchParams = new URLSearchParams(location.search);
            const idParam = searchParams.get('id');
            
            if (idParam) {
                // Strategy: The ID is always the last part after the last hyphen
                // Example: family-liaison-officer-clacton-on-sea-692ce77347576af1c861b16c
                const parts = idParam.split('-');
                const potentialId = parts[parts.length - 1];

                // Base44/Mongo IDs are typically 24 hex chars
                // But we'll just check if it looks reasonably like an ID (alphanumeric, decent length)
                if (potentialId && potentialId.length > 5) {
                    setJobId(potentialId);
                } else {
                    // Fallback: maybe the whole param is the ID?
                    setJobId(idParam);
                }
            }

            setLoading(false);
        };
        
        extractJobId();
    }, [location]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    if (jobId) {
        return <JobDetailsView jobId={jobId} />;
    }

    // No redirect - render a proper page for SEO
    // This handles the case when /Job is accessed without an ID
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <MainSiteNav variant="solid-mobile" />
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Briefcase className="w-8 h-8 text-purple-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Our Jobs Board</h1>
                <p className="text-gray-600 mb-8 text-lg max-w-md">
                    Discover safeguarding career opportunities across all sectors and experience levels.
                </p>
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                    <Link to={createPageUrl('Jobs')}>
                        View All Jobs
                    </Link>
                </Button>
            </div>
            <MarketingFooter />
        </div>
    );
}