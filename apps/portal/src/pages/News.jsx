import React, { useState, useEffect } from 'react';
import { useUser } from '@ifs/shared/components/providers/UserProvider';
import { base44 } from '@ifs/shared/api/base44Client';
import { Card, CardContent } from '@ifs/shared/components/ui/card';
import { Badge } from '@ifs/shared/components/ui/badge';
import { Input } from '@ifs/shared/components/ui/input';
import { Button } from '@ifs/shared/components/ui/button';
import { Search, Newspaper, Calendar, PlayCircle, ArrowLeft, ChevronRight, LayoutGrid, List } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import PortalHeader from '../components/portal/PortalHeader';
import PortalSidebar from '../components/portal/PortalSidebar';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

// Helper to split summary into bullets
const SummaryBullets = ({ summary }) => {
    if (!summary) return null;
    const sentences = summary.split(/[.!?]+/).filter(s => s.trim().length > 5).slice(0, 2);
    
    return (
        <ul className="space-y-2 mt-4 list-disc list-outside pl-4 text-slate-600 text-sm leading-relaxed">
            {sentences.map((sentence, i) => (
                <li key={i}>{sentence.trim()}.</li>
            ))}
        </ul>
    );
};

// --- Components ---

const NewsHubView = ({ featuredItems, gridStories, olderStories, sidebarStories, categories }) => {
    const mainStory = featuredItems[0];
    const secondaryStory = featuredItems[1];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Featured Section */}
            {mainStory && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Column 1: Featured Story Text */}
                    <div className="lg:col-span-1">
                        <Card className="h-full bg-white border-none shadow-sm hover:shadow-md transition-shadow rounded-xl overflow-hidden flex flex-col">
                            <CardContent className="p-6 flex-1 flex flex-col justify-center">
                                <div className="mb-4">
                                    <span className="text-purple-600 font-bold text-xs uppercase tracking-wide bg-purple-50 px-2 py-1 rounded-full">
                                        {mainStory.category || 'Featured'}
                                    </span>
                                </div>
                                <h2 className="text-3xl font-bold text-slate-900 leading-tight mb-4">
                                    <a href={mainStory.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-purple-700 transition-colors">
                                        {mainStory.title}
                                    </a>
                                </h2>
                                <SummaryBullets summary={mainStory.summary} />
                                <div className="mt-8 flex items-center gap-2 text-xs text-slate-400 font-medium uppercase tracking-wider">
                                    <span>{mainStory.sourceName}</span>
                                    <span>•</span>
                                    <span>{formatDistanceToNow(new Date(mainStory.publishedDate))} ago</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Column 2: Featured Story Hero Image */}
                    <div className="lg:col-span-1">
                        <Card className="h-full bg-slate-900 border-none shadow-sm rounded-xl overflow-hidden group relative min-h-[300px]">
                            {mainStory.imageUrl ? (
                                <img 
                                    src={mainStory.imageUrl} 
                                    alt={mainStory.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                                    <Newspaper className="w-16 h-16 text-slate-700" />
                                </div>
                            )}
                            <div className="absolute bottom-3 right-3 text-[10px] text-white/60 bg-black/30 px-2 py-1 rounded backdrop-blur-sm">
                                Source: {mainStory.sourceName}
                            </div>
                        </Card>
                    </div>

                    {/* Column 3: Secondary Feature */}
                    <div className="lg:col-span-1">
                        {secondaryStory ? (
                            <Card className="h-full bg-slate-900 border-none shadow-sm rounded-xl overflow-hidden group relative min-h-[300px]">
                                {secondaryStory.imageUrl ? (
                                    <img 
                                        src={secondaryStory.imageUrl} 
                                        alt={secondaryStory.title}
                                        className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-900 to-slate-900" />
                                )}
                                
                                <div className="absolute top-4 left-4 z-10">
                                     <Badge className="bg-white/90 text-slate-900 hover:bg-white border-none flex items-center gap-1.5 pl-1.5 pr-2.5 py-0.5 shadow-sm backdrop-blur-sm">
                                        <PlayCircle className="w-3 h-3 text-purple-600 fill-current" />
                                        {secondaryStory.category || 'Latest'}
                                    </Badge>
                                </div>
                                
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                                
                                <div className="absolute bottom-0 left-0 right-0 p-6">
                                    <h3 className="text-xl font-bold text-white leading-snug mb-2 line-clamp-3">
                                        <a href={secondaryStory.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline decoration-2 underline-offset-2">
                                            {secondaryStory.title}
                                        </a>
                                    </h3>
                                    <p className="text-slate-300 text-sm truncate">
                                        {secondaryStory.sourceName}
                                    </p>
                                </div>
                            </Card>
                        ) : (
                            <div className="h-full bg-white rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                                No additional stories
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Lower Section Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2/3: Small Cards Grid */}
                <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {gridStories.map(item => (
                            <Card key={item.id} className="bg-white border-none shadow-sm hover:shadow-md transition-all rounded-xl overflow-hidden group">
                                <div className="flex flex-col h-full">
                                    <div className="h-48 overflow-hidden relative">
                                        {item.imageUrl ? (
                                            <img 
                                                src={item.imageUrl} 
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                                <Newspaper className="w-8 h-8 text-slate-300" />
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3">
                                            <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wide">
                                                {item.category || 'News'}
                                            </span>
                                        </div>
                                    </div>
                                    <CardContent className="p-5 flex-1 flex flex-col">
                                        <h3 className="text-lg font-bold text-slate-900 leading-snug mb-3 line-clamp-3 group-hover:text-purple-700 transition-colors">
                                            <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
                                                {item.title}
                                            </a>
                                        </h3>
                                        <div className="mt-auto pt-3 text-xs text-slate-400 font-medium flex items-center justify-between border-t border-slate-100">
                                            <span className="text-slate-500">{item.sourceName}</span>
                                            <span className="text-slate-400 flex items-center gap-1">
                                                {formatDistanceToNow(new Date(item.publishedDate))} ago
                                            </span>
                                        </div>
                                    </CardContent>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Right 1/3: Top Stories Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-6">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                            <h3 className="text-slate-800 font-bold text-lg">Latest Headlines</h3>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {sidebarStories.map((item) => (
                                <div key={item.id} className="p-5 hover:bg-slate-50 transition-colors group">
                                    <div className="flex gap-3 items-start">
                                        <div className="mt-1 min-w-[4px] h-4 rounded-full bg-purple-200 group-hover:bg-purple-600 transition-colors"></div>
                                        <div>
                                            <h4 className="font-semibold text-slate-800 leading-snug group-hover:text-purple-700 transition-colors mb-1">
                                                <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
                                                    {item.title}
                                                </a>
                                            </h4>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase">{item.category}</span>
                                                <span className="text-[10px] text-slate-400">• {formatDistanceToNow(new Date(item.publishedDate))} ago</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
                            <Link to={`/News?category=${categories[0]?.name || 'All'}`} className="text-sm font-semibold text-purple-600 hover:text-purple-800">
                                Browse by Category &rarr;
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Older Stories Section */}
            {olderStories.length > 0 && (
                <div className="pt-8 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-slate-900">More News</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {olderStories.map(item => (
                            <Card key={item.id} className="bg-white border-none shadow-sm hover:shadow-md transition-all rounded-xl overflow-hidden group opacity-90 hover:opacity-100">
                                <div className="flex flex-col h-full">
                                    <div className="h-32 overflow-hidden relative">
                                        {item.imageUrl ? (
                                            <img 
                                                src={item.imageUrl} 
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 grayscale group-hover:grayscale-0"
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                                <Newspaper className="w-6 h-6 text-slate-300" />
                                            </div>
                                        )}
                                    </div>
                                    <CardContent className="p-4 flex-1 flex flex-col">
                                        <div className="mb-2">
                                            <span className="text-purple-600 text-[10px] font-bold uppercase tracking-wide">
                                                {item.category || 'News'}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-bold text-slate-900 leading-snug mb-2 line-clamp-2 group-hover:text-purple-700 transition-colors">
                                            <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
                                                {item.title}
                                            </a>
                                        </h3>
                                        <div className="mt-auto pt-2 text-[10px] text-slate-400 font-medium flex items-center justify-between">
                                            <span className="truncate max-w-[100px]">{item.sourceName}</span>
                                            <span className="text-slate-500">
                                                {formatDistanceToNow(new Date(item.publishedDate))} ago
                                            </span>
                                        </div>
                                    </CardContent>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const NewsCategoryView = ({ category, subCategories, items, selectedSubCategory, onSelectSubCategory }) => {
    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Category Header */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-50 rounded-full -ml-24 -mb-24 opacity-50"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                        <Link to="/News" className="hover:text-purple-600 transition-colors flex items-center gap-1">
                            <ArrowLeft className="w-4 h-4" /> Back to Hub
                        </Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-medium text-slate-900">{category.name}</span>
                    </div>
                    
                    <h1 className="text-4xl font-bold text-slate-900 mb-3">{category.name}</h1>
                    <p className="text-lg text-slate-600 max-w-3xl leading-relaxed">
                        {category.description || `Latest updates and insights regarding ${category.name}.`}
                    </p>

                    {/* Sub-Category Pills */}
                    {subCategories && subCategories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-slate-100">
                            <button
                                onClick={() => onSelectSubCategory('All')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                    selectedSubCategory === 'All'
                                    ? 'bg-slate-900 text-white shadow-md transform scale-105'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                All {category.name}
                            </button>
                            {subCategories.map(sub => (
                                <button
                                    key={sub}
                                    onClick={() => onSelectSubCategory(sub)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                        selectedSubCategory === sub
                                        ? 'bg-purple-600 text-white shadow-md transform scale-105'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:border-purple-300 hover:text-purple-600'
                                    }`}
                                >
                                    {sub}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Articles List/Grid */}
            {items.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Newspaper className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900">No articles found</h3>
                    <p className="text-slate-500">Try adjusting filters or check back later.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item, index) => (
                        <Card key={item.id} className="group bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full">
                            <div className="h-56 overflow-hidden relative">
                                {item.imageUrl ? (
                                    <img 
                                        src={item.imageUrl} 
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                        <Newspaper className="w-10 h-10 text-slate-300" />
                                    </div>
                                )}
                                {item.subCategory && (
                                    <div className="absolute top-3 left-3">
                                        <Badge className="bg-white/90 backdrop-blur-sm text-slate-800 hover:bg-white border-none shadow-sm">
                                            {item.subCategory}
                                        </Badge>
                                    </div>
                                )}
                            </div>
                            <CardContent className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-slate-900 leading-tight mb-3 group-hover:text-purple-600 transition-colors">
                                    <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
                                        {item.title}
                                    </a>
                                </h3>
                                <p className="text-slate-600 text-sm line-clamp-3 mb-4 flex-1">
                                    {item.summary}
                                </p>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                            {item.sourceName.charAt(0)}
                                        </div>
                                        <span className="text-xs font-medium text-slate-600">{item.sourceName}</span>
                                    </div>
                                    <span className="text-xs text-slate-400 font-medium">
                                        {formatDistanceToNow(new Date(item.publishedDate))} ago
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Main Page Component ---

export default function NewsPage() {
    const { user, loading: userLoading } = useUser();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [newsItems, setNewsItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // Filters
    const categoryParam = searchParams.get('category');
    const selectedCategoryName = categoryParam || 'All';
    const [selectedSubCategory, setSelectedSubCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchNews = async () => {
            try {
                // Fetch categories
                const categoryItems = await base44.entities.NewsCategory.list('displayOrder');
                setCategories(categoryItems);

                // Fetch more items to populate hub and category pages
                const items = await base44.entities.NewsItem.list('-publishedDate', 200);
                const published = items.filter(i => i.status === 'Published');
                
                // Sort by published date descending
                published.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
                
                setNewsItems(published);
            } catch (error) {
                console.error('Failed to fetch news:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchNews();
        }
    }, [user]);

    // Reset sub-category when category changes
    useEffect(() => {
        setSelectedSubCategory('All');
        setSearchQuery('');
    }, [selectedCategoryName]);

    // Data Derivation
    const selectedCategory = categories.find(c => c.name === selectedCategoryName);
    
    const getFilteredItems = () => {
        let filtered = newsItems;
        
        if (selectedCategoryName !== 'All') {
            filtered = filtered.filter(item => item.category === selectedCategoryName);
        }

        if (selectedSubCategory !== 'All') {
            filtered = filtered.filter(item => item.subCategory === selectedSubCategory);
        }

        if (searchQuery) {
            filtered = filtered.filter(item => 
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                (item.summary && item.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
                item.category?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        return filtered;
    };

    const filteredItems = getFilteredItems();

    // Hub View Data
    const featuredItems = newsItems.filter(item => item.isFeatured).slice(0, 2);
    // If not enough featured, fallback
    const effectiveFeatured = featuredItems.length > 0 ? featuredItems : newsItems.slice(0, 2);
    
    const hubGridItems = newsItems
        .filter(item => !effectiveFeatured.includes(item))
        .slice(0, 6);
        
    const hubOlderItems = newsItems
        .filter(item => !effectiveFeatured.includes(item))
        .slice(6, 14); // Limit older items on hub

    const hubSidebarItems = newsItems.slice(0, 5);

    if (userLoading || loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50/50">
            <PortalSidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="News" />
            <div className="flex-1 flex flex-col overflow-hidden">
                <PortalHeader setSidebarOpen={setSidebarOpen} user={user} />
                <main className="flex-1 overflow-y-auto scroll-smooth">
                    <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-8">
                        
                        {/* Header & Navigation */}
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                        <Newspaper className="w-8 h-8 text-purple-700" />
                                        Sector News & Updates
                                    </h1>
                                    <p className="text-slate-500 mt-2">Curated insights, industry updates, and latest announcements.</p>
                                </div>
                                
                                <div className="relative w-full md:w-72">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <Input 
                                        placeholder="Search news..." 
                                        className="pl-9 bg-white shadow-sm border-slate-200"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Main Category Navigation */}
                            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-6">
                                <Link
                                    to="/News"
                                    onClick={() => {
                                        // Optional: if we want to clear params entirely on 'All'
                                        // setSearchParams({});
                                        // But Link to="/News" handles it mostly. 
                                        // We need to ensure state sync if using Link.
                                    }}
                                    className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                                        selectedCategoryName === 'All' 
                                        ? 'bg-white text-purple-700 shadow-md border-t-2 border-purple-600' 
                                        : 'text-slate-600 hover:bg-white hover:text-slate-900'
                                    }`}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                    News Hub
                                </Link>
                                {categories.map(cat => (
                                    <Link
                                        key={cat.id}
                                        to={`/News?category=${encodeURIComponent(cat.name)}`}
                                        className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                            selectedCategoryName === cat.name 
                                            ? 'bg-white text-purple-700 shadow-md border-t-2 border-purple-600' 
                                            : 'text-slate-600 hover:bg-white hover:text-slate-900'
                                        }`}
                                    >
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* View Switcher */}
                        {selectedCategoryName === 'All' ? (
                            <NewsHubView 
                                featuredItems={effectiveFeatured}
                                gridStories={hubGridItems}
                                olderStories={hubOlderItems}
                                sidebarStories={hubSidebarItems}
                                categories={categories}
                            />
                        ) : (
                            <NewsCategoryView 
                                category={selectedCategory || { name: selectedCategoryName, description: '' }}
                                subCategories={selectedCategory?.subCategories || []}
                                items={filteredItems}
                                selectedSubCategory={selectedSubCategory}
                                onSelectSubCategory={setSelectedSubCategory}
                            />
                        )}

                    </div>
                </main>
            </div>
        </div>
    );
}