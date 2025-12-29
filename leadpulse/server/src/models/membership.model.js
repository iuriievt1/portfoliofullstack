import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema(
  {
    org: { type: mongoose.Schema.Types.ObjectId, ref: "Org", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    role: { type: String, enum: ["owner", "admin", "member"], default: "member" }
  },
  { timestamps: true }
);

membershipSchema.index({ org: 1, user: 1 }, { unique: true });

export const Membership = mongoose.model("Membership", membershipSchema);
