import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, ".env"),
});

const config = {
  server: {
    port: process.env.PORT || 3000,
  },
  db: {
    uri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/AssignmentSaraha",
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || "7dbf6cf937baa3b5b12071645755e4f6",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    otpSecret: process.env.OTP_SECRET || "dev_otp_hmac_secret_change_me",
    exposeOtpInDev: process.env.EXPOSE_OTP === "true",
  },
  encryption: {
    phoneKey: process.env.PHONE_SECRET || "dev_phone_secret",
    algorithm: process.env.PHONE_ALGORITHM || "aes-256-ctr",
  },
  encryptionKey: process.env.ENCRYPTION_KEY || "4668a1ccbb82e78940e6a71f14c8887aa74bfce034456c1f26867ef7ab4efe2a",
};

export default config;

