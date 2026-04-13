import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth-shell";
import { RegisterForm } from "@/components/register-form";
import { getSession } from "@/lib/auth";
import { roleLandingPath } from "@/lib/auth-shared";
import { ensureSeedUsers } from "@/lib/data/user-store";

export const dynamic = "force-dynamic";

export default async function StudentRegisterPage() {
  const session = await getSession();

  if (session) {
    redirect(roleLandingPath(session.role));
  }

  await ensureSeedUsers();

  return (
    <AuthShell
      eyebrow="Student Registration"
      title="Create your student account"
      subtitle="Join Academic Orbit with your institutional email and start tracking your classes, resources, and campus activity."
      leftHeading="Build your student identity in minutes."
      leftDescription="Create your account to access attendance tracking, resource sharing, community participation, and campus services."
      leftPoints={[
        "Personal dashboard with real-time academic insights",
        "Access to notes, community, and utility services",
        "Secure sign-in to your role-based student portal",
      ]}
    >
      <RegisterForm role="student" />

      <p className="mt-5 text-center text-sm text-[var(--ink-soft)]">
        Registering for an institution?
        {" "}
        <Link href="/register/college" className="font-semibold text-[var(--brand-700)]">
          Create a college account
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
