import { Member } from "../models/Member";

function searchFilter(search: string, program = "", includeArchived = false) {
  const filters: Record<string, unknown>[] = [];
  if (!includeArchived) {
    filters.push({ archived: { $ne: true } });
  }

  if (search) {
    const pattern = { $regex: search, $options: "i" };
    filters.push({
      $or: [
        { firstName: pattern },
        { surname: pattern },
        { telephone: pattern },
        { email: pattern },
        { programs: pattern },
      ],
    });
  }

  if (program) {
    filters.push({ programs: program });
  }

  return { $and: filters };
}

export async function listMembers(search = "", program = "", includeArchived = false) {
  return Member.find(searchFilter(search, program, includeArchived)).sort({ surname: 1, firstName: 1 }).limit(1000);
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

export async function archiveMember(id: string) {
  return Member.findByIdAndUpdate(id, { archived: true, archivedAt: new Date() }, { new: true });
}

export async function restoreMember(id: string) {
  return Member.findByIdAndUpdate(id, { archived: false, archivedAt: null }, { new: true });
}

export async function deleteMember(id: string) {
  return Member.findByIdAndDelete(id);
}
