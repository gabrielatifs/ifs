import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2, CheckCircle2, Lock, ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { auth } from "../../api/supabaseAuth";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useToast } from "../ui/use-toast";
import AuthShell from "./AuthShell";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const accessToken = searchParams.get("access_token");
      const type = searchParams.get("type");

      if (type === "recovery" && accessToken) {
        setValidToken(true);
      } else {
        toast({
          title: "Invalid or expired link",
          description: "Please request a new password reset link.",
          variant: "destructive",
        });
        setTimeout(() => navigate("/ForgotPassword"), 2000);
      }
    };

    checkToken();
  }, [searchParams, navigate, toast]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters.",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords match.",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      try {
        await auth.me();
      } catch (claimError) {
        console.warn("[ResetPasswordPage] Profile claim skipped:", claimError?.message);
      }

      setSuccess(true);
      toast({
        title: "Password updated",
        description: "Your password has been successfully reset.",
      });

      setTimeout(() => {
        navigate("/Login");
      }, 3000);
    } catch (err) {
      toast({
        title: "Password reset failed",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!validToken) {
    return (
      <AuthShell title="Reset Password" subtitle="Validating your reset link..." showPlayButton={false}>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto bg-[color:var(--auth-accent)]/10 rounded-2xl flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-[color:var(--auth-accent)]" />
          </div>
          <p className="text-slate-500 text-sm">Please wait while we verify your link...</p>
        </div>
      </AuthShell>
    );
  }

  if (success) {
    return (
      <AuthShell title="Password Updated" subtitle="Your password has been reset successfully" showPlayButton={false}>
        <div className="text-center space-y-6 py-4">
          <div className="relative">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-[color:var(--auth-accent)] rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-900">All done!</h2>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Your password has been successfully reset. You'll be redirected to login shortly.
            </p>
          </div>
          <Button
            onClick={() => navigate("/Login")}
            className="w-full h-12 text-base font-semibold bg-[color:var(--auth-accent)] hover:bg-[color:var(--auth-accent-2)] rounded-xl shadow-[0_18px_45px_-25px_rgba(37,99,235,0.45)] hover:shadow-[0_18px_45px_-20px_rgba(37,99,235,0.55)] transition-all duration-200"
          >
            Continue to Sign In
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create new password"
      subtitle="Your new password must be different from previous passwords."
      showPlayButton={false}
      heroTitle="Secure your account"
      heroSubtitle="Choose a strong password to keep your account safe."
    >
      <form onSubmit={handleResetPassword} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-700 font-medium">
            New Password
          </Label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 transition-colors group-focus-within:text-[color:var(--auth-accent)]" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-12 pr-12 h-12 text-base rounded-xl border-slate-200 focus:border-[color:var(--auth-accent)] focus:ring-[color:var(--auth-accent)]/20 transition-all"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {password && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    password.length >= 12
                      ? "w-full bg-emerald-500"
                      : password.length >= 8
                      ? "w-2/3 bg-amber-500"
                      : "w-1/3 bg-red-500"
                  }`}
                />
              </div>
              <span
                className={`text-xs font-medium ${
                  password.length >= 12
                    ? "text-emerald-600"
                    : password.length >= 8
                    ? "text-amber-600"
                    : "text-red-600"
                }`}
              >
                {password.length >= 12 ? "Strong" : password.length >= 8 ? "Good" : "Weak"}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">
            Confirm New Password
          </Label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 transition-colors group-focus-within:text-[color:var(--auth-accent)]" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={`pl-12 pr-12 h-12 text-base rounded-xl border-slate-200 focus:border-[color:var(--auth-accent)] focus:ring-[color:var(--auth-accent)]/20 transition-all ${
                confirmPassword && password !== confirmPassword
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                  : confirmPassword && password === confirmPassword
                  ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                  : ""
              }`}
            />
            {confirmPassword && password === confirmPassword ? (
              <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500" />
            ) : (
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold bg-[color:var(--auth-accent)] hover:bg-[color:var(--auth-accent-2)] rounded-xl shadow-[0_18px_45px_-25px_rgba(37,99,235,0.45)] hover:shadow-[0_18px_45px_-20px_rgba(37,99,235,0.55)] transition-all duration-200"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Resetting password...
            </>
          ) : (
            <>
              Reset Password
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
