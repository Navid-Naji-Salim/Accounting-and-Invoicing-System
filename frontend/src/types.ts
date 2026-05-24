export type PageId = "home" | "items" | "sales" | "purchases" | "reports";

export type Admin = {
  id: string;
  email: string;
  name: string;
};

export type Summary = {
  itemCount: number;
  customerCount: number;
  vendorCount: number;
  inventoryValue: number;
  activeItemCount: number;
};

export type Item = {
  id: string;
  name: string;
  sku: string | null;
  itemType: string;
  unit: string | null;
  imageUrl: string | null;
  description: string | null;
  salesEnabled: boolean;
  unitCost: number;
  salesPrice: number;
  salesAccount: string;
  salesTax: string | null;
  salesDescription: string | null;
  purchaseEnabled: boolean;
  purchaseAccount: string;
  purchaseTax: string | null;
  purchaseDescription: string | null;
  preferredVendorId: string | null;
  preferredVendor?: {
    id: string;
    displayName: string;
  } | null;
  quantity: number;
  inventoryValue: number;
};

export type Contact = {
  id: string;
  displayName: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
};
