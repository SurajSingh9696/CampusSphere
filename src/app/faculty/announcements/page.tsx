import { Role } from "@prisma/client";
import { postAnnouncementAction } from "@/lib/actions";
import { requireAuth } from "@/lib/auth";
import { noticeCategories } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { formatDate, titleCase } from "@/lib/utils";

export default async function FacultyAnnouncementsPage() {
  const session = await requireAuth([Role.FACULTY]);

  const faculty = await prisma.facultyProfile.findUnique({
    where: { userId: session.uid },
    include: {
      department: true,
      subjects: {
        include: {
          subject: true,
        },
      },
    },
  });

  if (!faculty) {
    return <div className="section-card glass-panel">Faculty profile unavailable.</div>;
  }

  const notices = await prisma.notice.findMany({
    where: {
      createdById: session.uid,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="page-grid">
      <section className="section-card glass-panel">
        <h3>Announcement System</h3>
        <form action={postAnnouncementAction} className="form-grid">
          <label>
            Title
            <input name="title" required />
          </label>
          <label>
            Category
            <select name="category" required>
              {noticeCategories.map((category) => (
                <option key={category} value={category}>
                  {titleCase(category)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Target Role
            <select defaultValue={Role.STUDENT} name="targetRole">
              <option value={Role.STUDENT}>Student</option>
              <option value={Role.FACULTY}>Faculty</option>
            </select>
          </label>
          <label>
            Subject
            <select name="subjectId">
              <option value="">General</option>
              {faculty.subjects.map((subject) => (
                <option key={subject.subjectId} value={subject.subjectId}>
                  {subject.subject.title}
                </option>
              ))}
            </select>
          </label>
          <input name="departmentId" type="hidden" value={faculty.departmentId} />
          <label className="form-grid-full">
            Content
            <textarea name="content" required />
          </label>
          <div className="form-grid-full">
            <button className="button" type="submit">
              Publish Announcement
            </button>
          </div>
        </form>
      </section>

      <section className="section-card glass-panel">
        <h3>Published Announcements</h3>
        <div className="cards-list">
          {notices.length === 0 ? (
            <div className="cards-list-item">
              <p>No announcements posted yet.</p>
            </div>
          ) : (
            notices.map((notice) => (
              <article className="cards-list-item" key={notice.id}>
                <h4>{notice.title}</h4>
                <p>{notice.content}</p>
                <p>
                  {titleCase(notice.category)} · {notice.targetRole ?? "All"}
                </p>
                <span className="tag">{formatDate(notice.createdAt)}</span>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
