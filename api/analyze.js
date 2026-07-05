// Deliberately self-contained: no imports from src/, no @anthropic-ai/sdk.
// Isolates this route from the project's ESM module graph and the SDK's
// subpath resolution, both implicated in prior cold-start crashes. Talks to
// the Anthropic API directly via the global fetch (Node 18+).

const MODEL = 'claude-opus-4-8';

const SYSTEM_PROMPT =
  'You are a helpful assistant for Arabic-speaking parents in Austria. ' +
  'Read this school letter and respond with ONLY a JSON object (no markdown fences, no prose) ' +
  'shaped exactly like: {"summary": string, "action_required": boolean, "actions": string[], ' +
  '"deadlines": [{"date": "YYYY-MM-DD", "what": string}], "needs_reply": boolean, ' +
  '"urgency": "high" | "medium" | "low"}. Write the summary and all text fields in simple ' +
  'Levantine-influenced Modern Standard Arabic.';

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({ ok: true, hasKey: !!process.env.ANTHROPIC_API_KEY });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'server misconfigured: ANTHROPIC_API_KEY is not set' });
    return;
  }

  const { image, mediaType } = req.body || {};
  if (!image || !mediaType) {
    res.status(400).json({ error: 'missing image or mediaType' });
    return;
  }
  if (mediaType !== 'image/jpeg' && mediaType !== 'image/png') {
    res.status(400).json({ error: 'unsupported media type' });
    return;
  }

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType, data: image } },
              { type: 'text', text: 'حلّل رسالة المدرسة هاي واطلع لي النتيجة بصيغة JSON فقط.' },
            ],
          },
        ],
      }),
    });

    const data = await anthropicRes.json();

    if (!anthropicRes.ok) {
      console.error('[api/analyze] Anthropic API error:', anthropicRes.status, data);
      res.status(502).json({ error: 'anthropic api error', detail: data });
      return;
    }

    const text = (data.content && data.content[0] && data.content[0].text) || '';
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      res.status(502).json({ error: 'model did not return valid JSON', raw: text });
      return;
    }

    res.status(200).json(parsed);
  } catch (err) {
    console.error('[api/analyze] request failed:', err);
    res.status(500).json({ error: 'analysis failed', detail: err instanceof Error ? err.message : String(err) });
  }
};
