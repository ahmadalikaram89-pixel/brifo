import { useEffect } from 'react';
import type { CalendarEvent } from '../types/data';
import { notifyDueReminders } from './reminders';

/** Fires a local notification the first time an appointment becomes due
 * today or tomorrow, while the app is open. Re-checks periodically so a
 * long-lived tab still catches the day rolling over. */
export function useReminderScheduler(events: CalendarEvent[], todayLabel: string, tomorrowLabel: string) {
  useEffect(() => {
    function check() {
      const today = new Date().toISOString().slice(0, 10);
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const due = events.filter((e) => e.date === today || e.date === tomorrow);
      notifyDueReminders(
        due.map((e) => ({ id: e.id, title: e.title, date: e.date })),
        (date) => (date === today ? todayLabel : tomorrowLabel),
      );
    }

    check();
    const interval = setInterval(check, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [events, todayLabel, tomorrowLabel]);
}
