import { Schema, model, models } from "mongoose";

import type { UserRole } from "@/lib/auth-shared";

const userRoles: UserRole[] = ["student", "college", "admin"];

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: userRoles,
      required: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export const User = models.User ?? model("User", userSchema);