import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, default: "" },
    googleId: { type: String },
    name: { type: String, default: "" },
    isAdmin: { type: Boolean, default: false },
    approved: { type: Boolean, default: false },
    permission: { type: String, enum: ["view", "edit"], default: "view" },
  },
  { timestamps: true },
);

schema.index({ googleId: 1 }, { unique: true, sparse: true });

export const User = model("User", schema);
