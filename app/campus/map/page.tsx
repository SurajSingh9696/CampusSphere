import Link from "next/link";

import { ArrowUpRight, Building2, MapPinned } from "lucide-react";

import { registerMapEventAction } from "@/app/actions/portal-actions";
import { StudentShell } from "@/components/student-shell";
import { getCampusData } from "@/lib/data/campus-store";

export const dynamic = "force-dynamic";

interface CampusMapPageProps {
  searchParams: Promise<{
    location?: string | string[];
  }>;
}

function readParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function buildLocationHref(name: string): string {
  const params = new URLSearchParams({ location: name });
  return `/campus/map?${params.toString()}`;
}

export default async function CampusMapPage({ searchParams }: CampusMapPageProps) {
  const params = await searchParams;
  const content = await getCampusData();
  const map = content.map;
  const requestedLocation = readParam(params.location);
  const selectedLocation =
    map.locations.find((location) => location.name === requestedLocation)
    ?? map.locations[0];
  const mapQuery = `${selectedLocation?.name ?? "Campus"} university campus`;
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  return (
    <StudentShell activePath="/campus/map">
      <section className="grid gap-6 xl:grid-cols-12">
        <article className="surface-card rounded-[2rem] p-6 xl:col-span-8 lg:p-8">
          <p className="chip bg-[var(--brand-100)] text-[var(--brand-700)]">Digital Navigator</p>
          <h2 className="font-display mt-3 text-3xl font-black text-[var(--ink-strong)] sm:text-4xl">Campus Navigation & Events</h2>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            Navigate major facilities, discover open zones, and register for live seminars.
          </p>

          <div className="mt-6 rounded-3xl border border-[color:var(--ghost)] bg-[var(--soft-100)] p-4">
            <div className="grid gap-3 rounded-2xl bg-white p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-100)] px-3 py-1.5 text-xs font-semibold text-[var(--brand-700)]">
                  <MapPinned className="h-4 w-4" />
                  Live map from internet
                </p>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-[color:var(--ghost)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-strong)]"
                >
                  Open in Maps
                </a>
              </div>

              <div className="overflow-hidden rounded-2xl border border-[color:var(--ghost)]">
                <iframe
                  src={mapEmbedUrl}
                  title="Campus map"
                  className="h-[300px] w-full sm:h-[380px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {map.locations.map((location) => (
              <Link
                key={location.name}
                href={buildLocationHref(location.name)}
                className={
                  selectedLocation?.name === location.name
                    ? "rounded-2xl border border-[var(--brand-600)] bg-[var(--brand-100)] p-4"
                    : "rounded-2xl bg-[var(--soft-100)] p-4"
                }
              >
                <p className="font-display text-lg font-bold text-[var(--ink-strong)]">{location.name}</p>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">{location.note}</p>
                <span
                  className={
                    location.isOpen
                      ? "mt-3 inline-flex rounded-full bg-[var(--teal-100)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--teal-700)]"
                      : "mt-3 inline-flex rounded-full bg-[var(--danger-100)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--danger-700)]"
                  }
                >
                  {location.isOpen ? "Open" : "Busy"}
                </span>
              </Link>
            ))}
          </div>
        </article>

        <aside className="space-y-5 xl:col-span-4">
          <section className="surface-card rounded-3xl p-6">
            <h3 className="font-display text-2xl font-bold text-[var(--ink-strong)]">Campus Pulse</h3>
            <div className="mt-4 space-y-3">
              {map.events.map((event) => (
                <article key={event.title} className="rounded-2xl bg-[var(--soft-100)] p-4">
                  <p className="font-display text-lg font-semibold text-[var(--ink-strong)]">{event.title}</p>
                  <p className="mt-1 text-xs text-[var(--ink-soft)]">{event.venue}</p>
                  <p className="mt-1 text-xs text-[var(--ink-soft)]">{event.scheduleLabel}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--ink-soft)]">{event.slotsLeft} spots</span>
                    <form action={registerMapEventAction}>
                      <input type="hidden" name="title" value={event.title} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[var(--brand-700)]"
                      >
                        Register
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-gradient-to-br from-[var(--brand-700)] to-[var(--brand-600)] p-6 text-white">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/80">
              <Building2 className="h-4 w-4" />
              Upcoming Milestone
            </p>
            <p className="font-display mt-3 text-2xl font-bold leading-tight">{map.milestone}</p>
          </section>
        </aside>
      </section>
    </StudentShell>
  );
}
