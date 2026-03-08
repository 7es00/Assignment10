import { User } from "../../DB/models/User.model.js";
import { sign as signJwt } from "../../utils/jwt.utils.js";
import { MESSAGES } from "../../constants/index.js";

function generateToken(userId) {
  return signJwt({ userId });
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

  await user.save();

  const token = generateToken(user._id.toString());

  return {
    token,
    user: user.toSafeObject(),
  };
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

  const token = generateToken(user._id.toString());

  return {
    token,
    user: user.toSafeObject(),
  };
}

export async function updateCurrentUser(userId, updates) {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error(MESSAGES.USER_NOT_FOUND);
    error.statusCode = 404;
    throw error;
  }

  const { email, name, phone, age } = updates;

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

