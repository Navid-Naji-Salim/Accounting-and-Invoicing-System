import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { presentItem } from "../presenters/item-presenter.js";
import { parseBody } from "../utils/request.js";
import { money, optionalString, quantity, requiredString } from "../utils/validation.js";

export const itemsRouter = Router();

itemsRouter.get("/", async (_req, res, next) => {
  try {
    const items = await prisma.item.findMany({ orderBy: { createdAt: "desc" } });
    res.json(items.map(presentItem));
  } catch (error) {
    next(error);
  }
});

itemsRouter.post("/", async (req, res, next) => {
  try {
    const body = parseBody(req);
    const item = await prisma.item.create({
      data: {
        name: requiredString(body, "name"),
        sku: optionalString(body, "sku"),
        description: optionalString(body, "description"),
        unitCost: money(body, "unitCost"),
        salesPrice: money(body, "salesPrice"),
        quantity: quantity(body),
      },
    });

    res.status(201).json(presentItem(item));
  } catch (error) {
    next(error);
  }
});

itemsRouter.patch("/:id", async (req, res, next) => {
  try {
    const body = parseBody(req);
    const item = await prisma.item.update({
      where: { id: req.params.id },
      data: {
        ...(body.name !== undefined ? { name: requiredString(body, "name") } : {}),
        ...(body.sku !== undefined ? { sku: optionalString(body, "sku") } : {}),
        ...(body.description !== undefined
          ? { description: optionalString(body, "description") }
          : {}),
        ...(body.unitCost !== undefined ? { unitCost: money(body, "unitCost") } : {}),
        ...(body.salesPrice !== undefined ? { salesPrice: money(body, "salesPrice") } : {}),
        ...(body.quantity !== undefined ? { quantity: quantity(body) } : {}),
        ...(body.isActive !== undefined ? { isActive: Boolean(body.isActive) } : {}),
      },
    });

    res.json(presentItem(item));
  } catch (error) {
    next(error);
  }
});

itemsRouter.delete("/:id", async (req, res, next) => {
  try {
    await prisma.item.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
