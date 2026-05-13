import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GradeLevel, SENProfile, Subject } from '@schoolhub/types';
import { SENProfilePicker } from './SENProfilePicker';
import { api } from '../../services/api';

// ─── Types ─────────────────────────────────────────────────────────────────

interface ExamDate {
  label: string;
  date: string;   // YYYY-MM-DD
  subject: Subject | '';
}

interface WizardState {
  // Step 1
  childName: string;
  gradeLevel: GradeLevel | '';
  // Step 2
  subjects: Subject[];
  // Step 3
  examDates: ExamDate[];
  // Step 4 — handled in DataUpload; wizard just records skip/done
  calendarSkipped: boolean;
  // Step 5
  weeklyMinutes: number;
  // Step 6
  senProfile: SENProfile;
}

const GRADE_OPTIONS: Exclude<GradeLevel, 'K2' | 'P1' | 'P2' | 'P3'>[] = ['P4', 'P5', 'P6'];
const ALL_SUBJECTS: Subject[] = ['English', 'Mathematics', 'Science'];
const STEPS = 6;

// ─── Sub-step components ───────────────────────────────────────────────────

function StepNameGrade({
  state,
  set,
}: {
  state: WizardState;
  set: (p: Partial<WizardState>) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-ink mb-1">Child's name</label>
        <input
          type="text"
          value={state.childName}
          onChange={e => set({ childName: e.target.value })}
          placeholder="e.g. Aiden"
          maxLength={50}
          className="w-full rounded-card border border-line px-4 py-3 text-ink placeholder:text-muted focus:outline-none focus:border-primary"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink mb-2">Current grade</label>
        <div className="flex gap-3">
          {GRADE_OPTIONS.map(g => (
            <button
              key={g}
              type="button"
              onClick={() => set({ gradeLevel: g })}
              className={[
                'flex-1 rounded-card border-2 py-3 text-sm font-semibold transition-colors',
                state.gradeLevel === g
                  ? 'border-primary bg-primary text-white'
                  : 'border-line bg-surface text-ink hover:border-primary/40',
              ].join(' ')}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepSubjects({
  state,
  set,
}: {
  state: WizardState;
  set: (p: Partial<WizardState>) => void;
}) {
  function toggle(s: Subject) {
    const next = state.subjects.includes(s)
      ? state.subjects.filter(x => x !== s)
      : [...state.subjects, s];
    set({ subjects: next });
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">Select subjects to include in the study plan.</p>
      {ALL_SUBJECTS.map(s => (
        <button
          key={s}
          type="button"
          onClick={() => toggle(s)}
          className={[
            'w-full text-left rounded-card border-2 px-4 py-3 flex items-center gap-3 transition-colors',
            state.subjects.includes(s)
              ? 'border-primary bg-primary/5'
              : 'border-line bg-surface hover:border-primary/40',
          ].join(' ')}
        >
          <span
            className={[
              'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0',
              state.subjects.includes(s) ? 'border-primary bg-primary' : 'border-muted',
            ].join(' ')}
          >
            {state.subjects.includes(s) && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <span className="font-medium text-ink text-sm">{s}</span>
        </button>
      ))}
    </div>
  );
}

function StepExamDates({
  state,
  set,
}: {
  state: WizardState;
  set: (p: Partial<WizardState>) => void;
}) {
  function addDate() {
    set({ examDates: [...state.examDates, { label: '', date: '', subject: '' }] });
  }

  function updateDate(i: number, patch: Partial<ExamDate>) {
    const next = state.examDates.map((d, idx) => (idx === i ? { ...d, ...patch } : d));
    set({ examDates: next });
  }

  function removeDate(i: number) {
    set({ examDates: state.examDates.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">Add upcoming exams or assessments. You can add more later.</p>

      {state.examDates.map((d, i) => (
        <div key={i} className="rounded-card border border-line p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted uppercase tracking-wide">Exam {i + 1}</span>
            <button
              type="button"
              onClick={() => removeDate(i)}
              className="text-muted hover:text-ink text-xs"
            >
              Remove
            </button>
          </div>
          <input
            type="text"
            placeholder="Label (e.g. SA1 Mathematics)"
            value={d.label}
            onChange={e => updateDate(i, { label: e.target.value })}
            className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-primary"
          />
          <div className="flex gap-2">
            <select
              value={d.subject}
              onChange={e => updateDate(i, { subject: e.target.value as Subject | '' })}
              className="flex-1 rounded-lg border border-line px-3 py-2 text-sm text-ink bg-surface focus:outline-none focus:border-primary"
            >
              <option value="">All subjects</option>
              {state.subjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <input
              type="date"
              value={d.date}
              onChange={e => updateDate(i, { date: e.target.value })}
              className="flex-1 rounded-lg border border-line px-3 py-2 text-sm text-ink focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addDate}
        className="w-full rounded-card border-2 border-dashed border-line py-3 text-sm text-muted hover:border-primary/40 hover:text-primary transition-colors"
      >
        + Add exam date
      </button>
    </div>
  );
}

function StepCalendar({
  state: _state,
  set,
}: {
  state: WizardState;
  set: (p: Partial<WizardState>) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Upload your school calendar to automatically mark holidays and school events as study-free days.
      </p>
      <div className="rounded-card border-2 border-dashed border-line p-6 text-center space-y-2">
        <div className="text-2xl">📅</div>
        <p className="text-sm font-medium text-ink">Upload calendar file (.ics or .pdf)</p>
        <p className="text-xs text-muted">You can also upload this later from the dashboard.</p>
        <label className="inline-block mt-2">
          <span className="btn-primary text-sm px-4 py-2 cursor-pointer">Choose file</span>
          <input
            type="file"
            accept=".ics,.pdf"
            className="hidden"
            onChange={() => set({ calendarSkipped: false })}
          />
        </label>
      </div>
      <button
        type="button"
        onClick={() => set({ calendarSkipped: true })}
        className="w-full text-sm text-muted underline underline-offset-2 hover:text-ink"
      >
        Skip for now
      </button>
    </div>
  );
}

function StepStudyHours({
  state,
  set,
}: {
  state: WizardState;
  set: (p: Partial<WizardState>) => void;
}) {
  const hours = Math.round(state.weeklyMinutes / 60);

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">
        How many hours per week should {state.childName || 'your child'} study? We'll spread it across selected subjects.
      </p>
      <div className="text-center">
        <span className="text-5xl font-bold text-primary">{hours}</span>
        <span className="text-xl text-muted ml-1">hrs/week</span>
      </div>
      <input
        type="range"
        min={60}
        max={600}
        step={30}
        value={state.weeklyMinutes}
        onChange={e => set({ weeklyMinutes: parseInt(e.target.value, 10) })}
        className="w-full accent-primary"
      />
      <div className="flex justify-between text-xs text-muted">
        <span>1 hr</span>
        <span>5 hrs</span>
        <span>10 hrs</span>
      </div>
      <p className="text-xs text-muted text-center">
        Recommended for {state.gradeLevel}: 1–3 hours on school days.
      </p>
    </div>
  );
}

function StepPreview({
  state,
  set,
}: {
  state: WizardState;
  set: (p: Partial<WizardState>) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-card bg-surface shadow-card p-5 space-y-3">
        <Row label="Name" value={state.childName} />
        <Row label="Grade" value={state.gradeLevel || '—'} />
        <Row label="Subjects" value={state.subjects.join(', ') || '—'} />
        <Row label="Exam dates" value={`${state.examDates.filter(d => d.date).length} added`} />
        <Row label="Weekly study" value={`${Math.round(state.weeklyMinutes / 60)} hrs/week`} />
        <Row label="SEN profile" value={state.senProfile ?? 'None'} />
      </div>
      <div>
        <p className="text-sm font-medium text-ink mb-2">SEN profile (optional)</p>
        <SENProfilePicker value={state.senProfile} onChange={v => set({ senProfile: v })} />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline gap-4">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-medium text-ink text-right">{value}</span>
    </div>
  );
}

// ─── Wizard shell ──────────────────────────────────────────────────────────

const STEP_TITLES = [
  "Let's set up your child's profile",
  'Which subjects?',
  'Any upcoming exams?',
  'School calendar',
  'Weekly study budget',
  'Confirm & generate plan',
];

function canAdvance(step: number, s: WizardState): boolean {
  if (step === 1) return s.childName.trim().length > 0 && s.gradeLevel !== '';
  if (step === 2) return s.subjects.length > 0;
  if (step === 3) return true; // exam dates optional
  if (step === 4) return true; // calendar optional
  if (step === 5) return s.weeklyMinutes > 0;
  return true;
}

export function OnboardingWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [state, setState] = useState<WizardState>({
    childName: '',
    gradeLevel: '',
    subjects: ['English', 'Mathematics', 'Science'],
    examDates: [],
    calendarSkipped: false,
    weeklyMinutes: 120,
    senProfile: null,
  });

  function set(patch: Partial<WizardState>) {
    setState(prev => ({ ...prev, ...patch }));
  }

  async function handleFinish() {
    setSubmitting(true);
    setError(null);
    try {
      const { id: childId } = await api.post<{ id: string }>('/children', {
        name: state.childName,
        grade_level: state.gradeLevel,
        sen_profile: state.senProfile,
      });

      await api.post('/schedules/generate', {
        child_id: childId,
        subjects: state.subjects,
        exam_dates: state.examDates.filter(d => d.date && d.label),
        weekly_minutes: state.weeklyMinutes,
        trigger_reason: 'initial',
      });

      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  const progress = ((step - 1) / (STEPS - 1)) * 100;

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center px-4 py-8">
      {/* Header */}
      <div className="w-full max-w-md mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted font-medium">Step {step} of {STEPS}</span>
          <span className="text-xs text-muted">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 rounded-pill bg-line overflow-hidden">
          <div
            className="h-full rounded-pill bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-md rounded-card bg-surface shadow-card p-6 space-y-5">
        <h1 className="text-xl font-bold text-ink">{STEP_TITLES[step - 1]}</h1>

        {step === 1 && <StepNameGrade state={state} set={set} />}
        {step === 2 && <StepSubjects state={state} set={set} />}
        {step === 3 && <StepExamDates state={state} set={set} />}
        {step === 4 && <StepCalendar state={state} set={set} />}
        {step === 5 && <StepStudyHours state={state} set={set} />}
        {step === 6 && <StepPreview state={state} set={set} />}

        {error && (
          <p className="text-sm text-game-orange bg-game-orange-tint rounded-lg px-4 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              disabled={submitting}
              className="flex-1 rounded-card border-2 border-line py-3 text-sm font-semibold text-ink hover:border-primary/40 transition-colors disabled:opacity-50"
            >
              Back
            </button>
          )}
          {step < STEPS ? (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              disabled={!canAdvance(step, state)}
              className="flex-1 btn-primary py-3 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void handleFinish()}
              disabled={submitting || !canAdvance(STEPS, state)}
              className="flex-1 btn-primary py-3 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? 'Generating plan…' : 'Generate study plan'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
