import { User } from "../../DB/models/User.model.js";
import { generateOtpCode, hashOtp } from "../../utils/otp.utils.js";
import config from "../../../config/Config.service.js";
import { MESSAGES } from "../../constants/index.js";

const OTP_TTL_MS = 15 * 60 * 1000;

function assignOtpToUser(user, email, plainCode) {
  user.otpHash = hashOtp(email, plainCode);
  user.otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
}

export function setSignupOtp(user, email) {
  const code = generateOtpCode();
  assignOtpToUser(user, email, code);
  return code;
}

export async function verifyAccountWithOtp({ email, otp }) {
  if (!email || !otp) {
    const err = new Error(MESSAGES.EMAIL_OTP_REQUIRED);
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+otpHash +otpExpiresAt"
  );
  if (!user) {
    const err = new Error(MESSAGES.USER_NOT_FOUND);
    err.statusCode = 404;
    throw err;
  }
  if (user.isEmailVerified) {
    const err = new Error(MESSAGES.ACCOUNT_ALREADY_VERIFIED);
    err.statusCode = 400;
    throw err;
  }
  if (!user.otpHash || !user.otpExpiresAt) {
    const err = new Error(MESSAGES.OTP_NOT_FOUND);
    err.statusCode = 400;
    throw err;
  }
  if (Date.now() > user.otpExpiresAt.getTime()) {
    const err = new Error(MESSAGES.OTP_EXPIRED);
    err.statusCode = 400;
    throw err;
  }
  if (hashOtp(email, otp) !== user.otpHash) {
    const err = new Error(MESSAGES.OTP_INVALID);
    err.statusCode = 400;
    throw err;
  }

  user.isEmailVerified = true;
  user.otpHash = undefined;
  user.otpExpiresAt = undefined;
  await user.save();

  return user.toSafeObject();
}

export async function resendOtp(email) {
  if (!email) {
    const err = new Error(MESSAGES.EMAIL_REQUIRED);
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+otpHash +otpExpiresAt"
  );
  if (!user) {
    const err = new Error(MESSAGES.USER_NOT_FOUND);
    err.statusCode = 404;
    throw err;
  }
  if (user.isEmailVerified) {
    const err = new Error(MESSAGES.ACCOUNT_ALREADY_VERIFIED);
    err.statusCode = 400;
    throw err;
  }

  const code = generateOtpCode();
  assignOtpToUser(user, user.email, code);
  await user.save();

  const out = { message: MESSAGES.OTP_RESENT };
  if (config.auth.exposeOtpInDev) {
    out.devOtp = code;
  }
  return out;
}
