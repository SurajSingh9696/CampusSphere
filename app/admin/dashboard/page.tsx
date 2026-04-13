import { ShieldAlert } from "lucide-react";

import {
  createAdminIncidentAction,
  resolveAdminIncidentAction,
} from "@/app/actions/portal-actions";
import { StatGrid } from "@/components/content-blocks";
import { AdminShell } from "@/components/admin-shell";
import { getCampusData, getCampusDataMeta } from "@/lib/data/campus-store";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [content, dataMeta] = await Promise.all([
    getCampusData(),
    getCampusDataMeta(),
  ]);

  const admin = content.admin;
  const openIncidentCount = admin.incidents.filter(
    (incident) => incident.status.toLowerCase() !== "resolved",
  ).length;

  return (
    <AdminShell activePath="/admin/dashboard">
      <section className="surface-card rounded-[2rem] p-6 lg:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <p className="chip bg-[var(--brand-100)] text-[var(--brand-700)]">Central Intelligence</p>
          <p className="chip bg-[var(--soft-100)] text-[var(--ink-soft)]">
            {dataMeta.source === "database" ? "Live MongoDB" : "Memory Preview"}
          </p>
        </div>
        <h2 className="font-display mt-3 text-3xl font-black text-[var(--ink-strong)] sm:text-4xl">System Admin Control Center</h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--ink-soft)]">
          Oversee infrastructure health, institution compliance, and {openIncidentCount} active incidents in one live control surface.
        </p>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--ink-soft)]">Last synced {dataMeta.lastUpdatedAt}</p>
      </section>

      <section className="mt-6">
        <StatGrid stats={admin.stats} />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-12">
        <article id="incidents" className="surface-card rounded-3xl p-6 xl:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-2xl font-bold text-[var(--ink-strong)]">Incident Tracking System</h3>
            <form action={createAdminIncidentAction} className="grid w-full gap-2 rounded-2xl border border-[color:var(--ghost)] bg-white p-3 md:w-auto md:min-w-[430px]">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <input
                  name="category"
                  required
                  placeholder="Category"
                  className="rounded-xl border border-[color:var(--ghost)] px-3 py-2 text-sm text-[var(--ink-strong)] outline-none focus:border-[var(--brand-600)]"
                />
                <input
                  name="priority"
                  required
                  placeholder="Priority"
                  className="rounded-xl border border-[color:var(--ghost)] px-3 py-2 text-sm text-[var(--ink-strong)] outline-none focus:border-[var(--brand-600)]"
                />
                <button
                  type="submit"
                  className="btn-primary rounded-xl px-4 py-2 text-sm font-semibold"
                >
                  Log Incident
                </button>
              </div>
              <input
                name="issue"
                required
                placeholder="Describe issue"
                className="rounded-xl border border-[color:var(--ghost)] px-3 py-2 text-sm text-[var(--ink-strong)] outline-none focus:border-[var(--brand-600)]"
              />
            </form>
          </div>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-[color:var(--ghost)] bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--soft-100)] text-xs uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                <tr>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Issue</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {admin.incidents.map((incident) => (
                  <tr key={`${incident.category}-${incident.issue}`} className="border-t border-[color:var(--ghost)]">
                    <td className="px-4 py-3 font-semibold text-[var(--ink-strong)]">{incident.category}</td>
                    <td className="px-4 py-3 text-[var(--ink-soft)]">{incident.issue}</td>
                    <td className="px-4 py-3 text-[var(--ink-soft)]">{incident.priority}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          incident.status.toLowerCase() === "resolved"
                            ? "rounded-full bg-[var(--teal-100)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--teal-700)]"
                            : "rounded-full bg-[var(--danger-100)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--danger-700)]"
                        }
                      >
                        {incident.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {incident.status.toLowerCase() === "resolved" ? (
                        <span className="text-xs font-semibold text-[var(--ink-soft)]">Completed</span>
                      ) : (
                        <form action={resolveAdminIncidentAction}>
                          <input type="hidden" name="issue" value={incident.issue} />
                          <button
                            type="submit"
                            className="rounded-lg bg-[var(--ink-strong)] px-2.5 py-1.5 text-xs font-semibold text-white"
                          >
                            Resolve
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article id="audit" className="surface-card rounded-3xl p-6 xl:col-span-4">
          <h3 className="font-display text-2xl font-bold text-[var(--ink-strong)]">System Audit Logs</h3>
          <div className="mt-4 space-y-3">
            {admin.auditLogs.map((log) => (
              <div key={`${log.action}-${log.timestamp}`} className="rounded-2xl bg-[var(--soft-100)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">{log.timestamp}</p>
                <p className="mt-2 font-display text-lg font-semibold text-[var(--ink-strong)]">{log.action}</p>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">{log.detail}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-12">
        <article id="institutions" className="surface-card rounded-3xl p-6 xl:col-span-8">
          <h3 className="font-display text-2xl font-bold text-[var(--ink-strong)]">Institution Directory</h3>
          <div className="mt-4 grid gap-3">
            {admin.institutions.map((institution) => (
              <div key={institution.name} className="rounded-2xl border border-[color:var(--ghost)] bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-xl font-semibold text-[var(--ink-strong)]">{institution.name}</p>
                    <p className="mt-1 text-sm text-[var(--ink-soft)]">{institution.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[var(--ink-soft)]">Active Users</p>
                    <p className="font-display text-xl font-bold text-[var(--brand-700)]">{institution.activeUsers}</p>
                  </div>
                </div>
                <span
                  className={
                    institution.status.toLowerCase() === "verified"
                      ? "mt-3 inline-flex rounded-full bg-[var(--teal-100)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--teal-700)]"
                      : "mt-3 inline-flex rounded-full bg-[var(--danger-100)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--danger-700)]"
                  }
                >
                  {institution.status}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article id="security" className="rounded-3xl bg-gradient-to-br from-[var(--ink-strong)] to-[#223c6a] p-6 text-white xl:col-span-4">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/80">
            <ShieldAlert className="h-4 w-4" />
            Security Snapshot
          </p>
          <h3 className="font-display mt-3 text-2xl font-bold">Network integrity stable at 99.9%</h3>
          <p className="mt-3 text-sm text-white/85">
            Firewall protocols, institution moderation, and credential monitoring are synchronized from {dataMeta.source === "database" ? "MongoDB" : "local memory"} data.
          </p>
          <a
            href="/api/exports/admin-audit"
            className="mt-5 inline-flex rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25"
          >
            Export Full Audit Report
          </a>
        </article>
      </section>
    </AdminShell>
  );
}
