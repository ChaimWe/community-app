import { Button, Input, Modal, Select, Table, Tag, message } from "antd";
import { useEffect, useState } from "react";
import { useCreateMember, useMembers } from "../api/hooks";
import { Member } from "../api/types";
import { PageHeader } from "../components/PageHeader";
import { MemberDrawer } from "../features/members/MemberDrawer";
import { MemberForm } from "../features/members/MemberForm";
import { PROGRAM_OPTIONS } from "../lib/labels";

export function Members() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [program, setProgram] = useState("");
  const [memberId, setMemberId] = useState<string>();
  const [open, setOpen] = useState(false);
  const members = useMembers(search, program);
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
        text="Search by name, phone, email, or program. Open a row to edit the record."
        action={
          <Button type="primary" onClick={() => setOpen(true)}>
            Add member
          </Button>
        }
      />
      <div className="member-tools">
        <Input.Search
          className="search"
          placeholder="Search members or programs"
          allowClear
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Select
          allowClear
          className="program-filter"
          placeholder="Filter by program"
          value={program || undefined}
          onChange={(value) => setProgram(value || "")}
          options={PROGRAM_OPTIONS.map((value) => ({ value, label: value }))}
        />
      </div>
      <div className="panel table-panel">
        <Table<Member>
          rowKey="_id"
          loading={members.isLoading}
          dataSource={members.data || []}
          pagination={{ pageSize: 12, hideOnSinglePage: true }}
          onRow={(record) => ({ onClick: () => setMemberId(record._id), style: { cursor: "pointer" } })}
          locale={{ emptyText: search || program ? "No members match that filter." : "No members yet." }}
          columns={[
            { title: "Surname", dataIndex: "surname", sorter: (a, b) => (a.surname || "").localeCompare(b.surname || "") },
            { title: "First name", dataIndex: "firstName" },
            { title: "Phone", dataIndex: "telephone", render: (value) => value || "—" },
            { title: "Email", dataIndex: "email", render: (value) => value || "—" },
            {
              title: "Programs",
              dataIndex: "programs",
              render: (values: string[] = []) => values.length
                ? values.map((value) => <Tag key={value}>{value}</Tag>)
                : "—",
            },
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
