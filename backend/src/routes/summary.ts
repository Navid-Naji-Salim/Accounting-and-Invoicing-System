import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const summaryRouter = Router();

summaryRouter.get("/", async (_req, res, next) => {
  try {
    const [items, customerCount, vendorCount] = await Promise.all([
      prisma.item.findMany(),
      prisma.customer.count(),
      prisma.vendor.count(),
    ]);

    const inventoryValue = items.reduce(
      (total, item) => total + Number(item.unitCost) * item.quantity,
      0,
    );

    res.json({
      itemCount: items.length,
      customerCount,
      vendorCount,
      inventoryValue,
      activeItemCount: items.filter((item) => item.isActive).length,
    });
  } catch (error) {
    next(error);
  }
});
