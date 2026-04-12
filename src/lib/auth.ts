import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify, SignJWT } from "jose";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ROLE_HOME, RoleName } from "@/lib/constants";

const SESSION_COOKIE = "campussphere_session";
const SESSION_DURATION = 60 * 60 * 24 * 7;

type SessionPayload = {
  uid: string;
  name: string;
  email: string;
  role: RoleName;
};

function getSecret() {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET ?? "campussphere-dev-secret-change-in-production",
  );
}

export async function hashPassword(value: string) {
  return bcrypt.hash(value, 10);
}

export async function verifyPassword(value: string, hash: string) {
  return bcrypt.compare(value, hash);
}

export async function authenticate(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return null;
  }
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return null;
  }
  return user;
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSecret());

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function readSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      uid: String(payload.uid),
      name: String(payload.name),
      email: String(payload.email),
      role: payload.role as RoleName,
    } satisfies SessionPayload;
  } catch {
    return null;
  }
}

export function roleHome(role: Role | RoleName) {
  return ROLE_HOME[role as RoleName] ?? "/login";
}

export async function requireAuth(roles?: Role[]) {
  const session = await readSession();
  if (!session) {
    redirect("/login");
  }
  if (roles && !roles.includes(session.role as Role)) {
    redirect(roleHome(session.role));
  }
  return session;
}

export async function getSessionUserRecord() {
  const session = await readSession();
  if (!session) {
    return null;
  }
  return prisma.user.findUnique({
    where: { id: session.uid },
    include: {
      studentProfile: true,
      facultyProfile: true,
    },
  });
}
