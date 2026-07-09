import mongoose from "mongoose";

const partSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, default: "" }, // e.g. brakes, battery, motor
    compatibleBrands: [{ type: String }],
    compatibleModels: [{ type: String }],
    description: { type: String, default: "" },
    specifications: { type: mongoose.Schema.Types.Mixed, default: {} },
    price: { type: Number, default: 0 },
    availability: {
      type: String,
      enum: ["in_stock", "out_of_stock", "backorder"],
      default: "in_stock",
    },
    imageUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Part", partSchema);
