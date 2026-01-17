
import React from 'react';
import { Button } from '@ifs/shared/components/ui/button';
import { User } from '@ifs/shared/api/entities';
import { createPageUrl } from '@ifs/shared/utils';
import { ArrowRight, Lock, Shield, BookOpen, Users, Award, CheckCircle, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import MainSiteNav from '../components/marketing/MainSiteNav';

export default function MemberAccessRequired() {
    const handleLogin = () => {
        User.loginWithRedirect(createPageUrl('Dashboard'));
    };

    const handleJoin = () => {
        window.location.href = createPageUrl('JoinUs');
    };

    return (
        <>
            {/* Hero Section */}
            <section className="relative bg-slate-900 overflow-hidden min-h-screen">
                {/* Professional Background */}
                <div className="absolute inset-0">
                    <img 
                        src="https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2069&auto=format&fit=crop" 
                        alt="Professional meeting"
                        className="w-full h-full object-cover opacity-20"
                    />
                </div>
                
                {/* Clean Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>

                <MainSiteNav />

                <div className="relative z-10 flex items-center justify-center min-h-screen py-20">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            {/* Left Column - Content */}
                            <div className="text-center lg:text-left">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                                    <Lock className="w-8 h-8 text-red-600" />
                                </div>
                                
                                <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
                                    Member Access Required
                                </h1>
                                
                                <p className="text-xl text-slate-300 mb-8 leading-relaxed max-w-lg">
                                    This content is exclusive to IfS members. Join our professional community or sign in to access premium resources and expert guidance.
                                </p>
                                
                                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                    <Button 
                                        onClick={handleJoin}
                                        size="lg" 
                                        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                                    >
                                        Become a Member
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                    
                                    <Button 
                                        onClick={handleLogin}
                                        size="lg" 
                                        className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white hover:text-slate-900 font-semibold px-8 py-3 transition-all duration-300 transform hover:-translate-y-0.5"
                                    >
                                        Sign In
                                    </Button>
                                </div>

                                {/* Trust Indicators */}
                                <div className="flex items-center justify-center lg:justify-start gap-6 text-slate-400">
                                    <div className="flex items-center gap-2 text-sm">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        <span>5,000+ Members</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Star className="w-4 h-4 text-yellow-400" />
                                        <span>CPD Accredited</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Benefits Card */}
                            <div className="relative">
                                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
                                    <div className="text-center mb-8">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                                            <Shield className="w-8 h-8 text-purple-600" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Premium Member Benefits</h2>
                                        <p className="text-slate-600">Unlock professional development and expert resources</p>
                                    </div>

                                    <div className="space-y-6 mb-8">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <BookOpen className="w-6 h-6 text-purple-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-900 mb-1">Expert Training & CPD</h3>
                                                <p className="text-sm text-slate-600">Access 50+ accredited courses, masterclasses, and exclusive workshops</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <Users className="w-6 h-6 text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-900 mb-1">Professional Community</h3>
                                                <p className="text-sm text-slate-600">Connect with peers in private forums and exclusive networking events</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <Award className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-900 mb-1">Professional Recognition</h3>
                                                <p className="text-sm text-slate-600">Earn post-nominals (AMIFS/MIFS) and digital credentials</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Call to Action */}
                                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-center text-white">
                                        <h3 className="font-bold text-lg mb-2">Start with Associate Membership</h3>
                                        <div className="text-3xl font-bold mb-1">FREE</div>
                                        <p className="text-purple-100 text-sm">No commitment • Upgrade anytime</p>
                                    </div>
                                </div>

                                {/* Subtle accent elements */}
                                <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-200 rounded-full opacity-20 blur-xl"></div>
                                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-200 rounded-full opacity-20 blur-xl"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
