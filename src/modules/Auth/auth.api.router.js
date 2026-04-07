import { Router } from "express";
import { authMiddleware } from "./auth.middleware.js";
import {
  handleSignup,
  handleSignin,
  handleRefreshToken,
  handleVerifyAccount,
  handleResendOtp,
  handleLogout,
  handleLogoutAllDevices,
} from "./auth.controller.js";

export const authApiRouter = Router();

authApiRouter.post("/signup", handleSignup);
authApiRouter.post("/signin", handleSignin);
authApiRouter.get("/refresh-token", handleRefreshToken);
authApiRouter.patch("/verify-account", handleVerifyAccount);
authApiRouter.post("/resend-otp", handleResendOtp);
authApiRouter.patch("/logout-from-all-devices", authMiddleware, handleLogoutAllDevices);
authApiRouter.post("/logout", authMiddleware, handleLogout);
