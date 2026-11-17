import { CalendarOutlined, TeamOutlined, ApartmentOutlined } from "@ant-design/icons";
import { Skeleton } from "antd";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useEvents, useGroups, useMembers } from "../api/hooks";
import { PageHeader } from "../components/PageHeader";
import { EVENT_TYPE_LABELS } from "../lib/labels";

export function Dashboard() {
  const navigate = useNavigate();
  const members = useMembers();
  const groups = useGroups();
  const events = useEvents();
  const loading = members.isLoading || groups.isLoading || events.isLoading;
  const upcoming = [...(events.data || [])].sort((a, b) => +new Date(a.date) - +new Date(b.date)).slice(0, 4);

  return (
    <section className="page">
      <PageHeader
        eyebrow="Overview"
        title="Community at a glance"
        text="Members, groups, and the gatherings you are planning."
      />
      {loading ? (
        <Skeleton active />
      ) : (
        <>
          <div className="stat-grid">
            <button type="button" className="stat" onClick={() => navigate("/members")}>
              <TeamOutlined />
              <span>Members</span>
              <strong>{members.data?.length ?? 0}</strong>
            </button>
            <button type="button" className="stat" onClick={() => navigate("/groups")}>
              <ApartmentOutlined />
              <span>Groups</span>
              <strong>{groups.data?.length ?? 0}</strong>
            </button>
            <button type="button" className="stat" onClick={() => navigate("/events")}>
              <CalendarOutlined />
              <span>Events</span>
              <strong>{events.data?.length ?? 0}</strong>
            </button>
          </div>
          <div className="panel">
            <div className="panel-head">
              <h2>Coming up</h2>
              <button type="button" className="text-link" onClick={() => navigate("/events")}>
                All events
              </button>
            </div>
            {upcoming.length === 0 ? (
              <p className="muted">No events yet. Create one when you are ready to plan seating.</p>
            ) : (
              <ul className="agenda">
                {upcoming.map((event) => (
                  <li key={event._id}>
                    <div>
                      <strong>{event.name}</strong>
                      <span>{EVENT_TYPE_LABELS[event.type] || event.type}</span>
                    </div>
                    <time>{dayjs(event.date).format("D MMM YYYY · h:mm A")}</time>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </section>
  );
}
