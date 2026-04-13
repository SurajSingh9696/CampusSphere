import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarCheck2,
  CircleCheckBig,
  Database,
  GraduationCap,
  MapPinned,
  MessageSquare,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";

import { getCampusData } from "@/lib/data/campus-store";

export const dynamic = "force-dynamic";

interface FeatureCard {
  title: string;
  detail: string;
  href: string;
  icon: LucideIcon;
  tag: string;
}

export default async function Home() {
  const content = await getCampusData();

  const featureCards: FeatureCard[] = [
    {
      title: "Student Dashboard",
      detail: "Track academics, attendance, activity feed, and peer marketplace from one workspace.",
      href: "/student/dashboard",
      icon: GraduationCap,
      tag: `${content.student.quickStats[0]?.value ?? "Live"} attendance health`,
    },
    {
      title: "Smart Attendance",
      detail: "Use QR and geofence verification for accurate, transparent class presence.",
      href: "/operations/attendance",
      icon: CalendarCheck2,
      tag: `${content.operations.attendanceRate} total rate`,
    },
    {
      title: "Operations Scanner",
      detail: "Run live scanner controls with synced logs and manual code operations.",
      href: "/operations/attendance",
      icon: ScanLine,
      tag: content.operations.scannerState,
    },
    {
      title: "Resource Exchange",
      detail: "Upload, discover, and download verified learning assets across departments.",
      href: "/student/resources",
      icon: BookOpen,
      tag: `${content.resources.items.length} resource modules`,
    },
    {
      title: "Campus Community",
      detail: "Participate in discussion threads, groups, and event registrations in real time.",
      href: "/student/community",
      icon: MessageSquare,
      tag: `${content.community.posts.length} active posts`,
    },
    {
      title: "Student Utilities",
      detail: "Coordinate study buddies and lost-and-found support with live updates.",
      href: "/student/utilities",
      icon: Wrench,
      tag: `${content.utilities.studyBuddies.length} buddy profiles`,
    },
    {
      title: "Campus Navigation",
      detail: "Track open locations and event zones through the integrated map experience.",
      href: "/campus/map",
      icon: MapPinned,
      tag: `${content.map.locations.length} mapped facilities`,
    },
    {
      title: "College & Admin Control",
      detail: "Manage institutional operations, audits, incidents, and records with role security.",
      href: "/admin/dashboard",
      icon: ShieldCheck,
      tag: `${content.admin.incidents.length} tracked incidents`,
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--canvas)] px-5 py-8 lg:px-10 lg:py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-28 h-72 w-72 rounded-full bg-[var(--brand-100)]/70 blur-3xl" />
        <div className="absolute -right-10 top-0 h-80 w-80 rounded-full bg-[var(--teal-100)]/75 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[var(--violet-100)]/60 blur-3xl" />
      </div>

      <main className="relative mx-auto flex w-full max-w-[1320px] flex-col gap-8">
        <header className="surface-card rounded-2xl px-5 py-4 lg:px-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand-700)] to-[var(--brand-600)] text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-xl font-black text-[var(--ink-strong)] lg:text-2xl">
                  {content.brand.productName}
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                  {content.brand.platformLabel} • {content.brand.version}
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--soft-100)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-soft)]">
              <Database className="h-4 w-4" />
              <span>Live MongoDB sync + role security</span>
            </div>
          </div>
        </header>

        <section className="surface-card relative overflow-hidden rounded-[2rem] p-6 lg:p-10">
          <div className="absolute -right-12 top-0 h-64 w-64 rounded-full bg-[var(--brand-100)]/70 blur-2xl" />
          <div className="grid gap-10 lg:grid-cols-[1.2fr,0.8fr]">
            <div>
              <p className="chip bg-[var(--brand-100)] text-[var(--brand-700)]">Enterprise-Grade Campus Platform</p>
              <h1 className="font-display mt-4 text-4xl font-black leading-tight text-[var(--ink-strong)] lg:text-6xl">
                {content.landing.headline}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--ink-soft)] lg:text-lg">
                {content.landing.subheadline}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-lg shadow-[color:var(--brand-glow)]"
                >
                  Launch Secure Portal
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/student/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--ghost)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink-strong)]"
                >
                  View Student Experience
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-7 grid gap-2 sm:grid-cols-3">
                <div className="rounded-2xl bg-[var(--soft-100)] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--ink-soft)]">Attendance Engine</p>
                  <p className="mt-1 font-display text-2xl font-black text-[var(--ink-strong)]">{content.operations.attendanceRate}</p>
                </div>
                <div className="rounded-2xl bg-[var(--soft-100)] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--ink-soft)]">Live Community</p>
                  <p className="mt-1 font-display text-2xl font-black text-[var(--ink-strong)]">{content.community.posts.length}+ posts</p>
                </div>
                <div className="rounded-2xl bg-[var(--soft-100)] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--ink-soft)]">Resource Stack</p>
                  <p className="mt-1 font-display text-2xl font-black text-[var(--ink-strong)]">{content.resources.items.length}+ modules</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <article className="rounded-3xl bg-gradient-to-br from-[var(--brand-700)] to-[var(--brand-600)] p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/75">Platform Workflow</p>
                <h2 className="font-display mt-2 text-2xl font-extrabold">From sign-in to institutional control</h2>
                <ol className="mt-5 space-y-3 text-sm text-white/95">
                  {content.landing.workflowSteps.map((step, index) => (
                    <li key={step} className="flex items-start gap-3">
                      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </article>

              <article className="surface-card rounded-3xl p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">Operational Snapshot</p>
                <ul className="mt-3 space-y-2 text-sm text-[var(--ink-soft)]">
                  <li className="flex items-center justify-between rounded-xl bg-[var(--soft-100)] px-3 py-2">
                    <span>Scanner Status</span>
                    <span className="font-semibold text-[var(--ink-strong)]">{content.operations.scannerState}</span>
                  </li>
                  <li className="flex items-center justify-between rounded-xl bg-[var(--soft-100)] px-3 py-2">
                    <span>Geofence Radius</span>
                    <span className="font-semibold text-[var(--ink-strong)]">{content.operations.geofenceRadius}</span>
                  </li>
                  <li className="flex items-center justify-between rounded-xl bg-[var(--soft-100)] px-3 py-2">
                    <span>Campus Milestone</span>
                    <span className="font-semibold text-[var(--ink-strong)]">{content.map.milestone}</span>
                  </li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="chip bg-[var(--teal-100)] text-[var(--teal-700)]">Complete Feature Coverage</p>
              <h2 className="font-display mt-3 text-3xl font-black text-[var(--ink-strong)] lg:text-4xl">
                Everything in one connected digital campus
              </h2>
            </div>
            <Link href="/login" className="text-sm font-semibold text-[var(--brand-700)]">
              Explore all modules
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {featureCards.map((feature) => {
              const Icon = feature.icon;

              return (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className="surface-card group rounded-3xl p-5 transition hover:-translate-y-0.5 hover:border-[color:var(--brand-600)]"
                >
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--soft-100)] text-[var(--brand-700)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display mt-4 text-xl font-bold text-[var(--ink-strong)]">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">{feature.detail}</p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--brand-700)]">
                    {feature.tag}
                  </p>
                  <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-700)]">
                    Open module
                    <ArrowUpRight className="h-4 w-4" />
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-3">
          <article className="surface-card rounded-3xl p-6">
            <h3 className="font-display text-2xl font-bold text-[var(--ink-strong)]">Student Outcomes</h3>
            <ul className="mt-5 space-y-3">
              {content.landing.studentValueProps.map((prop) => (
                <li key={prop} className="flex items-start gap-3 rounded-2xl bg-[var(--soft-100)] p-3">
                  <CircleCheckBig className="mt-0.5 h-4 w-4 text-[var(--brand-700)]" />
                  <span className="text-sm font-medium text-[var(--ink-soft)]">{prop}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="surface-card rounded-3xl p-6">
            <h3 className="font-display text-2xl font-bold text-[var(--ink-strong)]">College & Admin Impact</h3>
            <ul className="mt-5 space-y-3">
              {content.landing.adminValueProps.map((prop) => (
                <li key={prop} className="rounded-2xl bg-[var(--soft-100)] p-3 text-sm font-medium text-[var(--ink-soft)]">
                  {prop}
                </li>
              ))}
            </ul>
          </article>

          <article className="surface-card rounded-3xl p-6">
            <h3 className="font-display text-2xl font-bold text-[var(--ink-strong)]">Role-Based Access</h3>
            <div className="mt-5 grid gap-3">
              <Link href="/student/dashboard" className="rounded-2xl border border-[color:var(--ghost)] bg-white p-4 transition hover:border-[var(--brand-600)]">
                <p className="font-display text-lg font-bold text-[var(--ink-strong)]">Student Portal</p>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">Attendance, resources, community, utilities</p>
              </Link>
              <Link href="/college/dashboard" className="rounded-2xl border border-[color:var(--ghost)] bg-white p-4 transition hover:border-[var(--brand-600)]">
                <p className="font-display text-lg font-bold text-[var(--ink-strong)]">College Workspace</p>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">Records, schedule, upload operations</p>
              </Link>
              <Link href="/admin/dashboard" className="rounded-2xl border border-[color:var(--ghost)] bg-white p-4 transition hover:border-[var(--brand-600)]">
                <p className="font-display text-lg font-bold text-[var(--ink-strong)]">Admin Control</p>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">Incidents, audits, institutions, exports</p>
              </Link>
            </div>
          </article>
        </section>

        <section className="surface-card rounded-[2rem] p-6 lg:p-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="chip bg-[var(--violet-100)] text-[var(--violet-700)]">Live Campus Pulse</p>
              <h3 className="font-display mt-3 text-3xl font-black text-[var(--ink-strong)]">A single source of truth for daily campus operations</h3>
            </div>
            <Link href="/student/community" className="text-sm font-semibold text-[var(--brand-700)]">
              Open live feed
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <article className="rounded-3xl bg-[var(--soft-100)] p-5">
              <h4 className="font-display text-xl font-bold text-[var(--ink-strong)]">Upcoming Events</h4>
              <div className="mt-4 space-y-3">
                {content.community.events.slice(0, 3).map((event) => (
                  <div key={event.title} className="rounded-2xl bg-white p-4">
                    <p className="font-semibold text-[var(--ink-strong)]">{event.title}</p>
                    <p className="mt-1 text-xs text-[var(--ink-soft)]">{event.venue}</p>
                    <p className="mt-1 text-xs text-[var(--ink-soft)]">{event.scheduleLabel}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-3xl bg-[var(--soft-100)] p-5">
              <h4 className="font-display text-xl font-bold text-[var(--ink-strong)]">Top Resources</h4>
              <div className="mt-4 space-y-3">
                {content.resources.items.slice(0, 3).map((item) => (
                  <div key={item.title} className="rounded-2xl bg-white p-4">
                    <p className="font-semibold text-[var(--ink-strong)]">{item.title}</p>
                    <p className="mt-1 text-xs text-[var(--ink-soft)]">{item.subject}</p>
                    <p className="mt-1 text-xs text-[var(--ink-soft)]">{item.downloads} downloads • {item.kind}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-3xl bg-[var(--soft-100)] p-5">
              <h4 className="font-display text-xl font-bold text-[var(--ink-strong)]">Campus Map Status</h4>
              <div className="mt-4 space-y-3">
                {content.map.locations.slice(0, 3).map((location) => (
                  <div key={location.name} className="rounded-2xl bg-white p-4">
                    <p className="font-semibold text-[var(--ink-strong)]">{location.name}</p>
                    <p className="mt-1 text-xs text-[var(--ink-soft)]">{location.note}</p>
                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--brand-700)]">
                      {location.isOpen ? "Open now" : "Currently busy"}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="surface-card rounded-3xl p-6 lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-3xl font-black text-[var(--ink-strong)]">Build a modern campus command center</h3>
              <p className="mt-2 max-w-3xl text-sm text-[var(--ink-soft)]">
                Secure authentication, role-specific dashboards, MongoDB-backed data, and connected workflows are already integrated.
              </p>
            </div>
            <Link href="/login" className="btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold">
              Enter CampusSphere
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
