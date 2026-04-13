import {
  BookOpen,
  CalendarCheck,
  LayoutDashboard,
  MapPinned,
  MessageSquare,
  ScanLine,
  Wrench,
} from "lucide-react";
import type { ReactNode } from "react";

import { PortalLayout } from "@/components/portal-layout";
import { getSession } from "@/lib/auth";

interface StudentShellProps {
  activePath: string;
  children: ReactNode;
}

const studentNav = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/operations/attendance", label: "Operations", icon: ScanLine },
  { href: "/student/resources", label: "Resources", icon: BookOpen },
  { href: "/student/community", label: "Community", icon: MessageSquare },
  { href: "/student/utilities", label: "Utilities", icon: Wrench },
  { href: "/campus/map", label: "Campus Map", icon: MapPinned },
];

const studentTop = [
  { href: "/student/dashboard", label: "Dashboard" },
  { href: "/student/attendance", label: "Attendance" },
  { href: "/operations/attendance", label: "Operations" },
  { href: "/student/resources", label: "Resources" },
  { href: "/student/community", label: "Community" },
  { href: "/campus/map", label: "Campus Map" },
];

export async function StudentShell({ activePath, children }: StudentShellProps) {
  const session = await getSession();

  return (
    <PortalLayout
      brand="Academic Atelier"
      portalTitle="Global Campus"
      portalType="Student Portal"
      navItems={studentNav}
      topLinks={studentTop}
      activePath={activePath}
      profileName={session?.name ?? "Campus User"}
      searchPlaceholder="Search resources, events, or classes"
    >
      {children}
    </PortalLayout>
  );
}
