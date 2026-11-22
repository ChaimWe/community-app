import { z } from "zod";

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

export const memberInput = z.object({
  firstName: z.string().default(""),
  surname: z.string().default(""),
  fatherName: z.string().default(""),
  birthday: z.string().default(""),
  age: z.number().int().min(0).max(120).nullable().default(null),
  gender: z.string().default(""),
  telephone: z.string().default(""),
  email: z.string().default(""),
  address: z.string().default(""),
  jewishStatus: z.string().default(""),
  programs: z.array(z.string()).default([]),
  comments: z.string().default(""),
  comments2: z.string().default(""),
  documentLocation: z.string().default(""),
});

export const guestInput = z.object({
  firstName: z.string().min(1, "First name is required"),
  surname: z.string().min(1, "Last name is required"),
  telephone: z.string().default(""),
  email: z.string().default(""),
  guestOf: z.string().regex(/^[a-f\d]{24}$/i, "Invalid member id"),
  comments: z.string().default(""),
});

