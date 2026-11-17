import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { env } from "../config/env";

export async function login(email: string, password: string) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    throw Object.assign(new Error("Invalid email or password"), { status: 401 });
  }
  return signToken(user.id);
}

export async function loginWithGoogle(profile: { googleId: string; email: string; name: string }) {
  const email = profile.email.toLowerCase();
  if (env.googleAllowedEmails.length && !env.googleAllowedEmails.includes(email)) {
    throw Object.assign(new Error("This Google account is not allowed to sign in"), { status: 403 });
  }

  const user = await User.findOneAndUpdate(
    { $or: [{ googleId: profile.googleId }, { email }] },
    { $set: { googleId: profile.googleId, email, name: profile.name || "" } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  if (!user) throw Object.assign(new Error("Could not save the Google account"), { status: 500 });
  return signToken(user.id);
}

function signToken(userId: string) {
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: "8h" });
}

export async function currentUser(userId: string) {
  if (!userId) return null;
  return User.findById(userId).select("name email");
}

export async function seedAdmin() {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) return;
  if (await User.exists({ email: env.ADMIN_EMAIL.toLowerCase() })) return;
  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
  await User.create({ email: env.ADMIN_EMAIL, passwordHash, name: "Administrator" });
  console.log(`Created password admin ${env.ADMIN_EMAIL}`);
}
