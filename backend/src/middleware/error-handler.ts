import type { ErrorRequestHandler } from "express";
import { Prisma } from "../../generated/prisma/client.js";
import { ApiError } from "../utils/api-error.js";

const getEntityLabel = (modelName: unknown) => {
  const normalized = modelName?.toString().toLowerCase();
  if (normalized === "item") {
    return "Item";
  }

  if (normalized === "customer") {
    return "Customer";
  }

  if (normalized === "vendor") {
    return "Vendor";
  }

  return "Record";
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const message =
      error.code === "P2025"
        ? `${getEntityLabel(error.meta?.modelName)} was not found.`
        : error.code === "P2002"
          ? "A record with this unique value already exists."
          : error.code === "P2003"
            ? "A selected related record was not found."
            : "Database request failed.";

    res.status(error.code === "P2025" ? 404 : 400).json({ error: message });
    return;
  }

  console.error(error);
  res.status(500).json({ error: "Something went wrong." });
};
