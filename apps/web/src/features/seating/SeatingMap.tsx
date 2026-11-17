import { Button, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/client";
import { Member, SeatingPlan, SeatingTable } from "../../api/types";
import { asId, memberInitials, memberName } from "../../lib/labels";

export function SeatingMap({
  eventId,
  plan,
  members,
  onSaved,
}: {
  eventId: string;
  plan: SeatingPlan;
  members: Member[];
  onSaved: () => void;
}) {
  const [tables, setTables] = useState<SeatingTable[]>(() =>
    (plan.tables || []).map((table) => ({ ...table, memberIds: (table.memberIds || []).map(asId) })),
  );
  const [dragged, setDragged] = useState<{ id: string; from: number } | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const names = useMemo(() => new Map(members.map((member) => [member._id, memberName(member)])), [members]);

  useEffect(() => {
    setTables((plan.tables || []).map((table) => ({ ...table, memberIds: (table.memberIds || []).map(asId) })));
  }, [plan]);

  function drop(to: number) {
    if (!dragged) return;
    setOver(null);
    if (dragged.from === to) {
      setDragged(null);
      return;
    }
    const next = tables.map((table) => ({ ...table, memberIds: [...(table.memberIds || [])] }));
    if (next[to].memberIds.length >= next[to].capacity) {
      message.warning("That table is full");
      setDragged(null);
      return;
    }
    const fromIds = next[dragged.from].memberIds;
    const index = fromIds.indexOf(dragged.id);
    if (index >= 0) fromIds.splice(index, 1);
    next[to].memberIds.push(dragged.id);
    setTables(next);
    setDragged(null);
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
      <div className="plan-actions">
        <p>Drag a guest onto another table. A full table will not take another seat.</p>
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
          >
            <header>
              <strong>{table.name}</strong>
              <span>
                {table.memberIds.length}/{table.capacity}
              </span>
            </header>
            <div className="seats">
              {table.memberIds.length === 0 ? <em>Empty table</em> : null}
              {table.memberIds.map((id) => {
                const name = names.get(id) || "Unknown guest";
                return (
                  <button
                    key={id}
                    type="button"
                    className="seat"
                    draggable
                    onDragStart={() => setDragged({ id, from: index })}
                    onDragEnd={() => {
                      setDragged(null);
                      setOver(null);
                    }}
                  >
                    <span>{memberInitials(name)}</span>
                    {name}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
