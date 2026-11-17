import { Button, DatePicker, Form, Input, InputNumber, Modal, Select, Skeleton, message } from "antd";
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
                    {event.tableCount} tables · {event.tableCapacity} seats
                  </span>
                  <span>{event.attendeeIds?.length || 0} guests</span>
                </div>
                <Select
                  mode="multiple"
                  className="guest-select"
                  placeholder="Add guests"
                  options={memberOptions}
                  optionFilterProp="label"
                  value={event.attendeeIds || []}
                  onChange={(attendeeIds) => updateEvent.mutate({ id: event._id, data: { attendeeIds } })}
                />
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
                    <SeatingMap eventId={event._id} plan={plan} members={members.data || []} onSaved={() => events.refetch()} />
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
          initialValues={{ tableCount: 5, tableCapacity: 10 }}
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
          <div className="split">
            <Form.Item name="tableCount" label="Tables">
              <InputNumber min={1} className="full" />
            </Form.Item>
            <Form.Item name="tableCapacity" label="Seats per table">
              <InputNumber min={1} className="full" />
            </Form.Item>
          </div>
          <Form.Item name="attendeeIds" label="Guests">
            <Select mode="multiple" options={memberOptions} optionFilterProp="label" placeholder="Choose members" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={createEvent.isPending}>
            Create event
          </Button>
        </Form>
      </Modal>
    </section>
  );
}
