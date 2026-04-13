"use server";

import { revalidatePath } from "next/cache";

import { requireSession } from "@/lib/auth";
import {
  addAdminIncident,
  addCollegeUpload,
  createCommunityPost,
  createResource,
  generateManualCode,
  incrementResourceDownload,
  markAttendance,
  registerMapEvent,
  reportLostItem,
  resolveAdminIncident,
} from "@/lib/data/campus-store";

function readField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function markAttendanceAction(formData: FormData): Promise<void> {
  const session = await requireSession(["student", "admin"]);
  const subject = readField(formData, "subject");
  const window = readField(formData, "window");

  if (!subject || !window) {
    return;
  }

  await markAttendance(subject, window, session.name);

  revalidatePath("/student/dashboard");
  revalidatePath("/student/attendance");
  revalidatePath("/operations/attendance");
}

export async function submitCommunityPostAction(formData: FormData): Promise<void> {
  const session = await requireSession(["student", "admin"]);
  const content = readField(formData, "content");
  const tag = readField(formData, "tag");

  if (!content) {
    return;
  }

  await createCommunityPost({
    author: session.name,
    role: session.role,
    content,
    tag: tag || undefined,
  });

  revalidatePath("/student/dashboard");
  revalidatePath("/student/community");
}

export async function uploadResourceAction(formData: FormData): Promise<void> {
  const session = await requireSession(["student", "admin"]);
  const title = readField(formData, "title");
  const subject = readField(formData, "subject");
  const kind = readField(formData, "kind");

  if (!title || !subject || !kind) {
    return;
  }

  await createResource({
    title,
    subject,
    kind,
    contributor: session.name,
  });

  revalidatePath("/student/dashboard");
  revalidatePath("/student/resources");
}

export async function downloadResourceAction(formData: FormData): Promise<void> {
  await requireSession(["student", "admin"]);
  const title = readField(formData, "title");

  if (!title) {
    return;
  }

  await incrementResourceDownload(title);

  revalidatePath("/student/resources");
}

export async function reportLostItemAction(formData: FormData): Promise<void> {
  await requireSession(["student", "admin"]);
  const name = readField(formData, "name");
  const foundAt = readField(formData, "foundAt");

  if (!name || !foundAt) {
    return;
  }

  await reportLostItem(name, foundAt);

  revalidatePath("/student/utilities");
}

export async function registerMapEventAction(formData: FormData): Promise<void> {
  await requireSession(["student", "college", "admin"]);
  const title = readField(formData, "title");

  if (!title) {
    return;
  }

  await registerMapEvent(title);

  revalidatePath("/campus/map");
  revalidatePath("/student/community");
}

export async function addCollegeUploadAction(formData: FormData): Promise<void> {
  await requireSession(["college", "admin"]);
  const fileName = readField(formData, "fileName");

  if (!fileName) {
    return;
  }

  await addCollegeUpload(fileName);

  revalidatePath("/college/dashboard");
}

export async function createAdminIncidentAction(formData: FormData): Promise<void> {
  const session = await requireSession(["admin"]);
  const category = readField(formData, "category");
  const issue = readField(formData, "issue");
  const priority = readField(formData, "priority");

  if (!category || !issue || !priority) {
    return;
  }

  await addAdminIncident({
    category,
    issue,
    priority,
    reporter: session.name,
  });

  revalidatePath("/admin/dashboard");
}

export async function resolveAdminIncidentAction(formData: FormData): Promise<void> {
  await requireSession(["admin"]);
  const issue = readField(formData, "issue");

  if (!issue) {
    return;
  }

  await resolveAdminIncident(issue);

  revalidatePath("/admin/dashboard");
}

export async function generateManualCodeAction(): Promise<void> {
  const session = await requireSession(["college", "admin"]);

  await generateManualCode(session.name);

  revalidatePath("/operations/attendance");
}