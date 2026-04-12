import { Role } from "@prisma/client";
import { createNoticeAction } from "@/lib/actions";
import { requireAuth } from "@/lib/auth";
import { noticeCategories } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { formatDate, titleCase } from "@/lib/utils";

export default async function AdminNoticesPage() {
  const session = await requireAuth([Role.ADMIN]);

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
        <h3>Create Notice / Circular / Announcement</h3>
        <form action={createNoticeAction} className="form-grid">
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
            <select name="targetRole">
              <option value="">All</option>
              <option value={Role.STUDENT}>Student</option>
              <option value={Role.FACULTY}>Faculty</option>
              <option value={Role.ADMIN}>Admin</option>
              <option value={Role.COLLEGE}>College</option>
            </select>
          </label>
          <label className="form-grid-full">
            Content
            <textarea name="content" required />
          </label>
          <div className="form-grid-full">
            <button className="button" type="submit">
              Publish Notice
            </button>
          </div>
        </form>
      </section>

      <section className="section-card glass-panel">
        <h3>Published Notices</h3>
        <div className="cards-list">
          {notices.length === 0 ? (
            <div className="cards-list-item">
              <p>No notices posted yet.</p>
            </div>
          ) : (
            notices.map((notice) => (
              <article className="cards-list-item" key={notice.id}>
                <h4>{notice.title}</h4>
                <p>{notice.content}</p>
                <p>
                  {titleCase(notice.category)} · {notice.targetRole ?? "All Roles"}
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
