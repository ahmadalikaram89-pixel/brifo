import type { IncomingMessage, ServerResponse } from 'node:http';
import { generateReplyLetter, ReplyError } from '../src/server/reply';

interface VercelRequest extends IncomingMessage {
  body?: unknown;
}

interface VercelResponse extends ServerResponse {
  status(code: number): VercelResponse;
  json(body: unknown): void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  try {
    const result = await generateReplyLetter(req.body);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof ReplyError) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.error('reply generation failed', err);
    res.status(500).json({ error: 'reply generation failed' });
  }
}
