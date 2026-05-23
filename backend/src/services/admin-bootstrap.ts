import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";

export const ensureAdminUser = async () => {
  const existingAdminCount = await prisma.adminUser.count();
  if (existingAdminCount > 0) {
    return;
  }

  const passwordHash = await bcrypt.hash(env.adminPassword, 12);
  await prisma.adminUser.create({
    data: {
      email: env.adminEmail.toLowerCase(),
      passwordHash,
      name: "Administrator",
    },
  });

  console.log(`Created initial admin account for ${env.adminEmail}`);
};
