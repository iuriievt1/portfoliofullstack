import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    body: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true, _id: true }
);

const leadSchema = new mongoose.Schema(
  {
    org: { type: mongoose.Schema.Types.ObjectId, ref: "Org", required: true, index: true },
    stage: { type: String, enum: ["new", "contacted", "qualified", "proposal", "won", "lost"], default: "new", index: true },
    name: { type: String, required: true },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    company: { type: String, default: "" },
    source: { type: String, default: "manual" }, // manual | public-form
    message: { type: String, default: "" },
    value: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    notes: { type: [noteSchema], default: [] },
    lastTouchedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

leadSchema.index({ org: 1, updatedAt: -1 });

export const Lead = mongoose.model("Lead", leadSchema);
