import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@ifs/shared/lib/supabase";
import { auth } from "@ifs/shared/api/supabaseAuth";
import { Button } from "@ifs/shared/components/ui/button";
import { Input } from "@ifs/shared/components/ui/input";
import { Label } from "@ifs/shared/components/ui/label";
import { Lock } from "lucide-react";
import AdminAuthShell from "../components/auth/AdminAuthShell";

const getPendingAuth = () => {
  try {
    return JSON.parse(sessionStorage.getItem("pendingAuth") || "{}");
  } catch (error) {
    return {};
  }
};

export default function SetPassword() {
  const navigate = useNavigate();
  const pending = getPendingAuth();
  const verifiedEmail = sessionStorage.getItem("verifiedEmail") || pending.email || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!verifiedEmail) {
      setError("We need a verified email to continue. Please start again.");
    }
  }, [verifiedEmail]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        throw updateError;
      }

      try {
        await auth.me();
      } catch (claimError) {
        console.warn("[SetPassword] Profile claim skipped:", claimError?.message);
      }

      sessionStorage.removeItem("verifiedEmail");
      sessionStorage.removeItem("pendingAuth");
      const redirectUrl =
        sessionStorage.getItem("postLoginRedirectUrl") || "/admindashboard";
      sessionStorage.removeItem("postLoginRedirectUrl");
      navigate(redirectUrl);
    } catch (err) {
      setError(err?.message || "Unable to set password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminAuthShell
      title="Set your admin password"
      subtitle="Choose a secure password to continue."
      heroTitle="Create your password"
      heroSubtitle="Finish setting up your access to the admin portal."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="password" className="text-slate-700 font-medium">
            New password
          </Label>
          <div className="relative mt-2">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              required
              className="h-12 rounded-md border-slate-200 bg-slate-50 pl-10 text-slate-900 focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">
            Confirm new password
          </Label>
          <div className="relative mt-2">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter your password"
              required
              className="h-12 rounded-md border-slate-200 bg-slate-50 pl-10 text-slate-900 focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="h-12 w-full rounded-md bg-[#7C3AED] text-base font-bold text-white shadow-lg shadow-purple-500/10 transition-colors hover:bg-[#6D28D9]"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Setting password..." : "Set password"}
        </Button>
      </form>
    </AdminAuthShell>
  );
}
