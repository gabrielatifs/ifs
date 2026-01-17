import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@ifs/shared/components/ui/card';
import { Button } from '@ifs/shared/components/ui/button';
import { Textarea } from '@ifs/shared/components/ui/textarea';
import { MessageSquare, CheckCircle2, Loader2, X } from 'lucide-react';
import { base44 } from '@ifs/shared/api/base44Client';
import { useToast } from "@ifs/shared/components/ui/use-toast";
import { useUser } from '@ifs/shared/components/providers/UserProvider';
import { createPageUrl } from '@ifs/shared/utils';

export default function CommunityIntroCard() {
    const { user, updateUserProfile } = useUser();
    const { toast } = useToast();
    const [introContent, setIntroContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        // Prepopulate with a draft if available
        if (user) {
            const sectorText = user.sector === 'Other' ? user.other_sector : user.sector;
            const subSectorText = user.subsector ? (user.subsector === 'Other' ? user.other_sub_sector : user.subsector) : '';
            
            let intro = `Hi everyone, I'm ${user.firstName} and I work as a ${user.jobRole} at ${user.organisationName}.\n\nI primarily work in the ${sectorText} sector`;
            
            if (subSectorText) {
                intro += ` (${subSectorText})`;
            }
            
            intro += `.\n\nI'm looking forward to connecting with you all and sharing best practice in safeguarding.`;
            
            setIntroContent(intro);
        }
    }, [user]);

    const handlePost = async () => {
        if (!introContent.trim()) return;
        
        setIsSubmitting(true);
        try {
            // 1. Create Forum Post
            const { data: newPost } = await base44.functions.invoke('createForumPost', {
                title: `Hello from ${user.firstName}`,
                content: introContent,
                category: 'Introductions',
                isAnonymous: false
            });
            
            // 2. Update User Profile
            await updateUserProfile({ hasPostedIntro: true });
            
            toast({
                title: "Introduction Posted!",
                description: "Your introduction is now live in the Community Forum.",
            });
            
            if (newPost && newPost.id) {
                window.location.href = createPageUrl(`ForumPostDetails?id=${newPost.id}`);
            }
            
        } catch (error) {
            console.error('Failed to post introduction:', error);
            toast({
                title: "Error",
                description: "Failed to post introduction. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDismiss = () => {
        setIsDismissed(true);
        // Optional: Persist dismissal if you don't want it to show again this session
        // But user attribute hasPostedIntro is better for permanent state
    };

    if (isDismissed || user?.hasPostedIntro) {
        return null;
    }

    return (
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-purple-100 shadow-sm relative overflow-hidden">
            <button 
                onClick={handleDismiss}
                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-white/50 transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
            
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-1">
                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-lg text-slate-900">Introduce Yourself</CardTitle>
                </div>
                <CardDescription>
                    Connect with the community by posting a quick introduction.
                </CardDescription>
            </CardHeader>
            
            <CardContent className="pb-2">
                <Textarea 
                    value={introContent}
                    onChange={(e) => setIntroContent(e.target.value)}
                    className="bg-white min-h-[100px] border-purple-200 focus:border-purple-400"
                    placeholder="Write a short bio..."
                />
            </CardContent>
            
            <CardFooter className="justify-end pt-2">
                <Button 
                    onClick={handlePost} 
                    disabled={isSubmitting || !introContent.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Posting...
                        </>
                    ) : (
                        <>
                            Post Introduction
                            <CheckCircle2 className="w-4 h-4 ml-2" />
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}