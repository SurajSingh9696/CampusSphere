import "server-only";

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { roleLandingPath, type UserRole } from "@/lib/auth-shared";

const SESSION_COOKIE_KEY = "campusphere_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthSession extends AuthUser {
  exp: number;
}

export interface SessionCheckFailure {
  ok: false;
  status: 401 | 403;
  message: string;
}

export interface SessionCheckSuccess {
  ok: true;
  session: AuthSession;
}

type SessionCheckResult = SessionCheckFailure | SessionCheckSuccess;

type SessionTokenPayload = AuthSession;

function getSessionSecret(): string {
  const configured = process.env.SESSION_SECRET ?? process.env.NEXTAUTH_SECRET;

  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET is required in production.");
  }

  return "campusphere-local-dev-secret-change-me";
}

function safeCompare(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function tokenSignature(value: string): string {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function issueToken(payload: SessionTokenPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = tokenSignature(body);

  return `${body}.${signature}`;
}

function decodeToken(token: string): AuthSession | null {
  const [body, signature] = token.split(".");

  if (!body || !signature) {
    return null;
  }

  if (!safeCompare(signature, tokenSignature(body))) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as SessionTokenPayload;

    if (typeof payload.exp !== "number" || payload.exp <= Date.now()) {
      return null;
    }

    if (!payload.id || !payload.email || !payload.name || !payload.role) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const digest = scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${digest}`;
}

export function verifyPassword(password: string, hashedValue: string): boolean {
  const [salt, digest] = hashedValue.split(":");

  if (!salt || !digest) {
    return false;
  }

  try {
    const derivedBuffer = scryptSync(password, salt, 64);
    const digestBuffer = Buffer.from(digest, "hex");

    if (digestBuffer.length !== derivedBuffer.length) {
      return false;
    }

    return timingSafeEqual(digestBuffer, derivedBuffer);
  } catch {
    return false;
  }
}

export function createSessionForUser(user: AuthUser): AuthSession {
  return {
    ...user,
    exp: Date.now() + SESSION_TTL_SECONDS * 1000,
  };
}

export async function setSessionCookie(session: AuthSession): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_KEY, issueToken(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_KEY, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_KEY)?.value;

  if (!token) {
    return null;
  }

  return decodeToken(token);
}

export async function requireSession(allowedRoles?: UserRole[]): Promise<AuthSession> {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    redirect(roleLandingPath(session.role));
  }

  return session;
}

export async function requireApiSession(
  allowedRoles?: UserRole[],
): Promise<SessionCheckResult> {
  const session = await getSession();

  if (!session) {
    return {
      ok: false,
      status: 401,
      message: "Authentication required",
    };
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return {
      ok: false,
      status: 403,
      message: "Insufficient permissions",
    };
  }

  return {
    ok: true,
    session,
  };
}