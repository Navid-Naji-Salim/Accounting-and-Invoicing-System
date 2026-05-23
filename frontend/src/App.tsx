import { useEffect, useState } from "react";
import { api } from "./api";
import { Sidebar } from "./layout/Sidebar";
import { ContactsPage } from "./pages/ContactsPage";
import { HomePage } from "./pages/HomePage";
import { ItemsPage } from "./pages/ItemsPage";
import { LoginPage } from "./pages/LoginPage";
import { ReportsPage } from "./pages/ReportsPage";
import type { Admin, Contact, Item, PageId, Summary } from "./types";

type AppData = {
  summary: Summary;
  items: Item[];
  customers: Contact[];
  vendors: Contact[];
};

const emptySummary: Summary = {
  activeItemCount: 0,
  customerCount: 0,
  inventoryValue: 0,
  itemCount: 0,
  vendorCount: 0,
};

export const App = () => {
  const [token, setToken] = useState(() => localStorage.getItem("adminToken"));
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [activePage, setActivePage] = useState<PageId>("home");
  const [data, setData] = useState<AppData>({
    summary: emptySummary,
    items: [],
    customers: [],
    vendors: [],
  });
  const [booting, setBooting] = useState(true);

  const logout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
    setAdmin(null);
  };

  const loadData = async (activeToken: string) => {
    const [summary, items, customers, vendors] = await Promise.all([
      api.summary(activeToken),
      api.items(activeToken),
      api.customers(activeToken),
      api.vendors(activeToken),
    ]);

    setData({ summary, items, customers, vendors });
  };

  useEffect(() => {
    if (!token) {
      setBooting(false);
      return;
    }

    let isCurrent = true;
    const boot = async () => {
      try {
        const response = await api.me(token);
        if (!isCurrent) {
          return;
        }

        setAdmin(response.admin);
        await loadData(token);
      } catch {
        if (isCurrent) {
          logout();
        }
      } finally {
        if (isCurrent) {
          setBooting(false);
        }
      }
    };

    void boot();
    return () => {
      isCurrent = false;
    };
  }, [token]);

  if (booting) {
    return <div className="loading-screen">Preparing your books workspace...</div>;
  }

  if (!token || !admin) {
    return (
      <LoginPage
        onLogin={async (email, password) => {
          const response = await api.login(email, password);
          localStorage.setItem("adminToken", response.token);
          setToken(response.token);
          setAdmin(response.admin);
          await loadData(response.token);
        }}
      />
    );
  }

  const refresh = () => loadData(token);

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        admin={admin}
        onLogout={logout}
        onNavigate={setActivePage}
      />
      <main className="content">
        <header className="topbar">
          <div>
            <strong>Books foundation</strong>
            <div className="muted">Items, customers, and vendors are ready to manage.</div>
          </div>
          <button className="ghost-button" type="button" onClick={() => void refresh()}>
            Refresh data
          </button>
        </header>
        {activePage === "home" && <HomePage />}
        {activePage === "items" && (
          <ItemsPage items={data.items} summary={data.summary} token={token} onRefresh={refresh} />
        )}
        {activePage === "sales" && (
          <ContactsPage
            contacts={data.customers}
            kind="customers"
            summary={data.summary}
            token={token}
            onRefresh={refresh}
          />
        )}
        {activePage === "purchases" && (
          <ContactsPage
            contacts={data.vendors}
            kind="vendors"
            summary={data.summary}
            token={token}
            onRefresh={refresh}
          />
        )}
        {activePage === "reports" && <ReportsPage />}
      </main>
    </div>
  );
};
