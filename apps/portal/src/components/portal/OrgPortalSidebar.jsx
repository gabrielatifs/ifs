import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@ifs/shared/utils';
import { base44 } from '@ifs/shared/api/base44Client';
import {
    LogOut, ExternalLink, Home, Users, X, Building2,
    CreditCard, Briefcase, TrendingUp, ChevronDown, ChevronRight, FileText
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

export default function OrgPortalSidebar({ organisation, user, sidebarOpen, setSidebarOpen, currentPage = '' }) {
    const location = useLocation();
    const { search } = location;

    const handleLogout = () => {
        base44.auth.logout();
    };

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
                    <Link to={createLinkWithParams('ManageOrganisation')} className="flex-1 flex flex-col items-center justify-center">
                        {organisation?.logoUrl ? (
                            <img
                                src={organisation.logoUrl}
                                alt="Organisation Logo"
                                className="h-14 w-auto object-contain"
                            />
                        ) : (
                            <div className="flex items-center gap-2">
                                <Building2 className="w-6 h-6 text-slate-700" />
                                <span className="text-sm font-semibold text-slate-900">Organisation Portal</span>
                            </div>
                        )}
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
                    <PortalSwitcher user={user} currentPortal="organisation" />
                </div>

                {/* User/Organisation Info - Fixed */}
                {user && (
                    <div className="px-4 py-3 border-b border-slate-200 flex-shrink-0">
                        <div className="flex items-center">
                            <div className="ml-0">
                                <p className="text-sm font-medium text-slate-900">{user.displayName || user.full_name}</p>
                                <p className="text-xs text-slate-500">
                                    {user.organisationRole || 'Member'} at {organisation?.name || 'Organisation'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Navigation - Scrollable */}
                <div className="flex-1 overflow-y-auto p-3 space-y-4">
                    <div className="space-y-0.5">
                        <NavLink
                            to={createLinkWithParams('ManageOrganisation')}
                            icon={<Home />}
                            current={currentPage === 'ManageOrganisation'}
                        >
                            Home
                        </NavLink>
                    </div>

                    {user?.organisationRole === 'Admin' && (
                        <NavSection title="Admin">
                            <NavLink
                                to={createLinkWithParams('OrgProfile')}
                                icon={<Building2 />}
                                current={currentPage === 'OrgProfile'}
                            >
                                Profile
                            </NavLink>
                            <NavLink
                                to={createLinkWithParams('OrgMembers')}
                                icon={<Users />}
                                current={currentPage === 'OrgMembers'}
                            >
                                Team
                            </NavLink>
                            <NavLink
                                to={createLinkWithParams('OrgJobs')}
                                icon={<Briefcase />}
                                current={currentPage === 'OrgJobs'}
                            >
                                Jobs
                            </NavLink>
                            <NavLink
                                to={createLinkWithParams('OrgAnalytics')}
                                icon={<TrendingUp />}
                                current={currentPage === 'OrgAnalytics'}
                            >
                                Analytics
                            </NavLink>
                            <NavLink
                                to={createLinkWithParams('OrgInvoices')}
                                icon={<FileText />}
                                current={currentPage === 'OrgInvoices'}
                            >
                                Invoices
                            </NavLink>
                            <NavLink
                                to={createLinkWithParams('ManageOrgSubscription')}
                                icon={<CreditCard />}
                                current={currentPage === 'ManageOrgSubscription'}
                            >
                                Membership
                            </NavLink>
                        </NavSection>
                    )}
                </div>

                {/* Footer - Fixed */}
                <div className="p-3 border-t border-slate-200 space-y-0.5 flex-shrink-0">
                    <NavLink
                        to={createPageUrl('Dashboard')}
                        icon={<Building2 />}
                    >
                        Member Portal
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