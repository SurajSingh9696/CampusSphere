import Link from "next/link";
import { Role } from "@prisma/client";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

type SearchPageProps = {
  searchParams: Promise<{
    query?: string;
    type?: "all" | "resources" | "students" | "events" | "notes";
  }>;
};

export default async function GlobalSearchPage({ searchParams }: SearchPageProps) {
  const session = await requireAuth([Role.STUDENT, Role.FACULTY, Role.ADMIN, Role.COLLEGE]);
  const params = await searchParams;
  const query = params.query?.trim() ?? "";
  const type = params.type ?? "all";

  const shouldSearch = query.length > 1;

  const [resources, students, events, notes] = shouldSearch
    ? await Promise.all([
        type === "all" || type === "resources"
          ? prisma.resource.findMany({
              where: {
                OR: [{ title: { contains: query } }, { description: { contains: query } }],
                ...(session.role === Role.STUDENT ? { approved: true } : {}),
              },
              include: {
                subject: true,
                department: true,
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 12,
            })
          : [],
        type === "all" || type === "students"
          ? prisma.user.findMany({
              where: {
                role: Role.STUDENT,
                OR: [{ name: { contains: query } }, { email: { contains: query } }],
              },
              include: {
                studentProfile: {
                  include: {
                    department: true,
                  },
                },
              },
              take: 12,
            })
          : [],
        type === "all" || type === "events"
          ? prisma.event.findMany({
              where: {
                OR: [{ title: { contains: query } }, { description: { contains: query } }],
              },
              include: {
                _count: {
                  select: {
                    registrations: true,
                  },
                },
              },
              orderBy: {
                date: "asc",
              },
              take: 12,
            })
          : [],
        type === "all" || type === "notes"
          ? prisma.sharedNote.findMany({
              where: {
                OR: [{ title: { contains: query } }, { description: { contains: query } }],
              },
              include: {
                uploader: {
                  select: {
                    name: true,
                  },
                },
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 12,
            })
          : [],
      ])
    : [[], [], [], []];

  return (
    <div className="page-shell">
      <section className="section-card glass-panel">
        <h3>Global Search</h3>
        <form action="/search" className="form-grid" method="GET">
          <label>
            Search Query
            <input defaultValue={query} name="query" placeholder="Search resources, students, events, notes" />
          </label>
          <label>
            Filter Type
            <select defaultValue={type} name="type">
              <option value="all">All</option>
              <option value="resources">Resources</option>
              <option value="students">Students</option>
              <option value="events">Events</option>
              <option value="notes">Notes</option>
            </select>
          </label>
          <div className="form-grid-full">
            <button className="button" type="submit">
              Search
            </button>
          </div>
        </form>
      </section>

      {!shouldSearch ? (
        <section className="section-card glass-panel">
          <p>Enter at least 2 characters to start searching.</p>
        </section>
      ) : (
        <>
          <section className="section-card glass-panel">
            <h3>Resources ({resources.length})</h3>
            <div className="cards-list">
              {resources.map((resource) => (
                <article className="cards-list-item" key={resource.id}>
                  <h4>{resource.title}</h4>
                  <p>{resource.description}</p>
                  <p>
                    {resource.subject?.title ?? "General"} · {resource.department?.name ?? "General"}
                  </p>
                  <Link className="button button-alt" href={resource.fileUrl} target="_blank">
                    Open
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <section className="section-card glass-panel">
            <h3>Students ({students.length})</h3>
            <div className="cards-list">
              {students.map((student) => (
                <article className="cards-list-item" key={student.id}>
                  <h4>{student.name}</h4>
                  <p>{student.email}</p>
                  <p>
                    {student.studentProfile?.rollNumber ?? "-"} · {student.studentProfile?.department.name ?? "-"}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="section-card glass-panel">
            <h3>Events ({events.length})</h3>
            <div className="cards-list">
              {events.map((event) => (
                <article className="cards-list-item" key={event.id}>
                  <h4>{event.title}</h4>
                  <p>{event.description}</p>
                  <p>
                    {formatDate(event.date)} · Registrations: {event._count.registrations}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="section-card glass-panel">
            <h3>Shared Notes ({notes.length})</h3>
            <div className="cards-list">
              {notes.map((note) => (
                <article className="cards-list-item" key={note.id}>
                  <h4>{note.title}</h4>
                  <p>{note.description}</p>
                  <p>{note.uploader.name}</p>
                  <Link className="button button-outline" href={note.fileUrl} target="_blank">
                    Open
                  </Link>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
