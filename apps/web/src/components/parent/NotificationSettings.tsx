import { useState, useEffect } from 'react';
import type { NotificationChannel, NotificationMode, NotificationPrefs } from '@schoolhub/types';
import { api } from '../../services/api';
import { supabase } from '../../services/supabase';

const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  telegram: 'Telegram',
  sms: 'SMS',
};

const MODE_LABELS: Record<NotificationMode, string> = {
  weekly_digest: 'Weekly digest',
  daily_progress: 'Daily progress',
  realtime: 'Real-time',
};

export function NotificationSettings() {
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [channel, setChannel] = useState<NotificationChannel>('telegram');
  const [mode, setMode] = useState<NotificationMode>('weekly_digest');
  const [parentId, setParentId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      setParentId(data.user?.id ?? null);
    });
    void api.get<NotificationPrefs>('/notifications/config').then((p) => {
      setPrefs(p);
      setChannel(p.channel);
      setMode(p.mode);
    }).catch(() => null);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/notifications/config', { channel, mode });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // silent — user can retry
    } finally {
      setSaving(false);
    }
  };

  const handleUnlink = async () => {
    try {
      await api.post('/notifications/telegram/link', { telegram_chat_id: '' });
      setPrefs(prev => prev ? { ...prev, telegram_chat_id: null } : prev);
    } catch {
      // silent
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Channel */}
      <div className="flex flex-col gap-2">
        <p className="text-ink text-sm font-medium">Notification channel</p>
        <div className="flex gap-3">
          {(['telegram', 'sms'] as NotificationChannel[]).map((ch) => (
            <label key={ch} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="channel"
                value={ch}
                checked={channel === ch}
                onChange={() => setChannel(ch)}
                className="accent-primary"
              />
              <span className="text-ink text-sm">{CHANNEL_LABELS[ch]}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Mode */}
      <div className="flex flex-col gap-2">
        <p className="text-ink text-sm font-medium">Frequency</p>
        <div className="flex flex-col gap-2">
          {(['weekly_digest', 'daily_progress', 'realtime'] as NotificationMode[]).map((m) => (
            <label key={m} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mode"
                value={m}
                checked={mode === m}
                onChange={() => setMode(m)}
                className="accent-primary"
              />
              <span className="text-ink text-sm">{MODE_LABELS[m]}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Telegram link */}
      {channel === 'telegram' && (
        <div className="flex flex-col gap-2 bg-bg rounded-xl p-3">
          <p className="text-ink text-sm font-medium">Telegram account</p>
          {prefs?.telegram_chat_id ? (
            <div className="flex items-center justify-between">
              <span className="text-game-green text-sm">Linked ✓</span>
              <button
                type="button"
                onClick={() => void handleUnlink()}
                className="text-muted text-xs underline hover:text-ink"
              >
                Unlink
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-muted text-xs">Message our bot to link your account, then tap the button below.</p>
              {parentId && (
                <a
                  href={`https://t.me/SchoolHubBot?start=link_${parentId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-sm px-4 py-2 text-center rounded-pill inline-block"
                >
                  Open @SchoolHubBot
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Save */}
      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={saving}
        className="btn-primary text-sm px-4 py-2 self-start"
      >
        {saved ? 'Saved ✓' : saving ? 'Saving…' : 'Save settings'}
      </button>
    </div>
  );
}
