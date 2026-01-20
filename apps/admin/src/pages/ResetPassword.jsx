import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2, CheckCircle2, Lock, ArrowRight } from "lucide-react";
import { supabase } from "@ifs/shared/lib/supabase";
import { auth } from "@ifs/shared/api/supabaseAuth";
import { Button } from "@ifs/shared/components/ui/button";
import { Input } from "@ifs/shared/components/ui/input";
import { Label } from "@ifs/shared/components/ui/label";
import { useToast } from "@ifs/shared/components/ui/use-toast";
import AdminAuthShell from "../components/auth/AdminAuthShell";

export default function ResetPassword() {
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
        setTimeout(() => navigate("/reset-password"), 2000);
      }
    };

    checkToken();
  }, [searchParams, navigate, toast]);

  const handleResetPassword = async (event) => {
    event.preventDefault();
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
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw error;
      }

      try {
        await auth.me();
      } catch (claimError) {
        console.warn("[ResetPassword] Profile claim skipped:", claimError?.message);
      }

      setSuccess(true);
      toast({
        title: "Password updated",
        description: "Your admin credentials have been updated.",
      });

      setTimeout(() => {
        navigate("/login");
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
      <AdminAuthShell
        title="Reset admin password"
        subtitle="Validating your reset link..."
        heroTitle="Secure admin access"
        heroSubtitle="Reset your admin credentials to regain access."
      >
        <div className="flex flex-col items-center justify-center py-10 text-sm text-slate-600">
          <Loader2 className="mb-4 h-8 w-8 animate-spin text-[#7C3AED]" />
          Checking your reset link...
        </div>
      </AdminAuthShell>
    );
  }

  if (success) {
    return (
      <AdminAuthShell
        title="Admin password updated"
        subtitle="Your admin credentials have been updated."
        heroTitle="Access restored"
        heroSubtitle="Your admin access is ready."
      >
        <div className="space-y-6 py-4 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-500">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-900">All set</h2>
            <p className="text-sm text-slate-500">
              Your password has been reset. You will be redirected shortly.
            </p>
          </div>
          <Button
            onClick={() => navigate("/login")}
            className="h-12 w-full rounded-md bg-[#7C3AED] text-base font-bold text-white hover:bg-[#6D28D9]"
          >
            Continue to Sign In
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </AdminAuthShell>
    );
  }

  return (
    <AdminAuthShell
      title="Create a new admin password"
      subtitle="Use a unique, strong password to secure your account."
      heroTitle="Reset admin credentials"
      heroSubtitle="Choose a new password to regain access."
    >
      <form onSubmit={handleResetPassword} className="space-y-5">
        <div>
          <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
            New Password
          </Label>
          <div className="relative mt-2">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 rounded-md border-slate-200 bg-slate-50 pl-10 pr-10 text-slate-900 focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">
            Confirm New Password
          </Label>
          <div className="relative mt-2">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="h-12 rounded-md border-slate-200 bg-slate-50 pl-10 pr-10 text-slate-900 focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="h-12 w-full rounded-md bg-[#7C3AED] text-base font-bold text-white shadow-lg shadow-purple-500/10 transition-colors hover:bg-[#6D28D9]"
          disabled={submitting}
        >
          {submitting ? "Resetting password..." : "Reset Password"}
        </Button>
      </form>
    </AdminAuthShell>
  );
}
