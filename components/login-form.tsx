"use client";

import { useMemo, useState } from "react";

import { Building2, GraduationCap, LoaderCircle, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import type { DemoCredential } from "@/lib/auth-shared";

interface LoginFormProps {
  demoAccounts: DemoCredential[];
}

const iconByRole = {
  student: GraduationCap,
  college: Building2,
  admin: ShieldCheck,
} as const;

function getSafeNextPath(nextPath: string | null): string | null {
  if (!nextPath || !nextPath.startsWith("/")) {
    return null;
  }

  if (nextPath.startsWith("//")) {
    return null;
  }

  return nextPath;
}

export function LoginForm({ demoAccounts }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(
    () => getSafeNextPath(searchParams.get("next")),
    [searchParams],
  );

  const [formState, setFormState] = useState({
    email: demoAccounts[0]?.email ?? "",
    password: demoAccounts[0]?.password ?? "",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        redirectTo?: string;
      };

      if (!response.ok || !payload.ok) {
        setErrorMessage(payload.message ?? "Unable to sign in. Please try again.");
        return;
      }

      router.replace(nextPath ?? payload.redirectTo ?? "/student/dashboard");
      router.refresh();
    } catch {
      setErrorMessage("Unable to reach the auth service. Please retry.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-semibold text-[var(--ink-soft)]">
          Email
          <input
            className="rounded-xl border border-[color:var(--ghost)] bg-white px-4 py-3 text-sm text-[var(--ink-strong)] outline-none focus:border-[var(--brand-600)]"
            placeholder="name@campus.edu"
            type="email"
            value={formState.email}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, email: event.target.value }))
            }
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-[var(--ink-soft)]">
          Password
          <input
            className="rounded-xl border border-[color:var(--ghost)] bg-white px-4 py-3 text-sm text-[var(--ink-strong)] outline-none focus:border-[var(--brand-600)]"
            placeholder="Enter password"
            type="password"
            value={formState.password}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, password: event.target.value }))
            }
            required
          />
        </label>

        {errorMessage ? (
          <p className="rounded-xl bg-[var(--danger-100)] px-4 py-3 text-sm font-semibold text-[var(--danger-700)]">
            {errorMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="mt-6 rounded-2xl bg-[var(--soft-100)] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
          Demo credentials
        </p>
        <p className="mt-1 text-xs text-[var(--ink-soft)]">
          Click a role card below to auto-fill credentials.
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {demoAccounts.map((account) => {
          const Icon = iconByRole[account.role];

          return (
            <button
              key={account.role}
              type="button"
              onClick={() =>
                setFormState({
                  email: account.email,
                  password: account.password,
                })
              }
              className="rounded-2xl border border-[color:var(--ghost)] bg-[var(--soft-100)] p-4 text-left transition hover:border-[var(--brand-600)] hover:bg-[var(--brand-100)]"
            >
              <Icon className="h-5 w-5 text-[var(--brand-700)]" />
              <p className="mt-3 font-display text-lg font-bold text-[var(--ink-strong)]">
                {account.role[0].toUpperCase() + account.role.slice(1)}
              </p>
              <p className="mt-1 text-xs text-[var(--ink-soft)]">{account.email}</p>
              <p className="mt-1 text-xs text-[var(--ink-soft)]">{account.password}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}