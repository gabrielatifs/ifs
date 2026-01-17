import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@ifs/shared/lib/supabase';
import { auth } from '@ifs/shared/api/supabaseAuth';
import { Button } from '@ifs/shared/components/ui/button';
import { Input } from '@ifs/shared/components/ui/input';
import { Label } from '@ifs/shared/components/ui/label';
import { Loader2 } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [error, setError] = useState('');
    const [mode, setMode] = useState('login'); // 'login' or 'signup' or 'forgot'
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

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
                        const redirectUrl = sessionStorage.getItem('postLoginRedirectUrl') || '/';
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
            if (mode === 'forgot') {
                await auth.resetPassword(email);
                setError('Check your email for a password reset link.');
                setIsLoading(false);
                return;
            }

            if (mode === 'signup') {
                await auth.signUp({ email, password });
                setError('Check your email to verify your account.');
                setIsLoading(false);
                return;
            }

            await auth.signIn(email, password);

            // Redirect after successful sign-in
            const redirectUrl = sessionStorage.getItem('postLoginRedirectUrl') || '/';
            sessionStorage.removeItem('postLoginRedirectUrl');
            window.location.href = redirectUrl;
        } catch (err) {
            console.error('Auth error:', err);
            setError(err.message || 'Authentication failed. Please try again.');
            setIsLoading(false);
        }
    };

    if (checkingAuth) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-slate-900">
                            {mode === 'login' && 'Sign In'}
                            {mode === 'signup' && 'Create Account'}
                            {mode === 'forgot' && 'Reset Password'}
                        </h1>
                        <p className="text-slate-600 mt-2">
                            {mode === 'login' && 'Welcome back to the IfS Portal'}
                            {mode === 'signup' && 'Join the Independent Federation for Safeguarding'}
                            {mode === 'forgot' && 'Enter your email to reset your password'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="mt-1"
                            />
                        </div>

                        {mode !== 'forgot' && (
                            <div>
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    className="mt-1"
                                />
                            </div>
                        )}

                        {error && (
                            <div className={`p-3 rounded-md text-sm ${
                                error.includes('Check your email')
                                    ? 'bg-green-50 text-green-700'
                                    : 'bg-red-50 text-red-700'
                            }`}>
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {mode === 'login' && 'Sign In'}
                            {mode === 'signup' && 'Create Account'}
                            {mode === 'forgot' && 'Send Reset Link'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        {mode === 'login' && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setMode('forgot')}
                                    className="text-purple-600 hover:text-purple-700"
                                >
                                    Forgot password?
                                </button>
                                <div className="mt-4 text-slate-600">
                                    Don't have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => setMode('signup')}
                                        className="text-purple-600 hover:text-purple-700 font-medium"
                                    >
                                        Sign up
                                    </button>
                                </div>
                            </>
                        )}
                        {mode === 'signup' && (
                            <div className="text-slate-600">
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => setMode('login')}
                                    className="text-purple-600 hover:text-purple-700 font-medium"
                                >
                                    Sign in
                                </button>
                            </div>
                        )}
                        {mode === 'forgot' && (
                            <button
                                type="button"
                                onClick={() => setMode('login')}
                                className="text-purple-600 hover:text-purple-700"
                            >
                                Back to sign in
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
