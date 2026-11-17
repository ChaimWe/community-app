import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    fromMemberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    toMemberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    type: { type: String, required: true },
    weight: { type: Number, default: 1, min: 0, max: 10 },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

schema.index({ fromMemberId: 1, toMemberId: 1 }, { unique: true });

export const Connection = model("Connection", schema);
