import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';

const client = new Anthropic();

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

  const response = await client.messages.parse({
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
    output_config: { format: zodOutputFormat(AnalysisSchema) },
  });

  if (!response.parsed_output) {
    throw new AnalyzeError('model did not return structured output');
  }

  return response.parsed_output;
}
