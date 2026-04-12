import { Role } from "@prisma/client";
import { createEventAction } from "@/lib/actions";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function FacultyEventsPage() {
  const session = await requireAuth([Role.FACULTY]);

  const faculty = await prisma.facultyProfile.findUnique({
    where: { userId: session.uid },
    include: {
      department: true,
    },
  });

  if (!faculty) {
    return <div className="section-card glass-panel">Faculty profile unavailable.</div>;
  }

  const events = await prisma.event.findMany({
    where: {
      createdById: session.uid,
    },
    include: {
      registrations: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  return (
    <div className="page-grid">
      <section className="section-card glass-panel">
        <h3>Create Event</h3>
        <form action={createEventAction} className="form-grid">
          <label>
            Event Title
            <input name="title" required />
          </label>
          <label>
            Event Date
            <input name="date" required type="datetime-local" />
          </label>
          <label>
            Location
            <input name="location" required />
          </label>
          <label>
            Organizer
            <input defaultValue={faculty.department.name} name="organizer" required />
          </label>
          <label>
            Capacity
            <input name="capacity" type="number" />
          </label>
          <label>
            Poster URL
            <input name="posterUrl" type="url" />
          </label>
          <input name="departmentId" type="hidden" value={faculty.departmentId} />
          <label className="form-grid-full">
            Event Details
            <textarea name="description" required />
          </label>
          <div className="form-grid-full">
            <button className="button" type="submit">
              Publish Event
            </button>
          </div>
        </form>
      </section>

      <section className="section-card glass-panel">
        <h3>Your Events</h3>
        <div className="cards-list">
          {events.length === 0 ? (
            <div className="cards-list-item">
              <p>No events created yet.</p>
            </div>
          ) : (
            events.map((event) => (
              <article className="cards-list-item" key={event.id}>
                <h4>{event.title}</h4>
                <p>{event.description}</p>
                <p>
                  {formatDate(event.date)} · {event.location}
                </p>
                <span className="tag">{event.registrations.length} registrations</span>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {event.registrations.length === 0 ? (
                        <tr>
                          <td colSpan={3}>No registrations yet.</td>
                        </tr>
                      ) : (
                        event.registrations.map((registration) => (
                          <tr key={registration.id}>
                            <td>{registration.user.name}</td>
                            <td>{registration.user.email}</td>
                            <td>{registration.status}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
