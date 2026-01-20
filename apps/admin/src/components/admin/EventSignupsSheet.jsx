import React, { useState, useEffect } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@ifs/shared/components/ui/sheet';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@ifs/shared/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@ifs/shared/components/ui/dialog";
import { Button } from '@ifs/shared/components/ui/button';
import { Input } from '@ifs/shared/components/ui/input';
import { Label } from '@ifs/shared/components/ui/label';

import { useToast } from "@ifs/shared/components/ui/use-toast";
import { ifs } from '@ifs/shared/api/ifsClient';
import { format } from 'date-fns';
import { Users, Loader2, Download, Mail, Bell, UserPlus, Search } from 'lucide-react';

const SignupRow = ({ signup, event, onUpdate }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [isSendingReminder, setIsSendingReminder] = useState(false);
    const { toast } = useToast();

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const response = await ifs.functions.invoke('generateWorkshopCertificate', {
                eventId: signup.eventId,
                signupId: signup.id
            });

            if (response.data?.success) {
                toast({
                    title: response.data.generated ? "Credential Generated" : "Credential Found",
                    description: response.data.generated ? "Digital credential created successfully." : "Credential already exists.",
                });
                onUpdate(signup.id, response.data.url, response.data.credential?.verificationCode || response.data.verification_code);
            } else {
                throw new Error(response.data?.details || 'Failed to generate credential.');
            }
        } catch (error) {
            console.error("Credential generation failed:", error);
            toast({
                title: "Generation Failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleSendReminder = async () => {
        setIsSendingReminder(true);
        try {
            const response = await ifs.functions.invoke('sendEventReminder', {
                eventId: signup.eventId,
                signupId: signup.id
            });

            if (response.data?.success) {
                toast({
                    title: "Reminder Sent",
                    description: `Reminder email sent to ${signup.userEmail}`,
                });
            } else {
                throw new Error(response.data?.error || 'Failed to send reminder');
            }
        } catch (error) {
            console.error("Failed to send reminder:", error);
            toast({
                title: "Error",
                description: "Failed to send reminder email.",
                variant: "destructive",
            });
        } finally {
            setIsSendingReminder(false);
        }
    };

    const handleSendCredentialEmail = async () => {
        if (!signup.certificateUrl) {
            toast({ title: "No credential found", description: "Please generate the credential first.", variant: "destructive"});
            return;
        }

        setIsSendingEmail(true);
        try {
            const eventTitle = event.title;
            const sessionDate = signup.eventDate ? new Date(signup.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A';
            
            // Calculate CPD hours from event duration (in minutes)
            let sessionDuration = '3 hours';
            if (event.duration) {
                const hours = event.duration / 60;
                sessionDuration = hours === Math.floor(hours) ? `${hours} ${hours === 1 ? 'hour' : 'hours'}` : `${hours.toFixed(1)} hours`;
            }

            // LinkedIn URL
            const issueDate = new Date(signup.eventDate || new Date());
            const linkedInAddUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(eventTitle)}&organizationId=106536291&organizationName=${encodeURIComponent('Independent Federation for Safeguarding')}&issueYear=${issueDate.getFullYear()}&issueMonth=${issueDate.getMonth() + 1}&certUrl=${encodeURIComponent(signup.certificateUrl)}&certId=${encodeURIComponent(signup.verificationCode || 'N/A')}`;

            // Session details URL
            const sessionDetailsUrl = `https://ifs-safeguarding.co.uk/MasterclassDetails?id=${event.id}`;

            const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f7;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f4f4f7" style="padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #5e028f 0%, #7c3aed 100%); padding: 30px 40px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🎓 Your CPD Credential is Ready!</h1>
                            <p style="color: #e9d5ff; margin: 10px 0 0 0; font-size: 16px;">Add this credential to your LinkedIn profile</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Dear ${signup.userName},
                            </p>
                            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Thank you for attending <strong>${eventTitle}</strong>. Your official digital credential is now available.
                            </p>
                            
                            <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px; margin: 25px 0; border: 1px solid #e5e7eb;">
                                <h3 style="color: #1f2937; margin: 0 0 12px; font-size: 16px; font-weight: 700;">Session Details</h3>
                                <p style="margin: 8px 0; color: #374151;"><strong>Session:</strong> ${eventTitle}</p>
                                <p style="margin: 8px 0; color: #374151;"><strong>Date:</strong> ${sessionDate}</p>
                                <p style="margin: 8px 0; color: #374151;"><strong>CPD Hours:</strong> ${sessionDuration}</p>
                            </div>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${signup.certificateUrl}" style="background: linear-gradient(135deg, #5e028f 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px; margin: 8px;">
                                    View Credential
                                </a>
                                <a href="${linkedInAddUrl}" style="background-color: #0077b5; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px; margin: 8px;">
                                    Add to LinkedIn
                                </a>
                            </div>

                            <div style="background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border: 2px solid #5e028f; border-radius: 12px; padding: 20px; margin: 25px 0;">
                                <h3 style="color: #5e028f; margin: 0 0 10px 0; font-size: 16px;">📚 Access Session Resources</h3>
                                <p style="color: #374151; margin: 0 0 15px 0; font-size: 14px; line-height: 1.5;">
                                    Recordings, slides, and additional materials from this session are available on your session page.
                                </p>
                                <a href="${sessionDetailsUrl}" style="color: #5e028f; font-weight: 600; text-decoration: none;">
                                    → View Session Resources
                                </a>
                            </div>
                            
                            <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                                Thank you for your commitment to safeguarding excellence.
                            </p>
                            <p style="color: #333; font-size: 14px; margin: 20px 0 0 0;">
                                Best regards,<br><strong>The IfS Team</strong>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 20px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 12px; margin: 0;">
                                © ${new Date().getFullYear()} Independent Federation for Safeguarding. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
            
            console.log('[EventSignupsSheet] Sending credential email to:', signup.userEmail);
            
            await ifs.functions.invoke('sendEmail', {
                to: signup.userEmail,
                subject: `Your CPD Credential - ${eventTitle}`,
                html: emailHtml,
            });
            
            toast({
                title: "Email Sent",
                description: `Credential email sent to ${signup.userEmail}`
            });

        } catch (error) {
            console.error("Failed to send email:", error);
            toast({
                title: "Email Failed",
                description: `Could not send email. ${error.message || ''}`,
                variant: "destructive",
            });
        } finally {
            setIsSendingEmail(false);
        }
    };

    return (
        <TableRow>
            <TableCell>
                <div className="font-medium">{signup.userName}</div>
                <div className="text-xs text-slate-500">{signup.userEmail}</div>
            </TableCell>
            <TableCell>
                {format(new Date(signup.created_date), 'dd MMM yyyy, p')}
            </TableCell>
            <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                    {/* Generate Credential Button - always show if no credential */}
                    {!signup.certificateUrl && (
                        <Button onClick={handleGenerate} disabled={isGenerating} variant="secondary" size="sm">
                            {isGenerating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Generate Credential
                        </Button>
                    )}

                    {/* View Credential - show if credential exists */}
                    {signup.certificateUrl && (
                        <Button asChild variant="outline" size="sm">
                            <a href={signup.certificateUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="w-4 h-4 mr-2" /> View
                            </a>
                        </Button>
                    )}

                    {/* Send Email Button - only show if credential exists */}
                    {signup.certificateUrl && (
                        <Button onClick={handleSendCredentialEmail} disabled={isSendingEmail} size="sm">
                            {isSendingEmail ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                            {isSendingEmail ? 'Sending...' : 'Email'}
                        </Button>
                    )}
                    
                    {/* Reminder Button - always available */}
                    <Button 
                        onClick={handleSendReminder} 
                        disabled={isSendingReminder} 
                        variant="ghost" 
                        size="sm"
                        title="Send Reminder Email"
                    >
                        {isSendingReminder ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4 text-slate-500 hover:text-slate-700" />}
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
};

export default function EventSignupsSheet({ event, signups, open, onOpenChange, onSignupAdded }) {
    const [localSignups, setLocalSignups] = useState([]);
    const [isReminding, setIsReminding] = useState(false);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [userSearch, setUserSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isAddingUser, setIsAddingUser] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (event && signups) {
            const eventSignups = signups.filter(s => s.eventId === event.id);
            setLocalSignups(eventSignups);
        } else {
            setLocalSignups([]);
        }
    }, [event, signups, open]);
    
    // Modified to accept verificationCode
    const handleSignupUpdate = (signupId, certificateUrl, verificationCode) => {
        setLocalSignups(prev => 
            prev.map(s => 
                s.id === signupId ? { ...s, certificateUrl: certificateUrl, verificationCode: verificationCode } : s
            )
        );
    };

    const handleSearchUsers = async () => {
        if (!userSearch.trim()) return;
        
        setIsSearching(true);
        try {
            console.log('[EventSignupsSheet] Searching for:', userSearch);
            
            // Use backend function to search users (requires admin privileges)
            const response = await ifs.functions.invoke('searchUsers', {
                searchTerm: userSearch
            });
            
            console.log('[EventSignupsSheet] Response:', response);
            console.log('[EventSignupsSheet] Response data:', response.data);
            
            if (!response.data?.success) {
                console.error('[EventSignupsSheet] Search failed:', response.data);
                throw new Error(response.data?.error || 'Search failed');
            }
            
            const users = response.data.users || [];
            console.log('[EventSignupsSheet] Users found:', users.length);
            
            // Filter out users already signed up
            const signedUpUserIds = localSignups.map(s => s.userId);
            const available = users.filter(u => !signedUpUserIds.includes(u.id));
            
            console.log('[EventSignupsSheet] Available users (not signed up):', available.length);
            setSearchResults(available);
        } catch (error) {
            console.error("[EventSignupsSheet] Error searching users:", error);
            toast({
                title: "Search Failed",
                description: error.message || "Could not search users.",
                variant: "destructive",
            });
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddUserToEvent = async (user) => {
        setIsAddingUser(true);
        try {
            const newSignup = await ifs.entities.EventSignup.create({
                userId: user.id,
                eventId: event.id,
                userEmail: user.email,
                userName: user.displayName || user.full_name || user.email,
                eventTitle: event.title,
                eventDate: event.date,
                eventType: event.type,
                eventLocation: event.location
            });
            
            setLocalSignups(prev => [...prev, newSignup]);
            setSearchResults(prev => prev.filter(u => u.id !== user.id));
            
            toast({
                title: "User Added",
                description: `${user.full_name || user.email} has been added to the event.`,
            });
            
            // Notify parent to refresh signups
            if (onSignupAdded) {
                onSignupAdded(newSignup);
            }
        } catch (error) {
            console.error("Error adding user:", error);
            toast({
                title: "Failed to Add User",
                description: error.message || "Could not add user to event.",
                variant: "destructive",
            });
        } finally {
            setIsAddingUser(false);
        }
    };

    const handleSendReminders = async () => {
        if (!event || localSignups.length === 0) return;
        
        if (!confirm(`Are you sure you want to send reminder emails to all ${localSignups.length} attendees?`)) {
            return;
        }

        setIsReminding(true);
        try {
            const response = await ifs.functions.invoke('sendEventReminder', {
                eventId: event.id
            });

            if (response.data?.success) {
                toast({
                    title: "Reminders Sent",
                    description: `Successfully sent ${response.data.sent} emails.`,
                });
            } else {
                throw new Error(response.data?.error || 'Failed to send reminders');
            }
        } catch (error) {
            console.error("Failed to send reminders:", error);
            toast({
                title: "Error",
                description: "Failed to send reminder emails.",
                variant: "destructive",
            });
        } finally {
            setIsReminding(false);
        }
    };

    if (!event) {
        return null;
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-2xl lg:max-w-3xl overflow-y-auto">
                <SheetHeader className="pb-6">
                    <SheetTitle className="text-2xl">Event Signups & Certificates</SheetTitle>
                    <SheetDescription>
                        Manage attendees for <span className="font-semibold text-purple-600">{event.title}</span>
                    </SheetDescription>
                    <div className="pt-4 flex gap-2 flex-wrap">
                         <Button 
                            onClick={() => setShowAddUserModal(true)}
                            variant="outline"
                        >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add User
                        </Button>
                         <Button 
                            onClick={handleSendReminders} 
                            disabled={isReminding || localSignups.length === 0}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            {isReminding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                            Send Reminder to All ({localSignups.length})
                        </Button>
                    </div>
                </SheetHeader>
                
                <div className="space-y-4">
                    {localSignups.length > 0 ? (
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead>Attendee</TableHead>
                                        <TableHead>Signed Up On</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {localSignups.map(signup => (
                                        <SignupRow 
                                            key={signup.id}
                                            signup={signup}
                                            event={event}
                                            onUpdate={handleSignupUpdate}
                                        />
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed rounded-lg">
                            <Users className="w-12 h-12 mx-auto text-slate-300" />
                            <h3 className="mt-4 text-lg font-medium text-slate-800">No Signups Yet</h3>
                            <p className="mt-1 text-sm text-slate-500">
                                When members sign up for this event, they will appear here.
                            </p>
                        </div>
                    )}
                </div>
            </SheetContent>

            {/* Add User Modal */}
            <Dialog open={showAddUserModal} onOpenChange={setShowAddUserModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add User to Event</DialogTitle>
                        <DialogDescription>
                            Search for a user by name or email to add them to this event.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Input
                                    placeholder="Search by name or email..."
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
                                />
                            </div>
                            <Button onClick={handleSearchUsers} disabled={isSearching}>
                                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            </Button>
                        </div>
                        
                        {searchResults.length > 0 && (
                            <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                                {searchResults.map(user => (
                                    <div key={user.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                                        <div>
                                            <div className="font-medium">{user.displayName || user.full_name || 'No name'}</div>
                                            <div className="text-sm text-slate-500">{user.email}</div>
                                        </div>
                                        <Button 
                                            size="sm" 
                                            onClick={() => handleAddUserToEvent(user)}
                                            disabled={isAddingUser}
                                        >
                                            {isAddingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {searchResults.length === 0 && userSearch && !isSearching && (
                            <p className="text-sm text-slate-500 text-center py-4">
                                No users found matching "{userSearch}"
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setShowAddUserModal(false);
                            setUserSearch('');
                            setSearchResults([]);
                        }}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Sheet>
    );
}