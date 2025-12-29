import mongoose from "mongoose";

const orgSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    publicKey: { type: String, required: true, unique: true, index: true }
  },
  { timestamps: true }
);

export const Org = mongoose.model("Org", orgSchema);
