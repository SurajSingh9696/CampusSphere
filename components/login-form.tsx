"use client";

import { useMemo, useState } from "react";

import { LoaderCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

function getSafeNextPath(nextPath: string | null): string | null {
  if (!nextPath || !nextPath.startsWith("/")) {
    return null;
  }

  if (nextPath.startsWith("//")) {
    return null;
  }

  return nextPath;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(
    () => getSafeNextPath(searchParams.get("next")),
    [searchParams],
  );

  const [formState, setFormState] = useState({
    email: "",
    password: "",
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
    <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
      <label className="grid gap-2 text-sm font-semibold text-[var(--ink-soft)]">
        Work Email
        <input
          className="w-full rounded-xl border border-[color:var(--ghost)] bg-white px-4 py-3 text-sm text-[var(--ink-strong)] outline-none focus:border-[var(--brand-600)]"
          placeholder="name@institution.edu"
          type="email"
          value={formState.email}
          onChange={(event) =>
            setFormState((prev) => ({ ...prev, email: event.target.value }))
          }
          autoComplete="email"
          required
        />
      </label>

      <label className="grid gap-2 text-sm font-semibold text-[var(--ink-soft)]">
        Password
        <input
          className="w-full rounded-xl border border-[color:var(--ghost)] bg-white px-4 py-3 text-sm text-[var(--ink-strong)] outline-none focus:border-[var(--brand-600)]"
          placeholder="Enter your password"
          type="password"
          value={formState.password}
          onChange={(event) =>
            setFormState((prev) => ({ ...prev, password: event.target.value }))
          }
          autoComplete="current-password"
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
  );
}