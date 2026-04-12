import { Role } from "@prisma/client";
import { approveResourceAction, removeResourceAction } from "@/lib/actions";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, titleCase } from "@/lib/utils";

export default async function AdminResourcesPage() {
  await requireAuth([Role.ADMIN]);

  const resources = await prisma.resource.findMany({
    include: {
      uploader: {
        select: {
          name: true,
          email: true,
        },
      },
      subject: true,
      department: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="page-grid">
      <section className="section-card glass-panel">
        <h3>Resource Monitoring & Approval</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Uploader</th>
                <th>Subject</th>
                <th>Department</th>
                <th>Semester</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.length === 0 ? (
                <tr>
                  <td colSpan={9}>No resources uploaded yet.</td>
                </tr>
              ) : (
                resources.map((resource) => (
                  <tr key={resource.id}>
                    <td>{resource.title}</td>
                    <td>{titleCase(resource.category)}</td>
                    <td>
                      {resource.uploader.name}
                      <br />
                      {resource.uploader.email}
                    </td>
                    <td>{resource.subject?.title ?? "General"}</td>
                    <td>{resource.department?.name ?? "General"}</td>
                    <td>{resource.semester ?? "All"}</td>
                    <td>
                      <span className={resource.approved ? "tag tag-green" : "tag tag-red"}>
                        {resource.approved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td>{formatDate(resource.createdAt)}</td>
                    <td>
                      <div className="cards-list cards-cols-2">
                        <form action={approveResourceAction}>
                          <input name="resourceId" type="hidden" value={resource.id} />
                          <button className="button button-secondary" type="submit">
                            Approve
                          </button>
                        </form>
                        <form action={removeResourceAction}>
                          <input name="resourceId" type="hidden" value={resource.id} />
                          <button className="button button-danger" type="submit">
                            Remove
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
