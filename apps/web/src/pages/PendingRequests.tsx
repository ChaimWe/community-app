import { Alert, Button, Popconfirm, Select, Table, Tag, message } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../api/client";
import { PageHeader } from "../components/PageHeader";

interface AppUser {
  id: string;
  name: string;
  email: string;
  approved: boolean;
  permission: "view" | "edit";
  isAdmin: boolean;
}

export function PendingRequests() {
  const queryClient = useQueryClient();
  const [pendingPermissions, setPendingPermissions] = useState<Record<string, "view" | "edit">>({});
  const users = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => (await api.get<AppUser[]>("/auth/users")).data,
  });

  const update = useMutation({
    mutationFn: ({ id, approved, permission }: { id: string; approved: boolean; permission: "view" | "edit" }) =>
      api.patch(`/auth/users/${id}/approval`, { approved, permission }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      message.success("User access updated");
    },
  });

  const pending = (users.data || []).filter((user) => !user.approved && !user.isAdmin);
  const currentUsers = (users.data || []).filter((user) => user.approved);

  return (
    <section className="page">
      <PageHeader
        eyebrow="Administration"
        title="User access"
        text="Review pending requests and manage approved users and permissions."
      />
      {users.isError ? <Alert type="error" message="Could not load users" /> : null}

      <div className="panel table-panel" style={{ marginBottom: 20 }}>
        <div className="panel-head" style={{ padding: "8px 8px 14px" }}>
          <h2>Pending requests</h2>
          <span className="muted">{pending.length}</span>
        </div>
        <Table<AppUser>
          rowKey="id"
          loading={users.isLoading}
          dataSource={pending}
          pagination={{ pageSize: 12, hideOnSinglePage: true }}
          locale={{ emptyText: "There are no pending access requests." }}
          columns={[
            { title: "Name", dataIndex: "name", render: (value) => value || "—" },
            { title: "Email", dataIndex: "email" },
            { title: "Status", render: () => <Tag color="gold">Pending</Tag> },
            {
              title: "Permission",
              render: (_, user) => (
                <Select
                  value={pendingPermissions[user.id] || user.permission}
                  style={{ width: 150 }}
                  options={[
                    { value: "view", label: "View only" },
                    { value: "edit", label: "Can edit" },
                  ]}
                  onChange={(permission) => setPendingPermissions((current) => ({ ...current, [user.id]: permission }))}
                />
              ),
            },
            {
              title: "Action",
              render: (_, user) => (
                <Button
                  type="primary"
                  loading={update.isPending}
                  onClick={() =>
                    update.mutate({
                      id: user.id,
                      approved: true,
                      permission: pendingPermissions[user.id] || user.permission,
                    })
                  }
                >
                  Approve
                </Button>
              ),
            },
          ]}
        />
      </div>

      <div className="panel table-panel">
        <div className="panel-head" style={{ padding: "8px 8px 14px" }}>
          <h2>Current users</h2>
          <span className="muted">{currentUsers.length}</span>
        </div>
        <Table<AppUser>
          rowKey="id"
          loading={users.isLoading}
          dataSource={currentUsers}
          pagination={{ pageSize: 12, hideOnSinglePage: true }}
          locale={{ emptyText: "There are no approved users." }}
          columns={[
            { title: "Name", dataIndex: "name", render: (value) => value || "—" },
            { title: "Email", dataIndex: "email" },
            {
              title: "Role",
              render: (_, user) =>
                user.isAdmin ? <Tag color="purple">Admin</Tag> : <Tag color="green">Approved</Tag>,
            },
            {
              title: "Permission",
              render: (_, user) =>
                user.isAdmin ? (
                  <span>Full access</span>
                ) : (
                  <Select
                    value={user.permission}
                    style={{ width: 150 }}
                    options={[
                      { value: "view", label: "View only" },
                      { value: "edit", label: "Can edit" },
                    ]}
                    onChange={(permission) =>
                      update.mutate({
                        id: user.id,
                        approved: true,
                        permission,
                      })
                    }
                  />
                ),
            },
            {
              title: "Action",
              render: (_, user) =>
                user.isAdmin ? null : (
                  <Popconfirm
                    title="Revoke access?"
                    description="This user will no longer be able to sign in."
                    okText="Revoke"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => update.mutate({ id: user.id, approved: false, permission: "view" })}
                  >
                    <Button danger>Revoke access</Button>
                  </Popconfirm>
                ),
            },
          ]}
        />
      </div>
    </section>
  );
}
