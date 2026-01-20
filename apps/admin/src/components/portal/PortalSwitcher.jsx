import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl, isAdminDomain, navigateToUrl } from '@ifs/shared/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@ifs/shared/components/ui/select";
import { User, Building2, Shield } from 'lucide-react';

export default function PortalSwitcher({ user, currentPortal }) {
    const navigate = useNavigate();
    const onAdminDomain = isAdminDomain();

    // Determine available portals based on user permissions
    const availablePortals = [
        {
            id: 'member',
            name: 'Member Portal',
            icon: User,
            path: createPageUrl('Dashboard'),
            available: true
        },
        {
            id: 'organisation',
            name: user?.organisationName || 'Organisation Portal',
            icon: Building2,
            path: createPageUrl('ManageOrganisation'),
            available: !!user?.organisationId
        },
        {
            id: 'admin',
            name: 'Admin Portal',
            icon: Shield,
            path: createPageUrl('AdminDashboard'),
            available: user?.role === 'admin' && onAdminDomain
        }
    ].filter(portal => portal.available);

    const handlePortalChange = (portalId) => {
        const portal = availablePortals.find(p => p.id === portalId);
        if (portal) {
            navigateToUrl(navigate, portal.path);
        }
    };

    const currentPortalData = availablePortals.find(p => p.id === currentPortal) || availablePortals[0];
    const CurrentIcon = currentPortalData.icon;

    return (
        <Select value={currentPortal} onValueChange={handlePortalChange}>
            <SelectTrigger className="w-full bg-slate-50 border-slate-200 hover:bg-slate-100 transition-colors h-10">
                <div className="flex items-center gap-2">
                    <CurrentIcon className="w-4 h-4 text-slate-600" />
                    <SelectValue />
                </div>
            </SelectTrigger>
            <SelectContent>
                {availablePortals.map((portal) => (
                    <SelectItem key={portal.id} value={portal.id}>
                        {portal.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
