import bcrypt from "bcryptjs";
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
  PrismaClient,
  ResourceCategory,
  Role,
} from "@prisma/client";

const prisma = new PrismaClient();

async function clearDatabase() {
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.groupMembership.deleteMany();
  await prisma.peerGroup.deleteMany();
  await prisma.noteBookmark.deleteMany();
  await prisma.noteLike.deleteMany();
  await prisma.sharedNote.deleteMany();
  await prisma.lostFoundItem.deleteMany();
  await prisma.hostelAllocation.deleteMany();
  await prisma.hostelRoom.deleteMany();
  await prisma.complaintResponse.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.eventBookmark.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.attendanceSession.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.subjectFaculty.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.building.deleteMany();
  await prisma.facultyProfile.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  await clearDatabase();

  const passwordHash = await bcrypt.hash("Campus@123", 10);

  const cse = await prisma.department.create({ data: { name: "Computer Science", code: "CSE" } });
  const ece = await prisma.department.create({ data: { name: "Electronics", code: "ECE" } });
  await prisma.department.create({ data: { name: "Mechanical", code: "ME" } });

  const studentUser = await prisma.user.create({
    data: {
      name: "Riya Sharma",
      email: "student@campusphere.edu",
      passwordHash,
      role: Role.STUDENT,
    },
  });

  const studentTwoUser = await prisma.user.create({
    data: {
      name: "Aman Verma",
      email: "student2@campusphere.edu",
      passwordHash,
      role: Role.STUDENT,
    },
  });

  const studentThreeUser = await prisma.user.create({
    data: {
      name: "Nidhi Rao",
      email: "student3@campusphere.edu",
      passwordHash,
      role: Role.STUDENT,
    },
  });

  const facultyUser = await prisma.user.create({
    data: {
      name: "Dr. Arvind Menon",
      email: "faculty@campusphere.edu",
      passwordHash,
      role: Role.FACULTY,
    },
  });

  const facultyTwoUser = await prisma.user.create({
    data: {
      name: "Prof. Sneha Kapoor",
      email: "faculty2@campusphere.edu",
      passwordHash,
      role: Role.FACULTY,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      name: "Admin Officer",
      email: "admin@campusphere.edu",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const collegeUser = await prisma.user.create({
    data: {
      name: "College Director",
      email: "college@campusphere.edu",
      passwordHash,
      role: Role.COLLEGE,
    },
  });

  const studentProfile = await prisma.studentProfile.create({
    data: {
      userId: studentUser.id,
      rollNumber: "CSE24001",
      semester: 4,
      section: "A",
      departmentId: cse.id,
    },
  });

  const studentTwoProfile = await prisma.studentProfile.create({
    data: {
      userId: studentTwoUser.id,
      rollNumber: "CSE24002",
      semester: 4,
      section: "A",
      departmentId: cse.id,
    },
  });

  const studentThreeProfile = await prisma.studentProfile.create({
    data: {
      userId: studentThreeUser.id,
      rollNumber: "ECE24001",
      semester: 4,
      section: "B",
      departmentId: ece.id,
    },
  });

  const facultyProfile = await prisma.facultyProfile.create({
    data: {
      userId: facultyUser.id,
      employeeCode: "FACCSE01",
      designation: "Associate Professor",
      departmentId: cse.id,
    },
  });

  const facultyTwoProfile = await prisma.facultyProfile.create({
    data: {
      userId: facultyTwoUser.id,
      employeeCode: "FACCSE02",
      designation: "Assistant Professor",
      departmentId: cse.id,
    },
  });

  const dataStructures = await prisma.subject.create({
    data: {
      code: "CSE401",
      title: "Data Structures and Algorithms",
      semester: 4,
      departmentId: cse.id,
    },
  });

  const dbms = await prisma.subject.create({
    data: {
      code: "CSE402",
      title: "Database Management Systems",
      semester: 4,
      departmentId: cse.id,
    },
  });

  const signals = await prisma.subject.create({
    data: {
      code: "ECE401",
      title: "Signals and Systems",
      semester: 4,
      departmentId: ece.id,
    },
  });

  await prisma.subjectFaculty.createMany({
    data: [
      { subjectId: dataStructures.id, facultyProfileId: facultyProfile.id },
      { subjectId: dbms.id, facultyProfileId: facultyProfile.id },
      { subjectId: signals.id, facultyProfileId: facultyTwoProfile.id },
    ],
  });

  await prisma.enrollment.createMany({
    data: [
      { subjectId: dataStructures.id, studentProfileId: studentProfile.id },
      { subjectId: dbms.id, studentProfileId: studentProfile.id },
      { subjectId: dataStructures.id, studentProfileId: studentTwoProfile.id },
      { subjectId: dbms.id, studentProfileId: studentTwoProfile.id },
      { subjectId: signals.id, studentProfileId: studentThreeProfile.id },
    ],
  });

  const now = new Date();
  const beforeTenMinutes = new Date(now.getTime() - 10 * 60 * 1000);
  const afterFortyMinutes = new Date(now.getTime() + 40 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStart = new Date(yesterday.getTime() - 50 * 60 * 1000);
  const yesterdayEnd = new Date(yesterday.getTime() - 10 * 60 * 1000);

  const sessionOne = await prisma.attendanceSession.create({
    data: {
      subjectId: dataStructures.id,
      facultyProfileId: facultyProfile.id,
      sessionDate: now,
      startTime: beforeTenMinutes,
      endTime: afterFortyMinutes,
      method: AttendanceMethod.QR,
      qrToken: "QR-CSE401-LIVE",
      isActive: true,
    },
  });

  const sessionTwo = await prisma.attendanceSession.create({
    data: {
      subjectId: dbms.id,
      facultyProfileId: facultyProfile.id,
      sessionDate: yesterday,
      startTime: yesterdayStart,
      endTime: yesterdayEnd,
      method: AttendanceMethod.MANUAL,
      isActive: false,
    },
  });

  const sessionThree = await prisma.attendanceSession.create({
    data: {
      subjectId: dataStructures.id,
      facultyProfileId: facultyProfile.id,
      sessionDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      startTime: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 - 40 * 60 * 1000),
      endTime: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      method: AttendanceMethod.GEOFENCING,
      geoLat: 12.9716,
      geoLng: 77.5946,
      radiusMeters: 250,
      qrToken: "GEO-CSE401-OLD",
      isActive: false,
    },
  });

  await prisma.attendanceRecord.createMany({
    data: [
      {
        sessionId: sessionOne.id,
        studentProfileId: studentProfile.id,
        status: AttendanceStatus.PRESENT,
        method: AttendanceMethod.QR,
        markedAt: now,
      },
      {
        sessionId: sessionOne.id,
        studentProfileId: studentTwoProfile.id,
        status: AttendanceStatus.ABSENT,
      },
      {
        sessionId: sessionTwo.id,
        studentProfileId: studentProfile.id,
        status: AttendanceStatus.PRESENT,
        method: AttendanceMethod.MANUAL,
        markedAt: yesterday,
      },
      {
        sessionId: sessionTwo.id,
        studentProfileId: studentTwoProfile.id,
        status: AttendanceStatus.LATE,
        method: AttendanceMethod.MANUAL,
        markedAt: yesterday,
      },
      {
        sessionId: sessionThree.id,
        studentProfileId: studentProfile.id,
        status: AttendanceStatus.PRESENT,
        method: AttendanceMethod.GEOFENCING,
        markedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        sessionId: sessionThree.id,
        studentProfileId: studentTwoProfile.id,
        status: AttendanceStatus.PRESENT,
        method: AttendanceMethod.GEOFENCING,
        markedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  await prisma.resource.createMany({
    data: [
      {
        title: "DSA Lecture Notes Unit 1",
        description: "Graph algorithms, recursion, and complexity analysis",
        category: ResourceCategory.NOTES,
        subjectId: dataStructures.id,
        departmentId: cse.id,
        semester: 4,
        fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        uploaderId: facultyUser.id,
        approved: true,
      },
      {
        title: "DBMS Assignment Set 2",
        description: "Normalization and SQL query assignment pack",
        category: ResourceCategory.ASSIGNMENTS,
        subjectId: dbms.id,
        departmentId: cse.id,
        semester: 4,
        fileUrl: "https://www.africau.edu/images/default/sample.pdf",
        uploaderId: facultyUser.id,
        approved: true,
      },
      {
        title: "Signals Lab Experiment Manual",
        description: "Lab manual for analog signal processing",
        category: ResourceCategory.LAB_FILES,
        subjectId: signals.id,
        departmentId: ece.id,
        semester: 4,
        fileUrl: "https://www.orimi.com/pdf-test.pdf",
        uploaderId: facultyTwoUser.id,
        approved: true,
      },
      {
        title: "AI Study Material Draft",
        description: "Advanced ML reading references pending approval",
        category: ResourceCategory.STUDY_MATERIAL,
        departmentId: cse.id,
        semester: 4,
        fileUrl: "https://www.clickdimensions.com/links/TestPDFfile.pdf",
        uploaderId: facultyUser.id,
        approved: false,
      },
    ],
  });

  await prisma.notice.createMany({
    data: [
      {
        title: "Mid-Sem Evaluation Schedule",
        content: "Mid-sem evaluations begin next Monday. Check timetable section.",
        category: NoticeCategory.ACADEMIC,
        targetRole: Role.STUDENT,
        createdById: facultyUser.id,
      },
      {
        title: "Campus Safety Circular",
        content: "Emergency response drill scheduled for Friday 11:00 AM.",
        category: NoticeCategory.EMERGENCY,
        targetRole: null,
        createdById: adminUser.id,
      },
      {
        title: "Administrative Fee Window",
        content: "Semester fee payment window closes on 30th April.",
        category: NoticeCategory.ADMINISTRATIVE,
        targetRole: Role.STUDENT,
        createdById: adminUser.id,
      },
    ],
  });

  const techEvent = await prisma.event.create({
    data: {
      title: "CampusSphere Innovation Sprint",
      description: "Inter-department innovation challenge with live product demo.",
      date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      location: "Auditorium Block A",
      organizer: "Department of Computer Science",
      posterUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
      departmentId: cse.id,
      capacity: 120,
      createdById: facultyUser.id,
    },
  });

  const seminarEvent = await prisma.event.create({
    data: {
      title: "Industry Connect Seminar",
      description: "Placement readiness and resume clinic with industry mentors.",
      date: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
      location: "Seminar Hall 2",
      organizer: "Training and Placement Cell",
      departmentId: cse.id,
      capacity: 180,
      createdById: adminUser.id,
    },
  });

  await prisma.eventRegistration.createMany({
    data: [
      { eventId: techEvent.id, userId: studentUser.id, status: EventRegistrationStatus.REGISTERED },
      { eventId: techEvent.id, userId: studentTwoUser.id, status: EventRegistrationStatus.REGISTERED },
      { eventId: seminarEvent.id, userId: studentUser.id, status: EventRegistrationStatus.REGISTERED },
    ],
  });

  await prisma.eventBookmark.createMany({
    data: [
      { eventId: techEvent.id, userId: studentUser.id },
      { eventId: seminarEvent.id, userId: studentTwoUser.id },
    ],
  });

  await prisma.complaint.create({
    data: {
      title: "Hostel Water Leakage",
      description: "Continuous leakage in Block A washroom on floor 2.",
      type: ComplaintType.HOSTEL,
      status: ComplaintStatus.PENDING,
      ownerId: studentUser.id,
    },
  });

  const complaintTwo = await prisma.complaint.create({
    data: {
      title: "Lab Projector Issue",
      description: "Projector in Lab 3 is not working during practical session.",
      type: ComplaintType.INFRASTRUCTURE,
      status: ComplaintStatus.IN_PROGRESS,
      ownerId: studentTwoUser.id,
      assignedToId: adminUser.id,
    },
  });

  await prisma.complaintResponse.createMany({
    data: [
      {
        complaintId: complaintTwo.id,
        authorId: adminUser.id,
        message: "Maintenance team has been assigned and will resolve by tomorrow.",
      },
      {
        complaintId: complaintTwo.id,
        authorId: facultyTwoUser.id,
        message: "Temporary classroom shift done for today's session.",
      },
    ],
  });

  const roomA101 = await prisma.hostelRoom.create({
    data: {
      block: "A",
      roomNumber: "101",
      capacity: 3,
      departmentId: cse.id,
    },
  });

  await prisma.hostelRoom.create({
    data: {
      block: "B",
      roomNumber: "203",
      capacity: 2,
      departmentId: ece.id,
    },
  });

  await prisma.hostelAllocation.create({
    data: {
      roomId: roomA101.id,
      studentProfileId: studentProfile.id,
      isActive: true,
    },
  });

  await prisma.lostFoundItem.createMany({
    data: [
      {
        type: ItemType.LOST,
        title: "Blue Scientific Calculator",
        description: "Lost near CSE Lab complex after afternoon class.",
        location: "CSE Lab Corridor",
        contactInfo: "student@campusphere.edu",
        postedById: studentUser.id,
      },
      {
        type: ItemType.FOUND,
        title: "Identity Card",
        description: "Found ID card near central library entrance.",
        location: "Central Library",
        contactInfo: "student2@campusphere.edu",
        postedById: studentTwoUser.id,
      },
    ],
  });

  const sharedNoteOne = await prisma.sharedNote.create({
    data: {
      title: "DBMS Quick Revision Sheet",
      description: "Last-minute revision notes for transactions and indexing.",
      fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      subjectId: dbms.id,
      departmentId: cse.id,
      semester: 4,
      uploaderId: studentUser.id,
    },
  });

  const sharedNoteTwo = await prisma.sharedNote.create({
    data: {
      title: "DSA Problem Set Solutions",
      description: "Curated solved examples for trees, heaps and graphs.",
      fileUrl: "https://www.africau.edu/images/default/sample.pdf",
      subjectId: dataStructures.id,
      departmentId: cse.id,
      semester: 4,
      uploaderId: studentTwoUser.id,
    },
  });

  await prisma.noteLike.createMany({
    data: [
      { noteId: sharedNoteOne.id, userId: studentTwoUser.id },
      { noteId: sharedNoteTwo.id, userId: studentUser.id },
    ],
  });

  await prisma.noteBookmark.createMany({
    data: [
      { noteId: sharedNoteOne.id, userId: studentUser.id },
      { noteId: sharedNoteTwo.id, userId: studentTwoUser.id },
    ],
  });

  const peerGroup = await prisma.peerGroup.create({
    data: {
      name: "CSE Peer Builders",
      description: "Study group for project collaboration and mock interviews.",
      departmentId: cse.id,
      semester: 4,
      createdById: studentUser.id,
    },
  });

  await prisma.groupMembership.createMany({
    data: [
      { groupId: peerGroup.id, userId: studentUser.id },
      { groupId: peerGroup.id, userId: studentTwoUser.id },
    ],
  });

  await prisma.message.createMany({
    data: [
      {
        scope: MessageScope.DIRECT,
        senderId: studentUser.id,
        receiverId: studentTwoUser.id,
        content: "Can we sync before tomorrow's DBMS quiz?",
      },
      {
        scope: MessageScope.GROUP,
        senderId: studentTwoUser.id,
        groupId: peerGroup.id,
        content: "Uploading solved graph questions by evening.",
      },
      {
        scope: MessageScope.GROUP,
        senderId: studentUser.id,
        groupId: peerGroup.id,
        content: "Let's meet in lab after class at 4 PM.",
      },
    ],
  });

  await prisma.building.createMany({
    data: [
      {
        name: "Computer Science Block",
        type: "Department",
        code: "CSE-BLK",
        description: "Department offices, classrooms, and coding labs",
        floor: "Ground + 3",
        mapX: 28,
        mapY: 44,
        departmentId: cse.id,
      },
      {
        name: "Innovation Lab",
        type: "Lab",
        code: "INNO-LAB",
        description: "Rapid prototyping and robotics lab",
        floor: "First",
        mapX: 62,
        mapY: 34,
        departmentId: cse.id,
      },
      {
        name: "Seminar Hall 2",
        type: "Classroom",
        code: "SEM-2",
        description: "Event and seminar venue",
        floor: "Ground",
        mapX: 75,
        mapY: 61,
        departmentId: ece.id,
      },
      {
        name: "Central Library",
        type: "Building",
        code: "LIB",
        description: "Main reading and digital resource center",
        floor: "Ground + 2",
        mapX: 46,
        mapY: 68,
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: studentUser.id,
        type: NotificationType.ATTENDANCE,
        title: "Attendance Alert",
        message: "Your DBMS attendance dropped below 80%.",
        link: "/student/attendance",
      },
      {
        userId: studentUser.id,
        type: NotificationType.EVENT,
        title: "Event Reminder",
        message: `EventReminder:${techEvent.id} Innovation Sprint starts in 3 days.`,
        link: "/student/events",
      },
      {
        userId: facultyUser.id,
        type: NotificationType.EVENT,
        title: "New Registration",
        message: "Two students registered for Innovation Sprint.",
        link: "/faculty/events",
      },
      {
        userId: adminUser.id,
        type: NotificationType.COMPLAINT,
        title: "Complaint Pending",
        message: "Hostel water leakage complaint needs assignment.",
        link: "/admin/complaints",
      },
      {
        userId: collegeUser.id,
        type: NotificationType.GENERAL,
        title: "Weekly Analytics Ready",
        message: "Campus performance analytics have been refreshed.",
        link: "/college/analytics",
      },
    ],
  });

  console.log("CampusSphere seed completed");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
