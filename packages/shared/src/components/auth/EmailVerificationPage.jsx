import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, Mail, ArrowRight, Sparkles, RefreshCw } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Button } from "../ui/button";
import AuthShell from "./AuthShell";

export default function EmailVerificationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying"); // verifying, success, error, pending
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const accessToken = searchParams.get("access_token");
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      if (error) {
        console.error("Email verification error from Supabase:", errorDescription || error);
        setErrorMessage(errorDescription || "Verification failed. The link may be expired or invalid.");
        setStatus("error");
        return;
      }

      if (accessToken) {
        try {
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError || !user) {
            setErrorMessage("Verification completed but unable to retrieve user data.");
            setStatus("error");
            return;
          }

          setStatus("success");
          setTimeout(() => {
            navigate("/Dashboard");
          }, 2000);
        } catch (err) {
          console.error("Error getting user after verification:", err);
          setErrorMessage("An unexpected error occurred.");
          setStatus("error");
        }
        return;
      }

      setStatus("pending");
    };

    verifyEmail();
  }, [searchParams, navigate]);

  const renderContent = () => {
    switch (status) {
      case "verifying":
        return (
          <div className="text-center space-y-6 py-4">
            <div className="w-20 h-20 mx-auto bg-[color:var(--auth-accent)]/10 rounded-2xl flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-[color:var(--auth-accent)] animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-900">Verifying your email</h2>
              <p className="text-sm text-slate-500">Please wait while we confirm your email address...</p>
            </div>
          </div>
        );

      case "success":
        return (
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
              <h2 className="text-xl font-semibold text-slate-900">Email verified!</h2>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Your email has been confirmed. Redirecting you to your dashboard...
              </p>
            </div>
            <Button
              onClick={() => navigate("/Dashboard")}
              className="w-full h-12 text-base font-semibold bg-[color:var(--auth-accent)] hover:bg-[color:var(--auth-accent-2)] rounded-xl shadow-[0_18px_45px_-25px_rgba(15,118,110,0.7)] hover:shadow-[0_18px_45px_-20px_rgba(15,118,110,0.8)] transition-all duration-200"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        );

      case "error":
        return (
          <div className="text-center space-y-6 py-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30">
              <XCircle className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-900">Verification failed</h2>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">{errorMessage}</p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <Button
                onClick={() => navigate("/Register")}
                className="w-full h-12 text-base font-semibold bg-[color:var(--auth-accent)] hover:bg-[color:var(--auth-accent-2)] rounded-xl shadow-[0_18px_45px_-25px_rgba(15,118,110,0.7)] hover:shadow-[0_18px_45px_-20px_rgba(15,118,110,0.8)] transition-all duration-200"
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                Try signing up again
              </Button>
              <Button
                onClick={() => navigate("/Login")}
                variant="outline"
                className="w-full h-12 text-base font-medium rounded-xl border-slate-200 hover:bg-slate-50"
              >
                Back to login
              </Button>
            </div>
          </div>
        );

      case "pending":
        return (
          <div className="text-center space-y-6 py-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[color:var(--auth-accent)] to-[color:var(--auth-accent-2)] rounded-2xl flex items-center justify-center shadow-lg shadow-[color:var(--auth-accent)]/25">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-900">Check your email</h2>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                We've sent a verification link to your email address. Please check your inbox and click the link to
                verify your account.
              </p>
              <p className="text-xs text-slate-400 bg-slate-50 py-2 px-4 rounded-lg inline-block">
                Didn't receive the email? Check your spam folder.
              </p>
            </div>
            <Button
              onClick={() => navigate("/Login")}
              variant="outline"
              className="w-full h-12 text-base font-medium rounded-xl border-slate-200 hover:bg-slate-50"
            >
              Back to login
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AuthShell
      title="Email Verification"
      subtitle=""
      showPlayButton={false}
      heroTitle="Almost there!"
      heroSubtitle="Just one more step to access your member portal."
    >
      {renderContent()}
    </AuthShell>
  );
}
