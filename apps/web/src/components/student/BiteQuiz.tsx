import { useState } from 'react';
import type { QuizItem } from '@schoolhub/types';

interface Props {
  quiz: QuizItem[];
  onComplete: (answers: number[]) => void;
}

export function BiteQuiz({ quiz, onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [accumulated, setAccumulated] = useState<number[]>([]);

  const current = quiz[index];
  if (!current) return null;

  const handleSelect = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
  };

  const handleNext = () => {
    const nextAcc = [...accumulated, selected ?? 0];
    if (index + 1 >= quiz.length) {
      onComplete(nextAcc);
    } else {
      setAccumulated(nextAcc);
      setIndex(index + 1);
      setSelected(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-muted font-medium">
        Question {index + 1} of {quiz.length}
      </p>

      <p className="text-ink font-semibold text-sm leading-relaxed">{current.question}</p>

      <div className="flex flex-col gap-2">
        {current.options.map((option, i) => {
          const label = String.fromCharCode(65 + i);
          let cls = 'rounded-2xl border p-3 text-sm text-left w-full transition-colors flex items-start gap-2 ';

          if (selected === null) {
            cls += 'border-line hover:border-primary/50 cursor-pointer bg-surface';
          } else if (i === current.correct_index) {
            cls += 'border-game-green bg-game-green-tint text-ink font-medium';
          } else if (i === selected && i !== current.correct_index) {
            cls += 'border-game-orange bg-game-orange-tint text-ink';
          } else {
            cls += 'border-line bg-surface opacity-50';
          }

          return (
            <button
              key={i}
              type="button"
              className={cls}
              onClick={() => handleSelect(i)}
              aria-label={`Option ${label}: ${option}`}
              aria-pressed={selected === i}
              aria-disabled={selected !== null && selected !== i}
            >
              <span className="font-bold text-muted shrink-0" aria-hidden="true">{label}.</span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <>
          <div className="rounded-2xl bg-surface border border-line p-3">
            <p className="text-muted text-xs leading-relaxed">{current.explanation}</p>
          </div>
          <button type="button" className="btn-primary self-end px-6 py-2 text-sm" onClick={handleNext}>
            {index + 1 >= quiz.length ? 'Finish quiz' : 'Next →'}
          </button>
        </>
      )}
    </div>
  );
}
