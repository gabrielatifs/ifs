import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Sparkles, CheckCircle, X, Coins, Award, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UpgradeSuccessModal({ open, onClose, user }) {
    const monthlyHours = user?.monthlyCpdHours || 1;
    const currentBalance = user?.cpdHours || 0;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-0 shadow-2xl max-h-[90vh] flex flex-col">
                {/* Close button - Fixed position relative to modal container */}
                <div className="absolute right-4 top-4 z-50">
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 bg-black/20 hover:bg-black/30 text-white backdrop-blur-sm transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative min-h-full"
                    >
                    {/* Background decoration */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 px-8 py-12 text-center">
                        {/* Success Icon with Animation */}
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ 
                                type: "spring", 
                                stiffness: 200, 
                                damping: 15,
                                delay: 0.2
                            }}
                            className="inline-block mb-6"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-60"></div>
                                <div className="relative p-6 bg-white rounded-full">
                                    <Crown className="w-16 h-16 text-purple-600" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Floating sparkles */}
                        <div className="absolute inset-0 pointer-events-none">
                            {[...Array(8)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ 
                                        opacity: 0, 
                                        y: 20,
                                        x: Math.random() * 100 - 50 
                                    }}
                                    animate={{ 
                                        opacity: [0, 1, 0],
                                        y: -100,
                                        x: Math.random() * 200 - 100
                                    }}
                                    transition={{
                                        duration: 2,
                                        delay: i * 0.2,
                                        repeat: Infinity,
                                        repeatDelay: 1
                                    }}
                                    className="absolute top-1/2 left-1/2"
                                >
                                    <Sparkles className="w-4 h-4 text-amber-300" />
                                </motion.div>
                            ))}
                        </div>

                        <motion.h2 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-3xl font-bold text-white mb-3"
                        >
                            🎉 Upgrade Successful!
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-white/90 text-lg mb-8"
                        >
                            Welcome to <strong>Full Membership</strong>
                        </motion.p>

                        {/* CPD Balance Display */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.8 }}
                            className="mb-6"
                        >
                            <div className="inline-block px-8 py-4 bg-white/20 backdrop-blur-sm rounded-2xl border-2 border-white/30">
                                <div className="flex items-center gap-3 mb-2">
                                    <Coins className="w-6 h-6 text-amber-300" />
                                    <span className="text-white/90 font-medium">Your CPD Balance</span>
                                </div>
                                <div className="text-5xl font-bold text-white">
                                    {currentBalance.toFixed(1)}
                                </div>
                                <div className="text-white/80 text-sm mt-1">
                                    CPD Hours
                                </div>
                            </div>
                        </motion.div>

                        {/* Benefits List */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 }}
                            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 text-left border border-white/20"
                        >
                            <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-amber-300" />
                                Your Full Member Benefits
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="p-1 bg-green-500/20 rounded-full mt-0.5">
                                        <CheckCircle className="w-4 h-4 text-green-300" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{monthlyHours} CPD Hour{monthlyHours !== 1 ? 's' : ''} Every Month</p>
                                        <p className="text-white/70 text-sm">Automatically renewed for continuous learning</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-1 bg-green-500/20 rounded-full mt-0.5">
                                        <CheckCircle className="w-4 h-4 text-green-300" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">All Masterclass Recordings</p>
                                        <p className="text-white/70 text-sm">Access the complete library anytime</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-1 bg-green-500/20 rounded-full mt-0.5">
                                        <CheckCircle className="w-4 h-4 text-green-300" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">10% Discount on All Services</p>
                                        <p className="text-white/70 text-sm">Training, supervision, and advisory</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-1 bg-green-500/20 rounded-full mt-0.5">
                                        <CheckCircle className="w-4 h-4 text-green-300" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">MIFS Post-Nominal Letters</p>
                                        <p className="text-white/70 text-sm">Professional recognition and designation</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-1 bg-green-500/20 rounded-full mt-0.5">
                                        <CheckCircle className="w-4 h-4 text-green-300" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">Priority Support</p>
                                        <p className="text-white/70 text-sm">Fast-track assistance when you need it</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.2 }}
                            className="space-y-3"
                        >
                            <Button
                                onClick={onClose}
                                size="lg"
                                className="w-full bg-white text-purple-700 hover:bg-purple-50 font-semibold shadow-lg"
                            >
                                <Zap className="w-5 h-5 mr-2" />
                                Start Exploring
                            </Button>
                            <p className="text-white/70 text-sm">
                                Your CPD hours are ready to use. Browse training courses and events now!
                            </p>
                        </motion.div>
                    </div>
                    </motion.div>
                </div>
            </DialogContent>
        </Dialog>
    );
}