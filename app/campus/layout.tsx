import type { ReactNode } from "react";

import { requireSession } from "@/lib/auth";

export default async function CampusLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireSession(["student", "college", "admin"]);

  return children;
}