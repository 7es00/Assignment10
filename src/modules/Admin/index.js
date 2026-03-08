import { Router } from "express";
import { authMiddleware } from "../Auth/auth.middleware.js";
import { requireAdmin } from "./admin.middleware.js";
import {
  handleGetAllUsers,
  handleGetUserById,
  handleUpdateUserRole,
} from "./admin.controller.js";

export const adminRouter = Router();

adminRouter.use(authMiddleware);
adminRouter.use(requireAdmin);

adminRouter.get("/users", handleGetAllUsers);
adminRouter.get("/users/:userId", handleGetUserById);
adminRouter.patch("/users/:userId/role", handleUpdateUserRole);
