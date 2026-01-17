import React, { useState, useEffect } from 'react';
import { base44 } from '@ifs/shared/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@ifs/shared/utils';
import { useUser } from '@ifs/shared/components/providers/UserProvider';
import PortalSidebar from '../components/portal/PortalSidebar';
import PortalHeader from '../components/portal/PortalHeader';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@ifs/shared/components/ui/card';
import { Button } from '@ifs/shared/components/ui/button';
import { Badge } from '@ifs/shared/components/ui/badge';
import { 
    Coins, 
    TrendingUp, 
    TrendingDown, 
    Calendar, 
    Loader2, 
    ArrowLeft,
    Download,
    Filter,
    RefreshCw,
    Info
} from 'lucide-react';
import { format } from 'date-fns';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@ifs/shared/components/ui/select";

export default function MyCreditHistory() {
    const { user, loading: userLoading } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [filterType, setFilterType] = useState('all');

    // Redirect if not authenticated or not a member with credits
    useEffect(() => {
        if (!userLoading && !user) {
            base44.auth.redirectToLogin(window.location.href);
        }
        // Allow both Full and Associate members to access credit history
        if (!userLoading && user && user.membershipType !== 'Full' && user.membershipType !== 'Associate') {
            window.location.href = createPageUrl('Dashboard');
        }
    }, [user, userLoading]);

    const { data: transactions, isLoading, refetch } = useQuery({
        queryKey: ['creditTransactions', user?.id],
        queryFn: async () => {
            const txns = await base44.entities.CreditTransaction.list('-created_date');
            // Filter in frontend by userId
            const filtered = txns.filter(t => t.userId === user.id);
            return filtered;
        },
        enabled: !!user,
    });

    if (userLoading || !user) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    const filteredTransactions = transactions?.filter(txn => {
        if (filterType === 'all') return true;
        return txn.transactionType === filterType;
    }) || [];

    const stats = {
        totalEarned: user.totalCpdEarned || 0,
        totalSpent: user.totalCpdSpent || 0,
        currentBalance: user.cpdHours || 0,
        lifetimeValue: ((user.totalCpdEarned || 0) * 20).toFixed(2)
    };

    return (
        <div className="flex h-screen bg-slate-50/30">
            <PortalSidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentPage="MyCreditHistory" />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <PortalHeader setSidebarOpen={setSidebarOpen} user={user} />
                
                <main className="flex-1 overflow-y-auto p-6 md:p-8 pb-20 md:pb-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <Button 
                                variant="ghost" 
                                onClick={() => window.location.href = createPageUrl('Dashboard')}
                                className="mb-4"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </Button>
                            <h1 className="text-3xl font-bold text-slate-900">CPD Hours History</h1>
                            <p className="text-lg text-slate-500 mt-1">
                                Track your CPD hours allocations and usage
                            </p>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Card className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white border-0">
                                <CardHeader className="pb-2">
                                    <CardDescription className="text-purple-100">Current Balance</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-bold">{stats.currentBalance.toFixed(1)}</span>
                                        <span className="text-purple-200">hours</span>
                                    </div>
                                    <p className="text-sm text-purple-100 mt-1">
                                        ≈ £{(stats.currentBalance * 20).toFixed(2)} value
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-green-600" />
                                        Total Earned
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-slate-900">{stats.totalEarned.toFixed(1)}</span>
                                        <span className="text-slate-500">hours</span>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-1">
                                        £{stats.lifetimeValue} lifetime value
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription className="flex items-center gap-2">
                                        <TrendingDown className="w-4 h-4 text-red-600" />
                                        Total Spent
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-slate-900">{stats.totalSpent.toFixed(1)}</span>
                                        <span className="text-slate-500">hours</span>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-1">
                                        £{(stats.totalSpent * 20).toFixed(2)} value used
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-blue-600" />
                                        Monthly Allocation
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-slate-900">{user.monthlyCpdHours || 1}</span>
                                        <span className="text-slate-500">hours</span>
                                    </div>
                                    {user.lastCpdAllocationDate && (
                                        <p className="text-sm text-slate-500 mt-1">
                                            Last: {format(new Date(user.lastCpdAllocationDate), 'MMM d, yyyy')}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Info Banner */}
                        <Card className="mb-6 bg-blue-50 border-blue-200">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div className="space-y-1 text-sm text-blue-900">
                                        <p className="font-semibold">How CPD Hours Work</p>
                                        <ul className="list-disc pl-5 space-y-1 text-blue-800">
                                            <li>Each CPD hour is worth £20 in training discounts</li>
                                            <li>You receive {user.monthlyCpdHours || 1} CPD hour every month as a Full Member</li>
                                            <li>Unused hours roll over and never expire</li>
                                            <li>Use hours to book training courses, supervision, and masterclasses</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Transaction History */}
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <CardTitle>Transaction History</CardTitle>
                                        <CardDescription className="mt-1">
                                            All credit movements in your account
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Select value={filterType} onValueChange={setFilterType}>
                                            <SelectTrigger className="w-[160px]">
                                                <Filter className="w-4 h-4 mr-2" />
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Types</SelectItem>
                                                <SelectItem value="allocation">Allocations</SelectItem>
                                                <SelectItem value="spent">Spent</SelectItem>
                                                <SelectItem value="refund">Refunds</SelectItem>
                                                <SelectItem value="adjustment">Adjustments</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button 
                                            variant="outline" 
                                            size="icon"
                                            onClick={() => refetch()}
                                            disabled={isLoading}
                                        >
                                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                                        <span className="ml-2 text-slate-600">Loading transactions...</span>
                                    </div>
                                ) : filteredTransactions.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Coins className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-600">No transactions found</p>
                                        <p className="text-sm text-slate-500 mt-1">
                                            Your credit activity will appear here
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {filteredTransactions.map((txn) => (
                                            <div
                                                key={txn.id}
                                                className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-purple-300 transition-colors"
                                            >
                                                <div className="flex items-start gap-3 flex-1">
                                                    <div className={`p-2 rounded-lg flex-shrink-0 ${
                                                        txn.transactionType === 'allocation' ? 'bg-green-100' :
                                                        txn.transactionType === 'spent' ? 'bg-red-100' :
                                                        txn.transactionType === 'refund' ? 'bg-blue-100' :
                                                        'bg-yellow-100'
                                                    }`}>
                                                        {txn.transactionType === 'allocation' ? (
                                                            <TrendingUp className="w-5 h-5 text-green-700" />
                                                        ) : txn.transactionType === 'spent' ? (
                                                            <TrendingDown className="w-5 h-5 text-red-700" />
                                                        ) : txn.transactionType === 'refund' ? (
                                                            <RefreshCw className="w-5 h-5 text-blue-700" />
                                                        ) : (
                                                            <Coins className="w-5 h-5 text-yellow-700" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge variant="outline" className="text-xs">
                                                                {txn.transactionType}
                                                            </Badge>
                                                            {txn.relatedEntityName && (
                                                                <span className="text-xs text-slate-500">
                                                                    · {txn.relatedEntityName}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="font-medium text-slate-900 truncate">
                                                            {txn.description}
                                                        </p>
                                                        <p className="text-sm text-slate-500 mt-1">
                                                            {format(new Date(txn.created_date), 'MMM d, yyyy • h:mm a')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0 ml-4">
                                                    <div className={`text-lg font-bold ${
                                                        txn.amount > 0 ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                        {txn.amount > 0 ? '+' : ''}{txn.amount}
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-1">
                                                        Balance: {txn.balanceAfter}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}