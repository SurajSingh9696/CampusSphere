import { Role } from "@prisma/client";
import { readSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ sessionId: string }>;
  },
) {
  const session = await readSession();
  if (!session || (session.role !== Role.FACULTY && session.role !== Role.ADMIN)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { sessionId } = await context.params;

  const attendanceSession = await prisma.attendanceSession.findUnique({
    where: { id: sessionId },
    include: {
      facultyProfile: {
        include: {
          user: true,
        },
      },
      subject: true,
      records: {
        include: {
          studentProfile: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  if (!attendanceSession) {
    return new Response("Session not found", { status: 404 });
  }

  if (
    session.role === Role.FACULTY &&
    attendanceSession.facultyProfile.userId !== session.uid
  ) {
    return new Response("Forbidden", { status: 403 });
  }

  const headers = [
    "Session Date",
    "Subject",
    "Student Name",
    "Student Email",
    "Roll Number",
    "Status",
    "Marked At",
    "Method",
  ];

  const rows = attendanceSession.records.map((record) => [
    attendanceSession.sessionDate.toISOString(),
    attendanceSession.subject.title,
    record.studentProfile.user.name,
    record.studentProfile.user.email,
    record.studentProfile.rollNumber,
    record.status,
    record.markedAt ? record.markedAt.toISOString() : "",
    record.method ?? attendanceSession.method,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value).replaceAll("\"", "\"\"")}"`).join(","))
    .join("\n");

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=attendance-${sessionId}.csv`,
    },
  });
}
