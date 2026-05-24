import { Prisma } from "../../generated/prisma/client.js";
import { ApiError } from "./api-error.js";

export const requiredString = (body: Record<string, unknown>, field: string) => {
  const value = body[field];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ApiError(400, `${field} is required.`);
  }

  return value.trim();
};

export const optionalString = (body: Record<string, unknown>, field: string) => {
  const value = body[field];
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new ApiError(400, `${field} must be text.`);
  }

  return value.trim();
};

export const money = (body: Record<string, unknown>, field: string) => {
  const rawValue = body[field];
  const value = typeof rawValue === "number" ? rawValue : Number(rawValue);
  if (!Number.isFinite(value) || value < 0) {
    throw new ApiError(400, `${field} must be a positive number.`);
  }

  return new Prisma.Decimal(value.toFixed(2));
};

export const optionalMoney = (body: Record<string, unknown>, field: string) => {
  const value = body[field];
  if (value === undefined || value === null || value === "") {
    return new Prisma.Decimal("0.00");
  }

  return money(body, field);
};

export const booleanField = (
  body: Record<string, unknown>,
  field: string,
  defaultValue = false,
) => {
  const value = body[field];
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return ["true", "on", "1", "yes"].includes(value.toLowerCase());
  }

  return Boolean(value);
};

export const quantity = (body: Record<string, unknown>) => {
  const rawValue = body.quantity ?? 0;
  const value = typeof rawValue === "number" ? rawValue : Number(rawValue);
  if (!Number.isInteger(value) || value < 0) {
    throw new ApiError(400, "quantity must be a whole number.");
  }

  return value;
};
