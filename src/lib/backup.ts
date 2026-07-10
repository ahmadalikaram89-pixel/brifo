/** Manual export/import so a user can save their data before a risky action
 * (deleting the home-screen app, switching phones) and restore it after —
 * everything lives in localStorage only, so nothing survives that on its
 * own (see DataContext). */
import type { Child, StoredLetter, Payment, CalendarEvent, TodoItem, AppRating } from '../types/data';

const BACKUP_VERSION = 1;

export interface RestorableState {
  children: Child[];
  letters: StoredLetter[];
  payments: Payment[];
  events: CalendarEvent[];
  todos: TodoItem[];
  rating: AppRating | null;
}

interface BackupPayload extends RestorableState {
  version: number;
  exportedAt: string;
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

  return {
    children: p.children as Child[],
    letters: p.letters as StoredLetter[],
    payments: p.payments as Payment[],
    events: p.events as CalendarEvent[],
    todos: p.todos as TodoItem[],
    rating: (p.rating as AppRating | undefined) ?? null,
  };
}
