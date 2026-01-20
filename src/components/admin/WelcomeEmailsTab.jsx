import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Mail, Send, Eye, Users, CheckCircle2, AlertCircle, Save, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { sendWelcomeEmail } from '@/api/functions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ifs } from '@/api/ifsClient';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const SIGNATURES = {
    jennifer: `Kind regards,

Jennifer Marshall
Chief Executive Officer
Independent Federation for Safeguarding`,
    gabriel: `Kind regards,

Gabriel Brown
Chief Operating Officer
Independent Federation for Safeguarding`
};

const DEFAULT_MESSAGE = `Hi

Welcome to IfS! It's great to have you on board. The experience you bring to our network will be an asset to our members. 

We value the work you do to protect the children and vulnerable adults you are responsible for. 

To accelerate your safeguarding strategy, we offer:

- Professional recognition
- Masterclasses 
- Career opportunities

We're happy to schedule a call or Zoom meeting anytime to explore solutions to achieve your goals.

We look forward to assisting you in building a culture of safeguarding in your organisation.`;

export default function WelcomeEmailsTab({ users, refreshUsers }) {
    const { toast } = useToast();
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [customMessage, setCustomMessage] = useState(DEFAULT_MESSAGE);
    const [signature, setSignature] = useState(SIGNATURES.jennifer);
    const [sender, setSender] = useState('jennifer'); // 'jennifer' or 'gabriel'
    const [subject, setSubject] = useState('Welcome to the Independent Federation for Safeguarding');
    const [isSending, setIsSending] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [membershipFilter, setMembershipFilter] = useState('All');
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [templateName, setTemplateName] = useState('');
    const [showSaveTemplate, setShowSaveTemplate] = useState(false);

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            const data = await ifs.entities.EmailTemplate.filter({ templateType: 'welcome' });
            setTemplates(data);
        } catch (error) {
            console.error('Failed to load templates:', error);
        }
    };

    const handleSaveTemplate = async () => {
        if (!templateName.trim()) {
            toast({
                title: "Template Name Required",
                description: "Please enter a name for the template.",
                variant: "destructive"
            });
            return;
        }

        try {
            await ifs.entities.EmailTemplate.create({
                name: templateName,
                subject,
                message: customMessage,
                signature,
                sender,
                templateType: 'welcome'
            });
            
            toast({
                title: "Template Saved",
                description: `Template "${templateName}" has been saved successfully.`
            });
            
            setTemplateName('');
            setShowSaveTemplate(false);
            await loadTemplates();
        } catch (error) {
            toast({
                title: "Save Failed",
                description: error.message || "Could not save template.",
                variant: "destructive"
            });
        }
    };

    const handleLoadTemplate = (templateId) => {
        const template = templates.find(t => t.id === templateId);
        if (template) {
            setCustomMessage(template.message);
            setSignature(template.signature || SIGNATURES[template.sender || 'jennifer']);
            setSender(template.sender || 'jennifer');
            setSubject(template.subject);
            setSelectedTemplate(templateId);
            toast({
                title: "Template Loaded",
                description: `Loaded template "${template.name}"`
            });
        }
    };

    const handleSenderChange = (newSender) => {
        setSender(newSender);
        setSignature(SIGNATURES[newSender]);
    };

    const handleDeleteTemplate = async (templateId) => {
        try {
            await ifs.entities.EmailTemplate.delete(templateId);
            toast({
                title: "Template Deleted",
                description: "Template has been deleted successfully."
            });
            if (selectedTemplate === templateId) {
                setSelectedTemplate('');
            }
            await loadTemplates();
        } catch (error) {
            toast({
                title: "Delete Failed",
                description: error.message || "Could not delete template.",
                variant: "destructive"
            });
        }
    };

    const activeMembers = users
        .filter(u => u.membershipStatus === 'active' || u.membershipStatus === 'applicant')
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    
    const filteredMembers = activeMembers.filter(member => {
        const searchLower = searchQuery.toLowerCase();
        const name = (member.displayName || member.full_name || '').toLowerCase();
        const email = (member.email || '').toLowerCase();
        const matchesSearch = name.includes(searchLower) || email.includes(searchLower);
        
        if (membershipFilter === 'All') return matchesSearch;
        if (membershipFilter === 'Applicant') return matchesSearch && member.membershipStatus === 'applicant';
        return matchesSearch && member.membershipType === membershipFilter;
    });

    const handleToggleUser = (userId) => {
        setSelectedUsers(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSelectAll = () => {
        if (selectedUsers.length === filteredMembers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(filteredMembers.map(u => u.id));
        }
    };

    const handleResetMessage = () => {
        setCustomMessage(DEFAULT_MESSAGE);
        setSignature(SIGNATURES[sender]);
    };

    const handleSendEmails = async () => {
        if (selectedUsers.length === 0) {
            toast({
                title: "No Recipients",
                description: "Please select at least one member to send the email to.",
                variant: "destructive"
            });
            return;
        }

        // Check if any selected users already received welcome email
        const selectedMembersData = activeMembers.filter(u => selectedUsers.includes(u.id));
        const alreadySentCount = selectedMembersData.filter(u => u.welcomeEmailSentAt).length;

        if (alreadySentCount > 0) {
            setShowConfirmDialog(true);
            return;
        }

        await sendEmailsConfirmed();
    };

    const sendEmailsConfirmed = async () => {
        setShowConfirmDialog(false);
        setIsSending(true);
        
        try {
            const selectedMembersData = activeMembers.filter(u => selectedUsers.includes(u.id));
            const selectedEmails = selectedMembersData.map(u => u.email);
            const selectedUserIds = selectedMembersData.map(u => u.id);

            const { data } = await sendWelcomeEmail({
                recipientEmails: selectedEmails,
                customMessage,
                signature,
                sender,
                subject,
                userIds: selectedUserIds
            });

            if (data.success) {
                toast({
                    title: "Emails Sent Successfully",
                    description: `Sent ${data.sent} email${data.sent !== 1 ? 's' : ''}${data.failed > 0 ? `, ${data.failed} failed` : ''}`,
                });
                setSelectedUsers([]);
                if (refreshUsers) {
                    await refreshUsers();
                }
            } else {
                throw new Error('Failed to send emails');
            }
        } catch (error) {
            console.error('Failed to send welcome emails:', error);
            toast({
                title: "Send Failed",
                description: error.message || "Could not send emails. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSending(false);
        }
    };

    const year = new Date().getFullYear();
    const fullMessage = `${customMessage}\n\n${signature}`;
    const previewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to IfS</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f7;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f4f4f7" style="padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                    <tr>
                        <td style="background-color: #5e028f; padding: 40px 30px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Welcome to IfS</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px; color: #333; line-height: 1.8;">
                            <div style="white-space: pre-wrap; font-size: 15px; color: #333;">${fullMessage}</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px 30px; background-color: #f9f9f9; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #777;">
                            <p style="margin: 0;">&copy; ${year} Independent Federation for Safeguarding. All rights reserved.</p>
                            <p style="margin: 5px 0 0 0;">IfS, 128 City Road, London, EC1V 2NX</p>
                            <p style="margin: 5px 0 0 0;"><a href="mailto:info@ifs-safeguarding.co.uk" style="color: #5e028f; text-decoration: none;">info@ifs-safeguarding.co.uk</a></p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

    const selectedMembersData = activeMembers.filter(u => selectedUsers.includes(u.id));
    const alreadySentCount = selectedMembersData.filter(u => u.welcomeEmailSentAt).length;

    return (
        <>
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-amber-600">
                            <AlertCircle className="w-5 h-5" />
                            Resend Welcome Email?
                        </DialogTitle>
                        <DialogDescription className="space-y-3 pt-2">
                            <p>
                                You've selected <strong>{selectedUsers.length}</strong> member{selectedUsers.length !== 1 ? 's' : ''}, 
                                of which <strong className="text-amber-600">{alreadySentCount}</strong> {alreadySentCount === 1 ? 'has' : 'have'} already 
                                received a welcome email.
                            </p>
                            <p className="text-slate-600">
                                Are you sure you want to send welcome emails again to {alreadySentCount === 1 ? 'this member' : 'these members'}?
                            </p>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={sendEmailsConfirmed}
                            className="bg-amber-600 hover:bg-amber-700"
                        >
                            Yes, Send Anyway
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Email Preview</DialogTitle>
                        <DialogDescription>
                            This is how the email will appear to recipients
                        </DialogDescription>
                    </DialogHeader>
                    <div className="border rounded-lg overflow-hidden">
                        <iframe
                            srcDoc={previewHtml}
                            className="w-full h-[600px] border-0"
                            title="Email Preview"
                        />
                    </div>
                </DialogContent>
            </Dialog>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="w-5 h-5 text-purple-600" />
                                    Send Welcome Emails
                                </CardTitle>
                                <CardDescription>
                                    Send personalized welcome messages to members
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setShowPreview(true)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Preview
                                </Button>
                                <Button
                                    onClick={handleSendEmails}
                                    disabled={isSending || selectedUsers.length === 0}
                                    className="bg-purple-600 hover:bg-purple-700"
                                >
                                    {isSending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Send to {selectedUsers.length} {selectedUsers.length === 1 ? 'Member' : 'Members'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Message Editor */}
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <Label htmlFor="templateSelect">Load Template</Label>
                                    </div>
                                    <div className="flex gap-2">
                                        <Select value={selectedTemplate} onValueChange={handleLoadTemplate}>
                                            <SelectTrigger id="templateSelect">
                                                <SelectValue placeholder="Select a template..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {templates.map(template => (
                                                    <SelectItem key={template.id} value={template.id}>
                                                        {template.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {selectedTemplate && (
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleDeleteTemplate(selectedTemplate)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="sender">Send From</Label>
                                    <Select value={sender} onValueChange={handleSenderChange}>
                                        <SelectTrigger id="sender" className="mt-2">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="jennifer">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">Jennifer Marshall</span>
                                                    <span className="text-xs text-slate-500">jennifer@ifs-safeguarding.co.uk</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="gabriel">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">Gabriel Brown</span>
                                                    <span className="text-xs text-slate-500">gabriel@ifs-safeguarding.co.uk</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="subject">Email Subject</Label>
                                    <Input
                                        id="subject"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="Welcome to the Independent Federation for Safeguarding"
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <Label htmlFor="message">Email Message</Label>
                                        <div className="flex gap-2">
                                            {!showSaveTemplate ? (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setShowSaveTemplate(true)}
                                                    className="text-xs h-auto py-1"
                                                >
                                                    <Save className="w-3 h-3 mr-1" />
                                                    Save as Template
                                                </Button>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        placeholder="Template name..."
                                                        value={templateName}
                                                        onChange={(e) => setTemplateName(e.target.value)}
                                                        className="h-8 w-40 text-xs"
                                                    />
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        onClick={handleSaveTemplate}
                                                        className="h-8 text-xs"
                                                    >
                                                        Save
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setShowSaveTemplate(false);
                                                            setTemplateName('');
                                                        }}
                                                        className="h-8 text-xs"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleResetMessage}
                                                className="text-xs h-auto py-1"
                                            >
                                                Reset to Default
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="mb-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                        <p className="text-xs font-semibold text-purple-900 mb-2">Available Variables:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {['{{firstName}}', '{{lastName}}', '{{organisationName}}', '{{jobRole}}'].map(variable => (
                                                <button
                                                    key={variable}
                                                    type="button"
                                                    onClick={() => {
                                                        const textarea = document.getElementById('message');
                                                        const start = textarea.selectionStart;
                                                        const end = textarea.selectionEnd;
                                                        const newMessage = customMessage.substring(0, start) + variable + customMessage.substring(end);
                                                        setCustomMessage(newMessage);
                                                        setTimeout(() => {
                                                            textarea.focus();
                                                            textarea.setSelectionRange(start + variable.length, start + variable.length);
                                                        }, 0);
                                                    }}
                                                    className="px-2 py-1 bg-white border border-purple-300 rounded text-xs font-mono text-purple-700 hover:bg-purple-100 transition-colors"
                                                >
                                                    {variable}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <Textarea
                                        id="message"
                                        value={customMessage}
                                        onChange={(e) => setCustomMessage(e.target.value)}
                                        rows={12}
                                        className="font-mono text-sm"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="signature">Email Signature</Label>
                                    <Textarea
                                        id="signature"
                                        value={signature}
                                        onChange={(e) => setSignature(e.target.value)}
                                        rows={6}
                                        className="font-mono text-sm mt-2"
                                    />
                                    <div className="mt-2 flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div className="text-xs text-blue-800">
                                            <p className="font-semibold mb-1">Email Details:</p>
                                            <p>• Reply-to: info@ifs-safeguarding.co.uk</p>
                                            <p>• BCC: info@ifs-safeguarding.co.uk</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Member Selection */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="search">Search Members</Label>
                                        <Input
                                            id="search"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search by name or email..."
                                            className="mt-2"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="membershipFilter">Filter by Type</Label>
                                        <Select value={membershipFilter} onValueChange={setMembershipFilter}>
                                            <SelectTrigger id="membershipFilter" className="mt-2">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="All">All</SelectItem>
                                                <SelectItem value="Associate">Associate Member</SelectItem>
                                                <SelectItem value="Full">Full Member</SelectItem>
                                                <SelectItem value="Applicant">Applicant</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-semibold">
                                        Recipients ({selectedUsers.length} selected)
                                    </Label>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleSelectAll}
                                        className="text-xs h-auto py-1"
                                    >
                                        {selectedUsers.length === filteredMembers.length ? 'Deselect All' : 'Select All'}
                                    </Button>
                                </div>

                                <div className="border rounded-lg max-h-[500px] overflow-y-auto">
                                    {filteredMembers.length === 0 ? (
                                        <div className="text-center py-8 text-slate-500">
                                            <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                            <p className="text-sm">No active members found</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y">
                                            {filteredMembers.map(member => (
                                                <div
                                                    key={member.id}
                                                    className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors"
                                                >
                                                    <Checkbox
                                                        checked={selectedUsers.includes(member.id)}
                                                        onCheckedChange={() => handleToggleUser(member.id)}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm text-slate-900 truncate">
                                                            {member.displayName || member.full_name}
                                                        </p>
                                                        <p className="text-xs text-slate-500 truncate">
                                                            {member.email}
                                                        </p>
                                                        <p className="text-xs text-slate-400">
                                                            Joined: {new Date(member.created_date).toLocaleDateString('en-GB', { 
                                                                day: '2-digit', 
                                                                month: 'short', 
                                                                year: 'numeric' 
                                                            })}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <Badge variant={member.membershipType === 'Full' ? 'default' : 'secondary'} className="text-xs">
                                                            {member.membershipType}
                                                        </Badge>
                                                        {member.welcomeEmailSentAt && (
                                                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                                                                ✓ Sent
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Info Cards */}
                <div className="grid md:grid-cols-2 gap-4">
                    <Card className="border-purple-200 bg-purple-50">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-purple-900 mb-1">What happens when you send?</h4>
                                    <ul className="text-sm text-purple-800 space-y-1">
                                        <li>• Email sent to each selected member</li>
                                        <li>• CC copy sent to info@ifs-safeguarding.co.uk</li>
                                        <li>• Reply-to set to jennifer@ifs-safeguarding.co.uk</li>
                                        <li>• Members can respond directly to Jennifer</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-blue-900 mb-1">Best Practices</h4>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• Personalize the message for different groups</li>
                                        <li>• Preview before sending to verify formatting</li>
                                        <li>• Select specific members or use "Select All"</li>
                                        <li>• Send during business hours for better engagement</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}