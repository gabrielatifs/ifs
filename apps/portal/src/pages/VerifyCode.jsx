import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
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
          throw updateError;
        }

        try {
          await auth.me();
        } catch (claimError) {
          console.warn("[VerifyCode] Profile claim skipped:", claimError?.message);
        }

        sessionStorage.removeItem("verifiedEmail");
        sessionStorage.removeItem("pendingAuth");
        const redirectUrl =
          sessionStorage.getItem("postLoginRedirectUrl") || "/dashboard";
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
    login: "Verify your account",
    signup: "Confirm your email",
    forgot: "Reset your password",
  };

  const subheadingCopy = {
    login: "Enter the code we sent to continue.",
    signup: "Enter the code we sent to finish creating your account.",
    forgot: "Enter the code we sent to continue.",
  };

  return (
    <AuthShell
      title={headingCopy[mode] || "Verify your account"}
      subtitle={subheadingCopy[mode] || "Enter your verification code."}
      showPlayButton={false}
      heroTitle="One last step"
      heroSubtitle="Confirm your email to unlock the member portal."
    >
      <form onSubmit={handleVerify} className="space-y-5">
        <div>
          <Label htmlFor="email" className="text-slate-700 font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            className="mt-2 h-12 rounded-xl border-slate-200 bg-white"
          />
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
            className="mt-2 h-12 rounded-xl border-slate-200 bg-white tracking-[0.2em] text-center"
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
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Verify code
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-600">
        Didn't receive a code?{" "}
        <button
          type="button"
          onClick={handleResend}
          className="text-blue-700 hover:text-blue-800 font-semibold"
        >
          Resend code
        </button>
      </div>
    </AuthShell>
  );
}
