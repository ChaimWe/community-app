import fs from "node:fs";
import path from "node:path";
import { connectDatabase } from "../config/database";
import { Member } from "../models/Member";

const file = path.resolve(process.cwd(), "data/members.json");

type ImportedMember = {
  firstName?: string;
  surname?: string;
  fatherName?: string;
  birthday?: string;
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

    const data = {
      firstName,
      surname,
      fatherName: record.fatherName || "",
      birthday: record.birthday || "",
      gender: record.gender || "",
      telephone,
      email,
      address: record.address || "",
      jewishStatus: record.jewishStatus || "",
      minyanAttendance: record.minyanAttendance || "",
      programs: Array.isArray(record.programs) ? record.programs : [],
      comments: record.comments || "",
      comments2: record.comments2 || "",
      documentLocation: record.documentLocation || "",
    };

    if (existing) {
      await Member.updateOne({ _id: existing._id }, { $set: data });
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
