import {
  ActivitySquare,
  Building2,
  LayoutDashboard,
  ScrollText,
  Shield,
} from "lucide-react";
import type { ReactNode } from "react";

import { PortalLayout } from "@/components/portal-layout";
import { getSession } from "@/lib/auth";

interface AdminShellProps {
  activePath: string;
  children: ReactNode;
}

const adminNav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/dashboard#incidents", label: "Incidents", icon: ActivitySquare },
  { href: "/admin/dashboard#institutions", label: "Institutions", icon: Building2 },
  { href: "/admin/dashboard#audit", label: "Audit Logs", icon: ScrollText },
  { href: "/admin/dashboard#security", label: "Security", icon: Shield },
];

const adminTop = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/dashboard#incidents", label: "Operations" },
  { href: "/admin/dashboard#audit", label: "Audit" },
  { href: "/admin/dashboard#institutions", label: "Institutions" },
];

export async function AdminShell({ activePath, children }: AdminShellProps) {
  const session = await getSession();

  return (
    <PortalLayout
      brand="Scholarly Prism"
      portalTitle="Global Control"
      portalType="Admin Portal"
      navItems={adminNav}
      topLinks={adminTop}
      activePath={activePath}
      profileName={session?.name ?? "Campus User"}
      searchPlaceholder="Search incidents, logs, and users"
    >
      {children}
    </PortalLayout>
  );
}
