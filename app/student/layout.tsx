import type { ReactNode } from "react";

import { requireSession } from "@/lib/auth";

export default async function StudentLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireSession(["student", "admin"]);

  return children;
}