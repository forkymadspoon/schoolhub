import { useEffect, useState } from 'react';
import type { Child } from '@schoolhub/types';
import { api } from '../../services/api';
import { useWellbeing } from '../../hooks/useWellbeing';
import { useActiveChild } from '../../hooks/useActiveChild';
import { WellbeingPanel } from './WellbeingPanel';

const SIGNAL_LABELS: Record<string, string> = {
  overload_risk:           'Overload risk',
  burnout_risk:            'Burnout risk',
  comprehension_plateau:   'Comprehension plateau',
  activity_imbalance:      'Activity imbalance',
  exam_anxiety:            'Exam anxiety',
};

export function WellbeingPage() {
  const { activeChild } = useActiveChild();
  const [showPanel, setShowPanel] = useState(false);
  const childId = activeChild?.id ?? null;
  const { signals, refresh } = useWellbeing(childId);
  const openSignals = signals.filter(s => !s.resolved_at);

  const statusColor = openSignals.length === 0
    ? 'bg-game-green-tint border-game-green/30 text-game-green'
    : openSignals.length <= 2
    ? 'bg-game-yellow-tint border-game-yellow/30 text-ink'
    : 'bg-game-orange-tint border-game-orange/30 text-ink';

  return (
    <div className="flex flex-col gap-5">
      {/* Scholar Pro gate notice */}
      <div className="bg-primary/5 border border-primary/20 rounded-card px-4 py-3 flex items-center gap-3">
        <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-pill shrink-0">Scholar Pro</span>
        <p className="text-muted text-xs">Full wellbeing dashboard available on Scholar Pro. Showing a preview.</p>
      </div>

      {/* Status summary */}
      <div className={`card border ${statusColor} flex items-center gap-4`}>
        <div>
          <p className="text-2xl font-extrabold text-ink">{openSignals.length}</p>
          <p className="text-muted text-xs">open signals</p>
        </div>
        <div className="flex-1">
          <p className="text-ink font-semibold text-sm">
            {openSignals.length === 0 ? 'All clear — looking great!' : 'Signals need your attention'}
          </p>
          <p className="text-muted text-xs mt-0.5">
            {openSignals.length === 0
              ? "Your child's study load and pace look healthy."
              : 'Review the signals below and choose how to respond.'}
          </p>
        </div>
      </div>

      {/* Signal list */}
      {openSignals.length === 0 ? (
        <div className="card text-center py-8 flex flex-col items-center gap-3">
          <span className="text-4xl">🌱</span>
          <p className="text-ink font-semibold text-sm">No active signals</p>
          <p className="text-muted text-xs max-w-xs">
            SchoolHub checks study load, completion rate, and patterns hourly. You'll be notified if anything needs attention.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {openSignals.map(signal => (
            <div key={signal.id} className="card flex flex-col gap-2 border border-game-orange/20 bg-game-orange-tint">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-ink font-semibold text-sm">
                    {SIGNAL_LABELS[signal.signal_type] ?? signal.signal_type}
                  </p>
                  <p className="text-muted text-xs mt-0.5">{signal.recommended_action}</p>
                </div>
                <span className="status-dot status-dot-red mt-1 shrink-0" />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setShowPanel(true)}
            className="btn-primary py-3 text-sm w-full"
          >
            Respond to signals
          </button>
        </div>
      )}

      {/* Holistic activity prompts */}
      <div className="card flex flex-col gap-3">
        <h3 className="text-ink font-semibold text-sm">This week's activity prompts</h3>
        <p className="text-muted text-xs">Balance academics with holistic wellbeing.</p>
        <div className="flex flex-col gap-2">
          {[
            { emoji: '🌳', label: 'Outdoor', desc: '30 min of outdoor play or sports' },
            { emoji: '🎨', label: 'Creative', desc: 'Drawing, music, or crafts' },
            { emoji: '👨‍👩‍👧', label: 'Family', desc: 'Screen-free family time' },
          ].map(p => (
            <div key={p.label} className="flex items-center gap-3 bg-bg rounded-2xl px-3 py-2">
              <span className="text-xl leading-none">{p.emoji}</span>
              <div>
                <p className="text-ink text-sm font-medium">{p.label}</p>
                <p className="text-muted text-xs">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-muted text-[10px] italic">
          Suggestions only — not a clinical tool. Always consult a professional for medical concerns.
        </p>
      </div>

      {showPanel && activeChild && (
        <WellbeingPanel
          childId={activeChild.id}
          childName={activeChild.name}
          onClose={() => { setShowPanel(false); refresh(); }}
        />
      )}
    </div>
  );
}
