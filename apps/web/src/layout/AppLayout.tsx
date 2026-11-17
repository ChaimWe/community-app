import {
  DashboardOutlined,
  TeamOutlined,
  ApartmentOutlined,
  CalendarOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  const logout = useMutation({
    mutationFn: () => api.post("/auth/logout"),
    onSettled: async () => {
      queryClient.clear();
      navigate("/login");
    },
  });

  return (
    <div className="shell">
      <aside className="nav">
        <div className="brand">
          <span className="mark">C</span>
          <span>
            <strong>CommunityApp</strong>
            <small>Admin workspace</small>
          </span>
        </div>
        <nav>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === "/"}>
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
