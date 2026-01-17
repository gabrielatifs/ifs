import React from "react";

export default function AuthShell({
  title,
  subtitle,
  heroTitle = "Welcome",
  heroSubtitle = "Sign in to continue.",
  showPlayButton = true,
  maxWidthClass = "max-w-md",
  children,
}) {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100"
      style={{
        "--auth-accent": "#0f766e",
        "--auth-accent-2": "#0d9488",
      }}
    >
      <div className="min-h-screen flex flex-col md:flex-row">
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-500 text-white p-10 lg:p-16 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10 flex flex-col justify-between w-full">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-white/70">
                Independent Federation for Safeguarding
              </div>
              <h1 className="mt-4 text-3xl lg:text-4xl font-semibold">
                {heroTitle}
              </h1>
              <p className="mt-3 text-white/80 text-base lg:text-lg max-w-lg">
                {heroSubtitle}
              </p>
            </div>
            {showPlayButton ? (
              <div className="mt-10 inline-flex items-center gap-3 text-sm font-medium">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/20">
                  ▶
                </span>
                Watch a quick walkthrough
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className={`w-full ${maxWidthClass}`}>
            {(title || subtitle) && (
              <div className="mb-6 text-center">
                {title && (
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
                )}
              </div>
            )}
            <div className="bg-white/95 backdrop-blur rounded-2xl border border-slate-200 shadow-[0_25px_60px_-35px_rgba(15,23,42,0.45)] p-6 md:p-8">
              {children}
            </div>
            <p className="mt-6 text-center text-xs text-slate-400">
              Need help? Email support at info@ifs-safeguarding.co.uk
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
