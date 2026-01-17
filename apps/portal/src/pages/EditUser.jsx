
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@ifs/shared/api/entities';
import { EventSignup } from '@ifs/shared/api/entities';
import { DigitalCredential } from '@ifs/shared/api/entities';
import { createPageUrl, navigateToUrl } from '@ifs/shared/utils';
import { Button } from '@ifs/shared/components/ui/button';
import { Input } from '@ifs/shared/components/ui/input';
import { Label } from '@ifs/shared/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ifs/shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ifs/shared/components/ui/select';
import { useToast } from "@ifs/shared/components/ui/use-toast";
import { Toaster } from "@ifs/shared/components/ui/toaster";
import { Loader2, Save, ArrowLeft, Award, Calendar, Download, ExternalLink, FileText, Shield, CheckCircle2 } from 'lucide-react';
import { useUser } from '@ifs/shared/components/providers/UserProvider';
import PortalSidebar from '../components/portal/PortalSidebar';
import PortalHeader from '../components/portal/PortalHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ifs/shared/components/ui/tabs";
import { Badge } from '@ifs/shared/components/ui/badge';
import { format } from 'date-fns';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@ifs/shared/components/ui/table";

export default function EditUser() {
    const { user: currentUser, loading: userLoading } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [targetUser, setTargetUser] = useState(null);
    const [signups, setSignups] = useState([]);
    const [credentials, setCredentials] = useState([]);
    const { toast } = useToast();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        displayName: '',
        firstName: '',
        lastName: '',
        email: '',
        membershipType: 'Applicant',
        membershipStatus: 'pending',
        organisationName: '',
        sector: '',
        subsector: '',
        safeguarding_role: '',
    });

    useEffect(() => {
        if (!userLoading && currentUser?.role !== 'admin') {
            navigate(createPageUrl('Dashboard'));
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('id');

        if (!userId) {
            toast({ title: "Error", description: "No user ID provided", variant: "destructive" });
            navigateToUrl(navigate, createPageUrl('AdminDashboard'));
            return;
        }

        const fetchUserData = async () => {
            setLoading(true);
            try {
                const [userData, userSignups, userCredentials] = await Promise.all([
                    User.get(userId),
                    EventSignup.filter({ userId: userId }),
                    DigitalCredential.filter({ userId: userId })
                ]);

                setTargetUser(userData);
                setSignups(userSignups);
                setCredentials(userCredentials);
                setFormData({
                    displayName: userData.displayName || '',
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || '',
                    email: userData.email || '',
                    membershipType: userData.membershipType || 'Applicant',
                    membershipStatus: userData.membershipStatus || 'pending',
                    organisationName: userData.organisationName || '',
                    sector: userData.sector || '',
                    subsector: userData.subsector || '',
                    safeguarding_role: userData.safeguarding_role || '',
                });
            } catch (error) {
                console.error('Failed to fetch user:', error);
                toast({ title: "Error", description: "Failed to load user data", variant: "destructive" });
                navigateToUrl(navigate, createPageUrl('AdminDashboard'));
            } finally {
                setLoading(false);
            }
        };

        if (!userLoading && currentUser?.role === 'admin') {
            fetchUserData();
        }
    }, [userLoading, currentUser, navigate, toast]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await User.update(targetUser.id, formData);
            toast({ title: "Success", description: "User updated successfully" });
            navigateToUrl(navigate, createPageUrl('AdminDashboard'));
        } catch (error) {
            console.error('Failed to update user:', error);
            toast({ title: "Error", description: "Failed to update user", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleViewCredential = (verificationCode) => {
        window.open(`${createPageUrl('VerifyCredential')}?code=${verificationCode}`, '_blank');
    };

    if (userLoading || loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
            </div>
        );
    }

    if (!currentUser || currentUser.role !== 'admin') {
        return null;
    }

    const upcomingSignups = signups.filter(s => new Date(s.eventDate) >= new Date());
    const pastSignups = signups.filter(s => new Date(s.eventDate) < new Date());

    // Categorize credentials
    const activeCredentials = credentials.filter(c => c.status === 'active');
    const revokedCredentials = credentials.filter(c => c.status === 'revoked');
    const expiredCredentials = credentials.filter(c => c.status === 'expired');

    const getCredentialTypeColor = (type) => {
        switch (type) {
            case 'Full Membership':
                return 'bg-purple-100 text-purple-800 border-purple-300';
            case 'Associate Membership':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'Workshop Attendance':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'Course Completion':
                return 'bg-orange-100 text-orange-800 border-orange-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-800 border-green-300"><CheckCircle2 className="w-3 h-3 mr-1" />Active</Badge>;
            case 'revoked':
                return <Badge variant="destructive">Revoked</Badge>;
            case 'expired':
                return <Badge variant="outline" className="text-orange-600">Expired</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <Toaster />
            <PortalSidebar user={currentUser} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="AdminDashboard" />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <PortalHeader setSidebarOpen={setSidebarOpen} user={currentUser} />
                
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="max-w-5xl mx-auto">
                        <div className="mb-6">
                            <Button variant="ghost" onClick={() => navigateToUrl(navigate, createPageUrl('AdminDashboard'))} className="mb-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </Button>
                            <h1 className="text-3xl font-bold text-slate-900">Edit User</h1>
                            <p className="text-slate-600 mt-1">Manage user profile and membership details</p>
                        </div>

                        <Tabs defaultValue="details" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="details">Details</TabsTrigger>
                                <TabsTrigger value="credentials">
                                    Digital Credentials ({activeCredentials.length})
                                </TabsTrigger>
                                <TabsTrigger value="signups">
                                    Event Signups ({signups.length})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="details" className="mt-6 space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Personal Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="firstName">First Name</Label>
                                                <Input
                                                    id="firstName"
                                                    value={formData.firstName}
                                                    onChange={(e) => handleChange('firstName', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="lastName">Last Name</Label>
                                                <Input
                                                    id="lastName"
                                                    value={formData.lastName}
                                                    onChange={(e) => handleChange('lastName', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="displayName">Display Name</Label>
                                            <Input
                                                id="displayName"
                                                value={formData.displayName}
                                                onChange={(e) => handleChange('displayName', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                disabled
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Membership Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="membershipType">Membership Type</Label>
                                                <Select value={formData.membershipType} onValueChange={(value) => handleChange('membershipType', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Applicant">Applicant</SelectItem>
                                                        <SelectItem value="Associate">Associate</SelectItem>
                                                        <SelectItem value="Full">Full</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="membershipStatus">Membership Status</Label>
                                                <Select value={formData.membershipStatus} onValueChange={(value) => handleChange('membershipStatus', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                        <SelectItem value="active">Active</SelectItem>
                                                        <SelectItem value="rejected">Rejected</SelectItem>
                                                        <SelectItem value="expired">Expired</SelectItem>
                                                        <SelectItem value="canceled">Canceled</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Professional Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="organisationName">Organisation</Label>
                                            <Input
                                                id="organisationName"
                                                value={formData.organisationName}
                                                onChange={(e) => handleChange('organisationName', e.target.value)}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="sector">Sector</Label>
                                                <Input
                                                    id="sector"
                                                    value={formData.sector}
                                                    onChange={(e) => handleChange('sector', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="subsector">Sub-sector</Label>
                                                <Input
                                                    id="subsector"
                                                    value={formData.subsector}
                                                    onChange={(e) => handleChange('subsector', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="safeguarding_role">Safeguarding Role</Label>
                                            <Input
                                                id="safeguarding_role"
                                                value={formData.safeguarding_role}
                                                onChange={(e) => handleChange('safeguarding_role', e.target.value)}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="flex justify-end gap-4">
                                    <Button variant="outline" onClick={() => navigateToUrl(navigate, createPageUrl('AdminDashboard'))}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSave} disabled={saving}>
                                        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </Button>
                                </div>
                            </TabsContent>

                            <TabsContent value="credentials" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-purple-600" />
                                            Digital Credentials
                                        </CardTitle>
                                        <CardDescription>Verified professional credentials and achievements</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {credentials.length === 0 ? (
                                            <div className="text-center py-12">
                                                <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                                <p className="text-slate-600">No digital credentials yet</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {/* Active Credentials */}
                                                {activeCredentials.length > 0 && (
                                                    <div>
                                                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                            Active Credentials ({activeCredentials.length})
                                                        </h3>
                                                        <div className="space-y-3">
                                                            {activeCredentials.map((credential) => (
                                                                <div key={credential.id} className="flex items-start justify-between p-4 border-2 border-slate-200 rounded-lg hover:border-purple-300 hover:bg-slate-50 transition-all">
                                                                    <div className="flex items-start gap-3 flex-1">
                                                                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                            <Award className="w-6 h-6 text-purple-600" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <Badge className={getCredentialTypeColor(credential.credentialType)}>
                                                                                    {credential.credentialType}
                                                                                </Badge>
                                                                                {getStatusBadge(credential.status)}
                                                                            </div>
                                                                            <p className="font-semibold text-slate-900 mb-1">{credential.title}</p>
                                                                            <p className="text-sm text-slate-600 mb-2 line-clamp-2">{credential.description}</p>
                                                                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                                                                <span className="flex items-center gap-1">
                                                                                    <Calendar className="w-3 h-3" />
                                                                                    Issued: {format(new Date(credential.issuedDate), 'dd MMM yyyy')}
                                                                                </span>
                                                                                {credential.expiryDate && (
                                                                                    <span className="flex items-center gap-1">
                                                                                        Expires: {format(new Date(credential.expiryDate), 'dd MMM yyyy')}
                                                                                    </span>
                                                                                )}
                                                                                <span className="font-mono text-purple-600">
                                                                                    {credential.verificationCode}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <Button 
                                                                        onClick={() => handleViewCredential(credential.verificationCode)}
                                                                        variant="outline" 
                                                                        size="sm"
                                                                        className="flex-shrink-0 ml-3"
                                                                    >
                                                                        <ExternalLink className="w-4 h-4 mr-2" />
                                                                        View
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Expired Credentials */}
                                                {expiredCredentials.length > 0 && (
                                                    <div>
                                                        <h3 className="text-sm font-semibold text-orange-700 uppercase tracking-wider mb-3">
                                                            Expired Credentials ({expiredCredentials.length})
                                                        </h3>
                                                        <div className="space-y-2 opacity-60">
                                                            {expiredCredentials.map((credential) => (
                                                                <div key={credential.id} className="flex items-center justify-between p-3 border border-orange-200 rounded-lg bg-orange-50">
                                                                    <div className="flex items-center gap-3">
                                                                        <Award className="w-5 h-5 text-orange-500" />
                                                                        <div>
                                                                            <p className="font-medium text-slate-900">{credential.title}</p>
                                                                            <p className="text-xs text-slate-500">
                                                                                Expired: {format(new Date(credential.expiryDate), 'dd MMM yyyy')}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    {getStatusBadge(credential.status)}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Revoked Credentials */}
                                                {revokedCredentials.length > 0 && (
                                                    <div>
                                                        <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wider mb-3">
                                                            Revoked Credentials ({revokedCredentials.length})
                                                        </h3>
                                                        <div className="space-y-2 opacity-60">
                                                            {revokedCredentials.map((credential) => (
                                                                <div key={credential.id} className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                                                                    <div className="flex items-center gap-3">
                                                                        <Award className="w-5 h-5 text-red-500" />
                                                                        <div>
                                                                            <p className="font-medium text-slate-900">{credential.title}</p>
                                                                            <p className="text-xs text-slate-500">
                                                                                Issued: {format(new Date(credential.issuedDate), 'dd MMM yyyy')}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    {getStatusBadge(credential.status)}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="signups" className="mt-6">
                                <div className="space-y-6">
                                    {/* Upcoming Events */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Calendar className="w-5 h-5 text-green-600" />
                                                Upcoming Events ({upcomingSignups.length})
                                            </CardTitle>
                                            <CardDescription>Future masterclasses and workshops</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {upcomingSignups.length === 0 ? (
                                                <div className="text-center py-8">
                                                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                                    <p className="text-slate-600">No upcoming events</p>
                                                </div>
                                            ) : (
                                                <div className="border rounded-lg overflow-hidden">
                                                    <Table>
                                                        <TableHeader className="bg-slate-50">
                                                            <TableRow>
                                                                <TableHead>Event</TableHead>
                                                                <TableHead>Date</TableHead>
                                                                <TableHead>Type</TableHead>
                                                                <TableHead>Location</TableHead>
                                                                <TableHead className="text-right">Actions</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {upcomingSignups.map(signup => (
                                                                <TableRow key={signup.id}>
                                                                    <TableCell className="font-medium">{signup.eventTitle}</TableCell>
                                                                    <TableCell>{format(new Date(signup.eventDate), 'dd MMM yyyy')}</TableCell>
                                                                    <TableCell><Badge variant="outline">{signup.eventType}</Badge></TableCell>
                                                                    <TableCell className="text-sm text-slate-600">{signup.eventLocation}</TableCell>
                                                                    <TableCell className="text-right">
                                                                        {signup.zoomJoinUrl && (
                                                                            <Button asChild variant="ghost" size="sm">
                                                                                <a href={signup.zoomJoinUrl} target="_blank" rel="noopener noreferrer">
                                                                                    <ExternalLink className="w-4 h-4" />
                                                                                </a>
                                                                            </Button>
                                                                        )}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Past Events */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Calendar className="w-5 h-5 text-slate-600" />
                                                Past Events ({pastSignups.length})
                                            </CardTitle>
                                            <CardDescription>Completed masterclasses and workshops</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {pastSignups.length === 0 ? (
                                                <div className="text-center py-8">
                                                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                                    <p className="text-slate-600">No past events</p>
                                                </div>
                                            ) : (
                                                <div className="border rounded-lg overflow-hidden">
                                                    <Table>
                                                        <TableHeader className="bg-slate-50">
                                                            <TableRow>
                                                                <TableHead>Event</TableHead>
                                                                <TableHead>Date</TableHead>
                                                                <TableHead>Type</TableHead>
                                                                <TableHead>Location</TableHead>
                                                                <TableHead className="text-right">Certificate</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {pastSignups.map(signup => (
                                                                <TableRow key={signup.id}>
                                                                    <TableCell className="font-medium">{signup.eventTitle}</TableCell>
                                                                    <TableCell>{format(new Date(signup.eventDate), 'dd MMM yyyy')}</TableCell>
                                                                    <TableCell><Badge variant="outline">{signup.eventType}</Badge></TableCell>
                                                                    <TableCell className="text-sm text-slate-600">{signup.eventLocation}</TableCell>
                                                                    <TableCell className="text-right">
                                                                        {signup.certificateUrl ? (
                                                                            <Button asChild variant="outline" size="sm">
                                                                                <a href={signup.certificateUrl} target="_blank" rel="noopener noreferrer">
                                                                                    <FileText className="w-4 h-4 mr-2" />
                                                                                    View
                                                                                </a>
                                                                            </Button>
                                                                        ) : (
                                                                            <span className="text-xs text-slate-400">No certificate</span>
                                                                        )}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </div>
        </div>
    );
}
