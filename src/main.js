import express from "express";
import morgan from "morgan";
import cors from "cors";

import { connectDB } from "./DB/DB.connection.js";
import { appRouter } from "./App.controller.js";
import config from "../config/Config.service.js";
import { MESSAGES } from "./constants/index.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/", appRouter);


app.use((err, req, res, next) => {
  console.error(err);
  const status = err.statusCode || 500;
  const message = err.message || MESSAGES.INTERNAL_SERVER_ERROR;

  res.status(status).json({
    success: false,
    message,
  });
});

const PORT = config.server.port;

async function start() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error(MESSAGES.SERVER_FAILED_START, err);
  process.exit(1);
});

