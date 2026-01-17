import React, { useState } from 'react';
import { useUser } from '../components/providers/UserProvider';
import PortalSidebar from '../components/portal/PortalSidebar';
import PortalHeader from '../components/portal/PortalHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, CheckCircle, ArrowLeft } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { requestOrgPayment } from '@/api/functions';

export default function RequestOrgPayment() {
    const { user, loading: userLoading } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [managerName, setManagerName] = useState('');
    const [managerEmail, setManagerEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { data } = await requestOrgPayment({
                managerName,
                managerEmail,
                message,
            });

            if (data.success) {
                setIsSubmitted(true);
            } else {
                throw new Error(data.error || 'Failed to send request.');
            }
        } catch (error) {
            console.error("Failed to send payment request:", error);
            toast({
                title: "Submission Failed",
                description: "There was an error sending your request. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (userLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>;
    }

    if (!user) {
        // This case should be handled by UserProvider, but as a fallback:
        return <div>User not found. Please log in to access this page.</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            <Toaster />
            <PortalSidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <PortalHeader user={user} setSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="max-w-3xl mx-auto">
                        <div className="mb-8">
                            <Link to={createPageUrl('PortalMembershipTiers')} className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Membership Tiers
                            </Link>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Request Organisational Payment</h1>
                            <p className="text-slate-600 text-lg">Send a formal request to your organisation to fund your Full Membership.</p>
                        </div>

                        <div className="bg-white p-8 rounded-lg shadow-sm border">
                            {isSubmitted ? (
                                <div className="text-center py-12 flex flex-col items-center">
                                    <CheckCircle className="w-16 h-16 text-green-600 mb-4" />
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Sent!</h3>
                                    <p className="text-gray-600 max-w-md mb-6">Your request has been sent to {managerEmail}. We've also sent you a confirmation email.</p>
                                    <Button asChild>
                                        <Link to={createPageUrl('Dashboard')}>Go to Dashboard</Link>
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="bg-slate-50 p-4 rounded-md border">
                                        <p className="font-semibold">You are requesting:</p>
                                        <p className="text-slate-800">IfS Full Membership - <span className="font-bold">£350 per year</span></p>
                                        <p className="text-sm text-slate-600">This will be sent on behalf of {user.displayName} ({user.email}).</p>
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="managerName" className="block text-sm font-medium text-gray-700 mb-1">Approver's Name *</label>
                                        <Input
                                            id="managerName"
                                            value={managerName}
                                            onChange={(e) => setManagerName(e.target.value)}
                                            placeholder="e.g., Jane Doe"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="managerEmail" className="block text-sm font-medium text-gray-700 mb-1">Approver's Email *</label>
                                        <Input
                                            id="managerEmail"
                                            type="email"
                                            value={managerEmail}
                                            onChange={(e) => setManagerEmail(e.target.value)}
                                            placeholder="e.g., manager@organisation.com"
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Add a Personal Message (Optional)</label>
                                        <Textarea
                                            id="message"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="You can add a short message to provide context for your request..."
                                            rows={4}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        size="lg"
                                        className="w-full"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Sending Request...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5 mr-2" />
                                                Send Funding Request
                                            </>
                                        )}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}