export const RELATIONSHIP_TYPES = ['SPOUSE','PARENT','CHILD','SIBLING','IN_LAW','OTHER'] as const;
export type RelationshipType = typeof RELATIONSHIP_TYPES[number];
export const CONNECTION_TYPES = ['PREFER_TOGETHER','STRONG_CONNECTION','AVOID'] as const;
export type ConnectionType = typeof CONNECTION_TYPES[number];
export const GROUP_TYPES = ['CLASS','FRIENDS','AGE_GROUP','FAMILY','YOUTH','OTHER'] as const;
export type GroupType = typeof GROUP_TYPES[number];
export const EVENT_TYPES = ['HOLIDAY_MEAL','AGE_GROUP','COMMUNITY','OTHER'] as const;
export type EventType = typeof EVENT_TYPES[number];
export const PROGRAM_OPTIONS = [
  'Babies 1-5',
  'Kids: 6-12',
  'Teens 13-17',
  'Young adults 18-30',
  "Women's club 20-40",
  "Middle women's club 40-65",
  'Elderly women 65+',
  'Regular Minyan',
  'Sometimes Minyan',
  'Potential Minyan',
  'Men 20-40',
  'Need of packages delivered',
  'Need of visitation',
] as const;
export type ProgramOption = typeof PROGRAM_OPTIONS[number];
export interface MemberSummary { _id:string; firstName:string; surname:string; telephone?:string; birthday?:string; }
