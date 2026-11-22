import { Drawer, Spin, message } from "antd";
import { useMember, useUpdateMember } from "../../api/hooks";
import { memberInitials, memberName } from "../../lib/labels";
import { useSession } from "../../api/session";
import { MemberForm } from "./MemberForm";
import { GuestList } from "./GuestList";

export function MemberDrawer({ id, onClose }: { id?: string; onClose: () => void }) {
  const member = useMember(id);
  const updateMember = useUpdateMember();
  const session = useSession();
  const name = memberName(member.data);
  const readOnly = !session.data?.isAdmin && session.data?.permission !== "edit";

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
            readOnly={readOnly}
          />
          <GuestList memberId={id!} hostMember={member.data} readOnly={readOnly} />
        </>
      ) : null}
    </Drawer>
  );
}
