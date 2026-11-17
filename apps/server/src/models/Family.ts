import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    memberIds: { type: [Schema.Types.ObjectId], ref: "Member", default: [] },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

export const Family = model("Family", schema);
