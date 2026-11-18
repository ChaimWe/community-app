import { Button, Input, Modal, Popconfirm, Select, Switch, Table, Tag, message } from "antd";
import { useEffect, useState } from "react";
import {
  useArchiveMember,
  useCreateMember,
  useDeleteMember,
  useMembers,
  useRestoreMember,
  useUpdateMember,
} from "../api/hooks";
import { Member } from "../api/types";
import { PageHeader } from "../components/PageHeader";
import { MemberForm } from "../features/members/MemberForm";
import { PROGRAM_OPTIONS, memberName } from "../lib/labels";
import { useSession } from "../api/session";

export function Members() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [program, setProgram] = useState("");
  const [memberId, setMemberId] = useState<string>();
  const [selectedMember, setSelectedMember] = useState<Member>();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [includeArchived, setIncludeArchived] = useState(false);
  const members = useMembers(search, program, includeArchived);
  const createMember = useCreateMember();
  const updateMember = useUpdateMember();
  const archiveMember = useArchiveMember();
  const restoreMember = useRestoreMember();
  const deleteMember = useDeleteMember();
  const session = useSession();
  const readOnly = !session.data?.isAdmin && session.data?.permission !== "edit";

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(query.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  function openMember(member: Member) {
    setSelectedMember(member);
    setMemberId(member._id);
    setEditOpen(true);
  }

  return (
    <section className="page">
      <PageHeader
        eyebrow="Directory"
        title="Members"
        text="Search by name, phone, email, or program. Open a row to edit the record."
        action={!readOnly ? (
          <Button type="primary" onClick={() => setCreateOpen(true)}>
            Add member
          </Button>
        ) : null}
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
        <span className="archived-toggle">
          <span className="label">Include archived members</span>
          <Switch
            checked={includeArchived}
            onChange={(checked) => setIncludeArchived(checked)}
          />
        </span>
      </div>
      <div className="panel table-panel">
        <Table<Member>
          rowKey="_id"
          loading={members.isLoading}
          dataSource={members.data || []}
          pagination={{ pageSize: 12, hideOnSinglePage: true }}
          onRow={(record) => ({ onClick: () => openMember(record), style: { cursor: "pointer" } })}
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

      <Modal
        title="New member"
        open={createOpen}
        footer={null}
        onCancel={() => setCreateOpen(false)}
        destroyOnClose
        width={640}
      >
        <MemberForm
          onSubmit={async (data) => {
            await createMember.mutateAsync(data);
            message.success("Member created");
            setCreateOpen(false);
          }}
        />
      </Modal>

      <Modal
        title={selectedMember ? memberName(selectedMember) : "Member details"}
        open={editOpen}
        footer={null}
        onCancel={() => {
          setEditOpen(false);
          setMemberId(undefined);
          setSelectedMember(undefined);
        }}
        destroyOnClose
        width={640}
      >
        {selectedMember ? (
          <>
            <MemberForm
              initial={selectedMember}
              readOnly={readOnly}
              onSubmit={async (data) => {
                await updateMember.mutateAsync({ id: memberId!, data });
                message.success("Member updated");
                setEditOpen(false);
                setMemberId(undefined);
                setSelectedMember(undefined);
              }}
            />
            {!readOnly ? (
              <div className="member-lifecycle-actions">
                {selectedMember.archived ? (
                  <Popconfirm
                    title="Restore this member?"
                    onConfirm={async () => {
                      await restoreMember.mutateAsync(memberId!);
                      message.success("Member restored");
                      setEditOpen(false);
                      setMemberId(undefined);
                      setSelectedMember(undefined);
                    }}
                  >
                    <Button>Restore member</Button>
                  </Popconfirm>
                ) : (
                  <Popconfirm
                    title="Archive this member?"
                    description="The member will leave the active directory."
                    onConfirm={async () => {
                      await archiveMember.mutateAsync(memberId!);
                      message.success("Member archived");
                      setEditOpen(false);
                      setMemberId(undefined);
                      setSelectedMember(undefined);
                    }}
                  >
                    <Button>Archive member</Button>
                  </Popconfirm>
                )}
                {session.data?.isAdmin ? (
                  <Popconfirm
                    title="Permanently delete this member?"
                    description="This cannot be undone."
                    okText="Delete permanently"
                    okButtonProps={{ danger: true }}
                    onConfirm={async () => {
                      await deleteMember.mutateAsync(memberId!);
                      message.success("Member permanently deleted");
                      setEditOpen(false);
                      setMemberId(undefined);
                      setSelectedMember(undefined);
                    }}
                  >
                    <Button danger>Delete permanently</Button>
                  </Popconfirm>
                ) : null}
              </div>
            ) : null}
          </>
        ) : null}
      </Modal>
    </section>
  );
}
