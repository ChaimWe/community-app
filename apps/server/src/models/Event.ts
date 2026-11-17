import { Schema, model } from "mongoose";

const tableSchema = new Schema(
  {
    name: { type: String, required: true },
    capacity: { type: Number, required: true, min: 1 },
    memberIds: { type: [Schema.Types.ObjectId], ref: "Member", default: [] },
    lockedMemberIds: { type: [Schema.Types.ObjectId], ref: "Member", default: [] },
  },
  { _id: true },
);

const seatingSchema = new Schema(
  {
    name: { type: String, required: true },
    score: { type: Number, default: 0 },
    tables: { type: [tableSchema], default: [] },
    lockedMemberIds: { type: [Schema.Types.ObjectId], ref: "Member", default: [] },
    isFinal: { type: Boolean, default: false },
  },
  { _id: true, timestamps: true },
);

const schema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String, default: "" },
    attendeeIds: { type: [Schema.Types.ObjectId], ref: "Member", default: [] },
    tableCount: { type: Number, default: 0 },
    tableCapacity: { type: Number, default: 10 },
    seatingPlans: { type: [seatingSchema], default: [] },
  },
  { timestamps: true },
);

export const Event = model("Event", schema);
