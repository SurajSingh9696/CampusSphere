import { AttendanceStatus, Role } from "@prisma/client";
import { AreaTrendChart } from "@/components/charts";
import { requireAuth } from "@/lib/auth";
import { scanAttendanceAction } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { formatDate, toPercent } from "@/lib/utils";

export default async function StudentAttendancePage() {
  const session = await requireAuth([Role.STUDENT]);
  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.uid },
    include: {
      enrollments: {
        include: {
          subject: true,
        },
      },
    },
  });

  if (!student) {
    return <div className="section-card glass-panel">Student profile unavailable.</div>;
  }

  const records = await prisma.attendanceRecord.findMany({
    where: { studentProfileId: student.id },
    include: {
      session: {
        include: {
          subject: true,
        },
      },
    },
    orderBy: {
      session: {
        sessionDate: "desc",
      },
    },
  });

  const subjectWise = student.enrollments.map((enrollment) => {
    const subjectRecords = records.filter((record) => record.session.subjectId === enrollment.subjectId);
    const attended = subjectRecords.filter(
      (record) => record.status === AttendanceStatus.PRESENT || record.status === AttendanceStatus.LATE,
    ).length;
    const percentage = subjectRecords.length ? (attended / subjectRecords.length) * 100 : 0;
    return {
      subject: enrollment.subject.title,
      percentage,
      total: subjectRecords.length,
      attended,
    };
  });

  const trendData = records
    .slice(0, 8)
    .reverse()
    .map((record) => ({
      label: record.session.subject.code,
      value:
        record.status === AttendanceStatus.PRESENT
          ? 100
          : record.status === AttendanceStatus.LATE
            ? 75
            : 0,
    }));

  const alerts = subjectWise.filter((item) => item.percentage < 75);

  return (
    <div className="page-grid">
      <section className="page-grid page-grid-3">
        {subjectWise.length === 0 ? (
          <article className="section-card glass-panel">
            <h3>No subjects assigned</h3>
          </article>
        ) : (
          subjectWise.map((item) => (
            <article className="metric-card glass-panel" key={item.subject}>
              <p>{item.subject}</p>
              <h3>{toPercent(item.percentage)}</h3>
              <span className={item.percentage < 75 ? "tag tag-red" : "tag tag-green"}>
                {item.attended}/{item.total} sessions attended
              </span>
            </article>
          ))
        )}
      </section>

      <section className="page-grid page-grid-2">
        <AreaTrendChart data={trendData.length ? trendData : [{ label: "No Data", value: 0 }]} />
        <article className="section-card glass-panel">
          <h3>Attendance Alerts</h3>
          <div className="cards-list">
            {alerts.length === 0 ? (
              <div className="cards-list-item">
                <p>All subjects are above attendance threshold.</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div className="cards-list-item" key={alert.subject}>
                  <h4>{alert.subject}</h4>
                  <p>Current attendance: {toPercent(alert.percentage)}</p>
                  <span className="tag tag-red">Below 75%</span>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="section-card glass-panel">
        <h3>QR Attendance Check-In</h3>
        <form action={scanAttendanceAction} className="form-grid">
          <label>
            QR Token
            <input name="qrToken" placeholder="Paste session QR token" required />
          </label>
          <label>
            Latitude
            <input name="lat" placeholder="Optional for geofence" />
          </label>
          <label>
            Longitude
            <input name="lng" placeholder="Optional for geofence" />
          </label>
          <div className="form-grid-full">
            <button className="button" type="submit">
              Validate Attendance
            </button>
          </div>
        </form>
      </section>

      <section className="section-card glass-panel">
        <h3>Attendance History Calendar View</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject</th>
                <th>Method</th>
                <th>Status</th>
                <th>Marked At</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5}>No attendance records available.</td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id}>
                    <td>{formatDate(record.session.sessionDate)}</td>
                    <td>{record.session.subject.title}</td>
                    <td>{record.method ?? record.session.method}</td>
                    <td>
                      <span
                        className={
                          record.status === AttendanceStatus.ABSENT
                            ? "tag tag-red"
                            : record.status === AttendanceStatus.LATE
                              ? "tag tag-blue"
                              : "tag tag-green"
                        }
                      >
                        {record.status}
                      </span>
                    </td>
                    <td>{record.markedAt ? formatDate(record.markedAt) : "Pending"}</td>
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
