import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ifs } from '@ifs/shared/api/ifsClient';
import { createPageUrl } from '@ifs/shared/utils';
import { Button } from '@ifs/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@ifs/shared/components/ui/card';
import {
  Loader2,
  ArrowLeft,
  MapPin,
  Clock,
  Briefcase,
  Building2,
  Banknote,
  Calendar,
  CheckCircle,
  Info,
  ExternalLink,
  Mail,
  Lock,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';
import { generateJobPath, generateJobSlug } from '@/components/utils/jobUtils';
import MainSiteNav from '@/components/marketing/MainSiteNav';
import HeroBreadcrumbs from '@/components/marketing/HeroBreadcrumbs';
import { User } from '@ifs/shared/api/entities';
import { customLoginWithRedirect } from '@/components/utils/auth';
import { usePostHog } from '@ifs/shared/components/providers/PostHogProvider';
import 'react-quill/dist/quill.snow.css';

export default function JobDetailsView({ jobId, jobSlug }) {
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
          const fetchedJob = await ifs.entities.Job.get(jobId);
          setJob(fetchedJob);
          if (fetchedJob) {
            // Track view - non-blocking
            ifs.functions.invoke('trackJobAnalytics', { jobId: fetchedJob.id, type: 'view' }).catch(console.error);
          }
        } else if (jobSlug) {
          const allJobs = await ifs.entities.Job.list('-created_date');
          const normalizedSlug = jobSlug.toLowerCase();
          const match = allJobs.find((item) => generateJobSlug(item).toLowerCase() === normalizedSlug);
          setJob(match || null);
          if (match) {
            ifs.functions.invoke('trackJobAnalytics', { jobId: match.id, type: 'view' }).catch(console.error);
          }
        } else {
          setJob(null);
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
        setJob(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId]);

  const handleJoin = () => {
    trackEvent('join_button_clicked', {
      intent: 'associate',
      location: 'public_job_details',
      user_type: 'anonymous',
    });
    const portalJobUrl = `${createPageUrl('Job/view')}?id=${job?.id}`;

    // Store intent and redirect in session storage as a backup
    sessionStorage.setItem('pending_job_redirect', portalJobUrl);
    sessionStorage.setItem('pending_job_intent', 'associate');

    const path = createPageUrl('Onboarding') + `?intent=associate&redirect=${encodeURIComponent(portalJobUrl)}`;
    customLoginWithRedirect(path);
  };

  const handleLogin = () => {
    const currentUrl = window.location.pathname + window.location.search;
    ifs.auth.redirectToLogin(currentUrl);
  };

  const isMember = user && (user.membershipType === 'Associate' || user.membershipType === 'Full') && user.membershipStatus === 'active';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <MainSiteNav variant="solid-mobile" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <MainSiteNav variant="solid-mobile" />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">Job Not Found</h2>
          <p className="text-slate-600 mb-6">We couldn’t find the job you’re looking for.</p>
          <Button asChild>
            <Link to={createPageUrl('Jobs')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs Board
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleApplicationClick = () => {
    ifs.functions.invoke('trackJobAnalytics', { jobId: job.id, type: 'click' }).catch(console.error);
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
                <a href={`mailto:${job.contactEmail}`} className="text-purple-600 hover:underline flex items-center gap-1" onClick={handleApplicationClick}>
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
            <Button onClick={handleJoin} className="w-full bg-white text-purple-700 hover:bg-purple-50 font-bold">
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

  const canonicalUrl = `https://ifs-safeguarding.co.uk${generateJobPath(job)}`;
  const pageTitle = `${job.title} - ${job.companyName} - IfS Jobs Board`;
  const pageDescription = job.description
    ? job.description.replace(/<[^>]*>/g, '').substring(0, 155)
    : `${job.title} at ${job.companyName}`;

  // JSON-LD structured data for Google Jobs
  const postedDate = job.createdAt
    ? new Date(job.createdAt).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  const salaryUnitMap = { 'annual': 'YEAR', 'hourly': 'HOUR', 'daily': 'DAY', 'weekly': 'WEEK', 'monthly': 'MONTH' };

  const jobPostingSchema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description?.replace(/<[^>]*>/g, '') || '',
    "datePosted": postedDate,
    "validThrough": job.applicationDeadline || undefined,
    "employmentType": job.contractType?.toUpperCase().replace(/\s+/g, '_') || undefined,
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.companyName,
      "logo": job.companyLogoUrl || undefined
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.addressLocality || job.location,
        "addressRegion": job.addressRegion || undefined,
        "postalCode": job.postalCode || undefined,
        "streetAddress": job.streetAddress || undefined,
        "addressCountry": "GB"
      }
    },
    ...(job.salary ? {
      "baseSalary": {
        "@type": "MonetaryAmount",
        "currency": job.salaryCurrency || "GBP",
        "value": {
          "@type": "QuantitativeValue",
          "value": job.salary,
          "unitText": salaryUnitMap[job.salaryUnit?.toLowerCase()] || "YEAR"
        }
      }
    } : {})
  };

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
        <meta property="og:image" content={job.companyLogoUrl || "https://ifs-safeguarding.co.uk/og-image.png"} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={job.companyLogoUrl || "https://ifs-safeguarding.co.uk/og-image.png"} />
        <script type="application/ld+json">
          {JSON.stringify(jobPostingSchema)}
        </script>
      </Helmet>

      <div className="bg-gray-900 relative">
        <MainSiteNav variant="default" />
        <div className="relative py-20 lg:py-28 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-600/20 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <HeroBreadcrumbs pageName="JobDetailsPublic" options={{ dynamicTitle: job.title }} />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 max-w-4xl mx-auto leading-tight">{job.title}</h1>
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
            <div className="md:col-span-2 space-y-8">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Job Description</h2>
                <div className="ql-snow">
                  <div className="ql-editor !p-0 !h-auto text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: job.description }} />
                </div>
              </div>
            </div>

            <div className="md:col-span-1 space-y-6">
              <div className="sticky top-6 space-y-6">{renderApplicationSection()}</div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}




