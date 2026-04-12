import { Role } from "@prisma/client";
import { AreaTrendChart, BarUsageChart, PieDistributionChart } from "@/components/charts";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CollegeAnalyticsPage() {
  await requireAuth([Role.COLLEGE]);

  const [subjects, resources, eventParticipation] = await Promise.all([
    prisma.subject.findMany({
      include: {
        attendanceSessions: {
          include: {
            records: true,
          },
        },
      },
      orderBy: {
        code: "asc",
      },
    }),
    prisma.resource.groupBy({ by: ["category"], _count: { category: true } }),
    prisma.event.findMany({
      include: {
        registrations: true,
      },
      orderBy: { date: "desc" },
      take: 8,
    }),
  ]);

  const attendanceAnalytics = subjects.map((subject) => {
    const allRecords = subject.attendanceSessions.flatMap((session) => session.records);
    const attended = allRecords.filter((record) => record.status !== "ABSENT").length;
    const percentage = allRecords.length ? Math.round((attended / allRecords.length) * 100) : 0;
    return {
      label: subject.code,
      value: percentage,
    };
  });

  const resourceAnalytics = resources.map((entry) => ({
    label: entry.category,
    value: entry._count.category,
  }));

  const participationAnalytics = eventParticipation.map((event) => ({
    label: event.title.length > 18 ? `${event.title.slice(0, 18)}...` : event.title,
    value: event.registrations.length,
  }));

  return (
    <div className="page-grid">
      <section className="page-grid page-grid-2">
        <AreaTrendChart
          data={attendanceAnalytics.length ? attendanceAnalytics : [{ label: "No Subject", value: 0 }]}
        />
        <BarUsageChart
          data={resourceAnalytics.length ? resourceAnalytics : [{ label: "No Resource", value: 0 }]}
        />
      </section>

      <section className="page-grid page-grid-2">
        <PieDistributionChart
          data={participationAnalytics.length ? participationAnalytics : [{ label: "No Event", value: 0 }]}
        />
        <article className="section-card glass-panel">
          <h3>Event Participation Detail</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Participants</th>
                </tr>
              </thead>
              <tbody>
                {eventParticipation.map((event) => (
                  <tr key={event.id}>
                    <td>{event.title}</td>
                    <td>{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(event.date)}</td>
                    <td>{event.registrations.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
}
