import { Role } from "@prisma/client";
import {
  assignComplaintAction,
  resolveComplaintAction,
  respondComplaintAction,
} from "@/lib/actions";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, titleCase } from "@/lib/utils";

export default async function AdminComplaintsPage() {
  await requireAuth([Role.ADMIN]);

  const [complaints, assignees] = await Promise.all([
    prisma.complaint.findMany({
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            name: true,
          },
        },
        responses: {
          include: {
            author: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.user.findMany({
      where: {
        OR: [{ role: Role.ADMIN }, { role: Role.FACULTY }],
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="page-grid">
      <section className="section-card glass-panel">
        <h3>Complaint Management</h3>
        <div className="cards-list">
          {complaints.length === 0 ? (
            <div className="cards-list-item">
              <p>No complaints available.</p>
            </div>
          ) : (
            complaints.map((complaint) => (
              <article className="cards-list-item" key={complaint.id}>
                <h4>{complaint.title}</h4>
                <p>{complaint.description}</p>
                <p>
                  {complaint.owner.name} · {complaint.owner.email}
                </p>
                <p>{titleCase(complaint.type)}</p>
                <span
                  className={
                    complaint.status === "RESOLVED"
                      ? "tag tag-green"
                      : complaint.status === "IN_PROGRESS"
                        ? "tag tag-blue"
                        : "tag tag-red"
                  }
                >
                  {titleCase(complaint.status)}
                </span>
                <div className="form-grid">
                  <form action={assignComplaintAction}>
                    <input name="complaintId" type="hidden" value={complaint.id} />
                    <label>
                      Assign To
                      <select defaultValue={complaint.assignedToId ?? ""} name="assignedToId">
                        <option value="">Unassigned</option>
                        {assignees.map((assignee) => (
                          <option key={assignee.id} value={assignee.id}>
                            {assignee.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button className="button" type="submit">
                      Assign
                    </button>
                  </form>

                  <form action={respondComplaintAction}>
                    <input name="complaintId" type="hidden" value={complaint.id} />
                    <label>
                      Response
                      <textarea name="message" required />
                    </label>
                    <button className="button button-alt" type="submit">
                      Send Response
                    </button>
                  </form>

                  <form action={resolveComplaintAction}>
                    <input name="complaintId" type="hidden" value={complaint.id} />
                    <label>
                      Resolution Note
                      <textarea name="message" placeholder="Optional resolution context" />
                    </label>
                    <button className="button button-secondary" type="submit">
                      Mark Resolved
                    </button>
                  </form>
                </div>

                <div className="cards-list">
                  {complaint.responses.map((response) => (
                    <div className="cards-list-item" key={response.id}>
                      <h4>{response.author.name}</h4>
                      <p>{response.message}</p>
                      <span className="tag">{formatDate(response.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
