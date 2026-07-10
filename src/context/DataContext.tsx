import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  ALL_CHILDREN,
  CHILD_COLORS,
  type Child,
  type FamilyMemberType,
  type CalendarEvent,
  type Payment,
  type StoredLetter,
  type TodoItem,
  type AppRating,
} from '../types/data';
import type { LetterAnalysis } from '../types/analysis';

const STORAGE_KEY = 'brifo_data';

interface StoredState {
  children: Child[];
  letters: StoredLetter[];
  payments: Payment[];
  events: CalendarEvent[];
  todos: TodoItem[];
  rating: AppRating | null;
}

function loadInitialState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { children: [], letters: [], payments: [], events: [], todos: [], rating: null };
    const parsed = JSON.parse(raw);
    return {
      // Profiles saved before family members existed have no `type` — treat them as children.
      children: (parsed.children ?? []).map((c: Omit<Child, 'type'> & { type?: FamilyMemberType }) => ({
        ...c,
        type: c.type ?? 'child',
      })),
      letters: parsed.letters ?? [],
      payments: parsed.payments ?? [],
      events: parsed.events ?? [],
      todos: parsed.todos ?? [],
      rating: parsed.rating ?? null,
    };
  } catch {
    return { children: [], letters: [], payments: [], events: [], todos: [], rating: null };
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
  type: FamilyMemberType;
  schoolClass: string;
  school?: string;
  consentGiven: boolean;
}

interface DataContextValue {
  children: Child[];
  letters: StoredLetter[];
  payments: Payment[];
  events: CalendarEvent[];
  todos: TodoItem[];
  rating: AppRating | null;
  addChild: (input: NewChildInput) => Child;
  deleteChild: (childId: string) => void;
  addLetter: (childId: string, analysis: LetterAnalysis) => StoredLetter;
  markPaymentPaid: (paymentId: string, paid: boolean) => void;
  addManualEvent: (childId: string, title: string, date: string) => CalendarEvent;
  lettersForChild: (childId: string) => StoredLetter[];
  paymentsForChild: (childId: string) => Payment[];
  eventsForChild: (childId: string) => CalendarEvent[];
  addTodo: (childId: string, title: string) => TodoItem;
  toggleTodo: (todoId: string) => void;
  deleteTodo: (todoId: string) => void;
  submitRating: (stars: number, comment: string) => void;
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
      type: input.type,
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
      ...prev,
      children: prev.children.filter((c) => c.id !== childId),
      letters: prev.letters.filter((l) => l.childId !== childId),
      payments: prev.payments.filter((p) => p.childId !== childId),
      events: prev.events.filter((e) => e.childId !== childId),
      todos: prev.todos.filter((item) => item.childId !== childId),
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

  function addTodo(childId: string, title: string): TodoItem {
    const todo: TodoItem = {
      id: makeId(),
      childId,
      title,
      done: false,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, todos: [...prev.todos, todo] }));
    return todo;
  }

  function toggleTodo(todoId: string) {
    setState((prev) => ({
      ...prev,
      todos: prev.todos.map((item) =>
        item.id === todoId
          ? { ...item, done: !item.done, completedAt: !item.done ? new Date().toISOString() : undefined }
          : item,
      ),
    }));
  }

  function deleteTodo(todoId: string) {
    setState((prev) => ({ ...prev, todos: prev.todos.filter((item) => item.id !== todoId) }));
  }

  function submitRating(stars: number, comment: string) {
    setState((prev) => ({ ...prev, rating: { stars, comment, updatedAt: new Date().toISOString() } }));
  }

  // A parent ("adult" member) manages the whole family, not just their own
  // items, so their profile aggregates everyone's letters/payments/events
  // instead of only what's directly assigned to them.
  const isAdultMember = (childId: string) => state.children.find((c) => c.id === childId)?.type === 'adult';

  // An "الكل" (all-children) item is stored once with childId === ALL_CHILDREN
  // rather than duplicated per child, so every per-child lookup must also
  // pull in those shared records instead of matching only the exact id.
  const lettersForChild = (childId: string) =>
    isAdultMember(childId) ? state.letters : state.letters.filter((l) => l.childId === childId || l.childId === ALL_CHILDREN);
  const paymentsForChild = (childId: string) =>
    isAdultMember(childId) ? state.payments : state.payments.filter((p) => p.childId === childId || p.childId === ALL_CHILDREN);
  const eventsForChild = (childId: string) =>
    isAdultMember(childId) ? state.events : state.events.filter((e) => e.childId === childId || e.childId === ALL_CHILDREN);

  return (
    <DataContext.Provider
      value={{
        children: state.children,
        letters: state.letters,
        payments: state.payments,
        events: state.events,
        todos: state.todos,
        rating: state.rating,
        addChild,
        deleteChild,
        addLetter,
        markPaymentPaid,
        addManualEvent,
        lettersForChild,
        paymentsForChild,
        eventsForChild,
        addTodo,
        toggleTodo,
        deleteTodo,
        submitRating,
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
