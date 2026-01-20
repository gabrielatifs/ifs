import React from "react";
import { ShieldCheck, Lock } from "lucide-react";

const DEFAULT_LINKS = [
  { label: "Privacy Policy", href: "/PrivacyPolicy" },
  { label: "IT Support", href: "mailto:it@ifs-safeguarding.co.uk" },
  { label: "Contact", href: "/Contact" },
];

export default function AdminAuthShell({
  title,
  subtitle,
  heroTitle = "Admin Management Portal",
  heroSubtitle =
    "Secure access to professional safeguarding standards, membership oversight, and administrative governance.",
  heroBadge = "Admin Access Only",
  footerNote =
    "Authorized personnel only. This is a restricted system. Unauthorized access attempts are prohibited.",
  footerLinks = DEFAULT_LINKS,
  children,
}) {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");
        :root {
          --admin-primary: #7c3aed;
          --admin-primary-hover: #6d28d9;
          --admin-navy: #1e1b4b;
          --admin-gray: #f8fafc;
        }
      `}</style>
      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        <div className="relative hidden w-1/2 flex-col justify-between bg-[color:var(--admin-navy)] p-16 text-white lg:flex">
          <div className="relative z-10">
            <div className="mb-16 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded bg-[color:var(--admin-primary)] text-2xl font-bold text-white">
                IFS
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold uppercase tracking-tight">
                  Independent Federation
                </span>
                <span className="text-xs font-light uppercase tracking-[0.35em] text-white/70">
                  For Safeguarding
                </span>
              </div>
            </div>
            <div className="max-w-md">
              <span className="inline-flex w-fit items-center rounded-full bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/85">
                {heroBadge}
              </span>
              <h1 className="mt-6 text-5xl font-bold leading-tight">{heroTitle}</h1>
              <div className="mt-6 h-1.5 w-20 bg-[color:var(--admin-primary)]" />
              <p className="mt-6 text-xl leading-relaxed text-white/80">
                {heroSubtitle}
              </p>
            </div>
          </div>
          <div className="relative z-10">
            <div className="mb-8 flex items-center gap-8 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                <span>Secure SSL</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>256-bit Encryption</span>
              </div>
            </div>
            <p className="text-xs text-white/40">
              (c) 2024 Independent Federation for Safeguarding. All rights reserved.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-1 flex-col items-center justify-center bg-white p-8 md:p-16 lg:w-1/2">
          <div className="w-full max-w-md">
            <div className="mb-12 flex justify-center lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded bg-[color:var(--admin-primary)] text-xl font-bold text-white">
                  I
                </div>
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-[color:var(--admin-navy)]">
                  IFS Admin
                </span>
              </div>
            </div>

            <div className="mb-10">
              <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
              {subtitle && (
                <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
              )}
            </div>

            {children}

            <div className="mt-14 border-t border-slate-100 pt-8">
              <p className="flex items-start gap-3 text-xs text-slate-500">
                <span className="mt-0.5">i</span>
                <span>{footerNote}</span>
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-6 text-xs font-medium text-slate-400">
                {footerLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="transition-colors hover:text-[color:var(--admin-primary)]"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
