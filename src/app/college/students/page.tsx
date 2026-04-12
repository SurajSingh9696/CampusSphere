import { Role } from "@prisma/client";
import { createStudentAction } from "@/lib/actions";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CollegeStudentsPage() {
  await requireAuth([Role.COLLEGE]);

  const [departments, students] = await Promise.all([
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.studentProfile.findMany({
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
      take: 120,
    }),
  ]);

  return (
    <div className="page-grid">
      <section className="section-card glass-panel">
        <h3>Add Student</h3>
        <form action={createStudentAction} className="form-grid">
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
            Roll Number
            <input name="rollNumber" required />
          </label>
          <label>
            Semester
            <input min={1} name="semester" required type="number" />
          </label>
          <label>
            Section
            <input name="section" />
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
              Create Student Account
            </button>
          </div>
        </form>
      </section>

      <section className="section-card glass-panel">
        <h3>Student Directory</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Roll Number</th>
                <th>Semester</th>
                <th>Section</th>
                <th>Department</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.user.name}</td>
                  <td>{student.user.email}</td>
                  <td>{student.rollNumber}</td>
                  <td>{student.semester}</td>
                  <td>{student.section ?? "-"}</td>
                  <td>{student.department.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
