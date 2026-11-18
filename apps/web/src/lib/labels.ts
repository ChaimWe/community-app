export const GROUP_TYPE_LABELS: Record<string, string> = {
  CLASS: "Class",
  FRIENDS: "Friends",
  AGE_GROUP: "Age group",
  FAMILY: "Family",
  YOUTH: "Youth",
  OTHER: "Other",
};

export const SEATING_MODE_LABELS: Record<string, string> = {
  NONE: "No preference",
  KEEP_TOGETHER: "Keep together",
  SPREAD: "Spread across tables",
};

export const PROGRAM_OPTIONS = [
  "Babies 1-5",
  "Kids: 6-12",
  "Teens 13-17",
  "Young adults 18-30",
  "Women's club 20-40",
  "Middle women's club 40-65",
  "Elderly women 65+",
  "Regular Minyan",
  "Sometimes Minyan",
  "Potential Minyan",
  "Men 20-40",
  "Need of packages delivered",
  "Need of visitation",
] as const;

export const EVENT_TYPE_LABELS: Record<string, string> = {
  HOLIDAY_MEAL: "Holiday meal",
  AGE_GROUP: "Age group",
  COMMUNITY: "Community",
  OTHER: "Other",
};

export function memberName(member?: { firstName?: string; surname?: string } | null) {
  const name = [member?.firstName, member?.surname].filter(Boolean).join(" ").trim();
  return name || "Unnamed member";
}

export function memberInitials(name: string) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "");
  return letters.join("") || "?";
}

export function asId(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "_id" in value) return String((value as { _id: unknown })._id);
  return String(value ?? "");
}
