import fs from "fs";
import path from "path";
import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../Auth/auth.middleware.js";
import { handleGetProfile, handleUploadProfilePic } from "./user.controller.js";
import { MESSAGES } from "../../constants/index.js";

const uploadRoot = path.join(process.cwd(), "uploads", "profiles");
fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadRoot);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${req.user.userId}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype);
    if (ok) {
      cb(null, true);
    } else {
      cb(new Error(MESSAGES.PROFILE_PIC_INVALID_TYPE));
    }
  },
});

export const userRouter = Router();

userRouter.get("/profile", authMiddleware, handleGetProfile);
userRouter.patch(
  "/upload-profile-pic",
  authMiddleware,
  (req, res, next) => {
    upload.single("profilePic")(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || MESSAGES.PROFILE_PIC_INVALID_TYPE,
        });
      }
      next();
    });
  },
  handleUploadProfilePic
);
