import mongoose from "mongoose";

const errorCodeSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    meaning: { type: String, default: "" },
    cause: { type: String, default: "" },
    repairProcedure: { type: String, default: "" },
    safetyInstructions: { type: String, default: "" },
    estimatedCostRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },
    estimatedTimeMinutes: { type: Number, default: 0 },
    sourceManual: { type: mongoose.Schema.Types.ObjectId, ref: "Manual" },
  },
  { timestamps: true }
);

errorCodeSchema.index({ brand: 1, model: 1, code: 1 }, { unique: true });

export default mongoose.model("ErrorCode", errorCodeSchema);
