import { Button, Form, Input, Modal, Select, Skeleton, message } from "antd";
import { useState } from "react";
import { useCreateGroup, useGroups } from "../api/hooks";
import { PageHeader } from "../components/PageHeader";
import { GROUP_TYPE_LABELS, SEATING_MODE_LABELS } from "../lib/labels";

const groupTypes = Object.entries(GROUP_TYPE_LABELS).map(([value, label]) => ({ value, label }));
const seatingModes = Object.entries(SEATING_MODE_LABELS).map(([value, label]) => ({ value, label }));

export function Groups() {
  const groups = useGroups();
  const createGroup = useCreateGroup();
  const [open, setOpen] = useState(false);

  return (
    <section className="page">
      <PageHeader
        eyebrow="Circles"
        title="Groups"
        text="Classes, families, friends, and the seating preference for each."
        action={
          <Button type="primary" onClick={() => setOpen(true)}>
            New group
          </Button>
        }
      />
      {groups.isLoading ? (
        <Skeleton active />
      ) : groups.data?.length ? (
        <div className="card-grid">
          {groups.data.map((group) => (
            <article key={group._id} className="info-card">
              <span className="pill">{GROUP_TYPE_LABELS[group.type] || group.type}</span>
              <h2>{group.name}</h2>
              <p>{group.description || "No description yet."}</p>
              <footer>
                <span>{group.memberIds?.length || 0} members</span>
                <span>{SEATING_MODE_LABELS[group.seatingMode || "NONE"]}</span>
              </footer>
            </article>
          ))}
        </div>
      ) : (
        <div className="panel empty">
          <h2>No groups yet</h2>
          <p>Create a class, family, or circle of friends when you want them kept in mind for seating.</p>
        </div>
      )}
      <Modal title="New group" open={open} footer={null} onCancel={() => setOpen(false)} destroyOnClose>
        <Form
          layout="vertical"
          requiredMark={false}
          onFinish={async (values) => {
            await createGroup.mutateAsync(values);
            message.success("Group created");
            setOpen(false);
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
          <Button type="primary" htmlType="submit" loading={createGroup.isPending}>
            Create group
          </Button>
        </Form>
      </Modal>
    </section>
  );
}
