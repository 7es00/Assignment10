import { createHmac, randomInt } from "crypto";
import config from "../../config/Config.service.js";

export function generateOtpCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashOtp(email, otp) {
  return createHmac("sha256", config.auth.otpSecret)
    .update(`${email.toLowerCase().trim()}:${String(otp).trim()}`)
    .digest("hex");
}
