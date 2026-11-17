import { Member } from "../models/Member";

function searchFilter(search: string) {
  if (!search) return {};
  const pattern = { $regex: search, $options: "i" };
  return {
    $or: [{ firstName: pattern }, { surname: pattern }, { telephone: pattern }, { email: pattern }],
  };
}

export async function listMembers(search = "") {
  return Member.find(searchFilter(search)).sort({ surname: 1, firstName: 1 }).limit(1000);
}

export async function getMember(id: string) {
  return Member.findById(id).populate("groupIds").populate("familyId");
}

export async function createMember(data: Record<string, unknown>) {
  return Member.create(data);
}

export async function updateMember(id: string, data: Record<string, unknown>) {
  return Member.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export async function deleteMember(id: string) {
  return Member.findByIdAndDelete(id);
}
