import Link from "next/link";
import { AttendanceStatus, Role } from "@prisma/client";
import {
  createAttendanceSessionAction,
  markAttendanceAction,
  toggleAttendanceWindowAction,
} from "@/lib/actions";
import { attendanceMethods } from "@/lib/constants";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function FacultyAttendancePage() {
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
    return <div className="section-card glass-panel">Faculty profile missing.</div>;
  }

  const sessions = await prisma.attendanceSession.findMany({
    where: {
      facultyProfileId: faculty.id,
    },
    include: {
      subject: true,
      records: {
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
    orderBy: {
      sessionDate: "desc",
    },
    take: 10,
  });

  return (
    <div className="page-grid">
      <section className="section-card glass-panel">
        <h3>Create Attendance Session</h3>
        <form action={createAttendanceSessionAction} className="form-grid">
          <label>
            Subject
            <select name="subjectId" required>
              {faculty.subjects.map((subject) => (
                <option key={subject.subjectId} value={subject.subjectId}>
                  {subject.subject.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Attendance Method
            <select name="method" required>
              {attendanceMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </label>
          <label>
            Session Date
            <input name="sessionDate" required type="date" />
          </label>
          <label>
            Start Time
            <input name="startTime" required type="datetime-local" />
          </label>
          <label>
            End Time
            <input name="endTime" required type="datetime-local" />
          </label>
          <label>
            Geo Latitude
            <input name="geoLat" placeholder="Optional for geofence" />
          </label>
          <label>
            Geo Longitude
            <input name="geoLng" placeholder="Optional for geofence" />
          </label>
          <label>
            Radius (meters)
            <input name="radiusMeters" placeholder="Optional for geofence" />
          </label>
          <div className="form-grid-full">
            <button className="button" type="submit">
              Create Session
            </button>
          </div>
        </form>
      </section>

      <section className="section-card glass-panel">
        <h3>Attendance Sessions</h3>
        <div className="cards-list">
          {sessions.length === 0 ? (
            <div className="cards-list-item">
              <p>No attendance sessions found.</p>
            </div>
          ) : (
            sessions.map((attendanceSession) => (
              <article className="cards-list-item" key={attendanceSession.id}>
                <h4>{attendanceSession.subject.title}</h4>
                <p>
                  {formatDate(attendanceSession.startTime)} - {formatDate(attendanceSession.endTime)}
                </p>
                <p>Method: {attendanceSession.method}</p>
                {attendanceSession.qrToken ? (
                  <p>
                    QR Token: <strong>{attendanceSession.qrToken}</strong>
                  </p>
                ) : null}
                <div className="cards-list cards-cols-3">
                  <form action={toggleAttendanceWindowAction}>
                    <input name="attendanceSessionId" type="hidden" value={attendanceSession.id} />
                    <input name="open" type="hidden" value={attendanceSession.isActive ? "false" : "true"} />
                    <button className="button" type="submit">
                      {attendanceSession.isActive ? "End Session" : "Start Session"}
                    </button>
                  </form>
                  <Link className="button button-outline" href={`/api/attendance/${attendanceSession.id}/export`}>
                    Export CSV
                  </Link>
                  <span className={attendanceSession.isActive ? "tag tag-green" : "tag tag-blue"}>
                    {attendanceSession.isActive ? "Live" : "Closed"}
                  </span>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Update</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceSession.records.map((record) => (
                        <tr key={record.id}>
                          <td>{record.studentProfile.user.name}</td>
                          <td>{record.studentProfile.user.email}</td>
                          <td>{record.status}</td>
                          <td>
                            <form action={markAttendanceAction} className="cards-list cards-inline-2">
                              <input name="attendanceRecordId" type="hidden" value={record.id} />
                              <select aria-label="Attendance status" defaultValue={record.status} name="status">
                                <option value={AttendanceStatus.PRESENT}>Present</option>
                                <option value={AttendanceStatus.ABSENT}>Absent</option>
                                <option value={AttendanceStatus.LATE}>Late</option>
                              </select>
                              <button className="button button-alt" type="submit">
                                Save
                              </button>
                            </form>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
