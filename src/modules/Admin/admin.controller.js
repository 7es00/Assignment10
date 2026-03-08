import {
  getAllUsers,
  getUserById,
  updateUserRole,
} from "./admin.service.js";
import { MESSAGES } from "../../constants/index.js";

export async function handleGetAllUsers(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await getAllUsers(page, limit);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGetUserById(req, res, next) {
  try {
    const { userId } = req.params;
    const user = await getUserById(userId);
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateUserRole(req, res, next) {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.ROLE_REQUIRED,
      });
    }
    const user = await updateUserRole(userId, role);
    return res.status(200).json({
      success: true,
      message: MESSAGES.USER_ROLE_UPDATED,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}
