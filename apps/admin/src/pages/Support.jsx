import React, { useState, useEffect } from 'react';
import { ifs } from '@ifs/shared/api/ifsClient';
import { SupportTicket } from '@ifs/shared/api/entities';
import PortalSidebar from '../components/portal/PortalSidebar';
import PortalHeader from '../components/portal/PortalHeader';
import { useUser } from '@ifs/shared/components/providers/UserProvider';
import { Button } from '@ifs/shared/components/ui/button';
import { Plus, Loader2, MessageCircle, Search } from 'lucide-react';
import { Input } from '@ifs/shared/components/ui/input';
import { useToast } from "@ifs/shared/components/ui/use-toast";
import { Toaster } from "@ifs/shared/components/ui/toaster";
import SupportTicketList from '../components/support/SupportTicketList';
import SupportChat from '../components/support/SupportChat';
import CreateTicketModal from '../components/support/CreateTicketModal';
import { createPageUrl } from '@ifs/shared/utils';

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

export default function Support() {
    const { user, loading: userLoading } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'archived'
    const { toast } = useToast();

    useEffect(() => {
        if (user) {
            fetchTickets();
        }
    }, [user]);

    const fetchTickets = async () => {
        setIsLoading(true);
        try {
            const fetchedTickets = await SupportTicket.filter({ userId: user.id }, '-lastMessageAt');
            const normalizedTickets = fetchedTickets.map((ticket) => ({
                ...ticket,
                messages: normalizeMessages(ticket.messages)
            }));
            setTickets(normalizedTickets);
            if (normalizedTickets.length > 0 && !selectedTicket) {
                setSelectedTicket(normalizedTickets[0]);
            }
        } catch (error) {
            console.error("Failed to fetch tickets", error);
            toast({ title: "Error", description: "Failed to load support tickets", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateTicket = async (data) => {
        setIsSubmitting(true);
        try {
            const newTicket = {
                userId: user.id,
                userEmail: user.email,
                userName: user.displayName || user.full_name,
                subject: data.subject,
                category: data.category,
                priority: data.priority,
                status: 'Open',
                messages: [{
                    id: crypto.randomUUID(),
                    senderId: user.id,
                    senderName: user.displayName || user.full_name,
                    senderRole: 'user',
                    content: data.initialMessage,
                    timestamp: new Date().toISOString()
                }, {
                    id: crypto.randomUUID(),
                    senderId: 'system',
                    senderName: 'System',
                    senderRole: 'admin',
                    content: 'Thank you for your ticket. Our typical response time is 2 hours.',
                    timestamp: new Date(Date.now() + 1000).toISOString()
                }],
                lastMessageAt: new Date().toISOString()
            };

            const createdTicket = await SupportTicket.create(newTicket);
            setTickets([createdTicket, ...tickets]);
            setSelectedTicket(createdTicket);
            setIsModalOpen(false);
            
            // Notify admin
            try {
                await ifs.functions.invoke('sendEmail', {
                    to: 'info@ifs-safeguarding.co.uk',
                    subject: `[Support] New Ticket: ${data.subject}`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
                            <h2 style="color: #6b21a8; margin-bottom: 20px;">New Support Ticket</h2>
                            <div style="color: #334155; line-height: 1.6;">
                                <p>A new support ticket has been created by <strong>${user.displayName || user.email}</strong>.</p>
                                <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0;">
                                    <p style="margin: 5px 0;"><strong>Subject:</strong> ${data.subject}</p>
                                    <p style="margin: 5px 0;"><strong>Category:</strong> ${data.category}</p>
                                    <p style="margin: 5px 0;"><strong>Priority:</strong> ${data.priority}</p>
                                </div>
                                <p><strong>Message:</strong></p>
                                <blockquote style="border-left: 3px solid #7c3aed; padding-left: 15px; margin-left: 0; color: #475569;">${data.initialMessage}</blockquote>
                            </div>
                            <div style="margin-top: 30px; text-align: center;">
                                <a href="${createPageUrl('AdminSupport')}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Ticket in Admin Portal</a>
                            </div>
                        </div>
                    `
                });
            } catch (emailError) {
                console.error("Failed to send notification email", emailError);
            }

            toast({ title: "Success", description: "Ticket created successfully" });
        } catch (error) {
            console.error("Failed to create ticket", error);
            toast({ title: "Error", description: "Failed to create ticket", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
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
                senderRole: 'user',
                content: content,
                timestamp: new Date().toISOString()
            };

            const updatedMessages = [...normalizeMessages(selectedTicket.messages), newMessage];
            
            // If ticket is Resolved or Closed, reopen it? Let's assume user reply reopens if not closed permanently
            const newStatus = selectedTicket.status === 'Resolved' ? 'In Progress' : selectedTicket.status;

            await SupportTicket.update(selectedTicket.id, {
                messages: updatedMessages,
                lastMessageAt: new Date().toISOString(),
                status: newStatus
            });

            const updatedTicket = { ...selectedTicket, messages: updatedMessages, lastMessageAt: new Date().toISOString(), status: newStatus };
            setSelectedTicket(updatedTicket);
            setTickets(tickets.map(t => t.id === updatedTicket.id ? updatedTicket : t));
            
            // Notify admin
            try {
                await ifs.functions.invoke('sendEmail', {
                    to: 'info@ifs-safeguarding.co.uk',
                    subject: `[Support] Reply on Ticket: ${selectedTicket.subject}`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
                            <h2 style="color: #6b21a8; margin-bottom: 20px;">New Ticket Reply</h2>
                            <div style="color: #334155; line-height: 1.6;">
                                <p><strong>${user.displayName || user.email}</strong> replied to ticket #${selectedTicket.id.slice(0, 8)}.</p>
                                <p style="margin-top: 20px;"><strong>Message:</strong></p>
                                <blockquote style="border-left: 3px solid #7c3aed; padding-left: 15px; margin-left: 0; color: #475569;">${content}</blockquote>
                            </div>
                            <div style="margin-top: 30px; text-align: center;">
                                <a href="${createPageUrl('AdminSupport')}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Ticket in Admin Portal</a>
                            </div>
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

    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              ticket.id.includes(searchQuery);
        
        const isArchived = ticket.status === 'Resolved' || ticket.status === 'Closed';
        const matchesTab = activeTab === 'archived' ? isArchived : !isArchived;

        return matchesSearch && matchesTab;
    });

    if (userLoading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>;

    return (
        <div className="flex h-screen bg-slate-50">
            <Toaster />
            <PortalSidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="Support" />
            <div className="flex-1 flex flex-col overflow-hidden">
                <PortalHeader setSidebarOpen={setSidebarOpen} user={user} />
                <main className="flex-1 overflow-hidden p-4 md:p-6">
                    <div className="max-w-7xl mx-auto h-full flex flex-col">
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Support</h1>
                                <p className="text-slate-500">Get help with your membership or technical issues</p>
                            </div>
                            <Button onClick={() => setIsModalOpen(true)} className="bg-purple-600 hover:bg-purple-700 shadow-sm">
                                <Plus className="w-4 h-4 mr-2" /> New Ticket
                            </Button>
                        </div>

                        <div className="flex-1 flex gap-6 overflow-hidden">
                            {/* Ticket List Sidebar */}
                            <div className="w-full md:w-80 lg:w-96 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-4 border-b border-slate-100 bg-white space-y-3">
                                    <div className="flex p-1 bg-slate-100 rounded-lg">
                                        <button
                                            onClick={() => setActiveTab('active')}
                                            className={`flex-1 text-sm font-medium py-1.5 px-3 rounded-md transition-all ${
                                                activeTab === 'active' 
                                                    ? 'bg-white text-purple-700 shadow-sm' 
                                                    : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                        >
                                            Active
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('archived')}
                                            className={`flex-1 text-sm font-medium py-1.5 px-3 rounded-md transition-all ${
                                                activeTab === 'archived' 
                                                    ? 'bg-white text-purple-700 shadow-sm' 
                                                    : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                        >
                                            Resolved
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input 
                                            placeholder="Search tickets..." 
                                            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-all" 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
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
                            <div className="flex-1 hidden md:block h-full">
                                {selectedTicket ? (
                                    <SupportChat 
                                        ticket={selectedTicket} 
                                        onSendMessage={handleSendMessage}
                                        isSubmitting={isSubmitting}
                                    />
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                                        <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                                            <MessageCircle className="w-8 h-8 text-purple-300" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900">Select a ticket</h3>
                                        <p className="text-slate-500 max-w-xs mx-auto mt-1">
                                            Choose a ticket from the list to view the conversation or create a new one.
                                        </p>
                                        <Button onClick={() => setIsModalOpen(true)} variant="outline" className="mt-6">
                                            Create New Ticket
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <CreateTicketModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSubmit={handleCreateTicket}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}
