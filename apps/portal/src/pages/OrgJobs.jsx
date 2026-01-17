import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@ifs/shared/api/base44Client';
import { Job } from '@ifs/shared/api/entities';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ifs/shared/components/ui/card';
import { Button } from '@ifs/shared/components/ui/button';
import { Badge } from '@ifs/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ifs/shared/components/ui/tabs';
import { Loader2, Briefcase, Plus, Eye, Clock, CheckCircle2, XCircle, Edit2, Archive } from 'lucide-react';
import { useToast } from '@ifs/shared/components/ui/use-toast';
import { Toaster } from '@ifs/shared/components/ui/toaster';
import { createPageUrl } from '@ifs/shared/utils';
import { format } from 'date-fns';
import OrgPortalSidebar from '../components/portal/OrgPortalSidebar';
import SubmitJobForm from '../components/jobs/SubmitJobForm';
import { Dialog, DialogContent } from '@ifs/shared/components/ui/dialog';

export default function OrgJobs() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [user, setUser] = useState(null);
    const [organisation, setOrganisation] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showSubmitForm, setShowSubmitForm] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const currentUser = await base44.auth.me();
                
                if (!currentUser) {
                    navigate(createPageUrl('Home'));
                    return;
                }

                setUser(currentUser);

                if (!currentUser.organisationId) {
                    toast({
                        title: "No Organisation",
                        description: "You need to be part of an organisation to access this page.",
                        variant: "destructive"
                    });
                    navigate(createPageUrl('Dashboard'));
                    return;
                }

                const [orgData, jobsData] = await Promise.all([
                    base44.entities.Organisation.filter({ id: currentUser.organisationId }),
                    Job.filter({ submittedByOrganisationId: currentUser.organisationId })
                ]);

                if (orgData && orgData.length > 0) {
                    setOrganisation(orgData[0]);
                }

                // Sort jobs by creation date, newest first
                const sortedJobs = jobsData.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
                setJobs(sortedJobs);

            } catch (error) {
                console.error('Error fetching data:', error);
                toast({
                    title: "Error",
                    description: "Failed to load jobs data",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate, toast]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Pending Review':
                return <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending Review
                </Badge>;
            case 'Active':
                return <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Active
                </Badge>;
            case 'Rejected':
                return <Badge className="bg-red-100 text-red-800 border-red-200">
                    <XCircle className="w-3 h-3 mr-1" />
                    Rejected
                </Badge>;
            case 'Expired':
                return <Badge className="bg-slate-200 text-slate-700">Expired</Badge>;
            case 'Filled':
                return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Filled</Badge>;
            case 'Paused':
                return <Badge className="bg-slate-200 text-slate-700">Paused</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const isAdmin = user?.organisationRole === 'Admin';

    // Segment jobs by status
    const activeJobs = jobs.filter(j => j.status === 'Active');
    const pendingJobs = jobs.filter(j => j.status === 'Pending Review');
    const rejectedJobs = jobs.filter(j => j.status === 'Rejected');
    const archivedJobs = jobs.filter(j => ['Expired', 'Filled', 'Paused'].includes(j.status));

    const renderJobCard = (job) => (
        <div key={job.id} className="bg-white border border-slate-200 shadow-sm p-6 hover:border-slate-300 transition-colors">
            <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {job.companyName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-900 mb-1">{job.title}</h3>
                            <p className="text-slate-600">{job.companyName}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mb-4">
                        {getStatusBadge(job.status)}
                        <Badge variant="outline" className="text-xs uppercase tracking-wide">
                            {job.contractType}
                        </Badge>
                        <Badge variant="outline" className="text-xs uppercase tracking-wide">
                            {job.workingHours}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                            {job.location}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="text-slate-500 block mb-1">Submitted</span>
                            <span className="font-medium text-slate-900">
                                {format(new Date(job.created_date), 'dd MMM yyyy')}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-500 block mb-1">Views</span>
                            <span className="font-medium text-slate-900">{job.views || 0}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block mb-1">Applications</span>
                            <span className="font-medium text-slate-900">{job.applicationClicks || 0}</span>
                        </div>
                        {job.applicationDeadline && (
                            <div>
                                <span className="text-slate-500 block mb-1">Deadline</span>
                                <span className="font-medium text-slate-900">
                                    {format(new Date(job.applicationDeadline), 'dd MMM yyyy')}
                                </span>
                            </div>
                        )}
                    </div>

                    {job.status === 'Pending Review' && (
                        <div className="mt-4 bg-amber-50 border border-amber-200 p-3 rounded-lg">
                            <p className="text-sm text-amber-800">
                                Your job posting is being reviewed by our team. We'll notify you once it's approved.
                            </p>
                        </div>
                    )}

                    {job.status === 'Rejected' && job.reviewNotes && (
                        <div className="mt-4 bg-red-50 border border-red-200 p-3 rounded-lg">
                            <p className="text-sm text-red-800">
                                <strong>Rejection Reason:</strong> {job.reviewNotes}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    {job.status === 'Active' && job.publicJobUrl && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(job.publicJobUrl, '_blank')}
                            className="font-semibold"
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            View Public
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    if (!user || !organisation) {
        return null;
    }

    return (
        <>
            <Toaster />
            <div className="flex h-screen bg-slate-50">
                <OrgPortalSidebar
                    user={user}
                    organisation={organisation}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    currentPage="OrgJobs"
                />

                <main className="flex-1 overflow-y-auto bg-slate-50">
                    <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Jobs</h1>
                                <p className="text-lg text-slate-600">Manage your organisation's job postings</p>
                            </div>
                            {isAdmin && (
                                <Button 
                                    onClick={() => setShowSubmitForm(true)}
                                    className="bg-slate-900 hover:bg-slate-800 h-12 px-6 font-semibold"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Submit New Job
                                </Button>
                            )}
                        </div>

                        {!isAdmin && (
                            <div className="mb-8 bg-amber-50 border border-amber-200 p-6 rounded-lg">
                                <p className="text-sm text-amber-800">
                                    <strong>Note:</strong> Only organisation administrators can submit and manage job postings. 
                                    Please contact your organisation admin to post jobs.
                                </p>
                            </div>
                        )}

                        {jobs.length === 0 ? (
                            <div className="bg-white border border-slate-200 shadow-sm p-12 text-center rounded-lg">
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Briefcase className="w-10 h-10 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No Job Postings Yet</h3>
                                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                                    {isAdmin 
                                        ? "Start by submitting your first job posting. We'll review it and publish it on the Jobs Board."
                                        : "Your organisation hasn't submitted any job postings yet."
                                    }
                                </p>
                                {isAdmin && (
                                    <Button 
                                        onClick={() => setShowSubmitForm(true)}
                                        className="bg-slate-900 hover:bg-slate-800"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Submit Your First Job
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="bg-white border border-slate-200 p-1 mb-6">
                                    <TabsTrigger value="all" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                                        All ({jobs.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="active" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Active ({activeJobs.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="pending" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                                        <Clock className="w-4 h-4 mr-2" />
                                        Pending ({pendingJobs.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="rejected" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Rejected ({rejectedJobs.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="archived" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white">
                                        <Archive className="w-4 h-4 mr-2" />
                                        Archived ({archivedJobs.length})
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="all" className="space-y-4">
                                    {jobs.map(renderJobCard)}
                                </TabsContent>

                                <TabsContent value="active" className="space-y-4">
                                    {activeJobs.length === 0 ? (
                                        <div className="bg-white border border-slate-200 p-12 text-center rounded-lg">
                                            <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                            <p className="text-slate-600">No active job postings</p>
                                        </div>
                                    ) : (
                                        activeJobs.map(renderJobCard)
                                    )}
                                </TabsContent>

                                <TabsContent value="pending" className="space-y-4">
                                    {pendingJobs.length === 0 ? (
                                        <div className="bg-white border border-slate-200 p-12 text-center rounded-lg">
                                            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                            <p className="text-slate-600">No jobs pending review</p>
                                        </div>
                                    ) : (
                                        pendingJobs.map(renderJobCard)
                                    )}
                                </TabsContent>

                                <TabsContent value="rejected" className="space-y-4">
                                    {rejectedJobs.length === 0 ? (
                                        <div className="bg-white border border-slate-200 p-12 text-center rounded-lg">
                                            <XCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                            <p className="text-slate-600">No rejected job postings</p>
                                        </div>
                                    ) : (
                                        rejectedJobs.map(renderJobCard)
                                    )}
                                </TabsContent>

                                <TabsContent value="archived" className="space-y-4">
                                    {archivedJobs.length === 0 ? (
                                        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
                                            <Archive className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                            <p className="text-slate-600">No archived job postings (Expired, Filled, or Paused)</p>
                                        </div>
                                    ) : (
                                        archivedJobs.map(renderJobCard)
                                    )}
                                </TabsContent>
                            </Tabs>
                        )}
                    </div>
                </main>
            </div>

            {/* Submit Job Modal */}
            <Dialog open={showSubmitForm} onOpenChange={setShowSubmitForm}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <SubmitJobForm
                        organisationName={organisation?.name}
                        onSuccess={() => {
                            setShowSubmitForm(false);
                            setLoading(true);
                            Job.filter({ submittedByOrganisationId: organisation.id }).then(jobsData => {
                                const sortedJobs = jobsData.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
                                setJobs(sortedJobs);
                                setLoading(false);
                            });
                        }}
                        onCancel={() => setShowSubmitForm(false)}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}