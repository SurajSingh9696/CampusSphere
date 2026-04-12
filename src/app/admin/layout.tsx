import { Role } from "@prisma/client";
import { PortalShell } from "@/components/portal-shell";
import { requireAuth } from "@/lib/auth";
import { adminLinks } from "@/lib/constants";
import { getUserNotifications } from "@/lib/portal-data";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth([Role.ADMIN]);
  const notifications = await getUserNotifications(session.uid);

  return (
    <PortalShell
      links={adminLinks}
      notifications={notifications}
      subtitle="Administration Portal"
      title="Administration Dashboard"
      user={{ name: session.name, email: session.email }}
    >
      {children}
    </PortalShell>
  );
}
