import { verify } from "../../utils/jwt.utils.js";
import { User } from "../../DB/models/User.model.js";
import { RevokedToken } from "../../DB/models/RevokedToken.model.js";
import { MESSAGES } from "../../constants/index.js";
import { TOKEN_TYPES } from "./token.service.js";

export async function authMiddleware(req, res, next) {
  try {
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

    let decoded;
    try {
      decoded = verify(token);
    } catch {
      return res.status(401).json({
        success: false,
        message: MESSAGES.AUTH_TOKEN_INVALID,
      });
    }

    const userId = decoded.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: MESSAGES.AUTH_TOKEN_INVALID,
      });
    }

    if (decoded.typ && decoded.typ !== TOKEN_TYPES.ACCESS) {
      return res.status(401).json({
        success: false,
        message: MESSAGES.AUTH_TOKEN_INVALID,
      });
    }

    const tv = decoded.tv ?? 0;
    if (decoded.jti) {
      const revoked = await RevokedToken.findOne({ jti: decoded.jti }).lean();
      if (revoked) {
        return res.status(401).json({
          success: false,
          message: MESSAGES.AUTH_TOKEN_INVALID,
        });
      }
    }

    const user = await User.findById(userId).select("tokenVersion role");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: MESSAGES.AUTH_TOKEN_INVALID,
      });
    }
    if ((user.tokenVersion ?? 0) !== tv) {
      return res.status(401).json({
        success: false,
        message: MESSAGES.AUTH_TOKEN_INVALID,
      });
    }

    req.user = {
      userId: user._id.toString(),
      role: user.role,
    };
    next();
  } catch (err) {
    next(err);
  }
}
