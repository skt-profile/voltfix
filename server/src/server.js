import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import path from "path";

import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

import authRoutes from "./routes/authRoutes.js";
import bikeRoutes from "./routes/bikeRoutes.js";
import manualRoutes from "./routes/manualRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

// Load .env
dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

// Debug Environment Variables
console.log("====================================");
console.log("ENVIRONMENT DEBUG");
console.log("Working Directory:", process.cwd());
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT);
console.log("GEMINI_API_KEY Loaded:", !!process.env.GEMINI_API_KEY);

if (process.env.GEMINI_API_KEY) {
  console.log(
    "GEMINI_API_KEY Starts With:",
    process.env.GEMINI_API_KEY.substring(0, 10)
  );
} else {
  console.log("❌ GEMINI_API_KEY NOT FOUND");
}

console.log("====================================");

const app = express();

// --- Security & core middleware ---
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());

app.use(
  morgan(process.env.NODE_ENV === "production" ? "combined" : "dev")
);

app.use("/api", apiLimiter);

// Serve uploaded files
app.use("/uploads", express.static(path.resolve("src/uploads")));

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "VoltFix AI API is running",
    time: new Date().toISOString(),
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/bikes", bikeRoutes);
app.use("/api/manuals", manualRoutes);
app.use("/api/chat", chatRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(
      `[Server] VoltFix AI API running on port ${PORT} (${process.env.NODE_ENV || "development"})`
    );
  });
};

start();

export default app;