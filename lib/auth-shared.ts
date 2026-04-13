export type UserRole = "student" | "college" | "admin";

export interface DemoCredential {
  role: UserRole;
  name: string;
  email: string;
  password: string;
  landingPath: string;
}

export const demoCredentials: DemoCredential[] = [
  {
    role: "student",
    name: "Aarav Mehta",
    email: "student@campusphere.app",
    password: "Student@123",
    landingPath: "/student/dashboard",
  },
  {
    role: "college",
    name: "Meera Sharma",
    email: "college@campusphere.app",
    password: "College@123",
    landingPath: "/college/dashboard",
  },
  {
    role: "admin",
    name: "Rohan Kapoor",
    email: "admin@campusphere.app",
    password: "Admin@123",
    landingPath: "/admin/dashboard",
  },
];

export function roleLandingPath(role: UserRole): string {
  switch (role) {
    case "student":
      return "/student/dashboard";
    case "college":
      return "/college/dashboard";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/login";
  }
}