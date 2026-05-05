import { useState, useEffect } from 'react';
import type { ExamCountdownItem } from '@schoolhub/types';
import { api } from '../../services/api';
import { cn } from '../../lib/utils';

interface Props {
  childId: string;
  /** Student (not parent) can hide the widget */
  canHide?: boolean;
}

export function ExamCountdownWidget({ childId, canHide = false }: Props) {
  const [items, setItems] = useState<ExamCountdownItem[]>([]);
  const [hidden, setHidden] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    void api
      .get<{ items: ExamCountdownItem[] }>(`/children/${childId}/countdown`)
      .then((d) => setItems(d.items));
  }, [childId]);

  if (hidden || items.length === 0) return null;

  const current = items[index % items.length];
  if (!current) return null;

  const dotClass =
    current.colour === 'green'
      ? 'status-dot-green'
      : current.colour === 'yellow'
        ? 'status-dot-yellow'
        : 'status-dot-red';

  return (
    <div className="flex items-center gap-2">
      <button
        className="countdown-chip"
        aria-label={`${current.label} countdown: ${current.days_remaining} days`}
        onClick={() => items.length > 1 && setIndex((i) => i + 1)}
      >
        <span className={cn('status-dot', dotClass)} aria-hidden="true" />
        <span>
          {current.label} · {current.days_remaining} days
        </span>
      </button>

      {canHide && (
        <button
          className="text-muted text-xs underline"
          onClick={() => setHidden(true)}
          aria-label="Hide countdown"
        >
          hide
        </button>
      )}
    </div>
  );
}
