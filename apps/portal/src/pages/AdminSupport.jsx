import React, { useState, useEffect } from 'react';
import { base44 } from '@ifs/shared/api/base44Client';
import { SupportTicket } from '@ifs/shared/api/entities';
import PortalSidebar from '../components/portal/PortalSidebar';
import PortalHeader from '../components/portal/PortalHeader';
import { useUser } from '@ifs/shared/components/providers/UserProvider';
import { Button } from '@ifs/shared/components/ui/button';
import { Loader2, MessageCircle, Search, Filter, Inbox, Tag, RotateCcw } from 'lucide-react';
import { Input } from '@ifs/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ifs/shared/components/ui/select';
import { useToast } from "@ifs/shared/components/ui/use-toast";
import { Toaster } from "@ifs/shared/components/ui/toaster";
import SupportTicketList from '../components/support/SupportTicketList';
import SupportChat from '../components/support/SupportChat';
import { Badge } from '@ifs/shared/components/ui/badge';

const normalizeMessages = (messages) => {
    if (Array.isArray(messages)) return messages;
    if (!messages) return [];
    if (typeof messages === 'string') {
        try {
            const parsed = JSON.parse(messages);
            if (Array.isArray(parsed)) return parsed;
            return parsed ? [parsed] : [];
        } catch (error) {
            return [];
        }
    }
    if (typeof messages === 'object') {
        return Object.values(messages);
    }
    return [];
};

export default function AdminSupport() {
    const adminUrl = import.meta.env.VITE_ADMIN_URL || 'https://admin.ifs-safeguarding.co.uk';
    const adminHost = (() => {
        try {
            return new URL(adminUrl).host;
        } catch (error) {
            return 'admin.ifs-safeguarding.co.uk';
        }
    })();
    const isAdminDomain = typeof window !== 'undefined' && window.location.host === adminHost;

    if (!isAdminDomain) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="max-w-lg w-full bg-white border border-slate-200 rounded-xl shadow-sm p-6 text-center">
                    <h1 className="text-xl font-semibold text-slate-900 mb-2">Admin Portal Moved</h1>
                    <p className="text-slate-600 mb-4">
                        The support admin area is now available at the admin subdomain.
                    </p>
                    <a
                        href={adminUrl}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800"
                    >
                        Go to Admin Portal
                    </a>
                </div>
            </div>
        );
    }

    const { user, loading: userLoading } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterCategory, setFilterCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const { toast } = useToast();

    const categories = ["General", "Technical", "Billing", "Membership", "Training", "Other"];

    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchTickets();
        }
    }, [user]);

    const fetchTickets = async () => {
        setIsLoading(true);
        try {
            const fetchedTickets = await SupportTicket.filter({}, '-lastMessageAt');
            const normalizedTickets = fetchedTickets.map((ticket) => ({
                ...ticket,
                messages: normalizeMessages(ticket.messages)
            }));
            setTickets(normalizedTickets);
        } catch (error) {
            console.error("Failed to fetch tickets", error);
            toast({ title: "Error", description: "Failed to load support tickets", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (content) => {
        if (!selectedTicket) return;
        setIsSubmitting(true);
        try {
            const newMessage = {
                id: crypto.randomUUID(),
                senderId: user.id,
                senderName: user.displayName || user.full_name,
                senderRole: 'admin',
                content: content,
                timestamp: new Date().toISOString()
            };

            const updatedMessages = [...normalizeMessages(selectedTicket.messages), newMessage];
            
            // Auto update status if it was Open
            const newStatus = selectedTicket.status === 'Open' ? 'In Progress' : selectedTicket.status;
            
            await SupportTicket.update(selectedTicket.id, {
                messages: updatedMessages,
                lastMessageAt: new Date().toISOString(),
                status: newStatus
            });

            const updatedTicket = { ...selectedTicket, messages: updatedMessages, lastMessageAt: new Date().toISOString(), status: newStatus };
            setSelectedTicket(updatedTicket);
            setTickets(tickets.map(t => t.id === updatedTicket.id ? updatedTicket : t));
            
            // Notify user
            try {
                await base44.functions.invoke('sendEmail', {
                    to: selectedTicket.userEmail,
                    subject: `[Support] Update on your ticket: ${selectedTicket.subject}`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
                            <h2 style="color: #6b21a8; margin-bottom: 20px;">Support Ticket Update</h2>
                            <div style="color: #334155; line-height: 1.6;">
                                <p>Hello ${selectedTicket.userName},</p>
                                <p>Our support team has replied to your ticket: <strong>${selectedTicket.subject}</strong></p>
                                <p style="margin-top: 20px;"><strong>Message:</strong></p>
                                <blockquote style="border-left: 3px solid #7c3aed; padding-left: 15px; margin-left: 0; color: #475569;">${content}</blockquote>
                            </div>
                            <div style="margin-top: 30px; text-align: center;">
                                <a href="${window.location.origin}/Support" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View & Reply in Portal</a>
                            </div>
                            <p style="margin-top: 20px; font-size: 12px; color: #94a3b8; text-align: center;">Please do not reply directly to this email.</p>
                        </div>
                    `
                });
            } catch (emailError) {
                console.error("Failed to send notification email", emailError);
            }

        } catch (error) {
            console.error("Failed to send message", error);
            toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusChange = async (status) => {
        if (!selectedTicket) return;
        try {
            await SupportTicket.update(selectedTicket.id, { status });
            const updatedTicket = { ...selectedTicket, status };
            setSelectedTicket(updatedTicket);
            setTickets(tickets.map(t => t.id === updatedTicket.id ? updatedTicket : t));
            toast({ title: "Status Updated", description: `Ticket status changed to ${status}` });
        } catch (error) {
            console.error("Failed to update status", error);
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
        }
    }

    const filteredTickets = tickets.filter(ticket => {
        const matchesStatus = filterStatus === 'All' || ticket.status === filterStatus;
        const matchesCategory = filterCategory === 'All' || ticket.category === filterCategory;
        const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              ticket.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              ticket.id.includes(searchQuery);
        return matchesStatus && matchesCategory && matchesSearch;
    });

    if (userLoading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>;
    if (user?.role !== 'admin') return <div className="flex h-screen items-center justify-center">Access Denied</div>;

    return (
        <div className="flex h-screen bg-slate-50">
            <Toaster />
            <PortalSidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="AdminSupport" />
            <div className="flex-1 flex flex-col overflow-hidden">
                <PortalHeader setSidebarOpen={setSidebarOpen} user={user} />
                <main className="flex-1 overflow-hidden p-4 md:p-6">
                    <div className="max-w-[1600px] mx-auto h-full flex flex-col">
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                    Admin Support Queue
                                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">{filteredTickets.length}</Badge>
                                </h1>
                                <p className="text-slate-500">Manage and respond to user support tickets</p>
                            </div>
                        </div>

                        <div className="flex-1 flex gap-6 overflow-hidden">
                            {/* Ticket List Sidebar */}
                            <div className="w-full md:w-96 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-4 border-b border-slate-100 bg-white space-y-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input 
                                            placeholder="Search tickets..." 
                                            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-all" 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Filter className="h-4 w-4 text-slate-500 shrink-0" />
                                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                                <SelectTrigger className="h-9 text-xs w-full border-slate-200 bg-slate-50">
                                                    <SelectValue placeholder="Filter Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="All">All Statuses</SelectItem>
                                                    <SelectItem value="Open">Open</SelectItem>
                                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                                    <SelectItem value="Resolved">Resolved</SelectItem>
                                                    <SelectItem value="Closed">Closed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Tag className="h-4 w-4 text-slate-500 shrink-0" />
                                            <Select value={filterCategory} onValueChange={setFilterCategory}>
                                                <SelectTrigger className="h-9 text-xs w-full border-slate-200 bg-slate-50">
                                                    <SelectValue placeholder="Filter Category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="All">All Categories</SelectItem>
                                                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-3 bg-slate-50/30">
                                    {isLoading ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                            <Loader2 className="w-6 h-6 animate-spin mb-2" />
                                            <span className="text-xs">Loading tickets...</span>
                                        </div>
                                    ) : (
                                        <SupportTicketList 
                                            tickets={filteredTickets} 
                                            selectedTicketId={selectedTicket?.id} 
                                            onSelectTicket={setSelectedTicket} 
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Chat Area */}
                            <div className="flex-1 hidden md:flex flex-col h-full overflow-hidden">
                                {selectedTicket ? (
                                    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                        <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center z-10 shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-slate-500">Status:</span>
                                                    <Select value={selectedTicket.status} onValueChange={handleStatusChange}>
                                                        <SelectTrigger className={`w-[140px] h-8 text-xs font-medium border-0 ring-1 ring-inset ${
                                                            selectedTicket.status === 'Open' ? 'bg-green-50 text-green-700 ring-green-200' :
                                                            selectedTicket.status === 'In Progress' ? 'bg-blue-50 text-blue-700 ring-blue-200' :
                                                            selectedTicket.status === 'Resolved' ? 'bg-purple-50 text-purple-700 ring-purple-200' :
                                                            'bg-slate-50 text-slate-700 ring-slate-200'
                                                        }`}>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Open">Open</SelectItem>
                                                            <SelectItem value="In Progress">In Progress</SelectItem>
                                                            <SelectItem value="Resolved">Resolved</SelectItem>
                                                            <SelectItem value="Closed">Closed</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                {(selectedTicket.status === 'Resolved' || selectedTicket.status === 'Closed') && (
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="h-8 text-xs gap-1 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200"
                                                        onClick={() => handleStatusChange('Open')}
                                                    >
                                                        <RotateCcw className="w-3 h-3" />
                                                        Reopen
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-sm text-slate-900">{selectedTicket.userName}</p>
                                                <p className="text-xs text-slate-500">{selectedTicket.userEmail}</p>
                                            </div>
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <SupportChat 
                                                ticket={selectedTicket} 
                                                onSendMessage={handleSendMessage}
                                                isSubmitting={isSubmitting}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                            <Inbox className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900">Select a ticket</h3>
                                        <p className="text-slate-500 max-w-xs mx-auto mt-1">
                                            Choose a ticket from the queue to view details and respond.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
