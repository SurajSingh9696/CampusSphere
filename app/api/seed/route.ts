import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/auth";
import { seedCampusData } from "@/lib/data/campus-store";

export const dynamic = "force-dynamic";

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

  const seeded = await seedCampusData(false);

  return NextResponse.json({
    ok: true,
    message: seeded.seeded
      ? "Campus content store is initialized"
      : "MONGODB_URI not set, using in-memory defaults",
  });
}

export async function POST(request: Request) {
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

  const payload = (await request.json().catch(() => ({}))) as { reset?: boolean };
  const seeded = await seedCampusData(Boolean(payload.reset));

  return NextResponse.json({
    ok: true,
    reset: Boolean(payload.reset),
    seeded: seeded.seeded,
    message: seeded.seeded
      ? "MongoDB content store updated"
      : "MONGODB_URI not set, unable to write to MongoDB",
  });
}
