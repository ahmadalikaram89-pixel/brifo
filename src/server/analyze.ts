import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { toStructuredOutputFormat } from './structuredOutput.js';

/** Thrown for server misconfiguration (e.g. missing API key), as opposed to
 * AnalyzeError which signals bad/invalid request input. Kept distinct so the
 * API route can tell "key missing" apart from "model/network failure" instead
 * of collapsing everything into one generic 500. */
export class ConfigError extends Error {}

let client: Anthropic | null = null;

/** Constructing `new Anthropic()` eagerly at module load would throw before
 * the request handler's try/catch ever runs (uncaught at cold start), which
 * is what produced the generic, unhelpful failure in production. Constructing
 * it lazily, behind an explicit env var check, turns a missing key into a
 * normal catchable error instead of a crashed function invocation. */
function getClient(): Anthropic {
  if (client) return client;
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new ConfigError('ANTHROPIC_API_KEY is not set in the server environment');
  }
  client = new Anthropic();
  return client;
}

const SYSTEM_PROMPT =
  'You are a helpful assistant for Arabic-speaking parents in Austria. ' +
  'Read this school letter and explain it in simple Levantine-influenced Modern Standard Arabic. ' +
  "If the letter mentions a specific child's name and/or class (e.g. addressed to a specific family, " +
  "written on a specific child's homework, or naming a student directly), extract them — otherwise leave them null. " +
  'Also extract any payments requested in the letter as separate structured items (amount, currency, what it is for, and due date), ' +
  'in addition to listing them in the general actions/deadlines. ' +
  'Whenever the summary, actions or deadlines mention a monetary amount inline, write it as digits followed by the ' +
  'amount spelled out in Arabic words in parentheses, e.g. "6,50 يورو (ستة يورو ونصف)" — never as bare digits ' +
  'sitting alone inside an Arabic sentence, since that renders unreliably in right-to-left text.';

const PaymentSchema = z.object({
  amount: z.number().describe('المبلغ المطلوب دفعه'),
  currency: z.string().default('EUR'),
  reason: z.string().describe('سبب الدفع بالعربي'),
  due_date: z.string().describe('YYYY-MM-DD'),
});

export const AnalysisSchema = z.object({
  summary: z.string().describe('ملخص الرسالة بالعربي'),
  action_required: z.boolean(),
  actions: z.array(z.string()).describe('توقيع وإرجاع الورقة، دفع رسوم، الخ'),
  deadlines: z.array(
    z.object({
      date: z.string().describe('YYYY-MM-DD'),
      what: z.string(),
    }),
  ),
  needs_reply: z.boolean(),
  urgency: z.enum(['high', 'medium', 'low']),
  detected_child_name: z.string().nullable().describe('اسم الطفل إذا مذكور بالرسالة، وإلا null'),
  detected_child_class: z.string().nullable().describe('صف الطفل إذا مذكور بالرسالة، وإلا null'),
  payments: z.array(PaymentSchema),
});

export type LetterAnalysis = z.infer<typeof AnalysisSchema>;

export class AnalyzeError extends Error {}

export async function analyzeLetterImage(imageBase64: string, mediaType: string): Promise<LetterAnalysis> {
  if (!imageBase64) throw new AnalyzeError('missing image');
  if (mediaType !== 'image/jpeg' && mediaType !== 'image/png') {
    throw new AnalyzeError('unsupported media type');
  }

  const anthropic = getClient();
  const approxBytes = Math.round((imageBase64.length * 3) / 4);
  console.log(`[analyze] request received: mediaType=${mediaType} approxImageBytes=${approxBytes}`);

  let response;
  try {
    response = await anthropic.messages.parse({
      model: 'claude-opus-4-8',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
            { type: 'text', text: 'حلّل رسالة المدرسة هاي واطلع لي النتيجة بالصيغة المطلوبة.' },
          ],
        },
      ],
      output_config: { format: toStructuredOutputFormat(AnalysisSchema) },
    });
  } catch (err) {
    console.error('[analyze] Anthropic API call failed:', err);
    throw err;
  }

  if (!response.parsed_output) {
    console.error('[analyze] model returned no parsed_output', response);
    throw new AnalyzeError('model did not return structured output');
  }

  return response.parsed_output;
}
