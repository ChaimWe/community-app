import { Event } from "../models/Event";
import { Connection } from "../models/Connection";
import { Group } from "../models/Group";
import { Member } from "../models/Member";
import { Guest } from "../models/Guest";

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

  if (Array.isArray(data.guestIds)) {
    const guestIds = data.guestIds.map(String);
    const allowed = new Set(guestIds);
    for (const plan of event.seatingPlans) {
      for (const table of plan.tables) {
        table.guestIds = table.guestIds.filter((guestId) => allowed.has(String(guestId))) as never;
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

  const memberIds = event.attendeeIds.map(String);
  const guestIds = event.guestIds.map(String);
  
  // Load all guests with their host member information
  const guests = await Guest.find({ _id: { $in: event.guestIds } }).populate("guestOf");
  
  // Create a map of guest ID to their host member ID
  const guestToHostMap = new Map<string, string>();
  for (const guest of guests) {
    if (guest.guestOf) {
      guestToHostMap.set(String(guest._id), String(guest.guestOf._id));
    }
  }

  const [connections, attendees, groups] = await Promise.all([
    Connection.find({
      fromMemberId: { $in: event.attendeeIds },
      toMemberId: { $in: event.attendeeIds },
    }),
    Member.find({ _id: { $in: event.attendeeIds } }).select("programs"),
    Group.find({ archived: { $ne: true }, memberIds: { $in: event.attendeeIds } }).select("name memberIds"),
  ]);

  const programsByMember = new Map(
    attendees.map((member) => [
      String(member._id),
      new Set((member.programs || []).map((program) => program.trim().toLowerCase())),
    ]),
  );
  const groupNamesByMember = new Map<string, Set<string>>();
  for (const group of groups) {
    for (const memberId of group.memberIds.map(String)) {
      if (!memberIds.includes(memberId)) continue;
      const names = groupNamesByMember.get(memberId) || new Set<string>();
      names.add(group.name.toLowerCase());
      groupNamesByMember.set(memberId, names);
    }
  }

  const hasProgram = (memberId: string, ...names: string[]) => {
    const programs = programsByMember.get(memberId);
    return names.some((name) => programs?.has(name));
  };
  const agePrograms = [
    "babies 1-5",
    "kids: 6-12",
    "kids 6-12",
    "teens 13-17",
    "young adults 18-30",
    "young adults",
    "women's club 20-40",
    "women's club",
    "young women's club",
    "young_womens_club",
    "middle women's club 40-65",
    "middle women's club",
    "elderly women 65+",
    "elderly women",
    "men 20-40",
  ];
  const hasAgeProgram = (memberId: string) => agePrograms.some((name) => hasProgram(memberId, name));
  const ageProgramsForMember = (memberId: string) =>
    new Set(agePrograms.filter((name) => hasProgram(memberId, name)));
  const priority = (memberId: string) => {
    if (hasProgram(memberId, "regular minyan")) return 0;
    if (groupNamesByMember.has(memberId)) return 1;
    if (hasAgeProgram(memberId)) return 2;
    return 3;
  };
  const originalOrder = new Map(memberIds.map((id, index) => [id, index]));
  memberIds.sort((left, right) => {
    const priorityDifference = priority(left) - priority(right);
    if (priorityDifference) return priorityDifference;
    const leftGroups = [...(groupNamesByMember.get(left) || [])].sort().join("|");
    const rightGroups = [...(groupNamesByMember.get(right) || [])].sort().join("|");
    return leftGroups.localeCompare(rightGroups) || (originalOrder.get(left) || 0) - (originalOrder.get(right) || 0);
  });

  const scoreMap = new Map<string, number>();
  for (const connection of connections) {
    const from = String(connection.fromMemberId);
    const to = String(connection.toMemberId);
    scoreMap.set(`${from}:${to}`, connection.weight);
    scoreMap.set(`${to}:${from}`, connection.weight);
  }

  const capacity = event.tableCapacity || 10;
  const tableCount = event.tableCount || Math.ceil((memberIds.length + guestIds.length) / capacity);
  const configurations = event.tableConfigurations?.length
    ? event.tableConfigurations.map((table) => ({ name: table.name, capacity: table.capacity }))
    : Array.from({ length: tableCount }, (_, index) => ({ name: `Table ${index + 1}`, capacity }));
  const tables = configurations.map((table) => ({
    name: table.name,
    capacity: table.capacity,
    memberIds: [] as string[],
    guestIds: [] as string[],
    lockedMemberIds: [] as string[],
    lockedGuestIds: [] as string[],
  }));

  const totalCapacity = tables.reduce((total, table) => total + table.capacity, 0);
  if (totalCapacity < memberIds.length + guestIds.length) {
    throw Object.assign(
      new Error(`The configured tables have ${totalCapacity} seats for ${memberIds.length + guestIds.length} attendees`),
      { status: 400 },
    );
  }

  // Place members first
  for (const id of memberIds) {
    let bestIndex = -1;
    let bestScore = -Infinity;
    tables.forEach((table, index) => {
      if (table.memberIds.length + table.guestIds.length >= table.capacity) return;
      let placementScore = 0;
      for (const other of table.memberIds) {
        placementScore += scoreMap.get(`${id}:${other}`) || 0;
        if (hasProgram(id, "regular minyan") && hasProgram(other, "regular minyan")) {
          placementScore += 1_000_000;
        }
        const ageProgramsForId = ageProgramsForMember(id);
        const ageProgramsForOther = ageProgramsForMember(other);
        if ([...ageProgramsForId].some((name) => ageProgramsForOther.has(name))) {
          placementScore += 100_000;
        }
        const groupsForId = groupNamesByMember.get(id);
        const groupsForOther = groupNamesByMember.get(other);
        if (groupsForId && groupsForOther) {
          for (const name of groupsForId) {
            if (groupsForOther.has(name)) placementScore += 10_000;
          }
        }
      }
      if (placementScore > bestScore) {
        bestScore = placementScore;
        bestIndex = index;
      }
    });
    if (bestIndex < 0) {
      throw Object.assign(new Error("No available table capacity for all attendees"), { status: 400 });
    }
    tables[bestIndex].memberIds.push(id);
  }

  // Place guests with their hosts (must be at same table)
  for (const guestId of guestIds) {
    const hostId = guestToHostMap.get(guestId);
    if (!hostId) {
      throw Object.assign(new Error(`Guest ${guestId} has no valid host member`), { status: 400 });
    }

    // Find the table where the host is seated
    let hostTableIndex = -1;
    for (let i = 0; i < tables.length; i++) {
      if (tables[i].memberIds.includes(hostId)) {
        hostTableIndex = i;
        break;
      }
    }

    if (hostTableIndex < 0) {
      throw Object.assign(new Error(`Host member ${hostId} not found in seating plan`), { status: 400 });
    }

    const hostTable = tables[hostTableIndex];
    if (hostTable.memberIds.length + hostTable.guestIds.length >= hostTable.capacity) {
      throw Object.assign(
        new Error(`No available seat at table with host ${hostId} for guest ${guestId}`),
        { status: 400 },
      );
    }

    hostTable.guestIds.push(guestId);
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
    lockedGuestIds: [],
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
