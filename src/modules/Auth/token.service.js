import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sign } from "../../utils/jwt.utils.js";
import config from "../../../config/Config.service.js";
import { RefreshToken } from "../../DB/models/RefreshToken.model.js";

export const TOKEN_TYPES = {
  ACCESS: "access",
  REFRESH: "refresh",
};

export function createJti() {
  return crypto.randomUUID();
}

export async function issueTokenPair(user) {
  const userId = user._id.toString();
  const tv = user.tokenVersion ?? 0;
  const accessJti = createJti();
  const refreshJti = createJti();

  const accessToken = sign(
    {
      userId,
      tv,
      jti: accessJti,
      typ: TOKEN_TYPES.ACCESS,
    },
    config.auth.jwtExpiresIn
  );

  const refreshToken = sign(
    {
      userId,
      tv,
      jti: refreshJti,
      typ: TOKEN_TYPES.REFRESH,
    },
    config.auth.jwtRefreshExpiresIn
  );

  const decoded = jwt.decode(refreshToken);
  const expiresAt = new Date(decoded.exp * 1000);

  await RefreshToken.create({
    userId: user._id,
    jti: refreshJti,
    expiresAt,
  });

  return { accessToken, refreshToken };
}

export function getRefreshTokenFromRequest(req) {
  const auth = req.headers.authorization || "";
  if (auth.startsWith("Bearer ")) {
    return auth.slice(7).trim();
  }
  if (req.headers["x-refresh-token"]) {
    return String(req.headers["x-refresh-token"]).trim();
  }
  if (req.query.refreshToken) {
    return String(req.query.refreshToken).trim();
  }
  return "";
}

export function getAccessTokenFromRequest(req) {
  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }
  return String(req.headers.token || "").trim();
}
