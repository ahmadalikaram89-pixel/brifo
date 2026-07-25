import type { LetterAnalysis } from './analysis';

export const CHILD_COLORS = ['#2563eb', '#d97706', '#059669', '#db2777', '#7c3aed', '#dc2626'] as const;

export type FamilyMemberType = 'child' | 'adult';

export interface Child {
  id: string;
  name: string;
  type: FamilyMemberType;
  schoolClass: string;
  school?: string;
  color: string;
  consentGiven: boolean;
  consentDate: string;
  createdAt: string;
}

/** Special pseudo-id for letters/events that apply to the whole family rather than one child. */
export const ALL_CHILDREN = 'all' as const;

export interface LetterPhoto {
  base64: string;
  mediaType: 'image/jpeg';
}

export interface StoredLetter {
  id: string;
  childId: string;
  createdAt: string;
  analysis: LetterAnalysis;
  /** Local-only: kept out of the cloud-sync payload (see DataContext's
   * syncToCloud call) because the backup API caps total payload size and
   * photos would blow that budget after a handful of letters. Present in
   * localStorage and in manual JSON export/import. */
  photo?: LetterPhoto;
}

export interface Payment {
  id: string;
  childId: string;
  amount: number;
  currency: string;
  reason: string;
  dueDate: string;
  paid: boolean;
  letterId?: string;
  createdAt: string;
  updatedAt: string;
}

export type CalendarEventSource = 'letter' | 'payment' | 'manual';

export interface CalendarEvent {
  id: string;
  childId: string;
  title: string;
  date: string;
  source: CalendarEventSource;
  createdAt: string;
  updatedAt: string;
}

export interface TodoItem {
  id: string;
  childId: string;
  title: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  /** YYYY-MM-DD. Optional — when set, the todo joins the same reminder
   * pipeline (foreground fallback + push) as calendar events. */
  dueDate?: string;
}

export interface AppRating {
  stars: number;
  comment: string;
  updatedAt: string;
}

/** Records a deletion so that merging in a stale copy from another device
 * (see lib/mergeState.ts) removes the item again instead of resurrecting it. */
export interface Tombstone {
  id: string;
  deletedAt: string;
}
