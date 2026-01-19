import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@ifs/shared/lib/supabase";
import { auth } from "@ifs/shared/api/supabaseAuth";
import { Button } from "@ifs/shared/components/ui/button";
import { Input } from "@ifs/shared/components/ui/input";
import { Label } from "@ifs/shared/components/ui/label";
import AuthShell from "@ifs/shared/components/auth/AuthShell";

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
        sessionStorage.getItem("postLoginRedirectUrl") || "/dashboard";
      sessionStorage.removeItem("postLoginRedirectUrl");
      navigate(redirectUrl);
    } catch (err) {
      setError(err?.message || "Unable to set password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Set your password"
      subtitle="Choose a secure password to continue."
      showPlayButton={false}
      heroTitle="Create your password"
      heroSubtitle="Finish setting up your access to the member portal."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="password" className="text-slate-700 font-medium">
            New password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            required
            className="mt-2 h-12 rounded-xl border-slate-200 bg-white"
          />
        </div>

        <div>
          <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">
            Confirm new password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Re-enter your password"
            required
            className="mt-2 h-12 rounded-xl border-slate-200 bg-white"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold bg-[color:var(--auth-accent)] hover:bg-[color:var(--auth-accent-2)] shadow-[0_18px_45px_-25px_rgba(37,99,235,0.45)] hover:shadow-[0_18px_45px_-20px_rgba(37,99,235,0.55)]"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Setting password..." : "Set password"}
        </Button>
      </form>
    </AuthShell>
  );
}
