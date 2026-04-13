import { Radar, ScanLine, ShieldCheck, TimerReset } from "lucide-react";

import { generateManualCodeAction } from "@/app/actions/portal-actions";
import { StudentShell } from "@/components/student-shell";
import { getSession } from "@/lib/auth";
import { getCampusData } from "@/lib/data/campus-store";

export const dynamic = "force-dynamic";

export default async function OperationsAttendancePage() {
  const session = await getSession();
  const content = await getCampusData();
  const operations = content.operations;
  const canGenerateManualCode =
    session?.role === "college" || session?.role === "admin";

  return (
    <StudentShell activePath="/operations/attendance">
      <section className="grid gap-6 xl:grid-cols-12">
        <article className="surface-card rounded-[2rem] p-6 xl:col-span-7 lg:p-8">
          <p className="chip bg-[var(--teal-100)] text-[var(--teal-700)]">Operations Center</p>
          <h2 className="font-display mt-3 text-3xl font-black text-[var(--ink-strong)] sm:text-4xl">Smart Attendance</h2>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            Real-time presence verification with QR scanner and geofence validation.
          </p>

          <div className="mt-6 rounded-3xl bg-[var(--soft-100)] p-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--teal-100)] px-3 py-1.5 text-xs font-semibold text-[var(--teal-700)]">
              <Radar className="h-4 w-4" />
              {operations.scannerState}
            </div>
            <div className="grid place-items-center rounded-3xl border border-[color:var(--ghost)] bg-white p-6 sm:p-10">
              <div className="relative h-44 w-44 rounded-3xl bg-gradient-to-br from-[#0f1e3c] to-[#1b3b7c] sm:h-56 sm:w-56">
                <div className="absolute inset-6 rounded-2xl border-2 border-dashed border-white/40" />
                <div className="absolute inset-x-10 top-1/2 h-1 -translate-y-1/2 bg-white/55" />
              </div>
              {canGenerateManualCode ? (
                <form action={generateManualCodeAction}>
                  <button
                    type="submit"
                    className="btn-primary mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
                  >
                    <ScanLine className="h-4 w-4" />
                    Generate Manual Code
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--soft-200)] px-4 py-2.5 text-sm font-semibold text-[var(--ink-soft)]"
                >
                  <ScanLine className="h-4 w-4" />
                  College/Admin Access Required
                </button>
              )}
            </div>
          </div>
        </article>

        <aside className="space-y-6 xl:col-span-5">
          <section className="surface-card rounded-3xl p-6">
            <h3 className="font-display text-2xl font-bold text-[var(--ink-strong)]">Verification Status</h3>
            <div className="mt-4 grid gap-3 text-sm text-[var(--ink-soft)]">
              <p className="inline-flex items-center gap-2">
                <TimerReset className="h-4 w-4 text-[var(--brand-700)]" />
                Geofence radius: {operations.geofenceRadius}
              </p>
              <p className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[var(--teal-700)]" />
                Biometric identity matched
              </p>
            </div>
          </section>

          <section className="surface-card rounded-3xl p-6">
            <h3 className="font-display text-2xl font-bold text-[var(--ink-strong)]">Attendance Performance</h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[var(--soft-100)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">Total Rate</p>
                <p className="mt-2 font-display text-3xl font-black text-[var(--ink-strong)]">{operations.attendanceRate}</p>
              </div>
              <div className="rounded-2xl bg-[var(--soft-100)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">Streak</p>
                <p className="mt-2 font-display text-3xl font-black text-[var(--brand-700)]">{operations.streak}</p>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              {operations.recentLogs.map((log) => (
                <div key={`${log.course}-${log.timestamp}`} className="rounded-2xl border border-[color:var(--ghost)] bg-white p-4">
                  <p className="font-display text-lg font-semibold text-[var(--ink-strong)]">{log.course}</p>
                  <p className="mt-1 text-sm text-[var(--ink-soft)]">{log.timestamp}</p>
                  <span className="mt-2 inline-flex rounded-full bg-[var(--teal-100)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--teal-700)]">
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </StudentShell>
  );
}
