import { icons } from "../icons";
import type { Admin, PageId } from "../types";

const navItems: Array<{ id: PageId; label: string }> = [
  { id: "home", label: "Home" },
  { id: "items", label: "Items" },
  { id: "sales", label: "Sales" },
  { id: "purchases", label: "Purchases" },
  { id: "reports", label: "Reports" },
];

type SidebarProps = {
  activePage: PageId;
  admin: Admin;
  onLogout: () => void;
  onNavigate: (page: PageId) => void;
};

export const Sidebar = ({ activePage, admin, onLogout, onNavigate }: SidebarProps) => (
  <aside className="sidebar">
    <div className="brand">
      <div className="brand-mark">AB</div>
      <div>
        <strong>Accounting Books</strong>
        <span>Admin console</span>
      </div>
    </div>
    <nav className="nav">
      {navItems.map((item) => {
        const Icon = icons[item.id];
        return (
          <button
            className={activePage === item.id ? "active" : ""}
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
          >
            <Icon className="nav-icon" />
            {item.label}
          </button>
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
