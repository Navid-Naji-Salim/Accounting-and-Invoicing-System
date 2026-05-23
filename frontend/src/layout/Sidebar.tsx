import { NavLink } from "react-router-dom";
import { icons } from "../icons";
import type { Admin, PageId } from "../types";

const navItems: Array<{ id: PageId; label: string; to: string }> = [
  { id: "home", label: "Home", to: "/" },
  { id: "items", label: "Items", to: "/items" },
  { id: "sales", label: "Sales", to: "/sales/customers" },
  { id: "purchases", label: "Purchases", to: "/purchases/vendors" },
  { id: "reports", label: "Reports", to: "/reports" },
];

type SidebarProps = {
  admin: Admin;
  onLogout: () => void;
};

export const Sidebar = ({ admin, onLogout }: SidebarProps) => (
  <aside className="sidebar">
    <div className="brand">
      <div className="brand-mark">A</div>
      <div>
        <strong>Admin</strong>
        <span>Administrator</span>
      </div>
    </div>
    <nav className="nav">
      {navItems.map((item) => {
        const Icon = icons[item.id];
        return (
          <NavLink
            className={({ isActive }) => (isActive ? "active" : undefined)}
            end={item.to === "/"}
            key={item.id}
            to={item.to}
          >
            <Icon className="nav-icon" />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
    <div className="sidebar-footer">
      <strong>{admin.name}</strong>
      <span className="muted">{admin.email}</span>
      <button className="ghost-button" type="button" onClick={onLogout}>
        Log out
      </button>
    </div>
  </aside>
);
