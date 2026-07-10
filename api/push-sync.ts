import type { IncomingMessage, ServerResponse } from 'node:http';
import { syncReminders, type ReminderEvent } from '../src/server/push';

interface VercelRequest extends IncomingMessage {
  body?: unknown;
}

interface VercelResponse extends ServerResponse {
  status(code: number): VercelResponse;
  json(body: unknown): void;
}

const MAX_EVENTS = 300;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidEvent(value: unknown): value is ReminderEvent {
  if (!value || typeof value !== 'object') return false;
  const ev = value as Record<string, unknown>;
  return typeof ev.id === 'string' && typeof ev.title === 'string' && typeof ev.date === 'string' && DATE_RE.test(ev.date);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const { deviceId, events, offsets, lang } = (req.body ?? {}) as {
    deviceId?: string;
    events?: unknown;
    offsets?: unknown;
    lang?: unknown;
  };

  if (!deviceId || typeof deviceId !== 'string') {
    res.status(400).json({ error: 'missing deviceId' });
    return;
  }
  if (!Array.isArray(events) || events.length > MAX_EVENTS || !events.every(isValidEvent)) {
    res.status(400).json({ error: 'invalid events' });
    return;
  }
  if (!Array.isArray(offsets) || !offsets.every((n) => typeof n === 'number' && n >= 0 && n <= 10080)) {
    res.status(400).json({ error: 'invalid offsets' });
    return;
  }

  try {
    await syncReminders(deviceId, events, offsets, lang === 'de' ? 'de' : 'ar');
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[api/push-sync] failed:', err);
    res.status(500).json({ error: 'failed to sync reminders' });
  }
}
