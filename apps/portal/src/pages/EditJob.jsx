import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { User } from '@ifs/shared/api/entities';
import { Job } from '@ifs/shared/api/entities';
import { generateJobSlug } from '@/components/utils/jobUtils';
import { createPageUrl, navigateToUrl } from '@ifs/shared/utils';
import { Button } from '@ifs/shared/components/ui/button';
import { Input } from '@ifs/shared/components/ui/input';
import { Textarea } from '@ifs/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ifs/shared/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@ifs/shared/components/ui/popover';
import { Calendar } from '@ifs/shared/components/ui/calendar';
import { format } from 'date-fns';
import { Loader2, ArrowLeft, Save, Calendar as CalendarIcon, Check, Circle, Plus, X } from 'lucide-react';
import PortalSidebar from '../components/portal/PortalSidebar';
import PortalHeader from '../components/portal/PortalHeader';
import { Checkbox } from '@ifs/shared/components/ui/checkbox';
import { Toaster } from '@ifs/shared/components/ui/toaster';
import { useToast } from "@ifs/shared/components/ui/use-toast";
import { ifs } from '@ifs/shared/api/ifsClient';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';


const NEW_JOB_TEMPLATE = {
    title: '',
    companyName: '',
    department: '',
    description: '',
    location: '',
    streetAddress: '',
    postalCode: '',
    addressRegion: '',
    addressLocality: '',
    addressCountry: 'GB',
    sector: 'Education',
    workingArrangement: 'On-site',
    salary: '',
    salaryUnit: 'YEAR',
    salaryDisplayText: '',
    applicationUrl: '',
    contactEmail: '',
    applicationDeadline: new Date().toISOString().split('T')[0],
    startDate: '',
    status: 'Active',
    isFeatured: false,
    contractType: "Permanent",
    workingHours: "Full-time",
    experienceLevel: "Mid-level",
    applicationMethod: "Online Application",
    salaryCurrency: "GBP",
    hoursPerWeek: "",
    occupationalCategory: "",
    educationRequirements: "",
    experienceRequirements: "",
    specialCommitments: "",
    incentiveCompensation: "",
    keyResponsibilities: [],
    requirements: [],
    desirableSkills: [],
    benefits: [],
    safeguardingFocus: [],
    companyDescription: '',
    companyLogoUrl: '',
    reviewNotes: ''
    };

export default function EditJob() {
    const [user, setUser] = useState(null);
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { toast } = useToast();
    
    const location = useLocation();
    const navigate = useNavigate();
    const jobId = new URLSearchParams(location.search).get('id');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentUser = await User.me();
                if (currentUser.role !== 'admin') {
                    navigate(createPageUrl('Dashboard'));
                    return;
                }
                setUser(currentUser);

                if (jobId) {
                    // Editing an existing job
                    const jobData = await Job.get(jobId);
                    setJob(jobData);
                } else {
                    // Creating a new job
                    setJob(NEW_JOB_TEMPLATE);
                }

            } catch (error) {
                console.error("Error fetching data:", error);
                navigateToUrl(navigate, createPageUrl('AdminDashboard'));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [jobId, navigate]);

    const handleInputChange = (field, value) => {
        setJob(prev => ({ ...prev, [field]: value }));
    };

    const handleDateChange = (date) => {
        if (date) {
            setJob(prev => ({ ...prev, applicationDeadline: date.toISOString().split('T')[0] }));
        } else {
            setJob(prev => ({ ...prev, applicationDeadline: null }));
        }
    };
    
    useEffect(() => {
        const loadGoogleMaps = async () => {
            if (!window.google) {
                try {
                    const response = await ifs.functions.invoke('getGoogleMapsApiKey');
                    const apiKey = response.data?.key || response.key;

                    if (apiKey) {
                        const script = document.createElement('script');
                        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
                        script.async = true;
                        script.defer = true;
                        script.onload = initAutocomplete;
                        document.head.appendChild(script);
                    } else {
                        console.error("Failed to load Google Maps API key");
                    }
                } catch (error) {
                    console.error("Error fetching Google Maps API key:", error);
                }
            } else {
                initAutocomplete();
            }
        };

        if (!loading) {
            loadGoogleMaps();
        }

        function initAutocomplete() {
            const input = document.getElementById('job-location-input');
            if (input && window.google) {
                const autocomplete = new window.google.maps.places.Autocomplete(input, {
                    fields: ['address_components', 'formatted_address', 'name', 'geometry'],
                    componentRestrictions: { country: 'gb' },
                });

                autocomplete.addListener('place_changed', () => {
                    const place = autocomplete.getPlace();
                    if (place.formatted_address) {
                        const addressComponents = place.address_components;
                        let streetNumber = '';
                        let route = '';
                        let subpremise = '';
                        let premise = '';
                        let city = '';
                        let region = '';
                        let postalCode = '';
                        let country = '';
                        let countryCode = '';

                        if (addressComponents) {
                            for (const component of addressComponents) {
                                const types = component.types;
                                if (types.includes('street_number')) streetNumber = component.long_name;
                                if (types.includes('route')) route = component.long_name;
                                if (types.includes('subpremise')) subpremise = component.long_name;
                                if (types.includes('premise')) premise = component.long_name;
                                if (types.includes('locality') || types.includes('postal_town')) city = component.long_name;
                                if (types.includes('administrative_area_level_1')) region = component.long_name;
                                if (types.includes('postal_code')) postalCode = component.long_name;
                                if (types.includes('country')) {
                                    country = component.long_name;
                                    countryCode = component.short_name;
                                }
                            }
                        }

                        if (!city) {
                             const cityComponent = addressComponents.find(c => c.types.includes('administrative_area_level_2') || c.types.includes('sublocality_level_1'));
                             if (cityComponent) city = cityComponent.long_name;
                        }

                        const streetAddress = [subpremise, premise, streetNumber, route].filter(Boolean).join(' ');
                        const locationString = city ? `${city}, ${countryCode || country}` : place.formatted_address;

                        const latitude = place.geometry?.location?.lat() || null;
                        const longitude = place.geometry?.location?.lng() || null;

                        setJob(prev => ({
                            ...prev,
                            location: locationString,
                            latitude: latitude,
                            longitude: longitude,
                            addressLocality: city,
                            streetAddress: streetAddress,
                            addressRegion: region,
                            postalCode: postalCode,
                            addressCountry: countryCode || 'GB'
                        }));
                    }
                });
            }
        }
    }, [loading]);

    const handleSave = async () => {
        console.log('[EditJob] handleSave called');
        setIsSaving(true);
        try {
            // Get the original job to check for status changes
            let originalJob = null;
            if (jobId) {
                originalJob = await Job.get(jobId);
                console.log('[EditJob] Original job status:', originalJob?.status);
                console.log('[EditJob] New job status:', job.status);
            }

            const jobPayload = {
                ...job,
                hoursPerWeek: job.hoursPerWeek ? parseFloat(job.hoursPerWeek) : null,
            };

            let savedId = jobId;

            if (jobId) {
                const slug = generateJobSlug({ ...job, id: jobId });
                const publicJobUrl = `https://www.ifs-safeguarding.co.uk/job/${slug}`;
                await Job.update(jobId, { ...jobPayload, publicJobUrl });

                // Send email notification if status changed
                if (originalJob && originalJob.status !== job.status) {
                    console.log('[EditJob] Status changed from', originalJob.status, 'to', job.status);
                    console.log('[EditJob] Submitter email:', job.submittedByUserEmail);
                    
                    if (job.submittedByUserEmail) {
                        try {
                            console.log('[EditJob] Invoking sendJobStatusEmail function...');
                            const emailResponse = await ifs.functions.invoke('sendJobStatusEmail', {
                                jobId: jobId,
                                jobTitle: job.title,
                                companyName: job.companyName,
                                toEmail: job.submittedByUserEmail,
                                oldStatus: originalJob.status,
                                newStatus: job.status,
                                reviewNotes: job.reviewNotes || ''
                            });
                            console.log('[EditJob] Email function response:', emailResponse);
                            
                            if (emailResponse.data?.success) {
                                console.log('[EditJob] Status change email sent successfully');
                            } else {
                                console.error('[EditJob] Email function returned error:', emailResponse);
                            }
                        } catch (emailError) {
                            console.error('[EditJob] Failed to send status change email:', emailError);
                            console.error('[EditJob] Error details:', JSON.stringify(emailError, null, 2));
                            toast({
                                title: "Email Warning",
                                description: "Job saved but status change email failed to send. Check console for details.",
                                variant: "destructive"
                            });
                        }
                    } else {
                        console.warn('[EditJob] No submitter email found, skipping status change notification');
                    }
                }
            } else {
                const newJob = await Job.create(jobPayload);
                savedId = newJob.id;
                
                if (savedId) {
                    const slug = generateJobSlug({ ...job, id: savedId });
                    const publicJobUrl = `https://www.ifs-safeguarding.co.uk/job/${slug}`;
                    await Job.update(savedId, { publicJobUrl });
                }
            }

            try {
                if (savedId) {
                    await ifs.functions.invoke('submitToGoogle', { 
                        jobId: savedId, 
                        action: job.status === 'Active' ? 'update' : 'delete' 
                    });
                    
                    toast({
                        title: "Job Saved & Submitted",
                        description: "Job saved and submitted to Google for indexing.",
                    });
                }
            } catch (e) {
                console.error("Failed to submit to Google:", e);
                toast({
                    title: "Job Saved",
                    description: "Job saved, but failed to submit to Google Indexing API.",
                    variant: "warning"
                });
            }

            navigateToUrl(navigate, createPageUrl('AdminDashboard') + '?tab=jobs');
        } catch (error) {
            console.error("Error saving job:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        );
    }
    
    if (!user || !job) return null;

    const isNewJob = !jobId;

    return (
        <div className="flex h-screen bg-slate-50/30">
            <Toaster />
            <PortalSidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="AdminDashboard" />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <PortalHeader setSidebarOpen={setSidebarOpen} user={user} />

                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <Link to={createPageUrl('AdminDashboard')} className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-800">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Admin Dashboard
                        </Link>
                        <div className="flex gap-2">
                            {jobId && job.submittedByUserEmail && (
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={async () => {
                                        console.log('[TEST] Testing email send...');
                                        try {
                                            const result = await ifs.functions.invoke('sendJobStatusEmail', {
                                                jobId: jobId,
                                                jobTitle: job.title,
                                                companyName: job.companyName,
                                                toEmail: job.submittedByUserEmail,
                                                oldStatus: job.status,
                                                newStatus: 'Rejected',
                                                reviewNotes: 'Test email'
                                            });
                                            console.log('[TEST] Email result:', result);
                                            alert('Check console for email test results');
                                        } catch (err) {
                                            console.error('[TEST] Email error:', err);
                                            alert('Email test failed - check console');
                                        }
                                    }}
                                >
                                    Test Email
                                </Button>
                            )}
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                Save Changes
                            </Button>
                        </div>
                    </div>
                    
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 space-y-8">
                        {/* Basic Information */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Basic Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label className="font-medium text-slate-700">Job Title *</label><Input value={job.title} onChange={(e) => handleInputChange('title', e.target.value)} className="mt-1"/></div>
                                <div><label className="font-medium text-slate-700">Company Name *</label><Input value={job.companyName} onChange={(e) => handleInputChange('companyName', e.target.value)} className="mt-1"/></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label className="font-medium text-slate-700">Department</label><Input value={job.department || ''} onChange={(e) => handleInputChange('department', e.target.value)} className="mt-1" placeholder="e.g., Safeguarding Team"/></div>
                                <div><label className="font-medium text-slate-700">Contact Email *</label><Input type="email" value={job.contactEmail || ''} onChange={(e) => handleInputChange('contactEmail', e.target.value)} className="mt-1" placeholder="recruitment@company.com"/></div>
                            </div>
                            <div>
                                <label className="font-medium text-slate-700">Company Description</label>
                                <Textarea value={job.companyDescription || ''} onChange={(e) => handleInputChange('companyDescription', e.target.value)} className="mt-1" rows={3} placeholder="Brief description of the organisation"/>
                            </div>
                            <div>
                                <label className="font-medium text-slate-700">Company Logo URL</label>
                                <Input value={job.companyLogoUrl || ''} onChange={(e) => handleInputChange('companyLogoUrl', e.target.value)} className="mt-1" placeholder="https://..."/>
                            </div>
                        </div>

                        {/* Job Description */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Job Description *</h3>
                            <div className="pb-12">
                                <ReactQuill theme="snow" value={job.description} onChange={(value) => handleInputChange('description', value)} className="mt-1 h-64"/>
                            </div>
                        </div>

                        {/* Key Responsibilities */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Key Responsibilities</h3>
                            {(job.keyResponsibilities || []).length === 0 ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleInputChange('keyResponsibilities', [''])}
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Add Responsibilities
                                </Button>
                            ) : (
                                <>
                                    {job.keyResponsibilities.map((resp, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                value={resp}
                                                onChange={(e) => {
                                                    const updated = [...job.keyResponsibilities];
                                                    updated[index] = e.target.value;
                                                    handleInputChange('keyResponsibilities', updated);
                                                }}
                                                placeholder="Add a responsibility..."
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    const updated = job.keyResponsibilities.filter((_, i) => i !== index);
                                                    handleInputChange('keyResponsibilities', updated);
                                                }}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleInputChange('keyResponsibilities', [...job.keyResponsibilities, ''])}
                                    >
                                        <Plus className="w-4 h-4 mr-2" /> Add Another
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Requirements */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Requirements</h3>
                            {(job.requirements || []).length === 0 ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleInputChange('requirements', [''])}
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Add Requirements
                                </Button>
                            ) : (
                                <>
                                    {job.requirements.map((req, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                value={req}
                                                onChange={(e) => {
                                                    const updated = [...job.requirements];
                                                    updated[index] = e.target.value;
                                                    handleInputChange('requirements', updated);
                                                }}
                                                placeholder="Add a requirement..."
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    const updated = job.requirements.filter((_, i) => i !== index);
                                                    handleInputChange('requirements', updated);
                                                }}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleInputChange('requirements', [...job.requirements, ''])}
                                    >
                                        <Plus className="w-4 h-4 mr-2" /> Add Another
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Desirable Skills */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Desirable Skills</h3>
                            {(job.desirableSkills || []).length === 0 ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleInputChange('desirableSkills', [''])}
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Add Desirable Skills
                                </Button>
                            ) : (
                                <>
                                    {job.desirableSkills.map((skill, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                value={skill}
                                                onChange={(e) => {
                                                    const updated = [...job.desirableSkills];
                                                    updated[index] = e.target.value;
                                                    handleInputChange('desirableSkills', updated);
                                                }}
                                                placeholder="Add a desirable skill..."
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    const updated = job.desirableSkills.filter((_, i) => i !== index);
                                                    handleInputChange('desirableSkills', updated);
                                                }}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleInputChange('desirableSkills', [...job.desirableSkills, ''])}
                                    >
                                        <Plus className="w-4 h-4 mr-2" /> Add Another
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Safeguarding Focus */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Safeguarding Focus Areas</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {[
                                    'Child Protection',
                                    'Adult Safeguarding',
                                    'Online Safety',
                                    'Mental Health',
                                    'SEND',
                                    'Early Years',
                                    'Secondary Education',
                                    'Further Education',
                                    'Higher Education'
                                ].map(focus => (
                                    <div key={focus} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={focus}
                                            checked={(job.safeguardingFocus || []).includes(focus)}
                                            onCheckedChange={(checked) => {
                                                const current = job.safeguardingFocus || [];
                                                const updated = checked
                                                    ? [...current, focus]
                                                    : current.filter(f => f !== focus);
                                                handleInputChange('safeguardingFocus', updated);
                                            }}
                                        />
                                        <label htmlFor={focus} className="text-sm font-medium leading-none cursor-pointer">
                                            {focus}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Location Details */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Location *</h3>
                            <div>
                                <label className="font-medium text-slate-700">Job Location / Address (Google Search)</label>
                                <Input 
                                    id="job-location-input"
                                    value={job.location} 
                                    onChange={(e) => handleInputChange('location', e.target.value)} 
                                    className="mt-1"
                                    placeholder="Start typing address to search..."
                                />
                                <p className="text-xs text-slate-500 mt-1">Search for address to auto-fill details below</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div><label className="font-medium text-slate-700">Street Address</label><Input value={job.streetAddress || ''} onChange={(e) => handleInputChange('streetAddress', e.target.value)} className="mt-1" placeholder="e.g. 123 Main St"/></div>
                                <div><label className="font-medium text-slate-700">City/Locality</label><Input value={job.addressLocality || ''} onChange={(e) => handleInputChange('addressLocality', e.target.value)} className="mt-1" placeholder="e.g. London"/></div>
                                <div><label className="font-medium text-slate-700">Postal Code</label><Input value={job.postalCode || ''} onChange={(e) => handleInputChange('postalCode', e.target.value)} className="mt-1" placeholder="e.g. SW1A 1AA"/></div>
                                <div><label className="font-medium text-slate-700">Region/County</label><Input value={job.addressRegion || ''} onChange={(e) => handleInputChange('addressRegion', e.target.value)} className="mt-1" placeholder="e.g. Greater London"/></div>
                            </div>
                            <div>
                                <label className="font-medium text-slate-700">Working Arrangement *</label>
                                <Select value={job.workingArrangement || 'On-site'} onValueChange={(v) => handleInputChange('workingArrangement', v)}>
                                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="On-site">On-site</SelectItem>
                                        <SelectItem value="Remote">Remote</SelectItem>
                                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Sector & Classification */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Sector & Classification</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label className="font-medium text-slate-700">Sector *</label>
                                    <Select value={job.sector} onValueChange={(v) => handleInputChange('sector', v)}>
                                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select a sector"/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Education">Education</SelectItem>
                                            <SelectItem value="Healthcare">Healthcare</SelectItem>
                                            <SelectItem value="Social Care">Social Care</SelectItem>
                                            <SelectItem value="Local Authority">Local Authority</SelectItem>
                                            <SelectItem value="Charity">Charity</SelectItem>
                                            <SelectItem value="Private">Private</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div><label className="font-medium text-slate-700">Occupational Category</label><Input value={job.occupationalCategory || ''} onChange={(e) => handleInputChange('occupationalCategory', e.target.value)} className="mt-1" placeholder="e.g. 15-1132.00"/></div>
                            </div>
                        </div>

                        {/* Salary & Compensation */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Salary & Compensation *</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div><label className="font-medium text-slate-700">Salary</label><Input type="number" value={job.salary || ''} onChange={(e) => handleInputChange('salary', e.target.value ? parseFloat(e.target.value) : null)} className="mt-1" placeholder="e.g. 35000"/></div>
                                <div><label className="font-medium text-slate-700">Currency</label><Input value={job.salaryCurrency || 'GBP'} onChange={(e) => handleInputChange('salaryCurrency', e.target.value)} className="mt-1" placeholder="e.g. GBP"/></div>
                                <div><label className="font-medium text-slate-700">Salary Unit</label>
                                    <Select value={job.salaryUnit || 'YEAR'} onValueChange={(v) => handleInputChange('salaryUnit', v)}>
                                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select unit"/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="YEAR">Per Year</SelectItem>
                                            <SelectItem value="MONTH">Per Month</SelectItem>
                                            <SelectItem value="WEEK">Per Week</SelectItem>
                                            <SelectItem value="DAY">Per Day</SelectItem>
                                            <SelectItem value="HOUR">Per Hour</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div><label className="font-medium text-slate-700">Display Text</label><Input value={job.salaryDisplayText || ''} onChange={(e) => handleInputChange('salaryDisplayText', e.target.value)} className="mt-1" placeholder="e.g. 'Competitive'"/></div>
                            </div>

                            <div>
                                <label className="font-medium text-slate-700">Incentive Compensation</label>
                                <Input value={job.incentiveCompensation || ''} onChange={(e) => handleInputChange('incentiveCompensation', e.target.value)} className="mt-1" placeholder="e.g. Performance-based bonus"/>
                            </div>

                            {/* Benefits */}
                            <div className="space-y-4">
                                <label className="font-medium text-slate-700">Benefits</label>
                                {(job.benefits || []).length === 0 ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleInputChange('benefits', [''])}
                                    >
                                        <Plus className="w-4 h-4 mr-2" /> Add Benefits
                                    </Button>
                                ) : (
                                    <>
                                        {job.benefits.map((benefit, index) => (
                                            <div key={index} className="flex gap-2">
                                                <Input
                                                    value={benefit}
                                                    onChange={(e) => {
                                                        const updated = [...job.benefits];
                                                        updated[index] = e.target.value;
                                                        handleInputChange('benefits', updated);
                                                    }}
                                                    placeholder="Add a benefit..."
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        const updated = job.benefits.filter((_, i) => i !== index);
                                                        handleInputChange('benefits', updated);
                                                    }}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleInputChange('benefits', [...job.benefits, ''])}
                                        >
                                            <Plus className="w-4 h-4 mr-2" /> Add Another
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Employment Details */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Employment Details *</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div><label className="font-medium text-slate-700">Contract Type *</label>
                                    <Select value={job.contractType} onValueChange={(v) => handleInputChange('contractType', v)}>
                                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select contract type"/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Permanent">Permanent</SelectItem>
                                            <SelectItem value="Fixed-term">Fixed-term</SelectItem>
                                            <SelectItem value="Contract">Contract</SelectItem>
                                            <SelectItem value="Temporary">Temporary</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div><label className="font-medium text-slate-700">Working Hours *</label>
                                    <Select value={job.workingHours} onValueChange={(v) => handleInputChange('workingHours', v)}>
                                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select working hours"/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Full-time">Full-time</SelectItem>
                                            <SelectItem value="Part-time">Part-time</SelectItem>
                                            <SelectItem value="Job share">Job share</SelectItem>
                                            <SelectItem value="Flexible">Flexible</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div><label className="font-medium text-slate-700">Hours Per Week</label><Input type="number" value={job.hoursPerWeek || ''} onChange={(e) => handleInputChange('hoursPerWeek', e.target.value === '' ? null : e.target.value)} className="mt-1" placeholder="e.g. 37.5"/></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label className="font-medium text-slate-700">Experience Level *</label>
                                    <Select value={job.experienceLevel} onValueChange={(v) => handleInputChange('experienceLevel', v)}>
                                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select experience level"/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Entry-level">Entry-level</SelectItem>
                                            <SelectItem value="Mid-level">Mid-level</SelectItem>
                                            <SelectItem value="Senior">Senior</SelectItem>
                                            <SelectItem value="Leadership">Leadership</SelectItem>
                                            <SelectItem value="Executive">Executive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div><label className="font-medium text-slate-700">Experience Requirements</label><Input value={job.experienceRequirements || ''} onChange={(e) => handleInputChange('experienceRequirements', e.target.value)} className="mt-1" placeholder="e.g. Minimum 3 years experience..."/></div>
                            </div>
                            <div>
                                <label className="font-medium text-slate-700">Education Requirements</label>
                                <Input value={job.educationRequirements || ''} onChange={(e) => handleInputChange('educationRequirements', e.target.value)} className="mt-1" placeholder="e.g. Bachelor's Degree in..."/>
                            </div>
                            <div>
                                <label className="font-medium text-slate-700">Special Commitments</label>
                                <Input value={job.specialCommitments || ''} onChange={(e) => handleInputChange('specialCommitments', e.target.value)} className="mt-1" placeholder="e.g. VeteranCommit"/>
                            </div>
                        </div>

                        {/* Application Details */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Application Details *</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label className="font-medium text-slate-700">Application Method *</label>
                                    <Select value={job.applicationMethod} onValueChange={(v) => handleInputChange('applicationMethod', v)}>
                                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select application method"/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Email">Email</SelectItem>
                                            <SelectItem value="Online Application">Online Application</SelectItem>
                                            <SelectItem value="Agency">Agency</SelectItem>
                                            <SelectItem value="Phone">Phone</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div><label className="font-medium text-slate-700">Application URL</label><Input value={job.applicationUrl || ''} onChange={(e) => handleInputChange('applicationUrl', e.target.value)} className="mt-1" placeholder="https://company.com/apply"/></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="font-medium text-slate-700">Application Deadline *</label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start text-left font-normal mt-1">
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {job.applicationDeadline ? format(new Date(job.applicationDeadline), 'PPP') : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar 
                                                mode="single" 
                                                selected={job.applicationDeadline ? new Date(job.applicationDeadline) : undefined} 
                                                onSelect={handleDateChange} 
                                                initialFocus 
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div>
                                    <label className="font-medium text-slate-700">Expected Start Date</label>
                                    <Input value={job.startDate || ''} onChange={(e) => handleInputChange('startDate', e.target.value)} className="mt-1" placeholder="e.g., ASAP, September 2025"/>
                                </div>
                            </div>
                        </div>

                        {/* Review & Status */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Status & Review</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label className="font-medium text-slate-700">Status</label>
                                    <Select value={job.status} onValueChange={(v) => handleInputChange('status', v)}>
                                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select status"/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Pending Review">Pending Review</SelectItem>
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Paused">Paused</SelectItem>
                                            <SelectItem value="Filled">Filled</SelectItem>
                                            <SelectItem value="Expired">Expired</SelectItem>
                                            <SelectItem value="Rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <label className="font-medium text-slate-700">Review Notes (Admin Only)</label>
                                <Textarea value={job.reviewNotes || ''} onChange={(e) => handleInputChange('reviewNotes', e.target.value)} className="mt-1" rows={3} placeholder="Internal notes about this job posting..."/>
                            </div>

                            <div className="flex items-center space-x-2 pt-4 border-t">
                                <Checkbox id="isFeatured" checked={job.isFeatured} onCheckedChange={(checked) => handleInputChange('isFeatured', checked)} />
                                <label htmlFor="isFeatured" className="text-sm font-medium leading-none cursor-pointer">
                                    Feature this job posting?
                                </label>
                            </div>
                        </div>

                        {/* Attachments (Read-only) */}
                        {job.attachments && job.attachments.length > 0 && (
                            <div className="space-y-6 bg-blue-50 p-6 rounded-lg border border-blue-200">
                                <h3 className="text-lg font-semibold text-slate-900 border-b border-blue-200 pb-2">Attachments</h3>
                                <div className="space-y-2">
                                    {job.attachments.map((attachment, index) => (
                                        <a
                                            key={index}
                                            href={attachment.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-slate-900 truncate">{attachment.name}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : 'File'} • {attachment.type || 'Document'}
                                                    </p>
                                                </div>
                                            </div>
                                            <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Submission Info (Read-only) */}
                        {job.submittedByOrganisationName && (
                            <div className="space-y-6 bg-slate-50 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">Submission Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-slate-500">Submitted by Organisation:</span>
                                        <p className="font-medium text-slate-900">{job.submittedByOrganisationName}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Submitted by User:</span>
                                        <p className="font-medium text-slate-900">{job.submittedByUserEmail}</p>
                                    </div>
                                    {job.created_date && (
                                        <div>
                                            <span className="text-slate-500">Submitted on:</span>
                                            <p className="font-medium text-slate-900">{format(new Date(job.created_date), 'PPP')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
