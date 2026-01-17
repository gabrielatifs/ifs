import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Loader2, ArrowLeft, MapPin, Clock, Briefcase, Building2, Banknote, Calendar,
    CheckCircle, Info, ExternalLink, Mail, Lock, Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import { generateJobSlug } from '@/components/utils/jobUtils';
import MainSiteNav from '@/components/marketing/MainSiteNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import HeroBreadcrumbs from '@/components/marketing/HeroBreadcrumbs';
import { User } from '@/api/entities';
import { customLoginWithRedirect } from '@/components/utils/auth';
import { usePostHog } from '@/components/providers/PostHogProvider';
import 'react-quill/dist/quill.snow.css';

export default function JobDetailsView({ jobId }) {
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const location = useLocation();
    const { trackEvent } = usePostHog();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch user without awaiting - don't block rendering
                User.me().then(setUser).catch(() => setUser(null));

                if (jobId) {
                    const fetchedJob = await base44.entities.Job.get(jobId);
                    setJob(fetchedJob);
                    if (fetchedJob) {
                        // Track view - non-blocking
                        base44.functions.invoke('trackJobAnalytics', { jobId: fetchedJob.id, type: 'view' }).catch(console.error);
                    }
                } else {
                    setJob(null);
                }
            } catch (error) {
                console.error("Error fetching job details:", error);
                setJob(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [jobId]);

    // Add structured data for Google Jobs
    useEffect(() => {
        if (!job) return;

        // Map employment types
        const employmentTypes = [];
        const wh = (job.workingHours || '').toLowerCase();
        if (wh.includes('full')) employmentTypes.push('FULL_TIME');
        if (wh.includes('part')) employmentTypes.push('PART_TIME');
        
        const ct = (job.contractType || '').toLowerCase();
        if (ct.includes('contract')) employmentTypes.push('CONTRACTOR');
        if (ct.includes('temp') || ct.includes('fixed')) employmentTypes.push('TEMPORARY');
        if (ct.includes('intern')) employmentTypes.push('INTERN');
        
        // Default if we couldn't map specific types but it's a permanent role
        if (employmentTypes.length === 0 && ct.includes('perm')) {
            employmentTypes.push('FULL_TIME');
        }

        const structuredData = {
            "@context": "https://schema.org/",
            "@type": "JobPosting",
            "title": job.title,
            "description": job.description,
            "url": `https://ifs-safeguarding.co.uk/Job${generateJobSlug(job)}`,
            "identifier": {
                "@type": "PropertyValue",
                "name": job.companyName,
                "value": job.id
            },
            "datePosted": job.created_date ? new Date(job.created_date).toISOString() : new Date().toISOString(),
            "validThrough": job.applicationDeadline ? new Date(job.applicationDeadline).toISOString() : undefined,
            "employmentType": employmentTypes.length > 0 ? employmentTypes : "FULL_TIME",
            "hiringOrganization": {
                "@type": "Organization",
                "name": job.companyName,
                "logo": job.companyLogoUrl || "https://ifs-safeguarding.co.uk/favicon.ico"
            },
            "jobLocation": {
                "@type": "Place",
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": job.streetAddress || undefined,
                    "addressLocality": job.addressLocality || job.location || undefined,
                    "addressRegion": job.addressRegion || undefined,
                    "postalCode": job.postalCode || undefined,
                    "addressCountry": job.addressCountry || "GB"
                }
            }
        };

        // Handle Remote
        if (job.workingArrangement === 'Remote') {
            structuredData.jobLocationType = 'TELECOMMUTE';
            // Google recommends adding applicantLocationRequirements for remote jobs
            structuredData.applicantLocationRequirements = {
                "@type": "Country",
                "name": "GB"
            };
        }

        // Salary
        if (job.salary) {
            structuredData.baseSalary = {
                "@type": "MonetaryAmount",
                "currency": job.salaryCurrency || "GBP",
                "value": {
                    "@type": "QuantitativeValue",
                    "value": job.salary,
                    "unitText": job.salaryUnit || "YEAR"
                }
            };
        }

        // Additional Schema fields
        if (job.occupationalCategory) {
            structuredData.occupationalCategory = job.occupationalCategory;
        }
        if (job.incentiveCompensation) {
            structuredData.incentiveCompensation = job.incentiveCompensation;
        }
        if (job.educationRequirements) {
            structuredData.educationRequirements = job.educationRequirements;
        }
        if (job.experienceRequirements) {
            structuredData.experienceRequirements = job.experienceRequirements;
        }
        if (job.specialCommitments) {
            structuredData.specialCommitments = job.specialCommitments;
        }
        if (job.hoursPerWeek) {
            structuredData.workHours = `${job.hoursPerWeek} hours per week`;
        }
        if (job.keyResponsibilities && job.keyResponsibilities.length > 0) {
            structuredData.responsibilities = job.keyResponsibilities.join('. ');
        }
        if (job.requirements && job.requirements.length > 0) {
            structuredData.qualifications = job.requirements.join('. ');
        }
        if (job.desirableSkills && job.desirableSkills.length > 0) {
            structuredData.skills = job.desirableSkills.join(', ');
        }
        if (job.benefits && job.benefits.length > 0) {
            structuredData.jobBenefits = job.benefits.join(', ');
        }
        if (job.sector) {
            structuredData.industry = job.sector;
        }

        const scriptId = 'google-jobs-structured-data';
        let script = document.getElementById(scriptId);

        if (!script) {
            script = document.createElement('script');
            script.id = scriptId;
            script.type = 'application/ld+json';
            document.head.appendChild(script);
        }

        script.textContent = JSON.stringify(structuredData);

        return () => {
            const el = document.getElementById(scriptId);
            if (el) el.remove();
        };
    }, [job]);

    const handleJoin = () => {
        trackEvent('join_button_clicked', {
            intent: 'associate',
            location: 'public_job_details',
            user_type: 'anonymous'
        });
        const portalJobUrl = `${createPageUrl('JobDetails')}?id=${job?.id}`;
        
        // Store intent and redirect in session storage as a backup
        sessionStorage.setItem('pending_job_redirect', portalJobUrl);
        sessionStorage.setItem('pending_job_intent', 'associate');
        
        const path = createPageUrl('Onboarding') + `?intent=associate&redirect=${encodeURIComponent(portalJobUrl)}`;
        customLoginWithRedirect(path);
    };

    const handleLogin = () => {
        const currentUrl = window.location.pathname + window.location.search;
        base44.auth.redirectToLogin(currentUrl);
    };

    const isMember = user && (user.membershipType === 'Associate' || user.membershipType === 'Full') && user.membershipStatus === 'active';

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <MainSiteNav variant="solid-mobile" />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
                <MarketingFooter />
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <MainSiteNav variant="solid-mobile" />
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <h2 className="text-2xl font-semibold text-slate-800 mb-4">Job Not Found</h2>
                    <p className="text-slate-600 mb-6">We couldn't find the job you're looking for.</p>
                    <Button asChild>
                        <Link to={createPageUrl('Jobs')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Jobs Board
                        </Link>
                    </Button>
                </div>
                <MarketingFooter />
            </div>
        );
    }

    const handleApplicationClick = () => {
        base44.functions.invoke('trackJobAnalytics', { jobId: job.id, type: 'click' }).catch(console.error);
    };

    const renderApplicationSection = () => {
        const isExpired = job.applicationDeadline && new Date(job.applicationDeadline) < new Date();

        if (isExpired) {
            return (
                <Card className="bg-slate-100 border-slate-300">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-700 text-lg">
                            <Clock className="w-5 h-5" />
                            Application Deadline Passed
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-600">This job posting has closed and is no longer accepting applications.</p>
                    </CardContent>
                </Card>
            );
        }

        if (isMember) {
            return (
                <Card className="bg-purple-50 border-purple-200">
                    <CardHeader>
                        <CardTitle className="text-lg">Application Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {job.applicationMethod && (
                            <div>
                                <h4 className="font-semibold text-sm text-purple-900 uppercase tracking-wide mb-1">Method</h4>
                                <p className="text-slate-700">{job.applicationMethod}</p>
                            </div>
                        )}
                        {job.applicationUrl && (
                            <div>
                                <h4 className="font-semibold text-sm text-purple-900 uppercase tracking-wide mb-1">Link</h4>
                                <a 
                                    href={job.applicationUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-purple-600 hover:underline break-all flex items-start gap-1"
                                    onClick={handleApplicationClick}
                                >
                                    {job.applicationUrl} <ExternalLink className="w-4 h-4 mt-1 flex-shrink-0" />
                                </a>
                            </div>
                        )}
                        {job.contactEmail && (
                            <div>
                                <h4 className="font-semibold text-sm text-purple-900 uppercase tracking-wide mb-1">Email</h4>
                                <a 
                                    href={`mailto:${job.contactEmail}`} 
                                    className="text-purple-600 hover:underline flex items-center gap-1"
                                    onClick={handleApplicationClick}
                                >
                                    {job.contactEmail} <Mail className="w-4 h-4" />
                                </a>
                            </div>
                        )}
                        {job.applicationDeadline && (
                            <div>
                                <h4 className="font-semibold text-sm text-purple-900 uppercase tracking-wide mb-1">Deadline</h4>
                                <p className="text-slate-700">{format(new Date(job.applicationDeadline), 'do MMMM yyyy')}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            );
        }

        return (
            <Card className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white border-none shadow-lg overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                        <Lock className="w-5 h-5" />
                        Unlock Application
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-purple-100 mb-6">
                        Join as a member to view full application details, contact information, and direct application links.
                    </p>
                    <div className="space-y-3">
                        <Button 
                            onClick={handleJoin} 
                            className="w-full bg-white text-purple-700 hover:bg-purple-50 font-bold"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Join Free (Associate)
                        </Button>
                        <div className="text-center">
                             <span className="text-purple-200 text-sm">Already a member? </span>
                             <button onClick={handleLogin} className="text-white underline hover:text-purple-100 text-sm font-medium">
                                 Sign in
                             </button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const canonicalUrl = `https://ifs-safeguarding.co.uk/Job${generateJobSlug(job)}`;
    const pageTitle = `${job.title} - ${job.companyName} - IfS Jobs Board`;
    const pageDescription = job.description ? job.description.replace(/<[^>]*>/g, '').substring(0, 155) : `${job.title} at ${job.companyName}`;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <link rel="canonical" href={canonicalUrl} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
            </Helmet>
            <div className="bg-gray-900 relative">
                <MainSiteNav variant="default" />
                <div className="relative py-20 lg:py-28 overflow-hidden">
                     {/* Background decoration matches Jobs page */}
                     <div className="absolute inset-0">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-600/20 rounded-full blur-3xl"></div>
                    </div>
                    
                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                         <HeroBreadcrumbs pageName="JobDetailsPublic" options={{ dynamicTitle: job.title }} />
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 max-w-4xl mx-auto leading-tight">
                            {job.title}
                        </h1>
                        <div className="flex flex-wrap items-center justify-center gap-4 text-lg text-purple-100">
                            <div className="flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-pink-400" />
                                <span className="font-medium">{job.companyName}</span>
                            </div>
                            <span className="hidden sm:inline text-purple-400">•</span>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-pink-400" />
                                <span>{job.location}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                        {/* Main Content - Left Column */}
                        <div className="md:col-span-2 space-y-8">
                            {/* Job Description */}
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Job Description</h2>
                                <div className="ql-snow">
                                    <div className="ql-editor !p-0 !h-auto text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: job.description }} />
                                </div>
                            </div>

                            {/* Responsibilities */}
                            {job.keyResponsibilities && job.keyResponsibilities.length > 0 && (
                                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Key Responsibilities</h2>
                                    <ul className="space-y-4">
                                        {job.keyResponsibilities.map((item, i) => (
                                            <li key={i} className="flex items-start group">
                                                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mt-0.5 mr-4 flex-shrink-0 group-hover:bg-purple-200 transition-colors">
                                                    <CheckCircle className="w-4 h-4 text-purple-600" />
                                                </div>
                                                <span className="text-slate-700 leading-relaxed">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Requirements */}
                            {job.requirements && job.requirements.length > 0 && (
                                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Requirements & Skills</h2>
                                    <ul className="space-y-4">
                                        {job.requirements.map((item, i) => (
                                            <li key={i} className="flex items-start group">
                                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-4 flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                                                    <Info className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <span className="text-slate-700 leading-relaxed">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Desirable Skills */}
                            {job.desirableSkills && job.desirableSkills.length > 0 && (
                                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Desirable Skills</h2>
                                    <ul className="space-y-4">
                                        {job.desirableSkills.map((item, i) => (
                                            <li key={i} className="flex items-start group">
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mt-0.5 mr-4 flex-shrink-0 group-hover:bg-indigo-200 transition-colors">
                                                    <CheckCircle className="w-4 h-4 text-indigo-600" />
                                                </div>
                                                <span className="text-slate-700 leading-relaxed">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Benefits */}
                            {job.benefits && job.benefits.length > 0 && (
                                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Benefits</h2>
                                    <ul className="space-y-4">
                                        {job.benefits.map((item, i) => (
                                            <li key={i} className="flex items-start group">
                                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5 mr-4 flex-shrink-0 group-hover:bg-green-200 transition-colors">
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                </div>
                                                <span className="text-slate-700 leading-relaxed">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Attachments */}
                            {job.attachments && job.attachments.length > 0 && (
                                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Additional Documents</h2>
                                    <div className="space-y-3">
                                        {job.attachments.map((attachment, index) => (
                                            <a
                                                key={index}
                                                href={attachment.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all group"
                                            >
                                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition-colors">
                                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-slate-900 truncate group-hover:text-purple-700 transition-colors">{attachment.name}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : 'Document'}
                                                    </p>
                                                </div>
                                                <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-purple-600 transition-colors flex-shrink-0" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar - Right Column */}
                        <div className="md:col-span-1 space-y-6">
                            {/* Application Box (Top Sticky) */}
                            <div className="sticky top-6 space-y-6">
                                {renderApplicationSection()}

                                {/* Job Overview Card */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                                        <h3 className="font-bold text-slate-900">Job Overview</h3>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                                                <Banknote className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Salary</p>
                                                <p className="font-medium text-slate-900">{job.salaryDisplayText || 'Not specified'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                <Briefcase className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Contract</p>
                                                <p className="font-medium text-slate-900">{job.contractType}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                                                <Clock className="w-5 h-5 text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Hours</p>
                                                <p className="font-medium text-slate-900">{job.workingHours}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                                                <Calendar className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Posted</p>
                                                <p className="font-medium text-slate-900">{format(new Date(job.created_date), 'do MMM yyyy')}</p>
                                            </div>
                                        </div>
                                        {job.sector && (
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center flex-shrink-0">
                                                    <Building2 className="w-5 h-5 text-pink-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Sector</p>
                                                    <p className="font-medium text-slate-900">{job.sector}</p>
                                                </div>
                                            </div>
                                        )}
                                        {job.experienceLevel && (
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                                                    <Briefcase className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Experience</p>
                                                    <p className="font-medium text-slate-900">{job.experienceLevel}</p>
                                                </div>
                                            </div>
                                        )}
                                        {job.workingArrangement && (
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                                                    <MapPin className="w-5 h-5 text-teal-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Work Type</p>
                                                    <p className="font-medium text-slate-900">{job.workingArrangement}</p>
                                                </div>
                                            </div>
                                        )}
                                        {job.safeguardingFocus && job.safeguardingFocus.length > 0 && (
                                            <div className="pt-4 border-t border-slate-100">
                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Safeguarding Focus</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {job.safeguardingFocus.map((focus, idx) => (
                                                        <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                                                            {focus}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Company Info */}
                                {job.companyDescription && (
                                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                                        <h3 className="font-bold text-slate-900 mb-4">About {job.companyName}</h3>
                                        {job.companyLogoUrl && (
                                            <img src={job.companyLogoUrl} alt={job.companyName} className="max-h-12 w-auto mb-4 object-contain" />
                                        )}
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            {job.companyDescription}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <MarketingFooter />
        </div>
    );
}