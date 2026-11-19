import { Group } from "../models/Group";
import { Member } from "../models/Member";

function normalizeMemberIds(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return [...new Set(value.map(String))];
}

async function syncGroupMembers(groupId: string, previousIds: unknown[], nextIds: string[]) {
  const previous = previousIds.map(String);
  const removedIds = previous.filter((id) => !nextIds.includes(id));
  const addedIds = nextIds.filter((id) => !previous.includes(id));

  if (removedIds.length) {
    await Member.updateMany({ _id: { $in: removedIds } }, { $pull: { groupIds: groupId } });
  }
  if (addedIds.length) {
    await Member.updateMany({ _id: { $in: addedIds } }, { $addToSet: { groupIds: groupId } });
  }
}

export async function listGroups(includeArchived = false) {
  const filter = includeArchived ? {} : { archived: { $ne: true } };
  return Group.find(filter).sort({ name: 1 });
}

export async function createGroup(data: Record<string, unknown>) {
  const memberIds = normalizeMemberIds(data.memberIds) || [];
  const group = await Group.create({ ...data, memberIds });
  await syncGroupMembers(group.id, [], memberIds);
  return group;
}

export async function updateGroup(id: string, data: Record<string, unknown>) {
  const group = await Group.findById(id);
  if (!group) return null;

  const memberIds = normalizeMemberIds(data.memberIds);
  const previousIds = group.memberIds.map(String);
  const { memberIds: _memberIds, ...details } = data;
  Object.assign(group, details);
  if (memberIds) group.memberIds = memberIds as never;
  await group.save();
  if (memberIds) await syncGroupMembers(group.id, previousIds, memberIds);
  return group;
}

export async function addMembers(id: string, memberIds: string[]) {
  const group = await Group.findById(id);
  if (!group) return null;
  const previousIds = group.memberIds.map(String);
  const nextIds = [...new Set([...previousIds, ...memberIds.map(String)])];
  group.memberIds = nextIds as never;
  await group.save();
  await syncGroupMembers(group.id, previousIds, nextIds);
  return group;
}

export async function archiveGroup(id: string) {
  return Group.findByIdAndUpdate(id, { archived: true, archivedAt: new Date() }, { new: true });
}

export async function restoreGroup(id: string) {
  return Group.findByIdAndUpdate(id, { archived: false, archivedAt: null }, { new: true });
}

export async function deleteGroup(id: string) {
  const group = await Group.findById(id);
  if (!group) return null;
  await Member.updateMany({ groupIds: group._id }, { $pull: { groupIds: group._id } });
  await group.deleteOne();
  return group;
}
