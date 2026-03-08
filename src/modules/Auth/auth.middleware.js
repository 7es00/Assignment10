import { verify as verifyJwt } from "../../utils/jwt.utils.js";
import { MESSAGES } from "../../constants/index.js";

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader || req.headers.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: MESSAGES.AUTH_TOKEN_MISSING,
    });
  }

  try {
    const decoded = verifyJwt(token);
    req.user = { userId: decoded.userId };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: MESSAGES.AUTH_TOKEN_INVALID,
    });
  }
}

