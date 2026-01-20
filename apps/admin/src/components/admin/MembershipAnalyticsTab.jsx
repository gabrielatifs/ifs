import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ifs/shared/components/ui/card';
import { LineChart, Line, PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Sector } from 'recharts';
import { format, parseISO } from 'date-fns';
import { TrendingUp, PieChart as PieChartIcon, Activity, Building, RefreshCw } from 'lucide-react';
import _ from 'lodash';

const ChartContainer = ({ title, icon: Icon, children, description }) => (
    <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
                {Icon && <Icon className="w-5 h-5 text-slate-400" />}
            </div>
            {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
        </CardHeader>
        <CardContent>
            <div className="h-72 w-full">
                {children}
            </div>
        </CardContent>
    </Card>
);

const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-bold text-lg">
                {payload.name}
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + 6}
                outerRadius={outerRadius + 10}
                fill={fill}
            />
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
            <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="font-medium">{value}</text>
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
                {`(${(percent * 100).toFixed(2)}%)`}
            </text>
        </g>
    );
};

export default function MembershipAnalyticsTab({ users = [], organisations = [] }) {
    const [typePieIndex, setTypePieIndex] = useState(0);
    const [statusPieIndex, setStatusPieIndex] = useState(0);

    const activeMembers = useMemo(() => users.filter(u => u.membershipStatus === 'active'), [users]);

    // Revenue Metrics (ARR only)
    const revenueMetrics = useMemo(() => {
        // Full Membership ARR (Annualized)
        // Assuming standard rate of £240/year (£20/month)
        const activeFullMembers = users.filter(u => u.membershipType === 'Full' && u.membershipStatus === 'active');
        const fullMemberARR = activeFullMembers.length * 240;

        return {
            fullMemberARR
        };
    }, [users]);

    // Conversion Rates
    const conversionMetrics = useMemo(() => {
        const totalUsers = users.length;
        if (totalUsers === 0) return { onboardingRate: 0, activationRate: 0 };

        const onboardingCompleted = users.filter(u => u.onboarding_completed).length;
        const activeUsers = users.filter(u => u.membershipStatus === 'active').length;

        return {
            onboardingRate: ((onboardingCompleted / totalUsers) * 100).toFixed(1),
            activationRate: ((activeUsers / totalUsers) * 100).toFixed(1),
            totalUsers,
            onboardingCompleted,
            activeUsers
        };
    }, [users]);

    // Membership Growth Data (All Users vs Active)
    const growthData = useMemo(() => {
        if (users.length === 0) return [];
        const monthlyCounts = _.groupBy(users, (u) => format(parseISO(u.created_date), 'yyyy-MM'));
        const sortedMonths = Object.keys(monthlyCounts).sort();
        
        let cumulativeTotal = 0;
        let cumulativeActive = 0;

        return sortedMonths.map(monthStr => {
            const monthUsers = monthlyCounts[monthStr];
            cumulativeTotal += monthUsers.length;
            
            const monthActive = monthUsers.filter(u => u.membershipStatus === 'active').length;
            cumulativeActive += monthActive; 

            return {
                name: format(parseISO(`${monthStr}-01`), 'MMM yy'),
                Total: cumulativeTotal,
                Active: cumulativeActive,
            };
        });
    }, [users]);

    const membershipTypeData = useMemo(() => {
        const counts = _.countBy(activeMembers, 'membershipType');
        return [
            { name: 'Associate', value: counts.Associate || 0 },
            { name: 'Full', value: counts.Full || 0 },
        ].filter(item => item.value > 0);
    }, [activeMembers]);

    const statusDistributionData = useMemo(() => {
        const counts = _.countBy(users, 'membershipStatus');
        return Object.keys(counts).map(status => ({
            name: status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown',
            value: counts[status]
        })).filter(item => item.value > 0);
    }, [users]);

    const topSectorsData = useMemo(() => {
        return _.chain(activeMembers)
            .filter(u => u.sector && u.sector !== 'Other')
            .countBy('sector')
            .map((count, name) => ({ name, count }))
            .sortBy('count')
            .reverse()
            .take(7)
            .value();
    }, [activeMembers]);

    const trainingRefreshData = useMemo(() => {
        const order = ["Every year", "Every 2 years", "Every 3 years", "Every 3-5 years", "5 years or more", "I haven't refreshed my training", "None of the above"];
        const data = _.chain(activeMembers)
            .filter(u => u.training_refresh_frequency)
            .countBy('training_refresh_frequency')
            .map((count, name) => ({ name, value: count }))
            .value();
        
        return data.sort((a, b) => {
            const indexA = order.indexOf(a.name);
            const indexB = order.indexOf(b.name);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
    }, [activeMembers]);

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    if (!users || users.length === 0) {
        return <div className="p-12 text-center text-slate-500">Not enough data to display analytics.</div>
    }

    return (
        <div className="p-6 space-y-6">
            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Total Users</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{conversionMetrics.totalUsers}</div>
                        <div className="text-xs text-green-600 mt-1 flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" /> {growthData[growthData.length - 1]?.Total || 0} total registered
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Activation Rate</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{conversionMetrics.activationRate}%</div>
                        <div className="text-xs text-slate-500 mt-1">
                            {conversionMetrics.activeUsers} active / {conversionMetrics.totalUsers} users
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Est. Membership ARR</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">£{revenueMetrics.fullMemberARR.toLocaleString()}</div>
                        <div className="text-xs text-slate-500 mt-1">Annualized from Full Members (£240/yr avg)</div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 gap-6">
                <ChartContainer title="User Growth" icon={TrendingUp} description="Total registered users vs Active members over time.">
                    <ResponsiveContainer>
                        <LineChart data={growthData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12}/>
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="Total" stroke="#8884d8" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="Active" stroke="#82ca9d" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ChartContainer title="User Status Breakdown" icon={Activity} description="Distribution of all users by status.">
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                activeIndex={statusPieIndex}
                                activeShape={renderActiveShape}
                                data={statusDistributionData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                onMouseEnter={(_, index) => setStatusPieIndex(index)}
                            >
                                {statusDistributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>

                <ChartContainer title="Active Membership Types" icon={PieChartIcon} description="Distribution of active membership tiers.">
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                activeIndex={typePieIndex}
                                activeShape={renderActiveShape}
                                data={membershipTypeData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                onMouseEnter={(_, index) => setTypePieIndex(index)}
                            >
                                {membershipTypeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>

                <ChartContainer title="Top Member Sectors" icon={Building} description="Active members by sector.">
                    <ResponsiveContainer>
                        <BarChart data={topSectorsData} layout="vertical" margin={{ left: 40, right: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" stroke="#64748b" fontSize={12} hide />
                            <YAxis dataKey="name" type="category" width={100} stroke="#64748b" fontSize={11} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]}>
                                {topSectorsData.map((entry, index) => (
                                    <Cell cursor="pointer" fill={COLORS[index % COLORS.length]} key={`cell-${index}`} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <ChartContainer title="Training Refreshment Frequency" icon={RefreshCw} description="How often active members refresh their training.">
                    <div className="h-64">
                        <ResponsiveContainer>
                            <BarChart data={trainingRefreshData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={11} interval={0} angle={-15} textAnchor="end" height={60} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#8884d8" name="Members" radius={[4, 4, 0, 0]}>
                                    {trainingRefreshData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartContainer>
            </div>
        </div>
    );
}