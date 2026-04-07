import { Router } from "express";

import { authRouter, authApiRouter } from "./modules/Auth/index.js";
import { userRouter } from "./modules/User/index.js";
import { adminRouter } from "./modules/Admin/index.js";
import { messagesRouter } from "./modules/Messages/index.js";
import { MESSAGES } from "./constants/index.js";

export const appRouter = Router();

appRouter.get("/", (req, res) => {
  res.json({
    success: true,
    message: MESSAGES.API_RUNNING,
  });
});

appRouter.use("/auth", authApiRouter);
appRouter.use("/user", userRouter);
appRouter.use("/users", authRouter);
appRouter.use("/admin", adminRouter);
appRouter.use("/messages", messagesRouter);

