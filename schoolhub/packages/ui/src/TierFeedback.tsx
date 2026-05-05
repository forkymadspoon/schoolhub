import type { GradeBand, MoodRating } from '@schoolhub/types';

interface Props {
  gradeBand: GradeBand;
  mood: MoodRating;
  /** Positive reinforcement copy — always shown for ADHD profile */
  alwaysPositive?: boolean;
}

const FEEDBACK: Record<MoodRating, { emoji: string; copy: string }> = {
  got_it:     { emoji: '🎯', copy: "That's right — great work!" },
  okay:       { emoji: '👍', copy: 'Good effort! Keep going.' },
  struggling: { emoji: '💪', copy: "Tough one — we'll revisit it soon." },
};

/**
 * Grade-band–aware feedback message shown after bite completion.
 * K2/LP stub until grade scope expands.
 */
export function TierFeedback({ gradeBand, mood, alwaysPositive = false }: Props) {
  if (gradeBand === 'K2' || gradeBand === 'Lower_Primary') return null;

  const fb = alwaysPositive ? FEEDBACK.got_it : FEEDBACK[mood];

  return (
    <div className="flex items-center gap-3 bg-game-green-tint rounded-2xl px-4 py-3">
      <span className="text-2xl" aria-hidden="true">{fb.emoji}</span>
      <span className="font-bold text-ink text-sm">{fb.copy}</span>
    </div>
  );
}
