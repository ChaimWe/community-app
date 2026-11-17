import { Connection } from "../models/Connection";

export async function listConnections(memberId?: string) {
  if (!memberId) return Connection.find();
  return Connection.find({ $or: [{ fromMemberId: memberId }, { toMemberId: memberId }] });
}

export async function upsertConnection(data: { fromMemberId: string; toMemberId: string }) {
  return Connection.findOneAndUpdate(
    { fromMemberId: data.fromMemberId, toMemberId: data.toMemberId },
    data,
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

export async function deleteConnection(id: string) {
  return Connection.findByIdAndDelete(id);
}
