import { verify } from "../../utils/jwt.utils.js";
import { User } from "../../DB/models/User.model.js";
import { RevokedToken } from "../../DB/models/RevokedToken.model.js";
import { RefreshToken } from "../../DB/models/RefreshToken.model.js";
import { issueTokenPair, TOKEN_TYPES } from "./token.service.js";
import { MESSAGES } from "../../constants/index.js";

export async function revokeAccessTokenJti(decoded, expiresAtSec) {
  if (!decoded?.jti || !expiresAtSec) return;
  try {
    await RevokedToken.create({
      jti: decoded.jti,
      userId: decoded.userId,
      expiresAt: new Date(expiresAtSec * 1000),
    });
  } catch (err) {
    if (err?.code !== 11000) {
      throw err;
    }
  }
}

export async function logoutCurrentSession(accessToken) {
  let decoded;
  try {
    decoded = verify(accessToken);
  } catch {
    const err = new Error(MESSAGES.AUTH_TOKEN_INVALID);
    err.statusCode = 401;
    throw err;
  }
  if (decoded.typ && decoded.typ !== TOKEN_TYPES.ACCESS) {
    const err = new Error(MESSAGES.AUTH_TOKEN_INVALID);
    err.statusCode = 401;
    throw err;
  }
  if (decoded.jti && decoded.exp) {
    await revokeAccessTokenJti(decoded, decoded.exp);
  }
}

export async function logoutAllDevices(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error(MESSAGES.USER_NOT_FOUND);
    err.statusCode = 404;
    throw err;
  }
  user.tokenVersion = (user.tokenVersion ?? 0) + 1;
  await user.save();
  await Promise.all([
    RefreshToken.deleteMany({ userId: user._id }),
    RevokedToken.deleteMany({ userId: user._id }),
  ]);
  return { tokenVersion: user.tokenVersion };
}

export async function refreshWithToken(refreshTokenRaw) {
  if (!refreshTokenRaw) {
    const err = new Error(MESSAGES.REFRESH_TOKEN_MISSING);
    err.statusCode = 401;
    throw err;
  }
  let decoded;
  try {
    decoded = verify(refreshTokenRaw);
  } catch {
    const err = new Error(MESSAGES.REFRESH_TOKEN_INVALID);
    err.statusCode = 401;
    throw err;
  }
  if (decoded.typ !== TOKEN_TYPES.REFRESH) {
    const err = new Error(MESSAGES.REFRESH_TOKEN_INVALID);
    err.statusCode = 401;
    throw err;
  }

  const stored = await RefreshToken.findOne({ jti: decoded.jti }).lean();
  if (!stored) {
    const err = new Error(MESSAGES.REFRESH_TOKEN_INVALID);
    err.statusCode = 401;
    throw err;
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    const err = new Error(MESSAGES.USER_NOT_FOUND);
    err.statusCode = 401;
    throw err;
  }
  if ((user.tokenVersion ?? 0) !== (decoded.tv ?? 0)) {
    const err = new Error(MESSAGES.REFRESH_TOKEN_INVALID);
    err.statusCode = 401;
    throw err;
  }

  await RefreshToken.deleteOne({ _id: stored._id });

  const { accessToken, refreshToken } = await issueTokenPair(user);

  return {
    accessToken,
    refreshToken,
    user: user.toSafeObject(),
  };
}
