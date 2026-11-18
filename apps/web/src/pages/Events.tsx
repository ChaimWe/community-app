import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Checkbox, DatePicker, Form, Input, InputNumber, Modal, Select, Skeleton, message } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useCreateEvent, useEvents, useGenerateSeating, useMembers, useUpdateEvent } from "../api/hooks";
import { PageHeader } from "../components/PageHeader";
import { SeatingMap } from "../features/seating/SeatingMap";
import { EVENT_TYPE_LABELS, memberName } from "../lib/labels";

const eventTypes = Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => ({ value, label }));

export function Events() {
  const events = useEvents();
  const members = useMembers();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const generateSeating = useGenerateSeating();
  const [open, setOpen] = useState(false);

  const memberOptions = (members.data || []).map((member) => ({
    value: member._id,
    label: memberName(member),
  }));

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
      {events.isLoading ? (
        <Skeleton active />
      ) : events.data?.length ? (
        <div className="stack">
          {events.data.map((event) => {
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
                </header>
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
                  <div className="attendance-list">
                    {(members.data || []).map((member) => {
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
                              updateEvent.mutate({ id: event._id, data: { attendeeIds } });
                            }}
                          />
                          <span>{memberName(member)}</span>
                          <small>{coming ? "Coming" : "Not marked"}</small>
                        </label>
                      );
                    })}
                  </div>
                </section>
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
      <Modal title="New event" open={open} footer={null} onCancel={() => setOpen(false)} destroyOnClose width={560}>
        <Form
          layout="vertical"
          requiredMark={false}
          initialValues={{ tableConfigurations: [{ name: "Table 1", capacity: 10 }] }}
          onFinish={async (values) => {
            await createEvent.mutateAsync({
              ...values,
              date: values.date.toISOString(),
              attendeeIds: values.attendeeIds || [],
            });
            message.success("Event created");
            setOpen(false);
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
            <Checkbox.Group
              className="attendance-create-list"
              options={(members.data || []).map((member) => ({
                label: memberName(member),
                value: member._id,
              }))}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={createEvent.isPending}>
            Create event
          </Button>
        </Form>
      </Modal>
    </section>
  );
}
