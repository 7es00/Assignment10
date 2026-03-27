import { Router } from "express";
import { authMiddleware } from "../Auth/auth.middleware.js";
import {
  handleGetPublicProfile,
  handleSendAnonymous,
  handleListMyMessages,
  handleDeleteMessage,
  handleMarkMessageRead,
} from "./message.controller.js";

export const messagesRouter = Router();

messagesRouter.get("/profile/:profileSlug", handleGetPublicProfile);
messagesRouter.post("/send/:profileSlug", handleSendAnonymous);

messagesRouter.get("/", authMiddleware, handleListMyMessages);
messagesRouter.delete("/:messageId", authMiddleware, handleDeleteMessage);
messagesRouter.patch("/:messageId/read", authMiddleware, handleMarkMessageRead);
