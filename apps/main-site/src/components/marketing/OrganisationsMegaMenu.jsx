import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@ifs/shared/utils';
import { Button } from '@ifs/shared/components/ui/button';
import { ArrowRight, Building2, Users, BookOpenCheck, Briefcase, MessageSquare, Award } from 'lucide-react';

export default function OrganisationsMegaMenu({ arrowPosition }) {
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
                style={{backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop')"}}
            ></div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Safeguarding Excellence for Your Organisation</h3>
              <p className="text-sm text-gray-600 mb-4">
                Support your team's professional development and demonstrate your commitment to safeguarding standards.
              </p>
            </div>
            <div className="relative z-10 space-y-3">
                <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                  <Link to={createPageUrl('RegisteredOrganisation')}>
                    Register Free <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full border-gray-300 bg-white/80 hover:bg-white">
                  <Link to={createPageUrl('Contact')}>
                    Bespoke Packages
                  </Link>
                </Button>
            </div>
          </div>

          {/* Column 2: Organisation Options */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">For Organisations</h4>
            
            <Link to={createPageUrl('RegisteredOrganisation')} className="block p-4 rounded-lg hover:bg-blue-50 border-2 border-transparent hover:border-blue-200 transition-all group">
                <div className="flex items-center justify-between mb-1">
                    <h5 className="font-bold text-gray-900 group-hover:text-blue-800 transition-colors">Registered Organisation</h5>
                </div>
                <p className="text-sm text-gray-600">Free badge & Associate Membership for all team members.</p>
            </Link>
          </div>
          
          {/* Column 3: Resources */}
          <div className="space-y-1">
            <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wider mb-3">Resources</h4>
            
            {[
              { to: 'ForumsAndWorkshops', icon: MessageSquare, title: 'Forums & Workshops', description: 'Connect with peers' },
              { to: 'CPDTrainingMarketing', icon: BookOpenCheck, title: 'CPD & Training', description: 'Accredited courses' },
              { to: 'JobsBoardMarketing', icon: Briefcase, title: 'Jobs Board', description: 'Post your roles' }
            ].map(item => (
              <Link key={item.to} to={createPageUrl(item.to)} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                <item.icon className="w-5 h-5 text-gray-500 group-hover:text-purple-600 transition-colors flex-shrink-0" />
                <div>
                  <h5 className="font-semibold text-gray-900">{item.title}</h5>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}