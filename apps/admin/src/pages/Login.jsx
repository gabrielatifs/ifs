import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@ifs/shared/lib/supabase';
import { auth } from '@ifs/shared/api/supabaseAuth';
import { Button } from '@ifs/shared/components/ui/button';
import { Input } from '@ifs/shared/components/ui/input';
import { Label } from '@ifs/shared/components/ui/label';
import AuthShell from '@ifs/shared/components/auth/AuthShell';

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
        login: 'Admin sign in',
        signup: 'Request admin access',
        forgot: 'Reset admin password',
    };

    const subtitleCopy = {
        login: 'Restricted access for approved administrators only.',
        signup: 'Admin access requires approval from IfS leadership.',
        forgot: 'We will email a secure verification code for admin access.',
    };

    const heroTitleCopy = {
        login: 'Admin Control Center',
        signup: 'Request admin access',
        forgot: 'Restore your admin credentials',
    };

    const heroSubtitleCopy = {
        login: 'This console is reserved for authorized IfS administrators.',
        signup: 'Submit your request and wait for approval before continuing.',
        forgot: 'Verify your email to reset your admin password.',
    };

    const adminAuthShellProps = {
        heroBadge: 'Admin Access Only',
        pageClassName: 'bg-slate-950',
        heroOverlayClassName: 'bg-slate-950/70',
        themeVars: {
            '--auth-accent': '#b91c1c',
            '--auth-accent-2': '#7f1d1d',
            '--auth-ink': '#0f172a',
            '--auth-muted': '#475569',
            '--auth-panel': '#ffffff',
            '--auth-shadow': '0 30px 70px -45px rgba(15, 23, 42, 0.65)',
            '--auth-border': '#e2e8f0',
        },
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
        <AuthShell
            title={titleCopy[mode]}
            subtitle={subtitleCopy[mode]}
            heroTitle={heroTitleCopy[mode]}
            heroSubtitle={heroSubtitleCopy[mode]}
            {...adminAuthShellProps}
        >
            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
                Restricted system - admin access only
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <Label htmlFor="email" className="text-slate-700 font-medium">
                        Email
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="mt-2 h-12 rounded-xl border-slate-200 bg-white"
                    />
                </div>

                {mode !== 'forgot' && (
                    <div>
                        <Label htmlFor="password" className="text-slate-700 font-medium">
                            Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            className="mt-2 h-12 rounded-xl border-slate-200 bg-white"
                        />
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
                    className="w-full h-12 text-base font-semibold bg-[color:var(--auth-accent)] hover:bg-[color:var(--auth-accent-2)] shadow-[0_18px_45px_-25px_rgba(37,99,235,0.45)] hover:shadow-[0_18px_45px_-20px_rgba(37,99,235,0.55)]"
                    disabled={isLoading}
                >
                    {isLoading
                        ? 'Working...'
                        : mode === 'login'
                        ? 'Sign In'
                        : mode === 'signup'
                        ? 'Create Account'
                        : 'Send Verification Code'}
                </Button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600">
                {mode === 'login' && (
                    <>
                        <button
                            type="button"
                            onClick={() => setMode('forgot')}
                            className="text-blue-700 hover:text-blue-800 font-medium"
                        >
                            Forgot password?
                        </button>
                        <div className="mt-4">
                            Don't have an account?{' '}
                            <button
                                type="button"
                                onClick={() => setMode('signup')}
                                className="text-blue-700 hover:text-blue-800 font-semibold"
                            >
                                Sign up
                            </button>
                        </div>
                    </>
                )}
                {mode === 'signup' && (
                    <div>
                        Already have an account?{' '}
                        <button
                            type="button"
                            onClick={() => setMode('login')}
                            className="text-blue-700 hover:text-blue-800 font-semibold"
                        >
                            Sign in
                        </button>
                    </div>
                )}
                {mode === 'forgot' && (
                    <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="text-blue-700 hover:text-blue-800 font-medium"
                    >
                        Back to sign in
                    </button>
                )}
            </div>
        </AuthShell>
    );
}
