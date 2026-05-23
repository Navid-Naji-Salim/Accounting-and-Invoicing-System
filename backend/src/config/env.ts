import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const backendRoot = path.resolve(path.dirname(currentFile), "../..");
const projectRoot = path.resolve(backendRoot, "..");

dotenv.config({ path: path.join(projectRoot, ".env") });

const requiredEnv = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} must be set before starting the server.`);
  }

  return value;
};

export const env = {
  adminEmail: process.env.ADMIN_EMAIL ?? "admin@example.com",
  adminPassword: process.env.ADMIN_PASSWORD ?? "admin12345",
  databaseUrl: requiredEnv("DATABASE_URL"),
  frontendPath: path.join(projectRoot, "frontend"),
  jwtSecret: process.env.JWT_SECRET ?? "change-this-development-secret",
  port: Number(process.env.PORT ?? 3000),
};
