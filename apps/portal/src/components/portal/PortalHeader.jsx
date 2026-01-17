import React, { useState, useEffect } from 'react';
import { Button } from '@ifs/shared/components/ui/button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl, isAdminDomain } from '@ifs/shared/utils';
import { Menu, Settings, Search, User as UserIcon, LogOut, Command as CommandIcon, Briefcase, GraduationCap, Users2, Shield, Home, Eye, EyeOff, Coins } from 'lucide-react';
import { User } from '@ifs/shared/api/entities';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ifs/shared/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@ifs/shared/components/ui/command";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@ifs/shared/components/ui/tooltip";
import { useUser } from '@ifs/shared/components/providers/UserProvider';
import { fastLogout } from '../utils/fastLogout';

const CommandMenu = () => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { search } = location;
    const onAdminDomain = isAdminDomain();

    useEffect(() => {
        const down = (e) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = (command) => {
        setOpen(false);
        command();
    };

    const navigateWithParams = (pageName) => {
        const url = `${createPageUrl(pageName)}${search}`;
        if (url.startsWith('http://') || url.startsWith('https://')) {
            window.location.href = url;
            return;
        }
        navigate(url);
    };

    return (
        <>
            <Button
                variant="outline"
                className="h-10 w-10 p-0 lg:w-80 lg:px-4 lg:justify-start lg:gap-3 text-sm text-slate-500 border-slate-200/60"
                onClick={() => setOpen(true)}
            >
                <Search className="h-4 w-4" />
                <span className="hidden lg:inline-block flex-1 text-left">Search anything...</span>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Navigation">
                        <CommandItem onSelect={() => runCommand(() => navigateWithParams('Dashboard'))}>
                            <Home className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigateWithParams('MyProfile'))}>
                            <UserIcon className="mr-2 h-4 w-4" />
                            <span>My Profile</span>
                        </CommandItem>
                        {onAdminDomain && (
                            <CommandItem onSelect={() => runCommand(() => navigateWithParams('AdminDashboard'))}>
                                <Shield className="mr-2 h-4 w-4" />
                                <span>Admin Panel</span>
                            </CommandItem>
                        )}
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Resources">
                         <CommandItem onSelect={() => runCommand(() => navigateWithParams('CPDTraining'))}>
                            <GraduationCap className="mr-2 h-4 w-4" />
                            <span>CPD & Training</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigateWithParams('MemberMasterclasses'))}>
                            <Users2 className="mr-2 h-4 w-4" />
                            <span>Masterclasses & Events</span>
                        </CommandItem>
                         <CommandItem onSelect={() => runCommand(() => navigateWithParams('JobsBoard'))}>
                            <Briefcase className="mr-2 h-4 w-4" />
                            <span>Jobs Board</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}

export default function PortalHeader({ setSidebarOpen, user: propUser, currentPortal = 'member' }) {
    const { user: contextUser, isViewingAs, actualAdmin, exitViewAs } = useUser();
    
    // Use prop user if provided, otherwise use context user
    const user = propUser || contextUser;
    
    const displayName = user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Member';
    const location = useLocation();
    const { search } = location;

    const handleLogout = async () => {
        fastLogout();
    };

    // Show CPD hours meter for all Full and Associate members, even if balance is 0 or undefined
    const showCpdMeter = user && (user.membershipType === 'Full' || user.membershipType === 'Associate');
    const cpdHours = user?.cpdHours ?? 0;
    const cpdValueInGBP = cpdHours * 20;

    return (
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200/50">
            {/* View As Banner */}
            {isViewingAs && actualAdmin && (
                <div className="bg-orange-100 border-b border-orange-200 px-6 lg:px-8 py-2">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-orange-800">
                            <Eye className="w-4 h-4" />
                            <span>
                                {user?.isUnclaimed ? (
                                    <>Previewing unclaimed profile for <strong>{displayName}</strong> ({user?.email})</>
                                ) : (
                                    <>Viewing as <strong>{displayName}</strong> ({user?.email})</>
                                )}
                            </span>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={exitViewAs}
                            className="text-orange-700 border-orange-300 hover:bg-orange-50"
                        >
                            <EyeOff className="w-4 h-4 mr-2" />
                            Exit View As
                        </Button>
                    </div>
                </div>
            )}
            
            <div className="flex items-center justify-between px-6 lg:px-8 h-16">
                {/* Left side */}
                <div className="flex items-center gap-4">
                    <button
                        className="lg:hidden -ml-2 p-2.5 rounded-xl hover:bg-slate-100 transition-colors"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="w-5 h-5 text-slate-600" />
                    </button>
                    <CommandMenu />
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    {/* CPD Hours Meter with Tooltip */}
                    {showCpdMeter && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link 
                                        to={createPageUrl('PortalMembershipTiers')} 
                                        className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 hover:border-amber-300 hover:shadow-sm transition-all group cursor-pointer"
                                        data-tour="cpd-meter"
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <div className="p-1 bg-amber-200 rounded group-hover:bg-amber-300 transition-colors">
                                                <Coins className="w-3.5 h-3.5 text-amber-700" />
                                            </div>
                                            <span className="text-sm font-bold text-amber-900">
                                                {cpdHours.toFixed(1)}
                                            </span>
                                        </div>
                                        <span className="text-xs text-amber-700 font-medium">
                                            CPD Hours
                                        </span>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs" side="bottom" align="center">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="font-semibold text-sm">Your CPD Balance</p>
                                                <p className="text-xs text-slate-600">{cpdHours.toFixed(1)} hours available</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-green-600">£{cpdValueInGBP.toFixed(2)}</p>
                                                <p className="text-xs text-slate-600">training value</p>
                                            </div>
                                        </div>
                                        <div className="pt-2 border-t border-slate-200 space-y-1">
                                            <p className="text-xs text-slate-600"><strong>What are CPD Hours?</strong> Free training credit included with your membership</p>
                                            <p className="text-xs text-slate-600"><strong>Bank & Save:</strong> Hours roll over monthly and never expire</p>
                                            <p className="text-xs text-slate-600"><strong>How Discounts Apply:</strong> CPD hours first (£20/hour), then member discount on remainder</p>
                                            <p className="text-xs text-purple-600 font-medium">Full Members: 10% discount on remaining balance</p>
                                        </div>
                                        <Button asChild size="sm" className="w-full mt-2 bg-purple-600 hover:bg-purple-700">
                                            <Link to={createPageUrl('PortalMembershipTiers')}>
                                                View CPD History
                                            </Link>
                                        </Button>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                    
                    {/* User Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                         <button className="flex items-center gap-3 p-2 pr-3 rounded-xl hover:bg-slate-100 transition-colors">
                            <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center">
                                {user?.profileImageUrl ? (
                                    <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    <UserIcon className="w-4 h-4 text-slate-600" />
                                )}
                            </div>
                             <div className="hidden lg:flex flex-col items-start">
                                <span className="text-sm font-semibold text-slate-800">{displayName}</span>
                                <span className="text-xs text-slate-500">{user?.membershipType} Member</span>
                             </div>
                         </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-60 mr-4 rounded-xl border-slate-200/50 shadow-xl" align="end">
                        <DropdownMenuLabel className="font-normal px-4 py-3">
                            <div className="font-semibold text-slate-900">{displayName}</div>
                            <div className="text-sm text-slate-500 font-normal">{user?.email}</div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {!isViewingAs && (
                            <>
                                <DropdownMenuItem asChild className="rounded-lg mx-2 my-1 cursor-pointer">
                                    <Link to={`${createPageUrl('MyProfile')}${search}`}>
                                        <UserIcon className="mr-3 h-4 w-4" />
                                        <span>My Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="rounded-lg mx-2 my-1 cursor-pointer">
                                    <Link to={`${createPageUrl('MyProfile')}${search}`}>
                                        <Settings className="mr-3 h-4 w-4" />
                                        <span>Settings</span>
                                    </Link>
                                </DropdownMenuItem>
                                {showCpdMeter && (
                                    <DropdownMenuItem asChild className="rounded-lg mx-2 my-1 cursor-pointer">
                                        <Link to={`${createPageUrl('PortalMembershipTiers')}${search}`}>
                                            <Coins className="mr-3 h-4 w-4 text-amber-600" />
                                            <span className="flex items-center justify-between flex-1">
                                                <span>CPD Hours History</span>
                                                <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                                    {cpdHours.toFixed(1)}
                                                </span>
                                            </span>
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                            </>
                        )}
                        <DropdownMenuItem onClick={handleLogout} className="rounded-lg mx-2 my-1 text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer">
                          <LogOut className="mr-3 h-4 w-4" />
                          <span>Sign Out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
