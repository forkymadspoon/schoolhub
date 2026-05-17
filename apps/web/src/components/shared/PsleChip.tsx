import HeartIcon from '../../assets/icons/interface/heart.svg?react';
import type { GradeLevel } from '@schoolhub/types';

// Rotates daily so the message feels fresh without any state
function pickDaily(arr: string[]): string {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000);
  return arr[dayOfYear % arr.length] ?? arr[0] ?? '';
}

const TIPS: Record<string, string[]> = {
  P6: [
    'Consistency beats cramming',
    'Rest is part of the plan',
    'Progress over perfection',
    'Short breaks boost focus',
    'You\'ve got this together',
    'One good session a day is enough',
    'Calm parents raise calm kids',
    'Revision is just practice — keep it light',
    'Effort matters more than grades',
    'Celebrate every milestone, big or small',
  ],
  P5: [
    'Habits built now pay off next year',
    'Strong foundations win PSLE',
    'Steady effort beats last-minute rush',
    'Encourage curiosity every day',
    'One subject at a time',
    'This year is about building confidence',
    'Help them find their study rhythm',
    'Mistakes are part of learning',
    'Praise the process, not the score',
    'Small daily wins compound over time',
  ],
  P4: [
    'Science starts here — explore together',
    'Make learning a daily ritual',
    'Ask questions, not just answers',
    'Celebrate small wins daily',
    'Effort today = confidence tomorrow',
    'Let them struggle a little — it builds grit',
    'Reading widely helps every subject',
    'Curiosity is more valuable than speed',
    'Keep study sessions short and focused',
    'A rested brain learns better',
  ],
  P3: [
    'This is a great year to build study habits',
    'Short daily sessions beat weekend marathons',
    'Let them explain what they learnt today',
    'Praise effort — not just correct answers',
    'Stories and games are still learning',
    'Help them organise — it\'s a life skill',
    'A positive attitude is half the battle',
    'Ask "what was interesting today?" not "what score?"',
    'Encourage questions — all of them',
    'Sleep is when the brain consolidates learning',
  ],
  P2: [
    'Reading aloud together still works wonders',
    'Spelling is a habit — five words a day',
    'Let them teach you what they know',
    'Encourage, don\'t correct every mistake',
    'Fun maths games beat worksheets',
    'Routine is your best friend this year',
    'Confidence now builds results later',
    'Celebrate curiosity over compliance',
    'Every book they finish is a win',
    'Their pace is the right pace',
  ],
  P1: [
    'The transition is big — be patient',
    'School tiredness is real — rest matters',
    'Ask about friends, not just homework',
    'Reading 10 minutes a night adds up fast',
    'Let them unpack their own bag — independence starts here',
    'Encouragement goes further than pressure',
    'This year is about loving learning',
    'Mistakes mean they\'re trying — that\'s great',
    'Celebrate the effort of showing up every day',
    'Play after school is not wasted time',
  ],
  K2: [
    'Play is how children learn best',
    'Reading together every night makes a difference',
    'P1 prep is about confidence, not content',
    'Let them get messy — it\'s exploration',
    'Singing and counting together really helps',
    'Curiosity is the foundation of all learning',
    'Praise bravery — trying new things matters',
    'Routine now makes P1 transition smoother',
    'Their imagination is a learning superpower',
    'You\'re doing great — so are they',
  ],
};

interface Props {
  gradeLevel: GradeLevel;
}

export function PsleChip({ gradeLevel }: Props) {
  const tips = TIPS[gradeLevel] ?? TIPS['P1'] ?? [];
  const message = pickDaily(tips);

  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-pill bg-surface shadow-card border border-line px-3 py-1.5"
      title="Tip for today"
    >
      <HeartIcon className="h-3.5 w-3.5 flex-shrink-0" />
      <span className="text-[11px] font-semibold text-ink">{message}</span>
    </div>
  );
}
