import React, { useState, useEffect } from 'react';
import { useUser } from '@ifs/shared/components/providers/UserProvider';
import OrgPortalSidebar from '../components/portal/OrgPortalSidebar';
import { Button } from '@ifs/shared/components/ui/button';
import { Input } from '@ifs/shared/components/ui/input';
import { Label } from '@ifs/shared/components/ui/label';
import { Textarea } from '@ifs/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ifs/shared/components/ui/select";
import { Loader2, Building2, Save, Upload, X } from 'lucide-react';
import { useToast } from "@ifs/shared/components/ui/use-toast";
import { Toaster } from "@ifs/shared/components/ui/toaster";
import { base44 } from '@ifs/shared/api/base44Client';

const SECTORS = [
    'Education',
    'Healthcare',
    'Social Care',
    'Local Authority',
    'Charity',
    'Private',
    'Other'
];

const SUBSECTORS = {
    'Education': [
        'Early Years',
        'Primary',
        'Secondary',
        'Further Education',
        'Higher Education',
        'Alternative Provision',
        'Special Educational Needs',
        'Multi-Academy Trust',
        'Independent School',
        'Other Education'
    ],
    'Healthcare': [
        'NHS Trust',
        'GP Practice',
        'Mental Health Services',
        'Community Health',
        'Private Healthcare',
        'Other Healthcare'
    ],
    'Social Care': [
        'Children\'s Services',
        'Adult Services',
        'Residential Care',
        'Fostering & Adoption',
        'Other Social Care'
    ],
    'Local Authority': [
        'Children\'s Services',
        'Adult Services',
        'Community Safety',
        'Housing',
        'Other Local Authority'
    ],
    'Charity': [
        'Children & Young People',
        'Vulnerable Adults',
        'Community Support',
        'Faith-based',
        'Other Charity'
    ],
    'Private': [
        'Consultancy',
        'Training Provider',
        'Corporate',
        'Other Private'
    ],
    'Other': []
};

export default function OrgProfile() {
    const { user, loading: userLoading } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { toast } = useToast();
    const [organisation, setOrganisation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        logoUrl: '',
        website: '',
        sector: '',
        subsector: '',
        address: '',
        city: '',
        postcode: '',
        country: 'United Kingdom',
        phoneNumber: '',
        primaryContactName: '',
        primaryContactEmail: ''
    });

    useEffect(() => {
        if (!userLoading && user?.organisationId) {
            fetchOrganisation();
        }
    }, [userLoading, user?.organisationId]);

    const fetchOrganisation = async () => {
        try {
            setLoading(true);
            const orgs = await base44.entities.Organisation.filter({ id: user.organisationId });
            const org = orgs[0];
            setOrganisation(org);
            setFormData({
                name: org.name || '',
                description: org.description || '',
                logoUrl: org.logoUrl || '',
                website: org.website || '',
                sector: org.sector || '',
                subsector: org.subsector || '',
                address: org.address || '',
                city: org.city || '',
                postcode: org.postcode || '',
                country: org.country || 'United Kingdom',
                phoneNumber: org.phoneNumber || '',
                primaryContactName: org.primaryContactName || '',
                primaryContactEmail: org.primaryContactEmail || ''
            });
        } catch (error) {
            console.error("Failed to fetch organisation:", error);
            toast({ 
                title: 'Error', 
                description: 'Could not load organisation data.', 
                variant: 'destructive' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast({ 
                title: 'Invalid file', 
                description: 'Please upload an image file.', 
                variant: 'destructive' 
            });
            return;
        }

        try {
            setUploadingLogo(true);
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            handleInputChange('logoUrl', file_url);
            toast({ 
                title: 'Logo uploaded', 
                description: 'Logo uploaded successfully.' 
            });
        } catch (error) {
            console.error('Failed to upload logo:', error);
            toast({ 
                title: 'Upload failed', 
                description: 'Could not upload logo.', 
                variant: 'destructive' 
            });
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast({ 
                title: 'Validation error', 
                description: 'Organisation name is required.', 
                variant: 'destructive' 
            });
            return;
        }

        try {
            setSaving(true);
            await base44.entities.Organisation.update(organisation.id, formData);
            toast({ 
                title: 'Profile updated', 
                description: 'Organisation profile saved successfully.' 
            });
            await fetchOrganisation();
        } catch (error) {
            console.error('Failed to update organisation:', error);
            toast({ 
                title: 'Update failed', 
                description: 'Could not save changes.', 
                variant: 'destructive' 
            });
        } finally {
            setSaving(false);
        }
    };

    if (userLoading || loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
            </div>
        );
    }

    if (!user || !organisation || (user.organisationRole !== 'Admin' && user.role !== 'admin')) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
                    <p className="text-slate-600">Only organisation admins can edit the profile.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50/30">
            <Toaster />
            <OrgPortalSidebar 
                organisation={organisation}
                user={user} 
                sidebarOpen={sidebarOpen} 
                setSidebarOpen={setSidebarOpen} 
                currentPage="OrgProfile" 
            />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto bg-slate-50">
                    <div className="max-w-4xl mx-auto px-6 md:px-8 py-12">
                        <div className="mb-12">
                            <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Organisation Profile</h1>
                            <p className="text-lg text-slate-600">Manage your organisation's public information and settings</p>
                        </div>

                        <div className="space-y-8">
                            {/* Logo Section */}
                            <div className="bg-white border border-slate-200 shadow-sm">
                                <div className="border-b border-slate-200 px-8 py-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Logo & Branding</h2>
                                        <p className="text-sm text-slate-500 mt-0.5">Upload your organisation's logo</p>
                                    </div>
                                </div>
                                <div className="p-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-32 h-32 border-2 border-slate-200 rounded-lg flex items-center justify-center bg-slate-50 flex-shrink-0">
                                            {formData.logoUrl ? (
                                                <img 
                                                    src={formData.logoUrl} 
                                                    alt="Organisation Logo" 
                                                    className="w-full h-full object-contain p-2"
                                                />
                                            ) : (
                                                <Building2 className="w-12 h-12 text-slate-300" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                id="logo-upload"
                                                accept="image/*"
                                                onChange={handleLogoUpload}
                                                className="hidden"
                                            />
                                            <div className="flex gap-3">
                                                <Button
                                                    onClick={() => document.getElementById('logo-upload').click()}
                                                    disabled={uploadingLogo}
                                                    variant="outline"
                                                    className="border-slate-300"
                                                >
                                                    {uploadingLogo ? (
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    ) : (
                                                        <Upload className="w-4 h-4 mr-2" />
                                                    )}
                                                    {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                                                </Button>
                                                {formData.logoUrl && (
                                                    <Button
                                                        onClick={() => handleInputChange('logoUrl', '')}
                                                        variant="outline"
                                                        className="border-slate-300 text-slate-600"
                                                    >
                                                        <X className="w-4 h-4 mr-2" />
                                                        Remove
                                                    </Button>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 mt-2">Recommended: Square image, at least 200x200px</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Basic Information */}
                            <div className="bg-white border border-slate-200 shadow-sm">
                                <div className="border-b border-slate-200 px-8 py-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Basic Information</h2>
                                        <p className="text-sm text-slate-500 mt-0.5">Core details about your organisation</p>
                                    </div>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div>
                                        <Label htmlFor="name" className="text-sm font-semibold text-slate-900">
                                            Organisation Name <span className="text-red-600">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            className="mt-2 border-slate-300"
                                            placeholder="Enter organisation name"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="description" className="text-sm font-semibold text-slate-900">
                                            Description
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            className="mt-2 border-slate-300 min-h-[120px]"
                                            placeholder="Brief description of your organisation"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label htmlFor="sector" className="text-sm font-semibold text-slate-900">
                                                Sector
                                            </Label>
                                            <Select 
                                                value={formData.sector} 
                                                onValueChange={(value) => {
                                                    handleInputChange('sector', value);
                                                    handleInputChange('subsector', '');
                                                }}
                                            >
                                                <SelectTrigger className="mt-2 border-slate-300">
                                                    <SelectValue placeholder="Select sector" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {SECTORS.map(sector => (
                                                        <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="subsector" className="text-sm font-semibold text-slate-900">
                                                Subsector
                                            </Label>
                                            <Select 
                                                value={formData.subsector} 
                                                onValueChange={(value) => handleInputChange('subsector', value)}
                                                disabled={!formData.sector || SUBSECTORS[formData.sector]?.length === 0}
                                            >
                                                <SelectTrigger className="mt-2 border-slate-300">
                                                    <SelectValue placeholder="Select subsector" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {formData.sector && SUBSECTORS[formData.sector]?.map(subsector => (
                                                        <SelectItem key={subsector} value={subsector}>{subsector}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="website" className="text-sm font-semibold text-slate-900">
                                            Website
                                        </Label>
                                        <Input
                                            id="website"
                                            type="url"
                                            value={formData.website}
                                            onChange={(e) => handleInputChange('website', e.target.value)}
                                            className="mt-2 border-slate-300"
                                            placeholder="https://example.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="bg-white border border-slate-200 shadow-sm">
                                <div className="border-b border-slate-200 px-8 py-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Contact Information</h2>
                                        <p className="text-sm text-slate-500 mt-0.5">How people can reach your organisation</p>
                                    </div>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label htmlFor="primaryContactName" className="text-sm font-semibold text-slate-900">
                                                Primary Contact Name
                                            </Label>
                                            <Input
                                                id="primaryContactName"
                                                value={formData.primaryContactName}
                                                onChange={(e) => handleInputChange('primaryContactName', e.target.value)}
                                                className="mt-2 border-slate-300"
                                                placeholder="Contact person name"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="primaryContactEmail" className="text-sm font-semibold text-slate-900">
                                                Primary Contact Email
                                            </Label>
                                            <Input
                                                id="primaryContactEmail"
                                                type="email"
                                                value={formData.primaryContactEmail}
                                                onChange={(e) => handleInputChange('primaryContactEmail', e.target.value)}
                                                className="mt-2 border-slate-300"
                                                placeholder="contact@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="phoneNumber" className="text-sm font-semibold text-slate-900">
                                            Phone Number
                                        </Label>
                                        <Input
                                            id="phoneNumber"
                                            type="tel"
                                            value={formData.phoneNumber}
                                            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                            className="mt-2 border-slate-300"
                                            placeholder="+44 20 1234 5678"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="bg-white border border-slate-200 shadow-sm">
                                <div className="border-b border-slate-200 px-8 py-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Address</h2>
                                        <p className="text-sm text-slate-500 mt-0.5">Physical location of your organisation</p>
                                    </div>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div>
                                        <Label htmlFor="address" className="text-sm font-semibold text-slate-900">
                                            Street Address
                                        </Label>
                                        <Input
                                            id="address"
                                            value={formData.address}
                                            onChange={(e) => handleInputChange('address', e.target.value)}
                                            className="mt-2 border-slate-300"
                                            placeholder="Street address"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <Label htmlFor="city" className="text-sm font-semibold text-slate-900">
                                                City
                                            </Label>
                                            <Input
                                                id="city"
                                                value={formData.city}
                                                onChange={(e) => handleInputChange('city', e.target.value)}
                                                className="mt-2 border-slate-300"
                                                placeholder="City"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="postcode" className="text-sm font-semibold text-slate-900">
                                                Postcode
                                            </Label>
                                            <Input
                                                id="postcode"
                                                value={formData.postcode}
                                                onChange={(e) => handleInputChange('postcode', e.target.value)}
                                                className="mt-2 border-slate-300"
                                                placeholder="Postcode"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="country" className="text-sm font-semibold text-slate-900">
                                                Country
                                            </Label>
                                            <Input
                                                id="country"
                                                value={formData.country}
                                                onChange={(e) => handleInputChange('country', e.target.value)}
                                                className="mt-2 border-slate-300"
                                                placeholder="Country"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Membership Badges */}
                            <div className="bg-white border border-slate-200 shadow-sm">
                                <div className="border-b border-slate-200 px-8 py-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Membership Badges</h2>
                                        <p className="text-sm text-slate-500 mt-0.5">Download badges to display on your website</p>
                                    </div>
                                </div>
                                <div className="p-8">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        {/* Dark Badge */}
                                        <div className="space-y-4">
                                            <div className="w-full aspect-square bg-slate-100 rounded-lg p-8 flex items-center justify-center">
                                                <img 
                                                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/baaa276c6_2.png"
                                                    alt="IfS Member Badge - Dark"
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-semibold text-slate-900 mb-2">Dark Badge</p>
                                                <Button
                                                    variant="outline"
                                                    className="w-full border-slate-300"
                                                    onClick={() => {
                                                        const link = document.createElement('a');
                                                        link.href = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/baaa276c6_2.png';
                                                        link.download = 'ifs-member-badge-dark.png';
                                                        link.click();
                                                    }}
                                                >
                                                    Download
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Light Badge */}
                                        <div className="space-y-4">
                                            <div className="w-full aspect-square bg-slate-100 rounded-lg p-8 flex items-center justify-center border border-slate-200">
                                                <img 
                                                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/5cb8005a9_3.png"
                                                    alt="IfS Member Badge - Light"
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-semibold text-slate-900 mb-2">Light Badge</p>
                                                <Button
                                                    variant="outline"
                                                    className="w-full border-slate-300"
                                                    onClick={() => {
                                                        const link = document.createElement('a');
                                                        link.href = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/5cb8005a9_3.png';
                                                        link.download = 'ifs-member-badge-light.png';
                                                        link.click();
                                                    }}
                                                >
                                                    Download
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                                        <p className="text-sm text-slate-600">
                                            <strong>Usage:</strong> Display these badges on your website to show your organisation's membership with the Independent Federation for Safeguarding.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={fetchOrganisation}
                                    className="border-slate-300"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="bg-slate-900 hover:bg-slate-800 text-white"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}