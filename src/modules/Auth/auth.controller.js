import {
  signupUser,
  loginUser,
  updateCurrentUser,
  deleteCurrentUser,
  getCurrentUser,
} from "./auth.service.js";
import { MESSAGES } from "../../constants/index.js";

export async function handleSignup(req, res, next) {
  try {
    const { name, email, password, phone, age } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.NAME_EMAIL_PASSWORD_PHONE_REQUIRED,
      });
    }

    const result = await signupUser({ name, email, password, phone, age });

    return res.status(201).json({
      success: true,
      message: MESSAGES.SIGNUP_SUCCESS,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleLogin(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.EMAIL_PASSWORD_REQUIRED,
      });
    }

    const result = await loginUser({ email, password });

    return res.status(200).json({
      success: true,
      message: MESSAGES.LOGIN_SUCCESS,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateCurrentUser(req, res, next) {
  try {
    const userId = req.user.userId;
    const updatedUser = await updateCurrentUser(userId, req.body || {});

    return res.status(200).json({
      success: true,
      message: MESSAGES.USER_UPDATED,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleDeleteCurrentUser(req, res, next) {
  try {
    const userId = req.user.userId;
    const deletedUser = await deleteCurrentUser(userId);

    return res.status(200).json({
      success: true,
      message: MESSAGES.USER_DELETED,
      data: deletedUser,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGetCurrentUser(req, res, next) {
  try {
    const userId = req.user.userId;
    const user = await getCurrentUser(userId);

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

