import { Schema, model } from "mongoose";

const memberSchema = new Schema(
  {
    firstName: { type: String, default: "", trim: true },
    surname: { type: String, default: "", trim: true },
    fatherName: { type: String, default: "" },
    birthday: { type: String, default: "" },
    age: { type: Number, min: 0, max: 120, default: null },
    gender: { type: String, default: "" },
    telephone: { type: String, default: "" },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    jewishStatus: { type: String, default: "" },
    programs: { type: [String], default: [] },
    comments: { type: String, default: "" },
    comments2: { type: String, default: "" },
    documentLocation: { type: String, default: "" },
    archived: { type: Boolean, default: false },
    archivedAt: { type: Date, default: null },
    familyId: { type: Schema.Types.ObjectId, ref: "Family", default: null },
    spouseId: { type: Schema.Types.ObjectId, ref: "Member", default: null },
    parentIds: { type: [Schema.Types.ObjectId], ref: "Member", default: [] },
    childIds: { type: [Schema.Types.ObjectId], ref: "Member", default: [] },
    groupIds: { type: [Schema.Types.ObjectId], ref: "Group", default: [] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

memberSchema.index({ surname: 1, firstName: 1 });
memberSchema.index({ telephone: 1 });
memberSchema.index({ email: 1 });

export const Member = model("Member", memberSchema);
