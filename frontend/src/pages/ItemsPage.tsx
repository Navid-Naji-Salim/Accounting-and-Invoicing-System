import { useState } from "react";
import type { ReactNode } from "react";
import { api, ApiError } from "../api";
import { Field } from "../components/Field";
import { PageTitle } from "../components/PageTitle";
import { Stats } from "../components/Stats";
import { currency } from "../lib/format";
import type { Contact, Item, Summary } from "../types";

type ItemsPageProps = {
  items: Item[];
  summary: Summary;
  token: string;
  vendors: Contact[];
  onRefresh: () => Promise<void>;
};

const salesAccounts = ["Sales", "Service Revenue", "Product Revenue", "Other Income"];
const purchaseAccounts = ["Cost of Goods Sold", "Supplies Expense", "Inventory Asset", "Other Expense"];
const taxOptions = ["Exempt", "Standard Tax", "Reduced Tax", "Out of Scope"];
const unitOptions = ["pcs", "box", "kg", "hour", "month"];

export const ItemsPage = ({ items, summary, token, vendors, onRefresh }: ItemsPageProps) => {
  const [message, setMessage] = useState("");

  return (
    <>
      <PageTitle
        eyebrow="Items"
        title="Build your item catalog."
        description="Create goods and services with the sales and purchase defaults your documents will reuse."
      />
      <Stats summary={summary} />
      <section className="items-workspace">
        <form
          className="panel item-form"
          onSubmit={async (event) => {
            event.preventDefault();
            setMessage("");
            const form = event.currentTarget;

            try {
              await api.createItem(token, Object.fromEntries(new FormData(form)));
              form.reset();
              await onRefresh();
            } catch (error) {
              setMessage(error instanceof ApiError ? error.message : "Unable to save item.");
            }
          }}
        >
          <div className="item-form-head">
            <div>
              <h2>New item</h2>
              <p>Catalog details</p>
            </div>
            <button className="button" type="submit">Save item</button>
          </div>

          <div className="notice-row">
            <span aria-hidden="true">i</span>
            <p>Track stock later by enabling inventory preferences. This item can already hold sales and purchase defaults.</p>
          </div>

          <div className="item-identity-grid">
            <div className="form-grid">
              <Field label="Name" name="name" placeholder="Premium notebook" required />
              <Field label="SKU" name="sku" placeholder="ITM-001" />
              <div className="radio-field">
                <span>Type</span>
                <label>
                  <input type="radio" name="itemType" value="goods" defaultChecked />
                  Goods
                </label>
                <label>
                  <input type="radio" name="itemType" value="service" />
                  Service
                </label>
              </div>
              <SelectField label="Unit" name="unit" placeholder="Select or type to add" options={unitOptions} />
              <Field label="Image URL" name="imageUrl" placeholder="https://example.com/item.jpg" />
              <Field label="Opening quantity" name="quantity" type="number" min="0" step="1" defaultValue="0" />
            </div>
            <label className="image-drop">
              <input type="file" accept="image/*" />
              <span className="image-glyph" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M5 19V5h14v14H5Z" stroke="currentColor" strokeWidth="1.8" />
                  <path d="m8 15 2.7-3 2.2 2.4 1.4-1.6L17 16H7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="15.5" cy="8.5" r="1.2" fill="currentColor" />
                </svg>
              </span>
              <strong>Item image</strong>
              <span>Drop or browse</span>
            </label>
          </div>

          <div className="item-section-grid">
            <ItemSection title="Sales information" checkboxName="salesEnabled">
              <MoneyField label="Selling price" name="salesPrice" required />
              <SelectField label="Account" name="salesAccount" options={salesAccounts} defaultValue="Sales" required />
              <div className="field">
                <label htmlFor="salesDescription">Description</label>
                <textarea id="salesDescription" name="salesDescription" placeholder="Customer-facing description" />
              </div>
              <SelectField label="Tax" name="salesTax" placeholder="Select a tax" options={taxOptions} />
            </ItemSection>

            <ItemSection title="Purchase information" checkboxName="purchaseEnabled">
              <MoneyField label="Cost price" name="unitCost" required />
              <SelectField label="Account" name="purchaseAccount" options={purchaseAccounts} defaultValue="Cost of Goods Sold" required />
              <div className="field">
                <label htmlFor="purchaseDescription">Description</label>
                <textarea id="purchaseDescription" name="purchaseDescription" placeholder="Vendor-facing description" />
              </div>
              <SelectField label="Tax" name="purchaseTax" placeholder="Select a tax" options={taxOptions} />
              <SelectField
                label="Preferred vendor"
                name="preferredVendorId"
                placeholder="Select a vendor"
                options={vendors.map((vendor) => ({ label: vendor.displayName, value: vendor.id }))}
              />
            </ItemSection>
          </div>

          <div className="message">{message}</div>
        </form>

        <div className="panel item-list-panel">
          <div className="item-form-head">
            <div>
              <h2>Item list</h2>
              <p>{items.length} catalog entries</p>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Sales</th>
                  <th>Purchase</th>
                  <th>Vendor</th>
                  <th>Qty</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="muted">No items yet.</td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.name}</strong>
                        <br />
                        <span className="muted">{item.sku ?? item.unit ?? "No SKU"}</span>
                      </td>
                      <td><span className="pill">{item.itemType}</span></td>
                      <td>
                        {currency.format(item.salesPrice)}
                        <br />
                        <span className="muted">{item.salesAccount}</span>
                      </td>
                      <td>
                        {currency.format(item.unitCost)}
                        <br />
                        <span className="muted">{item.purchaseAccount}</span>
                      </td>
                      <td>{item.preferredVendor?.displayName ?? "-"}</td>
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

type Option = string | { label: string; value: string };

type SelectFieldProps = {
  label: string;
  name: string;
  options: Option[];
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
};

const SelectField = ({ label, name, options, defaultValue = "", placeholder, required }: SelectFieldProps) => (
  <div className="field">
    <label htmlFor={name}>{label}</label>
    <select id={name} name={name} defaultValue={defaultValue} required={required}>
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((option) => {
        const value = typeof option === "string" ? option : option.value;
        const optionLabel = typeof option === "string" ? option : option.label;

        return (
          <option key={value} value={value}>
            {optionLabel}
          </option>
        );
      })}
    </select>
  </div>
);

type MoneyFieldProps = {
  label: string;
  name: string;
  required?: boolean;
};

const MoneyField = ({ label, name, required }: MoneyFieldProps) => (
  <div className="field money-field">
    <label htmlFor={name}>{label}</label>
    <div>
      <span>USD</span>
      <input id={name} name={name} type="number" min="0" step="0.01" required={required} />
    </div>
  </div>
);

type ItemSectionProps = {
  title: string;
  checkboxName: string;
  children: ReactNode;
};

const ItemSection = ({ title, checkboxName, children }: ItemSectionProps) => (
  <section className="item-info-section">
    <label className="check-title">
      <input type="checkbox" name={checkboxName} defaultChecked />
      <span>{title}</span>
    </label>
    <div className="item-info-fields">{children}</div>
  </section>
);
