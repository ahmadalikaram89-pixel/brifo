import type { IncomingMessage, ServerResponse } from 'node:http';
import { listRatings } from '../../src/server/ratings.js';

interface VercelRequest extends IncomingMessage {
  body?: unknown;
}

interface VercelResponse extends ServerResponse {
  status(code: number): VercelResponse;
  json(body: unknown): void;
}

function isAuthorized(secret: unknown): boolean {
  const expected = process.env.ADMIN_SECRET;
  if (!expected) return true; // no secret configured (e.g. local dev) — allow
  return secret === expected;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  // The password travels in the body, not a query string, so it doesn't end
  // up in server logs or browser history.
  const { secret } = (req.body ?? {}) as { secret?: unknown };
  if (!isAuthorized(secret)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  try {
    const ratings = await listRatings();
    res.status(200).json({ ratings });
  } catch (err) {
    console.error('[api/admin/ratings] failed:', err);
    res.status(500).json({ error: 'failed to load ratings' });
  }
}
