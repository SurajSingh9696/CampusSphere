import { Role } from "@prisma/client";
import { uploadResourceAction } from "@/lib/actions";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resourceCategories } from "@/lib/constants";
import { formatDate, titleCase } from "@/lib/utils";

export default async function FacultyResourcesPage() {
  const session = await requireAuth([Role.FACULTY]);
  const faculty = await prisma.facultyProfile.findUnique({
    where: { userId: session.uid },
    include: {
      subjects: {
        include: {
          subject: true,
        },
      },
      department: true,
    },
  });

  if (!faculty) {
    return <div className="section-card glass-panel">Faculty profile not found.</div>;
  }

  const uploads = await prisma.resource.findMany({
    where: {
      uploaderId: session.uid,
    },
    include: {
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
        <h3>Resource Upload</h3>
        <form action={uploadResourceAction} className="form-grid">
          <label>
            Title
            <input name="title" required />
          </label>
          <label>
            Category
            <select name="category" required>
              {resourceCategories.map((category) => (
                <option key={category} value={category}>
                  {titleCase(category)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Subject
            <select name="subjectId">
              <option value="">General</option>
              {faculty.subjects.map((subject) => (
                <option key={subject.subjectId} value={subject.subjectId}>
                  {subject.subject.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Semester
            <input name="semester" type="number" />
          </label>
          <label>
            Department
            <input defaultValue={faculty.department.id} name="departmentId" />
          </label>
          <label>
            File URL
            <input name="fileUrl" required type="url" />
          </label>
          <label className="form-grid-full">
            Description
            <textarea name="description" required />
          </label>
          <div className="form-grid-full">
            <button className="button" type="submit">
              Upload Resource
            </button>
          </div>
        </form>
      </section>

      <section className="section-card glass-panel">
        <h3>Your Uploads</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Subject</th>
                <th>Department</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {uploads.length === 0 ? (
                <tr>
                  <td colSpan={6}>No uploads yet.</td>
                </tr>
              ) : (
                uploads.map((upload) => (
                  <tr key={upload.id}>
                    <td>{upload.title}</td>
                    <td>{titleCase(upload.category)}</td>
                    <td>{upload.subject?.title ?? "General"}</td>
                    <td>{upload.department?.name ?? "General"}</td>
                    <td>
                      <span className={upload.approved ? "tag tag-green" : "tag tag-red"}>
                        {upload.approved ? "Approved" : "Pending approval"}
                      </span>
                    </td>
                    <td>{formatDate(upload.createdAt)}</td>
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
