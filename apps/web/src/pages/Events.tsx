import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Checkbox, DatePicker, Form, Input, InputNumber, Modal, Popconfirm, Select, Skeleton, Switch, message } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import {
  useArchiveEvent,
  useCreateEvent,
  useDeleteEvent,
  useEvents,
  useGenerateSeating,
  useMembers,
  useRestoreEvent,
  useUpdateEvent,
} from "../api/hooks";
import { useSession } from "../api/session";
import { CommunityEvent, Member } from "../api/types";
import { PageHeader } from "../components/PageHeader";
import { SeatingMap } from "../features/seating/SeatingMap";
import { SearchableMemberPicker } from "../features/members/SearchableMemberPicker";
import { SearchableGuestPicker } from "../features/members/SearchableGuestPicker";
import { GuestList } from "../features/members/GuestList";
import { EVENT_TYPE_LABELS, memberName } from "../lib/labels";

const eventTypes = Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => ({ value, label }));

function AttendanceMemberList({
  event,
  members,
  onToggle,
}: {
  event: CommunityEvent;
  members: Member[];
  onToggle: (eventId: string, attendeeIds: string[]) => void;
}) {
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

  return (
    <div className="attendance-searchable">
      <Input.Search
        allowClear
        placeholder="Search members"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <div className="attendance-list">
        {visibleMembers.map((member) => {
          const memberId = String(member._id);
          const coming = (event.attendeeIds || []).map(String).includes(memberId);
          return (
            <label className="attendance-member" key={memberId}>
              <Checkbox
                checked={coming}
                onChange={(change) => {
                  const current = (event.attendeeIds || []).map(String);
                  const attendeeIds = change.target.checked
                    ? [...current, memberId]
                    : current.filter((id) => id !== memberId);
                  onToggle(event._id, attendeeIds);
                }}
              />
              <span>{memberName(member)}</span>
              <small>{coming ? "Coming" : "Not marked"}</small>
            </label>
          );
        })}
        {visibleMembers.length === 0 ? <span className="muted attendance-empty">No matching members.</span> : null}
      </div>
    </div>
  );
}

export function Events() {
  const [includeArchived, setIncludeArchived] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [editEvent, setEditEvent] = useState<CommunityEvent | null>(null);
  const session = useSession();
  const isAdmin = Boolean(session.data?.isAdmin);
  const events = useEvents(isAdmin && includeArchived);
  const activeEvents = (events.data || []).filter((event) => !event.archived);
  const archivedEvents = isAdmin ? (events.data || []).filter((event) => event.archived) : [];
  const members = useMembers();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const generateSeating = useGenerateSeating();
  const archiveEvent = useArchiveEvent();
  const restoreEvent = useRestoreEvent();
  const deleteEvent = useDeleteEvent();
  const [open, setOpen] = useState(false);

  return (
    <section className="page">
      <PageHeader
        eyebrow="Gatherings"
        title="Events"
        text="Invite guests, then arrange them around the tables."
        action={
          <Button type="primary" onClick={() => setOpen(true)}>
            New event
          </Button>
        }
      />
      {isAdmin ? (
        <div className="event-view-options">
          <span>Include archived events</span>
          <Switch checked={includeArchived} onChange={setIncludeArchived} />
        </div>
      ) : null}
      <section className="event-guests">
        <GuestList hosts={members.data || []} readOnly={!isAdmin && session.data?.permission !== "edit"} />
      </section>
      {events.isLoading ? (
        <Skeleton active />
      ) : activeEvents.length ? (
        <div className="stack">
          {activeEvents.map((event) => {
            const plan = event.seatingPlans?.[event.seatingPlans.length - 1];
            return (
              <article key={event._id} className="event-card">
                <header>
                  <div>
                    <span className="pill">{EVENT_TYPE_LABELS[event.type] || event.type}</span>
                    <h2>{event.name}</h2>
                    <p>{event.description || "No description yet."}</p>
                  </div>
                  <time>{dayjs(event.date).format("ddd D MMM YYYY · h:mm A")}</time>
                  <Button
                    type="text"
                    aria-expanded={expandedEventId === event._id}
                    onClick={() => setExpandedEventId((current) => current === event._id ? null : event._id)}
                  >
                    {expandedEventId === event._id ? "Hide details" : "Open event"}
                  </Button>
                </header>
                <div className={`event-details ${expandedEventId === event._id ? "expanded" : ""}`}>
                {!session.data?.isAdmin && session.data?.permission !== "edit" ? null : (
                  <div className="event-card-actions">
                    <Button onClick={() => setEditEvent(event)}>Edit event</Button>
                    <Popconfirm
                      title="Archive this event?"
                      description="It will leave the active event list."
                      onConfirm={async () => {
                        await archiveEvent.mutateAsync(event._id);
                        message.success("Event archived");
                      }}
                    >
                      <Button>Archive</Button>
                    </Popconfirm>
                    {session.data?.isAdmin ? (
                      <Popconfirm
                        title="Permanently delete this event?"
                        description="This cannot be undone."
                        okText="Delete permanently"
                        okButtonProps={{ danger: true }}
                        onConfirm={async () => {
                          await deleteEvent.mutateAsync(event._id);
                          message.success("Event permanently deleted");
                        }}
                      >
                        <Button danger>Delete permanently</Button>
                      </Popconfirm>
                    ) : null}
                  </div>
                )}
                <div className="event-meta">
                  <span>
                    {event.tableConfigurations?.length
                      ? event.tableConfigurations.map((table) => `${table.name}: ${table.capacity}`).join(" · ")
                      : `${event.tableCount} tables · ${event.tableCapacity} seats per table`}
                  </span>
                  <span>{event.attendeeIds?.length || 0} guests</span>
                </div>
                {plan ? (
                  <div className="plan">
                    <div className="plan-head">
                      <div>
                        <strong>{plan.name}</strong>
                        <span>Score {plan.score}</span>
                      </div>
                      <Button
                        onClick={async () => {
                          await generateSeating.mutateAsync(event._id);
                          message.success("New seating generated");
                        }}
                        loading={generateSeating.isPending}
                      >
                        Generate again
                      </Button>
                    </div>
                    <SeatingMap
                      eventId={event._id}
                      plan={plan}
                      members={members.data || []}
                      attendeeIds={event.attendeeIds || []}
                      onSaved={() => events.refetch()}
                    />
                  </div>
                ) : (
                  <div className="plan-empty">
                    <p>No seating plan yet. Add guests, then generate a first arrangement.</p>
                    <Button
                      type="primary"
                      disabled={!event.attendeeIds?.length}
                      loading={generateSeating.isPending}
                      onClick={async () => {
                        await generateSeating.mutateAsync(event._id);
                        message.success("Seating generated");
                      }}
                    >
                      Generate seating
                    </Button>
                  </div>
                )}
                <section className="event-attendance">
                  <div className="event-attendance-header">
                    <strong>Who is coming?</strong>
                    <span>{event.attendeeIds?.length || 0} of {(members.data || []).length} members marked coming</span>
                  </div>
                  <AttendanceMemberList
                    event={event}
                    members={members.data || []}
                    onToggle={(eventId, attendeeIds) => updateEvent.mutate({ id: eventId, data: { attendeeIds } })}
                  />
                </section>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="panel empty">
          <h2>No events yet</h2>
          <p>Create a meal or gathering, choose who is coming, and lay out the tables.</p>
        </div>
      )}
      <Modal
        title={editEvent ? "Edit event" : "New event"}
        open={open}
        footer={null}
        onCancel={() => {
          setOpen(false);
          setEditEvent(null);
        }}
        destroyOnClose
        width={560}
      >
        <Form
          layout="vertical"
          requiredMark={false}
          initialValues={{
            tableConfigurations: [{ name: "Table 1", capacity: 10 }],
            ...(editEvent ? { ...editEvent, date: dayjs(editEvent.date) } : {}),
          }}
          onFinish={async (values) => {
            if (editEvent) {
              await updateEvent.mutateAsync({
                id: editEvent._id,
                data: {
                  ...values,
                  date: values.date.toISOString(),
                  attendeeIds: values.attendeeIds || [],
                  guestIds: values.guestIds || [],
                },
              });
              message.success("Event updated");
            } else {
              await createEvent.mutateAsync({
                ...values,
                date: values.date.toISOString(),
                attendeeIds: values.attendeeIds || [],
                guestIds: values.guestIds || [],
              });
              message.success("Event created");
            }
            setOpen(false);
            setEditEvent(null);
          }}
        >
          <Form.Item name="name" label="Name" rules={[{ required: true, message: "Name the event" }]}>
            <Input placeholder="Friday night meal" />
          </Form.Item>
          <Form.Item name="type" label="Type" rules={[{ required: true, message: "Choose a type" }]}>
            <Select options={eventTypes} placeholder="Choose a type" />
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true, message: "Pick a date" }]}>
            <DatePicker showTime className="full" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Optional note" />
          </Form.Item>
          <Form.Item label="Tables">
            <Form.List name="tableConfigurations" initialValue={[{ name: "Table 1", capacity: 10 }]}>
              {(fields, actions) => (
                <div className="table-config-list">
                  {fields.map((field, index) => (
                    <div className="table-config-row" key={field.key}>
                      <Form.Item
                        name={[field.name, "name"]}
                        label={index === 0 ? "Table name" : undefined}
                        rules={[{ required: true, message: "Name this table" }]}
                      >
                        <Input placeholder={`Table ${index + 1}`} />
                      </Form.Item>
                      <Form.Item
                        name={[field.name, "capacity"]}
                        label={index === 0 ? "Seats" : undefined}
                        rules={[{ required: true, message: "Enter seats" }]}
                      >
                        <InputNumber min={1} className="full" />
                      </Form.Item>
                      {fields.length > 1 ? (
                        <Button
                          type="text"
                          danger
                          icon={<MinusCircleOutlined />}
                          aria-label={`Remove table ${index + 1}`}
                          onClick={() => actions.remove(field.name)}
                        />
                      ) : null}
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    block
                    icon={<PlusOutlined />}
                    onClick={() => actions.add({ name: `Table ${fields.length + 1}`, capacity: 10 })}
                  >
                    Add table
                  </Button>
                </div>
              )}
            </Form.List>
          </Form.Item>
          <Form.Item name="attendeeIds" label="Who is coming?">
            <SearchableMemberPicker members={members.data || []} />
          </Form.Item>
          <Form.Item name="guestIds" label="Guests">
            <SearchableGuestPicker />
          </Form.Item>
          <div className="sheet-form-actions">
            <Button type="primary" htmlType="submit" block loading={createEvent.isPending}>
              Create event
            </Button>
          </div>
        </Form>
      </Modal>
      <Modal
        title={editEvent ? `Edit ${editEvent.name}` : "Edit event"}
        open={Boolean(editEvent)}
        footer={null}
        onCancel={() => setEditEvent(null)}
        destroyOnClose
        width={560}
      >
        {editEvent ? (
          <Form
            layout="vertical"
            requiredMark={false}
            initialValues={{
              name: editEvent.name,
              type: editEvent.type,
              date: dayjs(editEvent.date),
              description: editEvent.description,
              tableConfigurations: editEvent.tableConfigurations?.length
                ? editEvent.tableConfigurations
                : (Array.from({ length: editEvent.tableCount || 1 }, (_, index) => ({
                    name: `Table ${index + 1}`,
                    capacity: editEvent.tableCapacity || 10,
                  }))),
              attendeeIds: editEvent.attendeeIds || [],
              guestIds: editEvent.guestIds || [],
            }}
            onFinish={async (values) => {
              await updateEvent.mutateAsync({
                id: editEvent._id,
                data: {
                  ...values,
                  date: values.date.toISOString(),
                  attendeeIds: values.attendeeIds || [],
                  guestIds: values.guestIds || [],
                },
              });
              message.success("Event updated");
              setEditEvent(null);
            }}
          >
            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="type" label="Type" rules={[{ required: true }]}>
              <Select options={eventTypes} />
            </Form.Item>
            <Form.Item name="date" label="Date" rules={[{ required: true }]}>
              <DatePicker showTime className="full" />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item label="Tables">
              <Form.List name="tableConfigurations">
                {(fields, actions) => (
                  <div className="table-config-list">
                    {fields.map((field, index) => (
                      <div className="table-config-row" key={field.key}>
                        <Form.Item
                          name={[field.name, "name"]}
                          label={index === 0 ? "Table name" : undefined}
                          rules={[{ required: true }]}
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item
                          name={[field.name, "capacity"]}
                          label={index === 0 ? "Seats" : undefined}
                          rules={[{ required: true }]}
                        >
                          <InputNumber min={1} className="full" />
                        </Form.Item>
                        {fields.length > 1 ? (
                          <Button
                            type="text"
                            danger
                            icon={<MinusCircleOutlined />}
                            onClick={() => actions.remove(field.name)}
                          />
                        ) : null}
                      </div>
                    ))}
                    <Button
                      type="dashed"
                      block
                      icon={<PlusOutlined />}
                      onClick={() => actions.add({ name: `Table ${fields.length + 1}`, capacity: 10 })}
                    >
                      Add table
                    </Button>
                  </div>
                )}
              </Form.List>
            </Form.Item>
            <Form.Item name="attendeeIds" label="Who is coming?">
              <SearchableMemberPicker members={members.data || []} />
            </Form.Item>
            <div className="sheet-form-actions">
              <Button type="primary" htmlType="submit" block loading={updateEvent.isPending}>
                Save changes
              </Button>
            </div>
          </Form>
        ) : null}
      </Modal>
      {isAdmin && includeArchived ? (
        <section className="panel archived-events">
          <h2>Archived events</h2>
          {archivedEvents.length ? (
            <div className="stack">
              {archivedEvents.map((event) => (
                <article key={event._id} className="archived-event-row">
                  <div>
                    <strong>{event.name}</strong>
                    <span>{dayjs(event.date).format("ddd D MMM YYYY")}</span>
                  </div>
                  <div className="event-card-actions">
                    <Popconfirm
                      title="Unarchive this event?"
                      onConfirm={async () => {
                        await restoreEvent.mutateAsync(event._id);
                        message.success("Event unarchived");
                      }}
                    >
                      <Button type="primary">Unarchive</Button>
                    </Popconfirm>
                    <Popconfirm
                      title="Permanently delete this event?"
                      description="This cannot be undone."
                      okText="Delete permanently"
                      okButtonProps={{ danger: true }}
                      onConfirm={async () => {
                        await deleteEvent.mutateAsync(event._id);
                        message.success("Event permanently deleted");
                      }}
                    >
                      <Button danger>Delete</Button>
                    </Popconfirm>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="panel empty"><p>No archived events found.</p></div>
          )}
        </section>
      ) : null}
    </section>
  );
}
