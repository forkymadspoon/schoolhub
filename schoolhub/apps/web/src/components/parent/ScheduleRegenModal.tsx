import { useEffect, useState } from 'react';
import type { SENProfile, ScheduleRegeneratePreview, ScheduleActivation } from '@schoolhub/types';
import { api } from '../../services/api';

interface RegenResponse {
  preview: ScheduleRegeneratePreview;
  activation: ScheduleActivation;
  schedule_id: string;
}

interface Props {
  childId: string;
  childName: string;
  senProfile: SENProfile;
  onClose: () => void;
  onConfirmed: () => void;
}

export function ScheduleRegenModal({ childId, childName, senProfile: _senProfile, onClose, onConfirmed }: Props) {
  const [state, setState] = useState<'loading' | 'preview' | 'confirming' | 'error'>('loading');
  const [result, setResult] = useState<RegenResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const regenerate = () => {
    setState('loading');
    void api
      .post<RegenResponse>(`/schedules/${childId}/regenerate`, { trigger: 'manual' })
      .then(r => { setResult(r); setState('preview'); })
      .catch((e: unknown) => { setErrorMsg(String(e)); setState('error'); });
  };

  useEffect(() => { regenerate(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const confirm = async () => {
    if (!result) return;
    setState('confirming');
    try {
      await api.post(`/schedules/${childId}/confirm`, {
        new_schedule_hash: result.preview.new_schedule_hash,
      });
      onConfirmed();
    } catch (e: unknown) {
      setErrorMsg(String(e));
      setState('error');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-card shadow-card w-full max-w-md mx-4 p-6 flex flex-col gap-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-ink font-semibold text-lg">Regenerate schedule</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-ink transition-colors text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {state === 'loading' && (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted text-sm">Building your new schedule…</p>
          </div>
        )}

        {state === 'confirming' && (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted text-sm">Saving schedule…</p>
          </div>
        )}

        {state === 'error' && (
          <>
            <p className="text-red-600 text-sm">{errorMsg || 'Something went wrong.'}</p>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
              <button type="button" onClick={regenerate} className="btn-primary">Try again</button>
            </div>
          </>
        )}

        {state === 'preview' && result && (
          <>
            <p className="text-ink text-sm">{result.preview.reason_text}</p>

            {(result.preview.added_bites !== 0 || result.preview.removed_bites !== 0) && (
              <div className="flex gap-2 flex-wrap">
                {result.preview.added_bites > 0 && (
                  <span className="rounded-pill bg-game-green-tint text-game-green text-xs font-medium px-3 py-1">
                    +{result.preview.added_bites} bites added
                  </span>
                )}
                {result.preview.removed_bites > 0 && (
                  <span className="rounded-pill bg-game-orange-tint text-game-orange text-xs font-medium px-3 py-1">
                    −{result.preview.removed_bites} bites removed
                  </span>
                )}
              </div>
            )}

            {result.activation.mode === 'delayed_48h' && (
              <div className="rounded-card bg-game-yellow-tint border border-game-yellow/30 p-3 text-sm text-ink">
                This schedule will activate in 48 hours to give{' '}
                <strong>{childName}</strong> time to adjust.
              </div>
            )}

            <div className="flex gap-2 justify-end pt-2">
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
              <button type="button" onClick={() => void confirm()} className="btn-primary">
                Confirm schedule
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
