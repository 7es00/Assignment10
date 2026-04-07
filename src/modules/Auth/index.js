import { Router } from "express";
import { authMiddleware } from "./auth.middleware.js";
import {
  handleSignup,
  handleLogin,
  handleUpdateCurrentUser,
  handleDeleteCurrentUser,
  handleGetCurrentUser,
} from "./auth.controller.js";

export { authApiRouter } from "./auth.api.router.js";

export const authRouter = Router();

authRouter.post("/signup", handleSignup);
authRouter.post("/login", handleLogin);

authRouter
  .route("/")
  .get(authMiddleware, handleGetCurrentUser)
  .patch(authMiddleware, handleUpdateCurrentUser)
  .delete(authMiddleware, handleDeleteCurrentUser);

