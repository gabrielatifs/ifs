import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import PortalSidebar from '../components/portal/PortalSidebar';
import PortalHeader from '../components/portal/PortalHeader';
import { useUser } from '../components/providers/UserProvider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, User, Ghost, Clock, MessageSquare, Loader2, Send, Shield, CornerDownRight, MoreVertical, Pencil, Trash2, X, Check } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createPageUrl } from '@/utils';
import { useToast } from '@/components/ui/use-toast';

// Recursive Reply Component
const ReplyItem = ({ reply, replyMap, onReplyClick, depth = 0, user, onDelete, onUpdate }) => {
    const children = replyMap[reply.id] || [];
    const isNested = depth > 0;
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(reply.content);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const isAuthor = user && (user.id === reply.authorId);
    const isAdmin = user?.role === 'admin';
    const canModify = isAuthor || isAdmin;

    const handleSave = async () => {
        if (editContent.trim() === '') return;
        await onUpdate(reply.id, editContent);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditContent(reply.content);
        setIsEditing(false);
    };

    return (
        <div className={`group ${isNested ? 'ml-8 mt-4' : 'mb-4'}`}>
            <div className={`bg-white rounded-lg border border-slate-200 p-4 transition-colors hover:border-indigo-200 ${isNested ? 'bg-slate-50/50' : ''}`}>
                <div className="flex gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <div className={`p-1 rounded-full ${reply.isAnonymous ? 'bg-slate-100 text-slate-500' : 'bg-blue-50 text-blue-600'}`}>
                                    {reply.isAnonymous ? <Ghost className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                </div>
                                <span className="font-semibold text-sm text-slate-900">
                                    {reply.authorName}
                                </span>
                                {reply.authorRole === 'Admin' && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-indigo-200 text-indigo-700 bg-indigo-50">
                                        <Shield className="w-3 h-3 mr-1" /> Admin
                                    </Badge>
                                )}
                                <span className="text-xs text-slate-400">•</span>
                                <span className="text-xs text-slate-400">
                                    {reply.created_date ? formatDistanceToNow(new Date(reply.created_date), { addSuffix: true }) : ''}
                                </span>
                            </div>

                            {canModify && !isEditing && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <MoreVertical className="h-4 w-4 text-slate-400" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setIsDeleting(true)}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                        
                        {isEditing ? (
                            <div className="space-y-2">
                                <Textarea 
                                    value={editContent} 
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="min-h-[80px]"
                                />
                                <div className="flex items-center gap-2">
                                    <Button size="sm" onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
                                        <Check className="w-4 h-4 mr-1" /> Save
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={handleCancel}>
                                        <X className="w-4 h-4 mr-1" /> Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed mb-2">
                                {reply.content}
                            </div>
                        )}
                        
                        {!isEditing && (
                            <button 
                                onClick={() => onReplyClick(reply)}
                                className="text-xs font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                            >
                                <MessageSquare className="w-3 h-3" /> Reply
                            </button>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Render children recursively */}
            {children.length > 0 && (
                <div className="border-l-2 border-slate-100 ml-4">
                    {children.map(child => (
                        <ReplyItem 
                            key={child.id} 
                            reply={child} 
                            replyMap={replyMap} 
                            onReplyClick={onReplyClick}
                            depth={depth + 1}
                            user={user}
                            onDelete={onDelete}
                            onUpdate={onUpdate}
                        />
                    ))}
                </div>
            )}

            <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Reply?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this reply? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(reply.id)} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default function ForumPostDetails() {
    const { user, loading: userLoading } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [post, setPost] = useState(null);
    // replies state will hold the flat list, but we'll process it for rendering
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [replyContent, setReplyContent] = useState('');
    const [isReplyAnonymous, setIsReplyAnonymous] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null); // The reply object we are replying to
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditingPost, setIsEditingPost] = useState(false);
    const [editPostContent, setEditPostContent] = useState('');
    const [isDeletingPost, setIsDeletingPost] = useState(false);
    
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            fetchPostData();
        }
    }, [user]);

    const fetchPostData = async () => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if (!id) return;

        try {
            setLoading(true);
            const [postData, repliesData] = await Promise.all([
                base44.entities.ForumPost.get(id),
                base44.entities.ForumReply.filter({ postId: id }, 'created_date', 200)
            ]);
            
            setPost(postData);
            setReplies(repliesData);
        } catch (error) {
            console.error("Failed to fetch post data", error);
            toast({ title: "Error", description: "Could not load discussion", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };



    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        setIsSubmitting(true);
        try {
            await base44.functions.invoke('createForumReply', {
                postId: post.id,
                parentReplyId: replyingTo?.id, // Send parent ID if replying to a reply
                content: replyContent,
                isAnonymous: isReplyAnonymous
            });
            
            setReplyContent('');
            setIsReplyAnonymous(false);
            setReplyingTo(null);
            toast({ title: "Reply Posted", description: "Your reply has been added." });
            
            // Refresh data
            fetchPostData();
        } catch (error) {
            console.error("Failed to post reply", error);
            toast({ title: "Error", description: "Failed to post reply", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeletePost = async () => {
        try {
            await base44.entities.ForumPost.delete(post.id);
            toast({ title: "Post Deleted", description: "The discussion has been removed." });
            navigate(createPageUrl('Forum'));
        } catch (error) {
            console.error("Failed to delete post", error);
            toast({ title: "Error", description: "Failed to delete post", variant: "destructive" });
        }
    };

    const handleUpdatePost = async () => {
        if (!editPostContent.trim()) return;
        try {
            await base44.entities.ForumPost.update(post.id, { content: editPostContent });
            setPost(prev => ({ ...prev, content: editPostContent }));
            setIsEditingPost(false);
            toast({ title: "Post Updated", description: "Your post has been updated." });
        } catch (error) {
            console.error("Failed to update post", error);
            toast({ title: "Error", description: "Failed to update post", variant: "destructive" });
        }
    };

    const handleDeleteReply = async (replyId) => {
        try {
            await base44.entities.ForumReply.delete(replyId);
            toast({ title: "Reply Deleted", description: "The reply has been removed." });
            fetchPostData();
        } catch (error) {
            console.error("Failed to delete reply", error);
            toast({ title: "Error", description: "Failed to delete reply", variant: "destructive" });
        }
    };

    const handleUpdateReply = async (replyId, newContent) => {
        try {
            await base44.entities.ForumReply.update(replyId, { content: newContent });
            // Optimistically update the list or fetch again
            setReplies(prev => prev.map(r => r.id === replyId ? { ...r, content: newContent } : r));
            toast({ title: "Reply Updated", description: "Reply updated successfully." });
        } catch (error) {
            console.error("Failed to update reply", error);
            toast({ title: "Error", description: "Failed to update reply", variant: "destructive" });
        }
    };

    // Organize replies into a tree structure
    const replyTree = React.useMemo(() => {
        const map = {}; // parentId -> [children]
        // Initialize with empty arrays for all potential parents (including null for root)
        map['root'] = []; 
        
        replies.forEach(r => {
            if (!map[r.id]) map[r.id] = [];
            const parentId = r.parentReplyId || 'root';
            if (!map[parentId]) map[parentId] = [];
            map[parentId].push(r);
        });
        
        return map;
    }, [replies]);

    if (userLoading || (loading && !post)) return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;

    if (!post) return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <div className="text-center">
                <h2 className="text-xl font-bold text-slate-900">Discussion not found</h2>
                <Button asChild className="mt-4" variant="outline">
                    <Link to={createPageUrl('Forum')}>Back to Forum</Link>
                </Button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-slate-50">
            <PortalSidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="Forum" />
            <div className="flex-1 flex flex-col overflow-hidden">
                <PortalHeader setSidebarOpen={setSidebarOpen} user={user} />
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-4xl mx-auto pb-20">
                        <AlertDialog open={isDeletingPost} onOpenChange={setIsDeletingPost}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Discussion?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete this discussion and all its replies? This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeletePost} className="bg-red-600 hover:bg-red-700">
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <Button asChild variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-indigo-600">
                            <Link to={createPageUrl('Forum')}>
                                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Discussions
                            </Link>
                        </Button>

                        {/* Main Post */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                            <div className="p-6 md:p-8 flex gap-6">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className={`p-3 rounded-full flex-shrink-0 ${post.isAnonymous ? 'bg-slate-100 text-slate-500' : 'bg-indigo-50 text-indigo-600'}`}>
                                            {post.isAnonymous ? <Ghost className="w-6 h-6" /> : <User className="w-6 h-6" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                                                    {post.title}
                                                </h1>
                                                {(user && (user.id === post.authorId || user.role === 'admin')) && !isEditingPost && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <MoreVertical className="h-4 w-4 text-slate-400" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => {
                                                                setEditPostContent(post.content);
                                                                setIsEditingPost(true);
                                                            }}>
                                                                <Pencil className="mr-2 h-4 w-4" /> Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setIsDeletingPost(true)}>
                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                                <span className="font-semibold text-slate-900">
                                                    {post.authorName}
                                                </span>
                                                {post.authorRole === 'Admin' && (
                                                    <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-0">Admin</Badge>
                                                )}
                                                <span className="text-slate-300">•</span>
                                                <span className="text-slate-500">
                                                    {post.created_date ? format(new Date(post.created_date), 'MMM d, yyyy') : 'Unknown date'}
                                                </span>
                                                <span className="text-slate-300">•</span>
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-normal">
                                                    {post.category}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {isEditingPost ? (
                                        <div className="space-y-3 mb-6">
                                            <Textarea 
                                                value={editPostContent} 
                                                onChange={(e) => setEditPostContent(e.target.value)}
                                                className="min-h-[150px]"
                                            />
                                            <div className="flex items-center gap-2">
                                                <Button onClick={handleUpdatePost} className="bg-indigo-600 hover:bg-indigo-700">
                                                    <Check className="w-4 h-4 mr-1" /> Save Changes
                                                </Button>
                                                <Button variant="ghost" onClick={() => setIsEditingPost(false)}>
                                                    <X className="w-4 h-4 mr-1" /> Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed mb-6">
                                            {post.content}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center gap-4 text-sm text-slate-500">
                                <div className="flex items-center gap-1.5">
                                    <MessageSquare className="w-4 h-4" />
                                    {post.replyCount || 0} replies
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    Last activity {post.lastActivityAt ? formatDistanceToNow(new Date(post.lastActivityAt), { addSuffix: true }) : 'Just now'}
                                </div>
                            </div>
                        </div>

                        {/* Replies Section */}
                        <div className="space-y-6 mb-10">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-slate-900">
                                    {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
                                </h3>
                            </div>
                            
                            {replyTree['root'] && replyTree['root'].length > 0 ? (
                                <div>
                                    {replyTree['root'].map(reply => (
                                        <ReplyItem 
                                            key={reply.id} 
                                            reply={reply} 
                                            replyMap={replyTree} 
                                            onReplyClick={(r) => {
                                                setReplyingTo(r);
                                                // Scroll to reply form
                                                document.getElementById('reply-form').scrollIntoView({ behavior: 'smooth' });
                                            }}
                                            user={user}
                                            onDelete={handleDeleteReply}
                                            onUpdate={handleUpdateReply}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-white rounded-lg border border-dashed border-slate-300">
                                    <p className="text-slate-500 italic">No replies yet. Be the first to join the conversation.</p>
                                </div>
                            )}
                        </div>

                        {/* Reply Form */}
                        <div id="reply-form" className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                {replyingTo ? (
                                    <div className="flex items-center gap-2">
                                        <span>Replying to {replyingTo.authorName}</span>
                                        <button 
                                            onClick={() => setReplyingTo(null)}
                                            className="text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded text-slate-500 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : 'Leave a Reply'}
                            </h3>
                            
                            {replyingTo && (
                                <div className="mb-4 p-3 bg-slate-50 border-l-4 border-indigo-200 text-sm text-slate-600 italic rounded-r">
                                    "{replyingTo.content.length > 100 ? replyingTo.content.substring(0, 100) + '...' : replyingTo.content}"
                                </div>
                            )}

                            <form onSubmit={handleReplySubmit}>
                                <Textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder={replyingTo ? "Write your reply..." : "Share your thoughts..."}
                                    className="min-h-[120px] mb-4 focus-visible:ring-indigo-500"
                                    required
                                />
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-3">
                                        <Switch 
                                            id="anon-reply" 
                                            checked={isReplyAnonymous}
                                            onCheckedChange={setIsReplyAnonymous}
                                        />
                                        <Label htmlFor="anon-reply" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                                            <Ghost className="w-4 h-4 text-slate-500" />
                                            Reply Anonymously
                                        </Label>
                                    </div>
                                    <Button type="submit" disabled={isSubmitting || !replyContent.trim()} className="bg-indigo-600 hover:bg-indigo-700">
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                                        Post Reply
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}