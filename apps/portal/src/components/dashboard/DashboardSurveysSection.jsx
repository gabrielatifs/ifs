import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@ifs/shared/utils';
import { MessageSquare, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@ifs/shared/api/base44Client';

export default function DashboardSurveysSection() {
    const { data: surveys, isLoading } = useQuery({
        queryKey: ['active-surveys-dashboard'],
        queryFn: async () => {
            const allSurveys = await base44.entities.Survey.filter({ status: 'active' });
            const now = new Date();
            
            return allSurveys.filter(survey => {
                if (survey.isAlwaysAvailable) return true;
                if (!survey.endDate) return true;
                return new Date(survey.endDate) > now;
            });
        },
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading || !surveys || surveys.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-4 py-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-purple-600" />
                        <h3 className="font-medium text-slate-900 text-sm">Active Surveys</h3>
                    </div>
                    <span className="text-xs text-amber-600 font-medium">+0.1 CPD each</span>
                </div>
            </div>

            <div className="p-4 space-y-2">
                {surveys.slice(0, 2).map(survey => (
                    <Link
                        key={survey.id}
                        to={createPageUrl(`Survey?id=${survey.id}`)}
                        className="block p-3 -mx-1 rounded-lg hover:bg-slate-50 transition-colors group"
                    >
                        <h4 className="font-medium text-slate-900 text-sm group-hover:text-purple-700 transition-colors line-clamp-1">
                            {survey.title}
                        </h4>
                        {survey.endDate && !survey.isAlwaysAvailable && (
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Closes {new Date(survey.endDate).toLocaleDateString()}
                            </p>
                        )}
                    </Link>
                ))}
                
                <Link 
                    to={createPageUrl('YourVoice')} 
                    className="block text-sm text-slate-600 hover:text-slate-900 pt-2"
                >
                    View all surveys →
                </Link>
            </div>
        </div>
    );
}