import type { LetterAnalysis } from './analysis';

export const CHILD_COLORS = ['#3b82f6', '#f59e0b', '#34d399', '#f472b6', '#a78bfa', '#f87171'] as const;

export interface Child {
  id: string;
  name: string;
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
