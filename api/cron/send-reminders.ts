import type { IncomingMessage, ServerResponse } from 'node:http';
import { runDueReminders } from '../../src/server/push';
import { ConfigError } from '../../src/server/analyze';

interface VercelRequest extends IncomingMessage {
  query?: Record<string, string | string[]>;
}

interface VercelResponse extends ServerResponse {
  status(code: number): VercelResponse;
  json(body: unknown): void;
}

/** How far back this run looks for due reminders. Must be >= the actual gap
 * between cron invocations (see vercel.json's schedule), otherwise a slow or
 * skipped run can let a reminder slip through unfired — err on the wide side.
 * Vercel's Hobby plan only allows daily cron jobs, so this runs once a day
 * (~24h gap); 25h covers that plus scheduling drift. An "hour before" or
 * "15 min before" reminder will still only fire once a day and land late —
 * true near-real-time delivery needs the Pro plan or an external pinger
 * hitting this route more often (see .env.example's CRON_SECRET note). */
const WINDOW_MINUTES = 25 * 60;

function isAuthorized(req: VercelRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // no secret configured (e.g. local dev) — allow
  const header = req.headers.authorization;
  if (header === `Bearer ${secret}`) return true;
  const query = req.query?.secret;
  const querySecret = Array.isArray(query) ? query[0] : query;
  return querySecret === secret;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isAuthorized(req)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  try {
    const result = await runDueReminders(WINDOW_MINUTES);
    res.status(200).json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof ConfigError) {
      console.error('[api/cron/send-reminders] config error:', err.message);
      res.status(500).json({ error: `server misconfigured: ${err.message}` });
      return;
    }
    console.error('[api/cron/send-reminders] failed:', err);
    res.status(500).json({ error: 'failed to run reminders' });
  }
}
