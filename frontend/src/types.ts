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
  description: string | null;
  unitCost: number;
  salesPrice: number;
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
