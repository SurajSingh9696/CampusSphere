import { CheckCircle2, Circle, QrCode } from "lucide-react";

import { markAttendanceAction } from "@/app/actions/portal-actions";
import { StudentShell } from "@/components/student-shell";
import { getCampusData } from "@/lib/data/campus-store";

export const dynamic = "force-dynamic";

const subjectSummary = [
  { name: "Math", present: 36, total: 40 },
  { name: "Physics", present: 34, total: 40 },
  { name: "Chemistry", present: 38, total: 40 },
  { name: "Computer Science", present: 35, total: 40 },
  { name: "English", present: 37, total: 40 },
];

function toPercent(present: number, total: number): number {
  if (!total) {
    return 0;
  }

  return Math.round((present / total) * 100);
}

export default async function StudentAttendancePage() {
  const content = await getCampusData();
  const timeline = content.student.attendanceTimeline;

  return (
    <StudentShell activePath="/student/attendance">
      <section className="surface-card rounded-[2rem] p-6 lg:p-8">
        <h2 className="font-display text-3xl font-black text-[var(--ink-strong)] sm:text-4xl">Subject-wise Attendance</h2>
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
            {subjectSummary.map((subject) => {
              const percentValue = toPercent(subject.present, subject.total);

              return (
                <div key={subject.name}>
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-semibold text-[var(--ink-strong)]">{subject.name}</p>
                    <p className="text-[var(--ink-soft)]">
                      {percentValue}% ({subject.present}/{subject.total})
                    </p>
                  </div>
                  <progress
                    max={100}
                    value={percentValue}
                    className="attendance-progress mt-2 h-2 w-full overflow-hidden rounded-full"
                  />
                </div>
              );
            })}
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
