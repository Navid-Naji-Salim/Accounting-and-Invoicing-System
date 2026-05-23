const app = document.querySelector("#app");
const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const state = {
  token: localStorage.getItem("adminToken"),
  admin: null,
  activePage: "home",
  summary: null,
  items: [],
  customers: [],
  vendors: [],
};

const icons = {
  home: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 10.8 12 4l8 6.8V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9.2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
  items: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m12 3 8 4.4v9.2L12 21l-8-4.4V7.4L12 3Z" stroke="currentColor" stroke-width="1.8"/><path d="m4.5 7.7 7.5 4.2 7.5-4.2M12 12v8.4" stroke="currentColor" stroke-width="1.8"/></svg>`,
  sales: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 19V5h16v14H4Z" stroke="currentColor" stroke-width="1.8"/><path d="M8 9h8M8 13h5M17 17l3 3M20 17l-3 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  purchases: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 7h14l-2 8H8L6.5 4H3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="20" r="1.4" fill="currentColor"/><circle cx="18" cy="20" r="1.4" fill="currentColor"/></svg>`,
  reports: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 20V4h14v16H5Z" stroke="currentColor" stroke-width="1.8"/><path d="M9 16v-4M12 16V8M15 16v-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
};

const navItems = [
  { id: "home", label: "Home", icon: icons.home },
  { id: "items", label: "Items", icon: icons.items },
  { id: "sales", label: "Sales", icon: icons.sales },
  { id: "purchases", label: "Purchases", icon: icons.purchases },
  { id: "reports", label: "Reports", icon: icons.reports },
];

const api = async (path, options = {}) => {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    logout();
    throw new Error("Please log in again.");
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "Request failed.");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const renderLogin = () => {
  app.innerHTML = `
    <main class="login-shell">
      <section class="login-card">
        <div class="login-brand">
          <p class="eyebrow">Admin workspace</p>
          <h1>Accounting with a calm command center.</h1>
          <p>Manage your catalog, customers, and vendors from a focused books system inspired by professional accounting suites.</p>
        </div>
        <form class="login-form" id="loginForm">
          <div>
            <p class="eyebrow">Secure access</p>
            <h2>Admin login</h2>
            <p class="muted">No signup is available. Admin credentials are configured on the server.</p>
          </div>
          <div class="field">
            <label for="email">Email</label>
            <input id="email" name="email" type="email" value="admin@example.com" required />
          </div>
          <div class="field">
            <label for="password">Password</label>
            <input id="password" name="password" type="password" value="admin12345" required />
          </div>
          <button class="button" type="submit">Enter dashboard</button>
          <div class="message" id="loginMessage"></div>
        </form>
      </section>
    </main>
  `;

  document.querySelector("#loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = document.querySelector("#loginMessage");
    const formData = new FormData(event.currentTarget);
    message.textContent = "";

    try {
      const payload = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData)),
      });
      state.token = payload.token;
      state.admin = payload.admin;
      localStorage.setItem("adminToken", payload.token);
      await loadData();
      renderApp();
    } catch (error) {
      message.textContent = error.message;
    }
  });
};

const logout = () => {
  state.token = null;
  state.admin = null;
  localStorage.removeItem("adminToken");
  renderLogin();
};

const loadData = async () => {
  const [summary, items, customers, vendors] = await Promise.all([
    api("/api/summary"),
    api("/api/items"),
    api("/api/customers"),
    api("/api/vendors"),
  ]);
  state.summary = summary;
  state.items = items;
  state.customers = customers;
  state.vendors = vendors;
};

const renderApp = () => {
  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-mark">AB</div>
          <div>
            <strong>Accounting Books</strong>
            <span>Admin console</span>
          </div>
        </div>
        <nav class="nav">
          ${navItems
            .map(
              (item) => `
                <button data-page="${item.id}" class="${state.activePage === item.id ? "active" : ""}">
                  ${item.icon}
                  ${item.label}
                </button>
              `,
            )
            .join("")}
        </nav>
        <div class="sidebar-footer">
          <strong>${escapeHtml(state.admin?.name || "Administrator")}</strong>
          <span class="muted">${escapeHtml(state.admin?.email || "")}</span>
          <button class="ghost-button" id="logoutButton">Log out</button>
        </div>
      </aside>
      <main class="content">
        <header class="topbar">
          <div>
            <strong>Books foundation</strong>
            <div class="muted">Items, sales contacts, and purchase vendors are live.</div>
          </div>
          <button class="ghost-button" id="refreshButton">Refresh data</button>
        </header>
        ${renderPage()}
      </main>
    </div>
  `;

  document.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activePage = button.dataset.page;
      renderApp();
    });
  });

  document.querySelector("#logoutButton").addEventListener("click", logout);
  document.querySelector("#refreshButton").addEventListener("click", async () => {
    await loadData();
    renderApp();
  });

  wireCurrentPage();
};

const renderStats = () => `
  <section class="stats-grid">
    <div class="stat-card"><span>Items</span><strong>${state.summary?.itemCount ?? 0}</strong></div>
    <div class="stat-card"><span>Customers</span><strong>${state.summary?.customerCount ?? 0}</strong></div>
    <div class="stat-card"><span>Vendors</span><strong>${state.summary?.vendorCount ?? 0}</strong></div>
    <div class="stat-card"><span>Inventory value</span><strong>${currency.format(state.summary?.inventoryValue ?? 0)}</strong></div>
  </section>
`;

const renderPage = () => {
  if (state.activePage === "items") {
    return renderItems();
  }

  if (state.activePage === "sales") {
    return renderContacts("customers", "Sales", "Create customer", "Customers");
  }

  if (state.activePage === "purchases") {
    return renderContacts("vendors", "Purchases", "Create vendor", "Vendors");
  }

  if (state.activePage === "reports") {
    return `
      <section class="page-title">
        <p class="eyebrow">Reports</p>
        <h1>Reports will grow from real transactions.</h1>
        <p>Once invoices, bills, payments, and expenses exist, this area can show profit and loss, cash flow, tax summaries, and inventory movement.</p>
      </section>
      ${renderStats()}
      <div class="empty-state">No financial reports yet. We need money-in and money-out transactions first.</div>
    `;
  }

  return `
    <section class="page-title">
      <p class="eyebrow">Home</p>
      <h1>A quiet home base for now.</h1>
      <p>This dashboard is intentionally empty until we have invoices, bills, and payments to visualize accurately.</p>
    </section>
    ${renderStats()}
    <div class="empty-state">Home analytics will appear here later.</div>
  `;
};

const renderItems = () => `
  <section class="page-title">
    <p class="eyebrow">Items</p>
    <h1>Sellable goods and services.</h1>
    <p>Create the catalog entries that sales and purchase documents will use later.</p>
  </section>
  ${renderStats()}
  <section class="workspace-grid">
    <form class="panel form-grid" id="itemForm">
      <h2>Create item</h2>
      <div class="field"><label>Name</label><input name="name" required placeholder="Consulting package" /></div>
      <div class="field"><label>SKU</label><input name="sku" placeholder="SRV-001" /></div>
      <div class="split">
        <div class="field"><label>Unit cost</label><input name="unitCost" type="number" min="0" step="0.01" required /></div>
        <div class="field"><label>Sales price</label><input name="salesPrice" type="number" min="0" step="0.01" required /></div>
      </div>
      <div class="field"><label>Quantity</label><input name="quantity" type="number" min="0" step="1" value="0" /></div>
      <div class="field"><label>Description</label><textarea name="description" placeholder="Optional internal description"></textarea></div>
      <button class="button" type="submit">Save item</button>
      <div class="message" id="itemMessage"></div>
    </form>
    <div class="panel">
      <h2>Item list</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>SKU</th><th>Cost</th><th>Price</th><th>Qty</th><th>Value</th></tr></thead>
          <tbody>
            ${state.items
              .map(
                (item) => `
                  <tr>
                    <td><strong>${escapeHtml(item.name)}</strong><br><span class="muted">${escapeHtml(item.description || "")}</span></td>
                    <td>${escapeHtml(item.sku || "-")}</td>
                    <td>${currency.format(item.unitCost)}</td>
                    <td>${currency.format(item.salesPrice)}</td>
                    <td><span class="pill">${item.quantity}</span></td>
                    <td>${currency.format(item.inventoryValue)}</td>
                  </tr>
                `,
              )
              .join("") || `<tr><td colspan="6" class="muted">No items yet.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  </section>
`;

const renderContacts = (kind, title, action, tableTitle) => {
  const collection = state[kind];
  return `
    <section class="page-title">
      <p class="eyebrow">${title}</p>
      <h1>${kind === "customers" ? "Customers for your sales flow." : "Vendors for your purchasing flow."}</h1>
      <p>${kind === "customers" ? "Add customers now so invoices can be connected to real buyers later." : "Add vendors now so bills and purchase orders have suppliers later."}</p>
    </section>
    ${renderStats()}
    <section class="workspace-grid">
      <form class="panel form-grid" id="contactForm" data-kind="${kind}">
        <h2>${action}</h2>
        <div class="field"><label>Display name</label><input name="displayName" required placeholder="${kind === "customers" ? "Acme Trading" : "Northline Supplies"}" /></div>
        <div class="field"><label>Company name</label><input name="companyName" /></div>
        <div class="split">
          <div class="field"><label>Email</label><input name="email" type="email" /></div>
          <div class="field"><label>Phone</label><input name="phone" /></div>
        </div>
        <div class="field"><label>Notes</label><textarea name="notes" placeholder="Payment terms, contact preferences, or internal context"></textarea></div>
        <button class="button" type="submit">${action}</button>
        <div class="message" id="contactMessage"></div>
      </form>
      <div class="panel">
        <h2>${tableTitle}</h2>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Company</th><th>Email</th><th>Phone</th></tr></thead>
            <tbody>
              ${collection
                .map(
                  (contact) => `
                    <tr>
                      <td><strong>${escapeHtml(contact.displayName)}</strong><br><span class="muted">${escapeHtml(contact.notes || "")}</span></td>
                      <td>${escapeHtml(contact.companyName || "-")}</td>
                      <td>${escapeHtml(contact.email || "-")}</td>
                      <td>${escapeHtml(contact.phone || "-")}</td>
                    </tr>
                  `,
                )
                .join("") || `<tr><td colspan="4" class="muted">No records yet.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `;
};

const wireCurrentPage = () => {
  const itemForm = document.querySelector("#itemForm");
  if (itemForm) {
    itemForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const message = document.querySelector("#itemMessage");
      message.textContent = "";

      try {
        await api("/api/items", {
          method: "POST",
          body: JSON.stringify(Object.fromEntries(new FormData(itemForm))),
        });
        itemForm.reset();
        await loadData();
        renderApp();
      } catch (error) {
        message.textContent = error.message;
      }
    });
  }

  const contactForm = document.querySelector("#contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const kind = contactForm.dataset.kind;
      const message = document.querySelector("#contactMessage");
      message.textContent = "";

      try {
        await api(`/api/${kind}`, {
          method: "POST",
          body: JSON.stringify(Object.fromEntries(new FormData(contactForm))),
        });
        contactForm.reset();
        await loadData();
        renderApp();
      } catch (error) {
        message.textContent = error.message;
      }
    });
  }
};

const boot = async () => {
  if (!state.token) {
    renderLogin();
    return;
  }

  try {
    const payload = await api("/api/auth/me");
    state.admin = payload.admin;
    await loadData();
    renderApp();
  } catch {
    renderLogin();
  }
};

boot();
