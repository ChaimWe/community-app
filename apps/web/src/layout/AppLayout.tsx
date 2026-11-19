import {
  ApartmentOutlined,
  CalendarOutlined,
  CloseOutlined,
  DashboardOutlined,
  KeyOutlined,
  LogoutOutlined,
  MenuOutlined,
  TeamOutlined,
  UserAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, Modal, message } from "antd";
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
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const logout = useMutation({
    mutationFn: () => api.post("/auth/logout"),
    onSettled: async () => {
      queryClient.clear();
      navigate("/login");
    },
  });
  const changePassword = useMutation({
    mutationFn: (values: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
      api.patch("/auth/password", values),
    onSuccess: () => {
      message.success("Password changed");
      setPasswordOpen(false);
    },
    onError: (error: unknown) => {
      const caught = error as { response?: { data?: { message?: string } } };
      message.error(caught.response?.data?.message || "Could not change password");
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
          <button type="button" className="sign-out" onClick={() => setPasswordOpen(true)}>
            <KeyOutlined />
            Change password
          </button>
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
      <main className="stage"><Outlet /></main>

      <nav className="mobile-bottom-nav" aria-label="Primary mobile navigation">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.to === "/"}>
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
        <button type="button" onClick={() => setAccountOpen(true)}>
          <UserOutlined />
          <span>Account</span>
        </button>
      </nav>

      <Modal
        title="Account"
        open={accountOpen}
        footer={null}
        onCancel={() => setAccountOpen(false)}
        destroyOnClose
        className="account-sheet"
      >
        <div className="mobile-account-details">
          <strong>{session.data?.name || "Signed in"}</strong>
          <small>{session.data?.email}</small>
        </div>
        {session.data?.isAdmin ? (
          <Button block onClick={() => {
            setAccountOpen(false);
            navigate("/pending");
          }}>
            <UserAddOutlined /> Pending requests
          </Button>
        ) : null}
        <Button block icon={<KeyOutlined />} onClick={() => {
          setAccountOpen(false);
          setPasswordOpen(true);
        }}>
          Change password
        </Button>
        <Button block danger icon={<LogoutOutlined />} loading={logout.isPending} onClick={() => logout.mutate()}>
          Sign out
        </Button>
      </Modal>

      <Modal
        title="Change password"
        open={passwordOpen}
        footer={null}
        onCancel={() => setPasswordOpen(false)}
        destroyOnClose
      >
        <Form
          layout="vertical"
          requiredMark={false}
          onFinish={(values) => changePassword.mutate(values)}
        >
          <Form.Item name="currentPassword" label="Current password" rules={[{ required: true }]}>
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Form.Item name="newPassword" label="New password" rules={[{ required: true, min: 8 }]}>
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item name="confirmPassword" label="Confirm new password" rules={[{ required: true }]}>
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <div className="sheet-form-actions">
            <Button type="primary" htmlType="submit" block loading={changePassword.isPending}>
              Change password
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
