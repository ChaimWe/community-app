import { Button, Input, Select, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/client";
import { Member, SeatingPlan, SeatingTable } from "../../api/types";
import { asId, memberInitials, memberName, PROGRAM_OPTIONS } from "../../lib/labels";

export function SeatingMap({
  eventId,
  plan,
  members,
  attendeeIds,
  onSaved,
}: {
  eventId: string;
  plan: SeatingPlan;
  members: Member[];
  attendeeIds: string[];
  onSaved: () => void;
}) {
  const [tables, setTables] = useState<SeatingTable[]>(() =>
    (plan.tables || []).map((table) => ({ ...table, memberIds: (table.memberIds || []).map(asId) })),
  );
  const [dragged, setDragged] = useState<{ id: string; from: number | null } | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [guestSearch, setGuestSearch] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<{ id: string; from: number | null } | null>(null);
  const names = useMemo(() => new Map(members.map((member) => [member._id, memberName(member)])), [members]);

  useEffect(() => {
    setTables((plan.tables || []).map((table) => ({ ...table, memberIds: (table.memberIds || []).map(asId) })));
  }, [plan]);

  const seatedIds = useMemo(() => new Set(tables.flatMap((table) => table.memberIds)), [tables]);
  const attendeeSet = useMemo(() => new Set(attendeeIds.map(asId)), [attendeeIds]);
  const memberById = useMemo(() => new Map(members.map((member) => [member._id, member])), [members]);

  const visibleUnseated = useMemo(() => {
    const search = guestSearch.trim().toLowerCase();
    return members.filter((member) => {
      const id = asId(member._id);
      if (!attendeeSet.has(id) || seatedIds.has(id)) return false;
      const name = memberName(member).toLowerCase();
      if (search && !name.includes(search)) return false;
      if (programFilter && !(member.programs || []).includes(programFilter)) return false;
      return true;
    });
  }, [members, attendeeSet, seatedIds, guestSearch, programFilter]);

  function matchesFilters(memberId: string) {
    const member = memberById.get(memberId);
    if (!member) return true;
    const search = guestSearch.trim().toLowerCase();
    if (search && !memberName(member).toLowerCase().includes(search)) return false;
    if (programFilter && !(member.programs || []).includes(programFilter)) return false;
    return true;
  }

  function drop(to: number | null) {
    if (!dragged) return;
    setOver(null);

    const next = tables.map((table) => ({ ...table, memberIds: [...(table.memberIds || [])] }));

    if (dragged.from !== null) {
      const index = next[dragged.from].memberIds.indexOf(dragged.id);
      if (index >= 0) next[dragged.from].memberIds.splice(index, 1);
    }

    if (to !== null) {
      if (next[to].memberIds.length >= next[to].capacity) {
        if (dragged.from !== null) {
          const index = next[dragged.from].memberIds.indexOf(dragged.id);
          if (index < 0) next[dragged.from].memberIds.push(dragged.id);
        }
        message.warning("That table is full");
        setDragged(null);
        return;
      }
      next[to].memberIds.push(dragged.id);
    }

    setTables(next);
    setDragged(null);
  }

  function moveSelectedGuest(to: number | null) {
    if (!selectedGuest) return;

    const next = tables.map((table) => ({ ...table, memberIds: [...(table.memberIds || [])] }));

    if (selectedGuest.from !== null) {
      const index = next[selectedGuest.from].memberIds.indexOf(selectedGuest.id);
      if (index >= 0) next[selectedGuest.from].memberIds.splice(index, 1);
    }

    if (to !== null) {
      if (next[to].memberIds.length >= next[to].capacity) {
        if (selectedGuest.from !== null) {
          const oldIndex = next[selectedGuest.from].memberIds.indexOf(selectedGuest.id);
          if (oldIndex < 0) next[selectedGuest.from].memberIds.push(selectedGuest.id);
        }
        message.warning("That table is full");
        setSelectedGuest(null);
        return;
      }
      next[to].memberIds.push(selectedGuest.id);
    }

    setTables(next);
    setSelectedGuest(null);
  }

  async function save() {
    setSaving(true);
    try {
      await api.patch(`/events/${eventId}/seating/${plan._id}`, {
        tables,
        lockedMemberIds: plan.lockedMemberIds,
        score: plan.score,
      });
      message.success("Seating saved");
      onSaved();
    } catch {
      message.error("Could not save seating");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {selectedGuest ? (
        <div className="mobile-seat-selection">
          <strong>Place {names.get(selectedGuest.id) || "selected guest"}</strong>
          <Button size="small" onClick={() => moveSelectedGuest(null)}>Move to unseated</Button>
          <Button size="small" onClick={() => setSelectedGuest(null)}>Cancel</Button>
        </div>
      ) : null}
      <div className="seating-filter-bar">
        <Input.Search
          allowClear
          placeholder="Filter guests by name"
          value={guestSearch}
          onChange={(event) => setGuestSearch(event.target.value)}
        />
        <Select
          allowClear
          placeholder="Filter by program"
          value={programFilter || undefined}
          onChange={(value) => setProgramFilter(value || "")}
          options={PROGRAM_OPTIONS.map((value) => ({ value, label: value }))}
        />
      </div>

      <section
        className={over === -1 ? "unseated-pool is-over" : "unseated-pool"}
        onDragOver={(event) => {
          event.preventDefault();
          setOver(-1);
        }}
        onDragLeave={() => setOver((current) => (current === -1 ? null : current))}
        onDrop={() => drop(null)}
      >
        <header>
          <strong>Unseated guests</strong>
          <span>{visibleUnseated.length} shown</span>
        </header>
        <div className="pool-seats">
          {visibleUnseated.map((member) => {
            const id = asId(member._id);
            const name = memberName(member);
            return (
              <button
                key={id}
                type="button"
                className={selectedGuest?.id === id ? "seat is-selected" : "seat"}
                draggable
                onDragStart={() => setDragged({ id, from: null })}
                onDragEnd={() => {
                  setDragged(null);
                  setOver(null);
                }}
                onClick={() => setSelectedGuest({ id, from: null })}
              >
                <span>{memberInitials(name)}</span>
                {name}
              </button>
            );
          })}
          {visibleUnseated.length === 0 ? <em>No matching unseated guests</em> : null}
        </div>
      </section>

      <div className="plan-actions">
        <p>Drag filtered guests into seats or move them back to the unseated pool.</p>
        <Button type="primary" onClick={save} loading={saving}>
          Save seating
        </Button>
      </div>

      <div className="tables">
        {tables.map((table, index) => (
          <section
            key={table._id || table.name}
            className={over === index ? "table-card is-over" : "table-card"}
            onDragOver={(event) => {
              event.preventDefault();
              setOver(index);
            }}
            onDragLeave={() => setOver((current) => (current === index ? null : current))}
            onDrop={() => drop(index)}
            onClick={(event) => {
              if ((event.target as HTMLElement).closest("button.seat")) return;
              moveSelectedGuest(index);
            }}
          >
            <header>
              <strong>{table.name}</strong>
              <span>
                {table.memberIds.length}/{table.capacity}
              </span>
            </header>
            <div className="seats">
              {table.memberIds.length === 0 ? <em>Empty table</em> : null}
              {table.memberIds.filter(matchesFilters).map((id) => {
                const name = names.get(id) || "Unknown guest";
                return (
                  <button
                    key={id}
                    type="button"
                    className={selectedGuest?.id === id ? "seat is-selected" : "seat"}
                    draggable
                    onDragStart={() => setDragged({ id, from: index })}
                    onDragEnd={() => {
                      setDragged(null);
                      setOver(null);
                    }}
                    onClick={() => setSelectedGuest({ id, from: index })}
                  >
                    <span>{memberInitials(name)}</span>
                    {name}
                  </button>
                );
              })}
              {table.memberIds.length > 0 && table.memberIds.filter(matchesFilters).length === 0 ? (
                <em>No matching guests at this table</em>
              ) : null}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
