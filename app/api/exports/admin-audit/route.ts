import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/auth";
import { getCampusData } from "@/lib/data/campus-store";

function toCsvRow(columns: string[]): string {
  return columns
    .map((column) => `"${column.replaceAll('"', '""')}"`)
    .join(",");
}

export async function GET() {
  const session = await requireApiSession(["admin"]);

  if (!session.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: session.message,
      },
      { status: session.status },
    );
  }

  const data = await getCampusData();
  const rows = [
    ["Action", "Timestamp", "Detail"],
    ...data.admin.auditLogs.map((log) => [log.action, log.timestamp, log.detail]),
  ];

  const csv = rows.map((row) => toCsvRow(row)).join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=admin_audit_logs.csv",
    },
  });
}