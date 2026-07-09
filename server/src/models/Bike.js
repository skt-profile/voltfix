import mongoose from "mongoose";

const bikeSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    vin: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    imageUrl: { type: String, default: "" },
    color: { type: String, default: "" },
    motorType: { type: String, default: "" }, // e.g. hub, mid-drive
    motorPowerWatts: { type: Number, default: 0 },
    mileageKm: { type: Number, default: 0 },
    purchaseDate: { type: Date },
    warrantyExpiresAt: { type: Date },
    status: {
      type: String,
      enum: ["active", "in_service", "retired"],
      default: "active",
    },
    battery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Battery",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

bikeSchema.index({ owner: 1, brand: 1, model: 1 });

export default mongoose.model("Bike", bikeSchema);
