-- ============================================================
-- SchoolHub — Demo Seed (run in Supabase SQL Editor)
-- Creates 3 parent accounts with children, schedules, XP & badges
-- ============================================================

-- ── Auth users (bypasses email confirmation) ────────────────────────────────
-- Note: Supabase SQL Editor runs as postgres superuser → no RLS restrictions

DO $$
DECLARE
  sarah_id  uuid;
  david_id  uuid;
  priya_id  uuid;
BEGIN

-- ── 1. Create auth users ────────────────────────────────────────────────────

-- Account 1: Sarah Tan (demo.sarah@schoolhub.app / SchoolHub2026!)
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, aud, role
)
SELECT
  gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
  'demo.sarah@schoolhub.app',
  crypt('SchoolHub2026!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Sarah Tan"}'::jsonb,
  now(), now(), 'authenticated', 'authenticated'
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'demo.sarah@schoolhub.app'
)
RETURNING id INTO sarah_id;

IF sarah_id IS NULL THEN
  SELECT id INTO sarah_id FROM auth.users WHERE email = 'demo.sarah@schoolhub.app';
END IF;

-- Account 2: David Chen (demo.david@schoolhub.app / SchoolHub2026!)
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, aud, role
)
SELECT
  gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
  'demo.david@schoolhub.app',
  crypt('SchoolHub2026!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"David Chen"}'::jsonb,
  now(), now(), 'authenticated', 'authenticated'
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'demo.david@schoolhub.app'
)
RETURNING id INTO david_id;

IF david_id IS NULL THEN
  SELECT id INTO david_id FROM auth.users WHERE email = 'demo.david@schoolhub.app';
END IF;

-- Account 3: Priya Kumar (demo.priya@schoolhub.app / SchoolHub2026!)
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, aud, role
)
SELECT
  gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
  'demo.priya@schoolhub.app',
  crypt('SchoolHub2026!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Priya Kumar"}'::jsonb,
  now(), now(), 'authenticated', 'authenticated'
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'demo.priya@schoolhub.app'
)
RETURNING id INTO priya_id;

IF priya_id IS NULL THEN
  SELECT id INTO priya_id FROM auth.users WHERE email = 'demo.priya@schoolhub.app';
END IF;

-- ── 2. Public users rows ─────────────────────────────────────────────────────

INSERT INTO public.users (id, email, role, plan)
VALUES
  (sarah_id, 'demo.sarah@schoolhub.app', 'parent', 'scholar_pro'),
  (david_id, 'demo.david@schoolhub.app', 'parent', 'scholar'),
  (priya_id, 'demo.priya@schoolhub.app', 'parent', 'free_trial')
ON CONFLICT (id) DO NOTHING;

-- ── 3. Curriculum versions (shared reference data) ───────────────────────────

INSERT INTO public.curriculum_versions
  (id, curriculum_type, level, subject, version, source_hash, parsed_topics, status, release_date)
VALUES
  ('a1000001-0000-0000-0000-000000000001', 'MOE', 'P6', 'Mathematics', 'demo', 'demo-p6-math', '[]', 'parsed', '2026-01-01'),
  ('a1000002-0000-0000-0000-000000000002', 'MOE', 'P6', 'English',     'demo', 'demo-p6-eng',  '[]', 'parsed', '2026-01-01'),
  ('a1000003-0000-0000-0000-000000000003', 'MOE', 'P6', 'Science',     'demo', 'demo-p6-sci',  '[]', 'parsed', '2026-01-01'),
  ('a1000004-0000-0000-0000-000000000004', 'MOE', 'P6', 'Chinese',     'demo', 'demo-p6-chi',  '[]', 'parsed', '2026-01-01'),
  ('a1000005-0000-0000-0000-000000000005', 'MOE', 'P4', 'Mathematics', 'demo', 'demo-p4-math', '[]', 'parsed', '2026-01-01'),
  ('a1000006-0000-0000-0000-000000000006', 'MOE', 'P4', 'English',     'demo', 'demo-p4-eng',  '[]', 'parsed', '2026-01-01'),
  ('a1000007-0000-0000-0000-000000000007', 'MOE', 'P3', 'Mathematics', 'demo', 'demo-p3-math', '[]', 'parsed', '2026-01-01'),
  ('a1000008-0000-0000-0000-000000000008', 'MOE', 'P3', 'English',     'demo', 'demo-p3-eng',  '[]', 'parsed', '2026-01-01'),
  ('a1000009-0000-0000-0000-000000000009', 'MOE', 'P2', 'Mathematics', 'demo', 'demo-p2-math', '[]', 'parsed', '2026-01-01')
ON CONFLICT (source_hash) DO NOTHING;

-- ── 4. Topics ────────────────────────────────────────────────────────────────

INSERT INTO public.topics
  (id, curriculum_version_id, topic_name, sequence, exam_weight_percentage, estimated_hours, difficulty_level, prerequisites)
VALUES
  -- P6 Mathematics
  ('b1000001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001', 'Algebra — Variables & Expressions',      1, 15, 4, 3, '{}'),
  ('b1000002-0000-0000-0000-000000000002', 'a1000001-0000-0000-0000-000000000001', 'Ratio, Rate & Proportion',               2, 20, 5, 4, '{}'),
  -- P6 English
  ('b1000003-0000-0000-0000-000000000003', 'a1000002-0000-0000-0000-000000000002', 'Comprehension — Inference Skills',       1, 25, 5, 3, '{}'),
  ('b1000004-0000-0000-0000-000000000004', 'a1000002-0000-0000-0000-000000000002', 'Composition — Narrative Writing',        2, 20, 4, 4, '{}'),
  -- P6 Science
  ('b1000005-0000-0000-0000-000000000005', 'a1000003-0000-0000-0000-000000000003', 'Cells & Systems',                       1, 20, 4, 3, '{}'),
  ('b1000006-0000-0000-0000-000000000006', 'a1000003-0000-0000-0000-000000000003', 'Energy — Forces & Motion',              2, 20, 4, 4, '{}'),
  -- P6 Chinese
  ('b1000007-0000-0000-0000-000000000007', 'a1000004-0000-0000-0000-000000000004', '阅读理解 — 字义与句意',                   1, 30, 4, 3, '{}'),
  -- P4 Mathematics
  ('b1000008-0000-0000-0000-000000000008', 'a1000005-0000-0000-0000-000000000005', 'Whole Numbers — Multiplication & Division', 1, 20, 4, 2, '{}'),
  ('b1000009-0000-0000-0000-000000000009', 'a1000005-0000-0000-0000-000000000005', 'Fractions — Adding & Subtracting',      2, 20, 4, 3, '{}'),
  -- P4 English
  ('b1000010-0000-0000-0000-000000000010', 'a1000006-0000-0000-0000-000000000006', 'Grammar — Tenses & Agreement',          1, 25, 3, 2, '{}'),
  -- P3 Mathematics
  ('b1000011-0000-0000-0000-000000000011', 'a1000007-0000-0000-0000-000000000007', 'Mental Maths & Times Tables',           1, 25, 3, 2, '{}'),
  -- P3 English
  ('b1000012-0000-0000-0000-000000000012', 'a1000008-0000-0000-0000-000000000008', 'Phonics & Spelling Patterns',           1, 20, 3, 1, '{}'),
  -- P2 Mathematics
  ('b1000013-0000-0000-0000-000000000013', 'a1000009-0000-0000-0000-000000000009', 'Numbers to 1000 — Place Value',         1, 30, 3, 1, '{}')
ON CONFLICT (id) DO NOTHING;

-- ── 5. Children ───────────────────────────────────────────────────────────────

INSERT INTO public.children
  (id, parent_id, name, grade_level, grade_band, sen_profile, gamification_enabled)
VALUES
  ('c1000001-0000-0000-0000-000000000001', sarah_id, 'Ava',   'P6', 'Upper_Primary', 'ADHD',            true),
  ('c1000002-0000-0000-0000-000000000002', sarah_id, 'Ben',   'P4', 'Upper_Primary', null,              true),
  ('c1000003-0000-0000-0000-000000000003', david_id, 'Lily',  'P3', 'Lower_Primary', 'Autism_Spectrum', true),
  ('c1000004-0000-0000-0000-000000000004', priya_id, 'Arjun', 'P2', 'Lower_Primary', null,              false)
ON CONFLICT (id) DO NOTHING;

-- ── 6. Study schedules ────────────────────────────────────────────────────────

INSERT INTO public.study_schedules
  (id, child_id, schedule_json, schedule_hash, trigger_reason, confirmed_by_parent, activates_at)
VALUES (
  'd1000001-0000-0000-0000-000000000001',
  'c1000001-0000-0000-0000-000000000001',
  jsonb_build_object('hash', 'demo-ava-001', 'weeks', jsonb_build_array(
    jsonb_build_object('week_number', 1, 'week_start', (current_date - (EXTRACT(DOW FROM current_date)::int - 1 + 7) % 7 * interval '1 day')::date::text,
      'bites', jsonb_build_array(
        jsonb_build_object('topic_id','b1000001-0000-0000-0000-000000000001','subject','Mathematics','duration_min',5,'intensity','med','is_review',false,'date',current_date::text),
        jsonb_build_object('topic_id','b1000003-0000-0000-0000-000000000003','subject','English','duration_min',5,'intensity','low','is_review',false,'date',current_date::text),
        jsonb_build_object('topic_id','b1000005-0000-0000-0000-000000000005','subject','Science','duration_min',5,'intensity','med','is_review',false,'date',(current_date+1)::text),
        jsonb_build_object('topic_id','b1000007-0000-0000-0000-000000000007','subject','Chinese','duration_min',5,'intensity','low','is_review',false,'date',(current_date+1)::text),
        jsonb_build_object('topic_id','b1000002-0000-0000-0000-000000000002','subject','Mathematics','duration_min',5,'intensity','high','is_review',false,'date',(current_date+2)::text),
        jsonb_build_object('topic_id','b1000004-0000-0000-0000-000000000004','subject','English','duration_min',5,'intensity','med','is_review',false,'date',(current_date+2)::text),
        jsonb_build_object('topic_id','b1000006-0000-0000-0000-000000000006','subject','Science','duration_min',5,'intensity','low','is_review',true,'date',(current_date+3)::text),
        jsonb_build_object('topic_id','b1000007-0000-0000-0000-000000000007','subject','Chinese','duration_min',5,'intensity','med','is_review',false,'date',(current_date+3)::text),
        jsonb_build_object('topic_id','b1000001-0000-0000-0000-000000000001','subject','Mathematics','duration_min',5,'intensity','low','is_review',true,'date',(current_date+4)::text),
        jsonb_build_object('topic_id','b1000003-0000-0000-0000-000000000003','subject','English','duration_min',5,'intensity','low','is_review',true,'date',(current_date+4)::text)
      )
    ),
    jsonb_build_object('week_number', 2, 'week_start', (current_date - (EXTRACT(DOW FROM current_date)::int - 1 + 7) % 7 * interval '1 day' + interval '7 days')::date::text,
      'bites', jsonb_build_array(
        jsonb_build_object('topic_id','b1000002-0000-0000-0000-000000000002','subject','Mathematics','duration_min',5,'intensity','med','is_review',false,'date',(current_date+7)::text),
        jsonb_build_object('topic_id','b1000005-0000-0000-0000-000000000005','subject','Science','duration_min',5,'intensity','high','is_review',false,'date',(current_date+7)::text),
        jsonb_build_object('topic_id','b1000004-0000-0000-0000-000000000004','subject','English','duration_min',5,'intensity','med','is_review',false,'date',(current_date+8)::text),
        jsonb_build_object('topic_id','b1000007-0000-0000-0000-000000000007','subject','Chinese','duration_min',5,'intensity','low','is_review',false,'date',(current_date+8)::text),
        jsonb_build_object('topic_id','b1000001-0000-0000-0000-000000000001','subject','Mathematics','duration_min',5,'intensity','med','is_review',false,'date',(current_date+9)::text),
        jsonb_build_object('topic_id','b1000006-0000-0000-0000-000000000006','subject','Science','duration_min',5,'intensity','low','is_review',true,'date',(current_date+9)::text),
        jsonb_build_object('topic_id','b1000003-0000-0000-0000-000000000003','subject','English','duration_min',5,'intensity','high','is_review',false,'date',(current_date+10)::text),
        jsonb_build_object('topic_id','b1000007-0000-0000-0000-000000000007','subject','Chinese','duration_min',5,'intensity','med','is_review',false,'date',(current_date+11)::text)
      )
    ),
    jsonb_build_object('week_number', 3, 'week_start', (current_date - (EXTRACT(DOW FROM current_date)::int - 1 + 7) % 7 * interval '1 day' + interval '14 days')::date::text,
      'bites', jsonb_build_array(
        jsonb_build_object('topic_id','b1000002-0000-0000-0000-000000000002','subject','Mathematics','duration_min',5,'intensity','high','is_review',false,'date',(current_date+14)::text),
        jsonb_build_object('topic_id','b1000005-0000-0000-0000-000000000005','subject','Science','duration_min',5,'intensity','med','is_review',false,'date',(current_date+14)::text),
        jsonb_build_object('topic_id','b1000004-0000-0000-0000-000000000004','subject','English','duration_min',5,'intensity','med','is_review',false,'date',(current_date+15)::text),
        jsonb_build_object('topic_id','b1000007-0000-0000-0000-000000000007','subject','Chinese','duration_min',5,'intensity','high','is_review',false,'date',(current_date+16)::text),
        jsonb_build_object('topic_id','b1000001-0000-0000-0000-000000000001','subject','Mathematics','duration_min',5,'intensity','med','is_review',true,'date',(current_date+17)::text),
        jsonb_build_object('topic_id','b1000006-0000-0000-0000-000000000006','subject','Science','duration_min',5,'intensity','low','is_review',true,'date',(current_date+18)::text)
      )
    )
  )),
  'demo-ava-001', 'initial', true, now()
) ON CONFLICT (id) DO NOTHING;

-- Ben (P4)
INSERT INTO public.study_schedules
  (id, child_id, schedule_json, schedule_hash, trigger_reason, confirmed_by_parent, activates_at)
VALUES (
  'd1000002-0000-0000-0000-000000000002',
  'c1000002-0000-0000-0000-000000000002',
  jsonb_build_object('hash', 'demo-ben-001', 'weeks', jsonb_build_array(
    jsonb_build_object('week_number', 1, 'week_start', (current_date - (EXTRACT(DOW FROM current_date)::int - 1 + 7) % 7 * interval '1 day')::date::text,
      'bites', jsonb_build_array(
        jsonb_build_object('topic_id','b1000008-0000-0000-0000-000000000008','subject','Mathematics','duration_min',10,'intensity','med','is_review',false,'date',current_date::text),
        jsonb_build_object('topic_id','b1000010-0000-0000-0000-000000000010','subject','English','duration_min',10,'intensity','low','is_review',false,'date',(current_date+1)::text),
        jsonb_build_object('topic_id','b1000009-0000-0000-0000-000000000009','subject','Mathematics','duration_min',10,'intensity','high','is_review',false,'date',(current_date+2)::text),
        jsonb_build_object('topic_id','b1000010-0000-0000-0000-000000000010','subject','English','duration_min',10,'intensity','med','is_review',false,'date',(current_date+3)::text),
        jsonb_build_object('topic_id','b1000008-0000-0000-0000-000000000008','subject','Mathematics','duration_min',10,'intensity','low','is_review',true,'date',(current_date+4)::text)
      )
    ),
    jsonb_build_object('week_number', 2, 'week_start', (current_date - (EXTRACT(DOW FROM current_date)::int - 1 + 7) % 7 * interval '1 day' + interval '7 days')::date::text,
      'bites', jsonb_build_array(
        jsonb_build_object('topic_id','b1000009-0000-0000-0000-000000000009','subject','Mathematics','duration_min',10,'intensity','med','is_review',false,'date',(current_date+7)::text),
        jsonb_build_object('topic_id','b1000010-0000-0000-0000-000000000010','subject','English','duration_min',10,'intensity','high','is_review',false,'date',(current_date+8)::text),
        jsonb_build_object('topic_id','b1000008-0000-0000-0000-000000000008','subject','Mathematics','duration_min',10,'intensity','med','is_review',false,'date',(current_date+9)::text),
        jsonb_build_object('topic_id','b1000010-0000-0000-0000-000000000010','subject','English','duration_min',10,'intensity','low','is_review',true,'date',(current_date+10)::text)
      )
    )
  )),
  'demo-ben-001', 'initial', true, now()
) ON CONFLICT (id) DO NOTHING;

-- Lily (P3, ASD)
INSERT INTO public.study_schedules
  (id, child_id, schedule_json, schedule_hash, trigger_reason, confirmed_by_parent, activates_at)
VALUES (
  'd1000003-0000-0000-0000-000000000003',
  'c1000003-0000-0000-0000-000000000003',
  jsonb_build_object('hash', 'demo-lily-001', 'weeks', jsonb_build_array(
    jsonb_build_object('week_number', 1, 'week_start', (current_date - (EXTRACT(DOW FROM current_date)::int - 1 + 7) % 7 * interval '1 day')::date::text,
      'bites', jsonb_build_array(
        jsonb_build_object('topic_id','b1000011-0000-0000-0000-000000000011','subject','Mathematics','duration_min',10,'intensity','low','is_review',false,'date',current_date::text),
        jsonb_build_object('topic_id','b1000012-0000-0000-0000-000000000012','subject','English','duration_min',10,'intensity','low','is_review',false,'date',(current_date+1)::text),
        jsonb_build_object('topic_id','b1000011-0000-0000-0000-000000000011','subject','Mathematics','duration_min',10,'intensity','med','is_review',false,'date',(current_date+2)::text),
        jsonb_build_object('topic_id','b1000012-0000-0000-0000-000000000012','subject','English','duration_min',10,'intensity','low','is_review',false,'date',(current_date+3)::text),
        jsonb_build_object('topic_id','b1000011-0000-0000-0000-000000000011','subject','Mathematics','duration_min',10,'intensity','low','is_review',true,'date',(current_date+4)::text)
      )
    ),
    jsonb_build_object('week_number', 2, 'week_start', (current_date - (EXTRACT(DOW FROM current_date)::int - 1 + 7) % 7 * interval '1 day' + interval '7 days')::date::text,
      'bites', jsonb_build_array(
        jsonb_build_object('topic_id','b1000012-0000-0000-0000-000000000012','subject','English','duration_min',10,'intensity','med','is_review',false,'date',(current_date+7)::text),
        jsonb_build_object('topic_id','b1000011-0000-0000-0000-000000000011','subject','Mathematics','duration_min',10,'intensity','med','is_review',false,'date',(current_date+8)::text),
        jsonb_build_object('topic_id','b1000012-0000-0000-0000-000000000012','subject','English','duration_min',10,'intensity','low','is_review',true,'date',(current_date+9)::text)
      )
    )
  )),
  'demo-lily-001', 'initial', true, now()
) ON CONFLICT (id) DO NOTHING;

-- Arjun (P2)
INSERT INTO public.study_schedules
  (id, child_id, schedule_json, schedule_hash, trigger_reason, confirmed_by_parent, activates_at)
VALUES (
  'd1000004-0000-0000-0000-000000000004',
  'c1000004-0000-0000-0000-000000000004',
  jsonb_build_object('hash', 'demo-arjun-001', 'weeks', jsonb_build_array(
    jsonb_build_object('week_number', 1, 'week_start', (current_date - (EXTRACT(DOW FROM current_date)::int - 1 + 7) % 7 * interval '1 day')::date::text,
      'bites', jsonb_build_array(
        jsonb_build_object('topic_id','b1000013-0000-0000-0000-000000000013','subject','Mathematics','duration_min',10,'intensity','low','is_review',false,'date',current_date::text),
        jsonb_build_object('topic_id','b1000013-0000-0000-0000-000000000013','subject','Mathematics','duration_min',10,'intensity','med','is_review',false,'date',(current_date+1)::text),
        jsonb_build_object('topic_id','b1000013-0000-0000-0000-000000000013','subject','Mathematics','duration_min',10,'intensity','low','is_review',false,'date',(current_date+2)::text),
        jsonb_build_object('topic_id','b1000013-0000-0000-0000-000000000013','subject','Mathematics','duration_min',10,'intensity','med','is_review',false,'date',(current_date+3)::text),
        jsonb_build_object('topic_id','b1000013-0000-0000-0000-000000000013','subject','Mathematics','duration_min',10,'intensity','low','is_review',true,'date',(current_date+4)::text)
      )
    ),
    jsonb_build_object('week_number', 2, 'week_start', (current_date - (EXTRACT(DOW FROM current_date)::int - 1 + 7) % 7 * interval '1 day' + interval '7 days')::date::text,
      'bites', jsonb_build_array(
        jsonb_build_object('topic_id','b1000013-0000-0000-0000-000000000013','subject','Mathematics','duration_min',10,'intensity','med','is_review',false,'date',(current_date+7)::text),
        jsonb_build_object('topic_id','b1000013-0000-0000-0000-000000000013','subject','Mathematics','duration_min',10,'intensity','high','is_review',false,'date',(current_date+8)::text),
        jsonb_build_object('topic_id','b1000013-0000-0000-0000-000000000013','subject','Mathematics','duration_min',10,'intensity','med','is_review',false,'date',(current_date+9)::text)
      )
    )
  )),
  'demo-arjun-001', 'initial', true, now()
) ON CONFLICT (id) DO NOTHING;

-- ── 7. Schedule bites (completed — drives streak & bites_this_week) ───────────

-- Ava: 7-day streak
INSERT INTO public.schedule_bites (schedule_id, child_id, topic_id, planned_date, week_start, completed_at)
SELECT
  'd1000001-0000-0000-0000-000000000001',
  'c1000001-0000-0000-0000-000000000001',
  'b1000001-0000-0000-0000-000000000001',
  (current_date - n)::date,
  (date_trunc('week', current_date - n * interval '1 day') + interval '1 day')::date,
  ((current_date - n)::text || 'T10:00:00+08:00')::timestamptz
FROM generate_series(0, 6) AS n;

-- Ben: 3-day streak
INSERT INTO public.schedule_bites (schedule_id, child_id, topic_id, planned_date, week_start, completed_at)
SELECT
  'd1000002-0000-0000-0000-000000000002',
  'c1000002-0000-0000-0000-000000000002',
  'b1000008-0000-0000-0000-000000000008',
  (current_date - n)::date,
  (date_trunc('week', current_date - n * interval '1 day') + interval '1 day')::date,
  ((current_date - n)::text || 'T10:00:00+08:00')::timestamptz
FROM generate_series(0, 2) AS n;

-- Lily: 5-day streak
INSERT INTO public.schedule_bites (schedule_id, child_id, topic_id, planned_date, week_start, completed_at)
SELECT
  'd1000003-0000-0000-0000-000000000003',
  'c1000003-0000-0000-0000-000000000003',
  'b1000011-0000-0000-0000-000000000011',
  (current_date - n)::date,
  (date_trunc('week', current_date - n * interval '1 day') + interval '1 day')::date,
  ((current_date - n)::text || 'T10:00:00+08:00')::timestamptz
FROM generate_series(0, 4) AS n;

-- Arjun: 2-day streak
INSERT INTO public.schedule_bites (schedule_id, child_id, topic_id, planned_date, week_start, completed_at)
SELECT
  'd1000004-0000-0000-0000-000000000004',
  'c1000004-0000-0000-0000-000000000004',
  'b1000013-0000-0000-0000-000000000013',
  (current_date - n)::date,
  (date_trunc('week', current_date - n * interval '1 day') + interval '1 day')::date,
  ((current_date - n)::text || 'T10:00:00+08:00')::timestamptz
FROM generate_series(0, 1) AS n;

-- Today's pending bites (for this week's total count)
INSERT INTO public.schedule_bites (schedule_id, child_id, topic_id, planned_date, week_start, completed_at)
VALUES
  ('d1000001-0000-0000-0000-000000000001', 'c1000001-0000-0000-0000-000000000001', 'b1000003-0000-0000-0000-000000000003', current_date, date_trunc('week', current_date)::date + 1, null),
  ('d1000001-0000-0000-0000-000000000001', 'c1000001-0000-0000-0000-000000000001', 'b1000005-0000-0000-0000-000000000005', current_date, date_trunc('week', current_date)::date + 1, null),
  ('d1000002-0000-0000-0000-000000000002', 'c1000002-0000-0000-0000-000000000002', 'b1000010-0000-0000-0000-000000000010', current_date, date_trunc('week', current_date)::date + 1, null),
  ('d1000003-0000-0000-0000-000000000003', 'c1000003-0000-0000-0000-000000000003', 'b1000012-0000-0000-0000-000000000012', current_date, date_trunc('week', current_date)::date + 1, null),
  ('d1000004-0000-0000-0000-000000000004', 'c1000004-0000-0000-0000-000000000004', 'b1000013-0000-0000-0000-000000000013', current_date, date_trunc('week', current_date)::date + 1, null);

-- ── 8. XP events ─────────────────────────────────────────────────────────────

INSERT INTO public.xp_events (child_id, event_type, xp_delta, created_at)
SELECT 'c1000001-0000-0000-0000-000000000001', 'bite_complete', 52, (current_date - n)::text::timestamptz
FROM generate_series(0, 9) AS n;

INSERT INTO public.xp_events (child_id, event_type, xp_delta, created_at)
SELECT 'c1000002-0000-0000-0000-000000000002', 'bite_complete', 18, (current_date - n)::text::timestamptz
FROM generate_series(0, 9) AS n;

INSERT INTO public.xp_events (child_id, event_type, xp_delta, created_at)
SELECT 'c1000003-0000-0000-0000-000000000003', 'bite_complete', 28, (current_date - n)::text::timestamptz
FROM generate_series(0, 9) AS n;

INSERT INTO public.xp_events (child_id, event_type, xp_delta, created_at)
SELECT 'c1000004-0000-0000-0000-000000000004', 'bite_complete', 8, (current_date - n)::text::timestamptz
FROM generate_series(0, 9) AS n;

-- ── 9. Badges ─────────────────────────────────────────────────────────────────

INSERT INTO public.badges (child_id, subject, tier, unlocked_at)
VALUES
  ('c1000001-0000-0000-0000-000000000001', 'Mathematics', 'gold',   now() - interval '2 days'),
  ('c1000001-0000-0000-0000-000000000001', 'Science',     'silver', now() - interval '5 days'),
  ('c1000001-0000-0000-0000-000000000001', 'English',     'bronze', now() - interval '10 days'),
  ('c1000002-0000-0000-0000-000000000002', 'English',     'silver', now() - interval '1 day'),
  ('c1000002-0000-0000-0000-000000000002', 'Mathematics', 'bronze', now() - interval '4 days'),
  ('c1000003-0000-0000-0000-000000000003', 'Mathematics', 'bronze', now() - interval '3 days')
ON CONFLICT (child_id, subject, tier) DO NOTHING;

-- ── 10. Exam dates (assessment_dates uploads) ─────────────────────────────────

INSERT INTO public.uploads (parent_id, child_id, file_type, original_filename, storage_path, status, parsed_payload)
VALUES
  (sarah_id, 'c1000001-0000-0000-0000-000000000001', 'assessment_dates', 'exam-dates.pdf', 'demo/exam-dates-ava.pdf', 'parsed',
   '{"dates":[{"label":"PSLE English","date":"2026-10-01","subject":"English"},{"label":"PSLE Mathematics","date":"2026-10-05","subject":"Mathematics"},{"label":"PSLE Science","date":"2026-10-07","subject":"Science"},{"label":"PSLE Chinese","date":"2026-10-09","subject":"Chinese"}]}'::jsonb),
  (sarah_id, 'c1000002-0000-0000-0000-000000000002', 'assessment_dates', 'exam-dates.pdf', 'demo/exam-dates-ben.pdf', 'parsed',
   '{"dates":[{"label":"SA1 Mathematics","date":"2026-06-08","subject":"Mathematics"},{"label":"SA1 English","date":"2026-06-09","subject":"English"}]}'::jsonb),
  (david_id, 'c1000003-0000-0000-0000-000000000003', 'assessment_dates', 'exam-dates.pdf', 'demo/exam-dates-lily.pdf', 'parsed',
   '{"dates":[{"label":"SA1 Mathematics","date":"2026-06-08","subject":"Mathematics"},{"label":"SA1 English","date":"2026-06-10","subject":"English"}]}'::jsonb),
  (priya_id, 'c1000004-0000-0000-0000-000000000004', 'assessment_dates', 'exam-dates.pdf', 'demo/exam-dates-arjun.pdf', 'parsed',
   '{"dates":[{"label":"CA1 Mathematics","date":"2026-06-05","subject":"Mathematics"}]}'::jsonb);

RAISE NOTICE '✅ Demo seed complete!';
RAISE NOTICE 'Account 1 — demo.sarah@schoolhub.app / SchoolHub2026! (Ava P6 ADHD + Ben P4)';
RAISE NOTICE 'Account 2 — demo.david@schoolhub.app / SchoolHub2026! (Lily P3 ASD)';
RAISE NOTICE 'Account 3 — demo.priya@schoolhub.app / SchoolHub2026! (Arjun P2)';

END $$;
