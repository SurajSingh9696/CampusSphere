import { CampusData } from "@/lib/types";

export const defaultCampusData: CampusData = {
  brand: {
    productName: "Academic Orbit",
    platformLabel: "Unified Campus Portal",
    tagline: "A connected digital campus for students and colleges.",
    version: "v5.0.0",
  },
  landing: {
    headline: "Your Campus, Unified In One Intelligent Workspace",
    subheadline:
      "Academic Orbit brings academics, attendance, resources, community, and operations into a single live platform.",
    studentValueProps: [
      "Track attendance and class plans in real time",
      "Discover peer-reviewed notes and resources",
      "Join campus communities and study groups",
    ],
    adminValueProps: [
      "Central governance dashboard for institutions",
      "Operational issue tracking and notices",
      "Cross-campus analytics and audit visibility",
    ],
    workflowSteps: [
      "Sign in with your portal role",
      "Navigate dashboards with a shared design language",
      "Take actions powered by a live MongoDB backend",
    ],
  },
  student: {
    greeting: "Welcome back, Curator Julian.",
    quickStats: [
      {
        label: "Overall Attendance",
        value: "94.2%",
        hint: "Up 2.1% from last month",
        tone: "primary",
      },
      {
        label: "New Resources",
        value: "12",
        hint: "Added in the last 24h",
        tone: "teal",
      },
      {
        label: "Active Community Posts",
        value: "28",
        hint: "Trending in Quantum Lab",
        tone: "violet",
      },
    ],
    activity: [
      {
        title: "Advanced Calculus II",
        detail: "Assignment graded A (96/100)",
        timeLabel: "2h ago",
        type: "grade",
      },
      {
        title: "Campus Milestone",
        detail: "Digital Innovation of the Year award announced",
        timeLabel: "Yesterday",
        type: "milestone",
      },
      {
        title: "System Update",
        detail: "Ethical Design thesis uploaded to resources",
        timeLabel: "2 days ago",
        type: "system",
      },
    ],
    marketplace: [
      {
        name: "MacBook Pro M2 (Open Box)",
        price: "$1,199",
        description:
          "Perfect for CS students with academic software bundle.",
        badge: "Featured",
      },
      {
        name: "Ergonomic Tech Pack",
        price: "$45",
        description: "Keyboard, mouse pad, and wrist support combo.",
      },
      {
        name: "Spring Gala Ticket",
        price: "$20",
        description: "Student entry pass for annual gala night.",
      },
    ],
    attendanceTimeline: [
      { subject: "Physics", window: "09:00 - 10:00", canScan: true },
      { subject: "Math", window: "10:00 - 11:00", canScan: false },
      { subject: "Chemistry", window: "11:00 - 12:00", canScan: false },
      { subject: "Computer Science", window: "12:00 - 13:00", canScan: false },
      { subject: "English", window: "14:00 - 15:00", canScan: false },
    ],
  },
  resources: {
    filters: [
      "All Resources",
      "Midterm Prep",
      "Summaries",
      "Flashcards",
      "Lab Reports",
    ],
    items: [
      {
        title: "Advanced Thermodynamics Vol. 2",
        subject: "Mechanical Engineering",
        kind: "Midterm Prep",
        rating: 4.9,
        downloads: "1.8k",
        contributor: "Alex Mercer",
      },
      {
        title: "Cognitive Psychology Core Concepts",
        subject: "Behavioral Sciences",
        kind: "Summary",
        rating: 4.7,
        downloads: "850",
        contributor: "Sarah Lin",
      },
      {
        title: "Modern Architecture Eras",
        subject: "Art History",
        kind: "Flashcards",
        rating: 5,
        downloads: "2.1k",
        contributor: "Daniel Kim",
      },
      {
        title: "Microeconomics Problem Set",
        subject: "Economics",
        kind: "Midterm Prep",
        rating: 4.8,
        downloads: "1.2k",
        contributor: "Priyan V",
      },
    ],
    contributors: [
      { name: "Alex Mercer", points: "12.4k" },
      { name: "Sarah Lin", points: "11.8k" },
      { name: "Daniel Kim", points: "11.1k" },
    ],
  },
  community: {
    posts: [
      {
        author: "Emily Martinez",
        role: "Architecture",
        ago: "2h ago",
        content:
          "The new library annex lighting is perfect for late-night drafting. Highly recommend the corner desks.",
        likes: 124,
        comments: 18,
      },
      {
        author: "James Wilson",
        role: "Computer Science",
        ago: "5h ago",
        content:
          "Looking for Advanced Algorithms study partners for Tuesday and Thursday sessions.",
        likes: 42,
        comments: 31,
        tag: "Academics",
      },
    ],
    trending: [
      "#CampusCareerFair",
      "#HackThePrism",
      "#FinalsWeekSurvival",
    ],
    events: [
      {
        title: "UI/UX Design Masterclass",
        venue: "Design Studio A",
        scheduleLabel: "Sept 24, 2:00 PM",
        slotsLeft: 45,
      },
      {
        title: "Entrepreneurship Summit",
        venue: "Main Auditorium",
        scheduleLabel: "Sept 28, 10:00 AM",
        slotsLeft: 60,
      },
      {
        title: "AI in Architecture",
        venue: "Innovation Lab Wing B",
        scheduleLabel: "Today, 9:00 AM",
        slotsLeft: 12,
      },
    ],
    groups: [
      { name: "Advanced Physics", liveCount: "12 Live" },
      { name: "Organic Chemistry", liveCount: "5 Live" },
      { name: "Data Structures", liveCount: "9 Live" },
    ],
  },
  utilities: {
    studyBuddies: [
      {
        name: "David K.",
        major: "Computer Science",
        year: "Junior",
        skills: ["Python", "Data Structures"],
      },
      {
        name: "Sarah L.",
        major: "Economics",
        year: "Sophomore",
        skills: ["Microeconomics", "Calculus II"],
      },
      {
        name: "Marcus T.",
        major: "Physics",
        year: "Senior",
        skills: ["Astrophysics", "LaTeX"],
      },
    ],
    lostAndFound: [
      {
        name: "MacBook Pro M2",
        foundAt: "Engineering Library",
        status: "open",
      },
      {
        name: "Honda Car Keys",
        foundAt: "Student Union",
        status: "open",
      },
      {
        name: "Prescription Glasses",
        foundAt: "Campus Cafe",
        status: "claimed",
      },
      {
        name: "Yellow Knit Scarf",
        foundAt: "Arts Courtyard",
        status: "open",
      },
    ],
  },
  map: {
    locations: [
      {
        name: "Main Library Wing",
        note: "Quiet zones available on Floor 3",
        isOpen: true,
      },
      {
        name: "Bio-Chem Lab B-12",
        note: "Validated geofence zone",
        isOpen: true,
      },
      {
        name: "Auditorium A",
        note: "Today: Quantum Computing session",
        isOpen: false,
      },
    ],
    events: [
      {
        title: "AI in Architecture",
        venue: "Innovation Lab Wing B",
        scheduleLabel: "9:00 AM - Live",
        slotsLeft: 12,
      },
      {
        title: "Quantum Basics for Non-Scientists",
        venue: "Auditorium A",
        scheduleLabel: "1:30 PM - Today",
        slotsLeft: 45,
      },
      {
        title: "Sustainable Energy Workshop",
        venue: "Green Hall",
        scheduleLabel: "4:00 PM - Today",
        slotsLeft: 8,
      },
    ],
    milestone: "University Gala Night in 3 days at Central Plaza",
  },
  operations: {
    scannerState: "Live scanner active",
    geofenceRadius: "12m",
    attendanceRate: "94.2%",
    streak: "12 Days",
    recentLogs: [
      {
        course: "Quantum Physics II",
        timestamp: "Nov 24, 09:02 AM",
        status: "Verified",
      },
      {
        course: "Digital Ethics Seminar",
        timestamp: "Nov 23, 02:15 PM",
        status: "Verified",
      },
    ],
  },
  college: {
    stats: [
      {
        label: "Total Students",
        value: "12.4k",
        hint: "Institutional reach",
        tone: "primary",
      },
      {
        label: "Faculty Count",
        value: "842",
        hint: "Active this semester",
        tone: "teal",
      },
      {
        label: "Active Events",
        value: "12",
        hint: "Campus-wide",
        tone: "violet",
      },
    ],
    uploadHistory: [
      {
        fileName: "freshmen_batch_2024.csv",
        status: "Processed",
        date: "Oct 24, 2023",
      },
      {
        fileName: "engineering_sem3_results.xlsx",
        status: "Verifying",
        date: "Oct 23, 2023",
      },
    ],
    attendanceSubjects: [
      {
        subject: "Advanced Algorithms",
        average: "94%",
        nextSlot: "Tomorrow 10:00 AM",
      },
      {
        subject: "Quantum Physics II",
        average: "78%",
        nextSlot: "Monday 09:00 AM",
      },
      {
        subject: "Data Structures",
        average: "88%",
        nextSlot: "Today 02:00 PM",
      },
    ],
    schedule: [
      {
        time: "09:00",
        monday: "CS-402 / Lab 1",
        tuesday: "-",
        wednesday: "PH-301 / Hall B",
        thursday: "-",
        friday: "CS-201 / Lab 4",
      },
      {
        time: "11:00",
        monday: "-",
        tuesday: "MA-105 / Hall A",
        wednesday: "-",
        thursday: "EN-220 / Hall C",
        friday: "-",
      },
    ],
  },
  admin: {
    stats: [
      {
        label: "Active Complaints",
        value: "24",
        hint: "4 new since morning",
        tone: "primary",
      },
      {
        label: "Hostel Occupancy",
        value: "92%",
        hint: "1240 of 1350 rooms",
        tone: "teal",
      },
      {
        label: "Unread Notices",
        value: "06",
        hint: "Pending digital signature",
        tone: "violet",
      },
      {
        label: "Network Health",
        value: "99.9%",
        hint: "Operational uptime",
        tone: "neutral",
      },
    ],
    incidents: [
      {
        category: "Hostel",
        issue: "B-Block water leakage (Room 402)",
        priority: "Critical",
        status: "Pending",
      },
      {
        category: "IT / WiFi",
        issue: "Library node failure - North Wing",
        priority: "High",
        status: "Pending",
      },
      {
        category: "Maintenance",
        issue: "Elevator A-2 scheduled service",
        priority: "Normal",
        status: "Resolved",
      },
    ],
    auditLogs: [
      {
        action: "SUSPEND",
        detail: "Pacific Global Institute suspended for credential audit failure",
        timestamp: "09:42 AM",
      },
      {
        action: "CONFIG",
        detail: "Global firewall rules updated with protocol X-72",
        timestamp: "08:15 AM",
      },
      {
        action: "VERIFY",
        detail: "452 student applications verified from London campus",
        timestamp: "Yesterday",
      },
      {
        action: "ALERT",
        detail: "Security breach attempt detected on Node 14 and blocked",
        timestamp: "Yesterday",
      },
    ],
    institutions: [
      {
        name: "Imperial Institute of Tech",
        location: "London, UK",
        activeUsers: "4,502",
        status: "Verified",
      },
      {
        name: "Global Arts Academy",
        location: "Paris, France",
        activeUsers: "1,280",
        status: "Suspended",
      },
      {
        name: "Silicon Valley University",
        location: "California, US",
        activeUsers: "8,901",
        status: "Verified",
      },
    ],
  },
};
