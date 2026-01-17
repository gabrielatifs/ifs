import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Home, User, GraduationCap, Users2, Coffee } from 'lucide-react';

export default function PortalBottomNav({ user, currentPage }) {
  const location = useLocation();
  const { search } = location;

  const createLinkWithParams = (pageName) => {
    const baseUrl = createPageUrl(pageName);
    return `${baseUrl}${search}`;
  };

  const navItems = [
    { name: 'Home', page: 'Dashboard', icon: Home, current: currentPage === 'Dashboard' },
    {
      name: 'Training',
      page: 'CPDTraining',
      icon: GraduationCap,
      current: currentPage === 'CPDTraining' || currentPage === 'CourseDetails',
    },
    {
      name: 'Events',
      page: 'MemberMasterclasses',
      icon: Users2,
      current: currentPage === 'MemberMasterclasses' || currentPage === 'MasterclassDetails' || currentPage === 'MyMasterclassBookings',
    },
    { name: 'Community', page: 'CommunityEvents', icon: Coffee, current: currentPage === 'CommunityEvents' },
    {
      name: 'Profile',
      page: 'MyProfile',
      icon: User,
      current:
        currentPage === 'MyProfile' ||
        currentPage === 'MyCertificates' ||
        currentPage === 'PortalMembershipTiers' ||
        currentPage === 'ManageOrganisation',
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 safe-area-bottom">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.page}
              to={createLinkWithParams(item.page)}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                item.current ? 'text-purple-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className={`w-5 h-5 ${item.current ? 'fill-purple-100' : ''}`} />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}




