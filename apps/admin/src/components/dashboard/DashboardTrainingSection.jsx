import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@ifs/shared/utils';
import { Button } from '@ifs/shared/components/ui/button';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardTrainingSection({ courses, user, loading }) {
    if (loading) {
        return (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                </div>
            </div>
        );
    }

    const isFullMember = user?.membershipType === 'Full';
    const userCpdHours = user?.cpdHours || 0;
    const showDiscounts = isFullMember || userCpdHours > 0;

    return (
        <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-slate-900">CPD Training</h2>
                    {showDiscounts && (
                        <span className="text-xs text-green-600 font-medium">Member discounts apply</span>
                    )}
                </div>
            </div>

            <div className="p-5">
                {courses && courses.length > 0 ? (
                    <div className="space-y-4">
                        {courses.slice(0, 3).map(course => {
                            const courseCpdHours = course.cpdHours || 0;
                            const basePrice = courseCpdHours * 20;

                            return (
                                <Link
                                    key={course.id}
                                    to={`${createPageUrl('CourseDetails')}?courseId=${course.id}`}
                                    className="block p-3 -mx-3 rounded-lg hover:bg-slate-50 transition-colors group"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-slate-900 line-clamp-1 group-hover:text-purple-700 transition-colors text-sm">
                                                {course.title}
                                            </h4>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                                {course.nextDate && (
                                                    <span>{format(new Date(course.nextDate.date), 'MMM d')}</span>
                                                )}
                                                {course.duration && (
                                                    <span>{course.duration}</span>
                                                )}
                                                {courseCpdHours > 0 && (
                                                    <span className="text-amber-600">{courseCpdHours} CPD hrs</span>
                                                )}
                                            </div>
                                        </div>
                                        {basePrice > 0 && (
                                            <span className="text-sm font-medium text-slate-900">£{basePrice}</span>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <p className="text-sm text-slate-500 mb-3">No upcoming courses</p>
                        <Button asChild variant="outline" size="sm">
                            <Link to={createPageUrl('CPDTraining')}>Browse training</Link>
                        </Button>
                    </div>
                )}
            </div>

            {courses && courses.length > 0 && (
                <div className="px-5 py-3 border-t border-slate-100">
                    <Link to={createPageUrl('CPDTraining')} className="text-sm text-slate-600 hover:text-slate-900">
                        View all training →
                    </Link>
                </div>
            )}
        </div>
    );
}