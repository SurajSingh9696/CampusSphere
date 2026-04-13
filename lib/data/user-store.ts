import "server-only";

import { hashPassword, type AuthUser, verifyPassword } from "@/lib/auth";
import { demoCredentials, type UserRole } from "@/lib/auth-shared";
import { connectMongo } from "@/lib/db";
import { User } from "@/models/User";

export type RegistrationRole = Exclude<UserRole, "admin">;

export interface StudentProfileInput {
  idCardNumber: string;
  campus: string;
  course: string;
  stream: string;
}

export interface CollegeProfileInput {
  collegeCode: string;
  collegeShortCode: string;
  collegeLocation: string;
}

export interface UserPortalProfile {
  studentProfile?: StudentProfileInput;
  collegeProfile?: CollegeProfileInput;
}

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  role: RegistrationRole;
  details?: StudentProfileInput | CollegeProfileInput;
}

export interface RegisterUserResult {
  user: AuthUser | null;
  error: "email_exists" | null;
}

export interface PortalUserRecord extends AuthUser {
  studentProfile?: StudentProfileInput;
  collegeProfile?: CollegeProfileInput;
}

interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  active: boolean;
  studentProfile?: StudentProfileInput;
  collegeProfile?: CollegeProfileInput;
}

const memoryUsers: StoredUser[] = demoCredentials.map((credential, index) => ({
  id: `memory-${index + 1}`,
  name: credential.name,
  email: credential.email.toLowerCase(),
  role: credential.role,
  passwordHash: hashPassword(credential.password),
  active: true,
}));

function toAuthUser(user: StoredUser): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function toPortalUser(user: StoredUser): PortalUserRecord {
  return {
    ...toAuthUser(user),
    studentProfile: user.studentProfile,
    collegeProfile: user.collegeProfile,
  };
}

function pickStudentProfile(input?: StudentProfileInput | CollegeProfileInput): StudentProfileInput | undefined {
  if (!input || !("idCardNumber" in input)) {
    return undefined;
  }

  return {
    idCardNumber: input.idCardNumber.trim(),
    campus: input.campus.trim(),
    course: input.course.trim(),
    stream: input.stream.trim(),
  };
}

function pickCollegeProfile(input?: StudentProfileInput | CollegeProfileInput): CollegeProfileInput | undefined {
  if (!input || !("collegeCode" in input)) {
    return undefined;
  }

  return {
    collegeCode: input.collegeCode.trim(),
    collegeShortCode: input.collegeShortCode.trim(),
    collegeLocation: input.collegeLocation.trim(),
  };
}

export async function ensureSeedUsers(): Promise<{ seeded: boolean }> {
  const connection = await connectMongo();

  if (!connection) {
    return { seeded: false };
  }

  await Promise.all(
    demoCredentials.map((credential) =>
      User.findOneAndUpdate(
        { email: credential.email.toLowerCase() },
        {
          $setOnInsert: {
            name: credential.name,
            email: credential.email.toLowerCase(),
            role: credential.role,
            passwordHash: hashPassword(credential.password),
            active: true,
          },
        },
        { upsert: true, new: true },
      ),
    ),
  );

  return { seeded: true };
}

export async function authenticateUser(
  email: string,
  password: string,
): Promise<AuthUser | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const connection = await connectMongo();

  if (!connection) {
    const memoryMatch = memoryUsers.find((user) => user.email === normalizedEmail);

    if (!memoryMatch || !memoryMatch.active) {
      return null;
    }

    if (!verifyPassword(password, memoryMatch.passwordHash)) {
      return null;
    }

    return toAuthUser(memoryMatch);
  }

  await ensureSeedUsers();

  const existing = await User.findOne({ email: normalizedEmail }).lean<{
    _id: unknown;
    name: string;
    email: string;
    role: UserRole;
    passwordHash: string;
    active: boolean;
  } | null>();

  if (!existing || !existing.active) {
    return null;
  }

  if (!verifyPassword(password, existing.passwordHash)) {
    return null;
  }

  return {
    id: String(existing._id),
    name: existing.name,
    email: existing.email,
    role: existing.role,
  };
}

export async function registerUser(
  input: RegisterUserInput,
): Promise<RegisterUserResult> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const normalizedName = input.name.trim();
  const connection = await connectMongo();

  if (!connection) {
    const duplicate = memoryUsers.find((user) => user.email === normalizedEmail);

    if (duplicate) {
      return {
        user: null,
        error: "email_exists",
      };
    }

    const memoryUser: StoredUser = {
      id: `memory-${memoryUsers.length + 1}`,
      name: normalizedName,
      email: normalizedEmail,
      role: input.role,
      passwordHash: hashPassword(input.password),
      active: true,
      studentProfile: input.role === "student" ? pickStudentProfile(input.details) : undefined,
      collegeProfile: input.role === "college" ? pickCollegeProfile(input.details) : undefined,
    };

    memoryUsers.push(memoryUser);

    return {
      user: toAuthUser(memoryUser),
      error: null,
    };
  }

  await ensureSeedUsers();

  const duplicate = await User.findOne({ email: normalizedEmail }).lean<{
    _id: unknown;
  } | null>();

  if (duplicate) {
    return {
      user: null,
      error: "email_exists",
    };
  }

  const created = await User.create({
    name: normalizedName,
    email: normalizedEmail,
    role: input.role,
    passwordHash: hashPassword(input.password),
    active: true,
    ...(input.role === "student"
      ? { studentProfile: pickStudentProfile(input.details) }
      : { collegeProfile: pickCollegeProfile(input.details) }),
  });

  return {
    user: {
      id: String(created._id),
      name: created.name,
      email: created.email,
      role: created.role,
    },
    error: null,
  };
}

export async function getUserPortalRecord(userId: string): Promise<PortalUserRecord | null> {
  const connection = await connectMongo();

  if (!connection) {
    const memoryMatch = memoryUsers.find((user) => user.id === userId && user.active);
    return memoryMatch ? toPortalUser(memoryMatch) : null;
  }

  const existing = await User.findById(userId).lean<{
    _id: unknown;
    name: string;
    email: string;
    role: UserRole;
    active: boolean;
    studentProfile?: StudentProfileInput;
    collegeProfile?: CollegeProfileInput;
  } | null>();

  if (!existing || !existing.active) {
    return null;
  }

  return {
    id: String(existing._id),
    name: existing.name,
    email: existing.email,
    role: existing.role,
    studentProfile: existing.studentProfile,
    collegeProfile: existing.collegeProfile,
  };
}