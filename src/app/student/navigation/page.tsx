import { Role } from "@prisma/client";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type NavigationPageProps = {
  searchParams: Promise<{
    query?: string;
    type?: string;
    departmentId?: string;
  }>;
};

export default async function StudentNavigationPage({ searchParams }: NavigationPageProps) {
  await requireAuth([Role.STUDENT]);
  const filters = await searchParams;

  const buildings = await prisma.building.findMany({
    where: {
      name: filters.query ? { contains: filters.query } : undefined,
      type: filters.type || undefined,
      departmentId: filters.departmentId || undefined,
    },
    include: {
      department: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const departments = await prisma.department.findMany({ orderBy: { name: "asc" } });
  const types = await prisma.building.findMany({ distinct: ["type"], select: { type: true } });
  const mapRules = buildings
    .map((building, index) => `.map-node-${index}{left:${building.mapX}%;top:${building.mapY}%;}`)
    .join("\n");

  return (
    <div className="page-grid">
      <section className="section-card glass-panel">
        <h3>Campus Navigation</h3>
        <form action="/student/navigation" className="form-grid" method="GET">
          <label>
            Search Building / Lab / Classroom
            <input defaultValue={filters.query} name="query" placeholder="Search by name" />
          </label>
          <label>
            Type
            <select defaultValue={filters.type ?? ""} name="type">
              <option value="">All types</option>
              {types.map((item) => (
                <option key={item.type} value={item.type}>
                  {item.type}
                </option>
              ))}
            </select>
          </label>
          <label>
            Department
            <select defaultValue={filters.departmentId ?? ""} name="departmentId">
              <option value="">All departments</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </label>
          <div className="form-grid-full">
            <button className="button" type="submit">
              Find Location
            </button>
          </div>
        </form>
      </section>

      <section className="section-card glass-panel">
        <h3>Campus Map View</h3>
        <div className="map-grid">
          <style>{mapRules}</style>
          {buildings.map((building, index) => (
            <div className={`map-node map-node-${index}`} key={building.id}>
              {building.code}
            </div>
          ))}
        </div>
      </section>

      <section className="section-card glass-panel">
        <h3>Location Directory</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Type</th>
                <th>Floor</th>
                <th>Department</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {buildings.length === 0 ? (
                <tr>
                  <td colSpan={6}>No buildings match the current filter.</td>
                </tr>
              ) : (
                buildings.map((building) => (
                  <tr key={building.id}>
                    <td>{building.name}</td>
                    <td>{building.code}</td>
                    <td>{building.type}</td>
                    <td>{building.floor ?? "-"}</td>
                    <td>{building.department?.name ?? "General"}</td>
                    <td>{building.description}</td>
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
