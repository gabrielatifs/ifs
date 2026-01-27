import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@ifs/shared/utils';
import { User } from '@ifs/shared/api/entities';
import { customLoginWithRedirect } from '../components/utils/auth';
import { Job } from '@ifs/shared/api/entities';
import JobCard from '../components/jobs/JobCard';
import { Button } from '@ifs/shared/components/ui/button';
import { Input } from '@ifs/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ifs/shared/components/ui/select';
import { Loader2, Briefcase, Sparkles } from 'lucide-react';
import MainSiteNav from '../components/marketing/MainSiteNav';
import HeroBreadcrumbs from '../components/marketing/HeroBreadcrumbs';
import { usePostHog } from '@ifs/shared/components/providers/PostHogProvider';
import JobFilters from '../components/jobs/JobFilters';
import SubmitJobForm from '../components/jobs/SubmitJobForm';
import { Dialog, DialogContent } from '@ifs/shared/components/ui/dialog';
import { createJobPostingCheckout } from '@ifs/shared/api/functions';

export default function Jobs() {
  console.log('[Jobs] Component mounted - path:', window.location.pathname);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [paginatedJobs, setPaginatedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    locationName: '',
    coordinates: null,
    radius: '0',
    experienceLevel: 'All',
    workPattern: 'All',
    salaryRange: [0, 200000]
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [user, setUser] = useState(null);
  const { trackEvent } = usePostHog();
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobData, userData] = await Promise.all([
          Job.list('-created_date'),
          User.me().catch(() => null)
        ]);
        setJobs(jobData);
        setFilteredJobs(jobData);
        setUser(userData);

        // Check if redirected back from payment
        const urlParams = new URLSearchParams(window.location.search);
        const paymentSuccess = urlParams.get('payment') === 'success';
        const action = urlParams.get('action');

        if (paymentSuccess && userData) {
          // Show submit form after successful payment
          setShowSubmitForm(true);
          window.history.replaceState({}, '', createPageUrl('Jobs'));
        } else if (action === 'post_job' && userData) {
          // User came back from login - initiate payment
          handlePostJob();
          window.history.replaceState({}, '', createPageUrl('Jobs'));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let result = jobs;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter expired jobs
    result = result.filter(job => {
      if (!job.applicationDeadline) return true;
      return new Date(job.applicationDeadline) >= today;
    });

    if (filters.search) {
      const lowercasedKeyword = filters.search.toLowerCase();
      result = result.filter(job =>
        (job.title && job.title.toLowerCase().includes(lowercasedKeyword)) ||
        (job.companyName && job.companyName.toLowerCase().includes(lowercasedKeyword)) ||
        (job.description && job.description.toLowerCase().includes(lowercasedKeyword))
      );
    }

    if (filters.locationName) {
        const filterLoc = filters.locationName.toLowerCase();
        const radius = parseFloat(filters.radius);

        if (filters.coordinates && radius > 0) {
            // Radius search
            result = result.filter(job => {
                // Check if job has coordinates
                if (job.latitude && job.longitude) {
                    const distance = calculateDistance(
                        filters.coordinates.lat,
                        filters.coordinates.lng,
                        job.latitude,
                        job.longitude
                    );
                    return distance <= radius;
                } else {
                    // Fallback to string match if job has no coordinates
                    return job.location && job.location.toLowerCase().includes(filterLoc);
                }
            });
        } else {
            // String match
            result = result.filter(job => 
                job.location && (
                    job.location.toLowerCase().includes(filterLoc) || 
                    filterLoc.includes(job.location.toLowerCase())
                )
            );
        }
    }

    // Experience Level Filter
    if (filters.experienceLevel !== 'All') {
        result = result.filter(job => 
            job.experienceLevel && job.experienceLevel.toLowerCase() === filters.experienceLevel.toLowerCase()
        );
    }

    // Work Pattern Filter
    if (filters.workPattern !== 'All') {
        result = result.filter(job => 
            job.workingHours && job.workingHours.toLowerCase() === filters.workPattern.toLowerCase()
        );
    }

    // Salary Range Filter
    const salaryRange = filters.salaryRange || [0, 200000];
    if (salaryRange[0] > 0 || salaryRange[1] < 200000) {
        const minSalary = salaryRange[0];
        const maxSalary = salaryRange[1];

        result = result.filter(job => {
            if (job.salary) {
                return job.salary >= minSalary && (maxSalary === 200000 || job.salary <= maxSalary);
            } else if (job.salaryMin || job.salaryMax) {
                const jobMin = job.salaryMin || 0;
                const jobMax = job.salaryMax || jobMin;
                return jobMax >= minSalary && (maxSalary === 200000 || jobMin <= maxSalary);
            }
            // If no salary info, filter out if minimum salary filter is set
            return minSalary === 0;
        });
    }

    // Sorting - Default to Newest
    result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

    setFilteredJobs(result);
    setCurrentPage(1); // Reset to first page on filter/sort change
  }, [filters, jobs]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedJobs(filteredJobs.slice(startIndex, endIndex));
  }, [currentPage, filteredJobs]);

  const handleFilterChange = (type, value) => {
    if (type === 'location') {
        // Value is an object from LocationSearchInput or a string if typed manually (though current input is read-only-ish for autocomplete)
        // Actually LocationSearchInput returns { name, formatted_address, geometry }
        if (typeof value === 'object' && value !== null) {
            setFilters(prev => ({
                ...prev,
                locationName: value.name || value.formatted_address,
                coordinates: value.geometry?.location || null,
                radius: prev.radius === '0' && value.geometry?.location ? '25' : prev.radius // Default to 25 miles if coordinates found and radius was 0
            }));
        } else {
            // Cleared or typed string (if editable)
            setFilters(prev => ({
                ...prev,
                locationName: value,
                coordinates: null
            }));
        }
    } else {
        setFilters(prev => ({
            ...prev,
            [type]: value
        }));
    }
  };

  // Haversine formula to calculate distance in miles
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
      if (!lat1 || !lon1 || !lat2 || !lon2) return null;
      
      const R = 3959; // Radius of the earth in miles
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a = 
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c; // Distance in miles
      return d;
  };

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);

  const handleJoin = (location) => {
    trackEvent('join_button_clicked', {
      intent: 'associate',
      location: location || 'jobs_page_hero',
      user_type: 'anonymous'
    });
    const path = createPageUrl('Onboarding') + '?intent=associate';
    customLoginWithRedirect(path);
  };

  const handlePostJob = async () => {
    if (!user) {
      // Not logged in - redirect to login
      trackEvent('post_job_clicked', { user_type: 'anonymous' });
      customLoginWithRedirect(createPageUrl('Jobs') + '?action=post_job');
      return;
    }

    // User is logged in - process payment
    setIsProcessingPayment(true);
    trackEvent('post_job_payment_initiated', { user_id: user.id });

    try {
      const currentUrl = window.location.origin + createPageUrl('Jobs');
      const { data } = await createJobPostingCheckout({
        successUrl: `${currentUrl}?payment=success`,
        cancelUrl: currentUrl
      });

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      setIsProcessingPayment(false);
    }
  };

 



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-purple-700 font-medium">Loading job opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gray-900 overflow-hidden" style={{ minHeight: '600px' }}>
        
        <div className="absolute inset-0 hidden lg:block">
          <img 
            src="https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2069&auto=format&fit=crop" 
            alt="Professionals collaborating around a board with sticky notes"
            className="w-full h-full object-cover object-center"
            style={{ filter: 'grayscale(100%) contrast(1.1)' }}
          />
        </div>

        <div 
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, #5e028f 45%, rgba(94, 2, 143, 0.2) 65%, transparent 100%)' }}
        ></div>

        <div className="absolute inset-0 bg-purple-800 lg:hidden"></div>
        
        <div className="absolute inset-0 hidden lg:block">
          <div className="absolute top-16 right-24 w-64 h-64 bg-pink-600/30 rounded-full blur-3xl"></div>
          <div className="absolute top-32 right-8 w-32 h-32 bg-pink-500/40 rounded-full blur-xl"></div>
          <div className="absolute bottom-24 right-32 w-48 h-48 bg-purple-700/25 rounded-full blur-2xl"></div>
          <div className="absolute bottom-8 right-16 w-24 h-24 bg-purple-500/50 rounded-full blur-lg"></div>
          <div className="absolute top-1/2 right-4 w-20 h-20 bg-pink-600/60 rounded-full blur-md"></div>
        </div>

        <MainSiteNav />

        <div className="relative z-10 max-w-screen-xl mx-auto">
          <div className="grid lg:grid-cols-2 items-center min-h-[600px]">
            <div className="px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center lg:text-left">
                <HeroBreadcrumbs pageName="Jobs" />
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                    Safeguarding Career Opportunities
                </h1>
                <div className="text-lg lg:text-xl text-purple-100 mb-8 leading-relaxed space-y-4">
                    <p>
                        Find your next role with our comprehensive safeguarding jobs board.
                    </p>
                    <p className="hidden lg:block">
                        Discover opportunities across all sectors and experience levels, from entry-level positions to senior leadership roles.
                    </p>
                </div>
                <div className="hidden lg:inline-flex items-center gap-4">
                    <Button
                        onClick={() => {
                            const jobsSection = document.getElementById('main-content');
                            if (jobsSection) {
                                jobsSection.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                        size="lg"
                        className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm"
                    >
                        Browse Jobs
                    </Button>
                    <Button
                      onClick={() => handleJoin('jobs_hero_desktop')}
                      size="lg"
                      variant="outline"
                      className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-800 font-semibold px-8 py-3 text-base rounded-sm transition-all"
                    >
                      Become a Member for Free
                    </Button>
                </div>
                <div className="mt-8 lg:hidden">
                    <Button
                        onClick={() => handleJoin('jobs_hero_mobile')}
                        size="lg"
                        className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-sm w-full sm:w-auto">
                        Become a Member for Free
                    </Button>
                </div>
            </div>
            
            <div className="hidden lg:block"></div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main id="main-content" className="bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

          <JobFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={() => setFilters({ 
              search: '', 
              locationName: '', 
              coordinates: null, 
              radius: '0',
              experienceLevel: 'All',
              workPattern: 'All',
              salaryRange: [0, 200000]
            })}
          />

          {/* Job Listings */}
          {paginatedJobs.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No jobs found</h3>
              <p className="text-gray-600 text-lg">Try adjusting your search criteria to discover more opportunities.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-8">
                {paginatedJobs.map((job) => (
                  <JobCard key={job.id} job={job} isPublic={true} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={currentPage === page ? "bg-purple-600 hover:bg-purple-700" : ""}
                        >
                            {page}
                        </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Access Notice for Non-Members */}
          {!user && (
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-center mt-8 relative overflow-hidden">
              <div className="absolute inset-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-400/20 rounded-full blur-lg"></div>
              </div>
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Unlock Full Access with IfS Membership
                </h3>
                <p className="text-purple-100 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
                  Join thousands of safeguarding professionals and get complete access to job descriptions, contact details, and direct application links.
                </p>
                <Button 
                  onClick={() => handleJoin('jobs_page_bottom')}
                  size="lg"
                  className="bg-white text-purple-700 hover:bg-gray-100 font-bold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Join Free as Associate Member
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Submit Job Modal */}
      <Dialog open={showSubmitForm} onOpenChange={setShowSubmitForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <SubmitJobForm
            organisationName={user?.organisationName}
            onSuccess={() => {
              setShowSubmitForm(false);
              trackEvent('job_submitted', {
                organisation_id: user?.organisationId,
                user_id: user?.id
              });
            }}
            onCancel={() => setShowSubmitForm(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
