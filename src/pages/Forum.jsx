import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import PortalSidebar from '../components/portal/PortalSidebar';
import PortalHeader from '../components/portal/PortalHeader';
import { useUser } from '../components/providers/UserProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Search, MessageSquare, Clock, User, Ghost, Loader2, Filter, ThumbsUp, Shield, ArrowLeft, Users, BookOpen, Scale, HeartHandshake, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CreatePostModal from '../components/forum/CreatePostModal';

const CATEGORIES = [
    {
        id: "Introductions",
        title: "Introductions",
        description: "Say hello to the community and introduce yourself.",
        icon: <Users className="w-8 h-8 text-blue-500" />,
        color: "bg-blue-50 border-blue-100"
    },
    {
        id: "Masterclasses",
        title: "Masterclasses",
        description: "Discuss insights and learnings from recent masterclasses.",
        icon: <BookOpen className="w-8 h-8 text-purple-500" />,
        color: "bg-purple-50 border-purple-100"
    },
    {
        id: "Regulation",
        title: "Regulation",
        description: "Updates, questions, and discussions about safeguarding regulations.",
        icon: <Scale className="w-8 h-8 text-orange-500" />,
        color: "bg-orange-50 border-orange-100"
    },
    {
        id: "Professional Support",
        title: "Professional Support",
        description: "Seek advice, share challenges, and support your peers.",
        icon: <HeartHandshake className="w-8 h-8 text-green-500" />,
        color: "bg-green-50 border-green-100"
    }
];

export default function Forum() {
    const { user, loading: userLoading } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [categoryCounts, setCategoryCounts] = useState({});
    
    const location = useLocation();
    const navigate = useNavigate();
    
    // Get selected category from URL query param
    const queryParams = new URLSearchParams(location.search);
    const currentCategory = queryParams.get('category');

    const fetchPosts = async () => {
        if (!currentCategory) return;
        
        setIsLoading(true);
        try {
            // Fetch posts filtered by category
            const fetchedPosts = await base44.entities.ForumPost.filter({ category: currentCategory }, '-lastActivityAt', 50);
            setPosts(fetchedPosts);
        } catch (error) {
            console.error("Failed to fetch posts", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCategoryCounts = async () => {
        try {
            const counts = {};
            await Promise.all(CATEGORIES.map(async (cat) => {
                // Fetching with a higher limit to get a better count estimate, though exact total might require a different API if available
                const posts = await base44.entities.ForumPost.filter({ category: cat.id }, '', 100); 
                counts[cat.id] = posts.length;
            }));
            setCategoryCounts(counts);
        } catch (error) {
            console.error("Failed to fetch category counts", error);
        }
    };

    useEffect(() => {
        if (user) {
            if (currentCategory) {
                fetchPosts();
            } else {
                fetchCategoryCounts();
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    }, [user, currentCategory]);

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              post.content.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    if (userLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;

    const categoryInfo = CATEGORIES.find(c => c.id === currentCategory);

    return (
        <div className="flex h-screen bg-slate-50">
            <PortalSidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="Forum" />
            <div className="flex-1 flex flex-col overflow-hidden">
                <PortalHeader setSidebarOpen={setSidebarOpen} user={user} />
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-5xl mx-auto space-y-6">
                        
                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                {currentCategory ? (
                                    <div className="space-y-2">
                                        <Link to={createPageUrl('Forum')} className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm font-medium mb-1">
                                            <ArrowLeft className="w-4 h-4" /> Back to Categories
                                        </Link>
                                        <h1 className="text-3xl font-bold text-slate-900">{currentCategory}</h1>
                                        <p className="text-slate-600">{categoryInfo?.description}</p>
                                    </div>
                                ) : (
                                    <div>
                                        <h1 className="text-3xl font-bold text-slate-900">Forum</h1>
                                        <p className="text-slate-600 mt-1">Connect, share, and learn from fellow safeguarding professionals.</p>
                                    </div>
                                )}
                            </div>
                            
                            {currentCategory && (
                                <Button onClick={() => setIsCreateModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 shadow-sm">
                                    <Plus className="w-4 h-4 mr-2" /> Start Discussion
                                </Button>
                            )}
                        </div>

                        {/* Main Content Area */}
                        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                            {/* Table Header */}
                            <div className="bg-sky-500 text-white px-6 py-4 border-b border-sky-600 flex justify-between items-center">
                                <h2 className="text-lg font-bold">{currentCategory || 'All Forums'}</h2>
                                {currentCategory && (
                                    <div className="flex items-center text-sm bg-sky-600/50 px-3 py-1 rounded-full">
                                        <Clock className="w-4 h-4 mr-2" />
                                        <span>Latest Activity</span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Table Column Headers */}
                            <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                                {!currentCategory ? (
                                    <>
                                        <div className="flex-1">Category</div>
                                        <div className="w-24 text-center">Posts</div>
                                        <div className="w-8"></div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex-1">Topic</div>
                                        <div className="w-20 text-center hidden md:block">Replies</div>
                                        <div className="w-32 text-center hidden md:block">Author</div>
                                        <div className="w-32 text-right hidden sm:block">Date</div>
                                    </>
                                )}
                            </div>

                            {!currentCategory ? (
                                /* Categories List View */
                                <div className="divide-y divide-slate-100">
                                    {CATEGORIES.map((category) => (
                                        <div key={category.id} className="hover:bg-slate-50 transition-colors">
                                            <Link 
                                                to={`${createPageUrl('Forum')}?category=${encodeURIComponent(category.id)}`}
                                                className="flex items-center px-6 py-4"
                                            >
                                                <div className="w-12 flex justify-center flex-shrink-0">
                                                    <div className={`p-2 rounded-full ${category.color.replace('border-', '')}`}>
                                                        {React.cloneElement(category.icon, { className: "w-6 h-6" })}
                                                    </div>
                                                </div>
                                                <div className="flex-1 px-4">
                                                    <h3 className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                                                        {category.title}
                                                    </h3>
                                                    <p className="text-sm text-slate-500 mt-0.5">
                                                        {category.description}
                                                    </p>
                                                </div>
                                                <div className="w-24 text-center font-medium text-slate-600">
                                                    {categoryCounts[category.id] !== undefined ? (
                                                        <span>{categoryCounts[category.id]}{categoryCounts[category.id] >= 100 ? '+' : ''}</span>
                                                    ) : (
                                                        <span className="text-slate-400">-</span>
                                                    )}
                                                </div>
                                                <div className="w-8 flex justify-center text-slate-400">
                                                    <ChevronRight className="w-5 h-5" />
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                /* Posts List View */
                                <div>
                                    {/* Search Bar embedded in list */}
                                    <div className="p-4 bg-slate-50/50 border-b border-slate-100">
                                        <div className="relative max-w-md">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input 
                                                placeholder={`Search topics in ${currentCategory}...`}
                                                className="pl-10 bg-white border-slate-200 h-9"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="divide-y divide-slate-100">
                                        {isLoading ? (
                                            <div className="flex justify-center py-12">
                                                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                                            </div>
                                        ) : filteredPosts.length > 0 ? (
                                            filteredPosts.map(post => (
                                                <div key={post.id} className="group hover:bg-slate-50 transition-colors">
                                                    <Link 
                                                        to={createPageUrl(`ForumPostDetails?id=${post.id}`)} 
                                                        className="flex items-center px-6 py-4"
                                                    >
                                                        {/* Topic Info */}
                                                        <div className="flex-1 px-4 min-w-0 pl-0">
                                                            <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1">
                                                                {post.title}
                                                            </h3>
                                                            <div className="flex items-center text-xs text-slate-500 line-clamp-1">
                                                                <span className="truncate max-w-[300px]">{post.content}</span>
                                                            </div>
                                                        </div>

                                                        {/* Stats Columns */}
                                                        <div className="w-20 text-center hidden md:flex flex-col justify-center items-center">
                                                            <span className="text-sm font-medium text-slate-700">{post.replyCount || 0}</span>
                                                        </div>

                                                        {/* Author */}
                                                        <div className="w-32 text-center hidden md:flex flex-col justify-center items-center px-2">
                                                            {post.isAnonymous ? (
                                                                <div className="flex flex-col items-center">
                                                                    <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center mb-1">
                                                                        <Ghost className="w-3 h-3 text-slate-500" />
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col items-center">
                                                                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mb-1">
                                                                        <User className="w-3 h-3 text-indigo-600" />
                                                                    </div>
                                                                    <span className="text-xs text-slate-900 font-medium truncate max-w-full">{post.authorName}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Date */}
                                                        <div className="w-32 text-right hidden sm:block text-xs text-slate-500">
                                                            {post.lastActivityAt ? formatDistanceToNow(new Date(post.lastActivityAt), { addSuffix: true }) : 'Just now'}
                                                        </div>
                                                    </Link>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-12">
                                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <MessageSquare className="w-6 h-6 text-slate-300" />
                                                </div>
                                                <h3 className="text-sm font-medium text-slate-900">No discussions yet</h3>
                                                <p className="text-xs text-slate-500 mt-1 mb-4">
                                                    Be the first to post in this forum.
                                                </p>
                                                <Button onClick={() => setIsCreateModalOpen(true)} variant="outline" size="sm">
                                                    Start Discussion
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
            <CreatePostModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                onPostCreated={fetchPosts}
                defaultCategory={currentCategory}
            />
        </div>
    );
}