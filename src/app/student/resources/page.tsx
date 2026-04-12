import Link from "next/link";
import { Role } from "@prisma/client";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, titleCase } from "@/lib/utils";

type ResourcePageProps = {
  searchParams: Promise<{
    query?: string;
    subjectId?: string;
    semester?: string;
    departmentId?: string;
  }>;
};

export default async function StudentResourcesPage({ searchParams }: ResourcePageProps) {
  const session = await requireAuth([Role.STUDENT]);
  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.uid },
    include: {
      department: true,
      enrollments: {
        include: {
          subject: true,
        },
      },
    },
  });

  if (!student) {
    return <div className="section-card glass-panel">Student profile not available.</div>;
  }

  const filters = await searchParams;

  const resources = await prisma.resource.findMany({
    where: {
      approved: true,
      title: filters.query
        ? {
            contains: filters.query,
          }
        : undefined,
      subjectId: filters.subjectId || undefined,
      semester: filters.semester ? Number(filters.semester) : undefined,
      departmentId: filters.departmentId || undefined,
      OR: [{ departmentId: student.departmentId }, { semester: student.semester }, { subjectId: null }],
    },
    include: {
      subject: true,
      department: true,
      uploader: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const departments = await prisma.department.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="page-grid">
      <section className="section-card glass-panel">
        <h3>Resource Library</h3>
        <form action="/student/resources" className="form-grid" method="GET">
          <label>
            Search
            <input defaultValue={filters.query} name="query" placeholder="Search notes, assignments, material" />
          </label>
          <label>
            Subject
            <select defaultValue={filters.subjectId ?? ""} name="subjectId">
              <option value="">All subjects</option>
              {student.enrollments.map((item) => (
                <option key={item.subjectId} value={item.subjectId}>
                  {item.subject.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Semester
            <select defaultValue={filters.semester ?? ""} name="semester">
              <option value="">All semesters</option>
              {Array.from({ length: 8 }).map((_, index) => (
                <option key={index + 1} value={index + 1}>
                  Semester {index + 1}
                </option>
              ))}
            </select>
          </label>
          <label>
            Department
            <select defaultValue={filters.departmentId ?? ""} name="departmentId">
              <option value="">All departments</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </label>
          <div className="form-grid-full">
            <button className="button" type="submit">
              Apply Filters
            </button>
          </div>
        </form>
      </section>

      <section className="section-card glass-panel">
        <h3>Available Resources</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Subject</th>
                <th>Semester</th>
                <th>Department</th>
                <th>Uploaded By</th>
                <th>Date</th>
                <th>Access</th>
              </tr>
            </thead>
            <tbody>
              {resources.length === 0 ? (
                <tr>
                  <td colSpan={8}>No resources matched your filter.</td>
                </tr>
              ) : (
                resources.map((resource) => (
                  <tr key={resource.id}>
                    <td>{resource.title}</td>
                    <td>{titleCase(resource.category)}</td>
                    <td>{resource.subject?.title ?? "General"}</td>
                    <td>{resource.semester ?? "All"}</td>
                    <td>{resource.department?.name ?? "General"}</td>
                    <td>{resource.uploader.name}</td>
                    <td>{formatDate(resource.createdAt)}</td>
                    <td>
                      <Link className="button button-alt" href={resource.fileUrl} target="_blank">
                        Open / Download
                      </Link>
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
