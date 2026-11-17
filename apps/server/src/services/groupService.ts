import { Group } from "../models/Group";
import { Member } from "../models/Member";

export async function listGroups() {
  return Group.find().sort({ name: 1 });
}

export async function createGroup(data: Record<string, unknown>) {
  return Group.create(data);
}

export async function updateGroup(id: string, data: Record<string, unknown>) {
  return Group.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export async function addMembers(id: string, memberIds: string[]) {
  const group = await Group.findByIdAndUpdate(
    id,
    { $addToSet: { memberIds: { $each: memberIds } } },
    { new: true },
  );
  await Member.updateMany({ _id: { $in: memberIds } }, { $addToSet: { groupIds: id } });
  return group;
}
