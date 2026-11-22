import { Guest } from "../models/Guest";
import { Member } from "../models/Member";

export async function createGuest(data: Record<string, unknown>) {
  const guestOf = String(data.guestOf);
  const member = await Member.findById(guestOf);
  if (!member) {
    throw Object.assign(new Error("Member not found"), { status: 404 });
  }

  return Guest.create(data);
}

export async function listGuests(memberId?: string, includeArchived = false) {
  const filter: Record<string, unknown> = {};
  if (!includeArchived) {
    filter.archived = { $ne: true };
  }
  if (memberId) {
    filter.guestOf = memberId;
  }
  return Guest.find(filter).sort({ surname: 1, firstName: 1 });
}

export async function getGuest(id: string) {
  return Guest.findById(id);
}

export async function updateGuest(id: string, data: Record<string, unknown>) {
  if (data.guestOf) {
    const member = await Member.findById(String(data.guestOf));
    if (!member) {
      throw Object.assign(new Error("Member not found"), { status: 404 });
    }
  }

  return Guest.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteGuest(id: string) {
  return Guest.findByIdAndDelete(id);
}

export async function archiveGuest(id: string) {
  return Guest.findByIdAndUpdate(id, { archived: true, archivedAt: new Date() }, { new: true });
}

export async function restoreGuest(id: string) {
  return Guest.findByIdAndUpdate(id, { archived: false, archivedAt: null }, { new: true });
}

export async function getGuestsByMember(memberId: string, includeArchived = false) {
  const filter: Record<string, unknown> = { guestOf: memberId };
  if (!includeArchived) {
    filter.archived = { $ne: true };
  }
  return Guest.find(filter).sort({ surname: 1, firstName: 1 });
}
