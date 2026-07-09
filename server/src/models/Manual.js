import mongoose from "mongoose";

const manualSchema = new mongoose.Schema(
  {
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    brand: { type: String, trim: true, default: "" },
    model: { type: String, trim: true, default: "" },
    manualType: {
      type: String,
      enum: ["service", "repair", "firmware", "wiring", "other"],
      default: "other",
    },
    originalFilename: { type: String, required: true },
    fileUrl: { type: String, required: true }, // path/URL to stored PDF
    fileSizeBytes: { type: Number, default: 0 },
    pageCount: { type: Number, default: 0 },
    chunkCount: { type: Number, default: 0 },
    // Namespace used to isolate this manual's vectors inside the shared Pinecone index
    pineconeNamespace: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["processing", "ready", "failed"],
      default: "processing",
    },
    errorMessage: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Manual", manualSchema);
