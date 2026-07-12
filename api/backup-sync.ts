import type { IncomingMessage, ServerResponse } from 'node:http';
import { saveCloudBackup, isValidRecoveryCode } from '../src/server/backup.js';

interface VercelRequest extends IncomingMessage {
  body?: unknown;
}

interface VercelResponse extends ServerResponse {
  status(code: number): VercelResponse;
  json(body: unknown): void;
}

// Family data (children, letters, payments, events, todos) stays well under
// this — it's just a guard against an abusive/malformed payload.
const MAX_PAYLOAD_CHARS = 2_000_000;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const { code, data } = (req.body ?? {}) as { code?: unknown; data?: unknown };
  if (!isValidRecoveryCode(code)) {
    res.status(400).json({ error: 'invalid code' });
    return;
  }
  if (!data || typeof data !== 'object') {
    res.status(400).json({ error: 'invalid data' });
    return;
  }
  if (JSON.stringify(data).length > MAX_PAYLOAD_CHARS) {
    res.status(413).json({ error: 'payload too large' });
    return;
  }

  try {
    await saveCloudBackup(code, data);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[api/backup-sync] failed:', err);
    res.status(500).json({ error: 'failed to save backup' });
  }
}
