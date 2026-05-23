import cors from "cors";
import express from "express";
import path from "node:path";
import { env } from "./config/env.js";
import { requireAdmin } from "./middleware/auth.js";
import { errorHandler } from "./middleware/error-handler.js";
import { authRouter } from "./routes/auth.js";
import { customersRouter } from "./routes/customers.js";
import { healthRouter } from "./routes/health.js";
import { itemsRouter } from "./routes/items.js";
import { summaryRouter } from "./routes/summary.js";
import { vendorsRouter } from "./routes/vendors.js";

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.static(env.frontendPath));

  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);

  app.use("/api", requireAdmin);
  app.use("/api/summary", summaryRouter);
  app.use("/api/items", itemsRouter);
  app.use("/api/customers", customersRouter);
  app.use("/api/vendors", vendorsRouter);

  app.get(/.*/, (_req, res) => {
    res.sendFile(path.join(env.frontendPath, "index.html"));
  });

  app.use(errorHandler);

  return app;
};
