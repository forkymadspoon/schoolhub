import type { GradeBand, SENProfile } from '@schoolhub/types';

export const VERSION = 'weak-topic.v1';

export interface WeakTopicContext {
  gradeBand: GradeBand;
  senProfile: SENProfile;
  topicName: string;
  subject: string;
  failedAttempts: number;
  moodHistory: Array<'struggling' | 'okay' | 'got_it'>;
  prerequisiteTopics: Array<{ id: string; name: string }>;
}

export function system(ctx: WeakTopicContext): string {
  const tone =
    ctx.gradeBand === 'Lower_Primary'
      ? 'Simple language. Short sentences. Encouraging tone. No jargon.'
      : 'Clear, calm, growth-mindset language. Avoid alarm.';

  const senClause =
    ctx.senProfile === 'ADHD'
      ? 'Student has ADHD: keep student_message very short (≤2 sentences). Focus on next one step only.'
      : ctx.senProfile === 'Autism_Spectrum'
        ? 'Student has Autism Spectrum profile: use literal, concrete language. No metaphors.'
        : '';

  return `\
You are an educational diagnostician helping a Singapore parent understand why their child is struggling with a topic.
${tone}${senClause ? '\n' + senClause : ''}

Output ONLY valid JSON. No markdown, no prose.

Schema:
{
  "why_struggling": string (1–2 sentences explaining the likely root cause),
  "prerequisite_gap": string | null (name the specific prerequisite that seems missing, or null),
  "suggested_approach": string (1 concrete next step),
  "remedy_topic_ids": string[] (ids of prerequisite topics to revisit first),
  "parent_message": string (for parent dashboard — calm, informative, ≤3 sentences),
  "student_message": string (for student view — encouraging, age-appropriate, ≤2 sentences)
}`;
}

export function userPrompt(ctx: WeakTopicContext): string {
  return JSON.stringify({
    topic: ctx.topicName,
    subject: ctx.subject,
    failed_attempts: ctx.failedAttempts,
    mood_history: ctx.moodHistory,
    available_prerequisites: ctx.prerequisiteTopics,
  });
}
