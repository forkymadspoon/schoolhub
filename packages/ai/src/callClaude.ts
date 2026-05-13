import Anthropic from '@anthropic-ai/sdk';
import type { z } from 'zod';

const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
const MODEL = process.env.CLAUDE_MODEL ?? 'claude-sonnet-4-6';
const MAX_RETRIES = 3;

export interface CallClaudeParams<T> {
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodType<T>;
  maxTokens?: number;
  /** Base64-encoded PDF; enables document content block */
  pdfBase64?: string;
}

/** Replace child first-name with CHILD before any Claude call to minimise PII in prompts */
export function withChildPlaceholder(text: string, childName: string): string {
  if (!childName) return text;
  const escaped = childName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(escaped, 'gi'), 'CHILD');
}

function tryRepairJson(raw: string): string {
  let s = raw.trim();
  // Strip markdown code fences
  if (s.startsWith('```')) {
    s = s.replace(/^```(?:json)?\r?\n?/, '').replace(/\r?\n?```$/, '').trim();
  }
  // Trim leading prose before first { or [
  const braceIdx = s.indexOf('{');
  const bracketIdx = s.indexOf('[');
  const start =
    braceIdx === -1
      ? bracketIdx
      : bracketIdx === -1
        ? braceIdx
        : Math.min(braceIdx, bracketIdx);
  if (start > 0) s = s.slice(start);
  // Trim trailing prose after last } or ]
  const lastBrace = s.lastIndexOf('}');
  const lastBracket = s.lastIndexOf(']');
  const end = Math.max(lastBrace, lastBracket);
  if (end !== -1 && end < s.length - 1) s = s.slice(0, end + 1);
  return s;
}

export async function callClaude<T>(params: CallClaudeParams<T>): Promise<T> {
  const { systemPrompt, userPrompt, schema, maxTokens = 4096, pdfBase64 } = params;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      type ContentBlock =
        | Anthropic.TextBlockParam
        | { type: 'document'; source: { type: 'base64'; media_type: 'application/pdf'; data: string } };

      const userContent: string | ContentBlock[] = pdfBase64
        ? [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 },
            },
            { type: 'text', text: userPrompt },
          ]
        : userPrompt;

      const response = await client.messages.create({
        model: MODEL,
        max_tokens: maxTokens,
        system: systemPrompt,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        messages: [{ role: 'user', content: userContent as any }],
      });

      const rawText = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map(b => b.text)
        .join('');

      const repaired = tryRepairJson(rawText);
      const parsed: unknown = JSON.parse(repaired);
      return schema.parse(parsed);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < MAX_RETRIES) {
        // Exponential back-off: 500ms, 1000ms
        await new Promise(r => setTimeout(r, 500 * attempt));
      }
    }
  }

  throw new Error(`callClaude failed after ${MAX_RETRIES} attempts: ${lastError?.message}`);
}
