/**
 * SchoolHub — Demo Seed Script
 * Creates 3 test parent accounts with children, schedules, XP, badges, and exam dates.
 *
 * Run: pnpm tsx --env-file=.env scripts/seed-demo.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

// ── Fixed demo UUIDs (deterministic so script is idempotent) ─────────────────

const IDS = {
  // curriculum versions
  cvP6Math: 'a1000001-0000-0000-0000-000000000001',
  cvP6Eng:  'a1000002-0000-0000-0000-000000000002',
  cvP6Sci:  'a1000003-0000-0000-0000-000000000003',
  cvP6Chi:  'a1000004-0000-0000-0000-000000000004',
  cvP4Math: 'a1000005-0000-0000-0000-000000000005',
  cvP4Eng:  'a1000006-0000-0000-0000-000000000006',
  cvP3Math: 'a1000007-0000-0000-0000-000000000007',
  cvP3Eng:  'a1000008-0000-0000-0000-000000000008',
  cvP2Math: 'a1000009-0000-0000-0000-000000000009',
  // topics
  tP6Math1: 'b1000001-0000-0000-0000-000000000001',
  tP6Math2: 'b1000002-0000-0000-0000-000000000002',
  tP6Eng1:  'b1000003-0000-0000-0000-000000000003',
  tP6Eng2:  'b1000004-0000-0000-0000-000000000004',
  tP6Sci1:  'b1000005-0000-0000-0000-000000000005',
  tP6Sci2:  'b1000006-0000-0000-0000-000000000006',
  tP6Chi1:  'b1000007-0000-0000-0000-000000000007',
  tP4Math1: 'b1000008-0000-0000-0000-000000000008',
  tP4Math2: 'b1000009-0000-0000-0000-000000000009',
  tP4Eng1:  'b1000010-0000-0000-0000-000000000010',
  tP3Math1: 'b1000011-0000-0000-0000-000000000011',
  tP3Eng1:  'b1000012-0000-0000-0000-000000000012',
  tP2Math1: 'b1000013-0000-0000-0000-000000000013',
  // children
  childAva:   'c1000001-0000-0000-0000-000000000001',
  childBen:   'c1000002-0000-0000-0000-000000000002',
  childLily:  'c1000003-0000-0000-0000-000000000003',
  childArjun: 'c1000004-0000-0000-0000-000000000004',
  // schedules
  schedAva:   'd1000001-0000-0000-0000-000000000001',
  schedBen:   'd1000002-0000-0000-0000-000000000002',
  schedLily:  'd1000003-0000-0000-0000-000000000003',
  schedArjun: 'd1000004-0000-0000-0000-000000000004',
};

// ── Date helpers ──────────────────────────────────────────────────────────────

function addDays(base: string, n: number): string {
  const d = new Date(base + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function mondayOf(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay(); // 0=Sun
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

const TODAY = new Date().toISOString().slice(0, 10);

// ── Schedule builder ──────────────────────────────────────────────────────────

interface BiteDef {
  topic_id: string;
  subject: string;
  duration_min: number;
  intensity: 'low' | 'med' | 'high';
  is_review: boolean;
  date: string;
}

interface Week { week_number: number; week_start: string; bites: BiteDef[] }

function makeSchedule(
  slots: Array<{ daysFromToday: number; subject: string; topic_id: string; duration: number; intensity: 'low' | 'med' | 'high'; review?: boolean }>,
) {
  const weekMap = new Map<string, Week>();
  let weekNum = 1;

  for (const slot of slots) {
    const date = addDays(TODAY, slot.daysFromToday);
    const ws = mondayOf(date);
    if (!weekMap.has(ws)) {
      weekMap.set(ws, { week_number: weekNum++, week_start: ws, bites: [] });
    }
    weekMap.get(ws)!.bites.push({
      topic_id: slot.topic_id,
      subject: slot.subject,
      duration_min: slot.duration,
      intensity: slot.intensity,
      is_review: slot.review ?? false,
      date,
    });
  }

  const weeks = [...weekMap.values()].sort((a, b) => a.week_start.localeCompare(b.week_start));
  return { weeks, hash: `demo-hash-${Date.now()}` };
}

// ── Account definitions ───────────────────────────────────────────────────────

const ACCOUNTS = [
  {
    email: 'demo.sarah@schoolhub.app',
    password: 'SchoolHub2026!',
    name: 'Sarah Tan',
    role: 'parent' as const,
    plan: 'scholar_pro' as const,
  },
  {
    email: 'demo.david@schoolhub.app',
    password: 'SchoolHub2026!',
    name: 'David Chen',
    role: 'parent' as const,
    plan: 'scholar' as const,
  },
  {
    email: 'demo.priya@schoolhub.app',
    password: 'SchoolHub2026!',
    name: 'Priya Kumar',
    role: 'parent' as const,
    plan: 'free_trial' as const,
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function run() {
  console.log('\n🌱  SchoolHub Demo Seed\n');

  // ─ 1. Curriculum versions ─────────────────────────────────────────────────
  console.log('1/7  Seeding curriculum versions…');
  const cvRows = [
    { id: IDS.cvP6Math, curriculum_type: 'MOE', level: 'P6', subject: 'Mathematics', version: 'demo', source_hash: 'demo-p6-math', parsed_topics: [], status: 'parsed', release_date: '2026-01-01' },
    { id: IDS.cvP6Eng,  curriculum_type: 'MOE', level: 'P6', subject: 'English',     version: 'demo', source_hash: 'demo-p6-eng',  parsed_topics: [], status: 'parsed', release_date: '2026-01-01' },
    { id: IDS.cvP6Sci,  curriculum_type: 'MOE', level: 'P6', subject: 'Science',     version: 'demo', source_hash: 'demo-p6-sci',  parsed_topics: [], status: 'parsed', release_date: '2026-01-01' },
    { id: IDS.cvP6Chi,  curriculum_type: 'MOE', level: 'P6', subject: 'Chinese',     version: 'demo', source_hash: 'demo-p6-chi',  parsed_topics: [], status: 'parsed', release_date: '2026-01-01' },
    { id: IDS.cvP4Math, curriculum_type: 'MOE', level: 'P4', subject: 'Mathematics', version: 'demo', source_hash: 'demo-p4-math', parsed_topics: [], status: 'parsed', release_date: '2026-01-01' },
    { id: IDS.cvP4Eng,  curriculum_type: 'MOE', level: 'P4', subject: 'English',     version: 'demo', source_hash: 'demo-p4-eng',  parsed_topics: [], status: 'parsed', release_date: '2026-01-01' },
    { id: IDS.cvP3Math, curriculum_type: 'MOE', level: 'P3', subject: 'Mathematics', version: 'demo', source_hash: 'demo-p3-math', parsed_topics: [], status: 'parsed', release_date: '2026-01-01' },
    { id: IDS.cvP3Eng,  curriculum_type: 'MOE', level: 'P3', subject: 'English',     version: 'demo', source_hash: 'demo-p3-eng',  parsed_topics: [], status: 'parsed', release_date: '2026-01-01' },
    { id: IDS.cvP2Math, curriculum_type: 'MOE', level: 'P2', subject: 'Mathematics', version: 'demo', source_hash: 'demo-p2-math', parsed_topics: [], status: 'parsed', release_date: '2026-01-01' },
  ];
  const { error: cvErr } = await supabase.from('curriculum_versions').upsert(cvRows, { onConflict: 'source_hash', ignoreDuplicates: true });
  if (cvErr) throw new Error(`curriculum_versions: ${cvErr.message}`);

  // ─ 2. Topics ──────────────────────────────────────────────────────────────
  console.log('2/7  Seeding topics…');
  const topicRows = [
    // P6 Math
    { id: IDS.tP6Math1, curriculum_version_id: IDS.cvP6Math, topic_name: 'Algebra — Variables & Expressions',  sequence: 1, exam_weight_percentage: 15, estimated_hours: 4, difficulty_level: 3, prerequisites: [] },
    { id: IDS.tP6Math2, curriculum_version_id: IDS.cvP6Math, topic_name: 'Ratio, Rate & Proportion',          sequence: 2, exam_weight_percentage: 20, estimated_hours: 5, difficulty_level: 4, prerequisites: [] },
    // P6 English
    { id: IDS.tP6Eng1,  curriculum_version_id: IDS.cvP6Eng,  topic_name: 'Comprehension — Inference Skills',  sequence: 1, exam_weight_percentage: 25, estimated_hours: 5, difficulty_level: 3, prerequisites: [] },
    { id: IDS.tP6Eng2,  curriculum_version_id: IDS.cvP6Eng,  topic_name: 'Composition — Narrative Writing',   sequence: 2, exam_weight_percentage: 20, estimated_hours: 4, difficulty_level: 4, prerequisites: [] },
    // P6 Science
    { id: IDS.tP6Sci1,  curriculum_version_id: IDS.cvP6Sci,  topic_name: 'Cells & Systems',                  sequence: 1, exam_weight_percentage: 20, estimated_hours: 4, difficulty_level: 3, prerequisites: [] },
    { id: IDS.tP6Sci2,  curriculum_version_id: IDS.cvP6Sci,  topic_name: 'Energy — Forces & Motion',         sequence: 2, exam_weight_percentage: 20, estimated_hours: 4, difficulty_level: 4, prerequisites: [] },
    // P6 Chinese
    { id: IDS.tP6Chi1,  curriculum_version_id: IDS.cvP6Chi,  topic_name: '阅读理解 — 字义与句意',              sequence: 1, exam_weight_percentage: 30, estimated_hours: 4, difficulty_level: 3, prerequisites: [] },
    // P4 Math
    { id: IDS.tP4Math1, curriculum_version_id: IDS.cvP4Math, topic_name: 'Whole Numbers — Multiplication & Division', sequence: 1, exam_weight_percentage: 20, estimated_hours: 4, difficulty_level: 2, prerequisites: [] },
    { id: IDS.tP4Math2, curriculum_version_id: IDS.cvP4Math, topic_name: 'Fractions — Adding & Subtracting', sequence: 2, exam_weight_percentage: 20, estimated_hours: 4, difficulty_level: 3, prerequisites: [] },
    // P4 English
    { id: IDS.tP4Eng1,  curriculum_version_id: IDS.cvP4Eng,  topic_name: 'Grammar — Tenses & Agreement',     sequence: 1, exam_weight_percentage: 25, estimated_hours: 3, difficulty_level: 2, prerequisites: [] },
    // P3 Math
    { id: IDS.tP3Math1, curriculum_version_id: IDS.cvP3Math, topic_name: 'Mental Maths & Tables',            sequence: 1, exam_weight_percentage: 25, estimated_hours: 3, difficulty_level: 2, prerequisites: [] },
    // P3 English
    { id: IDS.tP3Eng1,  curriculum_version_id: IDS.cvP3Eng,  topic_name: 'Phonics & Spelling Patterns',      sequence: 1, exam_weight_percentage: 20, estimated_hours: 3, difficulty_level: 1, prerequisites: [] },
    // P2 Math
    { id: IDS.tP2Math1, curriculum_version_id: IDS.cvP2Math, topic_name: 'Numbers to 1000 — Place Value',    sequence: 1, exam_weight_percentage: 30, estimated_hours: 3, difficulty_level: 1, prerequisites: [] },
  ];
  const { error: topicErr } = await supabase.from('topics').upsert(topicRows, { onConflict: 'id', ignoreDuplicates: true });
  if (topicErr) throw new Error(`topics: ${topicErr.message}`);

  // ─ 3. Auth users ──────────────────────────────────────────────────────────
  console.log('3/7  Creating auth users…');
  const userIds: Record<string, string> = {};

  for (const acc of ACCOUNTS) {
    // Try to find existing user first
    const { data: existing } = await supabase.auth.admin.listUsers();
    const found = existing?.users?.find(u => u.email === acc.email);

    if (found) {
      console.log(`     ↳ ${acc.email} already exists`);
      userIds[acc.email] = found.id;
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: acc.email,
        password: acc.password,
        email_confirm: true,
        user_metadata: { full_name: acc.name },
      });
      if (error) throw new Error(`auth.createUser(${acc.email}): ${error.message}`);
      userIds[acc.email] = data.user.id;
      console.log(`     ↳ ${acc.email} created (${data.user.id})`);
    }
  }

  const sarahId = userIds['demo.sarah@schoolhub.app'];
  const davidId = userIds['demo.david@schoolhub.app'];
  const priyaId = userIds['demo.priya@schoolhub.app'];

  // ─ 4. Public users rows ───────────────────────────────────────────────────
  console.log('4/7  Seeding public.users…');
  const publicUsers = [
    { id: sarahId, email: 'demo.sarah@schoolhub.app', role: 'parent', plan: 'scholar_pro' },
    { id: davidId, email: 'demo.david@schoolhub.app', role: 'parent', plan: 'scholar' },
    { id: priyaId, email: 'demo.priya@schoolhub.app', role: 'parent', plan: 'free_trial' },
  ];
  const { error: userErr } = await supabase.from('users').upsert(publicUsers, { onConflict: 'id', ignoreDuplicates: true });
  if (userErr) throw new Error(`public.users: ${userErr.message}`);

  // ─ 5. Children ────────────────────────────────────────────────────────────
  console.log('5/7  Seeding children…');
  const children = [
    // Sarah's children
    { id: IDS.childAva,   parent_id: sarahId, name: 'Ava',   grade_level: 'P6', grade_band: 'Upper_Primary', sen_profile: 'ADHD',            gamification_enabled: true  },
    { id: IDS.childBen,   parent_id: sarahId, name: 'Ben',   grade_level: 'P4', grade_band: 'Upper_Primary', sen_profile: null,              gamification_enabled: true  },
    // David's children
    { id: IDS.childLily,  parent_id: davidId, name: 'Lily',  grade_level: 'P3', grade_band: 'Lower_Primary', sen_profile: 'Autism_Spectrum', gamification_enabled: true  },
    // Priya's children
    { id: IDS.childArjun, parent_id: priyaId, name: 'Arjun', grade_level: 'P2', grade_band: 'Lower_Primary', sen_profile: null,              gamification_enabled: false },
  ];
  const { error: childErr } = await supabase.from('children').upsert(children, { onConflict: 'id', ignoreDuplicates: true });
  if (childErr) throw new Error(`children: ${childErr.message}`);

  // ─ 6. Study schedules ─────────────────────────────────────────────────────
  console.log('6/7  Seeding schedules, bites, XP & badges…');

  // ── Ava (P6, ADHD) — 4 subjects, 4 weeks, ADHD: 5min bites ──
  const avaScheduleJson = makeSchedule([
    // This week (remaining days + next few)
    { daysFromToday: 0,  subject: 'Mathematics', topic_id: IDS.tP6Math1, duration: 5,  intensity: 'med'  },
    { daysFromToday: 0,  subject: 'English',     topic_id: IDS.tP6Eng1,  duration: 5,  intensity: 'low'  },
    { daysFromToday: 1,  subject: 'Science',     topic_id: IDS.tP6Sci1,  duration: 5,  intensity: 'med'  },
    { daysFromToday: 1,  subject: 'Chinese',     topic_id: IDS.tP6Chi1,  duration: 5,  intensity: 'low'  },
    { daysFromToday: 2,  subject: 'Mathematics', topic_id: IDS.tP6Math2, duration: 5,  intensity: 'high' },
    { daysFromToday: 2,  subject: 'English',     topic_id: IDS.tP6Eng2,  duration: 5,  intensity: 'med'  },
    { daysFromToday: 3,  subject: 'Science',     topic_id: IDS.tP6Sci2,  duration: 5,  intensity: 'med'  },
    { daysFromToday: 3,  subject: 'Chinese',     topic_id: IDS.tP6Chi1,  duration: 5,  intensity: 'low', review: true },
    { daysFromToday: 4,  subject: 'Mathematics', topic_id: IDS.tP6Math1, duration: 5,  intensity: 'low', review: true },
    { daysFromToday: 4,  subject: 'English',     topic_id: IDS.tP6Eng1,  duration: 5,  intensity: 'low', review: true },
    // Next week
    { daysFromToday: 7,  subject: 'Mathematics', topic_id: IDS.tP6Math2, duration: 5,  intensity: 'med'  },
    { daysFromToday: 7,  subject: 'Science',     topic_id: IDS.tP6Sci1,  duration: 5,  intensity: 'high' },
    { daysFromToday: 8,  subject: 'English',     topic_id: IDS.tP6Eng2,  duration: 5,  intensity: 'med'  },
    { daysFromToday: 8,  subject: 'Chinese',     topic_id: IDS.tP6Chi1,  duration: 5,  intensity: 'med'  },
    { daysFromToday: 9,  subject: 'Mathematics', topic_id: IDS.tP6Math1, duration: 5,  intensity: 'med'  },
    { daysFromToday: 9,  subject: 'Science',     topic_id: IDS.tP6Sci2,  duration: 5,  intensity: 'low', review: true },
    { daysFromToday: 10, subject: 'English',     topic_id: IDS.tP6Eng1,  duration: 5,  intensity: 'high' },
    { daysFromToday: 11, subject: 'Chinese',     topic_id: IDS.tP6Chi1,  duration: 5,  intensity: 'med'  },
    { daysFromToday: 11, subject: 'Mathematics', topic_id: IDS.tP6Math2, duration: 5,  intensity: 'low', review: true },
    // Week 3
    { daysFromToday: 14, subject: 'Science',     topic_id: IDS.tP6Sci1,  duration: 5,  intensity: 'high' },
    { daysFromToday: 14, subject: 'Mathematics', topic_id: IDS.tP6Math1, duration: 5,  intensity: 'med'  },
    { daysFromToday: 15, subject: 'English',     topic_id: IDS.tP6Eng2,  duration: 5,  intensity: 'med'  },
    { daysFromToday: 16, subject: 'Chinese',     topic_id: IDS.tP6Chi1,  duration: 5,  intensity: 'high' },
    { daysFromToday: 17, subject: 'Mathematics', topic_id: IDS.tP6Math2, duration: 5,  intensity: 'med'  },
    { daysFromToday: 18, subject: 'Science',     topic_id: IDS.tP6Sci2,  duration: 5,  intensity: 'med'  },
  ]);

  // ── Ben (P4) — 2 subjects, 3 weeks ──
  const benScheduleJson = makeSchedule([
    { daysFromToday: 0,  subject: 'Mathematics', topic_id: IDS.tP4Math1, duration: 10, intensity: 'med'  },
    { daysFromToday: 1,  subject: 'English',     topic_id: IDS.tP4Eng1,  duration: 10, intensity: 'low'  },
    { daysFromToday: 2,  subject: 'Mathematics', topic_id: IDS.tP4Math2, duration: 10, intensity: 'high' },
    { daysFromToday: 3,  subject: 'English',     topic_id: IDS.tP4Eng1,  duration: 10, intensity: 'med'  },
    { daysFromToday: 4,  subject: 'Mathematics', topic_id: IDS.tP4Math1, duration: 10, intensity: 'low', review: true },
    { daysFromToday: 7,  subject: 'Mathematics', topic_id: IDS.tP4Math2, duration: 10, intensity: 'med'  },
    { daysFromToday: 8,  subject: 'English',     topic_id: IDS.tP4Eng1,  duration: 10, intensity: 'high' },
    { daysFromToday: 9,  subject: 'Mathematics', topic_id: IDS.tP4Math1, duration: 10, intensity: 'med'  },
    { daysFromToday: 10, subject: 'English',     topic_id: IDS.tP4Eng1,  duration: 10, intensity: 'low', review: true },
    { daysFromToday: 14, subject: 'Mathematics', topic_id: IDS.tP4Math2, duration: 10, intensity: 'high' },
    { daysFromToday: 15, subject: 'English',     topic_id: IDS.tP4Eng1,  duration: 10, intensity: 'med'  },
    { daysFromToday: 16, subject: 'Mathematics', topic_id: IDS.tP4Math1, duration: 10, intensity: 'med'  },
  ]);

  // ── Lily (P3, ASD) — 2 subjects, predictable schedule ──
  const lilyScheduleJson = makeSchedule([
    { daysFromToday: 0,  subject: 'Mathematics', topic_id: IDS.tP3Math1, duration: 10, intensity: 'low'  },
    { daysFromToday: 1,  subject: 'English',     topic_id: IDS.tP3Eng1,  duration: 10, intensity: 'low'  },
    { daysFromToday: 2,  subject: 'Mathematics', topic_id: IDS.tP3Math1, duration: 10, intensity: 'med'  },
    { daysFromToday: 3,  subject: 'English',     topic_id: IDS.tP3Eng1,  duration: 10, intensity: 'low'  },
    { daysFromToday: 4,  subject: 'Mathematics', topic_id: IDS.tP3Math1, duration: 10, intensity: 'low', review: true },
    { daysFromToday: 7,  subject: 'English',     topic_id: IDS.tP3Eng1,  duration: 10, intensity: 'med'  },
    { daysFromToday: 8,  subject: 'Mathematics', topic_id: IDS.tP3Math1, duration: 10, intensity: 'med'  },
    { daysFromToday: 9,  subject: 'English',     topic_id: IDS.tP3Eng1,  duration: 10, intensity: 'low', review: true },
    { daysFromToday: 10, subject: 'Mathematics', topic_id: IDS.tP3Math1, duration: 10, intensity: 'high' },
    { daysFromToday: 11, subject: 'English',     topic_id: IDS.tP3Eng1,  duration: 10, intensity: 'med'  },
  ]);

  // ── Arjun (P2) — 1 subject, 2 weeks ──
  const arjunScheduleJson = makeSchedule([
    { daysFromToday: 0,  subject: 'Mathematics', topic_id: IDS.tP2Math1, duration: 10, intensity: 'low'  },
    { daysFromToday: 1,  subject: 'Mathematics', topic_id: IDS.tP2Math1, duration: 10, intensity: 'med'  },
    { daysFromToday: 2,  subject: 'Mathematics', topic_id: IDS.tP2Math1, duration: 10, intensity: 'low'  },
    { daysFromToday: 3,  subject: 'Mathematics', topic_id: IDS.tP2Math1, duration: 10, intensity: 'med'  },
    { daysFromToday: 4,  subject: 'Mathematics', topic_id: IDS.tP2Math1, duration: 10, intensity: 'low', review: true },
    { daysFromToday: 7,  subject: 'Mathematics', topic_id: IDS.tP2Math1, duration: 10, intensity: 'med'  },
    { daysFromToday: 8,  subject: 'Mathematics', topic_id: IDS.tP2Math1, duration: 10, intensity: 'high' },
    { daysFromToday: 9,  subject: 'Mathematics', topic_id: IDS.tP2Math1, duration: 10, intensity: 'med'  },
  ]);

  const scheduleRows = [
    { id: IDS.schedAva,   child_id: IDS.childAva,   schedule_json: avaScheduleJson,   schedule_hash: avaScheduleJson.hash,   trigger_reason: 'initial', confirmed_by_parent: true },
    { id: IDS.schedBen,   child_id: IDS.childBen,   schedule_json: benScheduleJson,   schedule_hash: benScheduleJson.hash,   trigger_reason: 'initial', confirmed_by_parent: true },
    { id: IDS.schedLily,  child_id: IDS.childLily,  schedule_json: lilyScheduleJson,  schedule_hash: lilyScheduleJson.hash,  trigger_reason: 'initial', confirmed_by_parent: true },
    { id: IDS.schedArjun, child_id: IDS.childArjun, schedule_json: arjunScheduleJson, schedule_hash: arjunScheduleJson.hash, trigger_reason: 'initial', confirmed_by_parent: true },
  ];
  const { error: schedErr } = await supabase.from('study_schedules').upsert(scheduleRows, { onConflict: 'id', ignoreDuplicates: true });
  if (schedErr) throw new Error(`study_schedules: ${schedErr.message}`);

  // ─ Schedule bites (for streak + bites_this_week) ──────────────────────────
  // Insert completed bites for past days to drive streak counts
  // Ava: 7-day streak (days -6 to 0)
  // Ben: 3-day streak (days -2 to 0)
  // Lily: 5-day streak (days -4 to 0)
  // Arjun: 2-day streak (days -1 to 0)

  type BiteSeedRow = {
    schedule_id: string; child_id: string; topic_id: string;
    planned_date: string; week_start: string;
    completed_at: string | null;
  };

  function completedBiteRows(childId: string, schedId: string, topicId: string, streakDays: number): BiteSeedRow[] {
    return Array.from({ length: streakDays }, (_, i) => {
      const date = addDays(TODAY, -(streakDays - 1 - i));
      return {
        schedule_id: schedId,
        child_id: childId,
        topic_id: topicId,
        planned_date: date,
        week_start: mondayOf(date),
        completed_at: `${date}T10:00:00+08:00`,
      };
    });
  }

  // Also add today's bites as incomplete (for this week's total)
  function pendingBiteRows(childId: string, schedId: string, topicId: string, count: number): BiteSeedRow[] {
    return Array.from({ length: count }, () => ({
      schedule_id: schedId,
      child_id: childId,
      topic_id: topicId,
      planned_date: TODAY,
      week_start: mondayOf(TODAY),
      completed_at: null,
    }));
  }

  const biteRows: BiteSeedRow[] = [
    ...completedBiteRows(IDS.childAva,   IDS.schedAva,   IDS.tP6Math1, 7),
    ...pendingBiteRows(IDS.childAva,   IDS.schedAva,   IDS.tP6Eng1,  2),
    ...completedBiteRows(IDS.childBen,   IDS.schedBen,   IDS.tP4Math1, 3),
    ...pendingBiteRows(IDS.childBen,   IDS.schedBen,   IDS.tP4Eng1,  1),
    ...completedBiteRows(IDS.childLily,  IDS.schedLily,  IDS.tP3Math1, 5),
    ...pendingBiteRows(IDS.childLily,  IDS.schedLily,  IDS.tP3Eng1,  1),
    ...completedBiteRows(IDS.childArjun, IDS.schedArjun, IDS.tP2Math1, 2),
    ...pendingBiteRows(IDS.childArjun, IDS.schedArjun, IDS.tP2Math1, 1),
  ];

  // Insert in batches to avoid size limits (ignore duplicates since we don't have stable IDs)
  const BATCH = 50;
  for (let i = 0; i < biteRows.length; i += BATCH) {
    const { error: bErr } = await supabase.from('schedule_bites').insert(biteRows.slice(i, i + BATCH));
    if (bErr && !bErr.message.includes('duplicate')) throw new Error(`schedule_bites: ${bErr.message}`);
  }

  // ─ XP events ─────────────────────────────────────────────────────────────
  function xpRows(childId: string, total: number) {
    const perBite = Math.floor(total / 10);
    return Array.from({ length: 10 }, (_, i) => ({
      child_id: childId,
      event_type: 'bite_complete' as const,
      xp_delta: perBite + (i === 9 ? total - perBite * 10 : 0),
      created_at: addDays(TODAY, -(10 - i)) + 'T10:00:00+08:00',
    }));
  }

  const xpData = [
    ...xpRows(IDS.childAva,   520),
    ...xpRows(IDS.childBen,   180),
    ...xpRows(IDS.childLily,  280),
    ...xpRows(IDS.childArjun, 80),
  ];
  const { error: xpErr } = await supabase.from('xp_events').insert(xpData);
  if (xpErr && !xpErr.message.includes('duplicate')) throw new Error(`xp_events: ${xpErr.message}`);

  // ─ Badges ─────────────────────────────────────────────────────────────────
  const badgeData = [
    { child_id: IDS.childAva,  subject: 'Mathematics', tier: 'gold',   unlocked_at: addDays(TODAY, -2) + 'T10:00:00+08:00' },
    { child_id: IDS.childAva,  subject: 'Science',     tier: 'silver', unlocked_at: addDays(TODAY, -5) + 'T10:00:00+08:00' },
    { child_id: IDS.childBen,  subject: 'English',     tier: 'silver', unlocked_at: addDays(TODAY, -1) + 'T10:00:00+08:00' },
    { child_id: IDS.childLily, subject: 'Mathematics', tier: 'bronze', unlocked_at: addDays(TODAY, -3) + 'T10:00:00+08:00' },
  ];
  const { error: badgeErr } = await supabase.from('badges').upsert(badgeData, { onConflict: 'child_id,subject,tier', ignoreDuplicates: true });
  if (badgeErr) throw new Error(`badges: ${badgeErr.message}`);

  // ─ Assessment dates (exam countdown) ──────────────────────────────────────
  console.log('7/7  Seeding exam dates…');

  const examPayloads: Record<string, { dates: Array<{ label: string; date: string; subject: string | null }> }> = {
    [IDS.childAva]: {
      dates: [
        { label: 'PSLE English',     date: '2026-10-01', subject: 'English' },
        { label: 'PSLE Mathematics', date: '2026-10-05', subject: 'Mathematics' },
        { label: 'PSLE Science',     date: '2026-10-07', subject: 'Science' },
        { label: 'PSLE Chinese',     date: '2026-10-09', subject: 'Chinese' },
      ],
    },
    [IDS.childBen]: {
      dates: [
        { label: 'SA1 Mathematics',  date: '2026-06-08', subject: 'Mathematics' },
        { label: 'SA1 English',      date: '2026-06-09', subject: 'English' },
      ],
    },
    [IDS.childLily]: {
      dates: [
        { label: 'SA1 Mathematics',  date: '2026-06-08', subject: 'Mathematics' },
        { label: 'SA1 English',      date: '2026-06-10', subject: 'English' },
      ],
    },
    [IDS.childArjun]: {
      dates: [
        { label: 'CA1 Mathematics',  date: '2026-06-05', subject: 'Mathematics' },
      ],
    },
  };

  const uploadParents: Record<string, string> = {
    [IDS.childAva]:   sarahId,
    [IDS.childBen]:   sarahId,
    [IDS.childLily]:  davidId,
    [IDS.childArjun]: priyaId,
  };

  for (const [childId, payload] of Object.entries(examPayloads)) {
    const { error: upErr } = await supabase.from('uploads').insert({
      parent_id: uploadParents[childId],
      child_id: childId,
      file_type: 'assessment_dates',
      original_filename: 'exam-dates-demo.pdf',
      storage_path: 'demo/exam-dates.pdf',
      status: 'parsed',
      parsed_payload: payload,
    });
    if (upErr && !upErr.message.includes('duplicate')) throw new Error(`uploads: ${upErr.message}`);
  }

  // ─ Done ───────────────────────────────────────────────────────────────────
  console.log('\n✅  Seed complete!\n');
  console.log('─────────────────────────────────────────────────────');
  console.log('  TEST ACCOUNTS');
  console.log('─────────────────────────────────────────────────────');
  console.log('  Account 1 — Power User (2 children, Scholar Pro)');
  console.log('  Email   : demo.sarah@schoolhub.app');
  console.log('  Password: SchoolHub2026!');
  console.log('  Children: Ava (P6 · ADHD) + Ben (P4)');
  console.log('');
  console.log('  Account 2 — SEN Parent (1 child, Scholar)');
  console.log('  Email   : demo.david@schoolhub.app');
  console.log('  Password: SchoolHub2026!');
  console.log('  Children: Lily (P3 · Autism Spectrum)');
  console.log('');
  console.log('  Account 3 — Free Trial (1 child)');
  console.log('  Email   : demo.priya@schoolhub.app');
  console.log('  Password: SchoolHub2026!');
  console.log('  Children: Arjun (P2)');
  console.log('─────────────────────────────────────────────────────\n');
}

run().catch(err => {
  console.error('\n❌  Seed failed:', err);
  process.exit(1);
});
