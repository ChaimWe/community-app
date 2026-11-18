import {
  DashboardOutlined,
  TeamOutlined,
  ApartmentOutlined,
  CalendarOutlined,
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useSession } from "../api/session";

const links = [
  { to: "/", label: "Overview", icon: <DashboardOutlined /> },
  { to: "/members", label: "Members", icon: <TeamOutlined /> },
  { to: "/groups", label: "Groups", icon: <ApartmentOutlined /> },
  { to: "/events", label: "Events", icon: <CalendarOutlined /> },
];

export function AppLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const session = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const logout = useMutation({
    mutationFn: () => api.post("/auth/logout"),
    onSettled: async () => {
      queryClient.clear();
      navigate("/login");
    },
  });

  const visibleLinks = session.data?.isAdmin
    ? [...links, { to: "/pending", label: "Pending requests", icon: <UserAddOutlined /> }]
    : links;

  return (
    <div className="shell">
      <aside className={`nav ${mobileMenuOpen ? "open" : ""}`}>
        <div className="nav-topbar">
          <div className="brand">
            <span className="mark">C</span>
            <span>
              <strong>CommunityApp</strong>
              <small>{session.data?.isAdmin ? "Admin workspace" : session.data?.permission === "edit" ? "Editor workspace" : "View-only workspace"}</small>
            </span>
          </div>
          <button
            type="button"
            className="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
          </button>
        </div>
        <nav>
          {visibleLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === "/"} onClick={() => setMobileMenuOpen(false)}>
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="account">
          <div>
            <strong>{session.data?.name || "Signed in"}</strong>
            <small>{session.data?.email}</small>
          </div>
          <button
            type="button"
            className="sign-out"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            <LogoutOutlined />
            Sign out
          </button>
        </div>
      </aside>
      <main className="stage">
        <Outlet />
      </main>
    </div>
  );
}
