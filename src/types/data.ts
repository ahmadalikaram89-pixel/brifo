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

export interface StoredLetter {
  id: string;
  childId: string;
  createdAt: string;
  analysis: LetterAnalysis;
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
}

export type CalendarEventSource = 'letter' | 'payment' | 'manual';

export interface CalendarEvent {
  id: string;
  childId: string;
  title: string;
  date: string;
  source: CalendarEventSource;
  createdAt: string;
}

export interface TodoItem {
  id: string;
  childId: string;
  title: string;
  done: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface AppRating {
  stars: number;
  comment: string;
  updatedAt: string;
}
