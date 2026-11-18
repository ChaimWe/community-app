import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { User } from "../models/User";

export interface AuthRequest extends Request {
  userId?: string;
  isAdmin?: boolean;
  userPermission?: "view" | "edit";
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Authentication required" });

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    const user = await User.findById(payload.userId).select("approved isAdmin permission");
    if (!user) return res.status(401).json({ message: "Authentication required" });
    if (!user.approved) return res.status(403).json({ message: "Your account is pending admin approval" });

    req.userId = payload.userId;
    req.isAdmin = !!user.isAdmin;
    req.userPermission = user.permission;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired session" });
  }
}

export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.userId) return res.status(401).json({ message: "Authentication required" });
  if (!req.isAdmin) return res.status(403).json({ message: "Admin access required" });
  next();
}

export function requireEdit(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.userId) return res.status(401).json({ message: "Authentication required" });
  if (!req.isAdmin && req.userPermission !== "edit") {
    return res.status(403).json({ message: "Edit permission required" });
  }
  next();
}
