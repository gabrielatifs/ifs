import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useUser } from '../providers/UserProvider';

const tourSteps = [
    {
        id: 'welcome',
        title: 'Welcome to Your Member Portal! 🎉',
        description: 'Let\'s take a quick tour of the key features available to you as an IfS member.',
        target: null,
        position: 'center'
    },
    {
        id: 'certificates',
        title: 'Digital Credentials',
        description: 'Access your verified digital credentials and certificates. You can share them on LinkedIn or request paper copies.',
        target: '[data-tour="certificates"]',
        position: 'left'
    },
    {
        id: 'masterclasses',
        title: 'Free Masterclasses',
        description: 'Explore exclusive monthly professional development sessions. All masterclasses are free for members and include recordings.',
        target: '[data-tour="masterclasses"]',
        position: 'right'
    },
    {
        id: 'training',
        title: 'CPD Training',
        description: 'Browse accredited CPD training courses. Use your CPD hours for discounts on any course.',
        target: '[data-tour="training"]',
        position: 'left'
    },
    {
        id: 'supervision',
        title: 'Professional Supervision',
        description: 'Book individual or group supervision sessions with experienced safeguarding professionals.',
        target: '[data-tour="supervision"]',
        position: 'left'
    },
    {
        id: 'organisation',
        title: 'Your Organisation',
        description: 'Manage your organisation profile, invite team members, and track organisational benefits.',
        target: '[data-tour="organisation"]',
        position: 'right'
    },
    {
        id: 'upgrade',
        title: 'Upgrade Your Membership',
        description: 'Professional members receive monthly CPD hours, access to all masterclass recordings, and exclusive discounts.',
        target: '[data-tour="upgrade"]',
        position: 'top'
    },
    {
        id: 'cpd-meter',
        title: 'CPD Hours Balance',
        description: 'This meter shows your CPD hours balance. Full Members receive monthly CPD hours (free training credit). Hours never expire and can be used for any CPD training course. 1 hour = £20 training value.',
        target: '[data-tour="cpd-meter"]',
        position: 'bottom'
    },
    {
        id: 'complete',
        title: 'You\'re All Set! 🎉',
        description: 'You\'ve completed the tour! Enjoy your member portal and access all the benefits available to you.',
        target: null,
        position: 'center'
    }
];

export default function PortalTour({ onComplete }) {
    const { user, updateUserProfile } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [highlightElement, setHighlightElement] = useState(null);

    useEffect(() => {
        // Show tour if user hasn't seen it yet AND not on mobile
        if (user && !user.hasSeenPortalTour) {
            // Check if mobile device (screen width < 768px)
            const isMobile = window.innerWidth < 768;
            
            if (!isMobile) {
                // Small delay to ensure DOM elements are rendered
                setTimeout(() => {
                    setIsOpen(true);
                }, 1000);
            } else {
                // Skip tour on mobile and mark as seen
                updateUserProfile({ hasSeenPortalTour: true });
                if (onComplete) onComplete();
            }
        }
    }, [user]);

    useEffect(() => {
        if (!isOpen) return;

        const step = tourSteps[currentStep];
        
        if (step.target) {
            // Wait a bit for page to render
            setTimeout(() => {
                const element = document.querySelector(step.target);
                setHighlightElement(element);

                if (element) {
                    // Scroll element into view
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'center'
                    });
                }
            }, 300);
        } else {
            setHighlightElement(null);
            // Scroll to top for welcome/complete steps
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }, [currentStep, isOpen]);

    const handleNext = () => {
        if (currentStep < tourSteps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleComplete = async () => {
        setIsOpen(false);
        setHighlightElement(null);
        
        // Just mark tour as seen
        try {
            await updateUserProfile({ hasSeenPortalTour: true });
            console.log('[PortalTour] Tour completed, marked as seen');
            if (onComplete) onComplete();
        } catch (error) {
            console.error('[PortalTour] Failed to update tour status:', error);
            if (onComplete) onComplete();
        }
    };

    const handleSkip = () => {
        handleComplete();
    };

    if (!isOpen) return null;

    const step = tourSteps[currentStep];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === tourSteps.length - 1;

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/40 z-[9998] transition-opacity" />

            {/* Highlight spotlight */}
            {highlightElement && (
                <>
                    {/* Pulsing glow */}
                    <div
                        className="fixed z-[9999] pointer-events-none animate-pulse"
                        style={{
                            top: `${highlightElement.getBoundingClientRect().top - 12}px`,
                            left: `${highlightElement.getBoundingClientRect().left - 12}px`,
                            width: `${highlightElement.getBoundingClientRect().width + 24}px`,
                            height: `${highlightElement.getBoundingClientRect().height + 24}px`,
                            boxShadow: '0 0 0 4px rgba(147, 51, 234, 0.5), 0 0 60px 15px rgba(147, 51, 234, 0.7)',
                            borderRadius: '16px',
                            transition: 'all 0.3s ease'
                        }}
                    />
                    
                    {/* Main spotlight cutout */}
                    <div
                        className="fixed z-[9999] pointer-events-none"
                        style={{
                            top: `${highlightElement.getBoundingClientRect().top - 8}px`,
                            left: `${highlightElement.getBoundingClientRect().left - 8}px`,
                            width: `${highlightElement.getBoundingClientRect().width + 16}px`,
                            height: `${highlightElement.getBoundingClientRect().height + 16}px`,
                            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.40)',
                            borderRadius: '12px',
                            border: '3px solid rgb(147, 51, 234)',
                            transition: 'all 0.3s ease'
                        }}
                    />
                </>
            )}

            {/* Tooltip - Fixed at bottom center */}
            <div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-[10000] bg-white rounded-xl shadow-2xl max-w-md w-[95vw] sm:w-[90vw] p-5 sm:p-6 border-2 border-purple-200 max-h-[90vh] overflow-y-auto">
                <button
                    onClick={handleSkip}
                    className="absolute top-3 right-3 p-2 rounded-full hover:bg-slate-100 transition-colors z-10"
                >
                    <X className="w-6 h-6 text-slate-500" />
                </button>

                <div className="mb-4 mt-1">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-slate-900 pr-8">{step.title}</h3>
                        <span className="text-sm text-slate-500 whitespace-nowrap">
                            {currentStep + 1} / {tourSteps.length}
                        </span>
                    </div>
                    <p className="text-slate-600">{step.description}</p>
                </div>

                {/* Progress dots */}
                <div className="flex items-center justify-center gap-1.5 mb-4">
                    {tourSteps.map((_, index) => (
                        <div
                            key={index}
                            className={`h-1.5 rounded-full transition-all ${
                                index === currentStep
                                    ? 'bg-purple-600 w-8'
                                    : index < currentStep
                                    ? 'bg-purple-300 w-1.5'
                                    : 'bg-slate-200 w-1.5'
                            }`}
                        />
                    ))}
                </div>

                <div className="flex items-center justify-between gap-3">
                    <Button
                        variant="ghost"
                        onClick={handleSkip}
                        className="text-slate-600"
                    >
                        Skip Tour
                    </Button>
                    <div className="flex gap-2">
                        {!isFirstStep && (
                            <Button
                                variant="outline"
                                onClick={handlePrevious}
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Back
                            </Button>
                        )}
                        <Button
                            onClick={handleNext}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            {isLastStep ? 'Get Started' : 'Next'}
                            {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}