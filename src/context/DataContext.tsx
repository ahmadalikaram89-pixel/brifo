import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { CHILD_COLORS, type Child, type CalendarEvent, type Payment, type StoredLetter } from '../types/data';
import type { LetterAnalysis } from '../types/analysis';

const STORAGE_KEY = 'brifo_data';

interface StoredState {
  children: Child[];
  letters: StoredLetter[];
  payments: Payment[];
  events: CalendarEvent[];
}

function loadInitialState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { children: [], letters: [], payments: [], events: [] };
    const parsed = JSON.parse(raw);
    return {
      children: parsed.children ?? [],
      letters: parsed.letters ?? [],
      payments: parsed.payments ?? [],
      events: parsed.events ?? [],
    };
  } catch {
    return { children: [], letters: [], payments: [], events: [] };
  }
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalize(s: string): string {
  return s.trim().toLowerCase().normalize('NFKD');
}

export function findMatchingChild(children: Child[], name: string | null, schoolClass: string | null): Child | null {
  if (!name && !schoolClass) return null;
  const normName = name ? normalize(name) : null;
  const normClass = schoolClass ? normalize(schoolClass) : null;

  const candidates = children.filter((c) => {
    const cName = normalize(c.name);
    const nameMatches = normName ? cName.includes(normName) || normName.includes(cName) : false;
    const classMatches = normClass ? normalize(c.schoolClass) === normClass : false;
    return nameMatches || classMatches;
  });

  if (candidates.length === 1) return candidates[0];

  if (candidates.length > 1 && normName && normClass) {
    const both = candidates.filter(
      (c) => normalize(c.name).includes(normName) && normalize(c.schoolClass) === normClass,
    );
    if (both.length === 1) return both[0];
  }

  return null;
}

interface NewChildInput {
  name: string;
  schoolClass: string;
  school?: string;
  consentGiven: boolean;
}

interface DataContextValue {
  children: Child[];
  letters: StoredLetter[];
  payments: Payment[];
  events: CalendarEvent[];
  addChild: (input: NewChildInput) => Child;
  deleteChild: (childId: string) => void;
  addLetter: (childId: string, analysis: LetterAnalysis) => StoredLetter;
  markPaymentPaid: (paymentId: string, paid: boolean) => void;
  addManualEvent: (childId: string, title: string, date: string) => CalendarEvent;
  lettersForChild: (childId: string) => StoredLetter[];
  paymentsForChild: (childId: string) => Payment[];
  eventsForChild: (childId: string) => CalendarEvent[];
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children: reactChildren }: { children: ReactNode }) {
  const [state, setState] = useState<StoredState>(loadInitialState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  function addChild(input: NewChildInput): Child {
    const child: Child = {
      id: makeId(),
      name: input.name,
      schoolClass: input.schoolClass,
      school: input.school,
      color: CHILD_COLORS[state.children.length % CHILD_COLORS.length],
      consentGiven: input.consentGiven,
      consentDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, children: [...prev.children, child] }));
    return child;
  }

  function deleteChild(childId: string) {
    setState((prev) => ({
      children: prev.children.filter((c) => c.id !== childId),
      letters: prev.letters.filter((l) => l.childId !== childId),
      payments: prev.payments.filter((p) => p.childId !== childId),
      events: prev.events.filter((e) => e.childId !== childId),
    }));
  }

  function addLetter(childId: string, analysis: LetterAnalysis): StoredLetter {
    const letter: StoredLetter = {
      id: makeId(),
      childId,
      createdAt: new Date().toISOString(),
      analysis,
    };

    const newPayments: Payment[] = analysis.payments.map((p) => ({
      id: makeId(),
      childId,
      amount: p.amount,
      currency: p.currency || 'EUR',
      reason: p.reason,
      dueDate: p.due_date,
      paid: false,
      letterId: letter.id,
      createdAt: new Date().toISOString(),
    }));

    const deadlineEvents: CalendarEvent[] = analysis.deadlines.map((d) => ({
      id: makeId(),
      childId,
      title: d.what,
      date: d.date,
      source: 'letter',
      createdAt: new Date().toISOString(),
    }));

    const paymentEvents: CalendarEvent[] = newPayments.map((p) => ({
      id: makeId(),
      childId,
      title: p.reason,
      date: p.dueDate,
      source: 'payment',
      createdAt: new Date().toISOString(),
    }));

    setState((prev) => ({
      ...prev,
      letters: [...prev.letters, letter],
      payments: [...prev.payments, ...newPayments],
      events: [...prev.events, ...deadlineEvents, ...paymentEvents],
    }));

    return letter;
  }

  function markPaymentPaid(paymentId: string, paid: boolean) {
    setState((prev) => ({
      ...prev,
      payments: prev.payments.map((p) => (p.id === paymentId ? { ...p, paid } : p)),
    }));
  }

  function addManualEvent(childId: string, title: string, date: string): CalendarEvent {
    const event: CalendarEvent = {
      id: makeId(),
      childId,
      title,
      date,
      source: 'manual',
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, events: [...prev.events, event] }));
    return event;
  }

  const lettersForChild = (childId: string) => state.letters.filter((l) => l.childId === childId);
  const paymentsForChild = (childId: string) => state.payments.filter((p) => p.childId === childId);
  const eventsForChild = (childId: string) => state.events.filter((e) => e.childId === childId);

  return (
    <DataContext.Provider
      value={{
        children: state.children,
        letters: state.letters,
        payments: state.payments,
        events: state.events,
        addChild,
        deleteChild,
        addLetter,
        markPaymentPaid,
        addManualEvent,
        lettersForChild,
        paymentsForChild,
        eventsForChild,
      }}
    >
      {reactChildren}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
