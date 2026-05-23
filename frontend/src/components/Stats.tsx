import { currency } from "../lib/format";
import type { Summary } from "../types";

export const Stats = ({ summary }: { summary: Summary }) => (
  <section className="stats-grid">
    <div className="stat-card">
      <span>Items</span>
      <strong>{summary.itemCount}</strong>
    </div>
    <div className="stat-card">
      <span>Customers</span>
      <strong>{summary.customerCount}</strong>
    </div>
    <div className="stat-card">
      <span>Vendors</span>
      <strong>{summary.vendorCount}</strong>
    </div>
    <div className="stat-card">
      <span>Inventory value</span>
      <strong>{currency.format(summary.inventoryValue)}</strong>
    </div>
  </section>
);
