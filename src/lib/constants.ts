export type RoleName = "STUDENT" | "FACULTY" | "ADMIN" | "COLLEGE";

export const ROLE_HOME: Record<RoleName, string> = {
  STUDENT: "/student",
  FACULTY: "/faculty",
  ADMIN: "/admin",
  COLLEGE: "/college",
};

export type NavLink = {
  href: string;
  label: string;
};

export const studentLinks: NavLink[] = [
  { href: "/student", label: "Dashboard" },
  { href: "/student/attendance", label: "Attendance" },
  { href: "/student/resources", label: "Resources" },
  { href: "/student/utilities", label: "Utilities" },
  { href: "/student/events", label: "Events" },
  { href: "/student/navigation", label: "Campus Navigation" },
  { href: "/student/complaints", label: "Complaints" },
];

export const facultyLinks: NavLink[] = [
  { href: "/faculty", label: "Dashboard" },
  { href: "/faculty/attendance", label: "Attendance" },
  { href: "/faculty/resources", label: "Resources" },
  { href: "/faculty/announcements", label: "Announcements" },
  { href: "/faculty/events", label: "Events" },
];

export const adminLinks: NavLink[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/complaints", label: "Complaints" },
  { href: "/admin/notices", label: "Notices" },
  { href: "/admin/hostel", label: "Hostel" },
  { href: "/admin/resources", label: "Resource Monitoring" },
  { href: "/admin/users", label: "User Management" },
];

export const collegeLinks: NavLink[] = [
  { href: "/college", label: "Dashboard" },
  { href: "/college/departments", label: "Departments" },
  { href: "/college/faculty", label: "Faculty" },
  { href: "/college/students", label: "Students" },
  { href: "/college/analytics", label: "Analytics" },
];

export const complaintTypes = [
  "HOSTEL",
  "MESS",
  "INFRASTRUCTURE",
  "ACADEMIC",
  "GENERAL",
] as const;

export const resourceCategories = [
  "NOTES",
  "ASSIGNMENTS",
  "LAB_FILES",
  "QUESTION_PAPERS",
  "STUDY_MATERIAL",
  "RECORDED_LECTURES",
  "DEPARTMENT",
] as const;

export const noticeCategories = ["ACADEMIC", "ADMINISTRATIVE", "EMERGENCY"] as const;

export const attendanceMethods = ["QR", "GEOFENCING", "MANUAL"] as const;
