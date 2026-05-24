import type { Prisma } from "../../generated/prisma/client.js";

type ItemRecord = {
  id: string;
  name: string;
  sku: string | null;
  itemType: string;
  unit: string | null;
  imageUrl: string | null;
  description: string | null;
  salesEnabled: boolean;
  unitCost: Prisma.Decimal;
  salesPrice: Prisma.Decimal;
  salesAccount: string;
  salesTax: string | null;
  salesDescription: string | null;
  purchaseEnabled: boolean;
  purchaseAccount: string;
  purchaseTax: string | null;
  purchaseDescription: string | null;
  preferredVendorId: string | null;
  quantity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  preferredVendor?: {
    id: string;
    displayName: string;
  } | null;
};

export const presentItem = (item: ItemRecord) => ({
  ...item,
  unitCost: Number(item.unitCost),
  salesPrice: Number(item.salesPrice),
  inventoryValue: Number(item.unitCost) * item.quantity,
});
