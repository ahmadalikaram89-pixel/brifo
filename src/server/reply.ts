import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';

const client = new Anthropic();

const SYSTEM_PROMPT =
  'You are a formal German letter-writing assistant helping Arabic-speaking parents in Austria ' +
  'communicate with their children\'s school. Write a polite, correctly formatted, formal German letter ' +
  'based on the parent\'s intent and the details they provide (the details may be written in Arabic). ' +
  'Then provide an accurate Arabic translation of the exact same letter.';

const INTENT_LABELS = {
  entschuldigung: 'Entschuldigung wegen Abwesenheit (excuse for absence)',
  termin: 'Terminanfrage (appointment request)',
  zustimmung: 'Zustimmung / Einverständnis (consent)',
  frage: 'Frage an die Lehrperson (question for the teacher)',
} as const;

export type ReplyIntent = keyof typeof INTENT_LABELS;

export const ReplyRequestSchema = z.object({
  intent: z.enum(['entschuldigung', 'termin', 'zustimmung', 'frage']),
  childName: z.string().max(80).optional(),
  childClass: z.string().max(40).optional(),
  details: z.string().min(3).max(2000),
});

export type ReplyRequestInput = z.infer<typeof ReplyRequestSchema>;

const ReplyResultSchema = z.object({
  german: z.string().describe('الرسالة الرسمية بالألماني'),
  arabic: z.string().describe('ترجمة نفس الرسالة بالعربي'),
});

export type ReplyLetter = z.infer<typeof ReplyResultSchema>;

export class ReplyError extends Error {}

export async function generateReplyLetter(input: unknown): Promise<ReplyLetter> {
  const parsed = ReplyRequestSchema.safeParse(input);
  if (!parsed.success) throw new ReplyError(parsed.error.issues[0]?.message ?? 'invalid input');
  const { intent, childName, childClass, details } = parsed.data;

  const contextLines = [
    `Intent: ${INTENT_LABELS[intent]}`,
    childName ? `Child's name: ${childName}` : null,
    childClass ? `Class: ${childClass}` : null,
    `Details from parent (may be in Arabic): ${details}`,
  ].filter(Boolean);

  const response = await client.messages.parse({
    model: 'claude-opus-4-8',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: contextLines.join('\n') }],
    output_config: { format: zodOutputFormat(ReplyResultSchema) },
  });

  if (!response.parsed_output) throw new ReplyError('model did not return structured output');
  return response.parsed_output;
}
