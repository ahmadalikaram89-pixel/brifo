/** Manual export/import so a user can save their data before a risky action
 * (deleting the home-screen app, switching phones) and restore it after —
 * everything lives in localStorage only, so nothing survives that on its
 * own (see DataContext). */
import type { Child, StoredLetter, Payment, CalendarEvent, TodoItem, AppRating, Tombstone } from '../types/data';

const BACKUP_VERSION = 1;

export interface RestorableState {
  children: Child[];
  letters: StoredLetter[];
  payments: Payment[];
  events: CalendarEvent[];
  todos: TodoItem[];
  rating: AppRating | null;
  tombstones: Tombstone[];
}

interface BackupPayload extends RestorableState {
  version: number;
  exportedAt: string;
}

/** Fills in fields that older saved data (localStorage, a JSON export, or a
 * cloud backup made before a schema addition) won't have — same idea as
 * `type ?? 'child'` for children, generalized to every field added since. */
export function normalizeState(raw: Record<string, unknown>): RestorableState {
  return {
    children: ((raw.children as (Omit<Child, 'type'> & { type?: Child['type'] })[]) ?? []).map((c) => ({
      ...c,
      type: c.type ?? 'child',
    })),
    letters: (raw.letters as StoredLetter[]) ?? [],
    payments: ((raw.payments as (Omit<Payment, 'updatedAt'> & { updatedAt?: string })[]) ?? []).map((p) => ({
      ...p,
      updatedAt: p.updatedAt ?? p.createdAt,
    })),
    events: ((raw.events as (Omit<CalendarEvent, 'updatedAt'> & { updatedAt?: string })[]) ?? []).map((e) => ({
      ...e,
      updatedAt: e.updatedAt ?? e.createdAt,
    })),
    todos: ((raw.todos as (Omit<TodoItem, 'updatedAt'> & { updatedAt?: string })[]) ?? []).map((t) => ({
      ...t,
      updatedAt: t.updatedAt ?? t.createdAt,
    })),
    rating: (raw.rating as AppRating | undefined) ?? null,
    tombstones: Array.isArray(raw.tombstones) ? (raw.tombstones as Tombstone[]) : [],
  };
}

export function downloadBackup(state: RestorableState): void {
  const payload: BackupPayload = { version: BACKUP_VERSION, exportedAt: new Date().toISOString(), ...state };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `brifo-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export class BackupParseError extends Error {}

export async function parseBackupFile(file: File): Promise<RestorableState> {
  let text: string;
  try {
    text = await file.text();
  } catch {
    throw new BackupParseError('backup_error_read');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new BackupParseError('backup_error_format');
  }

  if (!parsed || typeof parsed !== 'object') throw new BackupParseError('backup_error_format');
  const p = parsed as Record<string, unknown>;
  if (![p.children, p.letters, p.payments, p.events, p.todos].every(Array.isArray)) {
    throw new BackupParseError('backup_error_format');
  }

  return normalizeState(p);
}
