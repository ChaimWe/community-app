import { List, Button, Space, Empty, Modal, message, Spin } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useGuests, useDeleteGuest, useArchiveGuest, useCreateGuest } from "../../api/guestHooks";
import { Member } from "../../api/types";
import { GuestForm } from "./GuestForm";
import { GuestInput } from "../../api/guestHooks";

interface GuestListProps {
  memberId: string;
  hostMember: Member;
  readOnly?: boolean;
}

export function GuestList({ memberId, hostMember, readOnly = false }: GuestListProps) {
  const guests = useGuests(memberId);
  const deleteGuest = useDeleteGuest();
  const archiveGuest = useArchiveGuest();
  const createGuest = useCreateGuest();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleDelete = (id: string, name: string) => {
    Modal.confirm({
      title: "Delete Guest",
      content: `Are you sure you want to delete ${name}?`,
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteGuest.mutateAsync(id);
          message.success("Guest deleted");
        } catch (err) {
          message.error("Failed to delete guest");
        }
      },
    });
  };

  const handleArchive = (id: string, name: string) => {
    Modal.confirm({
      title: "Archive Guest",
      content: `Archive ${name}? They can be restored later.`,
      okText: "Archive",
      onOk: async () => {
        try {
          await archiveGuest.mutateAsync(id);
          message.success("Guest archived");
        } catch (err) {
          message.error("Failed to archive guest");
        }
      },
    });
  };

  if (guests.isLoading) return <Spin />;
  if (!guests.data || guests.data.length === 0)
    return <Empty description="No guests yet" style={{ marginTop: 20 }} />;

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
        <h3>Guests ({guests.data.length})</h3>
        {!readOnly && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowForm(true)}
            size="small"
          >
            Add Guest
          </Button>
        )}
      </div>

      {showForm && (
        <div style={{ marginBottom: 20, padding: "12px", border: "1px solid #d9d9d9", borderRadius: "4px" }}>
          <GuestForm
            hostMember={hostMember}
            onSubmit={async (data: GuestInput) => {
              try {
                await createGuest.mutateAsync(data);
                message.success("Guest added");
                setShowForm(false);
              } catch (err) {
                message.error("Failed to add guest");
              }
            }}
            readOnly={readOnly}
            isLoading={createGuest.isPending}
          />
        </div>
      )}

      <List
        dataSource={guests.data}
        renderItem={(guest) => (
          <List.Item
            key={guest._id}
            actions={
              !readOnly
                ? [
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => setEditingId(guest._id)}
                    />,
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() =>
                        handleDelete(guest._id, `${guest.firstName} ${guest.surname}`)
                      }
                    />,
                  ]
                : []
            }
          >
            <List.Item.Meta
              title={`${guest.firstName} ${guest.surname}`}
              description={
                <>
                  {guest.telephone && <div>📞 {guest.telephone}</div>}
                  {guest.email && <div>✉️ {guest.email}</div>}
                  {guest.comments && <div>💬 {guest.comments}</div>}
                </>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
}
