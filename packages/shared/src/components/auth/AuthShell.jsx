import React from "react";

export default function AuthShell({
  title,
  subtitle,
  heroTitle = "Welcome",
  heroSubtitle = "Sign in to continue.",
  heroBadge = "Member Portal Access",
  maxWidthClass = "max-w-md",
  pageClassName = "",
  panelClassName = "",
  children,
}) {
  return (
    <div
      className={`min-h-screen bg-slate-50 ${pageClassName}`}
      style={{
        "--auth-accent": "#2563eb",
        "--auth-accent-2": "#1d4ed8",
        "--auth-ink": "#0f172a",
        "--auth-muted": "#475569",
        "--auth-panel": "#ffffff",
        "--auth-shadow": "0 25px 55px -35px rgba(15, 23, 42, 0.35)",
        "--auth-border": "#e2e8f0",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <style>{`
        .auth-title {
          letter-spacing: -0.01em;
        }
        .auth-rise {
          animation: auth-rise 600ms ease-out both;
        }
        .auth-reveal {
          animation: auth-reveal 900ms ease-out both;
        }
        @keyframes auth-rise {
          0% { opacity: 0; transform: translateY(18px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes auth-reveal {
          0% { opacity: 0; transform: translateY(22px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="min-h-screen grid lg:grid-cols-[1fr_1fr]">
        <div className="relative h-56 sm:h-72 lg:h-auto auth-reveal">
          <img
            src="/auth-left.jpg"
            alt="IFS member portal"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/45" />
          <div className="relative z-10 flex h-full flex-col justify-end gap-3 p-8 text-white">
            <span className="inline-flex w-fit items-center rounded-full bg-white/15 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/85">
              {heroBadge}
            </span>
            <h1 className="auth-title text-3xl font-semibold lg:text-4xl">
              {heroTitle}
            </h1>
            <p className="max-w-xl text-sm text-white/85 lg:text-base">
              {heroSubtitle}
            </p>
          </div>
        </div>

        <div className="relative flex items-center justify-center px-6 py-12 lg:px-10">
          <div className={`w-full ${maxWidthClass} auth-rise`}>
            <div className="mb-6 text-center lg:text-left">
              {title && (
                <h2 className="auth-title text-3xl text-[color:var(--auth-ink)]">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="mt-2 text-sm text-[color:var(--auth-muted)]">
                  {subtitle}
                </p>
              )}
            </div>
            <div
              className={`rounded-2xl border border-[color:var(--auth-border)] bg-[color:var(--auth-panel)] px-6 py-7 shadow-[var(--auth-shadow)] md:px-8 md:py-9 ${panelClassName}`}
            >
              {children}
            </div>
            <p className="mt-6 text-center text-xs text-slate-500 lg:text-left">
              Need help? Email support at info@ifs-safeguarding.co.uk
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
