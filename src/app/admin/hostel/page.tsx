import { Role } from "@prisma/client";
import { allocateHostelRoomAction, createHostelRoomAction } from "@/lib/actions";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, titleCase } from "@/lib/utils";

export default async function AdminHostelPage() {
  await requireAuth([Role.ADMIN]);

  const [rooms, students, hostelComplaints, departments] = await Promise.all([
    prisma.hostelRoom.findMany({
      include: {
        department: true,
        allocations: {
          where: { isActive: true },
          include: {
            studentProfile: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [{ block: "asc" }, { roomNumber: "asc" }],
    }),
    prisma.studentProfile.findMany({
      include: {
        user: {
          select: {
            name: true,
          },
        },
        department: true,
      },
      orderBy: {
        rollNumber: "asc",
      },
      take: 50,
    }),
    prisma.complaint.findMany({
      where: {
        type: "HOSTEL",
      },
      include: {
        owner: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="page-grid">
      <section className="page-grid page-grid-2">
        <article className="section-card glass-panel">
          <h3>Create Hostel Room</h3>
          <form action={createHostelRoomAction} className="form-grid">
            <label>
              Block
              <input name="block" required />
            </label>
            <label>
              Room Number
              <input name="roomNumber" required />
            </label>
            <label>
              Capacity
              <input min={1} name="capacity" required type="number" />
            </label>
            <label>
              Department
              <select name="departmentId">
                <option value="">General</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-grid-full">
              <button className="button" type="submit">
                Add Room
              </button>
            </div>
          </form>
        </article>

        <article className="section-card glass-panel">
          <h3>Allocate Room</h3>
          <form action={allocateHostelRoomAction} className="form-grid">
            <label>
              Room
              <select name="roomId" required>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.block}-{room.roomNumber}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Student
              <select name="studentProfileId" required>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.rollNumber} · {student.user.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-grid-full">
              <button className="button button-alt" type="submit">
                Allocate
              </button>
            </div>
          </form>
        </article>
      </section>

      <section className="section-card glass-panel">
        <h3>Room Allocation Tracker</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Block</th>
                <th>Room</th>
                <th>Capacity</th>
                <th>Department</th>
                <th>Allocated Students</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td>{room.block}</td>
                  <td>{room.roomNumber}</td>
                  <td>{room.capacity}</td>
                  <td>{room.department?.name ?? "General"}</td>
                  <td>
                    {room.allocations.length === 0
                      ? "None"
                      : room.allocations
                          .map((allocation) => `${allocation.studentProfile.rollNumber} (${allocation.studentProfile.user.name})`)
                          .join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section-card glass-panel">
        <h3>Hostel Complaints</h3>
        <div className="cards-list">
          {hostelComplaints.map((complaint) => (
            <article className="cards-list-item" key={complaint.id}>
              <h4>{complaint.title}</h4>
              <p>{complaint.description}</p>
              <p>
                {complaint.owner.name} · {formatDate(complaint.createdAt)}
              </p>
              <span className="tag">{titleCase(complaint.status)}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
