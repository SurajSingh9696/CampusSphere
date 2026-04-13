import { NextResponse } from "next/server";

import { z } from "zod";

import { createSessionForUser, setSessionCookie } from "@/lib/auth";
import { roleLandingPath } from "@/lib/auth-shared";
import { authenticateUser } from "@/lib/data/user-store";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid login payload",
      },
      { status: 400 },
    );
  }

  const user = await authenticateUser(parsed.data.email, parsed.data.password);

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid email or password",
      },
      { status: 401 },
    );
  }

  await setSessionCookie(createSessionForUser(user));

  return NextResponse.json({
    ok: true,
    redirectTo: roleLandingPath(user.role),
    user,
  });
}