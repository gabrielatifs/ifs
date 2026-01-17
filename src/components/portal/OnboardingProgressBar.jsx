import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

const OnboardingProgressBar = ({ user, onDismiss }) => {
    const [open, setOpen] = useState(false);
    const [showBar, setShowBar] = useState(true);

    const tasks = [
        {
            id: 'profile',
            title: 'Complete your profile',
            description: 'Add your professional details',
            completed: !!(user.displayName && user.firstName && user.lastName && user.organisationName)
        },
        {
            id: 'masterclass',
            title: 'Book your first masterclass',
            description: 'Join a free professional development session',
            completed: false // This would need to check EventSignup entity
        },
        {
            id: 'training',
            title: 'Explore CPD Training',
            description: 'Browse our accredited courses',
            completed: false // Could track if they visited CPDTraining page
        },
        {
            id: 'organisation',
            title: 'Set up your organisation',
            description: 'Create or join your team',
            completed: !!user.organisationId
        },
        {
            id: 'certificate',
            title: 'View your credentials',
            description: 'Download your membership certificate',
            completed: false // Could check if they visited MyCertificates
        }
    ];

    const completedTasks = tasks.filter(task => task.completed).length;
    const totalTasks = tasks.length;
    const progress = Math.round((completedTasks / totalTasks) * 100);
    const isComplete = progress === 100;

    const handleDismiss = () => {
        setShowBar(false);
        if (onDismiss) {
            onDismiss();
        }
    };

    if (!showBar || isComplete) return null;

    return (
        <>
            <AnimatePresence>
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    className="fixed bottom-24 left-6 z-40 lg:bottom-6"
                >
                    <button
                        onClick={() => setOpen(true)}
                        className="group bg-white rounded-lg shadow-lg border border-slate-200 hover:shadow-xl transition-all p-4 flex items-center gap-3 max-w-xs"
                    >
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-slate-900">Getting Started</span>
                                <span className="text-xs text-slate-500">{completedTasks}/{totalTasks}</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>
                        <div className="text-purple-600 group-hover:text-purple-700 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </button>
                </motion.div>
            </AnimatePresence>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <DialogTitle className="text-2xl">Complete Your Setup</DialogTitle>
                                <DialogDescription className="mt-2">
                                    Get the most out of your IfS membership
                                </DialogDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDismiss}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                Dismiss
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Progress Overview */}
                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-slate-900">Overall Progress</span>
                                <span className="text-lg font-bold text-purple-600">{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-3" />
                            <p className="text-xs text-slate-600 mt-2">
                                {completedTasks === totalTasks ? (
                                    "🎉 You've completed all tasks!"
                                ) : (
                                    `${totalTasks - completedTasks} ${totalTasks - completedTasks === 1 ? 'task' : 'tasks'} remaining`
                                )}
                            </p>
                        </div>

                        {/* Task List */}
                        <div className="space-y-3">
                            {tasks.map((task, index) => (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`flex items-start gap-3 p-4 rounded-lg border transition-all ${
                                        task.completed
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-white border-slate-200 hover:border-purple-200 hover:shadow-sm'
                                    }`}
                                >
                                    <div className="flex-shrink-0 mt-0.5">
                                        {task.completed ? (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-slate-300" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`font-semibold text-sm ${
                                            task.completed ? 'text-green-900' : 'text-slate-900'
                                        }`}>
                                            {task.title}
                                        </h4>
                                        <p className={`text-xs mt-1 ${
                                            task.completed ? 'text-green-700' : 'text-slate-600'
                                        }`}>
                                            {task.description}
                                        </p>
                                    </div>
                                    {task.completed && (
                                        <span className="flex-shrink-0 text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
                                            Done
                                        </span>
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        {/* Quick Actions */}
                        {!isComplete && (
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                <p className="text-sm font-semibold text-slate-900 mb-3">Quick Actions</p>
                                <div className="flex flex-wrap gap-2">
                                    {!tasks[0].completed && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                window.location.href = '/MyProfile';
                                                setOpen(false);
                                            }}
                                        >
                                            Complete Profile
                                        </Button>
                                    )}
                                    {!tasks[1].completed && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                window.location.href = '/MemberMasterclasses';
                                                setOpen(false);
                                            }}
                                        >
                                            View Masterclasses
                                        </Button>
                                    )}
                                    {!tasks[2].completed && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                window.location.href = '/CPDTraining';
                                                setOpen(false);
                                            }}
                                        >
                                            Browse Training
                                        </Button>
                                    )}
                                    {!tasks[3].completed && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                window.location.href = '/ManageOrganisation';
                                                setOpen(false);
                                            }}
                                        >
                                            Set Up Organisation
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default OnboardingProgressBar;