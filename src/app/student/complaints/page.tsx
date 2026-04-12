import { Role } from "@prisma/client";
import { complaintTypes } from "@/lib/constants";
import { submitComplaintAction } from "@/lib/actions";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, titleCase } from "@/lib/utils";

export default async function StudentComplaintsPage() {
  const session = await requireAuth([Role.STUDENT, Role.FACULTY]);

  const complaints = await prisma.complaint.findMany({
    where: {
      ownerId: session.uid,
    },
    include: {
      responses: {
        include: {
          author: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="page-grid">
      <section className="section-card glass-panel">
        <h3>Submit Complaint</h3>
        <form action={submitComplaintAction} className="form-grid">
          <label>
            Complaint Type
            <select name="type" required>
              {complaintTypes.map((type) => (
                <option key={type} value={type}>
                  {titleCase(type)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Title
            <input name="title" required />
          </label>
          <label className="form-grid-full">
            Details
            <textarea name="description" required />
          </label>
          <div className="form-grid-full">
            <button className="button" type="submit">
              Submit Complaint
            </button>
          </div>
        </form>
      </section>

      <section className="section-card glass-panel">
        <h3>Complaint Tracker</h3>
        <div className="cards-list">
          {complaints.length === 0 ? (
            <div className="cards-list-item">
              <p>No complaints submitted yet.</p>
            </div>
          ) : (
            complaints.map((complaint) => (
              <article className="cards-list-item" key={complaint.id}>
                <h4>{complaint.title}</h4>
                <p>{complaint.description}</p>
                <p>{titleCase(complaint.type)}</p>
                <p>{formatDate(complaint.createdAt)}</p>
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
