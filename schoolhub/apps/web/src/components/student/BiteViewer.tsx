import { useState, useEffect, useRef } from 'react';
import type { Bite, SENProfile, MoodRating } from '@schoolhub/types';
import { biteDurationCap } from '@schoolhub/types';
import { api } from '../../services/api';
import { BiteQuiz } from './BiteQuiz';

interface Props {
  bite: Bite;
  scheduleBiteId: string;
  childId: string;
  senProfile: SENProfile;
  onBack: () => void;
}

type ViewerState = 'reading' | 'quiz' | 'mood' | 'completing';

interface CompleteResult {
  ok: boolean;
  xp_delta: number;
  total_xp: number;
  streak_days: number;
  badge?: { subject: string; tier: string };
}

export function BiteViewer({ bite, scheduleBiteId, childId, senProfile, onBack }: Props) {
  const [state, setState] = useState<ViewerState>('reading');
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<CompleteResult | null>(null);
  const [showToast, setShowToast] = useState(false);
  const startTimeRef = useRef(Date.now());

  const isADHD = senProfile === 'ADHD';
  const capMinutes = biteDurationCap('Upper_Primary', senProfile);
  const [timerPct, setTimerPct] = useState(100);

  // ADHD countdown timer bar
  useEffect(() => {
    if (!isADHD || state !== 'reading') return;
    const totalMs = capMinutes * 60 * 1000;
    const id = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      setTimerPct(Math.max(0, 100 - (elapsed / totalMs) * 100));
    }, 1000);
    return () => clearInterval(id);
  }, [isADHD, capMinutes, state]);

  const handleComplete = async (mood: MoodRating) => {
    setState('completing');
    const duration_sec = Math.round((Date.now() - startTimeRef.current) / 1000);
    try {
      const res = await api.post<CompleteResult>(`/bites/${scheduleBiteId}/complete`, {
        answers,
        duration_sec,
        mood,
        child_id: childId,
      });
      setResult(res);
      setShowToast(true);
      setTimeout(() => { setShowToast(false); onBack(); }, 2200);
    } catch {
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* ADHD timer bar */}
      {isADHD && (
        <div className="h-1.5 bg-line w-full overflow-hidden" aria-hidden="true">
          <div
            className="h-full bg-game-green transition-all duration-1000 ease-linear"
            style={{ width: `${timerPct}%` }}
          />
        </div>
      )}
      {isADHD && timerPct === 0 && (
        <span className="sr-only" aria-live="polite">Time is up. Please move on to the quiz.</span>
      )}

      <header className="bg-surface border-b border-line px-4 py-3 flex items-center gap-3">
        {!isADHD && (
          <button
            type="button"
            onClick={onBack}
            className="text-muted hover:text-ink text-sm transition-colors"
            aria-label="Back"
          >
            ← Back
          </button>
        )}
        <h1 className="text-ink font-semibold text-sm flex-1 truncate">{bite.content_json.title}</h1>
        <span className="text-muted text-xs shrink-0">{bite.duration_min} min</span>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 flex flex-col gap-5">
        {state === 'reading' && (
          <ReadingView bite={bite} onStartQuiz={() => setState('quiz')} />
        )}

        {state === 'quiz' && (
          <BiteQuiz
            quiz={bite.content_json.quiz}
            onComplete={(ans) => { setAnswers(ans); setState('mood'); }}
          />
        )}

        {state === 'mood' && (
          <MoodCapture onSelect={(mood) => void handleComplete(mood)} />
        )}

        {state === 'completing' && (
          <div className="flex flex-col items-center gap-3 py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted text-sm">Saving your progress…</p>
          </div>
        )}
      </main>

      {showToast && result && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="bg-ink text-white rounded-pill px-5 py-2.5 font-bold text-sm shadow-card flex items-center gap-2">
            <span>+{result.xp_delta} XP</span>
            {result.badge && (
              <span className="text-game-yellow">🏆 {result.badge.tier} badge!</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ReadingView({ bite, onStartQuiz }: { bite: Bite; onStartQuiz: () => void }) {
  return (
    <>
      <div className="card flex flex-col gap-4">
        <p className="text-muted text-xs font-semibold uppercase tracking-wide">
          {bite.content_json.learning_objective}
        </p>
        <p className="text-ink text-sm leading-relaxed">{bite.content_json.text}</p>

        {bite.content_json.key_terms.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-muted text-xs font-semibold">Key terms</p>
            <div className="flex flex-wrap gap-2">
              {bite.content_json.key_terms.map(({ term, definition }) => (
                <abbr
                  key={term}
                  title={definition}
                  className="no-underline rounded-pill bg-primary-soft text-primary text-xs px-3 py-1 cursor-help"
                >
                  {term}
                </abbr>
              ))}
            </div>
          </div>
        )}
      </div>

      <button type="button" className="btn-primary self-start" onClick={onStartQuiz}>
        Start Quiz →
      </button>
    </>
  );
}

function MoodCapture({ onSelect }: { onSelect: (mood: MoodRating) => void }) {
  const options: Array<{ value: MoodRating; emoji: string; label: string }> = [
    { value: 'struggling', emoji: '😰', label: 'Struggling' },
    { value: 'okay',       emoji: '😐', label: 'Okay' },
    { value: 'got_it',     emoji: '🎉', label: 'Got it!' },
  ];

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <p className="text-ink font-semibold text-base text-center">How did that feel?</p>
      <div className="flex gap-4">
        {options.map(({ value, emoji, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            className="flex flex-col items-center gap-2 rounded-card bg-surface border border-line p-4 hover:border-primary/50 transition-colors min-w-[80px]"
            aria-label={label}
          >
            <span className="text-3xl" aria-hidden="true">{emoji}</span>
            <span className="text-xs text-muted font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
