import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["maintenance_due", "warranty_expiry", "battery_health", "system"],
      default: "system",
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedBike: { type: mongoose.Schema.Types.ObjectId, ref: "Bike" },
    isRead: { type: Boolean, default: false },
    sentByEmail: { type: Boolean, default: false },
    scheduledFor: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
