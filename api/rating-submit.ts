import type { IncomingMessage, ServerResponse } from 'node:http';
import { submitRating } from '../src/server/ratings.js';

interface VercelRequest extends IncomingMessage {
  body?: unknown;
}

interface VercelResponse extends ServerResponse {
  status(code: number): VercelResponse;
  json(body: unknown): void;
}

const MAX_COMMENT_LENGTH = 2000;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const { stars, comment, lang } = (req.body ?? {}) as { stars?: unknown; comment?: unknown; lang?: unknown };
  if (typeof stars !== 'number' || !Number.isInteger(stars) || stars < 1 || stars > 5) {
    res.status(400).json({ error: 'invalid stars' });
    return;
  }
  const safeComment = typeof comment === 'string' ? comment.slice(0, MAX_COMMENT_LENGTH) : '';

  try {
    await submitRating(stars, safeComment, lang === 'de' ? 'de' : 'ar');
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[api/rating-submit] failed:', err);
    res.status(500).json({ error: 'failed to submit rating' });
  }
}
