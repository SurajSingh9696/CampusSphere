import { Role } from "@prisma/client";
import { PortalShell } from "@/components/portal-shell";
import { requireAuth } from "@/lib/auth";
import { facultyLinks } from "@/lib/constants";
import { getUserNotifications } from "@/lib/portal-data";

export default async function FacultyLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth([Role.FACULTY]);
  const notifications = await getUserNotifications(session.uid);

  return (
    <PortalShell
      links={facultyLinks}
      notifications={notifications}
      subtitle="Faculty Portal"
      title="Faculty Dashboard"
      user={{ name: session.name, email: session.email }}
    >
      {children}
    </PortalShell>
  );
}
