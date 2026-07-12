import type { IncomingMessage, ServerResponse } from 'node:http';
import { getVapidPublicKey } from '../src/server/push.js';
import { ConfigError } from '../src/server/errors.js';

interface VercelRequest extends IncomingMessage {}

interface VercelResponse extends ServerResponse {
  status(code: number): VercelResponse;
  json(body: unknown): void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  try {
    res.status(200).json({ publicKey: getVapidPublicKey() });
  } catch (err) {
    if (err instanceof ConfigError) {
      res.status(500).json({ error: `server misconfigured: ${err.message}` });
      return;
    }
    res.status(500).json({ error: 'unexpected error' });
  }
}
