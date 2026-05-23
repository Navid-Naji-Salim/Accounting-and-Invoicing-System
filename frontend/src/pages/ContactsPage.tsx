import { useState } from "react";
import { api, ApiError } from "../api";
import { Field } from "../components/Field";
import { PageTitle } from "../components/PageTitle";
import { Stats } from "../components/Stats";
import type { Contact, Summary } from "../types";

type ContactsPageProps = {
  contacts: Contact[];
  kind: "customers" | "vendors";
  summary: Summary;
  token: string;
  onRefresh: () => Promise<void>;
};

export const ContactsPage = ({ contacts, kind, summary, token, onRefresh }: ContactsPageProps) => {
  const [message, setMessage] = useState("");
  const isCustomers = kind === "customers";

  return (
    <>
      <PageTitle
        eyebrow={isCustomers ? "Sales" : "Purchases"}
        title={isCustomers ? "Customers for your sales flow." : "Vendors for your purchasing flow."}
        description={
          isCustomers
            ? "Add customers now so invoices can be connected to real buyers later."
            : "Add vendors now so bills and purchase orders have suppliers later."
        }
      />
      <Stats summary={summary} />
      <section className="workspace-grid">
        <form
          className="panel form-grid"
          onSubmit={async (event) => {
            event.preventDefault();
            setMessage("");

            try {
              await api.createContact(token, kind, Object.fromEntries(new FormData(event.currentTarget)));
              event.currentTarget.reset();
              await onRefresh();
            } catch (error) {
              setMessage(error instanceof ApiError ? error.message : "Unable to save record.");
            }
          }}
        >
          <h2>{isCustomers ? "Create customer" : "Create vendor"}</h2>
          <Field
            label="Display name"
            name="displayName"
            placeholder={isCustomers ? "Acme Trading" : "Northline Supplies"}
            required
          />
          <Field label="Company name" name="companyName" />
          <div className="split">
            <Field label="Email" name="email" type="email" />
            <Field label="Phone" name="phone" />
          </div>
          <div className="field">
            <label htmlFor={`${kind}-notes`}>Notes</label>
            <textarea
              id={`${kind}-notes`}
              name="notes"
              placeholder="Payment terms, contact preferences, or internal context"
            />
          </div>
          <button className="button" type="submit">
            {isCustomers ? "Create customer" : "Create vendor"}
          </button>
          <div className="message">{message}</div>
        </form>
        <div className="panel">
          <h2>{isCustomers ? "Customers" : "Vendors"}</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Email</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {contacts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="muted">No records yet.</td>
                  </tr>
                ) : (
                  contacts.map((contact) => (
                    <tr key={contact.id}>
                      <td>
                        <strong>{contact.displayName}</strong>
                        <br />
                        <span className="muted">{contact.notes}</span>
                      </td>
                      <td>{contact.companyName ?? "-"}</td>
                      <td>{contact.email ?? "-"}</td>
                      <td>{contact.phone ?? "-"}</td>
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
