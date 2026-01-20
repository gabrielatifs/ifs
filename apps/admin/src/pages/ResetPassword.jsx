import ResetPasswordPage from "@ifs/shared/components/auth/ResetPasswordPage";

const adminAuthShellProps = {
  heroBadge: "Admin Access Only",
  heroTitle: "Secure admin access",
  heroSubtitle: "Reset your admin credentials to regain access.",
  pageClassName: "bg-slate-950",
  heroOverlayClassName: "bg-slate-950/70",
  themeVars: {
    "--auth-accent": "#b91c1c",
    "--auth-accent-2": "#7f1d1d",
    "--auth-ink": "#0f172a",
    "--auth-muted": "#475569",
    "--auth-panel": "#ffffff",
    "--auth-shadow": "0 30px 70px -45px rgba(15, 23, 42, 0.65)",
    "--auth-border": "#e2e8f0",
  },
  title: "Reset admin password",
  subtitle: "Verify your admin recovery link to continue.",
  successTitle: "Admin password updated",
  successSubtitle: "Your admin credentials have been updated.",
  resetTitle: "Create a new admin password",
  resetSubtitle: "Use a unique, strong password for your admin account.",
};

export default function ResetPassword() {
  return <ResetPasswordPage authShellProps={adminAuthShellProps} />;
}
