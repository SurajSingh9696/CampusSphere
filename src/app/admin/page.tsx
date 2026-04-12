import Link from "next/link";
import { Role } from "@prisma/client";
import { BarUsageChart, PieDistributionChart } from "@/components/charts";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  await requireAuth([Role.ADMIN]);

  const [studentCount, facultyCount, complaintCount, eventCount, complaintStatus, resourceCount] =
    await Promise.all([
      prisma.user.count({ where: { role: Role.STUDENT } }),
      prisma.user.count({ where: { role: Role.FACULTY } }),
      prisma.complaint.count(),
      prisma.event.count(),
      prisma.complaint.groupBy({ by: ["status"], _count: { status: true } }),
      prisma.resource.groupBy({ by: ["approved"], _count: { approved: true } }),
    ]);

  const complaintChart = complaintStatus.map((item) => ({
    label: item.status,
    value: item._count.status,
  }));

  const resourceChart = resourceCount.map((item) => ({
    label: item.approved ? "Approved" : "Pending",
    value: item._count.approved,
  }));

  return (
    <div className="page-grid">
      <section className="page-grid page-grid-3">
        <article className="metric-card glass-panel">
          <p>Student Count</p>
          <h3>{studentCount}</h3>
        </article>
        <article className="metric-card glass-panel">
          <p>Faculty Count</p>
          <h3>{facultyCount}</h3>
        </article>
        <article className="metric-card glass-panel">
          <p>Complaints</p>
          <h3>{complaintCount}</h3>
        </article>
      </section>

      <section className="page-grid page-grid-2">
        <BarUsageChart data={complaintChart.length ? complaintChart : [{ label: "None", value: 0 }]} />
        <PieDistributionChart data={resourceChart.length ? resourceChart : [{ label: "None", value: 0 }]} />
      </section>

      <section className="section-card glass-panel">
        <h3>Quick Controls</h3>
        <div className="cards-list cards-cols-4">
          <Link className="button" href="/admin/complaints">
            Complaint Management
          </Link>
          <Link className="button button-alt" href="/admin/notices">
            Notice Publishing
          </Link>
          <Link className="button button-secondary" href="/admin/hostel">
            Hostel Management
          </Link>
          <Link className="button button-outline" href="/admin/resources">
            Resource Monitoring
          </Link>
        </div>
        <p>Active events in system: {eventCount}</p>
      </section>
    </div>
  );
}
