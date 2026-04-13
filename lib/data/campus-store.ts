import "server-only";

import { connectMongo } from "@/lib/db";
import { CampusData } from "@/lib/types";
import { ContentStore } from "@/models/ContentStore";

import { defaultCampusData } from "./default-campus-data";

const CONTENT_KEY = "campusphere-main";
const DATE_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});
const BRAND_NAME = "Academic Orbit";
const BRAND_TAGLINE = "A connected digital campus for students and colleges.";

let memoryCampusData: CampusData = normalizeCampusBrand(defaultCampusData);

function cloneCampusData(data: CampusData): CampusData {
  return JSON.parse(JSON.stringify(data)) as CampusData;
}

function normalizeCampusBrand(data: CampusData): CampusData {
  const draft = cloneCampusData(data);

  draft.brand.productName = BRAND_NAME;
  draft.brand.tagline = BRAND_TAGLINE;
  draft.landing.subheadline = draft.landing.subheadline
    .replace(/CampusSphere/gi, BRAND_NAME)
    .replace(/students, colleges, and admins/gi, "students and colleges");

  return draft;
}

function trimCollection<T>(items: T[], size = 12): T[] {
  return items.slice(0, size);
}

function parseDownloadCount(value: string): number {
  const normalized = value.trim().toLowerCase();

  if (normalized.endsWith("k")) {
    const numeric = Number.parseFloat(normalized.slice(0, -1));
    return Number.isNaN(numeric) ? 0 : Math.round(numeric * 1000);
  }

  const parsed = Number.parseInt(normalized.replace(/[^\d]/g, ""), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatDownloadCount(value: number): string {
  if (value >= 1000) {
    const compact = (value / 1000).toFixed(1).replace(/\.0$/, "");
    return `${compact}k`;
  }

  return String(value);
}

function timestampLabel(): string {
  return DATE_FORMATTER.format(new Date());
}

export async function getCampusData(): Promise<CampusData> {
  const connection = await connectMongo();

  if (!connection) {
    memoryCampusData = normalizeCampusBrand(memoryCampusData);
    return cloneCampusData(memoryCampusData);
  }

  const existing = await ContentStore.findOne({ key: CONTENT_KEY }).lean<{
    payload: CampusData;
  } | null>();

  if (existing?.payload) {
    const normalized = normalizeCampusBrand(existing.payload);
    const shouldPersist =
      existing.payload.brand.productName !== normalized.brand.productName
      || existing.payload.brand.tagline !== normalized.brand.tagline
      || existing.payload.landing.subheadline !== normalized.landing.subheadline;

    if (shouldPersist) {
      await ContentStore.findOneAndUpdate(
        { key: CONTENT_KEY },
        { payload: normalized },
        { upsert: true },
      );
    }

    return cloneCampusData(normalized);
  }

  const seededPayload = normalizeCampusBrand(defaultCampusData);

  await ContentStore.create({
    key: CONTENT_KEY,
    payload: seededPayload,
  });

  return cloneCampusData(seededPayload);
}

export async function seedCampusData(reset = false): Promise<{ seeded: boolean }> {
  const connection = await connectMongo();
  const seededPayload = normalizeCampusBrand(defaultCampusData);

  if (!connection) {
    if (reset) {
      memoryCampusData = cloneCampusData(seededPayload);
    }

    return { seeded: false };
  }

  if (reset) {
    await ContentStore.findOneAndUpdate(
      { key: CONTENT_KEY },
      { payload: seededPayload },
      { upsert: true, new: true },
    );
    return { seeded: true };
  }

  const existing = await ContentStore.findOne({ key: CONTENT_KEY }).lean();

  if (!existing) {
    await ContentStore.create({ key: CONTENT_KEY, payload: seededPayload });
  }

  return { seeded: true };
}

export async function updateCampusData(payload: CampusData): Promise<void> {
  const connection = await connectMongo();
  const normalizedPayload = normalizeCampusBrand(payload);

  if (!connection) {
    memoryCampusData = cloneCampusData(normalizedPayload);
    return;
  }

  await ContentStore.findOneAndUpdate(
    { key: CONTENT_KEY },
    { payload: normalizedPayload },
    { upsert: true },
  );
}

export async function mutateCampusData(
  mutator: (draft: CampusData) => void,
): Promise<CampusData> {
  const connection = await connectMongo();

  if (!connection) {
    const draft = cloneCampusData(memoryCampusData);
    mutator(draft);
    memoryCampusData = normalizeCampusBrand(draft);

    return cloneCampusData(memoryCampusData);
  }

  const existing = await ContentStore.findOne({ key: CONTENT_KEY }).lean<{
    payload: CampusData;
  } | null>();

  const draft = existing?.payload
    ? normalizeCampusBrand(existing.payload)
    : normalizeCampusBrand(defaultCampusData);

  mutator(draft);

  const normalized = normalizeCampusBrand(draft);

  await ContentStore.findOneAndUpdate(
    { key: CONTENT_KEY },
    { payload: normalized },
    { upsert: true },
  );

  return normalized;
}

export async function markAttendance(
  subject: string,
  window: string,
  actorName: string,
): Promise<boolean> {
  let marked = false;

  await mutateCampusData((draft) => {
    const slot = draft.student.attendanceTimeline.find(
      (item) => item.subject === subject && item.window === window,
    );

    if (!slot || !slot.canScan) {
      return;
    }

    slot.canScan = false;
    marked = true;

    draft.operations.recentLogs.unshift({
      course: subject,
      timestamp: timestampLabel(),
      status: "Verified",
    });
    draft.operations.recentLogs = trimCollection(draft.operations.recentLogs, 8);

    draft.student.activity.unshift({
      title: subject,
      detail: `Attendance confirmed for ${actorName}`,
      timeLabel: "Just now",
      type: "system",
    });
    draft.student.activity = trimCollection(draft.student.activity, 10);
  });

  return marked;
}

export async function createCommunityPost(input: {
  author: string;
  role: string;
  content: string;
  tag?: string;
}): Promise<void> {
  await mutateCampusData((draft) => {
    draft.community.posts.unshift({
      author: input.author,
      role: input.role,
      ago: "Just now",
      content: input.content,
      likes: 0,
      comments: 0,
      tag: input.tag,
    });

    draft.community.posts = trimCollection(draft.community.posts, 25);

    const activePostStat = draft.student.quickStats.find(
      (item) => item.label === "Active Community Posts",
    );

    if (activePostStat) {
      const parsed = Number.parseInt(activePostStat.value.replace(/[^\d]/g, ""), 10);

      if (!Number.isNaN(parsed)) {
        activePostStat.value = String(parsed + 1);
      }
    }
  });
}

export async function createResource(input: {
  title: string;
  subject: string;
  kind: string;
  contributor: string;
}): Promise<void> {
  await mutateCampusData((draft) => {
    draft.resources.items.unshift({
      title: input.title,
      subject: input.subject,
      kind: input.kind,
      rating: 5,
      downloads: "0",
      contributor: input.contributor,
    });

    draft.resources.items = trimCollection(draft.resources.items, 30);

    const resourceStat = draft.student.quickStats.find(
      (item) => item.label === "New Resources",
    );

    if (resourceStat) {
      const parsed = Number.parseInt(resourceStat.value.replace(/[^\d]/g, ""), 10);

      if (!Number.isNaN(parsed)) {
        resourceStat.value = String(parsed + 1);
      }
    }
  });
}

export async function incrementResourceDownload(title: string): Promise<boolean> {
  let updated = false;

  await mutateCampusData((draft) => {
    const target = draft.resources.items.find((item) => item.title === title);

    if (!target) {
      return;
    }

    const nextCount = parseDownloadCount(target.downloads) + 1;
    target.downloads = formatDownloadCount(nextCount);
    updated = true;
  });

  return updated;
}

export async function reportLostItem(name: string, foundAt: string): Promise<void> {
  await mutateCampusData((draft) => {
    draft.utilities.lostAndFound.unshift({
      name,
      foundAt,
      status: "open",
    });

    draft.utilities.lostAndFound = trimCollection(draft.utilities.lostAndFound, 20);
  });
}

export async function registerMapEvent(title: string): Promise<boolean> {
  let registered = false;

  await mutateCampusData((draft) => {
    const mapEvent = draft.map.events.find((event) => event.title === title);

    if (!mapEvent || mapEvent.slotsLeft <= 0) {
      return;
    }

    mapEvent.slotsLeft -= 1;
    registered = true;

    const communityEvent = draft.community.events.find(
      (event) => event.title === title,
    );

    if (communityEvent && communityEvent.slotsLeft > 0) {
      communityEvent.slotsLeft -= 1;
    }
  });

  return registered;
}

export async function addCollegeUpload(fileName: string): Promise<void> {
  await mutateCampusData((draft) => {
    draft.college.uploadHistory.unshift({
      fileName,
      status: "Queued",
      date: timestampLabel(),
    });

    draft.college.uploadHistory = trimCollection(draft.college.uploadHistory, 20);
  });
}

export async function addAdminIncident(input: {
  category: string;
  issue: string;
  priority: string;
  reporter: string;
}): Promise<void> {
  await mutateCampusData((draft) => {
    draft.admin.incidents.unshift({
      category: input.category,
      issue: input.issue,
      priority: input.priority,
      status: "Pending",
    });
    draft.admin.incidents = trimCollection(draft.admin.incidents, 30);

    draft.admin.auditLogs.unshift({
      action: "INCIDENT",
      detail: `${input.reporter} raised ${input.category}: ${input.issue}`,
      timestamp: timestampLabel(),
    });
    draft.admin.auditLogs = trimCollection(draft.admin.auditLogs, 25);
  });
}

export async function resolveAdminIncident(issue: string): Promise<boolean> {
  let changed = false;

  await mutateCampusData((draft) => {
    const incident = draft.admin.incidents.find((item) => item.issue === issue);

    if (!incident || incident.status === "Resolved") {
      return;
    }

    incident.status = "Resolved";
    changed = true;

    draft.admin.auditLogs.unshift({
      action: "RESOLVE",
      detail: `Incident resolved: ${issue}`,
      timestamp: timestampLabel(),
    });
    draft.admin.auditLogs = trimCollection(draft.admin.auditLogs, 25);
  });

  return changed;
}

export async function generateManualCode(operatorName: string): Promise<string> {
  const code = `MAN-${Math.floor(100000 + Math.random() * 900000)}`;

  await mutateCampusData((draft) => {
    draft.operations.scannerState = `Manual code ${code} issued by ${operatorName}`;
    draft.operations.recentLogs.unshift({
      course: "Manual Override",
      timestamp: timestampLabel(),
      status: code,
    });
    draft.operations.recentLogs = trimCollection(draft.operations.recentLogs, 8);
  });

  return code;
}
