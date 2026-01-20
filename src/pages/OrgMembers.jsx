import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../components/providers/UserProvider';
import OrgPortalSidebar from '../components/portal/OrgPortalSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, Send, Mail, Clock, Trash2, UserPlus, UserMinus, UserX, ArrowRight, X } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { createPageUrl } from '@/utils';
import { inviteOrgMember } from '@/api/functions';
import { getOrganisationMembers } from '@/api/functions';
import { sendEmail } from '@/api/functions';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ifs } from '@/api/ifsClient';

const InviteMembersForm = ({ organisationId, onMemberInvited }) => {
    const { toast } = useToast();
    const [isInviting, setIsInviting] = useState(false);
    const [activeTab, setActiveTab] = useState('manual');
    const [manualEmails, setManualEmails] = useState('');
    const [csvFile, setCsvFile] = useState(null);
    const [csvFileName, setCsvFileName] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

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
            const response = await inviteOrgMember({ 
                inviteeEmails: emailsToInvite,
                organisationId: organisationId 
            });
            
            const { data } = response;
            
            if (data.success) {
                toast({ title: "Success", description: data.message });
                setManualEmails('');
                setCsvFile(null);
                setCsvFileName('');
                if (onMemberInvited) onMemberInvited();
            } else {
                throw new Error(data.error || "Failed to send invitations.");
            }
        } catch (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsInviting(false);
        }
    };

    if (!isExpanded) {
        return (
            <div className="bg-white border border-slate-200 shadow-sm">
                <button
                    onClick={() => setIsExpanded(true)}
                    className="w-full px-8 py-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                            <Send className="w-5 h-5 text-slate-600" />
                        </div>
                        <div className="text-left">
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Invite Team Members</h2>
                            <p className="text-sm text-slate-500 mt-0.5">Click to invite colleagues to join your organisation</p>
                        </div>
                    </div>
                    <UserPlus className="w-5 h-5 text-slate-400" />
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white border border-slate-200 shadow-sm">
            <div className="border-b border-slate-200 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                            <Send className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Invite Team Members</h2>
                            <p className="text-sm text-slate-500 mt-0.5">Invite colleagues to join as Associate Members (free)</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(false)}
                        className="text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>
            </div>
            <form onSubmit={handleInvite}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="px-8 pt-6">
                        <TabsList className="grid w-full grid-cols-2 bg-slate-100">
                            <TabsTrigger value="manual" className="data-[state=active]:bg-white">Manual Entry</TabsTrigger>
                            <TabsTrigger value="csv" className="data-[state=active]:bg-white">Upload CSV</TabsTrigger>
                        </TabsList>
                    </div>
                    <div className="p-8 pt-6">
                        <TabsContent value="manual" className="mt-0">
                            <Label htmlFor="manualEmails" className="text-sm font-semibold text-slate-900">Email Addresses</Label>
                            <Textarea
                                id="manualEmails"
                                placeholder="Enter emails separated by commas, spaces, or new lines."
                                value={manualEmails}
                                onChange={e => setManualEmails(e.target.value)}
                                className="mt-2 min-h-[140px] border-slate-300"
                            />
                        </TabsContent>
                        <TabsContent value="csv" className="mt-0">
                            <Label htmlFor="csvUpload" className="text-sm font-semibold text-slate-900">Upload a .csv file</Label>
                            <div className="mt-2">
                                <Input
                                    id="csvUpload"
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <Label htmlFor="csvUpload">
                                    <div className="cursor-pointer border-2 border-dashed border-slate-300 rounded-lg p-8 text-center text-slate-500 hover:bg-slate-50 hover:border-slate-400 transition-all">
                                        {csvFileName ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <Mail className="w-5 h-5 text-slate-600" />
                                                <span className="font-medium text-slate-900">{csvFileName}</span>
                                            </div>
                                        ) : (
                                            <>
                                                <Mail className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                                <p className="font-medium text-slate-900 mb-1">Click to choose a file</p>
                                                <p className="text-xs text-slate-500">or drag and drop</p>
                                            </>
                                        )}
                                    </div>
                                </Label>
                            </div>
                            <p className="text-xs text-slate-500 mt-3">Your CSV should contain email addresses, one per line or separated by commas.</p>
                        </TabsContent>
                    </div>
                </Tabs>
                <div className="px-8 pb-8">
                    <Button 
                        type="submit" 
                        disabled={isInviting} 
                        className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                    >
                        {isInviting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Send Invitations
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default function OrgMembers() {
    const { user, loading: userLoading } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { toast } = useToast();
    const [organisation, setOrganisation] = useState(null);
    const [members, setMembers] = useState([]);
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingInviteId, setDeletingInviteId] = useState(null);
    const [assigningSeatMemberId, setAssigningSeatMemberId] = useState(null);
    const [removingSeatMemberId, setRemovingSeatMemberId] = useState(null);
    const [removingMemberId, setRemovingMemberId] = useState(null);

    const fetchOrganisationData = useCallback(async () => {
        if (!user?.organisationId) {
            setLoading(false);
            return;
        }
        
        try {
            setLoading(true);
            const { data } = await getOrganisationMembers({ organisationId: user.organisationId });
            
            if (data.success) {
                setOrganisation(data.organisation);
                setMembers(data.members);
                setInvites(data.invites);
            } else {
                throw new Error(data.error || 'Failed to fetch organisation data');
            }
        } catch (error) {
            console.error("Failed to fetch organisation data:", error);
            toast({ 
                title: 'Error', 
                description: 'Could not load team data.', 
                variant: 'destructive' 
            });
        } finally {
            setLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        if (!userLoading && user?.organisationId) {
            fetchOrganisationData();
        }
    }, [userLoading, user?.organisationId, fetchOrganisationData]);

    const handleDeleteInvite = async (inviteId) => {
        setDeletingInviteId(inviteId);
        try {
            const { data } = await ifs.functions.invoke('revokeInvite', {
                inviteId: inviteId
            });

            if (!data.success) {
                throw new Error(data.error || 'Failed to revoke invite');
            }

            toast({ 
                title: "Success", 
                description: "Invitation revoked successfully." 
            });
            fetchOrganisationData();
        } catch (error) {
            console.error("Failed to delete invite:", error);
            toast({ 
                title: "Error", 
                description: error.message || "Could not revoke invitation. Please try again.", 
                variant: "destructive" 
            });
        } finally {
            setDeletingInviteId(null);
        }
    };

    const handleAssignSeat = async (member) => {
        const totalSeats = organisation.totalSeats || 0;
        const usedSeats = organisation.usedSeats || 0;
        const availableSeats = totalSeats - usedSeats;

        if (availableSeats <= 0) {
            toast({
                title: "No Seats Available",
                description: "All seats are currently assigned. Remove a member from a seat first or purchase more seats.",
                variant: "destructive"
            });
            return;
        }

        const confirmed = window.confirm(
            `Assign ${member.displayName || member.full_name} to a Full Member seat?\n\nThis will:\n• Upgrade them to Full Member\n• Give them Full Member benefits\n• Use 1 of ${availableSeats} available seats`
        );
        
        if (!confirmed) return;

        setAssigningSeatMemberId(member.id);
        try {
            await ifs.entities.User.update(member.id, {
                membershipType: 'Full',
                membershipStatus: 'active'
            });

            await ifs.entities.Organisation.update(organisation.id, {
                usedSeats: usedSeats + 1,
                availableSeats: availableSeats - 1
            });

            toast({
                title: "Seat Assigned",
                description: `${member.displayName || member.full_name} is now a Full Member via your organisation seat.`
            });
            
            // Send email to the member
            try {
                await sendEmail({
                    to: member.email,
                    subject: 'You\'ve Been Upgraded to Full Membership',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        </head>
                        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
                            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                                <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                    <div style="border-left: 4px solid #7c3aed; padding-left: 20px; margin-bottom: 30px;">
                                        <h1 style="margin: 0; color: #1e293b; font-size: 24px; font-weight: 700;">You've Been Upgraded to Full Membership</h1>
                                    </div>
                                    
                                    <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Dear ${member.displayName || member.full_name},</p>
                                    
                                    <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">Great news! <strong style="color: #1e293b;">${organisation.name}</strong> has assigned you a Full Membership seat.</p>
                                    
                                    <div style="background-color: #f1f5f9; border-radius: 6px; padding: 20px; margin-bottom: 25px;">
                                        <p style="color: #1e293b; font-size: 14px; font-weight: 600; margin: 0 0 15px 0;">You now have access to:</p>
                                        <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 15px; line-height: 1.8;">
                                            <li>Monthly CPD hours for training</li>
                                            <li>10% discount on all courses</li>
                                            <li>MIFS post-nominal designation</li>
                                            <li>All Full Member benefits</li>
                                        </ul>
                                    </div>
                                    
                                    <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">Log in to your portal to start using your Full Member benefits.</p>
                                    
                                    <div style="text-align: center; margin: 30px 0;">
                                        <a href="https://portal.ifs-safeguarding.co.uk" style="display: inline-block; background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">Access Your Portal</a>
                                    </div>
                                    
                                    <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px;">
                                        <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0;">Best regards,<br><strong style="color: #475569;">The IfS Team</strong></p>
                                    </div>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                });
            } catch (error) {
                console.error('Failed to send member notification:', error);
            }
            
            // Send email to admin
            try {
                await sendEmail({
                    to: user.email,
                    subject: 'Full Member Seat Assigned',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        </head>
                        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
                            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                                <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                    <div style="border-left: 4px solid #0f172a; padding-left: 20px; margin-bottom: 30px;">
                                        <h1 style="margin: 0; color: #1e293b; font-size: 24px; font-weight: 700;">Full Member Seat Assigned</h1>
                                    </div>
                                    
                                    <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">You have successfully assigned a Full Member seat to <strong style="color: #1e293b;">${member.displayName || member.full_name}</strong> (${member.email}).</p>
                                    
                                    <div style="background-color: #f1f5f9; border-radius: 6px; padding: 20px; margin-bottom: 25px;">
                                        <table style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="color: #64748b; font-size: 14px; padding: 8px 0;">Organisation:</td>
                                                <td style="color: #1e293b; font-size: 14px; font-weight: 600; padding: 8px 0; text-align: right;">${organisation.name}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #64748b; font-size: 14px; padding: 8px 0;">Seats Used:</td>
                                                <td style="color: #1e293b; font-size: 14px; font-weight: 600; padding: 8px 0; text-align: right;">${usedSeats + 1}/${totalSeats}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #64748b; font-size: 14px; padding: 8px 0;">Available Seats:</td>
                                                <td style="color: #1e293b; font-size: 14px; font-weight: 600; padding: 8px 0; text-align: right;">${availableSeats - 1}</td>
                                            </tr>
                                        </table>
                                    </div>
                                    
                                    <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px;">
                                        <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0;">Best regards,<br><strong style="color: #475569;">The IfS Team</strong></p>
                                    </div>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                });
            } catch (error) {
                console.error('Failed to send admin notification:', error);
            }
            
            fetchOrganisationData();
        } catch (error) {
            console.error('Failed to assign seat:', error);
            toast({
                title: "Error",
                description: "Could not assign seat. Please try again.",
                variant: "destructive"
            });
        } finally {
            setAssigningSeatMemberId(null);
        }
    };

    const handleRemoveSeat = async (member) => {
        const totalSeats = organisation.totalSeats || 0;
        const usedSeats = organisation.usedSeats || 0;
        const availableSeats = totalSeats - usedSeats;

        const confirmed = window.confirm(
            `Remove ${member.displayName || member.full_name} from their Full Member seat?\n\nThis will:\n• Downgrade them to Associate Member\n• Revoke Full Member benefits\n• Free up 1 seat`
        );
        
        if (!confirmed) return;

        setRemovingSeatMemberId(member.id);
        try {
            await ifs.entities.User.update(member.id, {
                membershipType: 'Associate'
            });

            await ifs.entities.Organisation.update(organisation.id, {
                usedSeats: Math.max(0, usedSeats - 1),
                availableSeats: Math.min(totalSeats, availableSeats + 1)
            });

            toast({
                title: "Seat Removed",
                description: `${member.displayName || member.full_name} has been downgraded to Associate Member. Seat freed.`
            });
            
            // Send email to the member
            try {
                await sendEmail({
                    to: member.email,
                    subject: 'Full Member Seat Update',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        </head>
                        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
                            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                                <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                    <div style="border-left: 4px solid #64748b; padding-left: 20px; margin-bottom: 30px;">
                                        <h1 style="margin: 0; color: #1e293b; font-size: 24px; font-weight: 700;">Full Member Seat Update</h1>
                                    </div>
                                    
                                    <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Dear ${member.displayName || member.full_name},</p>
                                    
                                    <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">This is to inform you that your Full Member seat at <strong style="color: #1e293b;">${organisation.name}</strong> has been removed, and you've been reverted to Associate Member status.</p>
                                    
                                    <div style="background-color: #f1f5f9; border-radius: 6px; padding: 20px; margin-bottom: 25px;">
                                        <p style="color: #1e293b; font-size: 14px; font-weight: 600; margin: 0 0 15px 0;">You still have access to:</p>
                                        <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 15px; line-height: 1.8;">
                                            <li>All Associate Member benefits</li>
                                            <li>Organisation features and directory listing</li>
                                            <li>Community events and networking</li>
                                        </ul>
                                    </div>
                                    
                                    <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">If you have questions about this change, please contact your organisation administrator.</p>
                                    
                                    <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px;">
                                        <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0;">Best regards,<br><strong style="color: #475569;">The IfS Team</strong></p>
                                    </div>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                });
            } catch (error) {
                console.error('Failed to send member notification:', error);
            }
            
            // Send email to admin
            try {
                await sendEmail({
                    to: user.email,
                    subject: 'Full Member Seat Removed',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        </head>
                        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
                            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                                <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                    <div style="border-left: 4px solid #0f172a; padding-left: 20px; margin-bottom: 30px;">
                                        <h1 style="margin: 0; color: #1e293b; font-size: 24px; font-weight: 700;">Full Member Seat Removed</h1>
                                    </div>
                                    
                                    <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">You have removed the Full Member seat from <strong style="color: #1e293b;">${member.displayName || member.full_name}</strong> (${member.email}).</p>
                                    
                                    <div style="background-color: #f1f5f9; border-radius: 6px; padding: 20px; margin-bottom: 25px;">
                                        <table style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="color: #64748b; font-size: 14px; padding: 8px 0;">Organisation:</td>
                                                <td style="color: #1e293b; font-size: 14px; font-weight: 600; padding: 8px 0; text-align: right;">${organisation.name}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #64748b; font-size: 14px; padding: 8px 0;">Seats Used:</td>
                                                <td style="color: #1e293b; font-size: 14px; font-weight: 600; padding: 8px 0; text-align: right;">${Math.max(0, usedSeats - 1)}/${totalSeats}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #64748b; font-size: 14px; padding: 8px 0;">Available Seats:</td>
                                                <td style="color: #1e293b; font-size: 14px; font-weight: 600; padding: 8px 0; text-align: right;">${Math.min(totalSeats, availableSeats + 1)}</td>
                                            </tr>
                                        </table>
                                    </div>
                                    
                                    <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px;">
                                        <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0;">Best regards,<br><strong style="color: #475569;">The IfS Team</strong></p>
                                    </div>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                });
            } catch (error) {
                console.error('Failed to send admin notification:', error);
            }
            
            fetchOrganisationData();
        } catch (error) {
            console.error('Failed to remove seat:', error);
            toast({
                title: "Error",
                description: "Could not remove seat. Please try again.",
                variant: "destructive"
            });
        } finally {
            setRemovingSeatMemberId(null);
        }
    };

    const handleRemoveMember = async (member) => {
        const confirmed = window.confirm(
            `Remove ${member.displayName || member.full_name} from your organisation?\n\nThis will:\n• Remove them from the organisation\n• They will lose access to organisation features\n• They will keep their individual membership`
        );
        
        if (!confirmed) return;

        setRemovingMemberId(member.id);
        try {
            await ifs.entities.User.update(member.id, {
                organisationId: null,
                organisationRole: null,
                organisationName: null
            });

            toast({
                title: "Member Removed",
                description: `${member.displayName || member.full_name} has been removed from your organisation.`
            });
            
            // Send email to the member
            try {
                await sendEmail({
                    to: member.email,
                    subject: 'Removed from Organisation',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        </head>
                        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
                            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                                <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                    <div style="border-left: 4px solid #64748b; padding-left: 20px; margin-bottom: 30px;">
                                        <h1 style="margin: 0; color: #1e293b; font-size: 24px; font-weight: 700;">Removed from Organisation</h1>
                                    </div>
                                    
                                    <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Dear ${member.displayName || member.full_name},</p>
                                    
                                    <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">You have been removed from <strong style="color: #1e293b;">${organisation.name}</strong>'s organisation.</p>
                                    
                                    <div style="background-color: #f1f5f9; border-radius: 6px; padding: 20px; margin-bottom: 25px;">
                                        <p style="color: #1e293b; font-size: 14px; font-weight: 600; margin: 0 0 15px 0;">Your individual membership remains active, and you still have access to:</p>
                                        <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 15px; line-height: 1.8;">
                                            <li>Your personal portal and benefits</li>
                                            <li>All member resources</li>
                                            <li>Training and events</li>
                                        </ul>
                                    </div>
                                    
                                    <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 25px;"><em>Only your organisation-specific features have been removed.</em></p>
                                    
                                    <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">If you have questions, please contact your previous organisation administrator.</p>
                                    
                                    <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px;">
                                        <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0;">Best regards,<br><strong style="color: #475569;">The IfS Team</strong></p>
                                    </div>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                });
            } catch (error) {
                console.error('Failed to send member notification:', error);
            }
            
            // Send email to admin
            try {
                await sendEmail({
                    to: user.email,
                    subject: 'Team Member Removed',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        </head>
                        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
                            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                                <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                    <div style="border-left: 4px solid #0f172a; padding-left: 20px; margin-bottom: 30px;">
                                        <h1 style="margin: 0; color: #1e293b; font-size: 24px; font-weight: 700;">Team Member Removed</h1>
                                    </div>
                                    
                                    <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">You have removed <strong style="color: #1e293b;">${member.displayName || member.full_name}</strong> (${member.email}) from <strong style="color: #1e293b;">${organisation.name}</strong>.</p>
                                    
                                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px 20px; border-radius: 4px; margin-bottom: 25px;">
                                        <p style="color: #92400e; font-size: 14px; line-height: 1.6; margin: 0;">They will no longer have access to organisation features but will retain their individual membership.</p>
                                    </div>
                                    
                                    <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px;">
                                        <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0;">Best regards,<br><strong style="color: #475569;">The IfS Team</strong></p>
                                    </div>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                });
            } catch (error) {
                console.error('Failed to send admin notification:', error);
            }
            
            fetchOrganisationData();
        } catch (error) {
            console.error('Failed to remove member:', error);
            toast({
                title: "Error",
                description: "Could not remove member. Please try again.",
                variant: "destructive"
            });
        } finally {
            setRemovingMemberId(null);
        }
    };

    if (userLoading || loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
            </div>
        );
    }

    if (!user || !organisation) return null;

    const isAdmin = user.organisationRole === 'Admin';
    const isMemberOrg = organisation.organisationType === 'member';
    const totalSeats = organisation.totalSeats || 0;
    const usedSeats = organisation.usedSeats || 0;
    const availableSeats = totalSeats - usedSeats;

    return (
        <div className="flex h-screen bg-slate-50/30">
            <Toaster />
            <OrgPortalSidebar 
                organisation={organisation}
                user={user} 
                sidebarOpen={sidebarOpen} 
                setSidebarOpen={setSidebarOpen} 
                currentPage="OrgMembers" 
            />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto bg-slate-50">
                    <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
                        <div className="mb-12">
                            <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Team</h1>
                            <p className="text-lg text-slate-600">Manage your organisation's team members and invitations.</p>
                        </div>

                        {isAdmin && (
                            <div className="mb-10 bg-white border-t-4 border-t-slate-900 shadow-sm">
                                <div className="border-b border-slate-200 px-8 py-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                                <Users className="w-5 h-5 text-slate-600" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Full Member Seats</h2>
                                                <p className="text-sm text-slate-500 mt-0.5">
                                                    {isMemberOrg 
                                                        ? 'Assign Full Membership to your team members' 
                                                        : 'Purchase seats to provide Full Membership benefits'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        {!isMemberOrg && (
                                            <Button 
                                                onClick={() => window.location.href = createPageUrl('OrganisationMembership') + '?type=member'}
                                                className="bg-slate-900 hover:bg-slate-800 text-white h-10 px-6 font-semibold"
                                            >
                                                Purchase Seats
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <div className="p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="text-center p-6 bg-slate-50 rounded-lg border-2 border-slate-200">
                                            <div className="text-5xl font-bold text-slate-900 mb-2 font-sans">{totalSeats}</div>
                                            <div className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">Total Seats</div>
                                            <div className="text-xs text-slate-500">Purchased</div>
                                        </div>
                                        <div className="text-center p-6 bg-slate-50 rounded-lg border-2 border-slate-200">
                                            <div className="text-5xl font-bold text-slate-900 mb-2 font-sans">{usedSeats}</div>
                                            <div className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">Seats Assigned</div>
                                            <div className="text-xs text-slate-500">Currently in use</div>
                                        </div>
                                        <div className={`text-center p-6 rounded-lg border-2 ${
                                            availableSeats > 0 
                                                ? 'bg-green-50 border-green-200' 
                                                : totalSeats === 0
                                                ? 'bg-slate-50 border-slate-200'
                                                : 'bg-red-50 border-red-200'
                                        }`}>
                                            <div className={`text-5xl font-bold mb-2 font-sans ${
                                                availableSeats > 0 ? 'text-green-700' : totalSeats === 0 ? 'text-slate-400' : 'text-red-700'
                                            }`}>{availableSeats}</div>
                                            <div className={`text-sm font-bold uppercase tracking-wide mb-1 ${
                                                availableSeats > 0 ? 'text-green-700' : totalSeats === 0 ? 'text-slate-500' : 'text-red-700'
                                            }`}>Available to Assign</div>
                                            <div className={`text-xs ${
                                                availableSeats > 0 ? 'text-green-600' : totalSeats === 0 ? 'text-slate-500' : 'text-red-600'
                                            }`}>
                                                {availableSeats > 0 
                                                    ? `Ready to assign to ${availableSeats} ${availableSeats === 1 ? 'member' : 'members'}`
                                                    : totalSeats === 0
                                                    ? 'No seats purchased'
                                                    : 'All seats assigned'
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-6 p-4 bg-slate-100 rounded-lg">
                                        <p className="text-sm text-slate-700 text-center">
                                            {totalSeats === 0 ? (
                                                <>
                                                    <strong>Full Member seats</strong> give team members CPD hours, training discounts, and the MIFS designation. 
                                                    Purchase seats to start assigning Full Memberships to your team.
                                                </>
                                            ) : (
                                                <>
                                                    <strong>Full Member seats</strong> give team members CPD hours, training discounts, and the MIFS designation. 
                                                    {availableSeats > 0 
                                                        ? ` You can assign ${availableSeats} more ${availableSeats === 1 ? 'seat' : 'seats'} to Associate Members below.`
                                                        : ' Purchase more seats to assign additional Full Memberships.'
                                                    }
                                                </>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-10">
                            <div className="bg-white border border-slate-200 shadow-sm">
                                <div className="border-b border-slate-200 px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                            <Users className="w-5 h-5 text-slate-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Team Members</h2>
                                            <p className="text-sm text-slate-500 mt-0.5">
                                                {members.length} {members.length === 1 ? 'member' : 'members'} in your organisation
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8">
                                    {members.length === 0 ? (
                                        <div className="text-center py-16">
                                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Users className="w-10 h-10 text-slate-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-slate-900 mb-2">No members yet</h3>
                                            <p className="text-slate-500">Invite colleagues to join your organisation</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {members.map(member => (
                                                <div 
                                                    key={member.id} 
                                                    className="p-6 bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all"
                                                >
                                                    <div className="flex items-start justify-between gap-4 mb-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                                                {(member.displayName || member.full_name || 'U').charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900">
                                                                    {member.displayName || member.full_name}
                                                                </p>
                                                                <p className="text-sm text-slate-600">{member.email}</p>
                                                            </div>
                                                        </div>
                                                        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0 uppercase tracking-wide ${
                                                            member.organisationRole === 'Admin' 
                                                                ? 'bg-slate-900 text-white' 
                                                                : 'bg-slate-200 text-slate-700'
                                                        }`}>
                                                            {member.organisationRole}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide ${
                                                                member.membershipType === 'Full' 
                                                                    ? 'bg-slate-900 text-white'
                                                                    : 'bg-slate-200 text-slate-700'
                                                            }`}>
                                                                {member.membershipType} Member
                                                            </span>
                                                            <span className={`text-xs font-medium uppercase tracking-wide ${
                                                                member.membershipStatus === 'active' ? 'text-green-700' : 'text-slate-500'
                                                            }`}>
                                                                {member.membershipStatus}
                                                            </span>
                                                        </div>

                                                        {isAdmin && (
                                                            <div className="flex items-center gap-2">
                                                                {member.membershipType !== 'Full' && member.membershipStatus === 'active' && (
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => handleAssignSeat(member)}
                                                                        disabled={assigningSeatMemberId === member.id || availableSeats <= 0}
                                                                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold h-9 disabled:opacity-50"
                                                                    >
                                                                        {assigningSeatMemberId === member.id ? (
                                                                            <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                                                                        ) : (
                                                                            <UserPlus className="w-3 h-3 mr-1.5" />
                                                                        )}
                                                                        Assign Seat ({availableSeats})
                                                                    </Button>
                                                                )}

                                                                {member.membershipType === 'Full' && member.membershipStatus === 'active' && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handleRemoveSeat(member)}
                                                                        disabled={removingSeatMemberId === member.id}
                                                                        className="text-slate-900 hover:bg-slate-50 text-xs font-semibold h-9 border-slate-300"
                                                                    >
                                                                        {removingSeatMemberId === member.id ? (
                                                                            <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                                                                        ) : (
                                                                            <UserMinus className="w-3 h-3 mr-1.5" />
                                                                        )}
                                                                        Remove Seat
                                                                    </Button>
                                                                )}

                                                                {member.id !== user.id && (
                                                                    <AlertDialog>
                                                                        <AlertDialogTrigger asChild>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                disabled={removingMemberId === member.id}
                                                                                className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold h-9 border-slate-300"
                                                                            >
                                                                                {removingMemberId === member.id ? (
                                                                                    <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                                                                                ) : (
                                                                                    <UserX className="w-3 h-3 mr-1.5" />
                                                                                )}
                                                                                Remove
                                                                            </Button>
                                                                        </AlertDialogTrigger>
                                                                        <AlertDialogContent>
                                                                            <AlertDialogHeader>
                                                                                <AlertDialogTitle className="text-xl font-bold text-slate-900">Remove Team Member?</AlertDialogTitle>
                                                                                <AlertDialogDescription className="text-slate-600">
                                                                                    Are you sure you want to remove <strong>{member.displayName || member.full_name}</strong> from your organisation? They will lose access to organisation features but keep their individual membership.
                                                                                </AlertDialogDescription>
                                                                            </AlertDialogHeader>
                                                                            <AlertDialogFooter>
                                                                                <AlertDialogCancel className="border-slate-300">Cancel</AlertDialogCancel>
                                                                                <AlertDialogAction 
                                                                                    onClick={() => handleRemoveMember(member)}
                                                                                    className="bg-slate-900 hover:bg-slate-800"
                                                                                >
                                                                                    Remove Member
                                                                                </AlertDialogAction>
                                                                            </AlertDialogFooter>
                                                                        </AlertDialogContent>
                                                                    </AlertDialog>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isAdmin && (
                                <>
                                    <InviteMembersForm 
                                        organisationId={organisation.id} 
                                        onMemberInvited={fetchOrganisationData} 
                                    />
                                    
                                    <div className="bg-white border border-slate-200 shadow-sm">
                                        <div className="border-b border-slate-200 px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                                    <Clock className="w-5 h-5 text-slate-600" />
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Pending Invitations</h2>
                                                    <p className="text-sm text-slate-500 mt-0.5">
                                                        {invites.length} {invites.length === 1 ? 'invitation' : 'invitations'} awaiting response
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-8">
                                            {invites.length === 0 ? (
                                                <div className="text-center py-16">
                                                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <Mail className="w-10 h-10 text-slate-400" />
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No pending invitations</h3>
                                                    <p className="text-slate-500">All invitations have been accepted or there are none sent yet</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {invites.map(invite => (
                                                        <div 
                                                            key={invite.id} 
                                                            className="flex items-center justify-between p-5 bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-4 flex-1">
                                                                <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white flex-shrink-0">
                                                                    <Mail className="w-6 h-6" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-bold text-slate-900 truncate">{invite.inviteeEmail}</p>
                                                                    <p className="text-sm text-slate-600">
                                                                        Invited by {invite.inviterName} • {format(new Date(invite.created_date), 'd MMM yyyy')}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button 
                                                                        variant="outline" 
                                                                        size="sm"
                                                                        disabled={deletingInviteId === invite.id}
                                                                        className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-slate-300 font-semibold"
                                                                    >
                                                                        {deletingInviteId === invite.id ? (
                                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                                        ) : (
                                                                            <>
                                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                                Revoke
                                                                            </>
                                                                        )}
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle className="text-xl font-bold text-slate-900">Revoke Invitation?</AlertDialogTitle>
                                                                        <AlertDialogDescription className="text-slate-600">
                                                                            Are you sure you want to revoke the invitation for <strong>{invite.inviteeEmail}</strong>? They will no longer be able to join your organisation using this invitation.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel className="border-slate-300">Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction 
                                                                            onClick={() => handleDeleteInvite(invite.id)}
                                                                            className="bg-slate-900 hover:bg-slate-800"
                                                                        >
                                                                            Revoke
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}