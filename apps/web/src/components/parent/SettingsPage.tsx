import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Child, GradeLevel, SENProfile } from '@schoolhub/types';
import { gradeBandForLevel } from '@schoolhub/types';
import { api } from '../../services/api';
import { supabase } from '../../services/supabase';
import { SENProfilePicker } from './SENProfilePicker';
import { NotificationSettings } from './NotificationSettings';
import PencilIcon from '../../assets/icons/interface/pencil.svg?react';
import DeleteIcon from '../../assets/icons/interface/delete.svg?react';
import DownloadIcon from '../../assets/icons/interface/download.svg?react';
import UploadIcon from '../../assets/icons/interface/upload.svg?react';

const ALL_GRADES: GradeLevel[] = ['K2', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6'];
const CHILD_EMOJIS = ['🦊', '🐼', '🦁', '🐯'];

interface EditChildState {
  name: string;
  grade_level: GradeLevel;
  school_name: string;
  school_start: string;
  school_end: string;
  sen_profile: SENProfile;
  gamification_enabled: boolean;
}

function EditChildSection({ child, idx, onBack, onSaved }: {
  child: Child;
  idx: number;
  onBack: () => void;
  onSaved: (updated: Child) => void;
}) {
  const [form, setForm] = useState<EditChildState>({
    name: child.name,
    grade_level: child.grade_level,
    school_name: '',
    school_start: '07:30',
    school_end: '13:30',
    sen_profile: child.sen_profile,
    gamification_enabled: child.gamification_enabled,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function patch(partial: Partial<EditChildState>) {
    setForm(prev => ({ ...prev, ...partial }));
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      const updated = await api.patch<Child>(`/children/${child.id}`, {
        name: form.name.trim(),
        grade_level: form.grade_level,
        grade_band: gradeBandForLevel(form.grade_level),
        sen_profile: form.sen_profile,
        gamification_enabled: form.gamification_enabled,
        school_name: form.school_name || undefined,
        school_start: form.school_start || undefined,
        school_end: form.school_end || undefined,
      });
      onSaved({ ...child, ...updated });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <button type="button" onClick={onBack}
        className="text-muted text-sm hover:text-ink flex items-center gap-1 self-start min-h-0">
        ← Back
      </button>

      <div className="card flex flex-col gap-5">
        {/* Avatar + heading */}
        <div className="flex items-center gap-3">
          <span className="text-3xl">{CHILD_EMOJIS[idx % CHILD_EMOJIS.length]}</span>
          <div>
            <h3 className="text-ink font-semibold">Edit profile</h3>
            <p className="text-muted text-xs">{child.name}</p>
          </div>
        </div>

        {error && (
          <div className="px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>
        )}

        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-ink uppercase tracking-wide">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => patch({ name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-line bg-bg text-ink text-sm focus:outline-none focus:border-primary transition-colors"
            style={{ minHeight: 0 }}
          />
        </div>

        {/* Grade level */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-ink uppercase tracking-wide">Grade level</label>
          <select
            value={form.grade_level}
            onChange={e => patch({ grade_level: e.target.value as GradeLevel })}
            className="w-full px-4 py-3 rounded-xl border border-line bg-bg text-ink text-sm focus:outline-none focus:border-primary transition-colors"
            style={{ minHeight: 0 }}
          >
            {ALL_GRADES.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* School name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-ink uppercase tracking-wide">School name</label>
          <input
            type="text"
            value={form.school_name}
            onChange={e => patch({ school_name: e.target.value })}
            placeholder="e.g. Raffles Girls' Primary School"
            className="w-full px-4 py-3 rounded-xl border border-line bg-bg text-ink placeholder:text-muted text-sm focus:outline-none focus:border-primary transition-colors"
            style={{ minHeight: 0 }}
          />
        </div>

        {/* School hours */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-ink uppercase tracking-wide">School hours</label>
          <div className="flex items-center gap-3">
            <input
              type="time"
              value={form.school_start}
              onChange={e => patch({ school_start: e.target.value })}
              className="flex-1 px-4 py-3 rounded-xl border border-line bg-bg text-ink text-sm focus:outline-none focus:border-primary transition-colors"
              style={{ minHeight: 0 }}
            />
            <span className="text-muted text-sm">to</span>
            <input
              type="time"
              value={form.school_end}
              onChange={e => patch({ school_end: e.target.value })}
              className="flex-1 px-4 py-3 rounded-xl border border-line bg-bg text-ink text-sm focus:outline-none focus:border-primary transition-colors"
              style={{ minHeight: 0 }}
            />
          </div>
        </div>

        {/* Gamification */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink">Gamification</p>
            <p className="text-xs text-muted">Streaks, XP, and badges</p>
          </div>
          <button
            type="button"
            onClick={() => patch({ gamification_enabled: !form.gamification_enabled })}
            className={`relative w-11 h-6 rounded-full transition-colors min-h-0 min-w-0 ${form.gamification_enabled ? 'bg-primary' : 'bg-line'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.gamification_enabled ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        <div className="border-t border-line" />

        {/* SEN profile */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold text-ink uppercase tracking-wide">SEN profile</p>
          <SENProfilePicker
            value={form.sen_profile}
            onChange={profile => patch({ sen_profile: profile })}
          />
        </div>

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="btn-primary py-3 text-sm"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

function DataPortabilitySection({ onBack }: { onBack: () => void }) {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMsg, setImportMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleExport() {
    setExporting(true);
    try {
      const children = await api.get<Child[]>('/children');
      const enriched = await Promise.all(
        children.map(async (child) => {
          const [schedule, stats, bites, badges] = await Promise.allSettled([
            api.get<Record<string, unknown>>(`/schedules/${child.id}`),
            api.get<{ streak: number; total_xp: number }>(`/children/${child.id}/stats`),
            api.get<unknown[]>(`/bites?child_id=${child.id}&limit=500`),
            api.get<unknown[]>(`/children/${child.id}/badges`),
          ]);
          return {
            ...child,
            schedule: schedule.status === 'fulfilled' ? schedule.value : null,
            xp_total: stats.status === 'fulfilled' ? stats.value.total_xp : 0,
            bites: bites.status === 'fulfilled' ? bites.value : [],
            badges: badges.status === 'fulfilled' ? badges.value : [],
          };
        })
      );
      const payload = { exported_at: new Date().toISOString(), version: 1, children: enriched };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `schoolhub-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportStatus('idle');
    try {
      const text = await file.text();
      const payload = JSON.parse(text) as unknown;
      if (
        typeof payload !== 'object' || payload === null ||
        !('version' in payload) || !Array.isArray((payload as Record<string, unknown>).children)
      ) {
        throw new Error('Invalid SchoolHub export file.');
      }
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      const res = await fetch(`${API_BASE}/api/data/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: text,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as Record<string, unknown>;
        throw new Error((err.error as string | undefined) ?? 'Import failed');
      }
      const result = await res.json() as { imported_children: number };
      setImportStatus('success');
      setImportMsg(`${result.imported_children} child profile${result.imported_children !== 1 ? 's' : ''} imported. Reload to see your data.`);
    } catch (err) {
      setImportStatus('error');
      setImportMsg(err instanceof Error ? err.message : 'Import failed.');
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <button type="button" onClick={onBack}
        className="text-muted text-sm hover:text-ink flex items-center gap-1 self-start">
        ← Back
      </button>

      <div className="card flex flex-col gap-5">
        <div>
          <h3 className="text-ink font-semibold text-sm">Your data</h3>
          <p className="text-muted text-xs mt-1">Your schedules, progress, and badges belong to you. Export a JSON backup anytime and import it on a new device.</p>
        </div>

        {/* Export */}
        <div className="flex flex-col gap-2">
          <p className="text-ink text-sm font-medium">Export</p>
          <p className="text-muted text-xs">Downloads a JSON file with all your children's profiles, schedules, completed bites, badges, and XP.</p>
          <button
            type="button"
            onClick={() => void handleExport()}
            disabled={exporting}
            className="btn-primary py-2.5 text-sm flex items-center justify-center gap-2"
          >
            <DownloadIcon className="w-4 h-4" />
            {exporting ? 'Exporting…' : 'Download my data'}
          </button>
        </div>

        <div className="border-t border-line" />

        {/* Import */}
        <div className="flex flex-col gap-2">
          <p className="text-ink text-sm font-medium">Import</p>
          <p className="text-muted text-xs">Restore from a SchoolHub export file. Existing data will not be overwritten.</p>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => void handleImportFile(e)}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            className="btn-secondary py-2.5 text-sm flex items-center justify-center gap-2"
          >
            <UploadIcon className="w-4 h-4" />
            {importing ? 'Importing…' : 'Import from file'}
          </button>
          {importStatus === 'success' && (
            <p className="text-xs text-green-600 font-medium">{importMsg}</p>
          )}
          {importStatus === 'error' && (
            <p className="text-xs text-red-500">{importMsg}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [section, setSection] = useState<'main' | 'edit-child' | 'notifications' | 'data'>('main');
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [selectedChildIdx, setSelectedChildIdx] = useState<number>(0);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    void api.get<Child[]>('/children').then(setChildren).catch(() => null);
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  async function handleRemoveChild(childId: string) {
    setDeleting(true);
    try {
      await api.delete(`/children/${childId}`);
      setChildren(cs => cs.filter(c => c.id !== childId));
      setConfirmDeleteId(null);
    } catch {
      // silently reset — API error unlikely to need surfacing here
    } finally {
      setDeleting(false);
    }
  }

  if (section === 'edit-child' && selectedChild) {
    return (
      <EditChildSection
        child={selectedChild}
        idx={selectedChildIdx}
        onBack={() => setSection('main')}
        onSaved={(updated) => {
          setChildren(cs => cs.map(c => c.id === updated.id ? updated : c));
          setSection('main');
        }}
      />
    );
  }

  if (section === 'data') {
    return <DataPortabilitySection onBack={() => setSection('main')} />;
  }

  if (section === 'notifications') {
    return (
      <div className="flex flex-col gap-5">
        <button type="button" onClick={() => setSection('main')}
          className="text-muted text-sm hover:text-ink flex items-center gap-1 self-start">
          ← Back
        </button>
        <div className="card">
          <NotificationSettings />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Child profiles */}
      <div className="card flex flex-col gap-3">
        <h3 className="text-ink font-semibold text-sm">Child profiles</h3>
        {children.map((child, i) => (
          <div key={child.id} className="flex items-center justify-between bg-bg rounded-2xl px-3 py-3">
            <div className="flex items-center gap-3">
              <span className="text-xl">{CHILD_EMOJIS[i % CHILD_EMOJIS.length]}</span>
              <div>
                <p className="text-ink font-medium text-sm">{child.name}</p>
                <p className="text-muted text-xs">
                  {child.grade_level}
                  {child.sen_profile ? ` · ${child.sen_profile.replace('_', ' ')}` : ''}
                </p>
              </div>
            </div>
            {confirmDeleteId === child.id ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">Remove {child.name}?</span>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(null)}
                  className="text-xs text-muted hover:text-ink font-medium min-h-0"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleRemoveChild(child.id)}
                  disabled={deleting}
                  className="text-xs text-game-orange font-semibold hover:underline min-h-0 disabled:opacity-50"
                >
                  {deleting ? 'Removing…' : 'Yes, remove'}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  title="Edit profile"
                  onClick={() => { setSelectedChild(child); setSelectedChildIdx(i); setSection('edit-child'); }}
                  className="p-2 rounded-lg text-muted hover:text-primary hover:bg-primary-soft transition-colors min-h-0 min-w-0"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="Remove child"
                  onClick={() => setConfirmDeleteId(child.id)}
                  className="p-2 rounded-lg text-muted hover:text-game-orange hover:bg-game-orange-tint transition-colors min-h-0 min-w-0"
                >
                  <DeleteIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => navigate('/onboarding')}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-dashed border-line text-muted text-sm font-medium hover:border-primary hover:text-primary transition-colors min-h-0"
        >
          <span className="text-base leading-none">+</span>
          Add child
        </button>
      </div>

      {/* Notifications */}
      <button
        type="button"
        onClick={() => setSection('notifications')}
        className="card flex items-center justify-between text-left hover:shadow-md transition-shadow"
      >
        <div>
          <p className="text-ink font-medium text-sm">Notifications</p>
          <p className="text-muted text-xs">Telegram, SMS, and digest settings</p>
        </div>
        <span className="text-muted text-lg">›</span>
      </button>

      {/* Your data */}
      <button
        type="button"
        onClick={() => setSection('data')}
        className="card flex items-center justify-between text-left hover:shadow-md transition-shadow"
      >
        <div>
          <p className="text-ink font-medium text-sm">Your data</p>
          <p className="text-muted text-xs">Export or import your schedules and progress</p>
        </div>
        <span className="text-muted text-lg">›</span>
      </button>

      {/* Subscription */}
      <div className="card flex flex-col gap-3 opacity-70">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-ink font-medium text-sm">Subscription</p>
            <p className="text-muted text-xs">Free trial · 7 days remaining</p>
          </div>
          <span className="bg-game-yellow-tint text-ink text-[10px] font-bold px-2 py-0.5 rounded-pill">Trial</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { plan: 'Free', price: '$0', note: 'Trial' },
            { plan: 'Scholar', price: '$18', note: '/mo' },
            { plan: 'Scholar Pro', price: '$35', note: '/mo' },
          ].map(p => (
            <div key={p.plan} className="bg-bg rounded-2xl px-2 py-3">
              <p className="text-ink text-xs font-semibold">{p.plan}</p>
              <p className="text-primary font-bold text-sm">{p.price}<span className="text-muted text-[10px]">{p.note}</span></p>
            </div>
          ))}
        </div>
        <button type="button" disabled className="btn-primary py-2.5 text-sm opacity-40">
          Upgrade plan
        </button>
      </div>

      {/* Switch to student view */}
      <button
        type="button"
        onClick={() => navigate('/student')}
        className="card flex items-center justify-between text-left hover:shadow-md transition-shadow"
      >
        <div>
          <p className="text-ink font-medium text-sm">Switch to student view</p>
          <p className="text-muted text-xs">See the app as your child would</p>
        </div>
        <span className="text-muted text-lg">›</span>
      </button>

      {/* Sign out */}
      <button
        type="button"
        onClick={() => void handleSignOut()}
        className="btn-secondary py-3 text-sm text-game-orange border-game-orange/30 hover:border-game-orange"
      >
        Sign out
      </button>
    </div>
  );
}
