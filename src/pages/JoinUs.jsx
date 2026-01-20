import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { ArrowRight, Users2, Crown, Sparkles, Check, Building2, Shield, BadgeCheck, UserCircle, Receipt, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import MainSiteNav from '../components/marketing/MainSiteNav';
import MembershipTable from '../components/membership/MembershipTable';
import { ifs } from '@/api/ifsClient';
import { Card, CardContent } from '@/components/ui/card';

export default function JoinUs() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState('associate'); // 'associate', 'full', 'fellowship'

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await ifs.auth.me();
        setUser(currentUser);
        if (currentUser?.onboarding_completed) {
          window.location.href = createPageUrl('Dashboard');
        } else if (currentUser) {
          window.location.href = createPageUrl('Onboarding');
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleJoinAssociate = () => {
    const redirectUrl = window.location.origin + createPageUrl('Onboarding') + '?intent=associate';
    ifs.auth.redirectToLogin(redirectUrl);
  };

  const handleJoinFull = () => {
    const redirectUrl = window.location.origin + createPageUrl('Onboarding') + '?intent=full';
    ifs.auth.redirectToLogin(redirectUrl);
  };

  const handleJoinCorporate = () => {
    window.location.href = createPageUrl('Contact');
  };

  const handleRegisterOrg = () => {
    const redirectUrl = window.location.origin + createPageUrl('OrganisationMembership') + '?type=registered';
    ifs.auth.redirectToLogin(redirectUrl);
  };

  const handleMemberOrg = () => {
    const redirectUrl = window.location.origin + createPageUrl('OrganisationMembership') + '?type=member';
    ifs.auth.redirectToLogin(redirectUrl);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* Compact Hero Section */}
      <section className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2070&auto=format&fit=crop"
            alt="Professional safeguarding training session"
            className="w-full h-full object-cover"
            style={{ filter: 'grayscale(100%) contrast(1.1)' }}
          />
        </div>
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, #5e028f 50%, rgba(94, 2, 143, 0.3) 70%, transparent 100%)' }}
        ></div>
        <div className="absolute inset-0 bg-purple-800 lg:hidden"></div>

        <MainSiteNav />

        <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
                Begin Your Professional Journey – Join for Free
              </h1>
              <p className="text-xl text-purple-100 mb-6 leading-relaxed">
                Connect with the UK's network of safeguarding professionals, access essential resources, and advance your practice.
              </p>
              <p className="text-lg text-purple-100 mb-10 leading-relaxed">
                Start with free Associate Membership and upgrade when you're ready to unlock monthly CPD hours and enhanced benefits.
              </p>
              <div className="space-y-4">
                <Button
                  onClick={handleJoinAssociate}
                  size="lg"
                  className="w-full sm:w-auto bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-3"
                >
                  Join for Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>

            {/* Membership Selection - Tabbed Interface */}
            <div className="hidden lg:block">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-slate-200">
                  <button
                    onClick={() => setSelectedTier('associate')}
                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all ${
                      selectedTier === 'associate'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    AMIfS
                  </button>
                  <button
                    onClick={() => setSelectedTier('full')}
                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all ${
                      selectedTier === 'full'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    MIfS
                  </button>
                  <button
                    onClick={() => setSelectedTier('fellowship')}
                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all ${
                      selectedTier === 'fellowship'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    FIfS
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  {selectedTier === 'associate' && (
                    <div
                      onClick={handleJoinAssociate}
                      className="group cursor-pointer"
                    >
                      <div className="mb-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                            Community Access
                          </span>
                          <Users2 className="w-5 h-5 stroke-[1.5] text-slate-300" />
                        </div>
                        
                        <h4 className="text-xl font-bold text-slate-900 mb-1 tracking-tight">
                          Associate Membership
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed font-light">
                          Join the safeguarding community at no cost
                        </p>
                      </div>

                      <div className="w-12 h-px bg-slate-200 mb-4"></div>
                      
                      <ul className="space-y-2.5 mb-5">
                        <li className="flex items-baseline gap-2 text-sm">
                          <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0 bg-slate-300" />
                          <span className="text-slate-600 font-light">Monthly professional development workshops</span>
                        </li>
                        <li className="flex items-baseline gap-2 text-sm">
                          <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0 bg-slate-300" />
                          <span className="text-slate-600 font-light">Community forum access</span>
                        </li>
                        <li className="flex items-baseline gap-2 text-sm">
                          <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0 bg-slate-300" />
                          <span className="text-slate-600 font-light">AMIFS post-nominal designation</span>
                        </li>
                      </ul>
                      
                      <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-end justify-between gap-4 mb-4">
                          <div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-1">
                              Membership Fee
                            </p>
                            <span className="text-xl font-bold text-slate-900 font-sans">Free</span>
                          </div>
                        </div>

                        <div className="w-full h-11 border border-slate-200 group-hover:bg-slate-50 text-slate-600 group-hover:border-slate-300 text-[13px] font-semibold tracking-[0.1em] uppercase transition-all duration-300 flex items-center justify-center">
                          Apply
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedTier === 'full' && (
                    <div
                      onClick={handleJoinFull}
                      className="group cursor-pointer"
                    >
                      <div className="mb-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
                            Professional Standard
                          </span>
                          <Crown className="w-5 h-5 stroke-[1.5] text-slate-900" />
                        </div>
                        
                        <h4 className="text-xl font-bold text-slate-900 mb-1 tracking-tight">
                          Full Membership
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed font-light">
                          Regulated professional status with CPD hours
                        </p>
                        <p className="text-xs text-green-700 font-semibold mt-1">
                          Limited offer until 31 December
                        </p>
                      </div>

                      <div className="w-12 h-px bg-slate-200 mb-4"></div>
                      
                      <ul className="space-y-2.5 mb-5">
                        <li className="flex items-baseline gap-2 text-sm">
                          <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0 bg-slate-900" />
                          <span className="text-slate-900 font-semibold">1 CPD hour monthly (£20 value)</span>
                        </li>
                        <li className="flex items-baseline gap-2 text-sm">
                          <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0 bg-slate-300" />
                          <span className="text-slate-600 font-light">10% discount on training</span>
                        </li>
                        <li className="flex items-baseline gap-2 text-sm">
                          <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0 bg-slate-300" />
                          <span className="text-slate-600 font-light">MIFS post-nominal designation</span>
                        </li>
                        <li className="flex items-baseline gap-2 text-sm">
                          <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0 bg-slate-300" />
                          <span className="text-slate-600 font-light">Professional recognition</span>
                        </li>
                      </ul>
                      
                      <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-end justify-between gap-4 mb-4">
                          <div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-1">
                              Introductory Offer
                            </p>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xl font-bold text-green-700 font-sans">
                                First month free
                              </span>
                              <span className="text-sm text-slate-500 font-medium font-sans">
                                then £20/month
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="w-full h-11 bg-slate-900 group-hover:bg-slate-800 text-white group-hover:shadow-lg text-[13px] font-semibold tracking-[0.1em] uppercase transition-all duration-300 flex items-center justify-center">
                          Apply
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedTier === 'fellowship' && (
                    <div
                      onClick={handleJoinCorporate}
                      className="group cursor-pointer"
                    >
                      <div className="mb-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                            Distinguished
                          </span>
                          <Sparkles className="w-5 h-5 stroke-[1.5] text-slate-300" />
                        </div>
                        
                        <h4 className="text-xl font-bold text-slate-900 mb-1 tracking-tight">
                          Fellowship
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed font-light">
                          Recognition of significant contribution to the field
                        </p>
                      </div>

                      <div className="w-12 h-px bg-slate-200 mb-4"></div>
                      
                      <ul className="space-y-2.5 mb-5">
                        <li className="flex items-baseline gap-2 text-sm">
                          <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0 bg-slate-300" />
                          <span className="text-slate-600 font-light">All Full Membership benefits</span>
                        </li>
                        <li className="flex items-baseline gap-2 text-sm">
                          <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0 bg-slate-300" />
                          <span className="text-slate-600 font-light">FIFS post-nominal designation</span>
                        </li>
                        <li className="flex items-baseline gap-2 text-sm">
                          <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0 bg-slate-300" />
                          <span className="text-slate-600 font-light">Expert recognition</span>
                        </li>
                        <li className="flex items-baseline gap-2 text-sm">
                          <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0 bg-slate-300" />
                          <span className="text-slate-600 font-light">Policy contribution opportunities</span>
                        </li>
                      </ul>
                      
                      <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-end justify-between gap-4 mb-4">
                          <div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-1">
                              Application
                            </p>
                            <span className="text-xl font-bold text-slate-900 font-sans">By Application</span>
                          </div>
                        </div>

                        <div className="w-full h-11 border border-slate-200 group-hover:bg-slate-50 text-slate-600 group-hover:border-slate-300 text-[13px] font-semibold tracking-[0.1em] uppercase transition-all duration-300 flex items-center justify-center">
                          Enquire
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What are CPD Hours Section */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full mb-6">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-semibold text-amber-900 uppercase">CPD Hours</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-6">
                Bank your professional development
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                CPD hours are your exclusive membership currency, empowering you to invest in continuous professional development. Use them to access premium training courses and professional development programs.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-700"><strong>Full Members receive 1 Free CPD Hour monthly</strong></p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-700"><strong>Hours roll over monthly</strong> – they never expire</p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-700"><strong>Plus 10% additional discount</strong> on all training</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-amber-200">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                  <Sparkles className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">How CPD Hours Work</h3>
                <p className="text-gray-600">Empower your professional development</p>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Receive Monthly</h4>
                  <p className="text-sm text-gray-600">Full Members receive 1 Free CPD Hour automatically every month.</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Use for Training</h4>
                  <p className="text-sm text-gray-600">Apply your hours as discounts on accredited training courses.</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Bank Forever</h4>
                  <p className="text-sm text-gray-600">Hours carry over – use them later. You choose when to use them.</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Additional Savings</h4>
                  <p className="text-sm text-gray-600">Full Members also get an additional 10% discount on all training and supervision.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Comparison Table */}
      <section className="py-16 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">
              Compare Membership Benefits
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start free with Associate Membership. Upgrade anytime to unlock 1 Free CPD Hour monthly and enhanced benefits.
            </p>
          </div>

          <MembershipTable
            includeCorporate={false}
            onJoinAssociate={handleJoinAssociate}
            onJoinFull={handleJoinFull}
          />
        </div>
      </section>
    </>
  );
}