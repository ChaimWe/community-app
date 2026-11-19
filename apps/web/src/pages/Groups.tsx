import { Button, Checkbox, Form, Input, Modal, Popconfirm, Select, Skeleton, Switch, Tag, message } from "antd";
import { useState } from "react";
import {
  useArchiveGroup,
  useCreateGroup,
  useDeleteGroup,
  useGroups,
  useMembers,
  useRestoreGroup,
  useUpdateGroup,
} from "../api/hooks";
import { Group } from "../api/types";
import { PageHeader } from "../components/PageHeader";
import { GROUP_TYPE_LABELS, SEATING_MODE_LABELS, memberName } from "../lib/labels";
import { useSession } from "../api/session";

const groupTypes = Object.entries(GROUP_TYPE_LABELS).map(([value, label]) => ({ value, label }));
const seatingModes = Object.entries(SEATING_MODE_LABELS).map(([value, label]) => ({ value, label }));

export function Groups() {
  const [includeArchived, setIncludeArchived] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const groups = useGroups(includeArchived);
  const members = useMembers();
  const createGroup = useCreateGroup();
  const updateGroup = useUpdateGroup();
  const archiveGroup = useArchiveGroup();
  const restoreGroup = useRestoreGroup();
  const deleteGroup = useDeleteGroup();
  const session = useSession();
  const canEdit = Boolean(session.data?.isAdmin || session.data?.permission === "edit");

  function closeModal() {
    setModalOpen(false);
    setEditingGroup(null);
  }

  return (
    <section className="page">
      <PageHeader
        eyebrow="Circles"
        title="Groups"
        text="Create groups, add members, and choose how the group should be seated."
        action={canEdit ? (
          <Button type="primary" onClick={() => {
            setEditingGroup(null);
            setModalOpen(true);
          }}>
            New group
          </Button>
        ) : null}
      />
      <div className="event-view-options">
        <span>Include archived groups</span>
        <Switch checked={includeArchived} onChange={setIncludeArchived} />
      </div>
      {groups.isLoading ? (
        <Skeleton active />
      ) : groups.data?.length ? (
        <div className="card-grid">
          {groups.data.map((group) => (
            <article key={group._id} className={`info-card ${group.archived ? "archived-card" : ""}`}>
              <span className="pill">{GROUP_TYPE_LABELS[group.type] || group.type}</span>
              {group.archived ? <Tag color="default">Archived</Tag> : null}
              <h2>{group.name}</h2>
              <p>{group.description || "No description yet."}</p>
              <footer>
                <span>{group.memberIds?.length || 0} members</span>
                <span>{SEATING_MODE_LABELS[group.seatingMode || "NONE"]}</span>
              </footer>
              {canEdit ? (
                <div className="group-card-actions">
                  <Button onClick={() => {
                    setEditingGroup(group);
                    setModalOpen(true);
                  }}>
                    Edit group
                  </Button>
                  {group.archived ? (
                    <Popconfirm
                      title="Restore this group?"
                      onConfirm={async () => {
                        await restoreGroup.mutateAsync(group._id);
                        message.success("Group restored");
                      }}
                    >
                      <Button>Restore</Button>
                    </Popconfirm>
                  ) : (
                    <Popconfirm
                      title="Archive this group?"
                      description="Members and group data will be preserved."
                      onConfirm={async () => {
                        await archiveGroup.mutateAsync(group._id);
                        message.success("Group archived");
                      }}
                    >
                      <Button>Archive</Button>
                    </Popconfirm>
                  )}
                  {session.data?.isAdmin ? (
                    <Popconfirm
                      title="Permanently delete this group?"
                      description="Members will remain; only their link to this group is removed."
                      okText="Delete permanently"
                      okButtonProps={{ danger: true }}
                      onConfirm={async () => {
                        await deleteGroup.mutateAsync(group._id);
                        message.success("Group permanently deleted");
                      }}
                    >
                      <Button danger>Delete</Button>
                    </Popconfirm>
                  ) : null}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="panel empty">
          <h2>No groups yet</h2>
          <p>Create a class, family, or circle of friends when you want them kept in mind for seating.</p>
        </div>
      )}

      <Modal
        title={editingGroup ? `Edit ${editingGroup.name}` : "New group"}
        open={modalOpen}
        footer={null}
        onCancel={closeModal}
        destroyOnClose
        width={560}
      >
        <Form
          key={editingGroup?._id || "new-group"}
          layout="vertical"
          requiredMark={false}
          initialValues={editingGroup ? {
            name: editingGroup.name,
            type: editingGroup.type,
            description: editingGroup.description || "",
            seatingMode: editingGroup.seatingMode || "NONE",
            memberIds: (editingGroup.memberIds || []).map(String),
          } : { seatingMode: "NONE", memberIds: [] }}
          onFinish={async (values) => {
            if (editingGroup) {
              await updateGroup.mutateAsync({ id: editingGroup._id, data: values });
              message.success("Group updated");
            } else {
              await createGroup.mutateAsync(values);
              message.success("Group created");
            }
            closeModal();
          }}
        >
          <Form.Item name="name" label="Name" rules={[{ required: true, message: "Give the group a name" }]}>
            <Input placeholder="Thursday class" />
          </Form.Item>
          <Form.Item name="type" label="Type" rules={[{ required: true, message: "Choose a type" }]}>
            <Select options={groupTypes} placeholder="Choose a type" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Optional note for the team" />
          </Form.Item>
          <Form.Item name="seatingMode" label="Default seating">
            <Select options={seatingModes} placeholder="No preference" allowClear />
          </Form.Item>
          <Form.Item label="Members">
            <GroupMemberPicker members={members.data || []} />
          </Form.Item>
          <div className="sheet-form-actions">
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={createGroup.isPending || updateGroup.isPending}
            >
              {editingGroup ? "Save changes" : "Create group"}
            </Button>
          </div>
        </Form>
      </Modal>
    </section>
  );
}

function GroupMemberPicker({ members }: { members: NonNullable<ReturnType<typeof useMembers>["data"]> }) {
  const form = Form.useFormInstance();
  const selectedIds = (Form.useWatch("memberIds", form) || []) as string[];
  const [search, setSearch] = useState("");
  const visibleMembers = members.filter((member) => memberName(member).toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <>
      <Input.Search
        allowClear
        placeholder="Search members"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <div className="group-member-checklist">
        {visibleMembers.map((member) => {
          const checked = selectedIds.includes(member._id);
          return (
            <Checkbox
              key={member._id}
              checked={checked}
              onChange={(event) => {
                const next = event.target.checked
                  ? [...selectedIds, member._id]
                  : selectedIds.filter((id) => id !== member._id);
                form.setFieldValue("memberIds", next);
              }}
            >
              {memberName(member)}
            </Checkbox>
          );
        })}
        {visibleMembers.length === 0 ? <span className="muted">No matching members.</span> : null}
      </div>
      <small className="muted">{selectedIds.length} members selected</small>
    </>
  );
}
