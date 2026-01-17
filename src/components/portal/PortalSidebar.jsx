import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from '@/api/entities';
import {
    LogOut, ExternalLink, User as UserIcon, Home, GraduationCap, Users2,
    Briefcase, Heart, Award, Settings, X, Shield, BookOpen, Crown, Building2,
    Coffee, MessageSquare, ChevronDown, ChevronRight, Newspaper
} from 'lucide-react';
import PortalSwitcher from './PortalSwitcher';

const NavLink = ({ to, icon, children, current, badge, external = false, ...props }) => {
    const baseClasses = "group relative flex items-center gap-2.5 px-3 py-2 text-sm font-medium transition-all duration-200 rounded-lg";
    const currentClasses = current
        ? "bg-slate-900 text-white shadow-sm"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50";

    const content = (
        <>
            <div className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${
                current
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-slate-700"
            }`}>
                {React.cloneElement(icon, { size: 14 })}
            </div>
            <span className="flex-1">{children}</span>
            {badge && (
                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {badge}
                </span>
            )}
            {external && (
                <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
        </>
    );

    return external ? (
        <a href={to} className={`${baseClasses} ${currentClasses}`} target="_blank" rel="noopener noreferrer" {...props}>
            {content}
        </a>
    ) : (
        <Link to={to} className={`${baseClasses} ${currentClasses}`} {...props}>
            {content}
        </Link>
    );
};

const NavSection = ({ title, children }) => {
    const [isOpen, setIsOpen] = React.useState(true);

    return (
        <div className="space-y-0.5">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider hover:bg-slate-50 hover:text-slate-800 rounded-md transition-colors"
            >
                {title}
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {isOpen && <div className="space-y-0.5">{children}</div>}
        </div>
    );
};

export default function PortalSidebar({ user, sidebarOpen, setSidebarOpen, currentPage = '' }) {
    const isAdmin = user?.role === 'admin';
    const location = useLocation();
    const { search } = location;

    const handleLogout = async () => {
        await User.logout();
        window.location.href = createPageUrl('Home');
    };

    const displayName = user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || "Member";

    const createLinkWithParams = (pageName) => {
        const baseUrl = createPageUrl(pageName);
        return `${baseUrl}${search}`;
    };

    return (
        <>
            {/* Mobile overlay */}
            <div
                className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-200 ${
                    sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-out ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}>

                {/* Header - Fixed */}
                <div className="flex items-center justify-between h-20 px-4 py-3 border-b border-slate-200 flex-shrink-0">
                    <Link to={createLinkWithParams('Dashboard')} className="flex-1 flex items-center justify-center">
                        <img
                            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/cf7db3725_27May-BoardofTrusteesMeeting6.png"
                            alt="IfS Logo"
                            className="h-16 w-auto object-contain"
                        />
                    </Link>
                    <button
                        className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 transition-colors ml-2"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="w-4 h-4 text-slate-500" />
                    </button>
                </div>
                
                {/* Portal Switcher - Fixed */}
                <div className="p-3 border-b border-slate-200 flex-shrink-0">
                    <PortalSwitcher user={user} currentPortal={currentPage === 'AdminDashboard' ? 'admin' : 'member'} />
                </div>
                
                {/* User/Membership Info - Fixed */}
                {user && (
                    <div className="px-4 py-3 border-b border-slate-200 flex-shrink-0">
                        <div className="flex items-center">
                            <div className="ml-0">
                                <p className="text-sm font-medium text-slate-900">{user.displayName || user.full_name}</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-xs text-slate-500">{user.membershipType} Member</p>
                                    <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                                        {user.membershipStatus}
                                    </span>
                                </div>

                            </div>
                        </div>
                    </div>
                )}
                
                {/* Navigation - Scrollable */}
                <div className="flex-1 overflow-y-auto p-3 space-y-4">
                    {/* Main Navigation */}
                    <div className="space-y-0.5">
                        <NavLink
                            to={createLinkWithParams('Dashboard')}
                            icon={<Home />}
                            current={currentPage === 'Dashboard'}
                        >
                            Home
                        </NavLink>
                    </div>

                    <NavSection title="Learning & Development">
                        <NavLink
                            to={createLinkWithParams('CPDTraining')}
                            icon={<GraduationCap />}
                            current={currentPage === 'CPDTraining'}
                            data-tour="training"
                        >
                            Training
                        </NavLink>
                        <NavLink
                            to={createLinkWithParams('MemberMasterclasses')}
                            icon={<Users2 />}
                            current={currentPage === 'MemberMasterclasses' || currentPage === 'CommunityEvents'}
                            data-tour="masterclasses"
                        >
                            Events
                        </NavLink>
                        <NavLink
                            to={createLinkWithParams('SupervisionServices')}
                            icon={<Heart />}
                            current={currentPage === 'SupervisionServices'}
                            data-tour="supervision"
                        >
                            Supervision
                        </NavLink>

                         <NavLink
                            to={createLinkWithParams('MyCertificates')}
                            icon={<Award />}
                            current={currentPage === 'MyCertificates'}
                            data-tour="certificates"
                         >
                            Credentials
                         </NavLink>
                    </NavSection>

                    <NavSection title="Community & Career">
                        <NavLink
                            to={createLinkWithParams('News')}
                            icon={<Newspaper />}
                            current={currentPage === 'News'}
                        >
                            Briefings
                        </NavLink>
                         <NavLink
                            to={createLinkWithParams('JobsBoard')}
                            icon={<Briefcase />}
                            current={currentPage === 'JobsBoard'}
                        >
                            Jobs Board
                        </NavLink>
                        <NavLink
                              to={createLinkWithParams('YourVoice')}
                              icon={<MessageSquare />}
                              current={currentPage === 'YourVoice'}
                          >
                              Your Voice
                          </NavLink>

                        </NavSection>

                    <NavSection title="Account & Support">
                        <NavLink
                            to={createLinkWithParams('MyProfile')}
                            icon={<UserIcon />}
                            current={currentPage === 'MyProfile'}
                        >
                            My Profile
                        </NavLink>

                         <NavLink
                            to={createLinkWithParams('Support')}
                            icon={<MessageSquare />}
                            current={currentPage === 'Support'}
                        >
                            Support Tickets
                        </NavLink>
                    </NavSection>

                    {isAdmin && (
                        <NavSection title="Admin">
                            <NavLink
                                to={createLinkWithParams('AdminDashboard')}
                                icon={<Shield />}
                                current={currentPage === 'AdminDashboard'}
                            >
                                Dashboard
                            </NavLink>
                            <NavLink
                                to={createLinkWithParams('AdminSupport')}
                                icon={<MessageSquare />}
                                current={currentPage === 'AdminSupport'}
                            >
                                Support Tickets
                            </NavLink>
                        </NavSection>
                    )}
                </div>

                {/* Footer - Fixed */}
                <div className="p-3 border-t border-slate-200 space-y-0.5 flex-shrink-0">
                    <NavLink
                        to={createPageUrl('Home')}
                        icon={<ExternalLink />}
                        external={true}
                    >
                        Website
                    </NavLink>
                    <button
                        onClick={handleLogout}
                        className="w-full group flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 rounded-lg"
                    >
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
                            <LogOut size={14} />
                        </div>
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
}