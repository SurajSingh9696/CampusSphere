import { NextResponse } from "next/server";

import { z } from "zod";

import { createSessionForUser, setSessionCookie } from "@/lib/auth";
import { roleLandingPath } from "@/lib/auth-shared";
import { registerUser } from "@/lib/data/user-store";

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: z.enum(["student", "college"]),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid registration payload",
      },
      { status: 400 },
    );
  }

  const result = await registerUser(parsed.data);

  if (result.error === "email_exists") {
    return NextResponse.json(
      {
        ok: false,
        message: "An account with this email already exists",
      },
      { status: 409 },
    );
  }

  if (!result.user) {
    return NextResponse.json(
      {
        ok: false,
        message: "Unable to create account right now",
      },
      { status: 500 },
    );
  }

  await setSessionCookie(createSessionForUser(result.user));

  return NextResponse.json({
    ok: true,
    redirectTo: roleLandingPath(result.user.role),
    user: result.user,
  });
}
