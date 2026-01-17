import React, { useState, useEffect } from 'react';
import { useUser } from '../components/providers/UserProvider';
import OrgPortalSidebar from '../components/portal/OrgPortalSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, Calendar, GraduationCap, Users, Clock } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { base44 } from '@/api/base44Client';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function OrgAnalytics() {
    const { user, loading: userLoading } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { toast } = useToast();
    const [organisation, setOrganisation] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState({
        cpdOverTime: [],
        eventAttendance: [],
        trainingAttendance: [],
        memberActivity: [],
        historicEvents: [],
        upcomingEvents: []
    });

    useEffect(() => {
        if (!userLoading && user?.organisationId) {
            fetchAnalytics();
        }
    }, [userLoading, user?.organisationId]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            
            // Fetch all analytics data from backend function
            const response = await base44.functions.invoke('getOrgAnalytics', { 
                organisationId: user.organisationId 
            });
            
            if (!response.data?.success) {
                throw new Error(response.data?.error || 'Failed to fetch analytics data');
            }
            
            const { organisation, members, transactions: orgTransactions, eventSignups: orgEventSignups, courseBookings: orgCourseBookings } = response.data;

            setOrganisation(organisation);
            setMembers(members);

            // Fetch events and courses to get CPD hours
            const allEvents = await base44.entities.Event.list();
            const allCourses = await base44.entities.Course.list();

            // Process CPD over time (last 6 months)
            const cpdOverTime = processMonthlyAttendance(orgEventSignups, orgCourseBookings, allEvents, allCourses, members);

            // Process member activity
            const memberActivity = members.map(member => {
                const memberEvents = orgEventSignups.filter(s => s.userId === member.id);
                const memberCourses = orgCourseBookings.filter(b => b.userId === member.id);
                
                // Calculate total CPD hours from actual attendance
                const eventCPD = memberEvents.reduce((sum, signup) => {
                    const event = allEvents.find(e => e.id === signup.eventId);
                    const hours = event?.duration ? event.duration / 60 : 0;
                    return sum + hours;
                }, 0);
                
                const courseCPD = memberCourses.reduce((sum, booking) => {
                    const course = allCourses.find(c => c.id === booking.courseId);
                    const hours = course?.cpdHours || 0;
                    return sum + hours;
                }, 0);
                
                const totalCPDAttended = eventCPD + courseCPD;

                return {
                    id: member.id,
                    name: member.displayName || member.full_name,
                    email: member.email,
                    membershipType: member.membershipType,
                    totalCPDAttended: totalCPDAttended.toFixed(1),
                    eventsAttended: memberEvents.length,
                    coursesCompleted: memberCourses.length,
                    lastLogin: member.last_sign_in_at ? new Date(member.last_sign_in_at) : null
                };
            }).sort((a, b) => {
                // Sort by name if no login data available
                if (!a.lastLogin && !b.lastLogin) return a.name.localeCompare(b.name);
                if (!a.lastLogin) return 1;
                if (!b.lastLogin) return -1;
                return b.lastLogin - a.lastLogin;
            });

            // Separate historic and upcoming events
            const now = new Date();
            const historicEvents = orgEventSignups.filter(s => new Date(s.eventDate) < now);
            const upcomingEvents = orgEventSignups.filter(s => new Date(s.eventDate) >= now);

            setAnalyticsData({
                cpdOverTime,
                eventAttendance: orgEventSignups,
                trainingAttendance: orgCourseBookings,
                memberActivity,
                historicEvents,
                upcomingEvents
            });

        } catch (error) {
            console.error("Failed to fetch analytics:", error);
            toast({ 
                title: 'Error', 
                description: 'Could not load analytics data.', 
                variant: 'destructive' 
            });
        } finally {
            setLoading(false);
        }
    };

    const processMonthlyAttendance = (eventSignups, courseBookings, allEvents, allCourses, members) => {
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const date = subMonths(new Date(), i);
            const monthStart = startOfMonth(date);
            const monthEnd = endOfMonth(date);
            
            const monthData = { month: format(date, 'MMM yyyy') };
            
            // Calculate CPD hours per member for this month
            members.forEach(member => {
                const memberEvents = eventSignups.filter(s => {
                    const eventDate = new Date(s.eventDate);
                    return s.userId === member.id && eventDate >= monthStart && eventDate <= monthEnd;
                });
                
                const memberCourses = courseBookings.filter(b => {
                    const bookingDate = new Date(b.created_date);
                    return b.userId === member.id && bookingDate >= monthStart && bookingDate <= monthEnd;
                });

                const eventCPD = memberEvents.reduce((sum, signup) => {
                    const event = allEvents.find(e => e.id === signup.eventId);
                    const hours = event?.duration ? event.duration / 60 : 0;
                    return sum + hours;
                }, 0);
                
                const courseCPD = memberCourses.reduce((sum, booking) => {
                    const course = allCourses.find(c => c.id === booking.courseId);
                    const hours = course?.cpdHours || 0;
                    return sum + hours;
                }, 0);

                const memberName = member.displayName || member.full_name;
                const totalHours = parseFloat((eventCPD + courseCPD).toFixed(1));
                if (totalHours > 0) {
                    monthData[memberName] = totalHours;
                }
            });

            months.push(monthData);
        }
        return months;
    };

    if (userLoading || loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
            </div>
        );
    }

    if (!user || !organisation || (user.organisationRole !== 'Admin' && user.role !== 'admin')) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
                    <p className="text-slate-600">Only organisation admins can view analytics.</p>
                </div>
            </div>
        );
    }

    const totalCPDAttended = analyticsData.memberActivity.reduce((sum, m) => sum + parseFloat(m.totalCPDAttended), 0);
    const totalEvents = analyticsData.eventAttendance.length;
    const totalTraining = analyticsData.trainingAttendance.length;

    return (
        <div className="flex h-screen bg-slate-50/30">
            <Toaster />
            <OrgPortalSidebar 
                organisation={organisation}
                user={user} 
                sidebarOpen={sidebarOpen} 
                setSidebarOpen={setSidebarOpen} 
                currentPage="OrgAnalytics" 
            />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto bg-slate-50">
                    <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
                        <div className="mb-12">
                            <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Team Analytics</h1>
                            <p className="text-lg text-slate-600">Professional development insights and member activity tracking</p>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            <div className="text-center p-6 bg-slate-50 rounded-lg border-2 border-slate-200">
                                <div className="text-5xl font-bold text-slate-900 mb-2 font-sans">{totalCPDAttended.toFixed(1)}</div>
                                <div className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">Total CPD Hours</div>
                                <div className="text-xs text-slate-500">Attended by team</div>
                            </div>
                            
                            <div className="text-center p-6 bg-slate-50 rounded-lg border-2 border-slate-200">
                                <div className="text-5xl font-bold text-slate-900 mb-2 font-sans">{totalEvents}</div>
                                <div className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">Events Attended</div>
                                <div className="text-xs text-slate-500">Total registrations</div>
                            </div>
                            
                            <div className="text-center p-6 bg-slate-50 rounded-lg border-2 border-slate-200">
                                <div className="text-5xl font-bold text-slate-900 mb-2 font-sans">{totalTraining}</div>
                                <div className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">Training Completed</div>
                                <div className="text-xs text-slate-500">Course bookings</div>
                            </div>
                        </div>

                        {/* Events Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                            {/* Historic Events */}
                            <div className="bg-white border border-slate-200 shadow-sm">
                                <div className="border-b border-slate-200 px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-slate-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Historic Events</h2>
                                            <p className="text-sm text-slate-500 mt-0.5">Past events attended by team members</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8">
                                    {analyticsData.historicEvents.length > 0 ? (
                                        <div className="space-y-3 max-h-96 overflow-y-auto">
                                            {analyticsData.historicEvents
                                                .sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate))
                                                .map((event) => (
                                                    <div key={event.id} className="border-l-2 border-slate-200 pl-4 py-2">
                                                        <div className="font-medium text-slate-900">{event.eventTitle}</div>
                                                        <div className="text-sm text-slate-600">{event.userName}</div>
                                                        <div className="text-xs text-slate-500">
                                                            {format(new Date(event.eventDate), 'dd MMM yyyy')}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-500 text-sm">No historic events</p>
                                    )}
                                </div>
                            </div>

                            {/* Upcoming Events */}
                            <div className="bg-white border border-slate-200 shadow-sm">
                                <div className="border-b border-slate-200 px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-slate-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Upcoming Events</h2>
                                            <p className="text-sm text-slate-500 mt-0.5">Future events booked by team members</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8">
                                    {analyticsData.upcomingEvents.length > 0 ? (
                                        <div className="space-y-3 max-h-96 overflow-y-auto">
                                            {analyticsData.upcomingEvents
                                                .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
                                                .map((event) => (
                                                    <div key={event.id} className="border-l-2 border-purple-500 pl-4 py-2">
                                                        <div className="font-medium text-slate-900">{event.eventTitle}</div>
                                                        <div className="text-sm text-slate-600">{event.userName}</div>
                                                        <div className="text-xs text-slate-500">
                                                            {format(new Date(event.eventDate), 'dd MMM yyyy')}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-500 text-sm">No upcoming events</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Member Activity Table */}
                        <div className="bg-white border border-slate-200 shadow-sm">
                            <div className="border-b border-slate-200 px-8 py-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                        <Users className="w-5 h-5 text-slate-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Member Activity</h2>
                                        <p className="text-sm text-slate-500 mt-0.5">Individual member engagement and professional development</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-slate-200 text-left">
                                                <th className="pb-3 text-sm font-semibold text-slate-900">Member</th>
                                                <th className="pb-3 text-sm font-semibold text-slate-900">Type</th>
                                                <th className="pb-3 text-sm font-semibold text-slate-900 text-right">CPD Hours</th>
                                                <th className="pb-3 text-sm font-semibold text-slate-900 text-right">Events</th>
                                                <th className="pb-3 text-sm font-semibold text-slate-900 text-right">Training</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {analyticsData.memberActivity.map((member) => (
                                                <tr key={member.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                    <td className="py-4">
                                                        <div>
                                                            <div className="font-medium text-slate-900">{member.name}</div>
                                                            <div className="text-sm text-slate-500">{member.email}</div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4">
                                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                                            member.membershipType === 'Full' 
                                                                ? 'bg-slate-900 text-white' 
                                                                : 'bg-slate-200 text-slate-700'
                                                        }`}>
                                                            {member.membershipType}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-right font-medium text-slate-900">{member.totalCPDAttended} hrs</td>
                                                    <td className="py-4 text-right text-slate-900">{member.eventsAttended}</td>
                                                    <td className="py-4 text-right text-slate-900">{member.coursesCompleted}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    </div>
                                    </div>
                                    </div>
                    </div>
                </main>
            </div>
        </div>
    );
}