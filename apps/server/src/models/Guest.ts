import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    surname: { type: String, required: true, trim: true },
    telephone: { type: String, default: "" },
    email: { type: String, default: "" },
    guestOf: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    comments: { type: String, default: "" },
    archived: { type: Boolean, default: false },
    archivedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

schema.index({ guestOf: 1 });
schema.index({ archived: 1 });

export const Guest = model("Guest", schema);
