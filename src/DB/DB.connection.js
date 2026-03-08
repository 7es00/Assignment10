import mongoose from "mongoose";
import config from "../../config/Config.service.js";
import { MESSAGES } from "../constants/index.js";

export async function connectDB() {
  const uri = config.db.uri;

  if (!uri) {
    throw new Error(MESSAGES.DB_URI_NOT_DEFINED);
  }

  try {
    await mongoose.connect(uri, {
    });
    console.log(MESSAGES.DB_CONNECTED);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

