import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ifs/shared/components/ui/card';
import { format, subDays, parseISO, startOfDay, eachDayOfInterval } from 'date-fns';

export default function JobAnalyticsTab({ jobs, jobMetrics }) {
    // Process data for the charts
    const last30Days = [...Array(30)].map((_, i) => {
        const d = subDays(new Date(), 29 - i);
        return format(d, 'yyyy-MM-dd');
    });

    // 1. Growth in Views Over Time (Line Chart)
    // Aggregate metrics by date
    const viewsOverTimeData = last30Days.map(dateStr => {
        const metricsForDate = jobMetrics.filter(m => m.date === dateStr);
        const totalViews = metricsForDate.reduce((sum, m) => sum + (m.views || 0), 0);
        const totalClicks = metricsForDate.reduce((sum, m) => sum + (m.clicks || 0), 0);
        return {
            date: format(parseISO(dateStr), 'MMM dd'),
            views: totalViews,
            clicks: totalClicks
        };
    });

    // 2. Top Performing Jobs (Bar Chart)
    // Aggregate metrics by Job
    const jobPerformance = jobs.map(job => {
        // Metrics for this job
        const jobSpecificMetrics = jobMetrics.filter(m => m.jobId === job.id);
        // Calculate totals from metrics (more accurate for recent activity) or use job.views
        // Using job.views from Job entity for total lifetime views
        // But for "Growth" maybe we want recent? Let's use lifetime for "Top"
        return {
            title: job.title.length > 30 ? job.title.substring(0, 30) + '...' : job.title,
            views: job.views || 0,
            clicks: job.applicationClicks || 0,
            ctr: job.views ? ((job.applicationClicks || 0) / job.views * 100).toFixed(1) : 0
        };
    })
    .sort((a, b) => b.views - a.views)
    .slice(0, 10); // Top 10

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Views Growth Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Growth in Views & Clicks (Last 30 Days)</CardTitle>
                        <CardDescription>Daily traffic to job postings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={viewsOverTimeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis 
                                        dataKey="date" 
                                        stroke="#888888" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false}
                                        minTickGap={30}
                                    />
                                    <YAxis 
                                        stroke="#888888" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false} 
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="views" 
                                        stroke="#8b5cf6" 
                                        strokeWidth={2} 
                                        name="Views"
                                        dot={false}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="clicks" 
                                        stroke="#10b981" 
                                        strokeWidth={2} 
                                        name="Applications"
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Top Jobs Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top 10 Jobs by Total Views</CardTitle>
                        <CardDescription>Most viewed active job postings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={jobPerformance} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                    <XAxis type="number" stroke="#888888" fontSize={12} />
                                    <YAxis 
                                        dataKey="title" 
                                        type="category" 
                                        stroke="#888888" 
                                        fontSize={11} 
                                        width={150}
                                        tickLine={false}
                                    />
                                    <Tooltip 
                                        cursor={{ fill: '#f3f4f6' }}
                                        contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="views" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Total Views" barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Views (30d)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {viewsOverTimeData.reduce((sum, d) => sum + d.views, 0)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Applications (30d)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {viewsOverTimeData.reduce((sum, d) => sum + d.clicks, 0)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Avg. Daily Views</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {Math.round(viewsOverTimeData.reduce((sum, d) => sum + d.views, 0) / 30)}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}