import { Button, Form, Input, Modal, Table, message } from "antd";
import { useEffect, useState } from "react";
import { useCreateMember, useMembers } from "../api/hooks";
import { Member } from "../api/types";
import { PageHeader } from "../components/PageHeader";
import { MemberDrawer } from "../features/members/MemberDrawer";
import { MemberForm } from "../features/members/MemberForm";

export function Members() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [memberId, setMemberId] = useState<string>();
  const [open, setOpen] = useState(false);
  const members = useMembers(search);
  const createMember = useCreateMember();

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(query.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  return (
    <section className="page">
      <PageHeader
        eyebrow="Directory"
        title="Members"
        text="Search by name, phone, or email. Open a row to edit the record."
        action={
          <Button type="primary" onClick={() => setOpen(true)}>
            Add member
          </Button>
        }
      />
      <Input.Search
        className="search"
        placeholder="Search name, phone, or email"
        allowClear
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="panel table-panel">
        <Table<Member>
          rowKey="_id"
          loading={members.isLoading}
          dataSource={members.data || []}
          pagination={{ pageSize: 12, hideOnSinglePage: true }}
          onRow={(record) => ({ onClick: () => setMemberId(record._id), style: { cursor: "pointer" } })}
          locale={{ emptyText: search ? "No members match that search." : "No members yet." }}
          columns={[
            { title: "Surname", dataIndex: "surname", sorter: (a, b) => (a.surname || "").localeCompare(b.surname || "") },
            { title: "First name", dataIndex: "firstName" },
            { title: "Phone", dataIndex: "telephone", render: (value) => value || "—" },
            { title: "Email", dataIndex: "email", render: (value) => value || "—" },
            { title: "Birthday", dataIndex: "birthday", render: (value) => value || "—" },
          ]}
        />
      </div>
      <MemberDrawer id={memberId} onClose={() => setMemberId(undefined)} />
      <Modal title="New member" open={open} footer={null} onCancel={() => setOpen(false)} destroyOnClose width={640}>
        <MemberForm
          onSubmit={async (data) => {
            await createMember.mutateAsync(data);
            message.success("Member created");
            setOpen(false);
          }}
        />
      </Modal>
    </section>
  );
}
