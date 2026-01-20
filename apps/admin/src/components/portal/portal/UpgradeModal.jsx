import React, { useState } from 'react';
import { Button } from '@ifs/shared/components/ui/button';
import { Badge } from '@ifs/shared/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@ifs/shared/utils';
import { X, Crown, Bookmark, Users, BookOpen, Calendar, Shield, Loader2, Sparkles } from 'lucide-react';
import { createCheckout } from '@ifs/shared/api/functions';

export default function UpgradeModal({ isOpen, onClose, user }) {
    const [isUpgrading, setIsUpgrading] = useState(false);

    if (!isOpen) return null;

    const handleUpgrade = async () => {
        if (!user) return;
        setIsUpgrading(true);
        try {
            const { data } = await createCheckout({
                successUrl: `${window.location.origin}${createPageUrl('Dashboard')}?payment=success`,
                cancelUrl: window.location.href,
            });
            if (data && data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error("Error during checkout process:", error);
        } finally {
            setIsUpgrading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[2000] overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
                
                <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-auto p-6 transform transition-all">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Crown className="w-8 h-8 text-white" />
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Unlock Premium Features
                        </h3>

                        <p className="text-gray-600 mb-6">
                            Save services to your personal collection is available to Full Members only. Upgrade to access this and many other premium features.
                        </p>

                        <div className="bg-purple-50 rounded-lg p-4 mb-6 text-left">
                            <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Full Member Benefits Include:
                            </h4>
                            <div className="space-y-2 text-sm text-purple-800">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-3 h-3" />
                                    <span><strong>1 CPD hour monthly</strong> for professional development</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className="w-3 h-3" />
                                    <span>Save unlimited services to your personal directory</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-3 h-3" />
                                    <span>10% discount on all training & supervision</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-3 h-3" />
                                    <span>Voting rights & sector influence</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Button 
                                onClick={handleUpgrade}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3"
                                disabled={isUpgrading}
                            >
                                {isUpgrading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Upgrade to Full Member - £20/month'
                                )}
                            </Button>
                            
                            <Button 
                                variant="outline" 
                                onClick={onClose}
                                className="w-full"
                                disabled={isUpgrading}
                            >
                                Maybe Later
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}