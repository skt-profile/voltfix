import mongoose from "mongoose";

/**
 * Connects to MongoDB Atlas using the URI in process.env.MONGO_URI.
 * Exits the process if the connection fails, since the API is unusable without a DB.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);

    mongoose.connection.on("error", (err) => {
      console.error(`[MongoDB] Connection error: ${err.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("[MongoDB] Disconnected. Attempting to reconnect is handled by the driver.");
    });
  } catch (error) {
    console.error(`[MongoDB] Failed to connect: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
