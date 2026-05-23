import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { presentContact } from "../presenters/contact-presenter.js";
import { parseBody } from "../utils/request.js";
import { optionalString, requiredString } from "../utils/validation.js";

export const vendorsRouter = Router();

vendorsRouter.get("/", async (_req, res, next) => {
  try {
    const vendors = await prisma.vendor.findMany({ orderBy: { createdAt: "desc" } });
    res.json(vendors.map(presentContact));
  } catch (error) {
    next(error);
  }
});

vendorsRouter.post("/", async (req, res, next) => {
  try {
    const body = parseBody(req);
    const vendor = await prisma.vendor.create({
      data: {
        displayName: requiredString(body, "displayName"),
        companyName: optionalString(body, "companyName"),
        email: optionalString(body, "email"),
        phone: optionalString(body, "phone"),
        notes: optionalString(body, "notes"),
      },
    });

    res.status(201).json(presentContact(vendor));
  } catch (error) {
    next(error);
  }
});
