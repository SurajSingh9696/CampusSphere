import {
  createLostFoundAction,
  createPeerGroupAction,
  joinGroupAction,
  sendDirectMessageAction,
  sendGroupMessageAction,
  shareNoteAction,
  toggleNoteBookmarkAction,
  toggleNoteLikeAction,
} from "@/lib/actions";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { ItemType, MessageScope, Role } from "@prisma/client";

export default async function StudentUtilitiesPage() {
  const session = await requireAuth([Role.STUDENT]);

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.uid },
    include: {
      enrollments: {
        include: {
          subject: true,
        },
      },
      department: true,
    },
  });

  if (!student) {
    return <div className="section-card glass-panel">Student profile not found.</div>;
  }

  const [lostFoundItems, sharedNotes, classmates, groups, directMessages] = await Promise.all([
    prisma.lostFoundItem.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        postedBy: {
          select: {
            name: true,
          },
        },
      },
      take: 10,
    }),
    prisma.sharedNote.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        uploader: {
          select: {
            name: true,
          },
        },
        likes: {
          where: { userId: session.uid },
          select: { id: true },
        },
        bookmarks: {
          where: { userId: session.uid },
          select: { id: true },
        },
        _count: {
          select: {
            likes: true,
            bookmarks: true,
          },
        },
      },
      take: 12,
    }),
    prisma.studentProfile.findMany({
      where: {
        departmentId: student.departmentId,
        semester: student.semester,
        userId: {
          not: session.uid,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      take: 10,
    }),
    prisma.peerGroup.findMany({
      where: {
        OR: [{ departmentId: student.departmentId }, { departmentId: null }],
      },
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
        memberships: {
          where: {
            userId: session.uid,
          },
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            memberships: true,
          },
        },
      },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    prisma.message.findMany({
      where: {
        scope: MessageScope.DIRECT,
        OR: [{ senderId: session.uid }, { receiverId: session.uid }],
      },
      include: {
        sender: {
          select: {
            name: true,
          },
        },
        receiver: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
    }),
  ]);

  const groupIds = groups
    .filter((group) => group.memberships.length > 0)
    .map((group) => group.id);

  const groupMessages = groupIds.length
    ? await prisma.message.findMany({
        where: {
          scope: MessageScope.GROUP,
          groupId: {
            in: groupIds,
          },
        },
        include: {
          sender: {
            select: {
              name: true,
            },
          },
          group: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 8,
      })
    : [];

  return (
    <div className="page-grid">
      <section className="section-card glass-panel">
        <h3>Lost &amp; Found</h3>
        <form action={createLostFoundAction} className="form-grid">
          <label>
            Type
            <select name="type" required>
              <option value={ItemType.LOST}>Lost</option>
              <option value={ItemType.FOUND}>Found</option>
            </select>
          </label>
          <label>
            Item Title
            <input name="title" required />
          </label>
          <label>
            Location
            <input name="location" required />
          </label>
          <label>
            Contact
            <input name="contactInfo" required />
          </label>
          <label className="form-grid-full">
            Description
            <textarea name="description" required />
          </label>
          <div className="form-grid-full">
            <button className="button" type="submit">
              Post Item
            </button>
          </div>
        </form>
        <div className="cards-list">
          {lostFoundItems.map((item) => (
            <article className="cards-list-item" key={item.id}>
              <h4>{item.title}</h4>
              <p>{item.description}</p>
              <p>
                {item.location} · {item.contactInfo}
              </p>
              <span className={item.type === ItemType.LOST ? "tag tag-red" : "tag tag-green"}>
                {item.type} · {item.postedBy.name}
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="section-card glass-panel">
        <h3>Notes Sharing</h3>
        <form action={shareNoteAction} className="form-grid">
          <label>
            Title
            <input name="title" required />
          </label>
          <label>
            Subject
            <select name="subjectId">
              <option value="">General</option>
              {student.enrollments.map((item) => (
                <option key={item.subjectId} value={item.subjectId}>
                  {item.subject.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Semester
            <input defaultValue={student.semester} name="semester" type="number" />
          </label>
          <label>
            Department
            <input defaultValue={student.departmentId} name="departmentId" />
          </label>
          <label className="form-grid-full">
            Description
            <textarea name="description" required />
          </label>
          <label className="form-grid-full">
            File URL
            <input name="fileUrl" required type="url" />
          </label>
          <div className="form-grid-full">
            <button className="button" type="submit">
              Upload Note
            </button>
          </div>
        </form>

        <div className="cards-list">
          {sharedNotes.map((note) => (
            <article className="cards-list-item" key={note.id}>
              <h4>{note.title}</h4>
              <p>{note.description}</p>
              <p>By {note.uploader.name}</p>
              <div className="cards-list cards-cols-3">
                <a className="button button-alt" href={note.fileUrl} target="_blank">
                  Download
                </a>
                <form action={toggleNoteLikeAction}>
                  <input name="noteId" type="hidden" value={note.id} />
                  <button className="button button-secondary" type="submit">
                    {note.likes.length > 0 ? `Liked (${note._count.likes})` : `Like (${note._count.likes})`}
                  </button>
                </form>
                <form action={toggleNoteBookmarkAction}>
                  <input name="noteId" type="hidden" value={note.id} />
                  <button className="button button-outline" type="submit">
                    {note.bookmarks.length > 0
                      ? `Bookmarked (${note._count.bookmarks})`
                      : `Bookmark (${note._count.bookmarks})`}
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="page-grid page-grid-2">
        <article className="section-card glass-panel">
          <h3>Peer Networking</h3>
          <form action={createPeerGroupAction} className="form-grid">
            <label>
              Group Name
              <input name="name" required />
            </label>
            <label>
              Semester
              <input defaultValue={student.semester} name="semester" type="number" />
            </label>
            <input name="departmentId" type="hidden" value={student.departmentId} />
            <label className="form-grid-full">
              Description
              <textarea name="description" required />
            </label>
            <div className="form-grid-full">
              <button className="button" type="submit">
                Create Group
              </button>
            </div>
          </form>

          <h4>Classmates</h4>
          <div className="cards-list">
            {classmates.map((mate) => (
              <article className="cards-list-item" key={mate.id}>
                <h4>{mate.user.name}</h4>
                <p>{mate.user.email}</p>
                <form action={sendDirectMessageAction} className="form-grid">
                  <input name="receiverId" type="hidden" value={mate.user.id} />
                  <label className="form-grid-full">
                    Message
                    <input name="content" placeholder="Send a quick message" required />
                  </label>
                  <div className="form-grid-full">
                    <button className="button button-alt" type="submit">
                      Send Message
                    </button>
                  </div>
                </form>
              </article>
            ))}
          </div>
        </article>

        <article className="section-card glass-panel">
          <h3>Groups & Messaging</h3>
          <div className="cards-list">
            {groups.map((group) => (
              <div className="cards-list-item" key={group.id}>
                <h4>{group.name}</h4>
                <p>{group.description}</p>
                <p>
                  {group._count.memberships} members · Created by {group.createdBy.name}
                </p>
                {group.memberships.length === 0 ? (
                  <form action={joinGroupAction}>
                    <input name="groupId" type="hidden" value={group.id} />
                    <button className="button button-secondary" type="submit">
                      Join Group
                    </button>
                  </form>
                ) : (
                  <form action={sendGroupMessageAction} className="form-grid">
                    <input name="groupId" type="hidden" value={group.id} />
                    <label className="form-grid-full">
                      Group Message
                      <input name="content" placeholder="Share update with your group" required />
                    </label>
                    <div className="form-grid-full">
                      <button className="button" type="submit">
                        Send to Group
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>

          <h4>Recent Direct Messages</h4>
          <div className="cards-list">
            {directMessages.length === 0 ? (
              <div className="cards-list-item">
                <p>No direct messages yet.</p>
              </div>
            ) : (
              directMessages.map((message) => (
                <div className="cards-list-item" key={message.id}>
                  <h4>
                    {message.sender.name} to {message.receiver?.name ?? "Unknown"}
                  </h4>
                  <p>{message.content}</p>
                  <span className="tag">{formatDate(message.createdAt)}</span>
                </div>
              ))
            )}
          </div>

          <h4>Recent Group Messages</h4>
          <div className="cards-list">
            {groupMessages.length === 0 ? (
              <div className="cards-list-item">
                <p>No group messages yet.</p>
              </div>
            ) : (
              groupMessages.map((message) => (
                <div className="cards-list-item" key={message.id}>
                  <h4>
                    {message.group?.name} · {message.sender.name}
                  </h4>
                  <p>{message.content}</p>
                  <span className="tag">{formatDate(message.createdAt)}</span>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
