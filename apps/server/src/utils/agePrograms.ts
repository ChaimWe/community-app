const AGE_PROGRAM_ALIASES = new Set([
  "babies 1-5",
  "kids: 6-12",
  "kids 6-12",
  "teens 13-17",
  "young adults 18-30",
  "young adults",
  "women's club 20-40",
  "women's club",
  "young women's club",
  "young_womens_club",
  "middle women's club 40-65",
  "middle women's club",
  "elderly women 65+",
  "elderly women",
  "men 20-40",
]);

const AGE_PROGRAM_LABELS = {
  babies: "Babies 1-5",
  kids: "Kids: 6-12",
  teens: "Teens 13-17",
  youngAdults: "Young adults 18-30",
  women: "Women's club 20-40",
  middleWomen: "Middle women's club 40-65",
  elderlyWomen: "Elderly women 65+",
  men: "Men 20-40",
} as const;

type AgeProgramMember = {
  age?: unknown;
  birthday?: unknown;
  gender?: unknown;
  programs?: unknown;
};

function ageFromBirthday(value: unknown, now: Date): number | undefined {
  if (typeof value !== "string") return undefined;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return undefined;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const birthday = new Date(Date.UTC(year, month - 1, day));
  if (
    birthday.getUTCFullYear() !== year ||
    birthday.getUTCMonth() !== month - 1 ||
    birthday.getUTCDate() !== day ||
    birthday.getTime() > now.getTime()
  ) {
    return undefined;
  }

  let age = now.getUTCFullYear() - year;
  const hadBirthdayThisYear =
    now.getUTCMonth() + 1 > month ||
    (now.getUTCMonth() + 1 === month && now.getUTCDate() >= day);
  if (!hadBirthdayThisYear) age -= 1;
  return age;
}

function resolveAge(member: AgeProgramMember, now: Date): number | undefined {
  const birthdayAge = ageFromBirthday(member.birthday, now);
  if (birthdayAge !== undefined) return birthdayAge;

  const birthdayText = typeof member.birthday === "string" ? member.birthday.trim() : "";
  const legacyBirthdayAge = /^\d{1,3}$/.test(birthdayText) ? Number(birthdayText) : undefined;
  const candidate = typeof member.age === "number" ? member.age : legacyBirthdayAge;
  return Number.isInteger(candidate) && candidate! >= 0 && candidate! <= 120 ? candidate : undefined;
}

export function assignAgePrograms<T extends AgeProgramMember>(member: T, now = new Date()): T {
  const existingPrograms = Array.isArray(member.programs)
    ? member.programs.filter((program): program is string => typeof program === "string")
    : [];
  const retainedPrograms = existingPrograms.filter(
    (program) => !AGE_PROGRAM_ALIASES.has(program.trim().toLowerCase()),
  );
  const age = resolveAge(member, now);
  const gender = typeof member.gender === "string" ? member.gender.trim().toUpperCase() : "";
  const agePrograms: string[] = [];

  if (age !== undefined) {
    if (age >= 1 && age <= 5) agePrograms.push(AGE_PROGRAM_LABELS.babies);
    if (age >= 6 && age <= 12) agePrograms.push(AGE_PROGRAM_LABELS.kids);
    if (age >= 13 && age <= 17) agePrograms.push(AGE_PROGRAM_LABELS.teens);
    if (age >= 18 && age <= 30) agePrograms.push(AGE_PROGRAM_LABELS.youngAdults);

    if (gender === "FEMALE") {
      if (age >= 20 && age < 40) agePrograms.push(AGE_PROGRAM_LABELS.women);
      if (age >= 40 && age < 65) agePrograms.push(AGE_PROGRAM_LABELS.middleWomen);
      if (age >= 65) agePrograms.push(AGE_PROGRAM_LABELS.elderlyWomen);
    }

    if (gender === "MALE" && age >= 20 && age <= 40) {
      agePrograms.push(AGE_PROGRAM_LABELS.men);
    }
  }

  return { ...member, programs: [...new Set([...retainedPrograms, ...agePrograms])] };
}
