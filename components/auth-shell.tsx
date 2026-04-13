import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

import { ArrowUpRight, CheckCircle2 } from "lucide-react";

interface AuthShellProps {
  title: string;
  subtitle: string;
  eyebrow: string;
  children: ReactNode;
  leftHeading?: string;
  leftDescription?: string;
  leftPoints?: string[];
}

export function AuthShell({
  title,
  subtitle,
  eyebrow,
  children,
  leftHeading = "Secure entry to your academic workspace.",
  leftDescription = "Verified sign-in, role-based workspaces, and a consistent portal experience across student and college journeys.",
  leftPoints = [
    "Role-aware access for student and college workspaces",
    "Session-protected routes and secure authentication",
    "Unified design language across every portal",
  ],
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[var(--canvas)] px-4 py-5 lg:px-8 lg:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] w-full max-w-[1300px] overflow-hidden rounded-[2rem] border border-[color:var(--ghost)] bg-white shadow-[0_22px_60px_rgba(13,24,41,0.12)] lg:grid-cols-[1.05fr,0.95fr]">
        <aside className="relative overflow-hidden bg-[radial-gradient(circle_at_20%_20%,#3f73f5_0%,#1748b8_38%,#0b1f4e_100%)] px-6 py-8 text-white sm:px-9 sm:py-10 lg:px-11 lg:py-12">
          <div className="absolute inset-0 bg-[size:72px_72px] opacity-35 [background-image:linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px)]" />
          <div className="absolute -left-16 top-16 h-48 w-48 rounded-3xl bg-white/15 blur-2xl" />
          <div className="absolute -right-10 bottom-10 h-72 w-72 rounded-full bg-cyan-200/20 blur-3xl" />

          <div className="relative z-10 flex h-full flex-col">
            <div>
              <Link href="/" className="inline-flex items-center gap-2 text-2xl font-black tracking-tight">
                <Image
                  src="/logo.png"
                  alt="Academic Orbit logo"
                  width={190}
                  height={88}
                  className="h-11 w-auto rounded-lg border border-white/25 bg-white/10 p-1 object-contain sm:h-12"
                  priority
                />
                <span className="font-display text-2xl font-black text-white">Academic Orbit</span>
              </Link>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/85">
                Unified access for modern campus operations, designed for students and institutions.
              </p>
            </div>

            <div className="mt-10 rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-md lg:mt-14">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Trusted Campus Identity</p>
              <h2 className="font-display mt-3 text-3xl font-black leading-tight lg:text-4xl">{leftHeading}</h2>
              <p className="mt-4 text-sm leading-relaxed text-white/85">{leftDescription}</p>

              <ul className="mt-5 space-y-2.5">
                {leftPoints.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm text-white/90">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-xs font-semibold tracking-[0.08em] text-white/85 lg:mt-auto">
              Academic Orbit Platform • Professional Campus Suite
            </div>
          </div>
        </aside>

        <section className="relative flex items-center justify-center bg-[var(--soft-100)]/60 px-5 py-8 sm:px-8 lg:justify-end lg:px-10">
          <div className="absolute inset-0">
            <div className="absolute left-1/2 top-20 h-44 w-44 -translate-x-1/2 rounded-full bg-[var(--brand-100)]/70 blur-3xl" />
            <div className="absolute bottom-16 right-12 h-36 w-36 rounded-full bg-[var(--teal-100)]/60 blur-3xl" />
          </div>

          <div className="relative z-10 w-full max-w-[560px] rounded-[2rem] border border-[color:var(--ghost)] bg-white/95 p-6 shadow-[0_20px_55px_rgba(13,24,41,0.12)] sm:p-8">
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-700)]">
              <Image
                src="/logo.png"
                alt="Academic Orbit"
                width={118}
                height={55}
                className="h-6 w-auto rounded-md border border-[color:var(--ghost)] bg-white p-0.5 object-contain"
              />
              <span>Academic Orbit</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <p className="chip mt-4 bg-[var(--brand-100)] text-[var(--brand-700)]">{eyebrow}</p>
            <h1 className="font-display mt-4 text-3xl font-black leading-tight text-[var(--ink-strong)] sm:text-4xl">{title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">{subtitle}</p>

            {children}
          </div>
        </section>
      </div>
    </div>
  );
}
