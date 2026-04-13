import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth-shell";
import { RegisterForm } from "@/components/register-form";
import { getSession } from "@/lib/auth";
import { roleLandingPath } from "@/lib/auth-shared";
import { ensureSeedUsers } from "@/lib/data/user-store";

export const dynamic = "force-dynamic";

export default async function CollegeRegisterPage() {
  const session = await getSession();

  if (session) {
    redirect(roleLandingPath(session.role));
  }

  await ensureSeedUsers();

  return (
    <AuthShell
      eyebrow="College Registration"
      title="Create your college account"
      subtitle="Set up Academic Orbit for your institution to manage schedules, records, and attendance workflows in one portal."
      leftHeading="Launch your college workspace with confidence."
      leftDescription="Onboard your institution with a secure account built for operations, schedules, records, and campus-wide coordination."
      leftPoints={[
        "Manage records and uploads from one workspace",
        "Track attendance and institutional schedules",
        "Role-protected access for operational continuity",
      ]}
    >
      <RegisterForm role="college" />

      <p className="mt-5 text-center text-sm text-[var(--ink-soft)]">
        Registering as a student?
        {" "}
        <Link href="/register/student" className="font-semibold text-[var(--brand-700)]">
          Create a student account
        </Link>
      </p>

      <p className="mt-2 text-center text-sm text-[var(--ink-soft)]">
        Already have an account?
        {" "}
        <Link href="/login" className="font-semibold text-[var(--brand-700)]">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
