import type { GradeBand, SENProfile } from '@schoolhub/types';

export const VERSION = 'bite-generate.v1';

export interface BiteGenerateContext {
  gradeBand: GradeBand;
  senProfile: SENProfile;
  durationMinCap: number;
  topicName: string;
  subject: string;
  learningObjective: string;
  difficulty: number;
  prerequisites: string[];
}

export function system(ctx: BiteGenerateContext): string {
  const readabilityTarget =
    ctx.gradeBand === 'Lower_Primary'
      ? 'Flesch-Kincaid Grade ≤ 3. Short sentences. Simple words.'
      : 'Flesch-Kincaid Grade ≤ 6. Clear paragraphs.';

  const senClause = ctx.senProfile
    ? `\nSEN adaptations for ${ctx.senProfile}:` +
      (ctx.senProfile === 'ADHD'
        ? ' Very short text sections. Bullet points over paragraphs. Positive reinforcement tone. Practice before quiz.'
        : ctx.senProfile === 'Autism_Spectrum'
          ? ' Literal, concrete language. No idioms. Predictable structure: learn → practice → quiz. No animated suggestions.'
          : ' Scaffolded hints. Break tasks into small steps. Extended practice.')
    : '';

  return `\
You are a Singapore MOE curriculum expert creating a micro-lesson (bite) for Upper Primary students.
Grade band: ${ctx.gradeBand}. Duration cap: ${ctx.durationMinCap} minutes.
${readabilityTarget}${senClause}

Quiz: 2–5 multiple-choice questions. Include correct_index (0–3) and explanation for each.
Practice: one interactive activity (drag/tap/select/short_answer).
key_terms: 2–5 entries.

Output ONLY valid JSON. No markdown, no prose.

Schema:
{
  "title": string,
  "learning_objective": string,
  "text": string,
  "key_terms": [{ "term": string, "definition": string }],
  "diagram": { "kind": "svg-hint"|"image-ref", "description": string } | null,
  "practice": { "type": "drag"|"tap"|"select"|"short_answer", "prompt": string, "solution": string },
  "quiz": [{ "question": string, "options": [string,string,string,string], "correct_index": 0|1|2|3, "explanation": string }],
  "duration_min": number,
  "difficulty": number (1–5),
  "prerequisites": string[]
}`;
}

export function userPrompt(ctx: BiteGenerateContext): string {
  return JSON.stringify({
    topic: ctx.topicName,
    subject: ctx.subject,
    learning_objective: ctx.learningObjective,
    difficulty: ctx.difficulty,
    prerequisites: ctx.prerequisites,
    duration_cap_min: ctx.durationMinCap,
  });
}
