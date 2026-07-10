/** Foreground fallback reminders — fires a local Notification while the app
 * happens to be open. Once push is active (see lib/push.ts) the server
 * handles delivery even when the app is closed, so this path steps aside to
 * avoid double notifications; it only fires when push subscription isn't
 * active (unsupported browser, subscribe failure, etc). */
import { pushEnabled } from './push';

const ENABLED_KEY = 'brifo_reminders_enabled';
const NOTIFIED_KEY = 'brifo_reminders_notified';
const OFFSETS_KEY = 'brifo_reminder_offsets';

export const REMINDER_OFFSET_DAY_BEFORE = 1440;
export const REMINDER_OFFSET_HOUR_BEFORE = 60;
export const REMINDER_OFFSET_15MIN_BEFORE = 15;

const DEFAULT_OFFSETS = [REMINDER_OFFSET_DAY_BEFORE, REMINDER_OFFSET_HOUR_BEFORE];

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function remindersEnabled(): boolean {
  return notificationsSupported() && Notification.permission === 'granted' && localStorage.getItem(ENABLED_KEY) === '1';
}

export async function enableReminders(): Promise<boolean> {
  if (!notificationsSupported()) return false;
  const permission = await Notification.requestPermission();
  const granted = permission === 'granted';
  localStorage.setItem(ENABLED_KEY, granted ? '1' : '0');
  return granted;
}

export function disableReminders(): void {
  localStorage.setItem(ENABLED_KEY, '0');
}

/** Which offsets (minutes before an appointment) the user wants to be
 * reminded at — shared between the foreground fallback and the server-side
 * push scheduler so both honor the same choice. */
export function getReminderOffsets(): number[] {
  try {
    const raw = localStorage.getItem(OFFSETS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.every((n) => typeof n === 'number') ? parsed : DEFAULT_OFFSETS;
  } catch {
    return DEFAULT_OFFSETS;
  }
}

export function setReminderOffsets(offsets: number[]): void {
  localStorage.setItem(OFFSETS_KEY, JSON.stringify(offsets));
}

function readNotifiedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(NOTIFIED_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeNotifiedIds(ids: Set<string>): void {
  localStorage.setItem(NOTIFIED_KEY, JSON.stringify([...ids]));
}

export interface ReminderCandidate {
  id: string;
  title: string;
  offsetMin: number;
}

/** Fires a local notification for each (event, offset) pair that's newly due
 * and hasn't fired yet. */
export function notifyDueReminders(candidates: ReminderCandidate[], bodyForOffset: (offsetMin: number) => string): void {
  if (!remindersEnabled() || pushEnabled()) return;
  const notified = readNotifiedIds();
  let changed = false;

  for (const c of candidates) {
    const key = `${c.id}:${c.offsetMin}`;
    if (notified.has(key)) continue;
    new Notification(c.title, { body: bodyForOffset(c.offsetMin), tag: key });
    notified.add(key);
    changed = true;
  }

  if (changed) writeNotifiedIds(notified);
}
