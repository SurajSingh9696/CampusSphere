import {
  BarChart3,
  CalendarRange,
  GraduationCap,
  LayoutDashboard,
  UploadCloud,
} from "lucide-react";
import type { ReactNode } from "react";

import { PortalLayout } from "@/components/portal-layout";
import { getSession } from "@/lib/auth";

interface CollegeShellProps {
  activePath: string;
  children: ReactNode;
}

const collegeNav = [
  { href: "/college/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/college/dashboard#records", label: "Student Records", icon: GraduationCap },
  { href: "/college/dashboard#attendance", label: "Attendance", icon: BarChart3 },
  { href: "/college/dashboard#schedule", label: "Schedule", icon: CalendarRange },
  { href: "/college/dashboard#uploads", label: "Uploads", icon: UploadCloud },
];

const collegeTop = [
  { href: "/college/dashboard", label: "Dashboard" },
  { href: "/college/dashboard#records", label: "Records" },
  { href: "/college/dashboard#attendance", label: "Attendance" },
  { href: "/college/dashboard#schedule", label: "Schedule" },
];

export async function CollegeShell({ activePath, children }: CollegeShellProps) {
  const session = await getSession();

  return (
    <PortalLayout
      brand="Academic Orbit"
      portalTitle="Institution Grid"
      portalType="College Portal"
      navItems={collegeNav}
      topLinks={collegeTop}
      activePath={activePath}
      profileName={session?.name ?? "Campus User"}
      searchPlaceholder="Search records, batches, and schedules"
    >
      {children}
    </PortalLayout>
  );
}
