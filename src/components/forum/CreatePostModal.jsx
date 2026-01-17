import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, MessageSquare, Shield, Ghost } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

const categories = ["Introductions", "Masterclasses", "Regulation", "Professional Support"];

export default function CreatePostModal({ isOpen, onClose, onPostCreated, defaultCategory }) {
    const [formData, setFormData] = useState({
        title: '',
        category: defaultCategory || 'Introductions',
        content: '',
        isAnonymous: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (defaultCategory) {
            setFormData(prev => ({ ...prev, category: defaultCategory }));
        }
    }, [defaultCategory, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await base44.functions.invoke('createForumPost', formData);
            toast({
                title: "Post Created",
                description: "Your discussion has been posted successfully."
            });
            onPostCreated();
            onClose();
            setFormData({
                title: '',
                category: defaultCategory || 'Introductions',
                content: '',
                isAnonymous: false
            });
        } catch (error) {
            console.error("Failed to create post", error);
            toast({
                title: "Error",
                description: "Failed to create post. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <MessageSquare className="w-5 h-5 text-indigo-600" />
                        </div>
                        <DialogTitle className="text-xl">Start a Discussion</DialogTitle>
                    </div>
                    <DialogDescription>
                        Share your thoughts, ask questions, or seek advice from the community.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-5 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input 
                            id="title" 
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            placeholder="What's on your mind?"
                            required
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select 
                            value={formData.category} 
                            onValueChange={(value) => setFormData({...formData, category: value})}
                            disabled={!!defaultCategory}
                        >
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Content</Label>
                        <Textarea 
                            id="content" 
                            value={formData.content}
                            onChange={(e) => setFormData({...formData, content: e.target.value})}
                            placeholder="Write your post details here..."
                            rows={6}
                            required
                        />
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-center justify-between">
                        <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${formData.isAnonymous ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                <Ghost className="w-5 h-5" />
                            </div>
                            <div>
                                <Label htmlFor="anonymous" className="font-semibold cursor-pointer">Post Anonymously</Label>
                                <p className="text-xs text-slate-500 mt-0.5 max-w-[300px]">
                                    Your name and profile will be completely hidden. This cannot be undone.
                                </p>
                            </div>
                        </div>
                        <Switch 
                            id="anonymous" 
                            checked={formData.isAnonymous}
                            onCheckedChange={(checked) => setFormData({...formData, isAnonymous: checked})}
                        />
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={isSubmitting}>
                            {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Posting...</> : 'Post Discussion'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}