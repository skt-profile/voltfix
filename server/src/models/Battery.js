import mongoose from "mongoose";

const batterySchema = new mongoose.Schema(
  {
    bike: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bike",
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    capacityWh: { type: Number, default: 0 },
    ageMonths: { type: Number, default: 0 },
    chargeCycles: { type: Number, default: 0 },
    avgTemperatureC: { type: Number, default: 25 },
    mileageKm: { type: Number, default: 0 },
    chargingFrequencyPerWeek: { type: Number, default: 0 },
    motorUsageIntensity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    // Latest AI-generated prediction snapshot
    lastPrediction: {
      healthPercent: { type: Number, min: 0, max: 100 },
      score: { type: Number, min: 0, max: 100 },
      expectedRemainingLifeMonths: { type: Number },
      suggestedMaintenance: [{ type: String }],
      aiExplanation: { type: String },
      predictedAt: { type: Date },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Battery", batterySchema);
