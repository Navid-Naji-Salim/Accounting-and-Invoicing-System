import type { Prisma } from "../../generated/prisma/client.js";

type ItemRecord = {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  unitCost: Prisma.Decimal;
  salesPrice: Prisma.Decimal;
  quantity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export const presentItem = (item: ItemRecord) => ({
  ...item,
  unitCost: Number(item.unitCost),
  salesPrice: Number(item.salesPrice),
  inventoryValue: Number(item.unitCost) * item.quantity,
});
