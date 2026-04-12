import { Role } from "@prisma/client";
import { PortalShell } from "@/components/portal-shell";
import { requireAuth } from "@/lib/auth";
import { collegeLinks } from "@/lib/constants";
import { getUserNotifications } from "@/lib/portal-data";

export default async function CollegeLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth([Role.COLLEGE]);
  const notifications = await getUserNotifications(session.uid);

  return (
    <PortalShell
      links={collegeLinks}
      notifications={notifications}
      subtitle="College Management Portal"
      title="College Management Dashboard"
      user={{ name: session.name, email: session.email }}
    >
      {children}
    </PortalShell>
  );
}
