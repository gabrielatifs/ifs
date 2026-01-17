import React from 'react';
import { Button } from '../ui/button';
import { Check, Users, Crown, Trophy, ArrowRight, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

const MembershipTable = ({ onJoinAssociate, onJoinFull, onReqOrgPayment }) => {
  const features = [
    {
      category: 'Professional Development',
      items: [
        {
          label: 'CPD Hours',
          associate: false,
          full: '1 CPD Hour included monthly',
          highlight: true,
          description: 'Bank & use when you need it',
        },
        {
          label: 'Monthly Masterclasses',
          associate: true,
          full: true,
          description: 'Live professional development sessions',
        },
        {
          label: 'Training Course Discount',
          associate: false,
          full: '10%',
          description: 'On all CPD training',
        },
        {
          label: 'Supervision Discount',
          associate: false,
          full: '10%',
          description: 'Professional supervision support',
        },
      ],
    },
    {
      category: 'Community & Resources',
      items: [
        {
          label: 'Professional Forums',
          associate: true,
          full: true,
          description: 'Connect with peers',
        },
        {
          label: 'Weekly Newsletter',
          associate: true,
          full: true,
          description: 'Latest updates & insights',
        },
        {
          label: 'Jobs Board',
          associate: '3 daily views',
          full: 'Unlimited',
          description: 'Career opportunities',
        },
      ],
    },
    {
      category: 'Recognition & Benefits',
      items: [
        {
          label: 'Post-Nominal Letters',
          associate: 'AMIfS',
          full: 'MIfS',
          fellow: 'FIfS',
          description: 'Professional designation',
        },
        {
          label: 'Digital Credentials',
          associate: true,
          full: true,
          description: 'Verified membership badge',
        },
        {
          label: 'Voting Rights',
          associate: false,
          full: true,
          fellow: true,
          description: 'Shape the future of IfS',
        },
        {
          label: 'Leadership Recognition',
          associate: false,
          full: false,
          fellow: true,
          description: 'Recognised safeguarding leader',
        },
        {
          label: 'Strategic Influence',
          associate: false,
          full: false,
          fellow: true,
          description: 'Shape sector-wide practice',
        },
        {
          label: 'Priority Support',
          associate: false,
          full: true,
          description: 'Dedicated member support',
        },
      ],
    },
  ];

  return (
    <div className="w-full">
      {/* Desktop Comparison */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-3 gap-6 max-w-[1100px] mx-auto">
          {/* Associate Column */}
          <div className="bg-white rounded-lg border-2 border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 p-8 text-center border-b border-gray-200">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-white border-2 border-gray-300 rounded-full mb-4">
                <Users className="w-7 h-7 text-gray-700" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Associate Member</h3>
              <div className="text-4xl font-bold text-gray-900 mb-1">Free</div>
              <p className="text-sm text-gray-600 mb-6">No payment required</p>
              {onJoinAssociate ? (
                <Button onClick={onJoinAssociate} size="lg" className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold">
                  Join as Associate
                </Button>
              ) : (
                <Button asChild size="lg" className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold">
                  <Link to={createPageUrl('JoinUs')}>Join as Associate</Link>
                </Button>
              )}
            </div>

            <div className="p-8">
              {features.map((section) => {
                const associateItems = section.items.filter((item) => item.associate !== false);
                if (associateItems.length === 0) return null;

                return (
                  <div key={section.category} className="mb-8 last:mb-0">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
                      {section.category}
                    </h4>
                    <div className="space-y-3">
                      {associateItems.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="w-5 h-5 rounded-sm bg-gray-100 border border-gray-300 flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-gray-700" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900">{item.label}</div>
                            {typeof item.associate === 'string' && (
                              <div className="text-xs font-semibold text-gray-700 mt-0.5">{item.associate}</div>
                            )}
                            {item.description && <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Full Column */}
          <div className="bg-white rounded-lg border-2 border-slate-900 shadow-md overflow-hidden">
            <div className="bg-slate-900 p-8 text-center text-white">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-full mb-4">
                <Crown className="w-7 h-7 text-slate-900" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Full Membership (MIFS)</h3>
              <div className="flex items-baseline justify-center gap-1 mb-1">
                <span className="text-4xl font-bold">£20</span>
                <span className="text-lg">/month</span>
              </div>
              <p className="text-sm text-slate-300 mb-4">Includes 1 CPD hour monthly</p>

              {/* Reimbursement Note */}
              <div className="relative bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4 border border-white/20 shadow-lg">
                <div className="relative flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                    <Receipt className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold text-white mb-1">Organisation Reimbursement</p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Invoices sent automatically—forward to your employer for reimbursement
                    </p>
                  </div>
                </div>
              </div>

              {onJoinFull ? (
                <Button onClick={onJoinFull} size="lg" className="w-full bg-white hover:bg-slate-100 text-slate-900 font-semibold mb-2">
                  Become a Full Member
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button asChild size="lg" className="w-full bg-white hover:bg-slate-100 text-slate-900 font-semibold mb-2">
                  <Link to={createPageUrl('JoinUs')}>
                    Become a Full Member
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              )}
              {onReqOrgPayment && (
                <Button onClick={onReqOrgPayment} size="sm" variant="outline" className="w-full text-xs bg-transparent border-white text-white hover:bg-slate-800">
                  Request Organisation Payment
                </Button>
              )}
            </div>

            <div className="p-8">
              {features.map((section) => (
                <div key={section.category} className="mb-8 last:mb-0">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
                    {section.category}
                  </h4>
                  <div className="space-y-3">
                    {section.items.map((item, idx) => {
                      const hasFeature = item.full !== false;
                      if (!hasFeature) return null;

                      return (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="w-5 h-5 rounded-sm bg-slate-100 border border-slate-300 flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-slate-900" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900">{item.label}</div>
                            {typeof item.full === 'string' && <div className="text-xs font-semibold text-slate-900 mt-0.5">{item.full}</div>}
                            {item.description && <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fellowship / Info Column */}
          <div className="bg-slate-50 rounded-lg border-2 border-gray-200 p-8">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">CPD Training Hours</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Full Members receive 1 CPD hour each month to use towards professional development courses and training.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-gray-700 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-gray-900">Hours never expire</div>
                  <div className="text-xs text-gray-600">Bank them up for larger courses</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-gray-700 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-gray-900">Apply to any accredited training</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-gray-700 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-gray-900">Plus 10% discount</div>
                  <div className="text-xs text-gray-600">On all training & supervision</div>
                </div>
              </div>
            </div>

            {/* Fellowship teaser */}
            <div className="bg-white rounded-lg border-2 border-amber-500 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 text-center text-white">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full mb-3">
                  <Trophy className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold mb-1">Fellowship (FIfS)</h3>
                <div className="flex items-baseline justify-center gap-1 mb-1">
                  <span className="text-3xl font-bold">£120</span>
                  <span className="text-base">/year</span>
                </div>
                <p className="text-sm text-amber-50 mb-4">Plus Full Membership required</p>

                <Button asChild size="lg" className="w-full bg-white hover:bg-amber-50 text-amber-600 font-semibold">
                  <Link to={createPageUrl('Fellowship')}>
                    Learn About Fellowship
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden space-y-6">
        {/* Associate Card - Mobile */}
        <div className="bg-white rounded-lg border-2 border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 p-6 text-center border-b border-gray-200">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white border-2 border-gray-300 rounded-full mb-3">
              <Users className="w-6 h-6 text-gray-700" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Associate Member</h3>
            <div className="text-3xl font-bold text-gray-900 mb-1">Free</div>
            <p className="text-sm text-gray-600 mb-4">No payment required</p>
            {onJoinAssociate ? (
              <Button onClick={onJoinAssociate} size="lg" className="w-full bg-gray-900 hover:bg-gray-800">
                Join as Associate
              </Button>
            ) : (
              <Button asChild size="lg" className="w-full bg-gray-900 hover:bg-gray-800">
                <Link to={createPageUrl('JoinUs')}>Join as Associate</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipTable;




