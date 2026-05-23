import bcrypt from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { requireAdmin } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";
import { parseBody } from "../utils/request.js";
import { requiredString } from "../utils/validation.js";

export const authRouter = Router();

const createToken = (admin: { id: string; email: string; name: string }) =>
  jwt.sign({ sub: admin.id, email: admin.email, name: admin.name }, env.jwtSecret, {
    expiresIn: "8h",
  });

authRouter.post("/login", async (req, res, next) => {
  try {
    const body = parseBody(req);
    const email = requiredString(body, "email").toLowerCase();
    const password = requiredString(body, "password");
    const admin = await prisma.adminUser.findUnique({ where: { email } });

    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      throw new ApiError(401, "Invalid admin email or password.");
    }

    res.json({
      token: createToken(admin),
      admin: { id: admin.id, email: admin.email, name: admin.name },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", requireAdmin, async (req, res, next) => {
  try {
    const [, token] = req.headers.authorization?.split(" ") ?? [];
    const payload = jwt.verify(token ?? "", env.jwtSecret) as jwt.JwtPayload;
    const adminId = payload.sub?.toString();
    if (!adminId) {
      throw new ApiError(401, "Your admin session is invalid.");
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: adminId },
      select: { id: true, email: true, name: true },
    });

    if (!admin) {
      throw new ApiError(401, "Admin account no longer exists.");
    }

    res.json({ admin });
  } catch (error) {
    next(error);
  }
});
