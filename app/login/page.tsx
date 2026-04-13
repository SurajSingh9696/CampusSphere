import { redirect } from "next/navigation";

import { LoginForm } from "@/components/login-form";
import { getSession } from "@/lib/auth";
import { demoCredentials, roleLandingPath } from "@/lib/auth-shared";
import { getCampusData } from "@/lib/data/campus-store";
import { ensureSeedUsers } from "@/lib/data/user-store";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect(roleLandingPath(session.role));
  }

  await ensureSeedUsers();
  const content = await getCampusData();

  return (
    <div className="grid min-h-screen bg-[var(--canvas)] lg:grid-cols-2">
      <section className="hidden overflow-hidden bg-gradient-to-br from-[var(--brand-700)] via-[#1f4ed6] to-[#7aa8ff] p-10 text-white lg:block">
        <div className="mx-auto flex h-full max-w-xl flex-col justify-between">
          <div>
            <p className="font-display text-3xl font-black">{content.brand.productName}</p>
            <p className="mt-2 max-w-md text-sm text-white/85">{content.brand.tagline}</p>
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Platform Promise</p>
            <h2 className="font-display mt-3 text-3xl font-black leading-tight">
              Unified access to every academic workflow.
            </h2>
            <p className="mt-4 text-sm text-white/85">
              Built on Next.js and MongoDB so every dashboard remains synchronized across roles.
            </p>
          </div>

          <div className="rounded-2xl bg-black/20 p-4 text-xs text-white/85">
            {content.brand.platformLabel} • {content.brand.version}
          </div>
        </div>
      </section>

      <section className="flex items-center px-5 py-10 lg:px-12">
        <div className="mx-auto w-full max-w-xl">
          <div className="surface-card rounded-3xl p-6 lg:p-8">
            <h1 className="font-display text-3xl font-black text-[var(--ink-strong)]">Sign in to CampusSphere</h1>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              Authenticate with your role account to open the live portal.
            </p>
            <LoginForm demoAccounts={demoCredentials} />
          </div>
        </div>
      </section>
    </div>
  );
}
