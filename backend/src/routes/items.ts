import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { presentItem } from "../presenters/item-presenter.js";
import { parseBody } from "../utils/request.js";
import { ApiError } from "../utils/api-error.js";
import {
  booleanField,
  optionalMoney,
  optionalString,
  quantity,
  requiredString,
} from "../utils/validation.js";

export const itemsRouter = Router();

const itemTypes = new Set(["goods", "service"]);
const unitOptions = new Set(["box", "cm", "dz", "ft", "g", "in", "kg", "km", "lb", "mg", "ml", "m", "pcs"]);
const salesAccountOptions = new Set([
  "discount",
  "general income",
  "interest income",
  "late fee income",
  "other charges",
]);

const itemType = (body: Record<string, unknown>) => {
  const value = optionalString(body, "itemType") ?? "goods";
  if (!itemTypes.has(value)) {
    throw new ApiError(400, "itemType must be goods or service.");
  }

  return value;
};

const optionalChoice = (
  body: Record<string, unknown>,
  field: string,
  allowedValues: Set<string>,
  defaultValue?: string,
) => {
  const value = optionalString(body, field) ?? defaultValue ?? null;
  if (value && !allowedValues.has(value)) {
    throw new ApiError(400, `${field} is not a supported option.`);
  }

  return value;
};

const ensureVendorExists = async (preferredVendorId: string | null) => {
  if (!preferredVendorId) {
    return null;
  }

  const vendor = await prisma.vendor.findUnique({
    where: { id: preferredVendorId },
    select: { id: true },
  });

  if (!vendor) {
    throw new ApiError(400, "Preferred vendor was not found.");
  }

  return preferredVendorId;
};

itemsRouter.get("/", async (_req, res, next) => {
  try {
    const items = await prisma.item.findMany({
      include: { preferredVendor: { select: { id: true, displayName: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(items.map(presentItem));
  } catch (error) {
    next(error);
  }
});

itemsRouter.post("/", async (req, res, next) => {
  try {
    const body = parseBody(req);
    const preferredVendorId = await ensureVendorExists(optionalString(body, "preferredVendorId"));
    const item = await prisma.item.create({
      data: {
        name: requiredString(body, "name"),
        sku: optionalString(body, "sku"),
        itemType: itemType(body),
        unit: optionalChoice(body, "unit", unitOptions),
        imageUrl: optionalString(body, "imageUrl"),
        description: optionalString(body, "description"),
        salesEnabled: booleanField(body, "salesEnabled", true),
        salesPrice: optionalMoney(body, "salesPrice"),
        salesAccount: optionalChoice(body, "salesAccount", salesAccountOptions, "general income") ?? "general income",
        salesTax: optionalString(body, "salesTax"),
        salesDescription: optionalString(body, "salesDescription"),
        purchaseEnabled: booleanField(body, "purchaseEnabled", true),
        unitCost: optionalMoney(body, "unitCost"),
        purchaseAccount: optionalString(body, "purchaseAccount") ?? "Cost of Goods Sold",
        purchaseTax: optionalString(body, "purchaseTax"),
        purchaseDescription: optionalString(body, "purchaseDescription"),
        preferredVendorId,
        quantity: quantity(body),
      },
      include: { preferredVendor: { select: { id: true, displayName: true } } },
    });

    res.status(201).json(presentItem(item));
  } catch (error) {
    next(error);
  }
});

itemsRouter.patch("/:id", async (req, res, next) => {
  try {
    const body = parseBody(req);
    const preferredVendorId = await ensureVendorExists(optionalString(body, "preferredVendorId"));
    const item = await prisma.item.update({
      where: { id: req.params.id },
      data: {
        ...(body.name !== undefined ? { name: requiredString(body, "name") } : {}),
        ...(body.sku !== undefined ? { sku: optionalString(body, "sku") } : {}),
        ...(body.itemType !== undefined ? { itemType: itemType(body) } : {}),
        ...(body.unit !== undefined ? { unit: optionalChoice(body, "unit", unitOptions) } : {}),
        ...(body.imageUrl !== undefined ? { imageUrl: optionalString(body, "imageUrl") } : {}),
        ...(body.description !== undefined
          ? { description: optionalString(body, "description") }
          : {}),
        ...(body.salesEnabled !== undefined
          ? { salesEnabled: booleanField(body, "salesEnabled", true) }
          : {}),
        ...(body.salesPrice !== undefined ? { salesPrice: optionalMoney(body, "salesPrice") } : {}),
        ...(body.salesAccount !== undefined
          ? { salesAccount: optionalChoice(body, "salesAccount", salesAccountOptions, "general income") ?? "general income" }
          : {}),
        ...(body.salesTax !== undefined ? { salesTax: optionalString(body, "salesTax") } : {}),
        ...(body.salesDescription !== undefined
          ? { salesDescription: optionalString(body, "salesDescription") }
          : {}),
        ...(body.purchaseEnabled !== undefined
          ? { purchaseEnabled: booleanField(body, "purchaseEnabled", true) }
          : {}),
        ...(body.unitCost !== undefined ? { unitCost: optionalMoney(body, "unitCost") } : {}),
        ...(body.purchaseAccount !== undefined
          ? { purchaseAccount: optionalString(body, "purchaseAccount") ?? "Cost of Goods Sold" }
          : {}),
        ...(body.purchaseTax !== undefined ? { purchaseTax: optionalString(body, "purchaseTax") } : {}),
        ...(body.purchaseDescription !== undefined
          ? { purchaseDescription: optionalString(body, "purchaseDescription") }
          : {}),
        ...(body.preferredVendorId !== undefined ? { preferredVendorId } : {}),
        ...(body.quantity !== undefined ? { quantity: quantity(body) } : {}),
        ...(body.isActive !== undefined ? { isActive: Boolean(body.isActive) } : {}),
      },
      include: { preferredVendor: { select: { id: true, displayName: true } } },
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
