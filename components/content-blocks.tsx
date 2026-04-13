import { CircleAlert, CircleCheck, Sparkles } from "lucide-react";

import type { StatCard, Tone } from "@/lib/types";
import { cn } from "@/lib/utils";

const toneClass: Record<Tone, string> = {
  primary: "text-[var(--brand-700)] bg-[var(--brand-100)]",
  teal: "text-[var(--teal-700)] bg-[var(--teal-100)]",
  violet: "text-[var(--violet-700)] bg-[var(--violet-100)]",
  danger: "text-[var(--danger-700)] bg-[var(--danger-100)]",
  neutral: "text-[var(--ink-soft)] bg-[var(--soft-200)]",
};

export function StatGrid({ stats }: { stats: StatCard[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <article key={`${stat.label}-${stat.value}`} className="surface-card rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
              {stat.label}
            </p>
            <span
              className={cn(
                "rounded-full px-2 py-1 text-[10px] font-bold uppercase",
                toneClass[stat.tone ?? "neutral"],
              )}
            >
              {stat.tone ?? "neutral"}
            </span>
          </div>
          <p className="mt-4 font-display text-3xl font-black text-[var(--ink-strong)]">
            {stat.value}
          </p>
          {stat.hint ? <p className="mt-2 text-sm text-[var(--ink-soft)]">{stat.hint}</p> : null}
        </article>
      ))}
    </div>
  );
}

export function ActivityTone({ type }: { type: "grade" | "milestone" | "system" }) {
  if (type === "grade") {
    return <CircleCheck className="h-4 w-4 text-[var(--brand-700)]" />;
  }

  if (type === "milestone") {
    return <Sparkles className="h-4 w-4 text-[var(--teal-700)]" />;
  }

  return <CircleAlert className="h-4 w-4 text-[var(--ink-soft)]" />;
}
