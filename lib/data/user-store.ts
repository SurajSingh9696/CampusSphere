import "server-only";

import { hashPassword, type AuthUser, verifyPassword } from "@/lib/auth";
import { demoCredentials, type UserRole } from "@/lib/auth-shared";
import { connectMongo } from "@/lib/db";
import { User } from "@/models/User";

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