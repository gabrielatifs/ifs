import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@ifs/shared/lib/supabase";
import { auth } from "@ifs/shared/api/supabaseAuth";
import { Button } from "@ifs/shared/components/ui/button";
import { Input } from "@ifs/shared/components/ui/input";
import { Label } from "@ifs/shared/components/ui/label";
import { Mail } from "lucide-react";
import AdminAuthShell from "../components/auth/AdminAuthShell";

const getPendingAuth = () => {
  try {
    return JSON.parse(sessionStorage.getItem("pendingAuth") || "{}");
  } catch (error) {
    return {};
  }
};

export default function VerifyCode() {
  const navigate = useNavigate();
  const pending = getPendingAuth();

  const [email, setEmail] = useState(pending.email || "");
  const [mode, setMode] = useState(pending.mode || "login");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!pending.email) {
      setError("We need your email to continue. Please start again.");
    }
  }, [pending.email]);

  const handleVerify = async (event) => {
    event.preventDefault();
    setError("");

    if (!email || !code.trim()) {
      setError("Enter the code we emailed you.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code.trim(),
        type: "email",
      });

      if (verifyError) {
        throw verifyError;
      }

      sessionStorage.setItem("verifiedEmail", email);
      if (mode === "signup" && pending.password) {
        const { error: updateError } = await supabase.auth.updateUser({
          password: pending.password,
        });

        if (updateError) {
          if (
            updateError.message &&
            updateError.message.toLowerCase().includes("different from the old password")
          ) {
            console.warn(
              "[VerifyCode] Password already set, skipping update:",
              updateError.message
            );
          } else {
          throw updateError;
          }
        }

        try {
          await auth.me();
        } catch (claimError) {
          console.warn("[VerifyCode] Profile claim skipped:", claimError?.message);
        }

        if (pending.firstName || pending.lastName) {
          try {
            await auth.updateMe({
              firstName: pending.firstName || "",
              lastName: pending.lastName || "",
              displayName:
                pending.displayName ||
                `${pending.firstName || ""} ${pending.lastName || ""}`.trim(),
            });
          } catch (profileError) {
            console.warn("[VerifyCode] Name update skipped:", profileError?.message);
          }
        }

        sessionStorage.removeItem("verifiedEmail");
        sessionStorage.removeItem("pendingAuth");
        const redirectUrl =
          sessionStorage.getItem("postLoginRedirectUrl") || "/admindashboard";
        sessionStorage.removeItem("postLoginRedirectUrl");
        navigate(redirectUrl);
        return;
      }

      navigate("/set-password");
    } catch (err) {
      setError(err?.message || "Verification failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setError("");
    try {
      await auth.sendOtp(email, { shouldCreateUser: true });
    } catch (err) {
      setError(err?.message || "Unable to resend code. Please try again.");
    }
  };

  const headingCopy = {
    login: "Verify admin access",
    signup: "Confirm admin email",
    forgot: "Reset admin password",
  };

  const subheadingCopy = {
    login: "Enter the code we sent to continue.",
    signup: "Enter the code we sent to validate admin access.",
    forgot: "Enter the code we sent to continue.",
  };

  return (
    <AdminAuthShell
      title={headingCopy[mode] || "Verify your account"}
      subtitle={subheadingCopy[mode] || "Enter your verification code."}
      heroTitle="Admin verification"
      heroSubtitle="Confirm your email to unlock the admin console."
    >
      <form onSubmit={handleVerify} className="space-y-5">
        <div>
          <Label htmlFor="email" className="text-slate-700 font-medium">
            Email
          </Label>
          <div className="relative mt-2">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@ifs-safeguarding.org.uk"
              required
              className="h-12 rounded-md border-slate-200 bg-slate-50 pl-10 text-slate-900 focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="code" className="text-slate-700 font-medium">
            Verification code
          </Label>
          <Input
            id="code"
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Enter the 6-digit code"
            required
            className="mt-2 h-12 rounded-md border-slate-200 bg-slate-50 text-center tracking-[0.2em] text-slate-900 focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
          />
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
          {isSubmitting ? "Verifying..." : "Verify code"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-600">
        Didn't receive a code?{" "}
        <button
          type="button"
          onClick={handleResend}
          className="font-semibold text-[#7C3AED] hover:text-[#6D28D9]"
        >
          Resend code
        </button>
      </div>
    </AdminAuthShell>
  );
}
