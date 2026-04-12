import { Role } from "@prisma/client";
import { createDepartmentAction } from "@/lib/actions";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CollegeDepartmentsPage() {
  await requireAuth([Role.COLLEGE]);

  const departments = await prisma.department.findMany({
    include: {
      _count: {
        select: {
          students: true,
          faculty: true,
          subjects: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="page-grid">
      <section className="section-card glass-panel">
        <h3>Create Department</h3>
        <form action={createDepartmentAction} className="form-grid">
          <label>
            Department Name
            <input name="name" required />
          </label>
          <label>
            Department Code
            <input name="code" required />
          </label>
          <div className="form-grid-full">
            <button className="button" type="submit">
              Add Department
            </button>
          </div>
        </form>
      </section>

      <section className="section-card glass-panel">
        <h3>Department Directory</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Students</th>
                <th>Faculty</th>
                <th>Subjects</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((department) => (
                <tr key={department.id}>
                  <td>{department.name}</td>
                  <td>{department.code}</td>
                  <td>{department._count.students}</td>
                  <td>{department._count.faculty}</td>
                  <td>{department._count.subjects}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
