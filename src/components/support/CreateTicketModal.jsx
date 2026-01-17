import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Ticket } from 'lucide-react';

const categories = ["General", "Technical", "Billing", "Membership", "Training", "Other"];
const priorities = ["Low", "Medium", "High"];

export default function CreateTicketModal({ isOpen, onClose, onSubmit, isSubmitting }) {
    const [formData, setFormData] = useState({
        subject: '',
        category: 'General',
        priority: 'Medium',
        initialMessage: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Ticket className="w-5 h-5 text-purple-600" />
                        </div>
                        <DialogTitle className="text-xl">Create Support Ticket</DialogTitle>
                    </div>
                    <DialogDescription>
                        Describe your issue below. Our typical response time is 2 hours.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-5 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="subject" className="text-sm font-semibold text-slate-900">Subject</Label>
                        <Input 
                            id="subject" 
                            value={formData.subject}
                            onChange={(e) => setFormData({...formData, subject: e.target.value})}
                            placeholder="Brief summary of the issue"
                            className="focus-visible:ring-purple-500"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category" className="text-sm font-semibold text-slate-900">Category</Label>
                            <Select 
                                value={formData.category} 
                                onValueChange={(value) => setFormData({...formData, category: value})}
                            >
                                <SelectTrigger id="category" className="focus:ring-purple-500">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="priority" className="text-sm font-semibold text-slate-900">Priority</Label>
                            <Select 
                                value={formData.priority} 
                                onValueChange={(value) => setFormData({...formData, priority: value})}
                            >
                                <SelectTrigger id="priority" className="focus:ring-purple-500">
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    {priorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message" className="text-sm font-semibold text-slate-900">Message</Label>
                        <Textarea 
                            id="message" 
                            value={formData.initialMessage}
                            onChange={(e) => setFormData({...formData, initialMessage: e.target.value})}
                            placeholder="Please describe your issue in detail..."
                            rows={5}
                            className="resize-none focus-visible:ring-purple-500"
                            required
                        />
                    </div>
                    <DialogFooter className="gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                        <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={isSubmitting || !formData.subject || !formData.initialMessage}>
                            {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : 'Create Ticket'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}