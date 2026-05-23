import "dotenv/config";
import path from "node:path";

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
  frontendPath: path.resolve(process.cwd(), "frontend"),
  jwtSecret: process.env.JWT_SECRET ?? "change-this-development-secret",
  port: Number(process.env.PORT ?? 3000),
};
