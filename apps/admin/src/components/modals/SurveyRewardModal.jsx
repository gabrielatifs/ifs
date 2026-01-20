import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@ifs/shared/components/ui/dialog';
import { Button } from '@ifs/shared/components/ui/button';
import { Coins, Sparkles, Award, CheckCircle, X, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SurveyRewardModal({ open, onClose, surveyTitle }) {
    const [animatedHours, setAnimatedHours] = useState(0);
    const creditsAwarded = 0.1;

    useEffect(() => {
        if (open) {
            // Animate the hours counter
            const duration = 1500;
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

            return () => clearInterval(timer);
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-0 shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-50 rounded-full p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
                    aria-label="Close"
                >
                    <X className="w-5 h-5 text-white" />
                </button>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative"
                >
                    {/* Gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
                        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 px-8 py-12 text-center">
                        {/* Success icon with animation */}
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
                                <div className="absolute inset-0 bg-amber-400 rounded-full blur-xl opacity-60 animate-pulse"></div>
                                <div className="relative p-6 bg-white rounded-full shadow-2xl">
                                    <Coins className="w-16 h-16 text-amber-600" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Floating sparkles */}
                        <div className="absolute inset-0 pointer-events-none">
                            {[...Array(12)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ 
                                        opacity: 0, 
                                        y: 20,
                                        x: Math.random() * 100 - 50 
                                    }}
                                    animate={{ 
                                        opacity: [0, 1, 0],
                                        y: -120,
                                        x: Math.random() * 200 - 100
                                    }}
                                    transition={{
                                        duration: 2.5,
                                        delay: i * 0.15,
                                        repeat: Infinity,
                                        repeatDelay: 2
                                    }}
                                    className="absolute top-1/2 left-1/2"
                                >
                                    <Sparkles className="w-4 h-4 text-amber-300" />
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                                <CheckCircle className="w-5 h-5 text-white" />
                                <span className="text-white font-semibold text-sm">Survey Completed</span>
                            </div>
                        </motion.div>

                        <motion.h2 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-3xl font-bold text-white mb-3"
                        >
                            CPD Hours Earned!
                        </motion.h2>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.7, type: "spring", stiffness: 150 }}
                            className="mb-6"
                        >
                            <div className="inline-block px-8 py-4 bg-gradient-to-br from-amber-400 to-amber-500 rounded-3xl border-4 border-amber-300/50 shadow-2xl">
                                <div className="flex items-baseline gap-2 justify-center">
                                    <Sparkles className="w-6 h-6 text-amber-900" />
                                    <motion.span 
                                        key={animatedHours}
                                        className="text-6xl font-black text-amber-900"
                                    >
                                        {animatedHours.toFixed(1)}
                                    </motion.span>
                                    <span className="text-2xl text-amber-800 font-bold">
                                        CPD Hours
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.9 }}
                            className="text-white text-lg mb-2 font-medium"
                        >
                            Thank you for sharing your insights!
                        </motion.p>
                        
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="text-white/80 text-sm mb-8 max-w-md mx-auto"
                        >
                            Your feedback on "{surveyTitle}" helps us improve safeguarding practice across the sector.
                        </motion.p>

                        {/* Info cards */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.1 }}
                            className="grid grid-cols-2 gap-3 mb-8"
                        >
                            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                <Award className="w-6 h-6 text-amber-300 mx-auto mb-2" />
                                <div className="text-xs font-bold text-white mb-1">Value</div>
                                <div className="text-sm text-white/90">£2 training credit</div>
                            </div>
                            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                <TrendingUp className="w-6 h-6 text-emerald-300 mx-auto mb-2" />
                                <div className="text-xs font-bold text-white mb-1">Impact</div>
                                <div className="text-sm text-white/90">Direct influence</div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.2 }}
                        >
                            <Button
                                onClick={onClose}
                                size="lg"
                                className="bg-white text-green-700 hover:bg-green-50 font-bold px-8 shadow-xl"
                            >
                                Continue
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}