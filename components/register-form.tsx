"use client";

import { useState } from "react";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";

type RegistrationRole = "student" | "college";
type RegisterStep = 1 | 2 | 3;

interface RegisterFormProps {
  role: RegistrationRole;
}

const roleCopy = {
  student: {
    accountLabel: "Student account",
    nameLabel: "Full name",
    namePlaceholder: "Enter your full name",
    emailLabel: "Student email",
    emailPlaceholder: "name@student.edu",
    fallbackRedirect: "/student/dashboard",
  },
  college: {
    accountLabel: "College account",
    nameLabel: "Institution name",
    namePlaceholder: "Enter institution name",
    emailLabel: "College email",
    emailPlaceholder: "admin@college.edu",
    fallbackRedirect: "/college/dashboard",
  },
} as const;

const studentCampusOptions = [
  "Main Campus",
  "North Campus",
  "South Campus",
  "Innovation Campus",
];

const studentCourseOptions = [
  "B.Tech",
  "B.Sc",
  "B.Com",
  "B.A",
  "M.Tech",
  "MBA",
];

const studentStreamOptions = [
  "Computer Science",
  "Mechanical",
  "Electrical",
  "Civil",
  "Business Studies",
  "Arts and Humanities",
];

const collegeLocationOptions = [
  "Metro City Campus",
  "North Region Campus",
  "South Region Campus",
  "Central Region Campus",
];

export function RegisterForm({ role }: RegisterFormProps) {
  const router = useRouter();
  const copy = roleCopy[role];
  const [step, setStep] = useState<RegisterStep>(1);

  const [formState, setFormState] = useState({
    name: "",
    email: "",
    idCardNumber: "",
    campus: "",
    course: "",
    stream: "",
    collegeCode: "",
    collegeShortCode: "",
    collegeLocation: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateStep(targetStep: RegisterStep): string | null {
    if (targetStep === 1) {
      if (formState.name.trim().length < 2) {
        return "Please enter a valid name.";
      }

      if (!formState.email.includes("@")) {
        return "Please enter a valid email address.";
      }

      return null;
    }

    if (targetStep === 2) {
      if (role === "student") {
        if (!formState.idCardNumber.trim()) {
          return "ID card number is required.";
        }

        if (!formState.campus) {
          return "Please select campus.";
        }

        if (!formState.course) {
          return "Please select course.";
        }

        if (!formState.stream) {
          return "Please select stream.";
        }

        return null;
      }

      if (!formState.collegeCode.trim()) {
        return "College code is required.";
      }

      if (!formState.collegeShortCode.trim()) {
        return "Short code is required.";
      }

      if (!formState.collegeLocation) {
        return "Please select college location.";
      }

      return null;
    }

    if (formState.password.length < 8) {
      return "Password should be at least 8 characters.";
    }

    if (formState.password !== formState.confirmPassword) {
      return "Passwords do not match.";
    }

    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const stepError = validateStep(step);

    if (stepError) {
      setErrorMessage(stepError);
      return;
    }

    if (step < 3) {
      setStep((previous) => (previous + 1) as RegisterStep);
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
          details: role === "student"
            ? {
                idCardNumber: formState.idCardNumber,
                campus: formState.campus,
                course: formState.course,
                stream: formState.stream,
              }
            : {
                collegeCode: formState.collegeCode,
                collegeShortCode: formState.collegeShortCode,
                collegeLocation: formState.collegeLocation,
              },
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

      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((target) => (
          <div
            key={target}
            className={`h-1.5 rounded-full ${step >= target ? "bg-[var(--brand-700)]" : "bg-[var(--soft-200)]"}`}
          />
        ))}
      </div>

      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--ink-soft)]">
        {step === 1 ? "Step 1: Account" : step === 2 ? "Step 2: Profile" : "Step 3: Security"}
      </p>

      <div className="grid min-h-[290px] content-start gap-4">
        {step === 1 ? (
          <>
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
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-[var(--ink-soft)]">
              {copy.emailLabel}
              <input
                className="w-full rounded-xl border border-[color:var(--ghost)] bg-white px-4 py-3 text-sm text-[var(--ink-strong)] outline-none focus:border-[var(--brand-600)]"
                placeholder={copy.emailPlaceholder}
                type="email"
                value={formState.email}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, email: event.target.value }))
                }
                autoComplete="email"
              />
            </label>
          </>
        ) : null}

        {step === 2 && role === "student" ? (
          <>
            <label className="grid gap-2 text-sm font-semibold text-[var(--ink-soft)]">
              ID card number
              <input
                className="w-full rounded-xl border border-[color:var(--ghost)] bg-white px-4 py-3 text-sm text-[var(--ink-strong)] outline-none focus:border-[var(--brand-600)]"
                placeholder="Enter your student ID"
                type="text"
                value={formState.idCardNumber}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, idCardNumber: event.target.value }))
                }
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-[var(--ink-soft)]">
                Select campus
                <select
                  className="w-full rounded-xl border border-[color:var(--ghost)] bg-white px-4 py-3 text-sm text-[var(--ink-strong)] outline-none focus:border-[var(--brand-600)]"
                  value={formState.campus}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, campus: event.target.value }))
                  }
                >
                  <option value="">Choose campus</option>
                  {studentCampusOptions.map((item, index) => (
                    <option key={`${index}-${item}`} value={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-semibold text-[var(--ink-soft)]">
                Course
                <select
                  className="w-full rounded-xl border border-[color:var(--ghost)] bg-white px-4 py-3 text-sm text-[var(--ink-strong)] outline-none focus:border-[var(--brand-600)]"
                  value={formState.course}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, course: event.target.value }))
                  }
                >
                  <option value="">Choose course</option>
                  {studentCourseOptions.map((item, index) => (
                    <option key={`${index}-${item}`} value={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="grid gap-2 text-sm font-semibold text-[var(--ink-soft)]">
              Stream
              <select
                className="w-full rounded-xl border border-[color:var(--ghost)] bg-white px-4 py-3 text-sm text-[var(--ink-strong)] outline-none focus:border-[var(--brand-600)]"
                value={formState.stream}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, stream: event.target.value }))
                }
              >
                <option value="">Choose stream</option>
                {studentStreamOptions.map((item, index) => (
                  <option key={`${index}-${item}`} value={item}>{item}</option>
                ))}
              </select>
            </label>
          </>
        ) : null}

        {step === 2 && role === "college" ? (
          <>
            <label className="grid gap-2 text-sm font-semibold text-[var(--ink-soft)]">
              College code
              <input
                className="w-full rounded-xl border border-[color:var(--ghost)] bg-white px-4 py-3 text-sm text-[var(--ink-strong)] outline-none focus:border-[var(--brand-600)]"
                placeholder="Example: COL-2041"
                type="text"
                value={formState.collegeCode}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, collegeCode: event.target.value }))
                }
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-[var(--ink-soft)]">
                Short code
                <input
                  className="w-full rounded-xl border border-[color:var(--ghost)] bg-white px-4 py-3 text-sm text-[var(--ink-strong)] outline-none focus:border-[var(--brand-600)]"
                  placeholder="Example: AOI"
                  type="text"
                  value={formState.collegeShortCode}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, collegeShortCode: event.target.value }))
                  }
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-[var(--ink-soft)]">
                College location
                <select
                  className="w-full rounded-xl border border-[color:var(--ghost)] bg-white px-4 py-3 text-sm text-[var(--ink-strong)] outline-none focus:border-[var(--brand-600)]"
                  value={formState.collegeLocation}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, collegeLocation: event.target.value }))
                  }
                >
                  <option value="">Choose location</option>
                  {collegeLocationOptions.map((item, index) => (
                    <option key={`${index}-${item}`} value={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>
          </>
        ) : null}

        {step === 3 ? (
          <>
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
              />
            </label>

            <p className="text-xs text-[var(--ink-soft)]">Use at least 8 characters with a mix of letters and numbers.</p>
          </>
        ) : null}
      </div>

      {errorMessage ? (
        <p className="rounded-xl bg-[var(--danger-100)] px-4 py-3 text-sm font-semibold text-[var(--danger-700)]">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => {
              setErrorMessage(null);
              setStep((previous) => (previous - 1) as RegisterStep);
            }}
            className="inline-flex items-center justify-center rounded-xl border border-[color:var(--ghost)] bg-white px-4 py-3 text-sm font-semibold text-[var(--ink-strong)]"
          >
            Back
          </button>
        ) : <span />}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          {isSubmitting
            ? "Creating account..."
            : step < 3
              ? "Continue"
              : "Create account"}
        </button>
      </div>
    </form>
  );
}
