// ─── Enums ────────────────────────────────────────────────────────────────────

export type GradeLevel = 'K2' | 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6';
export type GradeBand = 'K2' | 'Lower_Primary' | 'Upper_Primary';
export type SENProfile = 'ADHD' | 'Autism_Spectrum' | 'Other_SEN' | null;
export type UserPlan = 'free_trial' | 'scholar' | 'scholar_pro';
export type UserRole = 'parent' | 'student';

export type Subject =
  | 'English'
  | 'Mathematics'
  | 'Science'
  | 'Chinese'
  | 'Malay'
  | 'Tamil'
  | 'Social_Studies';

export type WellbeingSignalType =
  | 'overload_risk'
  | 'burnout_risk'
  | 'comprehension_plateau'
  | 'activity_imbalance'
  | 'exam_anxiety';

export type UploadFileType =
  | 'spelling_list'
  | 'assessment_dates'
  | 'school_calendar'
  | 'moe_syllabus';

export type ParseStatus = 'queued' | 'parsing' | 'parsed' | 'failed';

export type TriggerReason =
  | 'initial'
  | 'manual'
  | 'low_completion'
  | 'exam_change'
  | 'calendar_change'
  | 'sen_change';

export type BadgeTier = 'bronze' | 'silver' | 'gold';

export type XPEventType =
  | 'bite_complete'
  | 'correct_answer'
  | 'streak_milestone'
  | 'ahead_of_schedule';

export type MoodRating = 'struggling' | 'okay' | 'got_it';
export type AcknowledgementType = 'accepted' | 'modified' | 'dismissed';
export type NotificationChannel = 'telegram' | 'sms';
export type NotificationMode = 'weekly_digest' | 'daily_progress' | 'realtime';
export type WellbeingStatus = 'green' | 'amber' | 'red';
export type Intensity = 'low' | 'med' | 'high';

// ─── Database entities ────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  role: UserRole;
  plan: UserPlan;
  trial_ends_at: string | null;
  telegram_id: string | null;
  created_at: string;
}

export interface Child {
  id: string;
  parent_id: string;
  name: string;
  grade_level: GradeLevel;
  grade_band: GradeBand;
  sen_profile: SENProfile;
  gamification_enabled: boolean;
  p1_intake_date: string | null;
  created_at: string;
}

export interface CurriculumVersion {
  id: string;
  curriculum_type: 'MOE';
  level: Exclude<GradeLevel, 'K2'>;
  subject: Subject;
  version: string;
  source_hash: string;
  parsed_topics: ParsedTopic[];
  status: ParseStatus;
  release_date: string;
}

export interface Topic {
  id: string;
  curriculum_version_id: string;
  topic_name: string;
  sequence: number;
  exam_weight_percentage: number;
  estimated_hours: number;
  difficulty_level: number; // 1–5
  prerequisites: string[]; // topic ids
  created_at: string;
}

export interface StudySchedule {
  id: string;
  child_id: string;
  schedule_json: ScheduleJson;
  generated_at: string;
  trigger_reason: TriggerReason;
  schedule_hash: string;
  activates_at: string;
  confirmed_by_parent: boolean;
}

export interface ScheduleBite {
  id: string;
  schedule_id: string;
  child_id: string;
  topic_id: string;
  bite_id: string | null;
  planned_date: string; // YYYY-MM-DD
  week_start: string;   // YYYY-MM-DD (Monday)
  completed_at: string | null;
  duration_sec: number | null;
  mood: MoodRating | null;
}

export interface Bite {
  id: string;
  topic_id: string;
  content_json: BiteContent;
  duration_min: number;
  grade_band: GradeBand;
  sen_variant: Exclude<SENProfile, null> | null;
  prompt_version: string;
  cache_key: string;
}

export interface XPEvent {
  id: string;
  child_id: string;
  event_type: XPEventType;
  xp_delta: number;
  created_at: string;
}

export interface Badge {
  id: string;
  child_id: string;
  subject: Subject;
  tier: BadgeTier;
  unlocked_at: string;
}

export interface Upload {
  id: string;
  parent_id: string;
  child_id: string | null;
  file_type: UploadFileType;
  original_filename: string;
  storage_path: string;
  status: ParseStatus;
  parsed_payload: unknown;
  error_json: UploadError | null;
  created_at: string;
}

export interface WellbeingSignal {
  id: string;
  child_id: string;
  signal_type: WellbeingSignalType;
  triggered_at: string;
  resolved_at: string | null;
  recommended_action: string;
  acknowledged_by: string | null;
  acknowledgement: AcknowledgementType | null;
}

export interface ParseQueue {
  id: string;
  source_type: 'curriculum' | 'upload';
  source_id: string;
  status: ParseStatus;
  retries: number;
  last_error: string | null;
  created_at: string;
}

export interface NotificationPrefs {
  id: string;
  parent_id: string;
  channel: NotificationChannel;
  mode: NotificationMode;
  telegram_chat_id: string | null;
  fallback_sms: boolean;
  created_at: string;
}

export interface WeeklyCard {
  id: string;
  child_id: string;
  image_url: string;
  pdf_url: string;
  generated_at: string;
  expires_at: string;
  wellbeing_status: WellbeingStatus;
  week_start: string;
  created_at: string;
}

// ─── JSONB shapes ─────────────────────────────────────────────────────────────

export interface ParsedTopic {
  id: string;
  sequence: number;
  name: string;
  chapter_numbers: string[];
  learning_objectives: string[];
  estimated_hours: number;
  estimated?: boolean;
  exam_weight_percentage: number;
  prerequisites: string[];
  key_concepts: string[];
  content_strands: string[];
  difficulty_level: number;
}

export interface ScheduleJson {
  weeks: ScheduleWeek[];
  buffer_weeks: number;
  hash: string;
}

export interface ScheduleWeek {
  week_number: number;
  date_range: string;
  bites: ScheduledBiteSlot[];
  total_minutes: number;
  holiday_days: string[];
  notes: string;
}

export interface ScheduledBiteSlot {
  topic_id: string;
  subject: Subject;
  duration_min: number;
  intensity: Intensity;
  is_review: boolean;
  date: string;
}

export interface BiteContent {
  title: string;
  learning_objective: string;
  text: string;
  key_terms: Array<{ term: string; definition: string }>;
  diagram: { kind: 'svg-hint' | 'image-ref'; description: string } | null;
  practice: {
    type: 'drag' | 'tap' | 'select' | 'short_answer';
    prompt: string;
    solution: string;
  };
  quiz: QuizItem[];
  duration_min: number;
  difficulty: number;
  prerequisites: string[];
}

export interface QuizItem {
  question: string;
  options: [string, string, string, string];
  correct_index: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface UploadError {
  errors: Array<{ field: string; reason: string; raw_value?: string }>;
}

// ─── API payloads ─────────────────────────────────────────────────────────────

export interface ScheduleRegeneratePreview {
  reason_text: string;
  added_bites: number;
  removed_bites: number;
  shifted_bites: number;
  old_schedule_hash: string;
  new_schedule_hash: string;
  weeks_changed: number[];
}

export interface ScheduleActivation {
  mode: 'immediate' | 'delayed_48h';
  activates_at: string;
}

export interface SiblingConflict {
  date: string;
  type: 'overlapping_high_intensity' | 'multiple_assessments';
  children: string[];
  suggestion: string;
}

export interface ExamCountdownItem {
  label: string;
  date: string;
  days_remaining: number;
  colour: 'green' | 'yellow' | 'red';
}

// ─── WebSocket events ─────────────────────────────────────────────────────────

export type WSEvent =
  | { type: 'xp.awarded'; child_id: string; xp_delta: number; total_xp: number }
  | { type: 'badge.unlocked'; child_id: string; subject: Subject; tier: BadgeTier }
  | { type: 'streak.updated'; child_id: string; streak_days: number }
  | { type: 'wellbeing.signal'; child_id: string; signal_type: WellbeingSignalType }
  | { type: 'upload.parsed'; upload_id: string; status: ParseStatus };

// ─── Grade-band helpers ───────────────────────────────────────────────────────

export function gradeBandForLevel(level: GradeLevel): GradeBand {
  if (level === 'K2') return 'K2';
  if (['P1', 'P2', 'P3'].includes(level)) return 'Lower_Primary';
  return 'Upper_Primary';
}

/** ADHD or K2 → 5 min cap; all others → 10 min */
export function biteDurationCap(band: GradeBand, sen: SENProfile): number {
  if (sen === 'ADHD' || band === 'K2') return 5;
  return 10;
}
