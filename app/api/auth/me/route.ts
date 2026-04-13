import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/auth";

export async function GET() {
  const session = await requireApiSession();

  if (!session.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: session.message,
      },
      { status: session.status },
    );
  }

  return NextResponse.json({
    ok: true,
    user: session.session,
  });
}