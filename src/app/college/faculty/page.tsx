import { Role } from "@prisma/client";
import { createFacultyAction } from "@/lib/actions";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CollegeFacultyPage() {
  await requireAuth([Role.COLLEGE]);

  const [departments, facultyUsers] = await Promise.all([
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.facultyProfile.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        department: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return (
    <div className="page-grid">
      <section className="section-card glass-panel">
        <h3>Add Faculty</h3>
        <form action={createFacultyAction} className="form-grid">
          <label>
            Name
            <input name="name" required />
          </label>
          <label>
            Email
            <input name="email" required type="email" />
          </label>
          <label>
            Password
            <input name="password" required type="password" />
          </label>
          <label>
            Employee Code
            <input name="employeeCode" required />
          </label>
          <label>
            Designation
            <input name="designation" required />
          </label>
          <label>
            Department
            <select name="departmentId" required>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </label>
          <div className="form-grid-full">
            <button className="button" type="submit">
              Create Faculty Account
            </button>
          </div>
        </form>
      </section>

      <section className="section-card glass-panel">
        <h3>Faculty Directory</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Employee Code</th>
                <th>Designation</th>
                <th>Department</th>
              </tr>
            </thead>
            <tbody>
              {facultyUsers.map((faculty) => (
                <tr key={faculty.id}>
                  <td>{faculty.user.name}</td>
                  <td>{faculty.user.email}</td>
                  <td>{faculty.employeeCode}</td>
                  <td>{faculty.designation}</td>
                  <td>{faculty.department.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
