import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true },
    description: { type: String, default: "" },
    memberIds: { type: [Schema.Types.ObjectId], ref: "Member", default: [] },
    seatingMode: { type: String, enum: ["NONE", "KEEP_TOGETHER", "SPREAD"], default: "NONE" },
    archived: { type: Boolean, default: false },
    archivedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

schema.index({ name: 1 }, { unique: true });

export const Group = model("Group", schema);
