export type Tone = "primary" | "teal" | "violet" | "danger" | "neutral";

export interface StatCard {
  label: string;
  value: string;
  hint?: string;
  tone?: Tone;
}

export interface ActivityItem {
  title: string;
  detail: string;
  timeLabel: string;
  type: "grade" | "milestone" | "system";
}

export interface MarketItem {
  name: string;
  price: string;
  description: string;
  badge?: string;
}

export interface TimelineEntry {
  subject: string;
  window: string;
  canScan: boolean;
}

export interface ResourceItem {
  title: string;
  subject: string;
  kind: string;
  rating: number;
  downloads: string;
  contributor: string;
}

export interface Contributor {
  name: string;
  points: string;
}

export interface CommunityPost {
  author: string;
  role: string;
  ago: string;
  content: string;
  likes: number;
  comments: number;
  tag?: string;
}

export interface EventItem {
  title: string;
  venue: string;
  scheduleLabel: string;
  slotsLeft: number;
}

export interface StudyGroup {
  name: string;
  liveCount: string;
}

export interface StudyBuddy {
  name: string;
  major: string;
  year: string;
  skills: string[];
}

export interface LostFoundItem {
  name: string;
  foundAt: string;
  status: "claimed" | "open";
}

export interface MapLocation {
  name: string;
  note: string;
  isOpen: boolean;
}

export interface AttendanceLog {
  course: string;
  timestamp: string;
  status: string;
}

export interface UploadRecord {
  fileName: string;
  status: string;
  date: string;
}

export interface SubjectMetric {
  subject: string;
  average: string;
  nextSlot: string;
}

export interface ScheduleRow {
  time: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
}

export interface Incident {
  category: string;
  issue: string;
  priority: string;
  status: string;
}

export interface AuditLog {
  action: string;
  detail: string;
  timestamp: string;
}

export interface Institution {
  name: string;
  location: string;
  activeUsers: string;
  status: string;
}

export interface CampusData {
  brand: {
    productName: string;
    platformLabel: string;
    tagline: string;
    version: string;
  };
  landing: {
    headline: string;
    subheadline: string;
    studentValueProps: string[];
    adminValueProps: string[];
    workflowSteps: string[];
  };
  student: {
    greeting: string;
    quickStats: StatCard[];
    activity: ActivityItem[];
    marketplace: MarketItem[];
    attendanceTimeline: TimelineEntry[];
  };
  resources: {
    filters: string[];
    items: ResourceItem[];
    contributors: Contributor[];
  };
  community: {
    posts: CommunityPost[];
    trending: string[];
    events: EventItem[];
    groups: StudyGroup[];
  };
  utilities: {
    studyBuddies: StudyBuddy[];
    lostAndFound: LostFoundItem[];
  };
  map: {
    locations: MapLocation[];
    events: EventItem[];
    milestone: string;
  };
  operations: {
    scannerState: string;
    geofenceRadius: string;
    attendanceRate: string;
    streak: string;
    recentLogs: AttendanceLog[];
  };
  college: {
    stats: StatCard[];
    uploadHistory: UploadRecord[];
    attendanceSubjects: SubjectMetric[];
    schedule: ScheduleRow[];
  };
  admin: {
    stats: StatCard[];
    incidents: Incident[];
    auditLogs: AuditLog[];
    institutions: Institution[];
  };
}
