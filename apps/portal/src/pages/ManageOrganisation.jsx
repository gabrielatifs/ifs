import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@ifs/shared/components/providers/UserProvider';
import OrgPortalSidebar from '../components/portal/OrgPortalSidebar';
import PortalHeader from '../components/portal/PortalHeader';
import { Button } from '@ifs/shared/components/ui/button';
import { Input } from '@ifs/shared/components/ui/input';
import { Label } from '@ifs/shared/components/ui/label';
import { Textarea } from '@ifs/shared/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@ifs/shared/components/ui/card';
import { Loader2, PlusCircle, Building2, Save, Upload, Users, Send, Mail, LogIn, ArrowLeft, Crown, UserPlus } from 'lucide-react';
import { useToast } from "@ifs/shared/components/ui/use-toast";
import { Toaster } from "@ifs/shared/components/ui/toaster";
import { Organisation } from '@ifs/shared/api/entities';
import { User } from '@ifs/shared/api/entities';
import { UploadFile } from '@ifs/shared/api/integrations';
import { inviteOrgMember } from '@ifs/shared/api/functions';
import { getOrganisationMembers } from '@ifs/shared/api/functions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ifs/shared/components/ui/tabs";
import { OrgInvite } from '@ifs/shared/api/entities';


import { ifs } from '@ifs/shared/api/ifsClient';

const CreateOrganisationForm = ({ user, onOrganisationCreated, onCancel }) => {
    const [formData, setFormData] = useState({ 
        name: user.organisationName || '', 
        description: '', 
        website: '', 
        sector: user.sector || '', 
        logoUrl: '' 
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newLogo, setNewLogo] = useState(null);
    const { toast } = useToast();

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setNewLogo(file);
            setFormData(prev => ({ ...prev, logoUrl: URL.createObjectURL(file) }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        console.log('[DEBUG] Starting organisation creation...');
        console.log('[DEBUG] Form data:', formData);
        console.log('[DEBUG] Current user:', user);
        
        try {
            let finalLogoUrl = formData.logoUrl;
            if (newLogo) {
                console.log('[DEBUG] Uploading logo...');
                const { file_url } = await UploadFile({ file: newLogo });
                finalLogoUrl = file_url;
                console.log('[DEBUG] Logo uploaded:', finalLogoUrl);
            }

            console.log('[DEBUG] Creating organisation entity...');
            const newOrg = await Organisation.create({
                ...formData,
                logoUrl: finalLogoUrl,
                primaryContactId: user.id,
                primaryContactName: user.displayName || user.full_name,
            });
            console.log('[DEBUG] Organisation created successfully:', newOrg);

            console.log('[DEBUG] Updating user with organisationId:', newOrg.id);
            await User.updateMyUserData({
                organisationId: newOrg.id,
                organisationRole: 'Admin',
            });
            console.log('[DEBUG] User updated successfully');

            toast({ title: "Success", description: "Your organisation has been created." });
            console.log('[DEBUG] Calling onOrganisationCreated callback...');
            onOrganisationCreated();
        } catch (error) {
            console.error("[DEBUG] Failed to create organisation:", error);
            toast({ title: "Error", description: "Could not create organisation. Please try again.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle>Step 1: Create an Organisation Profile</CardTitle>
                    <CardDescription>Set up your organisation's profile to manage members and access team benefits.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <Label htmlFor="logo-upload" className="cursor-pointer">
                            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center border-2 border-dashed hover:bg-slate-200">
                                {formData.logoUrl ? <img src={formData.logoUrl} alt="Logo Preview" className="w-full h-full object-cover rounded-full" /> : <Upload className="w-8 h-8 text-slate-400" />}
                            </div>
                        </Label>
                        <Input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        <div className="space-y-1">
                            <Label>Organisation Logo</Label>
                            <p className="text-sm text-slate-500">Upload a JPG, PNG, or SVG. Square format recommended.</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">Organisation Name *</Label>
                        <Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <Input id="website" type="url" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sector">Sector</Label>
                            <Input id="sector" value={formData.sector} onChange={e => setFormData({ ...formData, sector: e.target.value })} />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="justify-between">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Create Organisation
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};

const InviteMembersForm = ({ organisationId, onMemberInvited, onFinish, isSetupFlow = false }) => {
    const { toast } = useToast();
    const [isInviting, setIsInviting] = useState(false);
    const [activeTab, setActiveTab] = useState('manual');
    const [manualEmails, setManualEmails] = useState('');
    const [csvFile, setCsvFile] = useState(null);
    const [csvFileName, setCsvFileName] = useState('');

    const parseEmails = (input) => {
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const foundEmails = input.match(emailRegex);
        return foundEmails ? Array.from(new Set(foundEmails.map(email => email.trim().toLowerCase()))) : [];
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'text/csv') {
            setCsvFile(file);
            setCsvFileName(file.name);
        } else {
            toast({ title: "Invalid File", description: "Please upload a valid .csv file.", variant: "destructive" });
            setCsvFile(null);
            setCsvFileName('');
        }
        e.target.value = '';
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        setIsInviting(true);
        let emailsToInvite = [];

        if (activeTab === 'manual') {
            emailsToInvite = parseEmails(manualEmails);
        } else if (activeTab === 'csv' && csvFile) {
            try {
                const fileContent = await csvFile.text();
                emailsToInvite = parseEmails(fileContent);
            } catch (error) {
                toast({ title: "CSV Error", description: "Could not read the CSV file.", variant: "destructive" });
                setIsInviting(false);
                return;
            }
        }

        if (emailsToInvite.length === 0) {
            toast({ title: "No Emails", description: "Please provide at least one valid email address to invite.", variant: "destructive" });
            setIsInviting(false);
            return;
        }

        try {
            console.log('[DEBUG - Frontend] About to call inviteOrgMember function');
            console.log('[DEBUG - Frontend] Payload:', {
                inviteeEmails: emailsToInvite,
                organisationId: organisationId,
                emailCount: emailsToInvite.length
            });
            
            const response = await inviteOrgMember({ 
                inviteeEmails: emailsToInvite,
                organisationId: organisationId 
            });
            
            console.log('[DEBUG - Frontend] Raw response from inviteOrgMember:', response);
            console.log('[DEBUG - Frontend] Response data:', response.data);
            console.log('[DEBUG - Frontend] Response status:', response.status);
            
            const { data } = response;
            
            if (data.success) {
                console.log('[DEBUG - Frontend] ✓ Success response received');
                toast({ title: "Success", description: data.message });
                setManualEmails('');
                setCsvFile(null);
                setCsvFileName('');
                if (onMemberInvited) onMemberInvited();
                if (isSetupFlow) onFinish();
            } else {
                console.error('[DEBUG - Frontend] ✗ Error in response data:', data.error);
                throw new Error(data.error || "Failed to send invitations.");
            }
        } catch (error) {
            console.error('[DEBUG - Frontend] ✗ Exception caught in invitation process');
            console.error('[DEBUG - Frontend] Error type:', error.constructor.name);
            console.error('[DEBUG - Frontend] Error message:', error.message);
            console.error('[DEBUG - Frontend] Full error:', error);
            console.error('[DEBUG - Frontend] Error response:', error.response);
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsInviting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Mail className="w-5 h-5" /> {isSetupFlow ? "Step 2: Invite Your Team" : "Invite New Members"}</CardTitle>
                <CardDescription>Invite colleagues to join your organisation on the IfS platform. {isSetupFlow && "You can always do this later."}</CardDescription>
            </CardHeader>
            <form onSubmit={handleInvite}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                        <TabsTrigger value="csv">Upload CSV</TabsTrigger>
                    </TabsList>
                    <CardContent className="pt-6">
                        <TabsContent value="manual">
                            <Label htmlFor="manualEmails">Email Addresses</Label>
                            <Textarea
                                id="manualEmails"
                                placeholder="Enter emails separated by commas, spaces, or new lines."
                                value={manualEmails}
                                onChange={e => setManualEmails(e.target.value)}
                                className="mt-1 min-h-[120px]"
                            />
                        </TabsContent>
                        <TabsContent value="csv">
                            <Label htmlFor="csvUpload">Upload a .csv file</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <Input
                                    id="csvUpload"
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <Label htmlFor="csvUpload" className="flex-grow">
                                    <div className="cursor-pointer border border-dashed border-slate-300 rounded-md p-2 text-center text-slate-500 hover:bg-slate-50">
                                        {csvFileName ? `Selected: ${csvFileName}` : "Click to choose a file"}
                                    </div>
                                </Label>
                            </div>
                             <p className="text-xs text-slate-500 mt-2">Your CSV should contain email addresses, one per line or separated by commas. Other data will be ignored.</p>
                        </TabsContent>
                    </CardContent>
                </Tabs>
                <CardFooter className={isSetupFlow ? "justify-between" : ""}>
                    {isSetupFlow ? (
                         <>
                            <Button type="button" variant="ghost" onClick={onFinish}>
                                Skip for Now
                            </Button>
                            <Button type="submit" disabled={isInviting}>
                                {isInviting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                                Send Invitations & Finish
                            </Button>
                        </>
                    ) : (
                        <Button type="submit" disabled={isInviting} className="w-full">
                            {isInviting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                            Send Invitations
                        </Button>
                    )}
                </CardFooter>
            </form>
        </Card>
    );
};




const ManageOrganisationView = ({ organisation, members, user }) => {
    const isMemberOrg = organisation.organisationType === 'member';
    const totalSeats = organisation.totalSeats || 0;
    const usedSeats = organisation.usedSeats || 0;
    const availableSeats = totalSeats - usedSeats;
    const isAdmin = user.organisationRole === 'Admin';

    const fullMembers = members.filter(m => m.membershipType === 'Full').length;
    const associateMembers = members.filter(m => m.membershipType === 'Associate').length;

    // Member View - simplified dashboard for non-admin members
    if (!isAdmin) {
        return (
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Organisation Info */}
                <div className="lg:col-span-2 bg-white border-t-4 border-t-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {organisation.logoUrl && (
                            <div className="w-24 h-24 bg-slate-50 border border-slate-200 flex-shrink-0 flex items-center justify-center p-3">
                                <img 
                                    src={organisation.logoUrl} 
                                    alt={`${organisation.name} logo`}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        )}
                        <div className="flex-1">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3 block">
                                {isMemberOrg ? 'Member Organisation' : 'Registered Organisation'}
                            </span>
                            <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">{organisation.name}</h2>
                            {organisation.description && (
                                <p className="text-slate-600 leading-relaxed font-light max-w-3xl">{organisation.description}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Your Membership */}
                <div className="bg-white border border-slate-200 p-8 hover:border-slate-300 transition-all">
                    <div className="mb-6">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 block">Your Status</span>
                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Your Membership</h3>
                    </div>
                    <div className="w-12 h-px bg-slate-200 mb-6"></div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm text-slate-600 font-light">Membership Type</span>
                            <span className="text-xl font-semibold text-slate-900 font-sans">{user.membershipType || 'Associate'}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm text-slate-600 font-light">Organisation Role</span>
                            <span className="text-xl font-semibold text-slate-900 font-sans">{user.organisationRole || 'Member'}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm text-slate-600 font-light">Status</span>
                            <span className="text-xl font-semibold text-green-600 font-sans capitalize">{user.membershipStatus || 'active'}</span>
                        </div>
                    </div>
                </div>

                {/* Team Overview */}
                <div className="bg-white border border-slate-200 p-8 hover:border-slate-300 transition-all">
                    <div className="mb-6">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 block">Team Information</span>
                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Your Colleagues</h3>
                    </div>
                    <div className="w-12 h-px bg-slate-200 mb-6"></div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm text-slate-600 font-light">Total Members</span>
                            <span className="text-2xl font-bold text-slate-900 font-sans">{members.length}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm text-slate-600 font-light">Full Members</span>
                            <span className="text-xl font-semibold text-slate-900 font-sans">{fullMembers}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm text-slate-600 font-light">Associate Members</span>
                            <span className="text-xl font-semibold text-slate-900 font-sans">{associateMembers}</span>
                        </div>
                    </div>
                </div>

                {/* Support CTA */}
                <div className="lg:col-span-2 bg-white border border-slate-200 p-10 hover:border-slate-300 transition-all">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-16 h-16 bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <Mail className="w-8 h-8 text-slate-600" />
                        </div>
                        <div className="flex-1">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 block">Need Help?</span>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
                                Contact Support
                            </h3>
                            <p className="text-sm text-slate-600 font-light leading-relaxed mb-6 max-w-3xl">
                                Get assistance with your membership, training, or organization questions. Our support team is here to help.
                            </p>
                            <Button 
                                className="h-12 bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-semibold tracking-[0.1em] uppercase transition-all"
                                onClick={() => window.location.href = '/Support'}
                            >
                                Contact Support
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Admin View - full dashboard with management capabilities
    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Info Card - Full width institutional style */}
            <div className="lg:col-span-3 bg-white border-t-4 border-t-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {organisation.logoUrl && (
                        <div className="w-24 h-24 bg-slate-50 border border-slate-200 flex-shrink-0 flex items-center justify-center p-3">
                            <img 
                                src={organisation.logoUrl} 
                                alt={`${organisation.name} logo`}
                                className="w-full h-full object-contain"
                            />
                        </div>
                    )}
                    <div className="flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3 block">
                            {isMemberOrg ? 'Member Organisation' : 'Registered Organisation'}
                        </span>
                        <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">{organisation.name}</h2>
                        {organisation.description && (
                            <p className="text-slate-600 leading-relaxed font-light max-w-3xl">{organisation.description}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Team Stats - Institutional style */}
            <div className="bg-white border border-slate-200 p-8 hover:border-slate-300 transition-all">
                <div className="mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 block">Team Overview</span>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Your Team</h3>
                </div>
                <div className="w-12 h-px bg-slate-200 mb-6"></div>
                <div className="space-y-4">
                    <div className="flex justify-between items-baseline">
                        <span className="text-sm text-slate-600 font-light">Total Members</span>
                        <span className="text-2xl font-bold text-slate-900 font-sans">{members.length}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                        <span className="text-sm text-slate-600 font-light">Full Members</span>
                        <span className="text-xl font-semibold text-slate-900 font-sans">{fullMembers}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                        <span className="text-sm text-slate-600 font-light">Associate Members</span>
                        <span className="text-xl font-semibold text-slate-900 font-sans">{associateMembers}</span>
                    </div>
                    {isMemberOrg && (
                        <>
                            <div className="h-px bg-slate-200 my-4"></div>
                            <div className="flex justify-between items-baseline">
                                <span className="text-sm text-slate-600 font-light">Available Seats</span>
                                <span className="text-xl font-semibold text-slate-900 font-sans">{availableSeats} of {totalSeats}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Upgrade CTA - Institutional style */}
            <div className="lg:col-span-2 bg-white border border-slate-200 p-10 hover:border-slate-300 transition-all">
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Crown className="w-6 h-6 text-slate-900" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Team Benefits</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">Give Your Team Full Membership</h3>
                    <p className="text-sm text-slate-600 font-light leading-relaxed">
                        {isMemberOrg 
                            ? `You have ${totalSeats} Full Member seat${totalSeats !== 1 ? 's' : ''} included in your subscription. Assign seats to team members to give them access to exclusive training, events, and CPD hours.`
                            : 'Upgrade your team members to Full Membership for £14/seat/month. Each Full Member gets 12 CPD hours per year, access to exclusive masterclasses, and more.'
                        }
                    </p>
                </div>
                
                <div className="w-12 h-px bg-slate-200 mb-6"></div>
                
                <div className="space-y-4 mb-8">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Benefits Included</p>
                    <ul className="space-y-3">
                        <li className="flex items-baseline gap-3 text-sm">
                            <span className="w-1 h-1 bg-slate-300 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-slate-600 font-light">12 CPD hours per year for training & events</span>
                        </li>
                        <li className="flex items-baseline gap-3 text-sm">
                            <span className="w-1 h-1 bg-slate-300 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-slate-600 font-light">Access to exclusive masterclasses</span>
                        </li>
                        <li className="flex items-baseline gap-3 text-sm">
                            <span className="w-1 h-1 bg-slate-300 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-slate-600 font-light">Priority support & networking opportunities</span>
                        </li>
                        <li className="flex items-baseline gap-3 text-sm">
                            <span className="w-1 h-1 bg-slate-300 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-slate-600 font-light">Digital credentials & certificates</span>
                        </li>
                    </ul>
                </div>

                <Button 
                    className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-semibold tracking-[0.1em] uppercase transition-all"
                    onClick={() => window.location.href = '/OrgMembers'}
                >
                    Manage Team Members
                </Button>
            </div>

            {/* Account Manager CTA - Institutional style */}
            <div className="lg:col-span-3 bg-white border border-slate-200 p-10 hover:border-slate-300 transition-all">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-16 h-16 bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-8 h-8 text-slate-600" />
                    </div>
                    <div className="flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 block">Support Services</span>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
                            Schedule a Call with Your Account Manager
                        </h3>
                        <p className="text-sm text-slate-600 font-light leading-relaxed mb-6 max-w-3xl">
                            Get personalized support to maximize your organization's membership. Our team can help you with training planning, team onboarding, and making the most of your benefits.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Button 
                                className="h-12 bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-semibold tracking-[0.1em] uppercase transition-all"
                                onClick={() => window.location.href = 'mailto:support@instituteforsafeguarding.com?subject=Schedule a Call - ' + encodeURIComponent(organisation.name)}
                            >
                                Book a Free Consultation
                            </Button>
                            <Button 
                                variant="outline"
                                className="h-12 border-slate-200 hover:bg-slate-50 text-slate-600 text-[13px] font-semibold tracking-[0.1em] uppercase hover:border-slate-300 transition-all"
                                onClick={() => window.location.href = '/Support'}
                            >
                                Contact Support
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const OrganisationOptionsView = ({ setView }) => (
    <div className="space-y-8">
        <div className="text-center">
            <Building2 className="w-16 h-16 mx-auto text-slate-300" />
            <h2 className="mt-4 text-2xl font-bold text-slate-800">You are not part of an organisation yet</h2>
            <p className="mt-2 text-slate-600">Choose an option below to get started.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
            <Card className="flex flex-col">
                <CardHeader>
                    <div className="flex items-center justify-center w-12 h-12 bg-purple-100 text-purple-600 rounded-lg mb-4">
                        <PlusCircle className="w-6 h-6" />
                    </div>
                    <CardTitle>Create an Organisation</CardTitle>
                    <CardDescription>Set up a new profile for your organisation to invite and manage members.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow" />
                <CardFooter>
                    <Button className="w-full" onClick={() => setView('create')}>
                        Create Organisation
                    </Button>
                </CardFooter>
            </Card>

            <Card className="flex flex-col bg-slate-50">
                <CardHeader>
                    <div className="flex items-center justify-center w-12 h-12 bg-slate-200 text-slate-500 rounded-lg mb-4">
                        <LogIn className="w-6 h-6" />
                    </div>
                    <CardTitle>Join an Organisation</CardTitle>
                    <CardDescription>If your organisation already exists on IfS, an admin must invite you.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow text-sm text-slate-600">
                    <p>To join, ask an administrator from your organisation to send an invitation to your email address. Once they do, signing up or logging in will automatically connect you.</p>
                </CardContent>
                <CardFooter />
            </Card>
        </div>
    </div>
);


export default function ManageOrganisation() {
    const { user, loading: userLoading, refreshUser } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { toast } = useToast();
    const [organisation, setOrganisation] = useState(null);
    const [members, setMembers] = useState([]);
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('options');
    const [creationStep, setCreationStep] = useState(1);

    const fetchOrganisationData = useCallback(async (forceOrgId = null) => {
        const orgId = forceOrgId || user?.organisationId;
        
        console.log('[DEBUG] fetchOrganisationData called');
        console.log('[DEBUG] forceOrgId:', forceOrgId);
        console.log('[DEBUG] user?.organisationId:', user?.organisationId);
        console.log('[DEBUG] Final orgId to use:', orgId);
        
        if (!orgId) {
            console.log('[DEBUG] No orgId found, showing options view');
            setLoading(false);
            setView('options');
            setCreationStep(1);
            return;
        }
        
        try {
            setLoading(true);
            console.log('[DEBUG] Calling backend function to fetch organisation data...');
            
            const { data } = await getOrganisationMembers({ organisationId: orgId });
            
            if (data.success) {
                console.log('[DEBUG] Organisation data fetched successfully');
                setOrganisation(data.organisation);
                setMembers(data.members);
                setInvites(data.invites);
                console.log('[DEBUG] Members found:', data.members.length);
                console.log('[DEBUG] Invites found:', data.invites.length);
            } else {
                throw new Error(data.error || 'Failed to fetch organisation data');
            }
        } catch (error) {
            console.error("[DEBUG] Failed to fetch organisation data:", error);
            toast({ 
                title: 'Error', 
                description: 'Could not load your organisation details.', 
                variant: 'destructive' 
            });
            setOrganisation(null);
            setMembers([]);
            setInvites([]);
            setView('options');
        } finally {
            setLoading(false);
            console.log('[DEBUG] fetchOrganisationData completed');
        }
    }, [user, toast]);

    useEffect(() => {
        console.log('[DEBUG] Main useEffect triggered');
        console.log('[DEBUG] userLoading:', userLoading);
        console.log('[DEBUG] user:', user);
        console.log('[DEBUG] user?.organisationId:', user?.organisationId);
        
        if (!userLoading) {
            if (user?.organisationId) {
                console.log('[DEBUG] User has organisationId, fetching data...');
                fetchOrganisationData();
            } else {
                console.log('[DEBUG] User has no organisationId, showing options');
                setLoading(false);
                setView('options');
            }
        }
    }, [userLoading, user?.organisationId, fetchOrganisationData]);

    const handleOrgCreated = async () => {
        console.log('[DEBUG] handleOrgCreated called');
        console.log('[DEBUG] Calling refreshUser...');
        await refreshUser();
        console.log('[DEBUG] refreshUser completed');
        console.log('[DEBUG] Moving to step 2');
        setCreationStep(2);
    };
    
    const handleFinishSetup = async () => {
        console.log('[DEBUG] handleFinishSetup called');
        try {
            console.log('[DEBUG] Refreshing user...');
            await refreshUser();
            
            console.log('[DEBUG] Waiting 300ms for state propagation...');
            await new Promise(resolve => setTimeout(resolve, 300));
            
            console.log('[DEBUG] Fetching fresh user data...');
            const freshUser = await User.me();
            console.log('[DEBUG] Fresh user data:', freshUser);
            console.log('[DEBUG] Fresh user organisationId:', freshUser?.organisationId);
            
            if (freshUser?.organisationId) {
                console.log('[DEBUG] Fetching organisation with ID:', freshUser.organisationId);
                await fetchOrganisationData(freshUser.organisationId);
                
                console.log('[DEBUG] Resetting view and creation step');
                setView('options');
                setCreationStep(1);
                console.log('[DEBUG] Setup complete');
            } else {
                throw new Error('Organisation ID not found after creation');
            }
        } catch (error) {
            console.error('[DEBUG] Failed to complete organisation setup:', error);
            toast({
                title: 'Setup Error',
                description: 'Could not load your organisation. Please refresh the page.',
                variant: 'destructive'
            });
        }
    };

    console.log('[DEBUG] Render - Current state:');
    console.log('[DEBUG] - userLoading:', userLoading);
    console.log('[DEBUG] - loading:', loading);
    console.log('[DEBUG] - view:', view);
    console.log('[DEBUG] - creationStep:', creationStep);
    console.log('[DEBUG] - organisation:', organisation);
    console.log('[DEBUG] - user?.organisationId:', user?.organisationId);

    if (userLoading || loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
            </div>
        );
    }

    if (!user) return null;

    const renderCreationFlow = () => {
        console.log('[DEBUG] renderCreationFlow called, step:', creationStep);
        if (creationStep === 1) {
            return (
                <CreateOrganisationForm
                    user={user}
                    onOrganisationCreated={handleOrgCreated}
                    onCancel={() => {
                        setView('options');
                        setCreationStep(1);
                    }}
                />
            );
        }
        if (creationStep === 2) {
            return (
                <InviteMembersForm
                    organisationId={user.organisationId}
                    onMemberInvited={fetchOrganisationData}
                    onFinish={handleFinishSetup}
                    isSetupFlow={true}
                />
            );
        }
        return null;
    };

    return (
        <div className="flex h-screen bg-slate-50/30">
            <Toaster />
            <OrgPortalSidebar 
                organisation={organisation}
                user={user} 
                sidebarOpen={sidebarOpen} 
                setSidebarOpen={setSidebarOpen} 
                currentPage="ManageOrganisation" 
            />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <PortalHeader
                    setSidebarOpen={setSidebarOpen}
                    user={user}
                    currentPortal="organisation"
                />
                <main className="flex-1 overflow-y-auto p-6 md:p-8 pb-20 md:pb-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-10">
                            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                                Welcome back, {user?.firstName || user?.displayName?.split(' ')[0] || user?.full_name?.split(' ')[0] || 'there'}
                            </h1>
                            <p className="text-lg text-slate-600 mt-2">Your organisation dashboard</p>
                        </div>
                        
                        {organisation ? (
                            <ManageOrganisationView 
                                organisation={organisation} 
                                members={members} 
                                user={user} 
                            />
                        ) : view === 'options' ? (
                            <OrganisationOptionsView setView={setView} />
                        ) : (
                           renderCreationFlow()
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}