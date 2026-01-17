import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
    Send, Loader2, User, Shield, MoreHorizontal, 
    Clock, Calendar, Tag, AlertCircle 
} from 'lucide-react';
import { format } from 'date-fns';

export default function SupportChat({ ticket, onSendMessage, isSubmitting }) {
    const [newMessage, setNewMessage] = useState('');
    const scrollRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [ticket.messages, ticket.id]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        onSendMessage(newMessage);
        setNewMessage('');
        // Reset height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(e);
        }
    };

    const handleInput = (e) => {
        const target = e.target;
        setNewMessage(target.value);
        target.style.height = 'auto';
        target.style.height = `${Math.min(target.scrollHeight, 150)}px`;
    };

    if (!ticket) return null;

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Chat Header */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-slate-100 bg-white z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-lg font-bold text-slate-900 line-clamp-1">{ticket.subject}</h2>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                ticket.status === 'Open' ? 'bg-green-100 text-green-700' :
                                ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                ticket.status === 'Resolved' ? 'bg-purple-100 text-purple-700' :
                                'bg-slate-100 text-slate-700'
                            }`}>
                                {ticket.status}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                {ticket.category}
                            </span>
                            <span className="flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {ticket.priority} Priority
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Updated {format(new Date(ticket.lastMessageAt), 'MMM d, HH:mm')}
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="font-mono bg-slate-100 px-1 rounded">#{ticket.id.slice(0, 8)}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-6 bg-slate-50/50">
                <div className="space-y-6 max-w-3xl mx-auto">
                    {/* Initial Ticket Description */}
                    <div className="flex justify-center">
                        <div className="bg-slate-100 text-slate-500 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Ticket created on {format(new Date(ticket.messages?.[0]?.timestamp || new Date()), 'MMMM d, yyyy')}
                        </div>
                    </div>

                    {ticket.messages?.map((msg, index) => {
                        const isUser = msg.senderRole === 'user';
                        const isAdmin = msg.senderRole === 'admin';
                        const isSystem = msg.senderRole === 'system';
                        
                        if (isSystem) {
                            return (
                                <div key={index} className="flex justify-center my-4">
                                    <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded">{msg.content}</span>
                                </div>
                            );
                        }

                        return (
                            <div key={index} className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                <Avatar className="w-8 h-8 border-2 border-white shadow-sm">
                                    <AvatarFallback className={`${isUser ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'} text-xs font-bold`}>
                                        {isUser ? <User className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                    </AvatarFallback>
                                </Avatar>
                                
                                <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-center gap-2 mb-1 px-1">
                                        <span className="text-xs font-medium text-slate-700">{msg.senderName}</span>
                                        <span className="text-[10px] text-slate-400">{format(new Date(msg.timestamp), 'HH:mm')}</span>
                                    </div>
                                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                                        isUser 
                                            ? 'bg-purple-600 text-white rounded-tr-none' 
                                            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                                    }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input Area */}
            {ticket.status !== 'Closed' && ticket.status !== 'Resolved' ? (
                <div className="p-4 bg-white border-t border-slate-100">
                    <div className="max-w-3xl mx-auto relative flex gap-2 items-end">
                        <div className="flex-1 relative">
                            <Textarea 
                                ref={textareaRef}
                                value={newMessage}
                                onChange={handleInput}
                                onKeyDown={handleKeyDown}
                                placeholder="Type your message..."
                                className="min-h-[50px] max-h-[150px] w-full resize-none py-3 px-4 pr-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-purple-300 rounded-xl transition-all"
                                disabled={isSubmitting}
                            />
                        </div>
                        <Button 
                            onClick={handleSend} 
                            disabled={isSubmitting || !newMessage.trim()} 
                            className={`h-[50px] w-[50px] rounded-xl shrink-0 transition-all ${
                                newMessage.trim() 
                                    ? 'bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-200' 
                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </Button>
                    </div>
                    <p className="text-[10px] text-slate-400 text-center mt-2">
                        Press Enter to send • Shift + Enter for new line
                    </p>
                </div>
            ) : (
                <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
                    <p className="text-sm text-slate-500 font-medium flex items-center justify-center gap-2">
                        <Shield className="w-4 h-4" />
                        This ticket has been {ticket.status.toLowerCase()}.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Replies are disabled for {ticket.status.toLowerCase()} tickets. Create a new ticket if you need further assistance.</p>
                </div>
            )}
        </div>
    );
}