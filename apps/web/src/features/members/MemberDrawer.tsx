import { Drawer, Spin, message } from "antd";
import { useMember, useUpdateMember } from "../../api/hooks";
import { memberInitials, memberName } from "../../lib/labels";
import { MemberForm } from "./MemberForm";

export function MemberDrawer({ id, onClose }: { id?: string; onClose: () => void }) {
  const member = useMember(id);
  const updateMember = useUpdateMember();
  const name = memberName(member.data);

  return (
    <Drawer
      className="member-drawer"
      title={member.data ? name : "Member"}
      open={Boolean(id)}
      onClose={onClose}
      width={640}
      destroyOnClose
    >
      {member.isLoading ? <Spin /> : null}
      {member.data ? (
        <>
          <div className="profile">
            <span>{memberInitials(name)}</span>
            <div>
              <strong>{name}</strong>
              <small>{member.data.email || member.data.telephone || "No contact yet"}</small>
            </div>
          </div>
          <MemberForm
            initial={member.data}
            onSubmit={async (data) => {
              await updateMember.mutateAsync({ id: id!, data });
              message.success("Saved");
              onClose();
            }}
          />
        </>
      ) : null}
    </Drawer>
  );
}
