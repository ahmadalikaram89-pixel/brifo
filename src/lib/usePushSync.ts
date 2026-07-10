import { useEffect } from 'react';
import type { CalendarEvent } from '../types/data';
import type { Lang } from '../context/translations';
import { pushEnabled, syncPushReminders } from './push';
import { getReminderOffsets } from './reminders';

/** Keeps the server's copy of "what to remind this device about" in sync
 * with local events, offsets, and language — debounced so rapid edits (e.g.
 * typing) don't fire a request per keystroke. */
export function usePushSync(events: CalendarEvent[], lang: Lang) {
  useEffect(() => {
    if (!pushEnabled()) return;
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = events.filter((e) => e.date >= today).map((e) => ({ id: e.id, title: e.title, date: e.date }));

    const timeout = setTimeout(() => {
      syncPushReminders(upcoming, getReminderOffsets(), lang);
    }, 800);

    return () => clearTimeout(timeout);
  }, [events, lang]);
}
