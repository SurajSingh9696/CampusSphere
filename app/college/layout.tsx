import type { ReactNode } from "react";

import { requireSession } from "@/lib/auth";

export default async function CollegeLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireSession(["college", "admin"]);

  return children;
}