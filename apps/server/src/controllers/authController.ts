import { Response } from "express";
import { env } from "../config/env";
import { clearAuthCookies, setSessionCookie } from "../lib/cookies";
import { AuthRequest } from "../middleware/auth";
import { changePassword, currentUser, listUsersForAdmin, login, resetUserPassword, updateUserApproval } from "../services/authService";
import { User } from "../models/User";

export async function loginController(req: AuthRequest, res: Response) {
  const token = await login(req.body.email, req.body.password);
  setSessionCookie(res, token);
  res.json({ ok: true });
}

export function logoutController(_req: AuthRequest, res: Response) {
  clearAuthCookies(res);
  res.json({ ok: true });
}

export async function meController(req: AuthRequest, res: Response) {
  const user = await currentUser(req.userId || "");
  if (!user) return res.status(401).json({ message: "Authentication required" });
  res.json({
    name: user.name,
    email: user.email,
    approved: user.approved,
    permission: user.permission,
    isAdmin: user.isAdmin,
  });
}

export async function listUsersController(_req: AuthRequest, res: Response) {
  const users = await listUsersForAdmin();
  res.json(users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    approved: user.approved,
    permission: user.permission,
    isAdmin: user.isAdmin,
  })));
}

export async function approveUserController(req: AuthRequest, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { approved, permission } = req.body as { approved?: boolean; permission?: "view" | "edit" };
  const user = await updateUserApproval(id, { approved, permission });
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    approved: user.approved,
    permission: user.permission,
    isAdmin: user.isAdmin,
  });
}

export async function createPendingUserController(req: AuthRequest, res: Response) {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const name = String(req.body?.name || "").trim();
  const password = String(req.body?.password || "").trim();

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: "An account with that email already exists" });
  }

  const user = await User.create({
    email,
    name,
    passwordHash: await import("bcryptjs").then(({ default: bcrypt }) => bcrypt.hash(password, 12)),
    approved: false,
    permission: "view",
    isAdmin: false,
  });

  res.status(201).json({
    id: user.id,
    email: user.email,
    approved: user.approved,
    permission: user.permission,
  });
}

export async function changePasswordController(req: AuthRequest, res: Response) {
  const currentPassword = String(req.body?.currentPassword || "");
  const newPassword = String(req.body?.newPassword || "");
  const confirmPassword = String(req.body?.confirmPassword || "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: "Current password and both new-password fields are required" });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "New passwords do not match" });
  }

  await changePassword(req.userId || "", currentPassword, newPassword);
  res.json({ ok: true });
}

export async function resetPasswordController(req: AuthRequest, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const temporaryPassword = String(req.body?.temporaryPassword || "");
  if (!temporaryPassword) {
    return res.status(400).json({ message: "Temporary password is required" });
  }

  await resetUserPassword(id, temporaryPassword);
  res.json({ ok: true });
}

// Google auth is temporarily disabled. The app now requires admin approval for manual email sign-in.
