import { Role } from "@prisma/client";
import { PortalShell } from "@/components/portal-shell";
import { requireAuth } from "@/lib/auth";
import { studentLinks } from "@/lib/constants";
import { getUserNotifications } from "@/lib/portal-data";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth([Role.STUDENT]);
  const notifications = await getUserNotifications(session.uid);

  return (
    <PortalShell
      links={studentLinks}
      notifications={notifications}
      subtitle="Student Portal"
      title="Student Dashboard"
      user={{ name: session.name, email: session.email }}
    >
      {children}
    </PortalShell>
  );
}
