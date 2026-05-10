import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Child } from '@schoolhub/types';
import { api } from '../../services/api';
import { supabase } from '../../services/supabase';
import { SENProfilePicker } from './SENProfilePicker';
import { NotificationSettings } from './NotificationSettings';

export function SettingsPage() {
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [section, setSection] = useState<'main' | 'sen' | 'notifications'>('main');
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
