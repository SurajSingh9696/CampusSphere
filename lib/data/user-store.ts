import "server-only";

import { hashPassword, type AuthUser, verifyPassword } from "@/lib/auth";
import { demoCredentials, type UserRole } from "@/lib/auth-shared";
import { connectMongo } from "@/lib/db";
import { User } from "@/models/User";

export type RegistrationRole = Exclude<UserRole, "admin">;

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  role: RegistrationRole;
}

export interface RegisterUserResult {
  user: AuthUser | null;
  error: "email_exists" | null;
}

interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  active: boolean;
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