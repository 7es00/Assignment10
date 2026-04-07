import { User } from "../../DB/models/User.model.js";
import { Message } from "../../DB/models/Message.model.js";
import { RefreshToken } from "../../DB/models/RefreshToken.model.js";
import { RevokedToken } from "../../DB/models/RevokedToken.model.js";
import { MESSAGES } from "../../constants/index.js";
import config from "../../../config/Config.service.js";
import { issueTokenPair } from "./token.service.js";
import { setSignupOtp } from "./otp.service.js";

function buildAuthPayload(user, tokens) {
  return {
    token: tokens.accessToken,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: user.toSafeObject(),
  };
}

export async function signupUser({ name, email, password, phone, age }) {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    const error = new Error(MESSAGES.EMAIL_EXISTS);
    error.statusCode = 400;
    throw error;
  }

  const user = new User({
    name,
    email,
    password,
    phone,
    age,
  });

  const otpCode = setSignupOtp(user, email);
  await user.save();

  const tokens = await issueTokenPair(user);
  const data = buildAuthPayload(user, tokens);
  if (config.auth.exposeOtpInDev) {
    data.devOtp = otpCode;
  }
  return data;
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    const error = new Error(MESSAGES.INVALID_EMAIL_OR_PASSWORD);
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error(MESSAGES.INVALID_EMAIL_OR_PASSWORD);
    error.statusCode = 401;
    throw error;
  }

  const tokens = await issueTokenPair(user);
  return buildAuthPayload(user, tokens);
}

export async function updateCurrentUser(userId, updates) {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error(MESSAGES.USER_NOT_FOUND);
    error.statusCode = 404;
    throw error;
  }

  const { email, name, phone, age, profileSlug } = updates;

  if (typeof profileSlug !== "undefined") {
    const slug = String(profileSlug).trim().toLowerCase();
    if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
      const error = new Error(MESSAGES.PROFILE_SLUG_FORMAT_INVALID);
      error.statusCode = 400;
      throw error;
    }
    if (slug !== user.profileSlug) {
      const exists = await User.findOne({
        profileSlug: slug,
        _id: { $ne: userId },
      }).lean();
      if (exists) {
        const error = new Error(MESSAGES.PROFILE_SLUG_TAKEN);
        error.statusCode = 400;
        throw error;
      }
      user.profileSlug = slug;
    }
  }

  if (email && email.toLowerCase() !== user.email) {
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      const error = new Error(MESSAGES.EMAIL_EXISTS);
      error.statusCode = 400;
      throw error;
    }
    user.email = email;
  }

  if (typeof name !== "undefined") user.name = name;
  if (typeof phone !== "undefined") user.phone = phone;
  if (typeof age !== "undefined") user.age = age;

  await user.save();

  return user.toSafeObject();
}

export async function deleteCurrentUser(userId) {
  await Promise.all([
    Message.deleteMany({ recipient: userId }),
    RefreshToken.deleteMany({ userId }),
    RevokedToken.deleteMany({ userId }),
  ]);

  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    const error = new Error(MESSAGES.USER_NOT_FOUND);
    error.statusCode = 404;
    throw error;
  }

  return user.toSafeObject();
}

export async function getCurrentUser(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error(MESSAGES.USER_NOT_FOUND);
    error.statusCode = 404;
    throw error;
  }
  return user.toSafeObject();
}
