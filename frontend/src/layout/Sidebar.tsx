import { useState } from "react";
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

export const Sidebar = ({ admin, onLogout }: SidebarProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <aside className="sidebar">
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
        {isSettingsOpen && (
          <div className="profile-menu">
            <button type="button" onClick={onLogout}>
              Log out
            </button>
          </div>
        )}
        <div className="profile-card">
          <div className="brand-mark">A</div>
          <div className="profile-copy">
            <strong>Admin</strong>
            <span>Administrator</span>
          </div>
          <button
            aria-expanded={isSettingsOpen}
            aria-label="Open admin settings"
            className="settings-button"
            type="button"
            onClick={() => setIsSettingsOpen((current) => !current)}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M19.1 13.4c.1-.5.1-.9.1-1.4s0-.9-.1-1.4l2-1.5-2-3.5-2.4 1a8 8 0 0 0-2.4-1.4L14 2.6h-4l-.4 2.6a8 8 0 0 0-2.4 1.4l-2.4-1-2 3.5 2 1.5a8.8 8.8 0 0 0 0 2.8l-2 1.5 2 3.5 2.4-1a8 8 0 0 0 2.4 1.4l.4 2.6h4l.4-2.6a8 8 0 0 0 2.4-1.4l2.4 1 2-3.5-2.1-1.5Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
};
