import { CheckCircle2, Circle, QrCode } from "lucide-react";

import { markAttendanceAction } from "@/app/actions/portal-actions";
import { StudentShell } from "@/components/student-shell";
import { getCampusData } from "@/lib/data/campus-store";

export const dynamic = "force-dynamic";

const subjectSummary = [
  { name: "Math", percent: "90% (36/40)", widthClass: "w-[90%]" },
  { name: "Physics", percent: "85% (34/40)", widthClass: "w-[85%]" },
  { name: "Chemistry", percent: "95% (38/40)", widthClass: "w-[95%]" },
  { name: "Computer Science", percent: "88% (35/40)", widthClass: "w-[88%]" },
  { name: "English", percent: "92% (37/40)", widthClass: "w-[92%]" },
];

export default async function StudentAttendancePage() {
  const content = await getCampusData();
  const timeline = content.student.attendanceTimeline;

  return (
    <StudentShell activePath="/student/attendance">
      <section className="surface-card rounded-[2rem] p-6 lg:p-8">
        <h2 className="font-display text-4xl font-black text-[var(--ink-strong)]">Subject-wise Attendance</h2>
        <div className="mt-4 rounded-2xl bg-[var(--teal-100)] px-4 py-3 text-sm font-semibold text-[var(--teal-700)]">
          Live Geofencing: Active on Campus (GPS confirmed)
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-7">
          {timeline.map((entry) => (
            <article key={`${entry.subject}-${entry.window}`} className="surface-card rounded-3xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-2xl font-bold text-[var(--ink-strong)]">{entry.subject}</h3>
                  <p className="text-sm text-[var(--ink-soft)]">{entry.window}</p>
                </div>
                <form action={markAttendanceAction}>
                  <input type="hidden" name="subject" value={entry.subject} />
                  <input type="hidden" name="window" value={entry.window} />
                  <button
                    type="submit"
                    disabled={!entry.canScan}
                    className={
                      entry.canScan
                        ? "btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
                        : "inline-flex items-center gap-2 rounded-xl bg-[var(--soft-200)] px-4 py-2 text-sm font-semibold text-[var(--ink-soft)]"
                    }
                  >
                    <QrCode className="h-4 w-4" />
                    {entry.canScan ? "Scan to Mark" : "Marked"}
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>

        <aside className="surface-card rounded-3xl p-6 xl:col-span-5">
          <h3 className="font-display text-2xl font-bold text-[var(--ink-strong)]">Subject Attendance Summary</h3>
          <div className="mt-5 space-y-4">
            {subjectSummary.map((subject) => (
              <div key={subject.name}>
                <div className="flex items-center justify-between text-sm">
                  <p className="font-semibold text-[var(--ink-strong)]">{subject.name}</p>
                  <p className="text-[var(--ink-soft)]">{subject.percent}</p>
                </div>
                <div className="mt-2 h-2 rounded-full bg-[var(--soft-200)]">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r from-[var(--brand-700)] to-[var(--brand-600)] ${subject.widthClass}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-[var(--soft-100)] p-4">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--ink-soft)]">
              <CheckCircle2 className="h-4 w-4 text-[var(--teal-700)]" />
              Attendance scanners are synchronized with operations.
            </p>
            <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[var(--ink-soft)]">
              <Circle className="h-4 w-4 text-[var(--brand-700)]" />
              Next active slot starts at 4:00 PM.
            </p>
          </div>
        </aside>
      </section>
    </StudentShell>
  );
}
