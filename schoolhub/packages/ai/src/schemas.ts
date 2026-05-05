import { z } from 'zod';

// ─── Shared sub-schemas ───────────────────────────────────────────────────────

const SubjectEnum = z.enum([
  'English', 'Mathematics', 'Science', 'Chinese', 'Malay', 'Tamil', 'Social_Studies',
]);

const ISODate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');

// ─── Use Case 1: Curriculum parse ─────────────────────────────────────────────

export const ParsedTopicSchema = z.object({
  id: z.string().min(1),
  sequence: z.number().int().positive(),
  name: z.string().min(1),
  chapter_numbers: z.array(z.string()),
  learning_objectives: z.array(z.string()).min(1),
  estimated_hours: z.number().positive(),
  estimated: z.boolean().optional(),
  exam_weight_percentage: z.number().min(0).max(100),
  prerequisites: z.array(z.string()),
  key_concepts: z.array(z.string()).min(1),
  content_strands: z.array(z.string()),
  difficulty_level: z.number().int().min(1).max(5),
});

export const ParsedTopicsResponseSchema = z.object({
  subject: z.string().min(1),
  level: z.string().min(1),
  topics: z.array(ParsedTopicSchema).min(1),
  curriculum_version: z.string().min(1),
});

// ─── Use Case 2: Upload parsing ───────────────────────────────────────────────

export const AssessmentDateSchema = z.object({
  label: z.string().min(1),
  subject: z.string().nullable(),
  date: ISODate,
  type: z.enum(['exam', 'quiz', 'assignment', 'other']),
  notes: z.string().nullable(),
});

export const CalendarEventSchema = z.object({
  date: ISODate,
  end_date: ISODate.nullable(),
  title: z.string().min(1),
  type: z.enum(['holiday', 'school_event', 'exam', 'other']),
  all_day: z.boolean(),
});

export const UploadPayloadSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('assessment_dates'), dates: z.array(AssessmentDateSchema).min(1) }),
  z.object({ type: z.literal('school_calendar'), events: z.array(CalendarEventSchema).min(1) }),
  z.object({ type: z.literal('spelling_list'), words: z.array(z.string().min(1)).min(1) }),
]);

// ─── Use Case 3: Schedule generation ─────────────────────────────────────────

const ScheduledBiteSlotSchema = z.object({
  topic_id: z.string().uuid(),
  subject: SubjectEnum,
  duration_min: z.number().int().min(1).max(10),
  intensity: z.enum(['low', 'med', 'high']),
  is_review: z.boolean(),
  date: ISODate,
});

const ScheduleWeekSchema = z.object({
  week_number: z.number().int().positive(),
  date_range: z.string().min(1),
  bites: z.array(ScheduledBiteSlotSchema),
  total_minutes: z.number().int().nonnegative(),
  holiday_days: z.array(ISODate),
  notes: z.string(),
});

export const ScheduleJsonSchema = z.object({
  weeks: z.array(ScheduleWeekSchema).min(1),
  buffer_weeks: z.number().int().min(0),
  hash: z.string().min(1),
});

// ─── Use Case 4: Bite generation ─────────────────────────────────────────────

const QuizItemSchema = z.object({
  question: z.string().min(1),
  options: z.tuple([z.string(), z.string(), z.string(), z.string()]),
  correct_index: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  explanation: z.string().min(1),
});

export const BiteContentSchema = z.object({
  title: z.string().min(1),
  learning_objective: z.string().min(1),
  text: z.string().min(1),
  key_terms: z.array(z.object({ term: z.string().min(1), definition: z.string().min(1) })),
  diagram: z.union([
    z.object({ kind: z.enum(['svg-hint', 'image-ref']), description: z.string().min(1) }),
    z.null(),
  ]),
  practice: z.object({
    type: z.enum(['drag', 'tap', 'select', 'short_answer']),
    prompt: z.string().min(1),
    solution: z.string().min(1),
  }),
  quiz: z.array(QuizItemSchema).min(2).max(5),
  duration_min: z.number().int().min(1).max(10),
  difficulty: z.number().int().min(1).max(5),
  prerequisites: z.array(z.string()),
});

// ─── Use Case 5: Weak-topic explanation ──────────────────────────────────────

export const WeakTopicExplanationSchema = z.object({
  why_struggling: z.string().min(1),
  prerequisite_gap: z.string().nullable(),
  suggested_approach: z.string().min(1),
  remedy_topic_ids: z.array(z.string()),
  parent_message: z.string().min(1),
  student_message: z.string().min(1),
});

// ─── Inferred types ───────────────────────────────────────────────────────────

export type ParsedTopicsResponse = z.infer<typeof ParsedTopicsResponseSchema>;
export type UploadPayload = z.infer<typeof UploadPayloadSchema>;
export type ScheduleJsonOutput = z.infer<typeof ScheduleJsonSchema>;
export type BiteContentOutput = z.infer<typeof BiteContentSchema>;
export type WeakTopicExplanation = z.infer<typeof WeakTopicExplanationSchema>;
