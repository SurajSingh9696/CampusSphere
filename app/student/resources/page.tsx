import { Download, Filter, Star } from "lucide-react";

import {
  downloadResourceAction,
  uploadResourceAction,
} from "@/app/actions/portal-actions";
import { StudentShell } from "@/components/student-shell";
import { getCampusData } from "@/lib/data/campus-store";

export const dynamic = "force-dynamic";

export default async function StudentResourcesPage() {
  const content = await getCampusData();
  const resources = content.resources;

  return (
    <StudentShell activePath="/student/resources">
      <section className="surface-card rounded-[2rem] p-6 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="chip bg-[var(--teal-100)] text-[var(--teal-700)]">Resource Hub</p>
            <h2 className="font-display mt-3 text-4xl font-black text-[var(--ink-strong)]">
              The Prism of Shared Knowledge
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--ink-soft)]">
              Elevate your academic journey through curated notes, summaries, flashcards, and lab-ready references.
            </p>
          </div>
          <form action={uploadResourceAction} className="grid w-full gap-2 rounded-2xl border border-[color:var(--ghost)] bg-white p-3 sm:max-w-sm">
            <input
              name="title"
              placeholder="Resource title"
              required
              className="rounded-xl border border-[color:var(--ghost)] px-3 py-2 text-sm text-[var(--ink-strong)] outline-none focus:border-[var(--brand-600)]"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                name="subject"
                placeholder="Subject"
                required
                className="rounded-xl border border-[color:var(--ghost)] px-3 py-2 text-sm text-[var(--ink-strong)] outline-none focus:border-[var(--brand-600)]"
              />
              <input
                name="kind"
                placeholder="Kind"
                required
                className="rounded-xl border border-[color:var(--ghost)] px-3 py-2 text-sm text-[var(--ink-strong)] outline-none focus:border-[var(--brand-600)]"
              />
            </div>
            <button
              type="submit"
              className="btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
            >
              Upload Notes
            </button>
          </form>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {resources.filters.map((filter, index) => (
            <button
              key={filter}
              type="button"
              className={
                index === 0
                  ? "rounded-full bg-[var(--brand-700)] px-4 py-2 text-xs font-semibold text-white"
                  : "rounded-full bg-[var(--soft-100)] px-4 py-2 text-xs font-semibold text-[var(--ink-soft)]"
              }
            >
              {filter}
            </button>
          ))}
          <button
            type="button"
            className="ml-auto inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-[var(--brand-700)]"
          >
            <Filter className="h-4 w-4" />
            Advanced Filters
          </button>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {resources.items.map((item) => (
          <article key={item.title} className="surface-card rounded-3xl p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="chip bg-[var(--soft-100)] text-[var(--ink-soft)]">{item.kind}</span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--ink-soft)]">
                <Star className="h-3.5 w-3.5 text-amber-500" />
                {item.rating}
              </span>
            </div>

            <h3 className="font-display mt-4 text-xl font-bold leading-tight text-[var(--ink-strong)]">{item.title}</h3>
            <p className="mt-2 text-sm font-medium text-[var(--ink-soft)]">{item.subject}</p>

            <div className="mt-4 rounded-2xl bg-[var(--soft-100)] p-3 text-sm text-[var(--ink-soft)]">
              <p>Contributor: {item.contributor}</p>
              <p className="mt-1">Downloads: {item.downloads}</p>
            </div>

            <form action={downloadResourceAction}>
              <input type="hidden" name="title" value={item.title} />
              <button
                type="submit"
                className="btn-primary mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </form>
          </article>
        ))}
      </section>

      <section className="surface-card mt-6 rounded-[2rem] p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl font-bold text-[var(--ink-strong)]">Top Prism Contributors</h3>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              Join the leaderboard by publishing quality notes and helping your peers.
            </p>
          </div>
          <button
            type="button"
            className="rounded-xl border border-[color:var(--ghost)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink-strong)]"
          >
            View Leaderboard
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {resources.contributors.map((person) => (
            <div key={person.name} className="rounded-2xl bg-[var(--soft-100)] p-4">
              <p className="font-display text-lg font-bold text-[var(--ink-strong)]">{person.name}</p>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">Contribution score: {person.points}</p>
            </div>
          ))}
        </div>
      </section>
    </StudentShell>
  );
}
