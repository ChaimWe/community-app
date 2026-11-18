import { z } from "zod";

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

export const memberInput = z.object({
  firstName: z.string().default(""),
  surname: z.string().default(""),
  fatherName: z.string().default(""),
  birthday: z.string().default(""),
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
