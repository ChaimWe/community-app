import { List, Button, Empty, Modal, message, Spin, Alert } from "antd";
import { DeleteOutlined, EditOutlined, InboxOutlined, PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import {
  useGuests,
  useDeleteGuest,
  useArchiveGuest,
  useCreateGuest,
  useUpdateGuest,
  Guest,
  GuestInput,
} from "../../api/guestHooks";
import { Member } from "../../api/types";
import { GuestForm } from "./GuestForm";

interface GuestListProps {
  memberId?: string;
  hostMember?: Member;
  hosts?: Member[];
  readOnly?: boolean;
}

export function GuestList({ memberId, hostMember, hosts, readOnly = false }: GuestListProps) {
  const guests = useGuests(memberId);
  const deleteGuest = useDeleteGuest();
  const archiveGuest = useArchiveGuest();
  const createGuest = useCreateGuest();
  const updateGuest = useUpdateGuest();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const editingGuest = guests.data?.find((guest) => guest._id === editingId);

  const openAddForm = () => {
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (guest: Guest) => {
    setShowForm(false);
    setEditingId(guest._id);
  };

  const closeForms = () => {
    setShowForm(false);
    setEditingId(null);
  };

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
      content: `Archive ${name}? They will be hidden from this list.`,
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

  const header = (count?: number) => (
    <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <h3>{count === undefined ? "Guests" : `Guests (${count})`}</h3>
      {!readOnly && (
        <Button type="primary" icon={<PlusOutlined />} onClick={openAddForm} size="small" disabled={showForm}>
          Add Guest
        </Button>
      )}
    </div>
  );

  const formPanel = (
    <div style={{ marginBottom: 20, padding: "12px", border: "1px solid #d9d9d9", borderRadius: "4px" }}>
      <GuestForm
        key={editingId ?? "new"}
        initial={editingGuest}
        hostMember={hostMember}
        hosts={hosts}
        onSubmit={async (data: GuestInput) => {
          try {
            if (editingId) {
              const { firstName, surname, telephone, email, guestOf, comments } = data;
              await updateGuest.mutateAsync({
                id: editingId,
                data: { firstName, surname, telephone, email, guestOf, comments },
              });
              message.success("Guest updated");
            } else {
              await createGuest.mutateAsync(data);
              message.success("Guest added");
            }
            closeForms();
          } catch (err) {
            message.error(editingId ? "Failed to update guest" : "Failed to add guest");
          }
        }}
        onCancel={closeForms}
        isLoading={createGuest.isPending || updateGuest.isPending}
        submitLabel={editingId ? "Update Guest" : "Save Guest"}
      />
    </div>
  );

  if (guests.isError) {
    return (
      <div style={{ marginTop: 20 }}>
        {header()}
        <Alert
          type="error"
          showIcon
          message="Couldn't load guests"
          action={<Button size="small" onClick={() => guests.refetch()}>Retry</Button>}
        />
      </div>
    );
  }

  if (!guests.data || guests.data.length === 0) {
    return (
      <div style={{ marginTop: 20 }}>
        {header(0)}
        {showForm && formPanel}
        <Empty description="No guests yet" />
      </div>
    );
  }

  return (
    <div style={{ marginTop: 20 }}>
      {header(guests.data.length)}

      {showForm && formPanel}
      {editingGuest && !readOnly && formPanel}

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
                      aria-label={`Edit ${guest.firstName} ${guest.surname}`}
                      title="Edit guest"
                      icon={<EditOutlined />}
                      onClick={() => openEditForm(guest)}
                    />,
                    <Button
                      type="text"
                      size="small"
                      aria-label={`Archive ${guest.firstName} ${guest.surname}`}
                      title="Archive guest"
                      icon={<InboxOutlined />}
                      onClick={() => handleArchive(guest._id, `${guest.firstName} ${guest.surname}`)}
                    />,
                    <Button
                      type="text"
                      size="small"
                      danger
                      aria-label={`Delete ${guest.firstName} ${guest.surname}`}
                      title="Delete guest"
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(guest._id, `${guest.firstName} ${guest.surname}`)}
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
