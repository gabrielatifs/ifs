import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@ifs/shared/lib/supabase';
import { auth } from '@ifs/shared/api/supabaseAuth';
import { Button } from '@ifs/shared/components/ui/button';
import { Input } from '@ifs/shared/components/ui/input';
import { Label } from '@ifs/shared/components/ui/label';
import { ArrowRight, Mail, Lock } from 'lucide-react';
import AdminAuthShell from '../components/auth/AdminAuthShell';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [error, setError] = useState('');
    const [mode, setMode] = useState('login'); // 'login' or 'signup' or 'forgot'
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const redirectParam = searchParams.get('redirect');
        if (redirectParam) {
            sessionStorage.setItem('postLoginRedirectUrl', redirectParam);
        }
    }, [searchParams]);

    // Check if already authenticated on mount using same method as rest of app
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Wait for session to be restored from storage first
                const { data: { session } } = await supabase.auth.getSession();
                console.log('[Login] Session check:', session?.user?.email || 'none');

                if (session) {
                    // Use auth.me() to get the full user profile
                    const user = await auth.me();
                    if (user) {
                        console.log('[Login] Already authenticated as:', user.email);
                        // Already logged in, redirect
                        const redirectUrl = sessionStorage.getItem('postLoginRedirectUrl')
                            || searchParams.get('redirect')
                            || '/admindashboard';
                        sessionStorage.removeItem('postLoginRedirectUrl');
                        window.location.href = redirectUrl;
                        return;
                    }
                }
            } catch (err) {
                console.log('[Login] No existing session:', err.message);
            }
            setCheckingAuth(false);
        };
        checkAuth();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            if (mode === 'signup') {
                if (password.length < 8) {
                    setError('Password must be at least 8 characters.');
                    setIsLoading(false);
                    return;
                }
                if (password !== confirmPassword) {
                    setError('Passwords do not match.');
                    setIsLoading(false);
                    return;
                }
            }

            const normalizedEmail = email.trim();

            if (mode === 'login') {
                const result = await auth.signIn(normalizedEmail, password);
                if (result?.recoverySent) {
                    setError('We found your account, but it needs to be claimed. Check your email to set a password.');
                    setIsLoading(false);
                    return;
                }

                const redirectUrl = sessionStorage.getItem('postLoginRedirectUrl')
                    || searchParams.get('redirect')
                    || '/admindashboard';
                sessionStorage.removeItem('postLoginRedirectUrl');
                window.location.href = redirectUrl;
                return;
            }

            const pendingAuth = {
                email: normalizedEmail,
                password: mode === 'forgot' ? '' : password,
                mode,
            };
            sessionStorage.setItem('pendingAuth', JSON.stringify(pendingAuth));

            await auth.sendOtp(pendingAuth.email, { shouldCreateUser: mode === 'signup' });
            navigate('/verify-code');
        } catch (err) {
            console.error('Auth error:', err);
            setError(err.message || 'Authentication failed. Please try again.');
            setIsLoading(false);
        }
    };

    const titleCopy = {
        login: 'Welcome Back',
        signup: 'Request admin access',
        forgot: 'Reset admin password',
    };

    const subtitleCopy = {
        login: 'Please enter your credentials to access the administrative dashboard.',
        signup: 'Admin access requires approval from IfS leadership.',
        forgot: 'We will email a secure verification code for admin access.',
    };

    if (checkingAuth) {
        return (
            <AuthShell
                title="Checking your session"
                subtitle="Just a moment while we confirm your access."
                heroTitle="Preparing your member portal"
                heroSubtitle="We are securing your session before you continue."
                showPlayButton={false}
            >
                <div className="flex items-center justify-center py-10 text-sm text-slate-600">
                    Checking your session...
                </div>
            </AuthShell>
        );
    }

    return (
        <AdminAuthShell
            title={titleCopy[mode]}
            subtitle={subtitleCopy[mode]}
        >
            <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
                Restricted system - admin access only
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                        Email Address
                    </Label>
                    <div className="relative mt-2">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@ifs-safeguarding.org.uk"
                            required
                            className="h-12 rounded-md border-slate-200 bg-slate-50 pl-10 text-slate-900 focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
                        />
                    </div>
                </div>

                {mode !== 'forgot' && (
                    <div>
                        <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                            Password
                        </Label>
                        <div className="relative mt-2">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="h-12 rounded-md border-slate-200 bg-slate-50 pl-10 text-slate-900 focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
                            />
                        </div>
                    </div>
                )}

                {mode === 'signup' && (
                    <div>
                        <Label htmlFor="confirm-password" className="text-slate-700 font-medium">
                            Confirm Password
                        </Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter your password"
                            required
                            className="mt-2 h-12 rounded-xl border-slate-200 bg-white"
                        />
                    </div>
                )}

                {error && (
                    <div className={`rounded-xl border px-4 py-3 text-sm ${
                        error.includes('Check your email')
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-rose-200 bg-rose-50 text-rose-700'
                    }`}>
                        {error}
                    </div>
                )}

                <Button
                    type="submit"
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#7C3AED] text-base font-bold text-white shadow-lg shadow-purple-500/10 transition-colors hover:bg-[#6D28D9]"
                    disabled={isLoading}
                >
                    {isLoading
                        ? 'Working...'
                        : mode === 'login'
                        ? 'Sign In to Dashboard'
                        : mode === 'signup'
                        ? 'Create Account'
                        : 'Send Verification Code'}
                    {!isLoading && mode === 'login' && (
                        <ArrowRight className="h-5 w-5" />
                    )}
                </Button>
            </form>

            <div className="mt-6 flex flex-wrap items-center justify-between text-sm text-slate-600">
                {mode === 'login' && (
                    <>
                        <button
                            type="button"
                            onClick={() => setMode('forgot')}
                            className="font-semibold text-[#7C3AED] hover:text-[#6D28D9]"
                        >
                            Forgot Password?
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('signup')}
                            className="font-semibold text-slate-500 hover:text-[#7C3AED]"
                        >
                            Request Access
                        </button>
                    </>
                )}
                {mode === 'signup' && (
                    <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="font-semibold text-[#7C3AED] hover:text-[#6D28D9]"
                    >
                        Back to sign in
                    </button>
                )}
                {mode === 'forgot' && (
                    <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="font-semibold text-[#7C3AED] hover:text-[#6D28D9]"
                    >
                        Back to sign in
                    </button>
                )}
            </div>
        </AdminAuthShell>
    );
}
