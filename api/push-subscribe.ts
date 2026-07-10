import type { IncomingMessage, ServerResponse } from 'node:http';
import { saveSubscription, type PushSubscriptionInput } from '../src/server/push';

interface VercelRequest extends IncomingMessage {
  body?: unknown;
}

interface VercelResponse extends ServerResponse {
  status(code: number): VercelResponse;
  json(body: unknown): void;
}

function isValidSubscription(value: unknown): value is PushSubscriptionInput {
  if (!value || typeof value !== 'object') return false;
  const sub = value as Record<string, unknown>;
  if (typeof sub.endpoint !== 'string' || !sub.keys || typeof sub.keys !== 'object') return false;
  const keys = sub.keys as Record<string, unknown>;
  return typeof keys.p256dh === 'string' && typeof keys.auth === 'string';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const { deviceId, subscription } = (req.body ?? {}) as { deviceId?: string; subscription?: unknown };
  if (!deviceId || typeof deviceId !== 'string') {
    res.status(400).json({ error: 'missing deviceId' });
    return;
  }
  if (!isValidSubscription(subscription)) {
    res.status(400).json({ error: 'invalid subscription' });
    return;
  }

  try {
    await saveSubscription(deviceId, subscription);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[api/push-subscribe] failed:', err);
    res.status(500).json({ error: 'failed to save subscription' });
  }
}
