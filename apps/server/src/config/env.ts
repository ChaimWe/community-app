import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const fallbackAppUrl = process.env.APP_URL ?? process.env.CLIENT_URL ?? "http://localhost:5173";
const runtimeEnv = {
  ...process.env,
  APP_URL: fallbackAppUrl,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL ?? `${fallbackAppUrl}/api/auth/google/callback`,
};

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  APP_URL: z.string().url("APP_URL must be an absolute URL").transform((value) => value.replace(/\/$/, "")),
  GOOGLE_AUTH_ENABLED: z
    .string()
    .trim()
    .toLowerCase()
    .default("false")
    .transform((value) => value === "true"),
  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),
  GOOGLE_ALLOWED_EMAILS: z.string().default(""),
  GOOGLE_CALLBACK_URL: z.string().url("GOOGLE_CALLBACK_URL must be an absolute URL").default(`${fallbackAppUrl}/api/auth/google/callback`),
  ADMIN_EMAIL: z.string().default(""),
  ADMIN_PASSWORD: z.string().default(""),
});

const result = schema.safeParse(runtimeEnv);
if (!result.success) {
  const details = result.error.issues.map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`);
  console.error(`Invalid environment:\n${details.map((line) => `  - ${line}`).join("\n")}`);
  process.exit(1);
}

const parsed = result.data;
const googleAllowedEmails = parsed.GOOGLE_ALLOWED_EMAILS.split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);
const googleAuthEnabled = parsed.GOOGLE_AUTH_ENABLED;
const problems: string[] = [];

if (parsed.NODE_ENV === "production" && !parsed.APP_URL.startsWith("https://")) {
  problems.push("APP_URL: production must use https://");
}
if (parsed.NODE_ENV === "production" && googleAuthEnabled && !parsed.GOOGLE_CLIENT_ID) {
  problems.push("GOOGLE_CLIENT_ID is required in production when Google auth is enabled");
}
if (parsed.NODE_ENV === "production" && googleAuthEnabled && !parsed.GOOGLE_CLIENT_SECRET) {
  problems.push("GOOGLE_CLIENT_SECRET is required in production when Google auth is enabled");
}
if (parsed.NODE_ENV === "production" && googleAuthEnabled && googleAllowedEmails.length === 0) {
  problems.push("GOOGLE_ALLOWED_EMAILS is required in production when Google auth is enabled");
}
if ((parsed.ADMIN_EMAIL && !parsed.ADMIN_PASSWORD) || (!parsed.ADMIN_EMAIL && parsed.ADMIN_PASSWORD)) {
  problems.push("ADMIN_EMAIL and ADMIN_PASSWORD must be set together");
}
if (parsed.ADMIN_EMAIL && !z.string().email().safeParse(parsed.ADMIN_EMAIL).success) problems.push("ADMIN_EMAIL must be an email");
if (parsed.ADMIN_PASSWORD && parsed.ADMIN_PASSWORD.length < 8) problems.push("ADMIN_PASSWORD must be at least 8 characters");

if (problems.length) {
  console.error(`Invalid environment:\n${problems.map((line) => `  - ${line}`).join("\n")}`);
  process.exit(1);
}

export const env = {
  ...parsed,
  googleAllowedEmails,
  googleAuthEnabled,
  isProduction: parsed.NODE_ENV === "production",
  secureCookies: parsed.APP_URL.startsWith("https://"),
  googleCallbackUrl: `${parsed.APP_URL}/api/auth/google/callback`,
};
