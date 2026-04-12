import Link from "next/link";
import { AttendanceStatus, Role } from "@prisma/client";
import { AreaTrendChart, BarUsageChart } from "@/components/charts";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateOnly, toPercent } from "@/lib/utils";

export default async function StudentDashboardPage() {
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
    return <div className="section-card glass-panel">Student profile not found.</div>;
  }

  const attendanceRecords = await prisma.attendanceRecord.findMany({
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

  const events = await prisma.event.findMany({
    where: {
      date: {
        gte: new Date(),
      },
    },
    orderBy: {
      date: "asc",
    },
    take: 4,
  });

  const notices = await prisma.notice.findMany({
    where: {
      OR: [{ targetRole: Role.STUDENT }, { targetRole: null }],
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 4,
  });

  const resources = await prisma.resource.findMany({
    where: {
      approved: true,
      OR: [
        { departmentId: student.departmentId },
        {
          semester: student.semester,
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 4,
  });

  const totalRecords = attendanceRecords.length;
  const presentRecords = attendanceRecords.filter(
    (record) => record.status === AttendanceStatus.PRESENT || record.status === AttendanceStatus.LATE,
  ).length;
  const attendancePercent = totalRecords ? (presentRecords / totalRecords) * 100 : 0;

  const subjectStats = student.enrollments.map((enrollment) => {
    const records = attendanceRecords.filter((record) => record.session.subjectId === enrollment.subjectId);
    const attended = records.filter(
      (record) => record.status === AttendanceStatus.PRESENT || record.status === AttendanceStatus.LATE,
    ).length;
    const percentage = records.length ? (attended / records.length) * 100 : 0;
    return {
      subject: enrollment.subject.title,
      percentage,
    };
  });

  const attendanceTrend = attendanceRecords
    .slice(0, 6)
    .reverse()
    .map((record) => ({
      label: formatDateOnly(record.session.sessionDate),
      value:
        record.status === AttendanceStatus.PRESENT
          ? 100
          : record.status === AttendanceStatus.LATE
            ? 75
            : 0,
    }));

  const subjectAttendanceBars = subjectStats.map((item) => ({
    label: item.subject,
    value: Math.round(item.percentage),
  }));

  return (
    <div className="page-grid">
      <section className="page-grid page-grid-3">
        <article className="metric-card glass-panel">
          <p>Attendance Overview</p>
          <h3>{toPercent(attendancePercent)}</h3>
          <span className={attendancePercent < 75 ? "tag tag-red" : "tag tag-green"}>
            {attendancePercent < 75 ? "Below required threshold" : "On track"}
          </span>
        </article>
        <article className="metric-card glass-panel">
          <p>Upcoming Events</p>
          <h3>{events.length}</h3>
          <span className="tag tag-blue">Registrations open</span>
        </article>
        <article className="metric-card glass-panel">
          <p>Resource Access</p>
          <h3>{resources.length}</h3>
          <span className="tag">Latest department uploads</span>
        </article>
      </section>

      <section className="page-grid page-grid-2">
        <AreaTrendChart data={attendanceTrend.length ? attendanceTrend : [{ label: "No Data", value: 0 }]} />
        <BarUsageChart
          data={subjectAttendanceBars.length ? subjectAttendanceBars : [{ label: "No Subject", value: 0 }]}
        />
      </section>

      <section className="page-grid page-grid-3">
        <article className="section-card glass-panel">
          <h3>Recent Notices</h3>
          <div className="cards-list">
            {notices.length === 0 ? (
              <p>No notices yet.</p>
            ) : (
              notices.map((notice) => (
                <div className="cards-list-item" key={notice.id}>
                  <h4>{notice.title}</h4>
                  <p>{notice.content}</p>
                  <span className="tag">{notice.category}</span>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="section-card glass-panel">
          <h3>Upcoming Events</h3>
          <div className="cards-list">
            {events.length === 0 ? (
              <p>No upcoming events.</p>
            ) : (
              events.map((event) => (
                <div className="cards-list-item" key={event.id}>
                  <h4>{event.title}</h4>
                  <p>
                    {formatDateOnly(event.date)} · {event.location}
                  </p>
                  <span className="tag">{event.organizer}</span>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="section-card glass-panel">
          <h3>Quick Actions</h3>
          <div className="cards-list">
            <Link className="button" href="/student/attendance">
              Track Attendance
            </Link>
            <Link className="button button-alt" href="/student/resources">
              Browse Resources
            </Link>
            <Link className="button button-secondary" href="/student/events">
              Register Events
            </Link>
            <Link className="button button-outline" href="/student/complaints">
              Raise Complaint
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
