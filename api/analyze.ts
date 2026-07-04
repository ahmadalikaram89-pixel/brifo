import type { IncomingMessage, ServerResponse } from 'node:http';
import { analyzeLetterImage, AnalyzeError } from '../src/server/analyze';

interface VercelRequest extends IncomingMessage {
  body?: { image?: string; mediaType?: string };
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

  const { image, mediaType } = req.body ?? {};

  try {
    if (!image || !mediaType) throw new AnalyzeError('missing image or mediaType');
    const result = await analyzeLetterImage(image, mediaType);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof AnalyzeError) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.error('analyze failed', err);
    res.status(500).json({ error: 'analysis failed' });
  }
}
