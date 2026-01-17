import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ExternalLink, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardNewsSection({ news, loading }) {
    if (loading) {
        return (
            <div className="py-8">
                <div className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                </div>
            </div>
        );
    }

    if (!news || news.length === 0) {
        return null;
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Sector Briefings</h2>
                <Link 
                    to={createPageUrl('News')} 
                    className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
                >
                    View all →
                </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
                {news.slice(0, 3).map((item) => (
                    <a
                        key={item.id}
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md hover:border-slate-300 transition-all"
                    >
                        {item.imageUrl ? (
                            <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                                <img 
                                    src={item.imageUrl} 
                                    alt="" 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        ) : (
                            <div className="aspect-[16/9] bg-slate-100 flex items-center justify-center">
                                <span className="text-slate-400 text-xs">No image</span>
                            </div>
                        )}
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
                                <span className="font-medium">{item.sourceName || 'Update'}</span>
                                <span>·</span>
                                <span>{format(new Date(item.publishedDate), 'MMM d')}</span>
                            </div>
                            <h3 className="font-medium text-slate-900 line-clamp-2 text-sm leading-snug group-hover:text-purple-700 transition-colors">
                                {item.title}
                            </h3>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}