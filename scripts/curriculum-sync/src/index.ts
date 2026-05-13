/**
 * Weekly MOE curriculum sync — P4/P5/P6 only (Upper_Primary scope for MVP).
 *
 * Run schedule: Monday 02:00 SGT via GitHub Actions cron.
 * Fetches MOE PDF syllabi, computes SHA-256, skips unchanged files,
 * calls Claude to parse changed PDFs, upserts curriculum_versions,
 * and materialises topics into the topics table.
 */

import { createHash } from 'node:crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { parseCurriculumPDF, type ParsedTopicsResponse } from '@schoolhub/ai';
import type { GradeLevel, Subject } from '@schoolhub/types';

type ParsedTopicItem = ParsedTopicsResponse['topics'][number];

// ─── Supabase client ──────────────────────────────────────────────────────────

function makeSupabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  return createClient(url, key, { auth: { persistSession: false } });
}

// ─── Sync targets — P4–P6, English / Mathematics / Science for MVP ───────────

type SyncTarget = {
  level: Exclude<GradeLevel, 'K2'>;
  subject: Subject;
  url: string;
};

const SYNC_TARGETS: SyncTarget[] = (
  [
    { level: 'P4', subject: 'English',     envKey: 'MOE_P4_ENGLISH_URL' },
    { level: 'P4', subject: 'Mathematics', envKey: 'MOE_P4_MATH_URL' },
    { level: 'P4', subject: 'Science',     envKey: 'MOE_P4_SCIENCE_URL' },
    { level: 'P5', subject: 'English',     envKey: 'MOE_P5_ENGLISH_URL' },
    { level: 'P5', subject: 'Mathematics', envKey: 'MOE_P5_MATH_URL' },
    { level: 'P5', subject: 'Science',     envKey: 'MOE_P5_SCIENCE_URL' },
    { level: 'P6', subject: 'English',     envKey: 'MOE_P6_ENGLISH_URL' },
    { level: 'P6', subject: 'Mathematics', envKey: 'MOE_P6_MATH_URL' },
    { level: 'P6', subject: 'Science',     envKey: 'MOE_P6_SCIENCE_URL' },
  ] as Array<{ level: Exclude<GradeLevel, 'K2'>; subject: Subject; envKey: string }>
)
  .map(({ envKey, ...rest }) => ({ ...rest, url: process.env[envKey] ?? '' }))
  .filter((t): t is SyncTarget => t.url.length > 0);

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fetchPDF(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

function sha256(buf: Buffer): string {
  return createHash('sha256').update(buf).digest('hex');
}

async function getExistingHash(
  db: SupabaseClient,
  level: string,
  subject: string,
): Promise<string | null> {
  const { data } = await db
    .from('curriculum_versions')
    .select('source_hash')
    .eq('level', level)
    .eq('subject', subject)
    .eq('status', 'parsed')
    .order('release_date', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as { source_hash: string } | null)?.source_hash ?? null;
}

// ─── Topics materialisation ───────────────────────────────────────────────────

async function materialiseTopics(
  db: SupabaseClient,
  versionId: string,
  parsedTopics: ParsedTopicItem[],
): Promise<void> {
  // Remove stale topics for this version before re-inserting
  await db.from('topics').delete().eq('curriculum_version_id', versionId);

  if (parsedTopics.length === 0) return;

  // Insert all topics without prerequisites first so we can resolve IDs
  const rows = parsedTopics.map(t => ({
    curriculum_version_id: versionId,
    topic_name: t.name,
    sequence: t.sequence,
    exam_weight_percentage: t.exam_weight_percentage,
    estimated_hours: t.estimated_hours,
    difficulty_level: t.difficulty_level,
    prerequisites: [] as string[],
  }));

  const { data: inserted, error } = await db
    .from('topics')
    .insert(rows)
    .select('id, sequence');
  if (error) throw new Error(`topics insert failed: ${error.message}`);
  if (!inserted || inserted.length === 0) return;

  // Build claude-topic-id → db-uuid map; Supabase returns rows in insertion order
  const claudeIdToDbId = new Map<string, string>();
  parsedTopics.forEach((t, i) => {
    const row = inserted[i] as { id: string } | undefined;
    if (row) claudeIdToDbId.set(t.id, row.id);
  });

  // Resolve and patch prerequisites for topics that have them
  const updates = parsedTopics
    .map((t, i) => {
      const row = inserted[i] as { id: string } | undefined;
      if (!row || t.prerequisites.length === 0) return null;
      const resolved = t.prerequisites
        .map(pid => claudeIdToDbId.get(pid))
        .filter((uuid): uuid is string => uuid !== undefined);
      if (resolved.length === 0) return null;
      return { id: row.id, prerequisites: resolved };
    })
    .filter((u): u is { id: string; prerequisites: string[] } => u !== null);

  for (const upd of updates) {
    const { error: ue } = await db
      .from('topics')
      .update({ prerequisites: upd.prerequisites })
      .eq('id', upd.id);
    if (ue) throw new Error(`topics prerequisite update failed: ${ue.message}`);
  }
}

// ─── Core sync function ───────────────────────────────────────────────────────

async function syncOne(
  db: SupabaseClient,
  level: Exclude<GradeLevel, 'K2'>,
  subject: Subject,
  url: string,
): Promise<void> {
  console.log(`[sync] ${level} ${subject} — fetching PDF...`);

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await fetchPDF(url);
  } catch (err) {
    console.error(`[sync] ${level} ${subject} — fetch failed: ${String(err)}`);
    return;
  }

  const hash = sha256(pdfBuffer);
  const existingHash = await getExistingHash(db, level, subject);

  if (existingHash === hash) {
    console.log(`[sync] ${level} ${subject} — unchanged (hash match), skipping`);
    return;
  }

  console.log(`[sync] ${level} ${subject} — hash changed, inserting version row...`);
  const today = new Date().toISOString().slice(0, 10);

  const { data: versionRow, error: verErr } = await db
    .from('curriculum_versions')
    .insert({
      curriculum_type: 'MOE',
      level,
      subject,
      version: today,
      source_hash: hash,
      parsed_topics: [],
      status: 'parsing',
      release_date: today,
    })
    .select('id')
    .single();
  if (verErr || !versionRow) throw new Error(`curriculum_versions insert failed: ${verErr?.message}`);
  const versionId = (versionRow as { id: string }).id;

  // Track in parse_queue
  await db.from('parse_queue').insert({
    source_type: 'curriculum',
    source_id: versionId,
    status: 'parsing',
  });

  console.log(`[sync] ${level} ${subject} — parsing with Claude (version ${versionId})...`);
  let parsed;
  try {
    parsed = await parseCurriculumPDF(pdfBuffer.toString('base64'), level, subject);
  } catch (err) {
    const errMsg = String(err);
    console.error(`[sync] ${level} ${subject} — Claude parse failed: ${errMsg}`);
    await db.from('curriculum_versions').update({ status: 'failed' }).eq('id', versionId);
    await db.from('parse_queue').update({ status: 'failed', last_error: errMsg }).eq('source_id', versionId);
    return;
  }

  // Persist parsed_topics onto the version row
  const { error: updateErr } = await db
    .from('curriculum_versions')
    .update({ parsed_topics: parsed.topics, status: 'parsed' })
    .eq('id', versionId);
  if (updateErr) throw new Error(`curriculum_versions update failed: ${updateErr.message}`);

  // Materialise rows into the topics table (used by schedule generation)
  console.log(`[sync] ${level} ${subject} — materialising ${parsed.topics.length} topics...`);
  await materialiseTopics(db, versionId, parsed.topics);

  // Mark parse_queue complete
  await db.from('parse_queue').update({ status: 'parsed' }).eq('source_id', versionId);

  console.log(`[sync] ${level} ${subject} — done (${parsed.topics.length} topics)`);
}

// ─── Entry point ─────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  if (!process.env.CLAUDE_API_KEY) {
    throw new Error('CLAUDE_API_KEY is required');
  }

  if (SYNC_TARGETS.length === 0) {
    console.warn('[sync] No MOE PDF URLs configured — set MOE_P{4,5,6}_{ENGLISH,MATH,SCIENCE}_URL env vars');
    return;
  }

  const db = makeSupabase();
  console.log(`[sync] Starting curriculum sync for ${SYNC_TARGETS.length} target(s)`);

  for (const target of SYNC_TARGETS) {
    await syncOne(db, target.level, target.subject, target.url);
  }

  console.log('[sync] All done');
}

main().catch(err => {
  console.error('[sync] Fatal error:', err);
  process.exit(1);
});
