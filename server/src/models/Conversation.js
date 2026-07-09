import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    sources: [
      {
        manual: { type: mongoose.Schema.Types.ObjectId, ref: "Manual" },
        manualTitle: String,
        page: Number,
        snippet: String,
        score: Number,
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    manual: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Manual",
      default: null, // null = search across all of the user's manuals
    },
    title: { type: String, default: "New conversation" },
    messages: [messageSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", conversationSchema);
