import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { env } from "../config/env";

export async function login(email: string, password: string) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw Object.assign(new Error("Invalid email or password"), { status: 401 });
  }
  if (!user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    throw Object.assign(new Error("Invalid email or password"), { status: 401 });
  }
  if (!user.approved) {
    throw Object.assign(new Error("Your account is pending admin approval"), { status: 403 });
  }
  return signToken(user.id);
}

// Google auth is temporarily disabled. Admin approval is the required sign-in flow.
export async function loginWithGoogle(_profile: { googleId: string; email: string; name: string }) {
  throw Object.assign(new Error("Google sign-in is temporarily disabled"), { status: 403 });
}

function signToken(userId: string) {
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: "8h" });
}

export async function currentUser(userId: string) {
  if (!userId) return null;
  return User.findById(userId).select("name email approved permission isAdmin");
}

export async function seedAdmin() {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) return;
  const adminEmail = env.ADMIN_EMAIL.toLowerCase();
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (existingAdmin) {
    existingAdmin.isAdmin = true;
    existingAdmin.approved = true;
    existingAdmin.permission = "edit";
    await existingAdmin.save();
    return;
  }

  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
  await User.create({
    email: adminEmail,
    passwordHash,
    name: "Administrator",
    isAdmin: true,
    approved: true,
    permission: "edit",
  });
  console.log(`Created password admin ${adminEmail}`);
}

export async function listUsersForAdmin() {
  return User.find({}).select("name email approved permission isAdmin createdAt updatedAt").sort({ createdAt: -1 });
}

export async function updateUserApproval(userId: string, input: { approved?: boolean; permission?: "view" | "edit" }) {
  const user = await User.findById(userId);
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });

  if (typeof input.approved === "boolean") user.approved = input.approved;
  if (input.permission === "view" || input.permission === "edit") user.permission = input.permission;
  if (user.approved === false) user.permission = "view";
  await user.save();
  return user;
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  if (newPassword.length < 8) {
    throw Object.assign(new Error("New password must be at least 8 characters"), { status: 400 });
  }

  const user = await User.findById(userId);
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
  if (!user.passwordHash || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw Object.assign(new Error("Current password is incorrect"), { status: 400 });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  user.mustChangePassword = false;
  await user.save();
}

export async function resetUserPassword(userId: string, temporaryPassword: string) {
  if (temporaryPassword.length < 8) {
    throw Object.assign(new Error("Temporary password must be at least 8 characters"), { status: 400 });
  }

  const user = await User.findById(userId);
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });

  user.passwordHash = await bcrypt.hash(temporaryPassword, 12);
  user.mustChangePassword = true;
  await user.save();
}
