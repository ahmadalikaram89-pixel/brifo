import { useEffect } from 'react';
import type { CalendarEvent } from '../types/data';
import { notifyDueReminders, getReminderOffsets, REMINDER_OFFSET_DAY_BEFORE, REMINDER_OFFSET_HOUR_BEFORE } from './reminders';

const CHECK_INTERVAL_MS = 5 * 60 * 1000;
const LOOKBACK_MS = 10 * 60 * 1000;

/** Calendar events only carry a date — 08:00 in the device's own local time
 * zone is treated as every event's assumed appointment time, same convention
 * the server-side scheduler uses for Europe/Vienna (see src/server/push.ts). */
function eventAnchorMs(dateStr: string): number {
  return new Date(`${dateStr}T08:00:00`).getTime();
}

/** Foreground fallback: fires a local notification the first time an
 * appointment becomes due at one of the user's chosen offsets, while the app
 * is open. Steps aside once push is active (see notifyDueReminders). */
export function useReminderScheduler(events: CalendarEvent[], dayBeforeLabel: string, hourBeforeLabel: string, soonLabel: string) {
  useEffect(() => {
    function labelFor(offsetMin: number): string {
      if (offsetMin >= REMINDER_OFFSET_DAY_BEFORE) return dayBeforeLabel;
      if (offsetMin >= REMINDER_OFFSET_HOUR_BEFORE) return hourBeforeLabel;
      return soonLabel;
    }

    function check() {
      const now = Date.now();
      const offsets = getReminderOffsets();
      const due = events.flatMap((e) => {
        const anchor = eventAnchorMs(e.date);
        return offsets
          .filter((offsetMin) => {
            const fireAt = anchor - offsetMin * 60000;
            return fireAt <= now && fireAt > now - LOOKBACK_MS;
          })
          .map((offsetMin) => ({ id: e.id, title: e.title, offsetMin }));
      });
      notifyDueReminders(due, labelFor);
    }

    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [events, dayBeforeLabel, hourBeforeLabel, soonLabel]);
}
