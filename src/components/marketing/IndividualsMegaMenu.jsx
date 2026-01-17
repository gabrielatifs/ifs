import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function IndividualsMegaMenu({ arrowPosition }) {
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

          {/* Column 2: Membership Tiers */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">Membership Tiers</h4>
            
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
          
          {/* Column 3: Fellowship Featured */}
          <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 flex flex-col justify-between overflow-hidden">
            <div 
                className="absolute inset-0 bg-cover bg-center opacity-10"
                style={{backgroundImage: "url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop')"}}
            ></div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Achieve Fellowship</h3>
              <p className="text-sm text-gray-700 mb-4">
                The highest recognition for safeguarding leaders who have made exceptional contributions to the field.
              </p>
            </div>
            <div className="relative z-10 space-y-3">
                <Button asChild className="w-full bg-amber-600 hover:bg-amber-700">
                  <Link to={createPageUrl('Fellowship')}>
                    Learn About Fellowship <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}