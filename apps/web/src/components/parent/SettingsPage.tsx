import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Child } from '@schoolhub/types';
import { api } from '../../services/api';
import { supabase } from '../../services/supabase';
import { SENProfilePicker } from './SENProfilePicker';
import { NotificationSettings } from './NotificationSettings';

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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
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
  const [section, setSection] = useState<'main' | 'sen' | 'notifications' | 'data'>('main');
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);

  useEffect(() => {
    void api.get<Child[]>('/children').then(setChildren).catch(() => null);
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  if (section === 'sen' && selectedChild) {
    return (
      <div className="flex flex-col gap-5">
        <button type="button" onClick={() => setSection('main')}
          className="text-muted text-sm hover:text-ink flex items-center gap-1 self-start">
          ← Back
        </button>
        <div className="card flex flex-col gap-4">
          <h3 className="text-ink font-semibold">SEN profile — {selectedChild.name}</h3>
          <SENProfilePicker
            value={selectedChild.sen_profile}
            onChange={async (profile) => {
              await api.patch(`/children/${selectedChild.id}/sen-profile`, { sen_profile: profile });
              setChildren(cs => cs.map(c => c.id === selectedChild.id ? { ...c, sen_profile: profile } : c));
              setSection('main');
            }}
          />
        </div>
      </div>
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
        {children.map(child => (
          <div key={child.id} className="flex items-center justify-between bg-bg rounded-2xl px-3 py-3">
            <div>
              <p className="text-ink font-medium text-sm">{child.name}</p>
              <p className="text-muted text-xs">{child.grade_level} · {child.sen_profile ?? 'No SEN profile'}</p>
            </div>
            <button
              type="button"
              onClick={() => { setSelectedChild(child); setSection('sen'); }}
              className="text-primary text-xs font-medium hover:underline"
            >
              Edit SEN
            </button>
          </div>
        ))}
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
