import fs from "fs";
import path from "path";
import { User } from "../../DB/models/User.model.js";
import { getCurrentUser } from "../Auth/auth.service.js";
import { MESSAGES } from "../../constants/index.js";

export async function handleGetProfile(req, res, next) {
  try {
    const user = await getCurrentUser(req.user.userId);
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleUploadProfilePic(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.PROFILE_PIC_REQUIRED,
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      fs.unlink(req.file.path, () => {});
      const error = new Error(MESSAGES.USER_NOT_FOUND);
      error.statusCode = 404;
      throw error;
    }

    const relUrl = `/uploads/profiles/${req.file.filename}`;
    if (user.profilePic && user.profilePic.startsWith("/uploads/profiles/")) {
      const oldRel = user.profilePic.replace(/^\//, "");
      const oldPath = path.join(process.cwd(), oldRel);
      fs.unlink(oldPath, () => {});
    }

    user.profilePic = relUrl;
    await user.save();

    return res.status(200).json({
      success: true,
      message: MESSAGES.PROFILE_PIC_UPDATED,
      data: user.toSafeObject(),
    });
  } catch (error) {
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }
    next(error);
  }
}
