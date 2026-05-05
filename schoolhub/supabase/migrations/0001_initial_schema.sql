-- ============================================================
-- SchoolHub — Initial Schema (Migration 0001)
-- Singapore region · PRD v3.0 · MVP Internal Alpha
-- All 14 day-one tables. sen_profile, uploads, wellbeing_signals
-- ship here — never as a follow-up migration.
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─── ENUMS ────────────────────────────────────────────────────────────────────

create type grade_level_enum as enum ('K2','P1','P2','P3','P4','P5','P6');
create type grade_band_enum  as enum ('K2','Lower_Primary','Upper_Primary');
create type sen_profile_enum as enum ('ADHD','Autism_Spectrum','Other_SEN');
create type user_plan_enum   as enum ('free_trial','scholar','scholar_pro');
create type user_role_enum   as enum ('parent','student');

create type parse_status_enum        as enum ('queued','parsing','parsed','failed');
create type trigger_reason_enum      as enum ('initial','manual','low_completion','exam_change','calendar_change','sen_change');
create type upload_file_type_enum    as enum ('spelling_list','assessment_dates','school_calendar','moe_syllabus');
create type xp_event_type_enum       as enum ('bite_complete','correct_answer','streak_milestone','ahead_of_schedule');
create type badge_tier_enum          as enum ('bronze','silver','gold');
create type mood_rating_enum         as enum ('struggling','okay','got_it');
create type acknowledgement_enum     as enum ('accepted','modified','dismissed');
create type notification_channel_enum as enum ('telegram','sms');
create type notification_mode_enum   as enum ('weekly_digest','daily_progress','realtime');
create type wellbeing_status_enum    as enum ('green','amber','red');
create type wellbeing_signal_enum    as enum (
  'overload_risk','burnout_risk','comprehension_plateau',
  'activity_imbalance','exam_anxiety'
);
create type intensity_enum as enum ('low','med','high');
create type source_type_enum as enum ('curriculum','upload');
create type activation_mode_enum as enum ('immediate','delayed_48h');

-- ─── TABLE 1: users ───────────────────────────────────────────────────────────

create table public.users (
  id               uuid primary key default gen_random_uuid(),
  email            text not null unique,
  role             user_role_enum not null default 'parent',
  plan             user_plan_enum not null default 'free_trial',
  trial_ends_at    timestamptz,
  telegram_id      text,
  created_at       timestamptz not null default now()
);

comment on table public.users is 'Platform accounts. Auth is managed by Supabase Auth; this table mirrors auth.users with app-level fields.';

-- ─── TABLE 2: children ────────────────────────────────────────────────────────

create table public.children (
  id                    uuid primary key default gen_random_uuid(),
  parent_id             uuid not null references public.users(id) on delete cascade,
  name                  text not null,
  grade_level           grade_level_enum not null,
  grade_band            grade_band_enum  not null,
  -- sen_profile ships in migration 0001 — never a follow-up
  sen_profile           sen_profile_enum,
  gamification_enabled  boolean not null default true,
  p1_intake_date        date,
  created_at            timestamptz not null default now()
);

create index idx_children_parent_id on public.children(parent_id);
comment on column public.children.sen_profile is 'Optional SEN profile. Alters pacing, structure, reward cadence. Does not alter content. null = no profile active.';

-- ─── TABLE 3: curriculum_versions ────────────────────────────────────────────

create table public.curriculum_versions (
  id               uuid primary key default gen_random_uuid(),
  curriculum_type  text not null default 'MOE',
  level            grade_level_enum not null,
  subject          text not null,
  version          text not null,
  source_hash      text not null unique,
  parsed_topics    jsonb not null default '[]',
  status           parse_status_enum not null default 'queued',
  release_date     date not null,
  created_at       timestamptz not null default now()
);

create index idx_curriculum_level_subject on public.curriculum_versions(level, subject, release_date desc);
comment on column public.curriculum_versions.parsed_topics is 'Array of ParsedTopic objects. Zod-validated before write. Schema defined in packages/ai/src/schemas.ts.';

-- ─── TABLE 4: topics ──────────────────────────────────────────────────────────
-- Inferred: bites.topic_id FK requires a target table.
-- Rows are materialised from curriculum_versions.parsed_topics on parse completion.

create table public.topics (
  id                       uuid primary key default gen_random_uuid(),
  curriculum_version_id    uuid not null references public.curriculum_versions(id) on delete cascade,
  topic_name               text not null,
  sequence                 int  not null,
  exam_weight_percentage   numeric(5,2) not null,
  estimated_hours          numeric(5,2) not null,
  difficulty_level         int  not null check (difficulty_level between 1 and 5),
  prerequisites            uuid[] not null default '{}',
  created_at               timestamptz not null default now()
);

create index idx_topics_curriculum_version on public.topics(curriculum_version_id);

-- ─── TABLE 5: study_schedules ─────────────────────────────────────────────────

create table public.study_schedules (
  id                   uuid primary key default gen_random_uuid(),
  child_id             uuid not null references public.children(id) on delete cascade,
  schedule_json        jsonb not null,
  generated_at         timestamptz not null default now(),
  trigger_reason       trigger_reason_enum not null,
  schedule_hash        text not null,
  activates_at         timestamptz not null default now(),
  confirmed_by_parent  boolean not null default false,
  created_at           timestamptz not null default now()
);

create index idx_study_schedules_child_id on public.study_schedules(child_id, created_at desc);
comment on column public.study_schedules.activates_at is 'For Autism_Spectrum children, set to now() + 48h server-side. Never trust client-supplied value.';
comment on column public.study_schedules.schedule_json is 'ScheduleJson shape. Zod-validated before write.';

-- ─── TABLE 6: schedule_bites ─────────────────────────────────────────────────
-- Inferred: required for weekly completion rate queries (API Reference §15.2)
-- and for the bite-completion parent↔student handshake.

create table public.schedule_bites (
  id            uuid primary key default gen_random_uuid(),
  schedule_id   uuid not null references public.study_schedules(id) on delete cascade,
  child_id      uuid not null references public.children(id) on delete cascade,
  topic_id      uuid not null references public.topics(id),
  -- bite_id nullable: AI-generated bites may not yet exist at schedule creation time
  bite_id       uuid,
  planned_date  date not null,
  week_start    date not null,
  completed_at  timestamptz,
  duration_sec  int,
  mood          mood_rating_enum,
  created_at    timestamptz not null default now()
);

create index idx_schedule_bites_child_week   on public.schedule_bites(child_id, week_start);
create index idx_schedule_bites_schedule_id  on public.schedule_bites(schedule_id);
create index idx_schedule_bites_planned_date on public.schedule_bites(child_id, planned_date);
comment on table public.schedule_bites is 'Per-day bite assignments. Drives completion rate calculation and the student daily-goal screen.';

-- ─── TABLE 7: bites ───────────────────────────────────────────────────────────

create table public.bites (
  id             uuid primary key default gen_random_uuid(),
  topic_id       uuid not null references public.topics(id) on delete cascade,
  content_json   jsonb not null,
  duration_min   int  not null,
  grade_band     grade_band_enum not null,
  sen_variant    sen_profile_enum,
  prompt_version text not null,
  cache_key      text not null unique,
  created_at     timestamptz not null default now(),
  constraint bite_duration_positive check (duration_min > 0),
  constraint bite_duration_max      check (duration_min <= 10)
);

create index idx_bites_topic_id  on public.bites(topic_id);
create index idx_bites_cache_key on public.bites(cache_key);
comment on column public.bites.cache_key is 'sha256(topic_id || grade_band || coalesce(sen_variant,'''') || prompt_version). Used for bite generation deduplication.';
comment on column public.bites.content_json is 'BiteContent shape. Zod-validated before write. Never expose raw Claude output to client.';

-- ─── TABLE 8: xp_events ───────────────────────────────────────────────────────

create table public.xp_events (
  id          uuid primary key default gen_random_uuid(),
  child_id    uuid not null references public.children(id) on delete cascade,
  event_type  xp_event_type_enum not null,
  xp_delta    int not null,
  created_at  timestamptz not null default now()
);

create index idx_xp_events_child_id on public.xp_events(child_id, created_at desc);

-- ─── TABLE 9: badges ──────────────────────────────────────────────────────────

create table public.badges (
  id           uuid primary key default gen_random_uuid(),
  child_id     uuid not null references public.children(id) on delete cascade,
  subject      text not null,
  tier         badge_tier_enum not null,
  unlocked_at  timestamptz not null default now(),
  unique (child_id, subject, tier)
);

create index idx_badges_child_id on public.badges(child_id);

-- ─── TABLE 10: uploads ────────────────────────────────────────────────────────
-- Ships in 0001 per CLAUDE.md mandate.

create table public.uploads (
  id                uuid primary key default gen_random_uuid(),
  parent_id         uuid not null references public.users(id) on delete cascade,
  child_id          uuid references public.children(id) on delete set null,
  file_type         upload_file_type_enum not null,
  original_filename text not null,
  storage_path      text not null,
  status            parse_status_enum not null default 'queued',
  parsed_payload    jsonb,
  error_json        jsonb,
  created_at        timestamptz not null default now()
);

create index idx_uploads_parent_id on public.uploads(parent_id, created_at desc);
comment on column public.uploads.parsed_payload is 'Validated output from native parsers or Claude. Zod-validated before write. Schema varies by file_type.';
comment on column public.uploads.error_json     is 'Array of {field, reason, raw_value} for inline correction UX.';

-- ─── TABLE 11: wellbeing_signals ─────────────────────────────────────────────
-- Ships in 0001 per CLAUDE.md mandate.

create table public.wellbeing_signals (
  id                  uuid primary key default gen_random_uuid(),
  child_id            uuid not null references public.children(id) on delete cascade,
  signal_type         wellbeing_signal_enum not null,
  triggered_at        timestamptz not null default now(),
  resolved_at         timestamptz,
  recommended_action  text not null,
  acknowledged_by     uuid references public.users(id) on delete set null,
  acknowledgement     acknowledgement_enum,
  created_at          timestamptz not null default now()
);

create index idx_wellbeing_signals_child_unresolved on public.wellbeing_signals(child_id, resolved_at)
  where resolved_at is null;
comment on table public.wellbeing_signals is 'Rule-based only. Claude is NOT used to classify signals. Suggestions only; parent always overrides. Never clinical claims.';

-- ─── TABLE 12: parse_queue ────────────────────────────────────────────────────

create table public.parse_queue (
  id           uuid primary key default gen_random_uuid(),
  source_type  source_type_enum not null,
  source_id    uuid not null,
  status       parse_status_enum not null default 'queued',
  retries      int not null default 0,
  last_error   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_parse_queue_status on public.parse_queue(status, created_at)
  where status in ('queued','parsing');

-- ─── TABLE 13: notification_prefs ────────────────────────────────────────────

create table public.notification_prefs (
  id               uuid primary key default gen_random_uuid(),
  parent_id        uuid not null references public.users(id) on delete cascade unique,
  channel          notification_channel_enum not null default 'telegram',
  mode             notification_mode_enum not null default 'weekly_digest',
  telegram_chat_id text,
  fallback_sms     boolean not null default false,
  created_at       timestamptz not null default now()
);

-- ─── TABLE 14: weekly_cards ───────────────────────────────────────────────────

create table public.weekly_cards (
  id               uuid primary key default gen_random_uuid(),
  child_id         uuid not null references public.children(id) on delete cascade,
  image_url        text not null,
  pdf_url          text not null,
  generated_at     timestamptz not null default now(),
  expires_at       timestamptz not null,
  wellbeing_status wellbeing_status_enum not null,
  week_start       date not null,
  created_at       timestamptz not null default now(),
  unique (child_id, week_start)
);

create index idx_weekly_cards_child_id on public.weekly_cards(child_id, week_start desc);

-- ─── DEFERRED FK: schedule_bites.bite_id → bites ────────────────────────────
alter table public.schedule_bites
  add constraint schedule_bites_bite_id_fkey
  foreign key (bite_id) references public.bites(id) on delete set null;

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────

alter table public.users              enable row level security;
alter table public.children           enable row level security;
alter table public.curriculum_versions enable row level security;
alter table public.topics             enable row level security;
alter table public.study_schedules    enable row level security;
alter table public.schedule_bites     enable row level security;
alter table public.bites              enable row level security;
alter table public.xp_events          enable row level security;
alter table public.badges             enable row level security;
alter table public.uploads            enable row level security;
alter table public.wellbeing_signals  enable row level security;
alter table public.parse_queue        enable row level security;
alter table public.notification_prefs enable row level security;
alter table public.weekly_cards       enable row level security;

-- users: own row only
create policy "users: own row" on public.users
  for all using (auth.uid() = id);

-- children: parent owns child rows
create policy "children: parent owns" on public.children
  for all using (auth.uid() = parent_id);

-- children: student can read own row
create policy "children: student reads own" on public.children
  for select using (
    auth.uid() = id  -- child's auth id matches child.id
  );

-- curriculum_versions: authenticated read-only (public reference data)
create policy "curriculum_versions: auth read" on public.curriculum_versions
  for select using (auth.role() = 'authenticated');

-- topics: authenticated read-only
create policy "topics: auth read" on public.topics
  for select using (auth.role() = 'authenticated');

-- study_schedules: parent owns via children
create policy "study_schedules: parent owns" on public.study_schedules
  for all using (
    exists (
      select 1 from public.children c
      where c.id = child_id and c.parent_id = auth.uid()
    )
  );

-- study_schedules: student reads own
create policy "study_schedules: student reads own" on public.study_schedules
  for select using (child_id = auth.uid());

-- schedule_bites: parent owns via children
create policy "schedule_bites: parent owns" on public.schedule_bites
  for all using (
    exists (
      select 1 from public.children c
      where c.id = child_id and c.parent_id = auth.uid()
    )
  );

-- schedule_bites: student reads + updates own
create policy "schedule_bites: student owns" on public.schedule_bites
  for all using (child_id = auth.uid());

-- bites: authenticated read (content is not PII)
create policy "bites: auth read" on public.bites
  for select using (auth.role() = 'authenticated');

-- xp_events: parent owns via children; student reads own
create policy "xp_events: parent owns" on public.xp_events
  for all using (
    exists (
      select 1 from public.children c
      where c.id = child_id and c.parent_id = auth.uid()
    )
  );
create policy "xp_events: student reads own" on public.xp_events
  for select using (child_id = auth.uid());

-- badges: same ownership pattern
create policy "badges: parent owns" on public.badges
  for all using (
    exists (
      select 1 from public.children c
      where c.id = child_id and c.parent_id = auth.uid()
    )
  );
create policy "badges: student reads own" on public.badges
  for select using (child_id = auth.uid());

-- uploads: parent owns
create policy "uploads: parent owns" on public.uploads
  for all using (auth.uid() = parent_id);

-- wellbeing_signals: parent owns via children
create policy "wellbeing_signals: parent owns" on public.wellbeing_signals
  for all using (
    exists (
      select 1 from public.children c
      where c.id = child_id and c.parent_id = auth.uid()
    )
  );

-- parse_queue: service role only (internal worker)
create policy "parse_queue: service role" on public.parse_queue
  for all using (auth.role() = 'service_role');

-- notification_prefs: parent owns
create policy "notification_prefs: parent owns" on public.notification_prefs
  for all using (auth.uid() = parent_id);

-- weekly_cards: parent owns via children; student reads own
create policy "weekly_cards: parent owns" on public.weekly_cards
  for all using (
    exists (
      select 1 from public.children c
      where c.id = child_id and c.parent_id = auth.uid()
    )
  );
create policy "weekly_cards: student reads own" on public.weekly_cards
  for select using (child_id = auth.uid());

-- ─── USEFUL VIEWS ─────────────────────────────────────────────────────────────

-- Weekly completion rate per child (used for schedule regen trigger < 60%)
create view public.weekly_completion_rates as
select
  child_id,
  week_start,
  count(*) as total_bites,
  count(completed_at) as completed_bites,
  round(count(completed_at)::numeric / nullif(count(*), 0), 4) as completion_rate
from public.schedule_bites
group by child_id, week_start;

-- Active wellbeing signals (unresolved)
create view public.active_wellbeing_signals as
select *
from public.wellbeing_signals
where resolved_at is null
order by triggered_at desc;
