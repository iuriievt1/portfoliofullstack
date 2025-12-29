import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    org: { type: mongoose.Schema.Types.ObjectId, ref: "Org", required: true, index: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true }, // lead.created, lead.moved, lead.note, etc.
    message: { type: String, required: true },
    meta: { type: Object, default: {} }
  },
  { timestamps: true }
);

activitySchema.index({ org: 1, createdAt: -1 });

export const Activity = mongoose.model("Activity", activitySchema);
