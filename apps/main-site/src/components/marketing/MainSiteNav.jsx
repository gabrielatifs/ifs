import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@ifs/shared/utils';
import { Menu, X, User as UserIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { ifs } from '@ifs/shared/api/ifsClient';
import { Button }
from '@ifs/shared/components/ui/button';
import IndividualsMegaMenu from './IndividualsMegaMenu';
import OrganisationsMegaMenu from './OrganisationsMegaMenu';
import TrainingMegaMenu from './TrainingMegaMenu';

export default function MainSiteNav({ onLogin, variant = 'default', onMobileMenuToggle }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isIndividualsMenuOpen, setIndividualsMenuOpen] = React.useState(false);
  const [isOrganisationsMenuOpen, setOrganisationsMenuOpen] = React.useState(false);
  const [isTrainingMenuOpen, setTrainingMenuOpen] = React.useState(false);
  const [individualsLinkPosition, setIndividualsLinkPosition] = React.useState(0);
  const [organisationsLinkPosition, setOrganisationsLinkPosition] = React.useState(0);
  const [trainingLinkPosition, setTrainingLinkPosition] = React.useState(0);
  const [user, setUser] = React.useState(null);
  
  // Mobile submenu states
  const [mobileSubmenus, setMobileSubmenus] = React.useState({
    individuals: false,
    organisations: false,
    training: false
  });
  
  const individualsLinkRef = React.useRef(null);
  const organisationsLinkRef = React.useRef(null);
  const trainingLinkRef = React.useRef(null);
  const navContainerRef = React.useRef(null);
  
  const handleClearSiteData = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    console.warn('[MainSiteNav] Clearing cookies and storage');
    try {
      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      const baseDomain = parts.length >= 2 ? parts.slice(-2).join('.') : hostname;
      const domains = [
        hostname,
        `.${hostname}`,
        baseDomain,
        `.${baseDomain}`
      ];
      const paths = ['/', ''];
      document.cookie.split(';').forEach((cookie) => {
        const trimmed = cookie.trim();
        if (!trimmed) return;
        const cookieName = trimmed.split('=')[0];
        domains.forEach((domain) => {
          paths.forEach((path) => {
            const pathAttr = path ? `; path=${path}` : '; path=/';
            const domainAttr = domain ? `; domain=${domain}` : '';
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT${pathAttr}${domainAttr}`;
          });
        });
      });
      window.localStorage?.clear?.();
      window.sessionStorage?.clear?.();
    } catch (error) {
      console.error('[MainSiteNav] Failed to clear site data:', error?.message || error);
    }
    setTimeout(() => window.location.reload(), 200);
  };

  // Add effect to notify parent of mobile menu state changes
  React.useEffect(() => {
    if (onMobileMenuToggle) {
      onMobileMenuToggle(mobileMenuOpen);
    }
  }, [mobileMenuOpen, onMobileMenuToggle]);

  React.useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await ifs.auth.me();
        console.log('[MainSiteNav] User detected:', currentUser);
        setUser(currentUser);
      } catch (e) {
        console.log('[MainSiteNav] No user logged in (this is OK for marketing pages)');
        setUser(null);
      }
    };
    checkUser();
  }, []);

  React.useEffect(() => {
    const calculatePositions = () => {
      if (navContainerRef.current) {
        const containerRect = navContainerRef.current.getBoundingClientRect();

        // Calculate for Individuals
        if (individualsLinkRef.current) {
          const individualsRect = individualsLinkRef.current.getBoundingClientRect();
          const individualsCenter = individualsRect.left + (individualsRect.width / 2);
          const relativeIndividualsPosition = individualsCenter - containerRect.left;
          setIndividualsLinkPosition(relativeIndividualsPosition);
        }

        // Calculate for Organisations
        if (organisationsLinkRef.current) {
          const organisationsRect = organisationsLinkRef.current.getBoundingClientRect();
          const organisationsCenter = organisationsRect.left + (organisationsRect.width / 2);
          const relativeOrganisationsPosition = organisationsCenter - containerRect.left;
          setOrganisationsLinkPosition(relativeOrganisationsPosition);
        }

        // Calculate for Training
        if (trainingLinkRef.current) {
          const trainingRect = trainingLinkRef.current.getBoundingClientRect();
          const trainingCenter = trainingRect.left + (trainingRect.width / 2);
          const relativeTrainingPosition = trainingCenter - containerRect.left;
          setTrainingLinkPosition(relativeTrainingPosition);
        }
      }
    };

    calculatePositions();
    window.addEventListener('resize', calculatePositions);
    
    return () => window.removeEventListener('resize', calculatePositions);
  }, []);

  const handleJoin = () => {
    window.location.href = createPageUrl('JoinUs');
  };

  const handleLogin = () => {
    console.log('[MainSiteNav] Login clicked - calling ifs.auth.redirectToLogin()');
    ifs.auth.redirectToLogin(createPageUrl('Dashboard'));
  };

  const toggleMobileSubmenu = (menu) => {
    setMobileSubmenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };
  
  const containerClass = 
    variant === 'solid-mobile'
    ? 'relative bg-[#5e028f] z-20 lg:absolute lg:bg-transparent lg:top-6 lg:left-0 lg:right-0'
    : 'absolute left-0 right-0 z-20 lg:top-6 lg:bg-transparent';

  return (
    <div className={containerClass}>
      <div 
        ref={navContainerRef}
        className="relative max-w-screen-xl mx-auto"
        onMouseLeave={() => {
          setIndividualsMenuOpen(false);
          setOrganisationsMenuOpen(false);
          setTrainingMenuOpen(false);
        }}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side: Navigation for Desktop */}
            <nav className="hidden lg:flex items-center space-x-8">
              <div
                  onMouseEnter={() => {
                    setIndividualsMenuOpen(true);
                    setOrganisationsMenuOpen(false);
                    setTrainingMenuOpen(false);
                  }}
              >
                  <Link 
                      ref={individualsLinkRef}
                      to={createPageUrl("Membership")} 
                      className="text-lg font-medium text-white hover:text-gray-300 transition-colors block py-5"
                  >
                      Individuals
                  </Link>
              </div>
              <div
                  onMouseEnter={() => {
                    setOrganisationsMenuOpen(true);
                    setIndividualsMenuOpen(false);
                    setTrainingMenuOpen(false);
                  }}
              >
                  <Link 
                      ref={organisationsLinkRef}
                      to={createPageUrl("MembershipPlans") + '?tab=organisations'} 
                      className="text-lg font-medium text-white hover:text-gray-300 transition-colors block py-5"
                  >
                      Organisations
                  </Link>
              </div>
              <div
                  onMouseEnter={() => {
                    setTrainingMenuOpen(true);
                    setIndividualsMenuOpen(false);
                    setOrganisationsMenuOpen(false);
                  }}
              >
                  <Link 
                    ref={trainingLinkRef}
                    to={createPageUrl("Training")} 
                    className="text-lg font-medium text-white hover:text-gray-300 transition-colors block py-5"
                  >
                      Training
                  </Link>
              </div>
              <Link to={createPageUrl("Events")} className="text-lg font-medium text-white hover:text-gray-300 transition-colors">Events</Link>
              <Link to={createPageUrl("Jobs")} className="text-lg font-medium text-white hover:text-gray-300 transition-colors">Jobs</Link>
            </nav>

            <div className="hidden lg:flex items-center">
              <Button
                variant="outline"
                size="sm"
                className="border-white text-white hover:bg-white hover:text-purple-800"
                onClick={handleClearSiteData}
              >
                Clear Cookies
              </Button>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden flex items-center justify-between w-full">
                <Link to={createPageUrl("Home")}>
                    <span className="text-white font-bold text-2xl">IfS</span>
                </Link>
                <button 
                    className="text-white p-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                </button>
            </div>
          </div>
        </div>
        
        {isIndividualsMenuOpen && <IndividualsMegaMenu arrowPosition={individualsLinkPosition} />}
        {isOrganisationsMenuOpen && <OrganisationsMegaMenu arrowPosition={organisationsLinkPosition} />}
        {isTrainingMenuOpen && <TrainingMegaMenu arrowPosition={trainingLinkPosition} />}

        {/* Mobile Navigation Panel */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop - clicking outside closes menu */}
            <div 
              className="lg:hidden bg-black/50 fixed inset-0 top-0 z-[90]"
              onClick={() => setMobileMenuOpen(false)}
            ></div>
            
            <div className="lg:hidden bg-gray-900/95 fixed inset-0 top-0 z-[100] overflow-y-auto" style={{ height: '100vh' }}>
              <nav className="flex flex-col h-full">
                {/* Header with close button */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700">
                  <span className="text-white font-bold text-xl">IfS</span>
                  <button 
                    className="text-white p-2 hover:bg-gray-800 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close menu"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="flex-1 p-4">
                  {/* Individuals Section */}
                  <div className="border-b border-gray-700 pb-2 mb-2">
                    <div className="flex items-center justify-between">
                      <Link
                        to={createPageUrl("Membership")}
                        className="flex-1 px-3 py-3 text-base font-medium text-white hover:bg-gray-800 rounded-md mr-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Individuals
                      </Link>
                      <button
                        onClick={() => toggleMobileSubmenu('individuals')}
                        className="px-3 py-3 text-white hover:bg-gray-800 rounded-md"
                      >
                        {mobileSubmenus.individuals ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                    {mobileSubmenus.individuals && (
                      <div className="ml-4 mt-1 space-y-1">
                        <Link to={createPageUrl("WhyJoinUs")} className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-md" onClick={() => setMobileMenuOpen(false)}>Why Join IfS?</Link>
                        <Link to={createPageUrl("MemberBenefits")} className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-md" onClick={() => setMobileMenuOpen(false)}>Member Benefits</Link>
                        <Link to={createPageUrl("AssociateMembership")} className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-md" onClick={() => setMobileMenuOpen(false)}>Associate Member</Link>
                        <Link to={createPageUrl("FullMembership")} className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-md" onClick={() => setMobileMenuOpen(false)}>Full Member</Link>
                        <Link to={createPageUrl("Fellowship")} className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-md" onClick={() => setMobileMenuOpen(false)}>Fellowship</Link>
                      </div>
                    )}
                  </div>

                  {/* Organisations Section */}
                  <div className="border-b border-gray-700 pb-2 mb-2">
                    <div className="flex items-center justify-between">
                      <Link
                        to={createPageUrl("MembershipPlans") + '?tab=organisations'}
                        className="flex-1 px-3 py-3 text-base font-medium text-white hover:bg-gray-800 rounded-md mr-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Organisations
                      </Link>
                      <button
                        onClick={() => toggleMobileSubmenu('organisations')}
                        className="px-3 py-3 text-white hover:bg-gray-800 rounded-md"
                      >
                        {mobileSubmenus.organisations ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                    {mobileSubmenus.organisations && (
                      <div className="ml-4 mt-1 space-y-1">
                        <Link to={createPageUrl("MembershipPlans") + '?tab=organisations'} className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-md" onClick={() => setMobileMenuOpen(false)}>Registered Organisation</Link>
                        <Link to={createPageUrl("MembershipPlans") + '?tab=organisations'} className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-md" onClick={() => setMobileMenuOpen(false)}>Member Organisation</Link>
                      </div>
                    )}
                  </div>

                  {/* Training Section */}
                  <div className="border-b border-gray-700 pb-2 mb-2">
                    <div className="flex items-center justify-between">
                      <Link
                        to={createPageUrl("Training")}
                        className="flex-1 px-3 py-3 text-base font-medium text-white hover:bg-gray-800 rounded-md mr-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Training
                      </Link>
                      <button
                        onClick={() => toggleMobileSubmenu('training')}
                        className="px-3 py-3 text-white hover:bg-gray-800 rounded-md"
                      >
                        {mobileSubmenus.training ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                    {mobileSubmenus.training && (
                      <div className="ml-4 mt-1 space-y-1">
                        <Link to={createPageUrl("IntroductoryCourses")} className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-md" onClick={() => setMobileMenuOpen(false)}>Introductory Courses</Link>
                        <Link to={createPageUrl("AdvancedCourses")} className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-md" onClick={() => setMobileMenuOpen(false)}>Advanced & Specialist</Link>
                        <Link to={createPageUrl("RefresherCourses")} className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-md" onClick={() => setMobileMenuOpen(false)}>Annual Refresher</Link>
                        <Link to={createPageUrl("Training")} className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-md" onClick={() => setMobileMenuOpen(false)}>Browse All Courses</Link>
                        <Link to={createPageUrl("Contact")} className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-md" onClick={() => setMobileMenuOpen(false)}>Bespoke Training Enquiries</Link>
                      </div>
                    )}
                  </div>

                  {/* Other Main Navigation */}
                  <Link to={createPageUrl("Events")} className="block px-3 py-3 text-base font-medium text-white hover:bg-gray-800 rounded-md mb-2" onClick={() => setMobileMenuOpen(false)}>Events</Link>
                  <Link to={createPageUrl("Jobs")} className="block px-3 py-3 text-base font-medium text-white hover:bg-gray-800 rounded-md mb-4" onClick={() => setMobileMenuOpen(false)}>Jobs</Link>
                  
                  {/* Divider */}
                  <hr className="border-gray-700 my-4" />
                  
                  {/* Top Nav Items moved from Header */}
                  <Link to={createPageUrl("About")} className="block px-3 py-3 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md" onClick={() => setMobileMenuOpen(false)}>About</Link>
                  <Link to={createPageUrl("Governance")} className="block px-3 py-3 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md" onClick={() => setMobileMenuOpen(false)}>Governance</Link>
                  <Link to={createPageUrl("Contact")} className="block px-3 py-3 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md mb-4" onClick={() => setMobileMenuOpen(false)}>Contact Us</Link>
                  
                  {/* Auth/Action Buttons */}
                  {!user && (
                    <button
                        onClick={() => {
                          console.log('[MainSiteNav Mobile] Sign in clicked');
                          setMobileMenuOpen(false);
                          handleLogin();
                        }}
                        className="block px-3 py-3 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md text-center w-full mb-4"
                    >
                        <UserIcon className="w-5 h-5 mr-2 inline" />
                        Sign in
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleClearSiteData();
                    }}
                    className="block px-3 py-3 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md text-center w-full mb-4"
                  >
                    Clear Cookies
                  </button>
                  
                  {user ? (
                    <Link to={createPageUrl("Dashboard")} className="block px-3 py-3 text-base font-medium bg-pink-600 hover:bg-pink-700 text-white rounded-md text-center mb-4" onClick={() => setMobileMenuOpen(false)}>
                      Member Portal
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleJoin();
                      }}
                      className="block px-3 py-3 text-base font-medium bg-pink-600 hover:bg-pink-700 text-white rounded-md text-center w-full mb-4"
                    >
                      Become a Member
                    </button>
                  )}
                </div>
              </nav>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
