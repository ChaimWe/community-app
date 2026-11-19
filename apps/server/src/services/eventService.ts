import { Event } from "../models/Event";
import { Connection } from "../models/Connection";

export async function listEvents(includeArchived = false) {
  const filter = includeArchived ? {} : { archived: { $ne: true } };
  return Event.find(filter).sort({ date: -1 });
}

export async function createEvent(data: Record<string, unknown>) {
  return Event.create(data);
}

export async function updateEvent(id: string, data: Record<string, unknown>) {
  const event = await Event.findById(id);
  if (!event) return null;

  if (Array.isArray(data.attendeeIds)) {
    const attendeeIds = data.attendeeIds.map(String);
    const allowed = new Set(attendeeIds);
    for (const plan of event.seatingPlans) {
      for (const table of plan.tables) {
        table.memberIds = table.memberIds.filter((memberId) => allowed.has(String(memberId))) as never;
      }
    }
  }

  Object.assign(event, data);
  await event.save();
  return event;
}

export async function getEvent(id: string) {
  return Event.findById(id);
}

export async function generateSeating(eventId: string) {
  const event = await Event.findById(eventId);
  if (!event) throw Object.assign(new Error("Event not found"), { status: 404 });

  const ids = event.attendeeIds.map(String);
  const connections = await Connection.find({
    fromMemberId: { $in: event.attendeeIds },
    toMemberId: { $in: event.attendeeIds },
  });

  const scoreMap = new Map<string, number>();
  for (const connection of connections) {
    const from = String(connection.fromMemberId);
    const to = String(connection.toMemberId);
    scoreMap.set(`${from}:${to}`, connection.weight);
    scoreMap.set(`${to}:${from}`, connection.weight);
  }

  const capacity = event.tableCapacity || 10;
  const tableCount = event.tableCount || Math.ceil(ids.length / capacity);
  const configurations = event.tableConfigurations?.length
    ? event.tableConfigurations.map((table) => ({ name: table.name, capacity: table.capacity }))
    : Array.from({ length: tableCount }, (_, index) => ({ name: `Table ${index + 1}`, capacity }));
  const tables = configurations.map((table) => ({
    name: table.name,
    capacity: table.capacity,
    memberIds: [] as string[],
    lockedMemberIds: [] as string[],
  }));

  for (const id of ids) {
    let bestIndex = 0;
    let bestScore = -Infinity;
    tables.forEach((table, index) => {
      if (table.memberIds.length >= table.capacity) return;
      let pairScore = 0;
      for (const other of table.memberIds) {
        pairScore += scoreMap.get(`${id}:${other}`) || 0;
      }
      if (pairScore > bestScore) {
        bestScore = pairScore;
        bestIndex = index;
      }
    });
    tables[bestIndex].memberIds.push(id);
  }

  let score = 0;
  for (const table of tables) {
    for (let i = 0; i < table.memberIds.length; i += 1) {
      for (let j = i + 1; j < table.memberIds.length; j += 1) {
        score += scoreMap.get(`${table.memberIds[i]}:${table.memberIds[j]}`) || 0;
      }
    }
  }

  event.seatingPlans.push({
    name: `Generated ${new Date().toLocaleString()}`,
    score,
    tables,
    lockedMemberIds: [],
    isFinal: false,
  } as never);

  await event.save();
  return event;
}

export async function archiveEvent(id: string) {
  return Event.findByIdAndUpdate(id, { archived: true, archivedAt: new Date() }, { new: true });
}

export async function restoreEvent(id: string) {
  return Event.findByIdAndUpdate(id, { archived: false, archivedAt: null }, { new: true });
}

export async function deleteEvent(id: string) {
  return Event.findByIdAndDelete(id);
}
