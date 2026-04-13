import { Download, Upload } from "lucide-react";

import { addCollegeUploadAction } from "@/app/actions/portal-actions";
import { getSession } from "@/lib/auth";
import { StatGrid } from "@/components/content-blocks";
import { CollegeShell } from "@/components/college-shell";
import { getCampusData, getCampusDataMeta } from "@/lib/data/campus-store";
import { getUserPortalRecord } from "@/lib/data/user-store";

export const dynamic = "force-dynamic";

export default async function CollegeDashboardPage() {
  const [content, dataMeta, session] = await Promise.all([
    getCampusData(),
    getCampusDataMeta(),
    getSession(),
  ]);

  const portalUser = session ? await getUserPortalRecord(session.id) : null;
  const collegeProfile = portalUser?.collegeProfile;
  const college = content.college;

  return (
    <CollegeShell activePath="/college/dashboard">
      <section className="surface-card rounded-[2rem] p-6 lg:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <p className="chip bg-[var(--brand-100)] text-[var(--brand-700)]">Institutional Reach</p>
          <p className="chip bg-[var(--soft-100)] text-[var(--ink-soft)]">
            {dataMeta.source === "database" ? "Live MongoDB" : "Memory Preview"}
          </p>
          {collegeProfile?.collegeShortCode ? (
            <p className="chip bg-[var(--teal-100)] text-[var(--teal-700)]">{collegeProfile.collegeShortCode}</p>
          ) : null}
        </div>
        <h2 className="font-display mt-3 text-3xl font-black text-[var(--ink-strong)] sm:text-4xl">College Operations Dashboard</h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--ink-soft)]">
          {collegeProfile?.collegeLocation
            ? `Manage records, schedules, and attendance for ${collegeProfile.collegeLocation}.`
            : "Manage records, publish schedules, and monitor attendance analytics from one operational workspace."}
        </p>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--ink-soft)]">Last synced {dataMeta.lastUpdatedAt}</p>
      </section>

      <section className="mt-6">
        <StatGrid stats={college.stats} />
      </section>

      <section id="records" className="mt-6 grid gap-6 xl:grid-cols-12">
        <article id="uploads" className="surface-card rounded-3xl p-6 xl:col-span-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-2xl font-bold text-[var(--ink-strong)]">Student Records Management</h3>
            <form action={addCollegeUploadAction} className="flex flex-wrap items-center gap-2">
              <input
                name="fileName"
                required
                placeholder="batch_file.csv"
                className="rounded-xl border border-[color:var(--ghost)] px-3 py-2 text-sm text-[var(--ink-strong)] outline-none focus:border-[var(--brand-600)]"
              />
              <button type="submit" className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold">
                <Upload className="h-4 w-4" />
                Upload Batch
              </button>
            </form>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[color:var(--ghost)] bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--soft-100)] text-xs uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                <tr>
                  <th className="px-4 py-3">File Name</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {college.uploadHistory.map((entry) => (
                  <tr key={entry.fileName} className="border-t border-[color:var(--ghost)]">
                    <td className="px-4 py-3 font-semibold text-[var(--ink-strong)]">{entry.fileName}</td>
                    <td className="px-4 py-3 text-[var(--ink-soft)]">{entry.status}</td>
                    <td className="px-4 py-3 text-[var(--ink-soft)]">{entry.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article id="attendance" className="surface-card rounded-3xl p-6 xl:col-span-4">
          <h3 className="font-display text-2xl font-bold text-[var(--ink-strong)]">Attendance Analytics</h3>
          <div className="mt-4 space-y-3">
            {college.attendanceSubjects.map((subject) => (
              <div key={subject.subject} className="rounded-2xl bg-[var(--soft-100)] p-4">
                <p className="font-display text-lg font-semibold text-[var(--ink-strong)]">{subject.subject}</p>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">Average: {subject.average}</p>
                <p className="mt-1 text-xs text-[var(--ink-soft)]">Next: {subject.nextSlot}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section id="schedule" className="surface-card mt-6 rounded-[2rem] p-6 lg:p-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-2xl font-bold text-[var(--ink-strong)]">Weekly Institutional Schedule</h3>
          <a
            href="/api/exports/college-schedule"
            className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--ghost)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink-strong)]"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </a>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[color:var(--ghost)] bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--soft-100)] text-xs uppercase tracking-[0.12em] text-[var(--ink-soft)]">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Mon</th>
                <th className="px-4 py-3">Tue</th>
                <th className="px-4 py-3">Wed</th>
                <th className="px-4 py-3">Thu</th>
                <th className="px-4 py-3">Fri</th>
              </tr>
            </thead>
            <tbody>
              {college.schedule.map((row) => (
                <tr key={row.time} className="border-t border-[color:var(--ghost)]">
                  <td className="px-4 py-3 font-semibold text-[var(--ink-strong)]">{row.time}</td>
                  <td className="px-4 py-3 text-[var(--ink-soft)]">{row.monday}</td>
                  <td className="px-4 py-3 text-[var(--ink-soft)]">{row.tuesday}</td>
                  <td className="px-4 py-3 text-[var(--ink-soft)]">{row.wednesday}</td>
                  <td className="px-4 py-3 text-[var(--ink-soft)]">{row.thursday}</td>
                  <td className="px-4 py-3 text-[var(--ink-soft)]">{row.friday}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </CollegeShell>
  );
}
