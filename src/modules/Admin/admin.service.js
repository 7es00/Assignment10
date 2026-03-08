import { User } from "../../DB/models/User.model.js";
import { ROLES } from "../../constants/role.constants.js";
import { AppError } from "../../utils/index.js";
import { MESSAGES } from "../../constants/index.js";

export async function getAllUsers(page = 1, limit = 10) {
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    User.countDocuments(),
  ]);

  return {
    items,
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum) || 1,
  };
}

export async function getUserById(userId) {
  const user = await User.findById(userId).select("-password").lean();
  if (!user) {
    throw new AppError(MESSAGES.USER_NOT_FOUND, 404);
  }
  return user;
}

export async function updateUserRole(userId, role) {
  if (!Object.values(ROLES).includes(role)) {
    throw new AppError(MESSAGES.INVALID_ROLE, 400);
  }
  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true, runValidators: true }
  )
    .select("-password")
    .lean();
  if (!user) {
    throw new AppError(MESSAGES.USER_NOT_FOUND, 404);
  }
  return user;
}
