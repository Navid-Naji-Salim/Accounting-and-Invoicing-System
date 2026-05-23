import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { presentContact } from "../presenters/contact-presenter.js";
import { parseBody } from "../utils/request.js";
import { optionalString, requiredString } from "../utils/validation.js";

export const customersRouter = Router();

customersRouter.get("/", async (_req, res, next) => {
  try {
    const customers = await prisma.customer.findMany({ orderBy: { createdAt: "desc" } });
    res.json(customers.map(presentContact));
  } catch (error) {
    next(error);
  }
});

customersRouter.post("/", async (req, res, next) => {
  try {
    const body = parseBody(req);
    const customer = await prisma.customer.create({
      data: {
        displayName: requiredString(body, "displayName"),
        companyName: optionalString(body, "companyName"),
        email: optionalString(body, "email"),
        phone: optionalString(body, "phone"),
        notes: optionalString(body, "notes"),
      },
    });

    res.status(201).json(presentContact(customer));
  } catch (error) {
    next(error);
  }
});
