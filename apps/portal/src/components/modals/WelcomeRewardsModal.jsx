
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@ifs/shared/components/ui/dialog';
import { Button } from '@ifs/shared/components/ui/button';
import { Coins, Sparkles, Award, CheckCircle, Info, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@ifs/shared/components/providers/UserProvider';

export default function WelcomeRewardsModal({ open, onClose, user: propUser }) {
    const { user: contextUser, updateUserProfile } = useUser();
    const user = propUser || contextUser;
    
    const [step, setStep] = useState(1);
    const [animatedHours, setAnimatedHours] = useState(0);
    const [isAwarding, setIsAwarding] = useState(false);
    const creditsAwarded = 0.1;

    useEffect(() => {
        if (open && step === 1 && !isAwarding) {
            // Award CPD hours when modal opens
            awardCpdHours();
        }
    }, [open, step]);

    const awardCpdHours = async () => {
        if (!user || user.welcomeBonusAwarded) {
            // Already awarded, just animate
            animateHoursCounter();
            return;
        }

        setIsAwarding(true);
        try {
            const { base44 } = await import('@/api/base44Client');
            
            const bonusAmount = 0.1;
            const newBalance = (user.cpdHours || 0) + bonusAmount;
            
            // Update user's CPD hours
            await updateUserProfile({
                cpdHours: newBalance,
                totalCpdEarned: (user.totalCpdEarned || 0) + bonusAmount,
                welcomeBonusAwarded: true,
                lastCpdAllocationDate: new Date().toISOString()
            });
            
            // Create transaction record
            await base44.entities.CreditTransaction.create({
                userId: user.id,
                userEmail: user.email,
                transactionType: 'allocation',
                amount: bonusAmount,
                balanceAfter: newBalance,
                description: 'Welcome bonus for completing membership signup',
                relatedEntityType: 'Manual',
                relatedEntityName: 'Membership Signup Completion'
            });
            
            console.log('[WelcomeRewardsModal] Awarded 0.1 CPD hours as welcome bonus');
        } catch (error) {
            console.error('[WelcomeRewardsModal] Failed to award welcome bonus:', error);
        } finally {
            setIsAwarding(false);
            animateHoursCounter();
        }
    };

    const animateHoursCounter = () => {
        // Animate the hours counter
        const duration = 2000;
        const fps = 60;
        const frames = (duration / 1000) * fps;
        const increment = creditsAwarded / frames;
        let currentFrame = 0;

        const timer = setInterval(() => {
            currentFrame++;
            if (currentFrame >= frames) {
                setAnimatedHours(creditsAwarded);
                clearInterval(timer);
            } else {
                setAnimatedHours(increment * currentFrame);
            }
        }, 1000 / fps);
    };

    const handleNext = () => {
        if (step === 1) {
            setStep(2);
        } else {
            onClose();
        }
    };

    const handleClose = () => {
        setStep(1); // Reset step for next time
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 shadow-2xl">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute right-4 top-4 z-50 rounded-full p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
                    aria-label="Close"
                >
                    <X className="w-5 h-5 text-white" />
                </button>

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="relative"
                        >
                            {/* Background decoration */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
                            </div>

                            {/* Content */}
                            <div className="relative z-10 px-8 py-12 text-center">
                                {/* Animated coin icon */}
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
                                        <div className="absolute inset-0 bg-amber-400 rounded-full blur-xl opacity-60"></div>
                                        <div className="relative p-6 bg-white rounded-full">
                                            <Coins className="w-16 h-16 text-amber-600" />
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
                                    Welcome Bonus!
                                </motion.h2>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="mb-4"
                                >
                                    <div className="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm rounded-2xl border-2 border-white/30">
                                        <div className="flex items-baseline gap-2">
                                            <motion.span 
                                                key={animatedHours}
                                                initial={{ scale: 1.2, opacity: 0.7 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="text-5xl font-bold text-white"
                                            >
                                                {animatedHours.toFixed(1)}
                                            </motion.span>
                                            <span className="text-2xl text-white/90 font-semibold">
                                                CPD Hours
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="text-white/90 text-lg mb-8"
                                >
                                    Awarded for completing your membership signup!
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1 }}
                                >
                                    <Button
                                        onClick={handleNext}
                                        size="lg"
                                        className="bg-white text-purple-700 hover:bg-purple-50 font-semibold px-8 shadow-lg"
                                    >
                                        Learn More
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </motion.div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white"
                        >
                            <div className="px-8 py-6 bg-gradient-to-r from-purple-600 to-indigo-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Info className="w-6 h-6 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">
                                        About CPD Hours
                                    </h2>
                                </div>
                            </div>

                            <div className="px-8 py-6 space-y-6">
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-3 text-lg">
                                        What are CPD Hours?
                                    </h3>
                                    <p className="text-slate-700 leading-relaxed">
                                        CPD Hours represent accredited professional development time at IfS. 
                                        Use them to access training courses, supervision sessions, masterclasses, 
                                        and advisory services.
                                    </p>
                                </div>

                                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Award className="w-5 h-5 text-purple-600" />
                                        <span className="font-semibold text-purple-900">Hour Value</span>
                                    </div>
                                    <p className="text-sm text-purple-800">
                                        <strong>1 CPD hour = £20 training value</strong>
                                        <br />
                                        All hours contribute to your CPD record and never expire
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-3">
                                        How to Use Your Hours
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">Book Training</p>
                                                <p className="text-xs text-slate-600">Access accredited CPD courses and workshops</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">Never Expire</p>
                                                <p className="text-xs text-slate-600">Save them up for future courses or use immediately</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">Full Control</p>
                                                <p className="text-xs text-slate-600">Use them for any CPD training course you choose</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                                    <div className="flex items-start gap-2">
                                        <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-amber-900 mb-1">
                                                Earn More Hours
                                            </p>
                                            <p className="text-xs text-amber-800">
                                                Upgrade to Professional Membership to receive 1 CPD hour every month 
                                                (12 hours annually = £240 training value) for unlimited professional development opportunities.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button
                                        onClick={handleClose}
                                        size="lg"
                                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                                    >
                                        Got it, thanks!
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
