import { redirect } from "next/navigation";
import { loginAction } from "@/lib/actions";
import { readSession, roleHome } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

const demoAccounts = [
  { role: "Student", email: "student@campusphere.edu" },
  { role: "Faculty", email: "faculty@campusphere.edu" },
  { role: "Administration", email: "admin@campusphere.edu" },
  { role: "College Management", email: "college@campusphere.edu" },
];

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await readSession();
  if (session) {
    redirect(roleHome(session.role));
  }

  const params = await searchParams;
  const hasError = params.error === "invalid";

  return (
    <div className="login-shell">
      <section className="login-left glass-panel">
        <h1>CampusSphere Campus Operating System</h1>
        <p>
          Real full-stack university workflow platform with role-based access for students, faculty,
          administration, and college management.
        </p>
        <div className="credential-grid">
          {demoAccounts.map((account) => (
            <article className="credential-item" key={account.email}>
              <strong>{account.role}</strong>
              <p>{account.email}</p>
              <p>Password: Campus@123</p>
            </article>
          ))}
        </div>
      </section>
      <section className="login-right glass-panel">
        <h2>Sign In</h2>
        <p>Use institutional credentials to access your portal.</p>
        {hasError ? <div className="error-badge">Invalid email or password.</div> : null}
        <form action={loginAction} className="login-form">
          <label>
            Email
            <input name="email" placeholder="you@campusphere.edu" required type="email" />
          </label>
          <label>
            Password
            <input name="password" placeholder="••••••••" required type="password" />
          </label>
          <button className="button" type="submit">
            Enter Platform
          </button>
        </form>
      </section>
    </div>
  );
}
