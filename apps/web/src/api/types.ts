export interface Member {
  _id: string;
  firstName: string;
  surname: string;
  fatherName?: string;
  birthday?: string;
  gender?: string;
  telephone?: string;
  email?: string;
  address?: string;
  jewishStatus?: string;
  programs?: string[];
  comments?: string;
  comments2?: string;
  documentLocation?: string;
  archived?: boolean;
  archivedAt?: string;
}

export interface MemberInput {
  firstName?: string;
  surname?: string;
  fatherName?: string;
  birthday?: string;
  gender?: string;
  telephone?: string;
  email?: string;
  address?: string;
  jewishStatus?: string;
  programs?: string[];
  comments?: string;
  comments2?: string;
  documentLocation?: string;
  archived?: boolean;
}

export interface Group {
  _id: string;
  name: string;
  type: string;
  description?: string;
  memberIds?: string[];
  seatingMode?: "NONE" | "KEEP_TOGETHER" | "SPREAD";
}

export interface SeatingTable {
  _id?: string;
  name: string;
  capacity: number;
  memberIds: string[];
  lockedMemberIds?: string[];
}

export interface SeatingPlan {
  _id: string;
  name: string;
  score: number;
  tables: SeatingTable[];
  lockedMemberIds?: string[];
  isFinal?: boolean;
}

export interface CommunityEvent {
  _id: string;
  name: string;
  type: string;
  date: string;
  description?: string;
  attendeeIds?: string[];
  tableCount: number;
  tableCapacity: number;
  tableConfigurations?: Array<{ name: string; capacity: number }>;
  seatingPlans?: SeatingPlan[];
  archived?: boolean;
  archivedAt?: string;
}
