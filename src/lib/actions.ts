"use server";

import {
  AttendanceMethod,
  AttendanceStatus,
  ComplaintStatus,
  ComplaintType,
  EventRegistrationStatus,
  ItemType,
  MessageScope,
  NoticeCategory,
  NotificationType,
  ResourceCategory,
  Role,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSession, clearSession, authenticate, hashPassword, requireAuth, roleHome } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { distanceInMeters } from "@/lib/utils";

function requiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  if (!value || typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing ${key}`);
  }
  return value.trim();
}

function optionalString(formData: FormData, key: string) {
  const value = formData.get(key);
  if (!value || typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function optionalInt(formData: FormData, key: string) {
  const value = optionalString(formData, key);
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function optionalFloat(formData: FormData, key: string) {
  const value = optionalString(formData, key);
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function notifyUser(userId: string, type: NotificationType, title: string, message: string, link?: string) {
  await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link,
    },
  });
}

async function notifyRole(role: Role, type: NotificationType, title: string, message: string, link?: string) {
  const users = await prisma.user.findMany({
    where: { role },
    select: { id: true },
  });
  if (!users.length) {
    return;
  }
  await prisma.notification.createMany({
    data: users.map((user) => ({
      userId: user.id,
      type,
      title,
      message,
      link,
    })),
  });
}

async function notifyStudentsBySubject(
  subjectId: string,
  type: NotificationType,
  title: string,
  message: string,
  link?: string,
) {
  const enrollments = await prisma.enrollment.findMany({
    where: { subjectId },
    select: {
      studentProfile: {
        select: { userId: true },
      },
    },
  });

  if (!enrollments.length) {
    return;
  }

  await prisma.notification.createMany({
    data: enrollments.map((enrollment) => ({
      userId: enrollment.studentProfile.userId,
      type,
      title,
      message,
      link,
    })),
  });
}

async function notifyStudentsByDepartment(
  departmentId: string,
  type: NotificationType,
  title: string,
  message: string,
  link?: string,
  semester?: number | null,
) {
  const students = await prisma.studentProfile.findMany({
    where: {
      departmentId,
      ...(semester ? { semester } : {}),
    },
    select: { userId: true },
  });

  if (!students.length) {
    return;
  }

  await prisma.notification.createMany({
    data: students.map((student) => ({
      userId: student.userId,
      type,
      title,
      message,
      link,
    })),
  });
}

async function studentAttendancePercentage(studentProfileId: string, subjectId: string) {
  const records = await prisma.attendanceRecord.findMany({
    where: {
      studentProfileId,
      session: {
        subjectId,
      },
    },
    select: {
      status: true,
    },
  });

  if (!records.length) {
    return 0;
  }

  const attended = records.filter(
    (record) => record.status === AttendanceStatus.PRESENT || record.status === AttendanceStatus.LATE,
  ).length;
  return (attended / records.length) * 100;
}

export async function loginAction(formData: FormData) {
  const email = requiredString(formData, "email").toLowerCase();
  const password = requiredString(formData, "password");
  const user = await authenticate(email, password);

  if (!user) {
    redirect("/login?error=invalid");
  }

  await createSession({
    uid: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  redirect(roleHome(user.role));
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

export async function markNotificationReadAction(formData: FormData) {
  const session = await requireAuth();
  const notificationId = requiredString(formData, "notificationId");

  if (notificationId === "all") {
    await prisma.notification.updateMany({
      where: { userId: session.uid, readAt: null },
      data: { readAt: new Date() },
    });
  } else {
    await prisma.notification.updateMany({
      where: { id: notificationId, userId: session.uid },
      data: { readAt: new Date() },
    });
  }

  revalidatePath("/student");
  revalidatePath("/faculty");
  revalidatePath("/admin");
  revalidatePath("/college");
}

export async function createAttendanceSessionAction(formData: FormData) {
  const session = await requireAuth([Role.FACULTY]);
  const facultyProfile = await prisma.facultyProfile.findUnique({ where: { userId: session.uid } });
  if (!facultyProfile) {
    throw new Error("Faculty profile not found");
  }

  const subjectId = requiredString(formData, "subjectId");
  const method = requiredString(formData, "method") as AttendanceMethod;
  const sessionDate = requiredString(formData, "sessionDate");
  const startTime = requiredString(formData, "startTime");
  const endTime = requiredString(formData, "endTime");
  const geoLat = optionalFloat(formData, "geoLat");
  const geoLng = optionalFloat(formData, "geoLng");
  const radius = optionalInt(formData, "radiusMeters");

  const canManageSubject = await prisma.subjectFaculty.findFirst({
    where: {
      subjectId,
      facultyProfileId: facultyProfile.id,
    },
  });

  if (!canManageSubject) {
    throw new Error("Unauthorized subject");
  }

  const attendanceSession = await prisma.attendanceSession.create({
    data: {
      subjectId,
      facultyProfileId: facultyProfile.id,
      sessionDate: new Date(sessionDate),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      method,
      qrToken: method === AttendanceMethod.QR ? crypto.randomUUID() : null,
      geoLat: method === AttendanceMethod.GEOFENCING ? geoLat : null,
      geoLng: method === AttendanceMethod.GEOFENCING ? geoLng : null,
      radiusMeters: method === AttendanceMethod.GEOFENCING ? radius : null,
      isActive: false,
    },
    include: {
      subject: true,
    },
  });

  const enrollments = await prisma.enrollment.findMany({
    where: { subjectId },
    select: { studentProfileId: true },
  });

  if (enrollments.length) {
    await prisma.attendanceRecord.createMany({
      data: enrollments.map((enrollment) => ({
        sessionId: attendanceSession.id,
        studentProfileId: enrollment.studentProfileId,
        status: AttendanceStatus.ABSENT,
      })),
    });
  }

  await notifyStudentsBySubject(
    subjectId,
    NotificationType.ATTENDANCE,
    "Attendance Session Created",
    `${attendanceSession.subject.title} attendance has been scheduled by faculty.`,
    "/student/attendance",
  );

  revalidatePath("/faculty/attendance");
}

export async function toggleAttendanceWindowAction(formData: FormData) {
  const session = await requireAuth([Role.FACULTY]);
  const attendanceSessionId = requiredString(formData, "attendanceSessionId");
  const open = requiredString(formData, "open") === "true";

  const attendanceSession = await prisma.attendanceSession.findFirst({
    where: {
      id: attendanceSessionId,
      facultyProfile: { userId: session.uid },
    },
    include: {
      subject: true,
    },
  });

  if (!attendanceSession) {
    throw new Error("Attendance session not found");
  }

  await prisma.attendanceSession.update({
    where: { id: attendanceSession.id },
    data: { isActive: open },
  });

  if (open) {
    await notifyStudentsBySubject(
      attendanceSession.subjectId,
      NotificationType.ATTENDANCE,
      "Attendance Window Live",
      `${attendanceSession.subject.title} attendance window is open now.`,
      "/student/attendance",
    );
  }

  revalidatePath("/faculty/attendance");
}

export async function markAttendanceAction(formData: FormData) {
  const session = await requireAuth([Role.FACULTY]);
  const attendanceRecordId = requiredString(formData, "attendanceRecordId");
  const status = requiredString(formData, "status") as AttendanceStatus;

  const record = await prisma.attendanceRecord.findFirst({
    where: {
      id: attendanceRecordId,
      session: {
        facultyProfile: {
          userId: session.uid,
        },
      },
    },
    include: {
      session: {
        include: {
          subject: true,
        },
      },
      studentProfile: true,
    },
  });

  if (!record) {
    throw new Error("Attendance record not found");
  }

  await prisma.attendanceRecord.update({
    where: { id: record.id },
    data: {
      status,
      method: AttendanceMethod.MANUAL,
      markedAt: new Date(),
    },
  });

  const percentage = await studentAttendancePercentage(record.studentProfileId, record.session.subjectId);
  if (percentage < 75) {
    await notifyUser(
      record.studentProfile.userId,
      NotificationType.ATTENDANCE,
      "Attendance Alert",
      `Your ${record.session.subject.title} attendance is ${Math.round(percentage)}% and below threshold.`,
      "/student/attendance",
    );
  }

  revalidatePath("/faculty/attendance");
  revalidatePath("/student/attendance");
}

export async function scanAttendanceAction(formData: FormData) {
  const session = await requireAuth([Role.STUDENT]);
  const qrToken = requiredString(formData, "qrToken");
  const studentProfile = await prisma.studentProfile.findUnique({ where: { userId: session.uid } });
  if (!studentProfile) {
    throw new Error("Student profile not found");
  }

  const now = new Date();
  const attendanceSession = await prisma.attendanceSession.findFirst({
    where: {
      qrToken,
      isActive: true,
      startTime: { lte: now },
      endTime: { gte: now },
    },
    include: { subject: true },
  });

  if (!attendanceSession) {
    throw new Error("Session unavailable");
  }

  if (attendanceSession.method === AttendanceMethod.GEOFENCING) {
    const lat = optionalFloat(formData, "lat");
    const lng = optionalFloat(formData, "lng");
    if (
      lat === null ||
      lng === null ||
      attendanceSession.geoLat === null ||
      attendanceSession.geoLng === null ||
      attendanceSession.radiusMeters === null
    ) {
      throw new Error("Location unavailable");
    }

    const distance = distanceInMeters(lat, lng, attendanceSession.geoLat, attendanceSession.geoLng);
    if (distance > attendanceSession.radiusMeters) {
      throw new Error("Outside geofence");
    }
  }

  await prisma.attendanceRecord.updateMany({
    where: {
      sessionId: attendanceSession.id,
      studentProfileId: studentProfile.id,
    },
    data: {
      status: AttendanceStatus.PRESENT,
      method: attendanceSession.method,
      markedAt: new Date(),
    },
  });

  await notifyUser(
    session.uid,
    NotificationType.ATTENDANCE,
    "Attendance Marked",
    `${attendanceSession.subject.title} attendance marked successfully.`,
    "/student/attendance",
  );

  revalidatePath("/student/attendance");
}

export async function uploadResourceAction(formData: FormData) {
  const session = await requireAuth([Role.FACULTY, Role.ADMIN]);
  const title = requiredString(formData, "title");
  const description = requiredString(formData, "description");
  const category = requiredString(formData, "category") as ResourceCategory;
  const fileUrl = requiredString(formData, "fileUrl");
  const subjectId = optionalString(formData, "subjectId");
  const departmentId = optionalString(formData, "departmentId");
  const semester = optionalInt(formData, "semester");

  const resource = await prisma.resource.create({
    data: {
      title,
      description,
      category,
      fileUrl,
      subjectId,
      departmentId,
      semester,
      uploaderId: session.uid,
      approved: session.role === Role.ADMIN,
    },
  });

  if (session.role === Role.FACULTY) {
    if (subjectId) {
      await notifyStudentsBySubject(
        subjectId,
        NotificationType.RESOURCE,
        "New Resource Uploaded",
        `${title} is now available for your class.`,
        "/student/resources",
      );
    } else if (departmentId) {
      await notifyStudentsByDepartment(
        departmentId,
        NotificationType.RESOURCE,
        "New Department Resource",
        `${title} is available in your department resources.`,
        "/student/resources",
        semester,
      );
    }
  }

  if (!resource.approved) {
    await notifyRole(
      Role.ADMIN,
      NotificationType.RESOURCE,
      "Resource Approval Pending",
      `${title} requires admin approval.`,
      "/admin/resources",
    );
  }

  revalidatePath("/faculty/resources");
  revalidatePath("/admin/resources");
  revalidatePath("/student/resources");
}

export async function postAnnouncementAction(formData: FormData) {
  const session = await requireAuth([Role.FACULTY]);
  const title = requiredString(formData, "title");
  const content = requiredString(formData, "content");
  const category = (optionalString(formData, "category") as NoticeCategory | null) ?? NoticeCategory.ACADEMIC;
  const targetRole = (optionalString(formData, "targetRole") as Role | null) ?? Role.STUDENT;
  const departmentId = optionalString(formData, "departmentId");
  const subjectId = optionalString(formData, "subjectId");

  await prisma.notice.create({
    data: {
      title,
      content,
      category,
      targetRole,
      departmentId,
      subjectId,
      createdById: session.uid,
    },
  });

  await notifyRole(
    targetRole,
    NotificationType.ANNOUNCEMENT,
    title,
    content,
    targetRole === Role.STUDENT ? "/student" : "/faculty",
  );

  revalidatePath("/faculty/announcements");
  revalidatePath("/student");
}

export async function createEventAction(formData: FormData) {
  const session = await requireAuth([Role.FACULTY, Role.ADMIN, Role.COLLEGE]);
  const title = requiredString(formData, "title");
  const description = requiredString(formData, "description");
  const date = requiredString(formData, "date");
  const location = requiredString(formData, "location");
  const organizer = requiredString(formData, "organizer");
  const posterUrl = optionalString(formData, "posterUrl");
  const departmentId = optionalString(formData, "departmentId");
  const capacity = optionalInt(formData, "capacity");

  await prisma.event.create({
    data: {
      title,
      description,
      date: new Date(date),
      location,
      organizer,
      posterUrl,
      departmentId,
      capacity,
      createdById: session.uid,
    },
  });

  await notifyRole(
    Role.STUDENT,
    NotificationType.EVENT,
    "New Campus Event",
    `${title} is open for registration.`,
    "/student/events",
  );

  revalidatePath("/faculty/events");
  revalidatePath("/student/events");
  revalidatePath("/admin");
  revalidatePath("/college");
}

export async function registerEventAction(formData: FormData) {
  const session = await requireAuth([Role.STUDENT, Role.FACULTY, Role.ADMIN, Role.COLLEGE]);
  const eventId = requiredString(formData, "eventId");

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      registrations: {
        where: { status: EventRegistrationStatus.REGISTERED },
      },
    },
  });

  if (!event) {
    throw new Error("Event not found");
  }

  const status =
    event.capacity && event.registrations.length >= event.capacity
      ? EventRegistrationStatus.WAITLISTED
      : EventRegistrationStatus.REGISTERED;

  await prisma.eventRegistration.upsert({
    where: {
      eventId_userId: {
        eventId,
        userId: session.uid,
      },
    },
    update: {
      status,
    },
    create: {
      eventId,
      userId: session.uid,
      status,
    },
  });

  await notifyUser(
    session.uid,
    NotificationType.EVENT,
    status === EventRegistrationStatus.REGISTERED ? "Event Registered" : "Event Waitlisted",
    `${event.title} registration is ${status.toLowerCase()}.`,
    "/student/events",
  );

  await notifyUser(
    event.createdById,
    NotificationType.EVENT,
    "New Event Registration",
    `${session.name} registered for ${event.title}.`,
    "/faculty/events",
  );

  revalidatePath("/student/events");
  revalidatePath("/faculty/events");
}

export async function bookmarkEventAction(formData: FormData) {
  const session = await requireAuth();
  const eventId = requiredString(formData, "eventId");

  const existing = await prisma.eventBookmark.findUnique({
    where: {
      eventId_userId: {
        eventId,
        userId: session.uid,
      },
    },
  });

  if (existing) {
    await prisma.eventBookmark.delete({ where: { id: existing.id } });
  } else {
    await prisma.eventBookmark.create({
      data: {
        eventId,
        userId: session.uid,
      },
    });
  }

  revalidatePath("/student/events");
  revalidatePath("/faculty/events");
}

export async function submitComplaintAction(formData: FormData) {
  const session = await requireAuth([Role.STUDENT, Role.FACULTY]);
  const title = requiredString(formData, "title");
  const description = requiredString(formData, "description");
  const type = requiredString(formData, "type") as ComplaintType;

  await prisma.complaint.create({
    data: {
      title,
      description,
      type,
      ownerId: session.uid,
      status: ComplaintStatus.PENDING,
    },
  });

  await notifyRole(
    Role.ADMIN,
    NotificationType.COMPLAINT,
    "New Complaint Raised",
    `${session.name} raised a ${type.toLowerCase()} complaint.`,
    "/admin/complaints",
  );

  revalidatePath("/student/complaints");
  revalidatePath("/admin/complaints");
}

export async function assignComplaintAction(formData: FormData) {
  await requireAuth([Role.ADMIN]);
  const complaintId = requiredString(formData, "complaintId");
  const assignedToId = optionalString(formData, "assignedToId");

  const complaint = await prisma.complaint.update({
    where: { id: complaintId },
    data: {
      assignedToId,
      status: ComplaintStatus.IN_PROGRESS,
    },
  });

  await notifyUser(
    complaint.ownerId,
    NotificationType.COMPLAINT,
    "Complaint In Progress",
    `${complaint.title} is now being handled.`,
    "/student/complaints",
  );

  revalidatePath("/admin/complaints");
  revalidatePath("/student/complaints");
}

export async function resolveComplaintAction(formData: FormData) {
  const session = await requireAuth([Role.ADMIN]);
  const complaintId = requiredString(formData, "complaintId");
  const message = optionalString(formData, "message");

  const complaint = await prisma.complaint.update({
    where: { id: complaintId },
    data: {
      status: ComplaintStatus.RESOLVED,
    },
  });

  if (message) {
    await prisma.complaintResponse.create({
      data: {
        complaintId,
        authorId: session.uid,
        message,
      },
    });
  }

  await notifyUser(
    complaint.ownerId,
    NotificationType.COMPLAINT,
    "Complaint Resolved",
    `${complaint.title} has been resolved.`,
    "/student/complaints",
  );

  revalidatePath("/admin/complaints");
  revalidatePath("/student/complaints");
}

export async function respondComplaintAction(formData: FormData) {
  const session = await requireAuth([Role.ADMIN]);
  const complaintId = requiredString(formData, "complaintId");
  const message = requiredString(formData, "message");

  const complaint = await prisma.complaint.findUnique({ where: { id: complaintId } });
  if (!complaint) {
    throw new Error("Complaint missing");
  }

  await prisma.complaintResponse.create({
    data: {
      complaintId,
      authorId: session.uid,
      message,
    },
  });

  await notifyUser(
    complaint.ownerId,
    NotificationType.COMPLAINT,
    "Complaint Response",
    message,
    "/student/complaints",
  );

  revalidatePath("/admin/complaints");
  revalidatePath("/student/complaints");
}

export async function createNoticeAction(formData: FormData) {
  const session = await requireAuth([Role.ADMIN]);
  const title = requiredString(formData, "title");
  const content = requiredString(formData, "content");
  const category = requiredString(formData, "category") as NoticeCategory;
  const targetRole = optionalString(formData, "targetRole") as Role | null;

  await prisma.notice.create({
    data: {
      title,
      content,
      category,
      targetRole,
      createdById: session.uid,
    },
  });

  if (targetRole) {
    await notifyRole(targetRole, NotificationType.ANNOUNCEMENT, title, content);
  } else {
    await notifyRole(Role.STUDENT, NotificationType.ANNOUNCEMENT, title, content);
    await notifyRole(Role.FACULTY, NotificationType.ANNOUNCEMENT, title, content);
    await notifyRole(Role.ADMIN, NotificationType.ANNOUNCEMENT, title, content);
    await notifyRole(Role.COLLEGE, NotificationType.ANNOUNCEMENT, title, content);
  }

  revalidatePath("/admin/notices");
  revalidatePath("/student");
  revalidatePath("/faculty");
  revalidatePath("/college");
}

export async function createHostelRoomAction(formData: FormData) {
  await requireAuth([Role.ADMIN]);
  const block = requiredString(formData, "block");
  const roomNumber = requiredString(formData, "roomNumber");
  const capacity = Number(requiredString(formData, "capacity"));
  const departmentId = optionalString(formData, "departmentId");

  await prisma.hostelRoom.create({
    data: {
      block,
      roomNumber,
      capacity,
      departmentId,
    },
  });

  revalidatePath("/admin/hostel");
}

export async function allocateHostelRoomAction(formData: FormData) {
  await requireAuth([Role.ADMIN]);
  const roomId = requiredString(formData, "roomId");
  const studentProfileId = requiredString(formData, "studentProfileId");

  await prisma.hostelAllocation.upsert({
    where: { studentProfileId },
    update: {
      roomId,
      isActive: true,
    },
    create: {
      roomId,
      studentProfileId,
      isActive: true,
    },
  });

  const student = await prisma.studentProfile.findUnique({
    where: { id: studentProfileId },
    select: { userId: true },
  });

  if (student) {
    await notifyUser(
      student.userId,
      NotificationType.GENERAL,
      "Hostel Allocation Updated",
      "Your hostel room allocation has been updated.",
      "/student/complaints",
    );
  }

  revalidatePath("/admin/hostel");
}

export async function approveResourceAction(formData: FormData) {
  await requireAuth([Role.ADMIN]);
  const resourceId = requiredString(formData, "resourceId");

  const resource = await prisma.resource.update({
    where: { id: resourceId },
    data: {
      approved: true,
    },
  });

  await notifyUser(
    resource.uploaderId,
    NotificationType.RESOURCE,
    "Resource Approved",
    `${resource.title} has been approved and is now visible to students.`,
  );

  revalidatePath("/admin/resources");
  revalidatePath("/student/resources");
}

export async function removeResourceAction(formData: FormData) {
  await requireAuth([Role.ADMIN]);
  const resourceId = requiredString(formData, "resourceId");

  const resource = await prisma.resource.delete({ where: { id: resourceId } });

  await notifyUser(
    resource.uploaderId,
    NotificationType.RESOURCE,
    "Resource Removed",
    `${resource.title} has been removed by administration.`,
  );

  revalidatePath("/admin/resources");
  revalidatePath("/student/resources");
  revalidatePath("/faculty/resources");
}

export async function createLostFoundAction(formData: FormData) {
  const session = await requireAuth([Role.STUDENT]);
  const type = requiredString(formData, "type") as ItemType;
  const title = requiredString(formData, "title");
  const description = requiredString(formData, "description");
  const location = requiredString(formData, "location");
  const contactInfo = requiredString(formData, "contactInfo");

  await prisma.lostFoundItem.create({
    data: {
      type,
      title,
      description,
      location,
      contactInfo,
      postedById: session.uid,
    },
  });

  revalidatePath("/student/utilities");
}

export async function shareNoteAction(formData: FormData) {
  const session = await requireAuth([Role.STUDENT]);
  const title = requiredString(formData, "title");
  const description = requiredString(formData, "description");
  const fileUrl = requiredString(formData, "fileUrl");
  const subjectId = optionalString(formData, "subjectId");
  const departmentId = optionalString(formData, "departmentId");
  const semester = optionalInt(formData, "semester");

  await prisma.sharedNote.create({
    data: {
      title,
      description,
      fileUrl,
      subjectId,
      departmentId,
      semester,
      uploaderId: session.uid,
    },
  });

  revalidatePath("/student/utilities");
}

export async function toggleNoteLikeAction(formData: FormData) {
  const session = await requireAuth();
  const noteId = requiredString(formData, "noteId");

  const existing = await prisma.noteLike.findUnique({
    where: {
      noteId_userId: {
        noteId,
        userId: session.uid,
      },
    },
  });

  if (existing) {
    await prisma.noteLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.noteLike.create({
      data: {
        noteId,
        userId: session.uid,
      },
    });
  }

  revalidatePath("/student/utilities");
}

export async function toggleNoteBookmarkAction(formData: FormData) {
  const session = await requireAuth();
  const noteId = requiredString(formData, "noteId");

  const existing = await prisma.noteBookmark.findUnique({
    where: {
      noteId_userId: {
        noteId,
        userId: session.uid,
      },
    },
  });

  if (existing) {
    await prisma.noteBookmark.delete({ where: { id: existing.id } });
  } else {
    await prisma.noteBookmark.create({
      data: {
        noteId,
        userId: session.uid,
      },
    });
  }

  revalidatePath("/student/utilities");
}

export async function createPeerGroupAction(formData: FormData) {
  const session = await requireAuth([Role.STUDENT]);
  const name = requiredString(formData, "name");
  const description = requiredString(formData, "description");
  const departmentId = optionalString(formData, "departmentId");
  const semester = optionalInt(formData, "semester");

  const group = await prisma.peerGroup.create({
    data: {
      name,
      description,
      departmentId,
      semester,
      createdById: session.uid,
    },
  });

  await prisma.groupMembership.create({
    data: {
      groupId: group.id,
      userId: session.uid,
    },
  });

  revalidatePath("/student/utilities");
}

export async function joinGroupAction(formData: FormData) {
  const session = await requireAuth([Role.STUDENT]);
  const groupId = requiredString(formData, "groupId");

  await prisma.groupMembership.upsert({
    where: {
      groupId_userId: {
        groupId,
        userId: session.uid,
      },
    },
    update: {},
    create: {
      groupId,
      userId: session.uid,
    },
  });

  revalidatePath("/student/utilities");
}

export async function sendDirectMessageAction(formData: FormData) {
  const session = await requireAuth();
  const receiverId = requiredString(formData, "receiverId");
  const content = requiredString(formData, "content");

  await prisma.message.create({
    data: {
      scope: MessageScope.DIRECT,
      senderId: session.uid,
      receiverId,
      content,
    },
  });

  await notifyUser(receiverId, NotificationType.GENERAL, "New Message", content, "/student/utilities");
  revalidatePath("/student/utilities");
}

export async function sendGroupMessageAction(formData: FormData) {
  const session = await requireAuth();
  const groupId = requiredString(formData, "groupId");
  const content = requiredString(formData, "content");

  await prisma.message.create({
    data: {
      scope: MessageScope.GROUP,
      senderId: session.uid,
      groupId,
      content,
    },
  });

  revalidatePath("/student/utilities");
}

export async function createUserAction(formData: FormData) {
  await requireAuth([Role.ADMIN]);
  const name = requiredString(formData, "name");
  const email = requiredString(formData, "email").toLowerCase();
  const password = requiredString(formData, "password");
  const role = requiredString(formData, "role") as Role;

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role,
    },
  });

  if (role === Role.STUDENT) {
    const departmentId = requiredString(formData, "departmentId");
    const semester = Number(requiredString(formData, "semester"));
    const rollNumber = requiredString(formData, "rollNumber");
    const section = optionalString(formData, "section");

    await prisma.studentProfile.create({
      data: {
        userId: user.id,
        departmentId,
        semester,
        rollNumber,
        section,
      },
    });
  }

  if (role === Role.FACULTY) {
    const departmentId = requiredString(formData, "departmentId");
    const employeeCode = requiredString(formData, "employeeCode");
    const designation = requiredString(formData, "designation");

    await prisma.facultyProfile.create({
      data: {
        userId: user.id,
        departmentId,
        employeeCode,
        designation,
      },
    });
  }

  revalidatePath("/admin/users");
  revalidatePath("/college/faculty");
  revalidatePath("/college/students");
}

export async function removeUserAction(formData: FormData) {
  await requireAuth([Role.ADMIN]);
  const userId = requiredString(formData, "userId");
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
}

export async function updateUserRoleAction(formData: FormData) {
  await requireAuth([Role.ADMIN]);
  const userId = requiredString(formData, "userId");
  const role = requiredString(formData, "role") as Role;
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
}

export async function createDepartmentAction(formData: FormData) {
  await requireAuth([Role.COLLEGE, Role.ADMIN]);
  const name = requiredString(formData, "name");
  const code = requiredString(formData, "code");

  await prisma.department.create({
    data: {
      name,
      code,
    },
  });

  revalidatePath("/college/departments");
  revalidatePath("/college");
}

export async function createFacultyAction(formData: FormData) {
  await requireAuth([Role.COLLEGE, Role.ADMIN]);
  const name = requiredString(formData, "name");
  const email = requiredString(formData, "email").toLowerCase();
  const password = requiredString(formData, "password");
  const departmentId = requiredString(formData, "departmentId");
  const employeeCode = requiredString(formData, "employeeCode");
  const designation = requiredString(formData, "designation");

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role: Role.FACULTY,
    },
  });

  await prisma.facultyProfile.create({
    data: {
      userId: user.id,
      departmentId,
      employeeCode,
      designation,
    },
  });

  revalidatePath("/college/faculty");
  revalidatePath("/college");
}

export async function createStudentAction(formData: FormData) {
  await requireAuth([Role.COLLEGE, Role.ADMIN]);
  const name = requiredString(formData, "name");
  const email = requiredString(formData, "email").toLowerCase();
  const password = requiredString(formData, "password");
  const departmentId = requiredString(formData, "departmentId");
  const semester = Number(requiredString(formData, "semester"));
  const rollNumber = requiredString(formData, "rollNumber");
  const section = optionalString(formData, "section");

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role: Role.STUDENT,
    },
  });

  await prisma.studentProfile.create({
    data: {
      userId: user.id,
      departmentId,
      semester,
      rollNumber,
      section,
    },
  });

  revalidatePath("/college/students");
  revalidatePath("/college");
}
