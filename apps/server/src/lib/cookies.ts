import { CookieOptions, Response } from "express";
import { env } from "../config/env";

const eightHours = 8 * 60 * 60 * 1000;

function baseOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: env.secureCookies,
    path: "/",
  };
}

export function setSessionCookie(res: Response, token: string) {
  res.cookie("token", token, { ...baseOptions(), maxAge: eightHours });
}

export function setStateCookie(res: Response, state: string) {
  res.cookie("oauth_state", state, { ...baseOptions(), maxAge: 10 * 60 * 1000 });
}

export function clearAuthCookies(res: Response) {
  const options = baseOptions();
  res.clearCookie("token", options);
  res.clearCookie("oauth_state", options);
}
