import type { IncomingMessage, ServerResponse } from 'node:http';
import { loadCloudBackup, isValidRecoveryCode } from '../src/server/backup.js';

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

  // The code is a bearer secret (whoever has it gets the family's data), so
  // it travels in the body rather than a query string / URL.
  const { code } = (req.body ?? {}) as { code?: unknown };
  if (!isValidRecoveryCode(code)) {
    res.status(400).json({ error: 'invalid code' });
    return;
  }

  try {
    const backup = await loadCloudBackup(code);
    if (!backup) {
      res.status(404).json({ error: 'not found' });
      return;
    }
    res.status(200).json(backup);
  } catch (err) {
    console.error('[api/backup-restore] failed:', err);
    res.status(500).json({ error: 'failed to load backup' });
  }
}
