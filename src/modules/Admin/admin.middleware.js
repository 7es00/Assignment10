import { User } from "../../DB/models/User.model.js";
import { ROLES } from "../../constants/role.constants.js";
import { AppError } from "../../utils/error.utils.js";
import { MESSAGES } from "../../constants/message.constants.js";

export async function requireAdmin(req, res, next) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError(MESSAGES.AUTH_TOKEN_MISSING, 401);
    }
    const user = await User.findById(userId).select("role").lean();
    if (!user) {
      throw new AppError(MESSAGES.USER_NOT_FOUND, 404);
    }
    if (user.role !== ROLES.ADMIN) {
      throw new AppError(MESSAGES.FORBIDDEN_ADMIN, 403);
    }
    req.user.role = user.role;
    next();
  } catch (err) {
    next(err);
  }
}
