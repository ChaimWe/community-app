import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    fromMemberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    toMemberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    type: { type: String, required: true },
  },
  { timestamps: true },
);

schema.index({ fromMemberId: 1, toMemberId: 1, type: 1 }, { unique: true });

export const Relationship = model("Relationship", schema);
