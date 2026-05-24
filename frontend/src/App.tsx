import { useEffect, useState } from "react";
import { Navigate, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { api } from "./api";
import { Sidebar } from "./layout/Sidebar";
import { ContactsPage } from "./pages/ContactsPage";
import { HomePage } from "./pages/HomePage";
import { ItemsPage } from "./pages/ItemsPage";
import { LoginPage } from "./pages/LoginPage";
import { ReportsPage } from "./pages/ReportsPage";
import type { Admin, Contact, Item, Summary } from "./types";

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

const emptyData: AppData = {
  summary: emptySummary,
  items: [],
  customers: [],
  vendors: [],
};

export const App = () => {
  const [token, setToken] = useState(() => localStorage.getItem("adminToken"));
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [data, setData] = useState<AppData>(emptyData);
  const [booting, setBooting] = useState(true);
  const [dataError, setDataError] = useState("");

  const logout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
    setAdmin(null);
    setData(emptyData);
    setDataError("");
  };

  const loadData = async (activeToken: string) => {
    setDataError("");
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
        await loadData(token).catch(() => {
          setDataError("Some workspace data could not be loaded. Try refreshing in a moment.");
        });
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

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <LoginRoute
            admin={admin}
            loadData={loadData}
            setAdmin={setAdmin}
            setToken={setToken}
            token={token}
          />
        }
      />
      <Route
        element={
          <ProtectedLayout
            admin={admin}
            onLogout={logout}
            token={token}
          />
        }
      >
        <Route index element={<HomePage />} />
        <Route
          path="items"
          element={
            <ItemsPage
              dataError={dataError}
              items={data.items}
              token={token ?? ""}
              vendors={data.vendors}
              onRefresh={() => (token ? loadData(token) : Promise.resolve())}
            />
          }
        />
        <Route
          path="sales/customers"
          element={
            <ContactsPage
              contacts={data.customers}
              kind="customers"
              summary={data.summary}
              token={token ?? ""}
              onRefresh={() => (token ? loadData(token) : Promise.resolve())}
            />
          }
        />
        <Route
          path="purchases/vendors"
          element={
            <ContactsPage
              contacts={data.vendors}
              kind="vendors"
              summary={data.summary}
              token={token ?? ""}
              onRefresh={() => (token ? loadData(token) : Promise.resolve())}
            />
          }
        />
        <Route path="reports" element={<ReportsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

type LoginRouteProps = {
  admin: Admin | null;
  loadData: (activeToken: string) => Promise<void>;
  setAdmin: (admin: Admin) => void;
  setToken: (token: string) => void;
  token: string | null;
};

const LoginRoute = ({ admin, loadData, setAdmin, setToken, token }: LoginRouteProps) => {
  if (token && admin) {
    return <Navigate to="/" replace />;
  }

  return (
    <LoginPage
      onLogin={async (email, password) => {
        const response = await api.login(email, password);
        localStorage.setItem("adminToken", response.token);
        setToken(response.token);
        setAdmin(response.admin);
        void loadData(response.token).catch(() => {
          // The user is authenticated; keep them in the app even if a secondary
          // workspace request needs another try.
        });
      }}
    />
  );
};

type ProtectedLayoutProps = {
  admin: Admin | null;
  onLogout: () => void;
  token: string | null;
};

const ProtectedLayout = ({ admin, onLogout, token }: ProtectedLayoutProps) => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  if (!token || !admin) {
    return <Navigate to="/login" replace />;
  }

  const logout = () => {
    onLogout();
    navigate("/login", { replace: true });
  };

  return (
    <div className={`app-shell ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar
        admin={admin}
        isCollapsed={isSidebarCollapsed}
        onLogout={logout}
        onToggleCollapse={() => setIsSidebarCollapsed((current) => !current)}
      />
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
};
