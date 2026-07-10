/** Local (in-browser) appointment reminders — no push server involved.
 * Permission + the "already notified" set are tracked in localStorage so a
 * reminder fires once per event, the first time it becomes due while the
 * app is open. */

const ENABLED_KEY = 'brifo_reminders_enabled';
const NOTIFIED_KEY = 'brifo_reminders_notified';

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
  date: string;
}

/** Fires a local notification for each candidate due today/tomorrow that hasn't fired yet. */
export function notifyDueReminders(candidates: ReminderCandidate[], bodyForDate: (date: string) => string): void {
  if (!remindersEnabled()) return;
  const notified = readNotifiedIds();
  let changed = false;

  for (const c of candidates) {
    if (notified.has(c.id)) continue;
    new Notification(c.title, { body: bodyForDate(c.date), tag: c.id });
    notified.add(c.id);
    changed = true;
  }

  if (changed) writeNotifiedIds(notified);
}
