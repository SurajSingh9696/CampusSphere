import Link from "next/link";
import { Role } from "@prisma/client";
import { AreaTrendChart, BarUsageChart } from "@/components/charts";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function FacultyDashboardPage() {
  const session = await requireAuth([Role.FACULTY]);
  const faculty = await prisma.facultyProfile.findUnique({
    where: { userId: session.uid },
    include: {
      department: true,
      subjects: {
        include: {
          subject: true,
        },
      },
    },
  });

  if (!faculty) {
    return <div className="section-card glass-panel">Faculty profile not found.</div>;
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [todaysSessions, recentSessions, announcements, recentEvents] = await Promise.all([
    prisma.attendanceSession.findMany({
      where: {
        facultyProfileId: faculty.id,
        sessionDate: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      include: {
        subject: true,
      },
      orderBy: {
        startTime: "asc",
      },
    }),
    prisma.attendanceSession.findMany({
      where: {
        facultyProfileId: faculty.id,
      },
      include: {
        records: true,
      },
      orderBy: {
        sessionDate: "desc",
      },
      take: 8,
    }),
    prisma.notice.findMany({
      where: { createdById: session.uid },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.event.findMany({
      where: { createdById: session.uid },
      orderBy: { date: "desc" },
      take: 6,
      include: {
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    }),
  ]);

  const attendanceSummary = recentSessions.reduce(
    (acc, item) => {
      const present = item.records.filter((record) => record.status !== "ABSENT").length;
      acc.total += item.records.length;
      acc.present += present;
      return acc;
    },
    { total: 0, present: 0 },
  );

  const attendanceRate = attendanceSummary.total
    ? Math.round((attendanceSummary.present / attendanceSummary.total) * 100)
    : 0;

  const trendData = recentSessions
    .slice(0, 6)
    .reverse()
    .map((item) => {
      const present = item.records.filter((record) => record.status !== "ABSENT").length;
      const percentage = item.records.length ? Math.round((present / item.records.length) * 100) : 0;
      return {
        label: `${item.sessionDate.getDate()}/${item.sessionDate.getMonth() + 1}`,
        value: percentage,
      };
    });

  const classLoadData = faculty.subjects.map((entry) => ({
    label: entry.subject.code,
    value: recentSessions.filter((item) => item.subjectId === entry.subjectId).length,
  }));

  return (
    <div className="page-grid">
      <section className="page-grid page-grid-3">
        <article className="metric-card glass-panel">
          <p>Today&apos;s Classes</p>
          <h3>{todaysSessions.length}</h3>
          <span className="tag">Department: {faculty.department.name}</span>
        </article>
        <article className="metric-card glass-panel">
          <p>Attendance Summary</p>
          <h3>{attendanceRate}%</h3>
          <span className="tag tag-blue">Recent session present ratio</span>
        </article>
        <article className="metric-card glass-panel">
          <p>Announcements Posted</p>
          <h3>{announcements.length}</h3>
          <span className="tag tag-green">Latest updates live</span>
        </article>
      </section>

      <section className="page-grid page-grid-2">
        <AreaTrendChart data={trendData.length ? trendData : [{ label: "No Data", value: 0 }]} />
        <BarUsageChart data={classLoadData.length ? classLoadData : [{ label: "No Class", value: 0 }]} />
      </section>

      <section className="page-grid page-grid-3">
        <article className="section-card glass-panel">
          <h3>Today&apos;s Classes</h3>
          <div className="cards-list">
            {todaysSessions.length === 0 ? (
              <div className="cards-list-item">
                <p>No sessions today.</p>
              </div>
            ) : (
              todaysSessions.map((item) => (
                <div className="cards-list-item" key={item.id}>
                  <h4>{item.subject.title}</h4>
                  <p>
                    {formatDate(item.startTime)} - {formatDate(item.endTime)}
                  </p>
                  <span className={item.isActive ? "tag tag-green" : "tag tag-blue"}>
                    {item.isActive ? "Active" : "Scheduled"}
                  </span>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="section-card glass-panel">
          <h3>Recent Announcements</h3>
          <div className="cards-list">
            {announcements.map((notice) => (
              <div className="cards-list-item" key={notice.id}>
                <h4>{notice.title}</h4>
                <p>{notice.content}</p>
                <span className="tag">{notice.category}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="section-card glass-panel">
          <h3>Quick Actions</h3>
          <div className="cards-list">
            <Link className="button" href="/faculty/attendance">
              Manage Attendance
            </Link>
            <Link className="button button-alt" href="/faculty/resources">
              Upload Resources
            </Link>
            <Link className="button button-secondary" href="/faculty/announcements">
              Post Announcement
            </Link>
            <Link className="button button-outline" href="/faculty/events">
              Create Event
            </Link>
          </div>
          <h4>Events Created</h4>
          <div className="cards-list">
            {recentEvents.map((event) => (
              <div className="cards-list-item" key={event.id}>
                <h4>{event.title}</h4>
                <p>{formatDate(event.date)}</p>
                <span className="tag">{event._count.registrations} registrations</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
