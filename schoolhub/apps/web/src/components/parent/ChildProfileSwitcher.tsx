import { useState, useEffect } from 'react';
import type { Child } from '@schoolhub/types';
import { api } from '../../services/api';

interface Props {
  activeChildId: string | null;
  onSwitch: (childId: string) => void;
}

export function ChildProfileSwitcher({ activeChildId, onSwitch }: Props) {
  const [children, setChildren] = useState<Child[]>([]);

  useEffect(() => {
    void api.get<Child[]>('/children').then(setChildren).catch(() => null);
  }, []);

  if (children.length <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      {children.map(child => (
        <button
          key={child.id}
          type="button"
          onClick={() => onSwitch(child.id)}
          className={[
            'rounded-pill px-3 py-1 text-sm font-medium transition-colors',
            activeChildId === child.id
              ? 'bg-primary text-white'
              : 'bg-surface border border-line text-ink hover:border-primary/40',
          ].join(' ')}
        >
          {child.name}
        </button>
      ))}
    </div>
  );
}
