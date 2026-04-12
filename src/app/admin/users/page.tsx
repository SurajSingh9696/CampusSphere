import { Role } from "@prisma/client";
import { createUserAction, removeUserAction, updateUserRoleAction } from "@/lib/actions";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  await requireAuth([Role.ADMIN]);

  const [users, departments] = await Promise.all([
    prisma.user.findMany({
      include: {
        studentProfile: {
          include: {
            department: true,
          },
        },
        facultyProfile: {
          include: {
            department: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 80,
    }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="page-grid">
      <section className="section-card glass-panel">
        <h3>Add User & Assign Role</h3>
        <form action={createUserAction} className="form-grid">
          <label>
            Full Name
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
            Role
            <select name="role" required>
              <option value={Role.STUDENT}>Student</option>
              <option value={Role.FACULTY}>Faculty</option>
              <option value={Role.ADMIN}>Admin</option>
              <option value={Role.COLLEGE}>College</option>
            </select>
          </label>
          <label>
            Department
            <select name="departmentId">
              <option value="">None</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Semester
            <input name="semester" type="number" />
          </label>
          <label>
            Roll Number
            <input name="rollNumber" />
          </label>
          <label>
            Section
            <input name="section" />
          </label>
          <label>
            Employee Code
            <input name="employeeCode" />
          </label>
          <label>
            Designation
            <input name="designation" />
          </label>
          <div className="form-grid-full">
            <button className="button" type="submit">
              Create User
            </button>
          </div>
        </form>
      </section>

      <section className="section-card glass-panel">
        <h3>User Directory</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Academic / Employee ID</th>
                <th>Change Role</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    {user.studentProfile?.department.name ?? user.facultyProfile?.department.name ?? "-"}
                  </td>
                  <td>{user.studentProfile?.rollNumber ?? user.facultyProfile?.employeeCode ?? "-"}</td>
                  <td>
                    <form action={updateUserRoleAction} className="cards-list cards-inline-2">
                      <input name="userId" type="hidden" value={user.id} />
                      <select aria-label="User role" defaultValue={user.role} name="role">
                        <option value={Role.STUDENT}>Student</option>
                        <option value={Role.FACULTY}>Faculty</option>
                        <option value={Role.ADMIN}>Admin</option>
                        <option value={Role.COLLEGE}>College</option>
                      </select>
                      <button className="button button-alt" type="submit">
                        Update
                      </button>
                    </form>
                  </td>
                  <td>
                    <form action={removeUserAction}>
                      <input name="userId" type="hidden" value={user.id} />
                      <button className="button button-danger" type="submit">
                        Remove
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
