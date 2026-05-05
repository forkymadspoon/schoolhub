import type { SENProfile } from '@schoolhub/types';

interface Props {
  value: SENProfile;
  onChange: (v: SENProfile) => void;
}

const OPTIONS: Array<{ value: SENProfile; label: string; description: string }> = [
  { value: null, label: 'No SEN profile', description: 'Standard pacing and layout' },
  {
    value: 'ADHD',
    label: 'ADHD',
    description: 'Bites ≤ 5 min · Focus mode · Micro-breaks · Positive reinforcement',
  },
  {
    value: 'Autism_Spectrum',
    label: 'Autism Spectrum',
    description: '48-hour notice before schedule changes · Predictable routines · Reduced distractions',
  },
  {
    value: 'Other_SEN',
    label: 'Other SEN',
    description: 'Scaffolded hints · Adaptive difficulty · Extended response time',
  },
];

export function SENProfilePicker({ value, onChange }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        Optional. This adjusts pacing and structure — not content. You can change it later.
      </p>
      <div className="grid gap-2">
        {OPTIONS.map(opt => (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className={[
              'w-full text-left rounded-card border-2 px-4 py-3 transition-colors',
              value === opt.value
                ? 'border-primary bg-primary/5'
                : 'border-line bg-surface hover:border-primary/40',
            ].join(' ')}
          >
            <span className="block font-semibold text-ink text-sm">{opt.label}</span>
            <span className="block text-xs text-muted mt-0.5">{opt.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
