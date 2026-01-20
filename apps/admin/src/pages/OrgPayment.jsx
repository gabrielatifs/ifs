import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Loader2, CheckCircle, X, AlertCircle } from 'lucide-react';
import { Button } from '@ifs/shared/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@ifs/shared/utils';
import { verifyOrgPaymentAndUpgrade } from '@ifs/shared/api/functions';

export default function OrgPayment() {
    const location = useLocation();
    const [verificationStatus, setVerificationStatus] = useState('checking'); // checking, success, error
    const [message, setMessage] = useState('');
    const [beneficiaryDetails, setBeneficiaryDetails] = useState(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const sessionId = urlParams.get('session_id');
        
        if (!sessionId) {
            setVerificationStatus('error');
            setMessage('No payment session found. Please contact support.');
            return;
        }

        const verifyPayment = async () => {
            try {
                console.log('Verifying org payment for session:', sessionId);
                const { data } = await verifyOrgPaymentAndUpgrade({ sessionId });
                
                if (data.success) {
                    setVerificationStatus('success');
                    setMessage(data.message);
                    setBeneficiaryDetails({
                        userId: data.beneficiaryUserId,
                        membershipType: data.membershipType
                    });
                } else {
                    throw new Error(data.error || 'Verification failed');
                }
            } catch (error) {
                console.error('Payment verification failed:', error);
                setVerificationStatus('error');
                setMessage(error.message || 'Payment verification failed. Please contact support.');
            }
        };

        verifyPayment();
    }, [location.search]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                {verificationStatus === 'checking' && (
                    <>
                        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Processing Payment</h1>
                        <p className="text-slate-600">
                            Please wait while we verify your payment and upgrade the member's account...
                        </p>
                    </>
                )}

                {verificationStatus === 'success' && (
                    <>
                        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h1>
                        <p className="text-slate-600 mb-6">
                            The membership has been upgraded successfully. The member has been notified and their Full Membership is now active.
                        </p>
                        <Button asChild className="w-full">
                            <Link to={createPageUrl('Home')}>Return to IfS Website</Link>
                        </Button>
                    </>
                )}

                {verificationStatus === 'error' && (
                    <>
                        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Issue</h1>
                        <p className="text-slate-600 mb-6">
                            {message}
                        </p>
                        <div className="space-y-2">
                            <Button asChild className="w-full">
                                <Link to={createPageUrl('Contact')}>Contact Support</Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full">
                                <Link to={createPageUrl('Home')}>Return to IfS Website</Link>
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}