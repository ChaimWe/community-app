import fs from "node:fs";
import path from "node:path";
import { connectDatabase } from "../config/database";
import { Member } from "../models/Member";
import { assignAgePrograms } from "../utils/agePrograms";


const candidates = [
  path.resolve(process.cwd(), "data/members.json"),
  path.resolve(process.cwd(), "../../data/members.json"),
  path.resolve(__dirname, "../../../../data/members.json"),
];
const file: string = candidates.find((candidate) => fs.existsSync(candidate)) as string;

if (!file) {
  throw new Error(`members.json not found. Checked: ${candidates.join(" | ")}`);
}

type ImportedMember = {
  firstName?: string;
  surname?: string;
  fatherName?: string;
  birthday?: string;
  age?: number | string | null;
  gender?: string;
  telephone?: string;
  email?: string;
  address?: string;
  jewishStatus?: string;
  minyanAttendance?: string;
  programs?: string[];
  comments?: string;
  comments2?: string;
  documentLocation?: string;
};

async function run() {
  await connectDatabase();
  const raw = JSON.parse(fs.readFileSync(file, "utf8")) as ImportedMember[] | { members?: ImportedMember[] };
  const records = Array.isArray(raw) ? raw : raw.members || [];
  let inserted = 0;
  let updated = 0;

  for (const record of records) {
    const firstName = String(record.firstName || "").trim();
    const surname = String(record.surname || "").trim();
    const telephone = String(record.telephone || "").trim();
    const email = String(record.email || "").trim();
    const existing = telephone
      ? await Member.findOne({ telephone })
      : email
        ? await Member.findOne({ email })
        : await Member.findOne({ firstName, surname });

    const birthdayText = String(record.birthday || "").trim();
    const legacyBirthdayAge = /^\d{1,3}$/.test(birthdayText) ? Number(birthdayText) : null;
    const suppliedAgeValue = typeof record.age === "number"
      ? record.age
      : typeof record.age === "string" && record.age.trim()
        ? Number(record.age.trim())
        : null;
    const suppliedAge = Number.isInteger(suppliedAgeValue) && suppliedAgeValue! >= 0 && suppliedAgeValue! <= 120
      ? suppliedAgeValue
      : null;
    const minyanPrograms: Record<string, string> = {
      REGULAR: "Regular Minyan",
      SOMETIMES: "Sometimes Minyan",
      POTENTIAL: "Potential Minyan",
    };
    const minyanProgram = minyanPrograms[String(record.minyanAttendance || "").trim().toUpperCase()];
    const data = assignAgePrograms({
      firstName,
      surname,
      fatherName: record.fatherName || "",
      birthday: legacyBirthdayAge === null ? birthdayText : "",
      age: suppliedAge ?? legacyBirthdayAge,
      gender: record.gender || "",
      telephone,
      email,
      address: record.address || "",
      jewishStatus: record.jewishStatus || "",
      programs: [...new Set([...(Array.isArray(record.programs) ? record.programs : []), ...(minyanProgram ? [minyanProgram] : [])])],
      comments: record.comments || "",
      comments2: record.comments2 || "",
      documentLocation: record.documentLocation || "",
    });

    if (existing) {
      await Member.updateOne({ _id: existing._id }, { $set: data, $unset: { minyanAttendance: "" } });
      updated += 1;
    } else {
      await Member.create(data);
      inserted += 1;
    }
  }

  console.log({ inserted, updated, total: records.length });
  process.exit(0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
