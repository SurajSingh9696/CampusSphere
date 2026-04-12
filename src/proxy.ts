import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { ROLE_HOME, RoleName } from "@/lib/constants";

const SESSION_COOKIE = "campussphere_session";

function roleFromPath(pathname: string): RoleName | null {
  if (pathname.startsWith("/student")) return "STUDENT";
  if (pathname.startsWith("/faculty")) return "FACULTY";
  if (pathname.startsWith("/admin")) return "ADMIN";
  if (pathname.startsWith("/college")) return "COLLEGE";
  return null;
}

async function extractRole(request: NextRequest): Promise<RoleName | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(
        process.env.AUTH_SECRET ?? "campussphere-dev-secret-change-in-production",
      ),
    );
    return payload.role as RoleName;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const role = await extractRole(request);

  if (pathname === "/login" && role) {
    return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
  }

  const requiredRole = roleFromPath(pathname);
  if (requiredRole && !role) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (requiredRole && role && requiredRole !== role) {
    return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
  }

  if (pathname.startsWith("/search") && !role) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
