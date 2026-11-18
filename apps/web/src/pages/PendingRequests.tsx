import { Alert, Button, Select, Table, Tag, message } from "antd";
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
  const [permissions, setPermissions] = useState<Record<string, "view" | "edit">>({});
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

  return (
    <section className="page">
      <PageHeader
        eyebrow="Administration"
        title="Pending requests"
        text="Approve first-time accounts and choose view-only or editing access."
      />
      {users.isError ? <Alert type="error" message="Could not load pending requests" /> : null}
      <div className="panel table-panel">
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
                  value={permissions[user.id] || user.permission}
                  style={{ width: 150 }}
                  options={[
                    { value: "view", label: "View only" },
                    { value: "edit", label: "Can edit" },
                  ]}
                  onChange={(permission) => setPermissions((current) => ({ ...current, [user.id]: permission }))}
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
                      permission: permissions[user.id] || user.permission,
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
    </section>
  );
}
