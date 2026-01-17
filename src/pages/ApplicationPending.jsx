import React from 'react';
import { Button } from '@/components/ui/button';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { MailCheck, LogOut, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ApplicationPending() {
    const handleLogout = async () => {
        await User.logout();
        window.location.href = createPageUrl('Home');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6">
            <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200/80 overflow-hidden">
                <div className="p-8 sm:p-12 text-center">
                    <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center border-4 border-green-50 mb-6">
                        <MailCheck className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-4">
                        Thank you for your application!
                    </h1>
                    <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto">
                        Your application to join the Independent Federation for Safeguarding has been received. Our team will review it shortly.
                    </p>
                    <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto">
                        You will receive an email notification once your membership has been approved.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button 
                            onClick={handleLogout} 
                            variant="outline"
                            className="w-full sm:w-auto"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                        </Button>
                        <Button asChild className="w-full sm:w-auto">
                            <Link to={createPageUrl('Home')}>
                                <Home className="w-4 h-4 mr-2" />
                                Return to Main Site
                            </Link>
                        </Button>
                    </div>
                </div>
                <div className="bg-slate-50 px-8 py-4 text-center text-sm text-slate-500 border-t">
                    If you have any questions, please contact us at <a href="mailto:info@ifs-safeguarding.co.uk" className="text-purple-700 font-medium hover:underline">info@ifs-safeguarding.co.uk</a>.
                </div>
            </div>
        </div>
    );
}