import fs from "node:fs";
import path from "node:path";
import { connectDatabase } from "../config/database";
import { Member } from "../models/Member";
import { assignAgePrograms } from "../utils/agePrograms";

type SourceMember = {
  firstName?: string;
  surname?: string;
  telephone?: string;
  email?: string;
  minyanAttendance?: string;
};

const memberFileCandidates = [
  path.resolve(process.cwd(), "data/members.json"),
  path.resolve(process.cwd(), "../../data/members.json"),
  path.resolve(__dirname, "../../../../data/members.json"),
];
const memberFile = memberFileCandidates.find((candidate) => fs.existsSync(candidate));

function sourceMemberLookup(records: SourceMember[]) {
  const byTelephone = new Map<string, SourceMember>();
  const byEmail = new Map<string, SourceMember>();
  const byName = new Map<string, SourceMember>();
  for (const record of records) {
    const telephone = String(record.telephone || "").trim();
    const email = String(record.email || "").trim().toLowerCase();
    const name = `${String(record.firstName || "").trim().toLowerCase()}\0${String(record.surname || "").trim().toLowerCase()}`;
    if (telephone) byTelephone.set(telephone, record);
    if (email) byEmail.set(email, record);
    byName.set(name, record);
  }
  return (member: SourceMember) => {
    const telephone = String(member.telephone || "").trim();
    const email = String(member.email || "").trim().toLowerCase();
    const name = `${String(member.firstName || "").trim().toLowerCase()}\0${String(member.surname || "").trim().toLowerCase()}`;
    return (telephone && byTelephone.get(telephone)) || (email && byEmail.get(email)) || byName.get(name);
  };
}

const MINYAN_PROGRAMS: Record<string, string> = {
  REGULAR: "Regular Minyan",
  SOMETIMES: "Sometimes Minyan",
  POTENTIAL: "Potential Minyan",
};

async function run() {
  await connectDatabase();
  let scanned = 0;
  let updated = 0;
  let sourceFor = (_member: SourceMember) => undefined as SourceMember | undefined;

  if (memberFile) {
    const raw = JSON.parse(fs.readFileSync(memberFile, "utf8")) as SourceMember[] | { members?: SourceMember[] };
    sourceFor = sourceMemberLookup(Array.isArray(raw) ? raw : raw.members || []);
  }

  try {
    const cursor = Member.find().cursor();
    for await (const member of cursor) {
      scanned += 1;
      const source = sourceFor(member);
      const minyanProgram = MINYAN_PROGRAMS[String(source?.minyanAttendance || "").trim().toUpperCase()];
      const programs = [...(member.programs || []).map(String)];
      if (minyanProgram && !programs.includes(minyanProgram)) programs.push(minyanProgram);
      const nextPrograms = assignAgePrograms({ ...member.toObject(), programs }).programs as string[];
      const currentPrograms = member.programs || [];
      if (currentPrograms.length === nextPrograms.length && currentPrograms.every((value, index) => value === nextPrograms[index])) {
        continue;
      }

      await Member.updateOne({ _id: member._id }, { $set: { programs: nextPrograms } });
      updated += 1;
    }

    console.log({ scanned, updated });
  } finally {
    await Member.db.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
