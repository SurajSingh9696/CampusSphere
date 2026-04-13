"use client";

import { useState } from "react";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";

type RegistrationRole = "student" | "college";

interface RegisterFormProps {
  role: RegistrationRole;
}

const roleCopy = {
  student: {
    accountLabel: "Student account",
    nameLabel: "Full name",
    namePlaceholder: "Enter your full name",
    emailPlaceholder: "name@student.edu",
    fallbackRedirect: "/student/dashboard",
  },
  college: {
    accountLabel: "College account",
    nameLabel: "Institution name",
    namePlaceholder: "Enter institution name",
    emailPlaceholder: "admin@college.edu",
    fallbackRedirect: "/college/dashboard",
  },
} as const;

export function RegisterForm({ role }: RegisterFormProps) {
  const router = useRouter();
  const copy = roleCopy[role];

  const [formState, setFormState] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (formState.password !== formState.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role,
          name: formState.name,
          email: formState.email,
          password: formState.password,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        redirectTo?: string;
      };

      if (!response.ok || !payload.ok) {
        setErrorMessage(payload.message ?? "Unable to create account. Please try again.");
        return;
      }

      router.replace(payload.redirectTo ?? copy.fallbackRedirect);
      router.refresh();
    } catch {
      setErrorMessage("Unable to reach the auth service. Please retry.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-7 grid gap-4" onSubmit={handleSubmit}>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">{copy.accountLabel}</p>

      <label className="grid gap-2 text-sm font-semibold text-[var(--ink-soft)]">
        {copy.nameLabel}
        <input
          className="w-full rounded-xl border border-[color:var(--ghost)] bg-white px-4 py-3 text-sm text-[var(--ink-strong)] outline-none focus:border-[var(--brand-600)]"
          placeholder={copy.namePlaceholder}
          type="text"
          value={formState.name}
          onChange={(event) =>
            setFormState((prev) => ({ ...prev, name: event.target.value }))
          }
          autoComplete="name"
          required
        />
      </label>

      <label className="grid gap-2 text-sm font-semibold text-[var(--ink-soft)]">
        Work email
        <input
          className="w-full rounded-xl border border-[color:var(--ghost)] bg-white px-4 py-3 text-sm text-[var(--ink-strong)] outline-none focus:border-[var(--brand-600)]"
          placeholder={copy.emailPlaceholder}
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
          placeholder="Create a strong password"
          type="password"
          value={formState.password}
          onChange={(event) =>
            setFormState((prev) => ({ ...prev, password: event.target.value }))
          }
          autoComplete="new-password"
          required
        />
      </label>

      <label className="grid gap-2 text-sm font-semibold text-[var(--ink-soft)]">
        Confirm password
        <input
          className="w-full rounded-xl border border-[color:var(--ghost)] bg-white px-4 py-3 text-sm text-[var(--ink-strong)] outline-none focus:border-[var(--brand-600)]"
          placeholder="Confirm your password"
          type="password"
          value={formState.confirmPassword}
          onChange={(event) =>
            setFormState((prev) => ({ ...prev, confirmPassword: event.target.value }))
          }
          autoComplete="new-password"
          required
        />
      </label>

      <p className="text-xs text-[var(--ink-soft)]">Use at least 8 characters with a mix of letters and numbers.</p>

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
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
