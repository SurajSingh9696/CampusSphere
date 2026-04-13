import Link from "next/link";
import { redirect } from "next/navigation";

import { ArrowRight, Building2, GraduationCap } from "lucide-react";

import { AuthShell } from "@/components/auth-shell";
import { getSession } from "@/lib/auth";
import { roleLandingPath } from "@/lib/auth-shared";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const session = await getSession();

  if (session) {
    redirect(roleLandingPath(session.role));
  }

  return (
    <AuthShell
      eyebrow="Registration"
      title="Choose your registration type"
      subtitle="Continue with the account type that matches your role in Academic Orbit."
      leftHeading="Start your onboarding the right way."
      leftDescription="Select whether you are registering as a student or as a college to continue with the correct account experience."
      leftPoints={[
        "Dedicated onboarding paths for each role",
        "Clear account setup with secure credentials",
        "Direct access to the correct dashboard after signup",
      ]}
    >
      <div className="mt-8 grid gap-4">
        <Link
          href="/register/student"
          className="group rounded-2xl border border-[color:var(--ghost)] bg-[var(--soft-100)] p-5 transition hover:border-[var(--brand-600)] hover:bg-[var(--brand-100)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[var(--brand-700)]">
                <GraduationCap className="h-5 w-5" />
              </div>
              <h2 className="font-display mt-4 text-xl font-black text-[var(--ink-strong)]">Student Registration</h2>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">
                Create a student account for attendance, resources, and community access.
              </p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-[var(--brand-700)] transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        <Link
          href="/register/college"
          className="group rounded-2xl border border-[color:var(--ghost)] bg-[var(--soft-100)] p-5 transition hover:border-[var(--brand-600)] hover:bg-[var(--brand-100)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[var(--brand-700)]">
                <Building2 className="h-5 w-5" />
              </div>
              <h2 className="font-display mt-4 text-xl font-black text-[var(--ink-strong)]">College Registration</h2>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">
                Create a college account to manage records, schedules, and operations.
              </p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-[var(--brand-700)] transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>

      <p className="mt-6 text-center text-sm text-[var(--ink-soft)]">
        Already have an account?
        {" "}
        <Link href="/login" className="font-semibold text-[var(--brand-700)]">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
