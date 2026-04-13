import { redirect } from "next/navigation";
import Link from "next/link";

import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/login-form";
import { getSession } from "@/lib/auth";
import { roleLandingPath } from "@/lib/auth-shared";
import { ensureSeedUsers } from "@/lib/data/user-store";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect(roleLandingPath(session.role));
  }

  await ensureSeedUsers();

  return (
    <AuthShell
      eyebrow="Secure Access"
      title="Sign in to Academic Orbit"
      subtitle="Use your institutional credentials to access your student or college workspace."
      leftHeading="Welcome back to your campus workspace."
      leftDescription="Sign in securely to continue your academic flow with role-based dashboards and live operational visibility."
      leftPoints={[
        "Fast access to student and college workspaces",
        "Secure sessions backed by protected routes",
        "Connected experience across attendance, resources, and operations",
      ]}
    >
      <LoginForm />

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link
          href="/register/student"
          className="rounded-xl border border-[color:var(--ghost)] bg-[var(--soft-100)] px-4 py-3 text-center text-sm font-semibold text-[var(--ink-strong)] transition hover:bg-[var(--brand-100)]"
        >
          Register as Student
        </Link>
        <Link
          href="/register/college"
          className="rounded-xl border border-[color:var(--ghost)] bg-[var(--soft-100)] px-4 py-3 text-center text-sm font-semibold text-[var(--ink-strong)] transition hover:bg-[var(--brand-100)]"
        >
          Register as College
        </Link>
      </div>

      <p className="mt-5 text-center text-xs text-[var(--ink-soft)]">Need onboarding support? Contact your institution support team.</p>

      <div className="mt-3 text-center">
        <Link href="/" className="text-sm font-semibold text-[var(--brand-700)]">
          Back to landing page
        </Link>
      </div>
    </AuthShell>
  );
}
