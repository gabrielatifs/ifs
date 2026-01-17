import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';
import PortalSidebar from '../components/portal/PortalSidebar';
import PortalHeader from '../components/portal/PortalHeader';
import { useUser } from '../components/providers/UserProvider';
import { Loader2 } from 'lucide-react';
import BookingManagement from '../components/portal/BookingManagement';
import CourseBookingsCard from '../components/portal/CourseBookingsCard';

export default function MyMasterclassBookings() {
    const { user, loading } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!user && !loading) {
            User.loginWithRedirect(window.location.href);
            return;
        }
        if (user && !user.onboarding_completed && !user.isUnclaimed) {
            window.location.href = createPageUrl('Onboarding');
            return;
        }
    }, [user, loading]);

    if (loading) {
        return null; // Layout handles spinner
    }

    if (!user) {
        return null;
    }

    return (
        <div className="flex h-screen bg-slate-50/30">
            <PortalSidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="MyMasterclassBookings" />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <PortalHeader
                    setSidebarOpen={setSidebarOpen}
                    user={user}
                />
                <main className="flex-1 overflow-y-auto p-6 md:p-8 pb-20 md:pb-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">My Booked Sessions</h1>
                            <p className="text-lg text-slate-600">Manage your upcoming and view past masterclasses and training sessions.</p>
                        </div>
                        
                        <div className="mb-8">
                            <CourseBookingsCard user={user} mode="grid" />
                        </div>
                        
                        <BookingManagement user={user} />
                    </div>
                </main>
            </div>
        </div>
    );
}