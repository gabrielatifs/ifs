import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, UserPlus, Award, MessageSquare, BookOpenCheck, Briefcase, Handshake, User as UserIcon, ShieldCheck } from 'lucide-react';

export default function MegaMenu({ arrowPosition }) {
  return (
    <div 
      className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-lg border-t border-gray-200 animate-in fade-in-5 slide-in-from-top-2 duration-300"
      style={{
        '--tw-enter-opacity': '0',
        '--tw-enter-translate-y': '-0.5rem',
      }}
    >
      {/* Arrow */}
      <div 
        className="absolute top-0 w-4 h-4 bg-white transform rotate-45"
        style={{
          left: `calc(${arrowPosition}px - 0.5rem)`,
          transform: 'translateY(-50%) rotate(45deg)',
        }}
      ></div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1: Featured Section */}
          <div className="relative bg-slate-50 rounded-lg p-6 flex flex-col justify-between overflow-hidden">
            <div 
                className="absolute inset-0 bg-cover bg-center opacity-10"
                style={{backgroundImage: "url('https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=800&auto=format&fit=crop')"}}
            ></div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Your Professional Home</h3>
              <p className="text-sm text-gray-600 mb-4">
                Join thousands of safeguarding professionals dedicated to excellence. Discover the benefits of being part of our community.
              </p>
            </div>
            <div className="relative z-10 space-y-3">
                <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                  <Link to={createPageUrl('WhyJoinUs')}>
                    Why Join IfS? <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full border-gray-300 bg-white/80 hover:bg-white">
                  <Link to={createPageUrl('MemberBenefits')}>
                    Explore All Benefits
                  </Link>
                </Button>
            </div>
          </div>

          {/* Column 2: For Individuals */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">For Individuals</h4>
            
            <Link to={createPageUrl('AssociateMembership')} className="block p-3 rounded-lg hover:bg-green-50 border-2 border-transparent hover:border-green-200 transition-all group">
                <h5 className="font-bold text-gray-900 group-hover:text-green-800 transition-colors mb-1">Associate Member (AMIfS)</h5>
                <p className="text-sm text-gray-600">Essential resources & community access for everyone in the field.</p>
            </Link>

            <div className="border-t border-gray-200"></div>

            <Link to={createPageUrl('FullMembership')} className="block p-3 rounded-lg hover:bg-purple-50 border-2 border-transparent hover:border-purple-200 transition-all group">
                <h5 className="font-bold text-gray-900 group-hover:text-purple-800 transition-colors mb-1">Full Member (MIfS)</h5>
                <p className="text-sm text-gray-600">Advanced benefits &amp; exclusive training for experienced DSLs.</p>
            </Link>
            
            <div className="border-t border-gray-200"></div>

            <Link to={createPageUrl('Fellowship')} className="block p-3 rounded-lg hover:bg-amber-50 border-2 border-transparent hover:border-amber-200 transition-all group">
                <h5 className="font-bold text-gray-900 group-hover:text-amber-800 transition-colors mb-1">Fellowship (FIfS)</h5>
                <p className="text-sm text-gray-600">The highest level of professional recognition for leaders.</p>
            </Link>
          </div>
          
          {/* Column 3: For Organisations */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">For Organisations</h4>
            
            <Link to={createPageUrl('MembershipPlans') + '?tab=organisations'} className="block p-3 rounded-lg hover:bg-blue-50 border-2 border-transparent hover:border-blue-200 transition-all group">
                <h5 className="font-bold text-gray-900 group-hover:text-blue-800 transition-colors mb-1">Registered Organisation</h5>
                <p className="text-sm text-gray-600">Free directory listing and team connection.</p>
            </Link>

            <div className="border-t border-gray-200"></div>

            <Link to={createPageUrl('MembershipPlans') + '?tab=organisations'} className="block p-3 rounded-lg hover:bg-indigo-50 border-2 border-transparent hover:border-indigo-200 transition-all group">
                <h5 className="font-bold text-gray-900 group-hover:text-indigo-800 transition-colors mb-1">Member Organisation</h5>
                <p className="text-sm text-gray-600">Bulk Full Membership seats for your staff.</p>
            </Link>
            
            <div className="border-t border-gray-200"></div>
            
            <div className="space-y-1 pt-2">
              <h5 className="font-semibold text-gray-900 text-xs uppercase tracking-wider text-gray-500">Resources</h5>
              {[
                { to: 'ForumsAndWorkshops', icon: MessageSquare, title: 'Forums & Workshops', description: 'Connect with peers' },
                { to: 'CPDTrainingMarketing', icon: BookOpenCheck, title: 'CPD & Training', description: 'Accredited courses' },
                { to: 'JobsBoardMarketing', icon: Briefcase, title: 'Jobs Board', description: 'Find your next role' }
              ].map(item => (
                <Link key={item.to} to={createPageUrl(item.to)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group">
                  <item.icon className="w-4 h-4 text-gray-500 group-hover:text-purple-600 transition-colors flex-shrink-0" />
                  <div>
                    <h5 className="font-medium text-gray-900 text-sm">{item.title}</h5>
                    <p className="text-xs text-gray-600">{item.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}