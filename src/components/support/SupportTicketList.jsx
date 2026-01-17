import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Clock, AlertCircle, CheckCircle2, Circle, ArrowUpCircle } from 'lucide-react';

export default function SupportTicketList({ tickets, selectedTicketId, onSelectTicket }) {
    if (!tickets || tickets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                    <MessageSquare className="w-6 h-6 text-slate-300" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">No tickets found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-[180px]">Create a new ticket to get help from our support team.</p>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Open': return 'bg-green-100 text-green-700 border-green-200';
            case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Resolved': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Closed': return 'bg-slate-100 text-slate-700 border-slate-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Open': return <Circle className="w-3 h-3" />;
            case 'In Progress': return <ArrowUpCircle className="w-3 h-3" />;
            case 'Resolved': return <CheckCircle2 className="w-3 h-3" />;
            case 'Closed': return <CheckCircle2 className="w-3 h-3" />;
            default: return <Circle className="w-3 h-3" />;
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'High': return <AlertCircle className="w-3 h-3 text-red-500" />;
            case 'Medium': return <AlertCircle className="w-3 h-3 text-amber-500" />;
            case 'Low': return <AlertCircle className="w-3 h-3 text-blue-500" />;
            default: return null;
        }
    };

    return (
        <div className="space-y-2">
            {tickets.map((ticket) => (
                <div 
                    key={ticket.id}
                    onClick={() => onSelectTicket(ticket)}
                    className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md ${
                        selectedTicketId === ticket.id 
                            ? 'bg-white border-purple-600 shadow-md ring-1 ring-purple-100' 
                            : 'bg-white border-slate-200 hover:border-purple-300'
                    }`}
                >
                    <div className="flex justify-between items-start gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(ticket.status)}`}>
                                    {getStatusIcon(ticket.status)}
                                    {ticket.status}
                                </span>
                                {ticket.priority === 'High' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-700 border border-red-100">
                                        High Priority
                                    </span>
                                )}
                            </div>
                            <h4 className={`text-sm font-semibold truncate ${selectedTicketId === ticket.id ? 'text-purple-900' : 'text-slate-900'}`}>
                                {ticket.subject}
                            </h4>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 whitespace-nowrap flex items-center gap-1">
                            {ticket.lastMessageAt ? formatDistanceToNow(new Date(ticket.lastMessageAt), { addSuffix: true }) : 'New'}
                        </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">#{ticket.id.slice(0, 8)}</span>
                            <span>•</span>
                            <span>{ticket.category}</span>
                        </div>
                    </div>
                    
                    {/* Active Indicator Strip */}
                    {selectedTicketId === ticket.id && (
                        <div className="absolute left-0 top-4 bottom-4 w-1 bg-purple-600 rounded-r-full" />
                    )}
                </div>
            ))}
        </div>
    );
}