import { Role } from "@prisma/client";
import { bookmarkEventAction, registerEventAction } from "@/lib/actions";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function StudentEventsPage() {
  const session = await requireAuth([Role.STUDENT]);

  const events = await prisma.event.findMany({
    orderBy: {
      date: "asc",
    },
    include: {
      registrations: {
        where: {
          userId: session.uid,
        },
      },
      bookmarks: {
        where: {
          userId: session.uid,
        },
      },
      _count: {
        select: {
          registrations: true,
        },
      },
    },
  });

  return (
    <div className="page-grid">
      <section className="section-card glass-panel">
        <h3>Campus Events</h3>
        <div className="cards-list">
          {events.length === 0 ? (
            <div className="cards-list-item">
              <p>No events available right now.</p>
            </div>
          ) : (
            events.map((event) => (
              <article className="cards-list-item" key={event.id}>
                <h4>{event.title}</h4>
                <p>{event.description}</p>
                <p>
                  {formatDate(event.date)} · {event.location}
                </p>
                <p>Organizer: {event.organizer}</p>
                <p>
                  Registrations: {event._count.registrations}
                  {event.capacity ? ` / ${event.capacity}` : ""}
                </p>
                <div className="cards-list cards-cols-2">
                  <form action={registerEventAction}>
                    <input name="eventId" type="hidden" value={event.id} />
                    <button className="button" type="submit">
                      {event.registrations.length ? "Update Registration" : "Register"}
                    </button>
                  </form>
                  <form action={bookmarkEventAction}>
                    <input name="eventId" type="hidden" value={event.id} />
                    <button className="button button-outline" type="submit">
                      {event.bookmarks.length ? "Bookmarked" : "Bookmark"}
                    </button>
                  </form>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
