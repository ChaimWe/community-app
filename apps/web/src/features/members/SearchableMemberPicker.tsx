import { Checkbox, Input } from "antd";
import { useState } from "react";
import { Member } from "../../api/types";
import { memberName } from "../../lib/labels";

type SearchableMemberPickerProps = {
  members: Member[];
  value?: string[];
  onChange?: (value: string[]) => void;
};

export function SearchableMemberPicker({
  members,
  value = [],
  onChange,
}: SearchableMemberPickerProps) {
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const visibleMembers = members.filter((member) => {
    if (!query) return true;
    const searchable = [
      memberName(member),
      member.telephone || "",
      member.email || "",
      ...(member.programs || []),
    ].join(" ").toLowerCase();
    return searchable.includes(query);
  });

  function toggle(memberId: string, checked: boolean) {
    const selected = new Set((value || []).map(String));
    if (checked) selected.add(memberId);
    else selected.delete(memberId);
    onChange?.([...selected]);
  }

  return (
    <div className="searchable-member-picker">
      <Input.Search
        allowClear
        placeholder="Search members"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <div className="searchable-member-list">
        {visibleMembers.map((member) => (
          <Checkbox
            key={member._id}
            checked={(value || []).map(String).includes(member._id)}
            onChange={(event) => toggle(member._id, event.target.checked)}
          >
            {memberName(member)}
          </Checkbox>
        ))}
        {visibleMembers.length === 0 ? <span className="muted">No matching members.</span> : null}
      </div>
    </div>
  );
}
