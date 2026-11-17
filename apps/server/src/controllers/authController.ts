import crypto from "node:crypto";
import { Response } from "express";
import { env } from "../config/env";
import { clearAuthCookies, setSessionCookie, setStateCookie } from "../lib/cookies";
import { AuthRequest } from "../middleware/auth";
import { currentUser, login, loginWithGoogle } from "../services/authService";

function failLogin(res: Response, message: string) {
  const url = new URL("/login", env.APP_URL);
  url.searchParams.set("error", message);
  res.redirect(url.toString());
}

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
  res.json({ name: user.name, email: user.email });
}

export function googleStart(_req: AuthRequest, res: Response) {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return failLogin(res, "Google sign-in is not configured yet");
  }

  const state = crypto.randomBytes(24).toString("hex");
  setStateCookie(res, state);

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
  url.searchParams.set("redirect_uri", env.googleCallbackUrl);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");
  res.redirect(url.toString());
}

export async function googleCallback(req: AuthRequest, res: Response) {
  const code = String(req.query.code || "");
  const state = String(req.query.state || "");
  if (!code || !state || state !== req.cookies?.oauth_state) {
    return failLogin(res, "Google sign-in could not be verified. Try again.");
  }
  res.clearCookie("oauth_state", { httpOnly: true, sameSite: "lax", secure: env.secureCookies, path: "/" });

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.googleCallbackUrl,
        grant_type: "authorization_code",
      }),
    });
    const tokenBody = (await tokenResponse.json()) as { access_token?: string };
    if (!tokenResponse.ok || !tokenBody.access_token) {
      return failLogin(res, "Google did not return an access token");
    }

    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenBody.access_token}` },
    });
    const profile = (await profileResponse.json()) as { sub?: string; email?: string; name?: string; email_verified?: boolean };
    if (!profileResponse.ok || !profile.sub || !profile.email || profile.email_verified === false) {
      return failLogin(res, "Google did not return a verified email");
    }

    const token = await loginWithGoogle({ googleId: profile.sub, email: profile.email, name: profile.name || "" });
    setSessionCookie(res, token);
    res.redirect(env.APP_URL);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Google sign-in failed";
    failLogin(res, message);
  }
}
