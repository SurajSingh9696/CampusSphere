import { ArrowRight, Search, ShieldCheck } from "lucide-react";

import {
  reportLostItemAction,
  submitCommunityPostAction,
} from "@/app/actions/portal-actions";
import { StudentShell } from "@/components/student-shell";
import { getCampusData } from "@/lib/data/campus-store";

export const dynamic = "force-dynamic";

export default async function StudentUtilitiesPage() {
  const content = await getCampusData();
  const utilities = content.utilities;

  return (
    <StudentShell activePath="/student/utilities">
      <section className="surface-card rounded-[2rem] p-6 lg:p-8">
        <p className="chip bg-[var(--brand-100)] text-[var(--brand-700)]">Connect & Collaborate</p>
        <h2 className="font-display mt-3 text-3xl font-black text-[var(--ink-strong)] sm:text-4xl">Study Buddy Finder</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--ink-soft)]">
          Match with peers by course, specialization, and learning style to build stronger study momentum.
        </p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {utilities.studyBuddies.map((buddy) => (
          <article key={buddy.name} className="surface-card rounded-3xl p-5">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-100)] text-sm font-bold text-[var(--brand-700)]">
              {buddy.name
                .split(" ")
                .slice(0, 2)
                .map((part) => part[0])
                .join("")}
            </div>
            <h3 className="font-display mt-4 text-xl font-bold text-[var(--ink-strong)]">{buddy.name}</h3>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">
              {buddy.major} • {buddy.year}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {buddy.skills.map((skill) => (
                <span key={skill} className="rounded-full bg-[var(--soft-100)] px-3 py-1 text-xs font-semibold text-[var(--ink-soft)]">
                  {skill}
                </span>
              ))}
            </div>
            <form action={submitCommunityPostAction} className="mt-5">
              <input
                type="hidden"
                name="content"
                value={`Looking to connect with ${buddy.name} (${buddy.major}) for focused study sessions.`}
              />
              <input type="hidden" name="tag" value="Study Buddy" />
              <button
                type="submit"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-700)]"
              >
                Send Request
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </article>
        ))}
      </section>

      <section className="surface-card mt-6 rounded-[2rem] p-6 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="chip bg-[var(--teal-100)] text-[var(--teal-700)]">Campus Support</p>
            <h2 className="font-display mt-3 text-3xl font-black text-[var(--ink-strong)]">Lost & Found</h2>
          </div>
          <form action={reportLostItemAction} className="grid w-full gap-2 rounded-2xl border border-[color:var(--ghost)] bg-white p-3 sm:max-w-sm">
            <div className="grid grid-cols-2 gap-2">
              <input
                name="name"
                required
                placeholder="Item name"
                className="rounded-xl border border-[color:var(--ghost)] px-3 py-2 text-sm text-[var(--ink-strong)] outline-none focus:border-[var(--brand-600)]"
              />
              <input
                name="foundAt"
                required
                placeholder="Found at"
                className="rounded-xl border border-[color:var(--ghost)] px-3 py-2 text-sm text-[var(--ink-strong)] outline-none focus:border-[var(--brand-600)]"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--ink-strong)] px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Search className="h-4 w-4" />
              Report Found Item
            </button>
          </form>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {utilities.lostAndFound.map((item) => (
            <article key={item.name} className="rounded-2xl bg-[var(--soft-100)] p-4">
              <h3 className="font-display text-lg font-bold text-[var(--ink-strong)]">{item.name}</h3>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">Found at {item.foundAt}</p>
              <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em]">
                <ShieldCheck className="h-4 w-4 text-[var(--brand-700)]" />
                <span className={item.status === "open" ? "text-[var(--brand-700)]" : "text-[var(--teal-700)]"}>
                  {item.status}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </StudentShell>
  );
}
