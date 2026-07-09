import mongoose from "mongoose";

const serviceHistorySchema = new mongoose.Schema(
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
    serviceType: {
      type: String,
      enum: [
        "battery",
        "motor",
        "brakes",
        "tyres",
        "controller",
        "general",
        "other",
      ],
      default: "general",
    },
    description: { type: String, required: true },
    cost: { type: Number, default: 0 },
    serviceDate: { type: Date, default: Date.now },
    mileageAtServiceKm: { type: Number, default: 0 },
    technician: { type: String, default: "" },
    billUrl: { type: String, default: "" }, // uploaded bill/receipt
    nextDueDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("ServiceHistory", serviceHistorySchema);
