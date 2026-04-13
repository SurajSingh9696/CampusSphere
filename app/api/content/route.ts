import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/auth";
import { getCampusData } from "@/lib/data/campus-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireApiSession(["student", "college", "admin"]);

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

  return NextResponse.json({
    ok: true,
    source: process.env.MONGODB_URI ? "mongodb" : "memory",
    data,
  });
}
