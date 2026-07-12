import type { IncomingMessage, ServerResponse } from 'node:http';
import { removeSubscription } from '../src/server/push.js';

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

  const { deviceId } = (req.body ?? {}) as { deviceId?: string };
  if (!deviceId || typeof deviceId !== 'string') {
    res.status(400).json({ error: 'missing deviceId' });
    return;
  }

  try {
    await removeSubscription(deviceId);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[api/push-unsubscribe] failed:', err);
    res.status(500).json({ error: 'failed to remove subscription' });
  }
}
