import { Checkbox, Input, Spin, Empty } from "antd";
import { useState } from "react";
import { useGuests } from "../../api/guestHooks";

type SearchableGuestPickerProps = {
  value?: string[];
  onChange?: (value: string[]) => void;
};

export function SearchableGuestPicker({
  value = [],
  onChange,
}: SearchableGuestPickerProps) {
  const [search, setSearch] = useState("");
  const guests = useGuests(undefined, false);
  const query = search.trim().toLowerCase();
  
  const visibleGuests = (guests.data || []).filter((guest) => {
    if (!query) return true;
    const searchable = [
      guest.firstName,
      guest.surname,
      guest.telephone || "",
      guest.email || "",
      guest.comments || "",
    ].join(" ").toLowerCase();
    return searchable.includes(query);
  });

  function toggle(guestId: string, checked: boolean) {
    const selected = new Set((value || []).map(String));
    if (checked) selected.add(guestId);
    else selected.delete(guestId);
    onChange?.([...selected]);
  }

  if (guests.isLoading) return <Spin />;
  if (!guests.data || guests.data.length === 0) {
    return <Empty description="No guests yet. Add guests to members first." />;
  }

  return (
    <div className="searchable-guest-picker">
      <Input.Search
        allowClear
        placeholder="Search guests"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <div className="searchable-guest-list">
        {visibleGuests.map((guest) => (
          <Checkbox
            key={guest._id}
            checked={(value || []).map(String).includes(guest._id)}
            onChange={(event) => toggle(guest._id, event.target.checked)}
          >
            {guest.firstName} {guest.surname}
          </Checkbox>
        ))}
        {visibleGuests.length === 0 ? <span className="muted">No matching guests.</span> : null}
      </div>
    </div>
  );
}
