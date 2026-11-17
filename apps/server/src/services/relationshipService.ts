import { Relationship } from "../models/Relationship";

export async function listRelationships(memberId?: string) {
  if (!memberId) return Relationship.find();
  return Relationship.find({ $or: [{ fromMemberId: memberId }, { toMemberId: memberId }] });
}

export async function createRelationship(data: Record<string, unknown>) {
  return Relationship.create(data);
}

export async function deleteRelationship(id: string) {
  return Relationship.findByIdAndDelete(id);
}
