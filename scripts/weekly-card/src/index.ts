import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer';
import { buildCardHTML } from './template.js';
import type { WellbeingStatus } from '@schoolhub/types';

function makeSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  return createClient(url, key, { auth: { persistSession: false } });
}

async function computeStreak(db: ReturnType<typeof makeSupabase>, childId: string): Promise<number> {
  const { data } = await db
    .from('schedule_bites')
    .select('planned_date')
    .eq('child_id', childId)
    .not('completed_at', 'is', null);

  if (!data || data.length === 0) return 0;

  const unique = [...new Set(
    data.map(r => (r as { planned_date: string }).planned_date)
  )].sort().reverse();

  const today = new Date().toISOString().slice(0, 10);
  let streak = 0;
  let expected = today;

  for (const d of unique) {
    if (d === expected) {
      streak++;
      const prev = new Date(expected);
      prev.setDate(prev.getDate() - 1);
      expected = prev.toISOString().slice(0, 10);
    } else if (d < expected) break;
  }
  return streak;
}

async function main(): Promise<void> {
  const db = makeSupabase();

  const today = new Date();
  const mondayOffset = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - mondayOffset);
  const weekStart = monday.toISOString().slice(0, 10);
  const weekEnd = new Date(monday);
  weekEnd.setDate(monday.getDate() + 6);
  const weekEndISO = weekEnd.toISOString().slice(0, 10);

  const { data: children, error: ce } = await db.from('children').select('id, name, grade_level, parent_id');
  if (ce) throw ce;

  console.log(`[weekly-card] Generating cards for ${(children ?? []).length} children`);

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

  for (const child of children ?? []) {
    const c = child as { id: string; name: string; grade_level: string; parent_id: string };
    console.log(`[weekly-card] Processing ${c.name}...`);

    try {
      // Weekly bites
      const { data: biteRows } = await db
        .from('schedule_bites')
        .select('completed_at, topic_id')
        .eq('child_id', c.id)
        .gte('planned_date', weekStart)
        .lte('planned_date', weekEndISO);

      const total = (biteRows ?? []).length;
      const completed = (biteRows ?? []).filter(b => (b as { completed_at: string | null }).completed_at !== null).length;

      // Streak
      const streakDays = await computeStreak(db, c.id);

      // Wellbeing
      const { count: openSignals } = await db
        .from('wellbeing_signals')
        .select('*', { count: 'exact', head: true })
        .eq('child_id', c.id)
        .is('resolved_at', null);

      const wellbeingStatus: WellbeingStatus =
        (openSignals ?? 0) === 0 ? 'green'
        : (openSignals ?? 0) <= 2 ? 'amber'
        : 'red';

      // Subject breakdown
      const topicIds = [...new Set((biteRows ?? []).map(b => (b as { topic_id: string }).topic_id))];
      const subjectBreakdown: Array<{ subject: string; completedPct: number }> = [];

      if (topicIds.length > 0) {
        const { data: topics } = await db
          .from('topics')
          .select('id, curriculum_version_id')
          .in('id', topicIds);

        const cvIds = [...new Set((topics ?? []).map(t => (t as { curriculum_version_id: string }).curriculum_version_id))];
        if (cvIds.length > 0) {
          const { data: cvs } = await db
            .from('curriculum_versions')
            .select('id, subject')
            .in('id', cvIds);

          const cvSubjectMap = new Map<string, string>(
            (cvs ?? []).map(cv => [(cv as { id: string }).id, (cv as { subject: string }).subject])
          );
          const topicCvMap = new Map<string, string>(
            (topics ?? []).map(t => [(t as { id: string }).id, (t as { curriculum_version_id: string }).curriculum_version_id])
          );

          const subjectBites = new Map<string, { total: number; done: number }>();
          for (const row of biteRows ?? []) {
            const b = row as { completed_at: string | null; topic_id: string };
            const cvId = topicCvMap.get(b.topic_id);
            const subject = cvId ? (cvSubjectMap.get(cvId) ?? 'Other') : 'Other';
            const existing = subjectBites.get(subject) ?? { total: 0, done: 0 };
            existing.total++;
            if (b.completed_at !== null) existing.done++;
            subjectBites.set(subject, existing);
          }

          for (const [subject, counts] of subjectBites) {
            subjectBreakdown.push({ subject, completedPct: counts.total > 0 ? (counts.done / counts.total) * 100 : 0 });
          }
        }
      }

      // Next exam
      const { data: uploads } = await db
        .from('uploads')
        .select('parsed_payload')
        .eq('child_id', c.id)
        .eq('file_type', 'assessment_dates')
        .eq('status', 'parsed');

      const examEntries = (uploads ?? []).flatMap(u => {
        const p = (u as { parsed_payload: unknown }).parsed_payload as Array<{ label: string; date: string }> | null;
        return p ?? [];
      }).filter(e => typeof e.label === 'string' && !isNaN(Date.parse(e.date)));

      const nextExam = examEntries
        .map(e => ({ ...e, days: Math.ceil((new Date(e.date).getTime() - today.getTime()) / 86400000) }))
        .filter(e => e.days > 0)
        .sort((a, b) => a.days - b.days)[0] ?? null;

      // Generate card image
      const html = buildCardHTML({
        childName: c.name,
        gradeLevel: c.grade_level,
        weekStart,
        bitesCompleted: completed,
        bitesTotal: total,
        streakDays,
        subjectBreakdown,
        wellbeingStatus,
        nextExamLabel: nextExam?.label ?? 'PSLE',
        nextExamDays: nextExam?.days ?? Math.ceil((new Date('2026-10-01').getTime() - today.getTime()) / 86400000),
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1080, height: 1350 });
      await page.setContent(html, { waitUntil: 'load' });
      const screenshot = await page.screenshot({ type: 'png' }) as Buffer;
      await page.close();

      // Upload to Supabase Storage
      const storagePath = `${c.id}/${weekStart}.png`;
      const { error: uploadErr } = await db.storage
        .from('weekly-cards')
        .upload(storagePath, screenshot, { contentType: 'image/png', upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = db.storage.from('weekly-cards').getPublicUrl(storagePath);
      const imageUrl = urlData.publicUrl;

      const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();

      await db.from('weekly_cards').upsert({
        child_id: c.id,
        image_url: imageUrl,
        pdf_url: imageUrl,
        wellbeing_status: wellbeingStatus,
        week_start: weekStart,
        generated_at: today.toISOString(),
        expires_at: expiresAt,
      }, { onConflict: 'child_id,week_start' });

      console.log(`[weekly-card] ✓ ${c.name} — ${imageUrl}`);
    } catch (err) {
      console.error(`[weekly-card] ✗ ${c.name}: ${String(err)}`);
    }
  }

  await browser.close();
  console.log('[weekly-card] Done');
}

main().catch(err => {
  console.error('[weekly-card] Fatal:', err);
  process.exit(1);
});
