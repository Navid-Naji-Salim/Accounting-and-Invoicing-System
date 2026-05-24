import { useState } from "react";
import type { ReactNode } from "react";
import { api, ApiError } from "../api";
import { Field } from "../components/Field";
import { currency } from "../lib/format";
import type { Contact, Item } from "../types";

type ItemsPageProps = {
  dataError?: string;
  items: Item[];
  token: string;
  vendors: Contact[];
  onRefresh: () => Promise<void>;
};

const salesAccounts = ["Sales", "Service Revenue", "Product Revenue", "Other Income"];
const purchaseAccounts = ["Cost of Goods Sold", "Supplies Expense", "Inventory Asset", "Other Expense"];
const taxOptions = ["Exempt", "Standard Tax", "Reduced Tax", "Out of Scope"];
const unitOptions = ["pcs", "box", "kg", "hour", "month"];

export const ItemsPage = ({ dataError, items, token, vendors, onRefresh }: ItemsPageProps) => {
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [salesEnabled, setSalesEnabled] = useState(true);
  const [purchaseEnabled, setPurchaseEnabled] = useState(true);

  const deleteItem = async (item: Item) => {
    const confirmed = window.confirm(`Delete ${item.name}?`);
    if (!confirmed) {
      return;
    }

    setMessage("");
    setDeletingId(item.id);
    try {
      await api.deleteItem(token, item.id);
      await onRefresh();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Unable to delete item.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {dataError ? <div className="panel page-alert">{dataError}</div> : null}
      <section className="items-workspace">
        <form
          className="panel item-form compact-item-form"
          onSubmit={async (event) => {
            event.preventDefault();
            setMessage("");
            const form = event.currentTarget;

            try {
              await api.createItem(token, Object.fromEntries(new FormData(form)));
              form.reset();
              setSalesEnabled(true);
              setPurchaseEnabled(true);
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

          <div className="item-compact-grid">
            <section className="item-basics">
              <Field label="Name" name="name" placeholder="Premium notebook" required />
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
              <SelectField label="Unit" name="unit" placeholder="Select a unit" options={unitOptions} />
              <label className="image-drop compact-image-drop">
                <input type="file" accept="image/*" aria-label="Item image" />
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
            </section>

            <ItemSection
              checked={salesEnabled}
              checkboxName="salesEnabled"
              onCheckedChange={setSalesEnabled}
              title="Sales information"
            >
              <MoneyField disabled={!salesEnabled} label="Selling price" name="salesPrice" required={salesEnabled} />
              <SelectField disabled={!salesEnabled} label="Account" name="salesAccount" options={salesAccounts} defaultValue="Sales" required={salesEnabled} />
              <SelectField disabled={!salesEnabled} label="Tax" name="salesTax" placeholder="Select a tax" options={taxOptions} />
              <div className="field item-description-field">
                <label htmlFor="salesDescription">Description</label>
                <textarea disabled={!salesEnabled} id="salesDescription" name="salesDescription" placeholder="Customer-facing description" />
              </div>
            </ItemSection>

            <ItemSection
              checked={purchaseEnabled}
              checkboxName="purchaseEnabled"
              onCheckedChange={setPurchaseEnabled}
              title="Purchase information"
            >
              <MoneyField disabled={!purchaseEnabled} label="Cost price" name="unitCost" required={purchaseEnabled} />
              <SelectField disabled={!purchaseEnabled} label="Account" name="purchaseAccount" options={purchaseAccounts} defaultValue="Cost of Goods Sold" required={purchaseEnabled} />
              <SelectField disabled={!purchaseEnabled} label="Tax" name="purchaseTax" placeholder="Select a tax" options={taxOptions} />
              <SelectField
                disabled={!purchaseEnabled}
                label="Preferred vendor"
                name="preferredVendorId"
                placeholder="Select a vendor"
                options={vendors.map((vendor) => ({ label: vendor.displayName, value: vendor.id }))}
              />
              <div className="field item-description-field">
                <label htmlFor="purchaseDescription">Description</label>
                <textarea disabled={!purchaseEnabled} id="purchaseDescription" name="purchaseDescription" placeholder="Vendor-facing description" />
              </div>
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
                  <th aria-label="Actions"></th>
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
                        <span className="muted">{item.unit ?? "No unit"}</span>
                      </td>
                      <td><span className="pill">{item.itemType}</span></td>
                      <td>
                        {item.salesEnabled ? currency.format(item.salesPrice) : "-"}
                        <br />
                        <span className="muted">{item.salesAccount}</span>
                      </td>
                      <td>
                        {item.purchaseEnabled ? currency.format(item.unitCost) : "-"}
                        <br />
                        <span className="muted">{item.purchaseAccount}</span>
                      </td>
                      <td>{item.preferredVendor?.displayName ?? "-"}</td>
                      <td>
                        <button
                          className="ghost-button danger-button"
                          disabled={deletingId === item.id}
                          type="button"
                          onClick={() => void deleteItem(item)}
                        >
                          {deletingId === item.id ? "Deleting" : "Delete"}
                        </button>
                      </td>
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
  disabled?: boolean;
};

const SelectField = ({ label, name, options, defaultValue = "", placeholder, required, disabled }: SelectFieldProps) => (
  <div className="field">
    <label htmlFor={name}>{label}</label>
    <select disabled={disabled} id={name} name={name} defaultValue={defaultValue} required={required}>
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
  disabled?: boolean;
};

const MoneyField = ({ label, name, required, disabled }: MoneyFieldProps) => (
  <div className="field money-field">
    <label htmlFor={name}>{label}</label>
    <div>
      <span>USD</span>
      <input disabled={disabled} id={name} name={name} type="number" min="0" step="0.01" required={required} />
    </div>
  </div>
);

type ItemSectionProps = {
  checked: boolean;
  title: string;
  checkboxName: string;
  onCheckedChange: (checked: boolean) => void;
  children: ReactNode;
};

const ItemSection = ({ checked, title, checkboxName, onCheckedChange, children }: ItemSectionProps) => (
  <section className={`item-info-section ${checked ? "" : "is-disabled"}`}>
    <label className="check-title">
      <input type="hidden" name={checkboxName} value="false" />
      <input
        checked={checked}
        name={checkboxName}
        onChange={(event) => onCheckedChange(event.currentTarget.checked)}
        type="checkbox"
        value="true"
      />
      <span>{title}</span>
    </label>
    <div className="item-info-fields">{children}</div>
  </section>
);
