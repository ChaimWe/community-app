export const RELATIONSHIP_TYPES = ['SPOUSE','PARENT','CHILD','SIBLING','IN_LAW','OTHER'] as const;
export type RelationshipType = typeof RELATIONSHIP_TYPES[number];
export const CONNECTION_TYPES = ['PREFER_TOGETHER','STRONG_CONNECTION','AVOID'] as const;
export type ConnectionType = typeof CONNECTION_TYPES[number];
export const GROUP_TYPES = ['CLASS','FRIENDS','AGE_GROUP','FAMILY','YOUTH','OTHER'] as const;
export type GroupType = typeof GROUP_TYPES[number];
export const EVENT_TYPES = ['HOLIDAY_MEAL','AGE_GROUP','COMMUNITY','OTHER'] as const;
export type EventType = typeof EVENT_TYPES[number];
export interface MemberSummary { _id:string; firstName:string; surname:string; telephone?:string; birthday?:string; }
