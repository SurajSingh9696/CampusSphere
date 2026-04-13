import type { ReactNode } from "react";

import { requireSession } from "@/lib/auth";

export default async function OperationsLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireSession(["student", "college", "admin"]);

  return children;
}