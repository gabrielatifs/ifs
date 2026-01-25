import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ifs } from '@ifs/shared/api/ifsClient';
import { createPageUrl } from '@ifs/shared/utils';
import { Button } from '@ifs/shared/components/ui/button';
import { Badge } from '@ifs/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@ifs/shared/components/ui/card';
import {
    Loader2, ArrowLeft, MapPin, Clock, Briefcase, Building2, Banknote, Calendar,
    CheckCircle, Info, ExternalLink, Mail
} from 'lucide-react';
import { format } from 'date-fns';
import UpgradeModal from '../components/portal/UpgradeModal';
import { useUser } from '@ifs/shared/components/providers/UserProvider';
import { usePostHog } from '@ifs/shared/components/providers/PostHogProvider';
import LoginPrompt from '../components/portal/LoginPrompt';
import PortalSidebar from '../components/portal/PortalSidebar';
import PortalHeader from '../components/portal/PortalHeader';
import PortalBottomNav from '../components/portal/PortalBottomNav';
import 'react-quill/dist/quill.snow.css';

export default function JobDetails() {
    const { user, loading: userLoading, updateUserProfile } = useUser();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const location = useLocation();
    const { search } = location;
    const { trackEvent } = usePostHog();

    useEffect(() => {
        if (user && !user.onboarding_completed && !user.isUnclaimed) {
            const currentPath = window.location.pathname + window.location.search;
            window.location.href = `${createPageUrl('Onboarding')}?intent=associate&redirect=${encodeURIComponent(currentPath)}`;
            return;
        }
    }, [user]);

    const handleViewPermission = useCallback(async (currentUser, jobId) => {
        if (!currentUser) return false;
        // Grant permission to both active Full and Associate members (including Fellow)
        if ((currentUser.membershipType === 'Full' || currentUser.membershipType === 'Associate' || currentUser.membershipType === 'Fellow') && currentUser.membershipStatus === 'active') {
            return true;
        }
        return false;
    }, []);

    useEffect(() => {
        const fetchJobDetails = async () => {
            const searchParams = new URLSearchParams(location.search);
            const jobId = searchParams.get('id');

            if (!jobId) {
                setLoading(false);
                return;
            }

            try {
                const fetchedJob = await ifs.entities.Job.get(jobId);
                
                // Check if job has expired
                const isExpired = fetchedJob.applicationDeadline && 
                    new Date(fetchedJob.applicationDeadline) < new Date();
                
                let canView = false;

                if (user) {
                    canView = await handleViewPermission(user, jobId);
                }

                if (canView || !user) {
                    setJob({ ...fetchedJob, isLocked: !canView, isExpired });
                } else {
                    setShowUpgradeModal(true);
                    setJob({ ...fetchedJob, isLocked: true, isExpired });
                }
            } catch (error) {
                console.error("Error fetching job details:", error);
                setJob(null);
            } finally {
                setLoading(false);
            }
        };

        if (!userLoading) {
            fetchJobDetails();
        }
    }, [user, userLoading, location.search, handleViewPermission]);

    if (userLoading || loading) {
        return (
            <div className="flex h-screen bg-slate-50">
                <div className="m-auto">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
            </div>
        );
    }
    
    if (!job && !loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
                <h2 className="text-2xl font-semibold text-slate-800 mb-4">Job Not Found</h2>
                <p className="text-slate-600 mb-6">We couldn't find the job you're looking for.</p>
                <Button asChild>
                    <Link to={`${createPageUrl('Job')}${search}`}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Jobs Board
                    </Link>
                </Button>
            </div>
        );
    }
    
    if (!job) return null; // Return null while job is loading after initial render
    
    const canViewFullDetails = user && (user.membershipType === 'Full' || user.membershipType === 'Associate' || user.membershipType === 'Fellow') && user.membershipStatus === 'active';

    const renderApplicationSection = () => {
        // Show expired message if job has passed deadline
        if (job.isExpired) {
            return (
                <Card className="bg-slate-100 border-slate-300">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-700">
                            <Clock className="w-5 h-5"/>
                            Application Deadline Passed
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-600">This job posting has closed and is no longer accepting applications.</p>
                    </CardContent>
                </Card>
            );
        }
        
        if (!user) {
             return (
                <div>
                     <LoginPrompt
                        title="Sign In to Apply"
                        description="Become a member or sign in to view full application details and apply for this role."
                        pageName="JobDetails"
                    />
                </div>
            );
        }
        
        if (!canViewFullDetails) {
             return (
                 <Card className="bg-yellow-50 border-yellow-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-yellow-900">
                           <Info className="w-5 h-5"/>
                           Become a Member to Apply
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-yellow-800 mb-4">Join as a free Associate Member or upgrade to Full Membership to get complete access to application details.</p>
                        <Button onClick={() => setShowUpgradeModal(true)}>View Membership Options</Button>
                    </CardContent>
                 </Card>
            );
        }

        return (
             <Card className="bg-purple-50 border-purple-200">
                <CardHeader>
                    <CardTitle>Application Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {job.applicationMethod && (
                        <div>
                            <h4 className="font-semibold">Application Method</h4>
                            <p className="text-slate-700">{job.applicationMethod}</p>
                        </div>
                    )}
                    {job.applicationUrl && (
                        <div>
                            <h4 className="font-semibold">Application Link</h4>
                            <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline break-all">
                                {job.applicationUrl} <ExternalLink className="w-4 h-4 inline-block ml-1" />
                            </a>
                        </div>
                    )}
                    {job.contactEmail && (
                         <div>
                            <h4 className="font-semibold">Contact Email</h4>
                            <a href={`mailto:${job.contactEmail}`} className="text-purple-600 hover:underline">
                                {job.contactEmail} <Mail className="w-4 h-4 inline-block ml-1" />
                            </a>
                        </div>
                    )}
                    {job.applicationDeadline && (
                        <div>
                            <h4 className="font-semibold">Apply Before</h4>
                            <p className="text-slate-700">{format(new Date(job.applicationDeadline), 'do MMMM yyyy')}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="flex h-screen bg-slate-50/30">
            <PortalSidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="JobsBoard" />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <PortalHeader 
                    setSidebarOpen={setSidebarOpen} 
                    user={user} 
                />
                <main className="flex-1 overflow-y-auto p-6 md:p-8" id="job-details">
                    <div className="max-w-7xl mx-auto">
                        {/* Page Header */}
                        <div className="mb-8">
                            <Button asChild variant="outline" size="sm" className="mb-4">
                               <Link to={createPageUrl('Job')}>
                                   <ArrowLeft className="w-4 h-4 mr-2" />
                                   Back to Jobs Board
                               </Link>
                           </Button>
                            {job.isExpired && (
                                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-800">
                                    <Clock className="w-5 h-5" />
                                    <span className="font-medium">This job posting has closed</span>
                                </div>
                            )}
                            <h1 className="text-3xl font-bold text-slate-800">{job.title}</h1>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-slate-600">
                                <div className="flex items-center gap-1.5"><Building2 className="w-4 h-4" />{job.companyName}</div>
                                <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{job.location}</div>
                                <div className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" />{job.contractType}</div>
                            </div>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-x-8 gap-y-12">
                            {/* Left column */}
                            <div className="md:col-span-2 space-y-8">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-xl">Job Description</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="ql-snow">
                                            <div className="ql-editor !p-0 !h-auto text-slate-700" dangerouslySetInnerHTML={{ __html: job.description }} />
                                        </div>
                                    </CardContent>
                                </Card>

                                {job.keyResponsibilities && job.keyResponsibilities.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-xl">Key Responsibilities</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-3">
                                                {job.keyResponsibilities.map((item, i) => (
                                                    <li key={i} className="flex items-start">
                                                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                                                        <span className="text-slate-700">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                )}

                                {job.requirements && job.requirements.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-xl">Qualifications & Skills</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-3">
                                                {job.requirements.map((item, i) => (
                                                    <li key={i} className="flex items-start">
                                                        <Info className="w-5 h-5 text-blue-500 mr-3 mt-1 flex-shrink-0" />
                                                        <span className="text-slate-700">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                            
                            {/* Right column */}
                            <div className="md:col-span-1">
                                <div className="sticky top-8 space-y-6">
                                    {renderApplicationSection()}

                                    <Card className="shadow-sm">
                                        <CardHeader><CardTitle className="text-lg">Job Overview</CardTitle></CardHeader>
                                        <CardContent className="grid grid-cols-1 gap-4 text-sm">
                                             <div className="flex items-start gap-3">
                                                <Banknote className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-xs text-slate-500">Salary</p>
                                                    <p className="font-semibold text-slate-800">{job.salaryDisplayText || 'Not specified'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <Briefcase className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-xs text-slate-500">Contract Type</p>
                                                    <p className="font-semibold text-slate-800">{job.contractType}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <Clock className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-xs text-slate-500">Working Hours</p>
                                                    <p className="font-semibold text-slate-800">{job.workingHours}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <Calendar className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-xs text-slate-500">Deadline</p>
                                                    <p className="font-semibold text-slate-800">{job.applicationDeadline ? format(new Date(job.applicationDeadline), 'dd MMMM yyyy') : 'N/A'}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    {job.companyDescription && (
                                        <Card className="shadow-sm mt-6">
                                            <CardHeader><CardTitle className="text-lg">About {job.companyName}</CardTitle></CardHeader>
                                            <CardContent>
                                                {job.companyLogoUrl && <img src={job.companyLogoUrl} alt={`${job.companyName} logo`} className="max-h-12 w-auto mb-4" />}
                                                <p className="text-sm text-slate-600">{job.companyDescription}</p>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} user={user} />
            <PortalBottomNav user={user} currentPage='JobsBoard' />
        </div>
    );
}