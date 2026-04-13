import Link from "next/link";

import { ArrowUpRight, CalendarCheck2, Sparkles, Store } from "lucide-react";

import { ActivityTone, StatGrid } from "@/components/content-blocks";
import { StudentShell } from "@/components/student-shell";
import { getSession } from "@/lib/auth";
import { getCampusData, getCampusDataMeta } from "@/lib/data/campus-store";
import { getUserPortalRecord } from "@/lib/data/user-store";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const [content, dataMeta, session] = await Promise.all([
    getCampusData(),
    getCampusDataMeta(),
    getSession(),
  ]);

  const portalUser = session ? await getUserPortalRecord(session.id) : null;
  const student = content.student;
  const studentProfile = portalUser?.studentProfile;
  const greeting = portalUser
    ? `Welcome back, ${portalUser.name}.`
    : student.greeting;
  const studentContext = studentProfile
    ? `${studentProfile.course} • ${studentProfile.stream} • ${studentProfile.campus}`
    : "Your personalized workspace is synced across classes, resources, and campus operations.";

  return (
    <StudentShell activePath="/student/dashboard">
      <section className="surface-card overflow-hidden rounded-[2rem] p-6 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="chip bg-[var(--brand-100)] text-[var(--brand-700)]">Academic Year 2026</p>
              <p className="chip bg-[var(--soft-100)] text-[var(--ink-soft)]">
                {dataMeta.source === "database" ? "Live MongoDB" : "Memory Preview"}
              </p>
            </div>
            <h2 className="font-display mt-4 text-3xl font-black leading-tight text-[var(--ink-strong)] sm:text-4xl">
              {greeting}
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--ink-soft)]">
              {studentContext}
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--ink-soft)]">
              Last synced {dataMeta.lastUpdatedAt}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/student/attendance" className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold">
                <CalendarCheck2 className="h-4 w-4" />
                View Class Timeline
              </Link>
              <Link
                href="/student/resources"
                className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--ghost)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--ink-strong)]"
              >
                Open Resource Hub
              </Link>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="h-full rounded-3xl bg-gradient-to-br from-[var(--brand-700)] to-[var(--brand-600)] p-5 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/75">Campus Momentum</p>
              <h3 className="font-display mt-2 text-2xl font-bold">Live progress insights</h3>
              <ul className="mt-4 space-y-2 text-sm text-white/90">
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Attendance trend steady at {content.operations.attendanceRate}
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  {content.resources.items.length} resources available in the library
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  {content.community.posts.length} community threads are active
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <StatGrid stats={student.quickStats} />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <article className="surface-card rounded-3xl p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-2xl font-bold text-[var(--ink-strong)]">Recent Activity</h3>
            <Link href="/student/community" className="text-sm font-semibold text-[var(--brand-700)]">
              View community
            </Link>
          </div>
          <div className="space-y-3">
            {student.activity.map((item) => (
              <div key={`${item.title}-${item.timeLabel}`} className="rounded-2xl bg-[var(--soft-100)] p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-white p-1.5">
                    <ActivityTone type={item.type} />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-display text-lg font-semibold text-[var(--ink-strong)]">{item.title}</p>
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                        {item.timeLabel}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[var(--ink-soft)]">{item.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="surface-card rounded-3xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-2xl font-bold text-[var(--ink-strong)]">CampusMart</h3>
            <Store className="h-5 w-5 text-[var(--brand-700)]" />
          </div>
          <div className="space-y-3">
            {student.marketplace.map((item) => (
              <div key={item.name} className="rounded-2xl border border-[color:var(--ghost)] bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-display text-base font-semibold text-[var(--ink-strong)]">{item.name}</p>
                  <span className="text-sm font-bold text-[var(--brand-700)]">{item.price}</span>
                </div>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">{item.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                    {item.badge ?? "Available"}
                  </span>
                  <Link href="/student/resources" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand-700)]">
                    Explore
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </StudentShell>
  );
}
