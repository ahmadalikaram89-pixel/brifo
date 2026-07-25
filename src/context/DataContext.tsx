import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  ALL_CHILDREN,
  CHILD_COLORS,
  type Child,
  type FamilyMemberType,
  type CalendarEvent,
  type Payment,
  type StoredLetter,
  type LetterPhoto,
  type TodoItem,
  type AppRating,
  type Tombstone,
} from '../types/data';
import type { LetterAnalysis } from '../types/analysis';
import { normalizeState, type RestorableState } from '../lib/backup';
import { syncToCloud, fetchCloudBackup } from '../lib/cloudBackup';
import { mergeStoredState } from '../lib/mergeState';

const STORAGE_KEY = 'brifo_data';
const EMPTY_STATE: RestorableState = { children: [], letters: [], payments: [], events: [], todos: [], rating: null, tombstones: [] };

type StoredState = RestorableState;

function loadInitialState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    return normalizeState(JSON.parse(raw));
  } catch {
    return EMPTY_STATE;
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
  tombstones: Tombstone[];
  addChild: (input: NewChildInput) => Child;
  deleteChild: (childId: string) => void;
  addLetter: (childId: string, analysis: LetterAnalysis, photo?: LetterPhoto) => StoredLetter;
  markPaymentPaid: (paymentId: string, paid: boolean) => void;
  addManualEvent: (childId: string, title: string, date: string) => CalendarEvent;
  updateEvent: (eventId: string, updates: { childId: string; title: string; date: string }) => void;
  deleteEvent: (eventId: string) => void;
  lettersForChild: (childId: string) => StoredLetter[];
  paymentsForChild: (childId: string) => Payment[];
  eventsForChild: (childId: string) => CalendarEvent[];
  addTodo: (childId: string, title: string, dueDate?: string) => TodoItem;
  toggleTodo: (todoId: string) => void;
  deleteTodo: (todoId: string) => void;
  submitRating: (stars: number, comment: string) => void;
  restoreBackup: (data: RestorableState) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children: reactChildren }: { children: ReactNode }) {
  const [state, setState] = useState<StoredState>(loadInitialState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Debounced so rapid edits (e.g. typing) don't fire a request per keystroke.
  // Letter photos are stripped out: they're local-only (see StoredLetter.photo)
  // since the backup API caps total payload size.
  useEffect(() => {
    const timeout = setTimeout(() => {
      const cloudState = { ...state, letters: state.letters.map(({ photo: _photo, ...l }) => l) };
      syncToCloud(cloudState);
    }, 800);
    return () => clearTimeout(timeout);
  }, [state]);

  // Two devices (e.g. both parents) can share one recovery code, so this
  // device's own edits alone aren't the whole picture — periodically pull the
  // cloud copy and reconcile it with local state (see lib/mergeState) instead
  // of only ever pushing. Runs on mount, on an interval, and whenever the app
  // regains visibility (the realistic moment to catch up: reopening after the
  // other parent made changes).
  useEffect(() => {
    let cancelled = false;

    async function pullAndMerge() {
      const remote = await fetchCloudBackup();
      if (cancelled || !remote) return;
      setState((prev) => {
        const merged = mergeStoredState(prev, remote);
        return JSON.stringify(merged) === JSON.stringify(prev) ? prev : merged;
      });
    }

    function handleVisibility() {
      if (document.visibilityState === 'visible') pullAndMerge();
    }

    pullAndMerge();
    const interval = setInterval(pullAndMerge, 45_000);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

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

  function tombstone(id: string): Tombstone {
    return { id, deletedAt: new Date().toISOString() };
  }

  function deleteChild(childId: string) {
    setState((prev) => {
      const cascadedIds = [
        childId,
        ...prev.letters.filter((l) => l.childId === childId).map((l) => l.id),
        ...prev.payments.filter((p) => p.childId === childId).map((p) => p.id),
        ...prev.events.filter((e) => e.childId === childId).map((e) => e.id),
        ...prev.todos.filter((item) => item.childId === childId).map((item) => item.id),
      ];
      return {
        ...prev,
        children: prev.children.filter((c) => c.id !== childId),
        letters: prev.letters.filter((l) => l.childId !== childId),
        payments: prev.payments.filter((p) => p.childId !== childId),
        events: prev.events.filter((e) => e.childId !== childId),
        todos: prev.todos.filter((item) => item.childId !== childId),
        tombstones: [...prev.tombstones, ...cascadedIds.map(tombstone)],
      };
    });
  }

  function addLetter(childId: string, analysis: LetterAnalysis, photo?: LetterPhoto): StoredLetter {
    const now = new Date().toISOString();
    const letter: StoredLetter = {
      id: makeId(),
      childId,
      createdAt: now,
      analysis,
      photo,
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
      createdAt: now,
      updatedAt: now,
    }));

    const deadlineEvents: CalendarEvent[] = analysis.deadlines.map((d) => ({
      id: makeId(),
      childId,
      title: d.what,
      date: d.date,
      source: 'letter',
      createdAt: now,
      updatedAt: now,
    }));

    const paymentEvents: CalendarEvent[] = newPayments.map((p) => ({
      id: makeId(),
      childId,
      title: p.reason,
      date: p.dueDate,
      source: 'payment',
      createdAt: now,
      updatedAt: now,
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
      payments: prev.payments.map((p) => (p.id === paymentId ? { ...p, paid, updatedAt: new Date().toISOString() } : p)),
    }));
  }

  function deleteEvent(eventId: string) {
    setState((prev) => ({
      ...prev,
      events: prev.events.filter((e) => e.id !== eventId),
      tombstones: [...prev.tombstones, tombstone(eventId)],
    }));
  }

  function updateEvent(eventId: string, updates: { childId: string; title: string; date: string }) {
    setState((prev) => ({
      ...prev,
      events: prev.events.map((e) => (e.id === eventId ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e)),
    }));
  }

  function addManualEvent(childId: string, title: string, date: string): CalendarEvent {
    const now = new Date().toISOString();
    const event: CalendarEvent = {
      id: makeId(),
      childId,
      title,
      date,
      source: 'manual',
      createdAt: now,
      updatedAt: now,
    };
    setState((prev) => ({ ...prev, events: [...prev.events, event] }));
    return event;
  }

  function addTodo(childId: string, title: string, dueDate?: string): TodoItem {
    const now = new Date().toISOString();
    const todo: TodoItem = {
      id: makeId(),
      childId,
      title,
      done: false,
      createdAt: now,
      updatedAt: now,
      dueDate,
    };
    setState((prev) => ({ ...prev, todos: [...prev.todos, todo] }));
    return todo;
  }

  function toggleTodo(todoId: string) {
    setState((prev) => ({
      ...prev,
      todos: prev.todos.map((item) =>
        item.id === todoId
          ? {
              ...item,
              done: !item.done,
              completedAt: !item.done ? new Date().toISOString() : undefined,
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    }));
  }

  function deleteTodo(todoId: string) {
    setState((prev) => ({
      ...prev,
      todos: prev.todos.filter((item) => item.id !== todoId),
      tombstones: [...prev.tombstones, tombstone(todoId)],
    }));
  }

  function submitRating(stars: number, comment: string) {
    setState((prev) => ({ ...prev, rating: { stars, comment, updatedAt: new Date().toISOString() } }));
  }

  // An explicit, user-confirmed restore (from a JSON file or a cloud recovery
  // code) replaces state outright rather than merging — `data` is already
  // normalized (see lib/backup's normalizeState), so this is a plain adopt.
  function restoreBackup(data: RestorableState) {
    setState(data);
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
        tombstones: state.tombstones,
        addChild,
        deleteChild,
        addLetter,
        markPaymentPaid,
        addManualEvent,
        updateEvent,
        deleteEvent,
        lettersForChild,
        paymentsForChild,
        eventsForChild,
        addTodo,
        toggleTodo,
        deleteTodo,
        submitRating,
        restoreBackup,
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
