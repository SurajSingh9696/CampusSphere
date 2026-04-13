import Link from "next/link";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";

import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarCheck2,
  CircleCheckBig,
  GraduationCap,
  MapPinned,
  MessageSquare,
  ScanLine,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import { getCampusData } from "@/lib/data/campus-store";

export const dynamic = "force-dynamic";

interface PortalFeature {
  title: string;
  detail: string;
  icon: LucideIcon;
}

export default async function Home() {
  const content = await getCampusData();
  const institutionValueProps = [
    "Centralized records and schedule management",
    "Operational issue tracking and campus notices",
    "Cross-campus analytics with clear attendance visibility",
  ];

  const platformFeatures: PortalFeature[] = [
    {
      title: "Student Dashboard",
      detail: "Personalized academic overview with activity, attendance, and study momentum tracking.",
      icon: GraduationCap,
    },
    {
      title: "Smart Attendance",
      detail: "Live attendance timeline powered by verification workflows and class-level controls.",
      icon: CalendarCheck2,
    },
    {
      title: "Operations Console",
      detail: "Scanner management with geofence validation and synchronized attendance logs.",
      icon: ScanLine,
    },
    {
      title: "Resource Hub",
      detail: "Centralized notes and learning materials with contribution and download activity.",
      icon: BookOpen,
    },
    {
      title: "Community",
      detail: "Discussions, groups, and events brought into one active campus feed.",
      icon: MessageSquare,
    },
    {
      title: "Student Utilities",
      detail: "Study-buddy coordination and lost-and-found workflows for daily campus life.",
      icon: Wrench,
    },
    {
      title: "Campus Map",
      detail: "Real-time visibility into locations, open zones, and event spaces.",
      icon: MapPinned,
    },
    {
      title: "College Workspace",
      detail: "Institution records, schedule planning, and attendance analytics in one operational hub.",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <div className="mx-auto w-full max-w-[1240px] px-4 py-6 lg:px-8 lg:py-8">
        <header className="surface-card rounded-3xl bg-white/95 px-5 py-4 lg:px-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Academic Orbit logo"
                width={176}
                height={82}
                className="h-10 w-auto max-w-[170px] rounded-lg border border-[color:var(--ghost)] bg-white/90 p-1 object-contain sm:h-11"
                priority
              />
              <div>
                <p className="font-display text-sm font-black leading-tight text-[var(--ink-strong)] sm:text-base">
                  {content.brand.productName}
                </p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)] sm:text-xs">{content.brand.platformLabel}</p>
              </div>
            </div>

            <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
              <Link
                href="/login"
                className="rounded-xl border border-[color:var(--ghost)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink-strong)]"
              >
                Sign In
              </Link>
              <Link href="/register" className="btn-primary rounded-xl px-4 py-2 text-sm font-semibold">
                Explore
              </Link>
            </div>
          </div>
        </header>

        <main className="surface-card mt-6 overflow-hidden rounded-[2rem]">
          <section className="grid gap-10 px-5 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-16">
            <div>
              <p className="chip bg-[var(--brand-100)] text-[var(--brand-700)]">Unified Campus Experience</p>
              <h1 className="font-display mt-5 text-3xl font-black leading-[1.1] text-[var(--ink-strong)] sm:text-4xl lg:text-6xl">
                {content.landing.headline}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--ink-soft)] lg:text-lg">
                {content.landing.subheadline}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/register" className="btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/college/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--ghost)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink-strong)]"
                >
                  View Portal Preview
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

              <div>
                <p className="mt-9 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--ink-soft)]">How it works</p>
                <ol className="mt-3 space-y-2">
                  {content.landing.workflowSteps.map((step, index) => (
                    <li key={step} className="flex items-start gap-3 text-sm leading-relaxed text-[var(--ink-soft)]">
                      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--soft-200)] text-[11px] font-bold text-[var(--ink-strong)]">
                        {index + 1}
                      </span>
                      <span>{step.replace("MongoDB backend", "live campus workflows")}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <article className="edge-tilt-card relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[var(--brand-700)] via-[var(--brand-600)] to-[#5a87ef] p-6 text-white lg:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/80">Campus Snapshot</p>
              <h2 className="font-display mt-3 text-2xl font-black leading-tight lg:text-3xl">
                Attendance and engagement pulse
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/85">
                Real-time highlights from your campus operations dashboard.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/20 bg-white/12 p-4 backdrop-blur-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/80">Attendance Performance</p>
                  <p className="font-display mt-2 text-3xl font-black">{content.operations.attendanceRate}</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/12 p-4 backdrop-blur-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/80">Active Streak</p>
                  <p className="font-display mt-2 text-3xl font-black">{content.operations.streak}</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/12 p-4 backdrop-blur-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/80">Resource Library</p>
                  <p className="font-display mt-2 text-3xl font-black">{content.resources.items.length}+</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/12 p-4 backdrop-blur-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/80">Community Threads</p>
                  <p className="font-display mt-2 text-3xl font-black">{content.community.posts.length}+</p>
                </div>
              </div>
            </article>
          </section>

          <section className="border-y border-[color:var(--ghost)] bg-white/60 px-5 py-14 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <p className="chip bg-[var(--teal-100)] text-[var(--teal-700)]">For Students</p>
                <h2 className="font-display mt-4 text-3xl font-black text-[var(--ink-strong)]">Academic productivity with less friction</h2>
                <ul className="mt-5 space-y-3">
                  {content.landing.studentValueProps.map((prop) => (
                    <li key={prop} className="flex items-start gap-3 text-sm text-[var(--ink-soft)]">
                      <CircleCheckBig className="mt-0.5 h-4 w-4 text-[var(--brand-700)]" />
                      <span>{prop}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="chip bg-[var(--violet-100)] text-[var(--violet-700)]">For Institutions</p>
                <h2 className="font-display mt-4 text-3xl font-black text-[var(--ink-strong)]">Control, compliance, and visibility at scale</h2>
                <ul className="mt-5 space-y-3">
                  {institutionValueProps.map((prop) => (
                    <li key={prop} className="flex items-start gap-3 text-sm text-[var(--ink-soft)]">
                      <CircleCheckBig className="mt-0.5 h-4 w-4 text-[var(--brand-700)]" />
                      <span>{prop}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="px-5 py-16 lg:px-8">
            <div>
              <p className="chip bg-[var(--brand-100)] text-[var(--brand-700)]">Platform Features</p>
              <h2 className="font-display mt-4 text-3xl font-black text-[var(--ink-strong)] lg:text-4xl">Everything your campus needs, connected</h2>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
            {platformFeatures.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="surface-card group rounded-3xl p-5 transition-transform duration-300 hover:-translate-y-1 hover:[transform:perspective(1000px)_rotateX(2deg)_rotateY(-2deg)]"
                >
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--soft-100)] text-[var(--brand-700)] transition group-hover:scale-105">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-display mt-4 text-xl font-bold text-[var(--ink-strong)]">{feature.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">{feature.detail}</p>
                  </div>
                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--brand-700)]">
                    Included in platform
                  </p>
                </article>
              );
            })}
            </div>
          </section>

          <footer className="relative overflow-hidden bg-[radial-gradient(circle_at_top_right,#2f5fd8_0%,#132a63_46%,#0b1735_100%)] px-5 py-14 text-white lg:px-8">
            <div className="absolute -right-8 top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -left-8 bottom-6 h-36 w-36 rounded-full bg-cyan-300/20 blur-3xl" />

            <div className="relative z-10">
              <div className="flex flex-wrap items-start justify-between gap-8">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/75">Academic Orbit</p>
                  <h2 className="font-display mt-3 text-3xl font-black leading-tight lg:text-5xl">
                    Professional campus operations,
                    <br />
                    from classroom to command center.
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-white/85">
                    Built for modern institutions with secure workflows for students and colleges in one unified environment.
                  </p>
                </div>

                <div className="grid min-w-[240px] gap-3 sm:grid-cols-2">
                  <Link href="/register" className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/20">
                    Register Now
                  </Link>
                  <Link href="/login" className="rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-[var(--ink-strong)] transition hover:bg-white/90">
                    Sign In
                  </Link>
                </div>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-white/15 bg-white/8 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/70">Performance</p>
                  <p className="mt-1 text-sm font-semibold">{content.operations.attendanceRate} attendance benchmark</p>
                </div>
                <div className="rounded-xl border border-white/15 bg-white/8 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/70">Engagement</p>
                  <p className="mt-1 text-sm font-semibold">{content.community.posts.length}+ active threads</p>
                </div>
                <div className="rounded-xl border border-white/15 bg-white/8 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/70">Content</p>
                  <p className="mt-1 text-sm font-semibold">{content.resources.items.length}+ shared resources</p>
                </div>
                <div className="rounded-xl border border-white/15 bg-white/8 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/70">Operations</p>
                  <p className="mt-1 text-sm font-semibold">Secure role-based portal access</p>
                </div>
              </div>

              <div className="mt-8 border-t border-white/15 pt-5 text-xs text-white/70 sm:flex sm:items-center sm:justify-between">
                <p>{new Date().getFullYear()} Academic Orbit. All rights reserved.</p>
                <p className="mt-2 sm:mt-0">Crafted for modern campus excellence.</p>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}