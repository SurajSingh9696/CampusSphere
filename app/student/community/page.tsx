import { CalendarClock, Flame, MessageCircleHeart } from "lucide-react";

import {
  registerMapEventAction,
  submitCommunityPostAction,
} from "@/app/actions/portal-actions";
import { StudentShell } from "@/components/student-shell";
import { getCampusData } from "@/lib/data/campus-store";

export const dynamic = "force-dynamic";

export default async function StudentCommunityPage() {
  const content = await getCampusData();
  const community = content.community;

  return (
    <StudentShell activePath="/student/community">
      <section className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-8">
          <div className="surface-card rounded-[2rem] p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="chip bg-[var(--violet-100)] text-[var(--violet-700)]">Campus Pulse</p>
                <h2 className="font-display mt-3 text-4xl font-black text-[var(--ink-strong)]">Community & Events</h2>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">
                  Connect with peers, share insights, and join live events.
                </p>
              </div>
            </div>

            <form action={submitCommunityPostAction} className="mt-5 grid gap-3">
              <textarea
                name="content"
                required
                minLength={8}
                placeholder="Share an update, study tip, or request with your peers..."
                className="min-h-28 rounded-2xl border border-[color:var(--ghost)] bg-white px-4 py-3 text-sm text-[var(--ink-strong)] outline-none focus:border-[var(--brand-600)]"
              />
              <div className="flex flex-wrap items-center gap-3">
                <input
                  name="tag"
                  placeholder="Tag (optional), e.g. Academics"
                  className="flex-1 rounded-xl border border-[color:var(--ghost)] bg-white px-4 py-2.5 text-sm text-[var(--ink-strong)] outline-none focus:border-[var(--brand-600)]"
                />
                <button
                  type="submit"
                  className="btn-primary rounded-xl px-4 py-2.5 text-sm font-semibold"
                >
                  Share a Thought
                </button>
              </div>
            </form>
          </div>

          {community.posts.map((post) => (
            <article key={`${post.author}-${post.ago}`} className="surface-card rounded-3xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-xl font-bold text-[var(--ink-strong)]">{post.author}</p>
                  <p className="text-sm text-[var(--ink-soft)]">
                    {post.role} • {post.ago}
                  </p>
                </div>
                {post.tag ? <span className="chip bg-[var(--teal-100)] text-[var(--teal-700)]">{post.tag}</span> : null}
              </div>

              <p className="mt-4 text-[15px] leading-relaxed text-[var(--ink-soft)]">{post.content}</p>

              <div className="mt-5 flex items-center gap-5 border-t border-[color:var(--ghost)] pt-4 text-sm text-[var(--ink-soft)]">
                <span className="inline-flex items-center gap-2">
                  <MessageCircleHeart className="h-4 w-4 text-[var(--brand-700)]" />
                  {post.likes} likes
                </span>
                <span>{post.comments} comments</span>
              </div>
            </article>
          ))}
        </div>

        <aside className="space-y-5 xl:col-span-4">
          <section className="surface-card rounded-3xl p-6">
            <div className="mb-4 flex items-center gap-2">
              <Flame className="h-5 w-5 text-[var(--brand-700)]" />
              <h3 className="font-display text-xl font-bold text-[var(--ink-strong)]">Trending</h3>
            </div>
            <ul className="space-y-3">
              {community.trending.map((trend) => (
                <li key={trend} className="rounded-2xl bg-[var(--soft-100)] px-4 py-3 text-sm font-semibold text-[var(--ink-soft)]">
                  {trend}
                </li>
              ))}
            </ul>
          </section>

          <section className="surface-card rounded-3xl p-6">
            <div className="mb-4 flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-[var(--brand-700)]" />
              <h3 className="font-display text-xl font-bold text-[var(--ink-strong)]">Upcoming Events</h3>
            </div>
            <div className="space-y-3">
              {community.events.map((event) => (
                <article key={event.title} className="rounded-2xl bg-[var(--soft-100)] p-4">
                  <p className="font-display text-base font-semibold text-[var(--ink-strong)]">{event.title}</p>
                  <p className="mt-1 text-xs text-[var(--ink-soft)]">{event.venue}</p>
                  <p className="mt-1 text-xs text-[var(--ink-soft)]">{event.scheduleLabel}</p>
                  <form action={registerMapEventAction}>
                    <input type="hidden" name="title" value={event.title} />
                    <button
                      type="submit"
                      className="mt-3 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[var(--brand-700)]"
                    >
                      Register
                    </button>
                  </form>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-gradient-to-br from-[var(--brand-700)] to-[var(--brand-600)] p-6 text-white">
            <h3 className="font-display text-2xl font-bold">Active Study Groups</h3>
            <div className="mt-4 space-y-2">
              {community.groups.map((group) => (
                <div key={group.name} className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-sm">
                  <span>{group.name}</span>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">{group.liveCount}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </StudentShell>
  );
}
