import { useState } from "react";
import { api, ApiError } from "../api";
import { Field } from "../components/Field";
import { PageTitle } from "../components/PageTitle";
import { Stats } from "../components/Stats";
import { currency } from "../lib/format";
import type { Item, Summary } from "../types";

type ItemsPageProps = {
  items: Item[];
  summary: Summary;
  token: string;
  onRefresh: () => Promise<void>;
};

export const ItemsPage = ({ items, summary, token, onRefresh }: ItemsPageProps) => {
  const [message, setMessage] = useState("");

  return (
    <>
      <PageTitle
        eyebrow="Items"
        title="Sellable goods and services."
        description="Create the catalog entries that sales and purchase documents will use later."
      />
      <Stats summary={summary} />
      <section className="workspace-grid">
        <form
          className="panel form-grid"
          onSubmit={async (event) => {
            event.preventDefault();
            setMessage("");

            try {
              await api.createItem(token, Object.fromEntries(new FormData(event.currentTarget)));
              event.currentTarget.reset();
              await onRefresh();
            } catch (error) {
              setMessage(error instanceof ApiError ? error.message : "Unable to save item.");
            }
          }}
        >
          <h2>Create item</h2>
          <Field label="Name" name="name" placeholder="Consulting package" required />
          <Field label="SKU" name="sku" placeholder="SRV-001" />
          <div className="split">
            <Field label="Unit cost" name="unitCost" type="number" min="0" step="0.01" required />
            <Field label="Sales price" name="salesPrice" type="number" min="0" step="0.01" required />
          </div>
          <Field label="Quantity" name="quantity" type="number" min="0" step="1" defaultValue="0" />
          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" placeholder="Optional internal description" />
          </div>
          <button className="button" type="submit">Save item</button>
          <div className="message">{message}</div>
        </form>
        <div className="panel">
          <h2>Item list</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Cost</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="muted">No items yet.</td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.name}</strong>
                        <br />
                        <span className="muted">{item.description}</span>
                      </td>
                      <td>{item.sku ?? "-"}</td>
                      <td>{currency.format(item.unitCost)}</td>
                      <td>{currency.format(item.salesPrice)}</td>
                      <td><span className="pill">{item.quantity}</span></td>
                      <td>{currency.format(item.inventoryValue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
};
