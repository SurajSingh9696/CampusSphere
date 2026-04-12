import Link from "next/link";
import { Role } from "@prisma/client";
import { AreaTrendChart, BarUsageChart, PieDistributionChart } from "@/components/charts";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CollegeDashboardPage() {
  await requireAuth([Role.COLLEGE]);

  const [departmentCount, facultyCount, studentCount, attendanceData, resourceByDept, eventByDept] =
    await Promise.all([
      prisma.department.count(),
      prisma.user.count({ where: { role: Role.FACULTY } }),
      prisma.user.count({ where: { role: Role.STUDENT } }),
      prisma.department.findMany({
        include: {
          subjects: {
            include: {
              attendanceSessions: {
                include: {
                  records: true,
                },
              },
            },
          },
        },
      }),
      prisma.resource.groupBy({ by: ["departmentId"], _count: { departmentId: true } }),
      prisma.event.groupBy({ by: ["departmentId"], _count: { departmentId: true } }),
    ]);

  const attendanceChart = attendanceData.map((department) => {
    const allRecords = department.subjects.flatMap((subject) =>
      subject.attendanceSessions.flatMap((session) => session.records),
    );
    const present = allRecords.filter((record) => record.status !== "ABSENT").length;
    const percentage = allRecords.length ? Math.round((present / allRecords.length) * 100) : 0;
    return {
      label: department.code,
      value: percentage,
    };
  });

  const departments = await prisma.department.findMany({
    select: {
      id: true,
      code: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });

  const resourceChart = resourceByDept.map((item) => ({
    label: departments.find((department) => department.id === item.departmentId)?.code ?? "GEN",
    value: item._count.departmentId,
  }));

  const eventChart = eventByDept.map((item) => ({
    label: departments.find((department) => department.id === item.departmentId)?.code ?? "GEN",
    value: item._count.departmentId,
  }));

  return (
    <div className="page-grid">
      <section className="page-grid page-grid-3">
        <article className="metric-card glass-panel">
          <p>Departments</p>
          <h3>{departmentCount}</h3>
        </article>
        <article className="metric-card glass-panel">
          <p>Faculty</p>
          <h3>{facultyCount}</h3>
        </article>
        <article className="metric-card glass-panel">
          <p>Students</p>
          <h3>{studentCount}</h3>
        </article>
      </section>

      <section className="page-grid page-grid-2">
        <AreaTrendChart data={attendanceChart.length ? attendanceChart : [{ label: "No Data", value: 0 }]} />
        <BarUsageChart data={resourceChart.length ? resourceChart : [{ label: "No Data", value: 0 }]} />
      </section>

      <section className="page-grid page-grid-2">
        <PieDistributionChart data={eventChart.length ? eventChart : [{ label: "No Data", value: 0 }]} />
        <article className="section-card glass-panel">
          <h3>Management Actions</h3>
          <div className="cards-list">
            <Link className="button" href="/college/departments">
              Create Departments
            </Link>
            <Link className="button button-alt" href="/college/faculty">
              Add Faculty
            </Link>
            <Link className="button button-secondary" href="/college/students">
              Manage Students
            </Link>
            <Link className="button button-outline" href="/college/analytics">
              Open Deep Analytics
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
