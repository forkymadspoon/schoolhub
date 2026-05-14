import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GradeLevel, SENProfile, Subject } from '@schoolhub/types';
import { gradeBandForLevel } from '@schoolhub/types';
import { SENProfilePicker } from './SENProfilePicker';
import { api } from '../../services/api';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ExamDate {
  label: string;
  date: string;
}

type WizardScreen = 'welcome' | 'child-info' | 'subjects' | 'study-time' | 'exam-dates' | 'sen' | 'generate';

interface WizardState {
  childName: string;
  gradeLevel: GradeLevel | '';
  subjects: Subject[];
  weeklyMinutes: number;
  examDates: ExamDate[];
  senProfile: SENProfile;
}

// ─── Grade helpers ───────────────────────────────────────────────────────────

const ALL_GRADES: GradeLevel[] = ['K2', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6'];

function subjectsForGrade(grade: GradeLevel): Subject[] {
  if (grade === 'K2') return ['English', 'Mathematics', 'Chinese'];
  if (grade === 'P1' || grade === 'P2' || grade === 'P3') return ['English', 'Mathematics', 'Chinese'];
  return ['English', 'Mathematics', 'Science', 'Chinese'];
}

function defaultSubjectsForGrade(grade: GradeLevel): Subject[] {
  if (grade === 'K2') return ['English', 'Mathematics', 'Chinese'];
  if (grade === 'P1' || grade === 'P2' || grade === 'P3') return ['English', 'Mathematics'];
  return ['English', 'Mathematics', 'Science'];
}

function defaultMinutesForGrade(grade: GradeLevel): number {
  const map: Record<GradeLevel, number> = {
    K2: 30, P1: 45, P2: 60, P3: 75, P4: 90, P5: 120, P6: 150,
  };
  return map[grade];
}

function sliderConfig(grade: GradeLevel): { min: number; max: number; step: number } {
  if (grade === 'K2') return { min: 15, max: 90, step: 5 };
  if (grade === 'P1') return { min: 30, max: 200, step: 15 };
  if (grade === 'P2') return { min: 30, max: 240, step: 15 };
  if (grade === 'P3') return { min: 45, max: 300, step: 15 };
  if (grade === 'P4') return { min: 60, max: 360, step: 15 };
  if (grade === 'P5') return { min: 60, max: 480, step: 15 };
  return { min: 90, max: 600, step: 15 };
}

function formatStudyTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min/week`;
  const hrs = minutes / 60;
  return `${Number.isInteger(hrs) ? hrs : hrs.toFixed(1)} hrs/week`;
}

function gradeTip(grade: GradeLevel): string {
  if (grade === 'K2') return 'Recommended: 15–30 min/week of readiness activities.';
  if (grade === 'P1' || grade === 'P2') return 'Recommended: 45–60 min/week for Lower Primary.';
  if (grade === 'P3') return 'Recommended: 1–1.5 hrs/week for P3.';
  if (grade === 'P4') return 'Recommended: 1.5 hrs/week for P4.';
  if (grade === 'P5') return 'Recommended: 2 hrs/week for P5.';
  return 'PSLE year: 2.5 hrs/week recommended, with regular revision.';
}

function subjectDisplayName(s: Subject, isK2: boolean): string {
  if (!isK2) return s === 'Mathematics' ? 'Mathematics' : s;
  if (s === 'English') return 'English Foundations';
  if (s === 'Mathematics') return 'Maths Foundations';
  return s;
}

// ─── Screen order ────────────────────────────────────────────────────────────

const NUMBERED_SCREENS: WizardScreen[] = ['child-info', 'subjects', 'study-time', 'exam-dates', 'sen'];

function getScreenOrder(grade: GradeLevel | ''): WizardScreen[] {
  const screens: WizardScreen[] = ['welcome', 'child-info', 'subjects', 'study-time'];
  if (grade !== 'K2') screens.push('exam-dates');
  screens.push('sen', 'generate');
  return screens;
}

// ─── Sub-screens ─────────────────────────────────────────────────────────────

function ScreenWelcome({ onStart }: { onStart: () => void }) {
  return (
    <div className="text-center space-y-6 py-4">
      <div className="text-5xl">📚</div>
      <div>
        <h1 className="text-2xl font-bold text-ink">Welcome to SchoolHub</h1>
        <p className="text-sm text-muted mt-2 leading-relaxed">
          Let's build your child's personalised, MOE-aligned study plan.<br />
          Takes less than 3 minutes.
        </p>
      </div>
      <div className="flex justify-center gap-4 text-xs text-muted flex-wrap">
        {['MOE-aligned', 'Grade-adaptive', 'SEN-aware'].map(tag => (
          <span key={tag} className="flex items-center gap-1">
            <span className="text-primary font-bold">✓</span> {tag}
          </span>
        ))}
      </div>
      <button
        type="button"
        onClick={onStart}
        className="btn-primary w-full py-3 text-sm font-semibold"
      >
        Let's start →
      </button>
    </div>
  );
}

function ScreenChildInfo({
  state,
  onGradeChange,
  set,
}: {
  state: WizardState;
  onGradeChange: (g: GradeLevel) => void;
  set: (p: Partial<WizardState>) => void;
}) {
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-ink">About your child</h1>
      <div>
        <label className="block text-sm font-medium text-ink mb-1">Child's name</label>
        <input
          type="text"
          value={state.childName}
          onChange={e => set({ childName: e.target.value })}
          placeholder="e.g. Aiden"
          maxLength={50}
          autoFocus
          className="w-full rounded-card border border-line px-4 py-3 text-ink placeholder:text-muted focus:outline-none focus:border-primary"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink mb-2">Current grade</label>
        <div className="grid grid-cols-4 gap-2">
          {ALL_GRADES.map(g => (
            <button
              key={g}
              type="button"
              onClick={() => onGradeChange(g)}
              className={[
                'rounded-card border-2 py-2.5 text-sm font-semibold transition-colors',
                state.gradeLevel === g
                  ? 'border-primary bg-primary text-white'
                  : 'border-line bg-surface text-ink hover:border-primary/40',
              ].join(' ')}
            >
              {g}
            </button>
          ))}
        </div>
        {state.gradeLevel === 'K2' && (
          <p className="text-xs text-primary mt-2 bg-primary-soft rounded-lg px-3 py-2">
            We'll use our P1 Readiness tracks — no syllabus upload needed.
          </p>
        )}
        {state.gradeLevel === 'P6' && (
          <p className="text-xs text-primary mt-2 bg-primary-soft rounded-lg px-3 py-2">
            PSLE year — we'll prioritise revision and build buffer weeks before each exam.
          </p>
        )}
      </div>
    </div>
  );
}

function ScreenSubjects({
  state,
  set,
}: {
  state: WizardState;
  set: (p: Partial<WizardState>) => void;
}) {
  const available = state.gradeLevel ? subjectsForGrade(state.gradeLevel as GradeLevel) : [];
  const isK2 = state.gradeLevel === 'K2';

  function toggle(s: Subject) {
    set({
      subjects: state.subjects.includes(s)
        ? state.subjects.filter(x => x !== s)
        : [...state.subjects, s],
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-ink">
          {isK2 ? 'Readiness tracks' : 'Which subjects?'}
        </h1>
        <p className="text-sm text-muted mt-1">
          {isK2
            ? `Select the tracks for ${state.childName || 'your child'}'s readiness plan.`
            : `Select subjects for ${state.childName || 'your child'}'s study plan.`}
        </p>
      </div>
      <div className="space-y-2">
        {available.map(s => {
          const checked = state.subjects.includes(s);
          return (
            <button
              key={s}
              type="button"
              onClick={() => toggle(s)}
              className={[
                'w-full text-left rounded-card border-2 px-4 py-3 flex items-center gap-3 transition-colors',
                checked ? 'border-primary bg-primary/5' : 'border-line bg-surface hover:border-primary/40',
              ].join(' ')}
            >
              <span className={[
                'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0',
                checked ? 'border-primary bg-primary' : 'border-muted',
              ].join(' ')}>
                {checked && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className="font-medium text-ink text-sm">
                {subjectDisplayName(s, isK2)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ScreenStudyTime({
  state,
  set,
}: {
  state: WizardState;
  set: (p: Partial<WizardState>) => void;
}) {
  const grade = state.gradeLevel as GradeLevel;
  const { min, max, step } = sliderConfig(grade);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-ink">Study time</h1>
        <p className="text-sm text-muted mt-1">
          How much time should {state.childName || 'your child'} study each week?
        </p>
      </div>
      <div className="text-center py-2">
        <span className="text-5xl font-bold text-primary">{formatStudyTime(state.weeklyMinutes)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={state.weeklyMinutes}
        onChange={e => set({ weeklyMinutes: parseInt(e.target.value, 10) })}
        className="w-full accent-primary"
      />
      <div className="flex justify-between text-xs text-muted">
        <span>{formatStudyTime(min)}</span>
        <span>{formatStudyTime(max)}</span>
      </div>
      <p className="text-xs text-muted text-center bg-primary-soft rounded-lg px-3 py-2">
        {gradeTip(grade)}
      </p>
    </div>
  );
}

function ScreenExamDates({
  state,
  set,
}: {
  state: WizardState;
  set: (p: Partial<WizardState>) => void;
}) {
  const isP6 = state.gradeLevel === 'P6';

  function addDate() {
    const label = isP6 && state.examDates.length === 0 ? 'PSLE' : '';
    set({ examDates: [...state.examDates, { label, date: '' }] });
  }

  function updateDate(i: number, patch: Partial<ExamDate>) {
    set({ examDates: state.examDates.map((d, idx) => (idx === i ? { ...d, ...patch } : d)) });
  }

  function removeDate(i: number) {
    set({ examDates: state.examDates.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-ink">Upcoming exams</h1>
        <p className="text-sm text-muted mt-1">
          Add assessment dates so we can build buffer weeks. <span className="text-primary font-medium">Optional</span> — you can add these from the dashboard later.
        </p>
      </div>

      {state.examDates.length === 0 ? (
        <div className="rounded-card border-2 border-dashed border-line py-8 text-center space-y-3">
          <p className="text-sm text-muted">No exam dates added</p>
          <button type="button" onClick={addDate} className="btn-primary text-sm px-5 py-2">
            + Add exam date
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {state.examDates.map((d, i) => (
            <div key={i} className="rounded-card border border-line p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted uppercase tracking-wide">Exam {i + 1}</span>
                <button type="button" onClick={() => removeDate(i)} className="text-muted hover:text-ink text-xs">
                  Remove
                </button>
              </div>
              <input
                type="text"
                placeholder={isP6 && i === 0 ? 'PSLE' : 'Label (e.g. SA1 Maths)'}
                value={d.label}
                onChange={e => updateDate(i, { label: e.target.value })}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-primary"
              />
              <input
                type="date"
                value={d.date}
                onChange={e => updateDate(i, { date: e.target.value })}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:outline-none focus:border-primary"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addDate}
            className="w-full rounded-card border-2 border-dashed border-line py-2.5 text-sm text-muted hover:border-primary/40 hover:text-primary transition-colors"
          >
            + Add another exam
          </button>
        </div>
      )}
    </div>
  );
}

function ScreenSEN({
  state,
  set,
}: {
  state: WizardState;
  set: (p: Partial<WizardState>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-ink">Learning needs</h1>
        <p className="text-sm text-muted mt-1">
          Does {state.childName || 'your child'} have any special learning needs? This adjusts pacing and structure, not content. You can change this anytime.
        </p>
      </div>
      <SENProfilePicker value={state.senProfile} onChange={v => set({ senProfile: v })} />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-sm text-muted shrink-0">{label}</span>
      <span className="text-sm font-medium text-ink text-right">{value}</span>
    </div>
  );
}

function ScreenGenerate({
  state,
  error,
}: {
  state: WizardState;
  error: string | null;
}) {
  const isK2 = state.gradeLevel === 'K2';
  const datesAdded = state.examDates.filter(d => d.date && d.label).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-ink">Ready to generate!</h1>
        <p className="text-sm text-muted mt-1">
          Here's {state.childName}'s study plan summary:
        </p>
      </div>

      <div className="rounded-card bg-surface border border-line p-4 space-y-3">
        <SummaryRow label="Name" value={state.childName} />
        <SummaryRow label="Grade" value={state.gradeLevel || '—'} />
        <SummaryRow
          label={isK2 ? 'Readiness tracks' : 'Subjects'}
          value={state.subjects.map(s => subjectDisplayName(s, isK2)).join(', ') || '—'}
        />
        <SummaryRow label="Weekly study" value={formatStudyTime(state.weeklyMinutes)} />
        {!isK2 && (
          <SummaryRow
            label="Exam dates"
            value={datesAdded > 0 ? `${datesAdded} added` : 'None — add from dashboard'}
          />
        )}
        <SummaryRow label="SEN profile" value={state.senProfile ?? 'None'} />
      </div>

      {isK2 && (
        <div className="rounded-card bg-primary-soft border border-primary/20 px-4 py-3 text-xs text-primary-dark leading-relaxed">
          We'll use P1 Readiness tracks and set up a countdown to P1 intake.
        </div>
      )}

      {error && (
        <p className="text-sm text-game-orange bg-game-orange-tint rounded-lg px-4 py-2">{error}</p>
      )}
    </div>
  );
}

// ─── Wizard shell ────────────────────────────────────────────────────────────

export function OnboardingWizard() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<WizardScreen>('welcome');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [state, setState] = useState<WizardState>({
    childName: '',
    gradeLevel: '',
    subjects: ['English', 'Mathematics'],
    weeklyMinutes: 120,
    examDates: [],
    senProfile: null,
  });

  function set(patch: Partial<WizardState>) {
    setState(prev => ({ ...prev, ...patch }));
  }

  function handleGradeChange(grade: GradeLevel) {
    set({
      gradeLevel: grade,
      subjects: defaultSubjectsForGrade(grade),
      weeklyMinutes: defaultMinutesForGrade(grade),
    });
  }

  const screens = getScreenOrder(state.gradeLevel);
  const currentIdx = screens.indexOf(screen);
  const numberedScreens = screens.filter(s => NUMBERED_SCREENS.includes(s));
  const currentNumberedIdx = numberedScreens.indexOf(screen);
  const totalSteps = numberedScreens.length;

  function goNext() {
    const next = screens[currentIdx + 1];
    if (next) setScreen(next);
  }

  function goBack() {
    const prev = screens[currentIdx - 1];
    if (prev) setScreen(prev);
  }

  function canAdvance(): boolean {
    if (screen === 'child-info') return state.childName.trim().length > 0 && state.gradeLevel !== '';
    if (screen === 'subjects') return state.subjects.length > 0;
    return true;
  }

  async function handleFinish() {
    setSubmitting(true);
    setError(null);
    try {
      const grade = state.gradeLevel as GradeLevel;
      const { id: childId } = await api.post<{ id: string }>('/children', {
        name: state.childName,
        grade_level: grade,
        grade_band: gradeBandForLevel(grade),
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

  const showProgress = screen !== 'welcome' && screen !== 'generate';
  const progressPct = showProgress && totalSteps > 0
    ? ((currentNumberedIdx + 1) / totalSteps) * 100
    : 0;

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center px-4 py-8">
      {/* Progress bar */}
      {showProgress && (
        <div className="w-full max-w-md mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted font-medium">
              Step {currentNumberedIdx + 1} of {totalSteps}
            </span>
            <span className="text-xs text-muted">{Math.round(progressPct)}%</span>
          </div>
          <div className="h-1.5 rounded-pill bg-line overflow-hidden">
            <div
              className="h-full rounded-pill bg-primary transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Card */}
      <div className="w-full max-w-md rounded-card bg-surface shadow-card p-6 space-y-5">
        {screen === 'welcome' && <ScreenWelcome onStart={goNext} />}
        {screen === 'child-info' && (
          <ScreenChildInfo state={state} onGradeChange={handleGradeChange} set={set} />
        )}
        {screen === 'subjects' && <ScreenSubjects state={state} set={set} />}
        {screen === 'study-time' && <ScreenStudyTime state={state} set={set} />}
        {screen === 'exam-dates' && <ScreenExamDates state={state} set={set} />}
        {screen === 'sen' && <ScreenSEN state={state} set={set} />}
        {screen === 'generate' && <ScreenGenerate state={state} error={error} />}

        {/* Navigation — hidden on welcome */}
        {screen !== 'welcome' && (
          <div className="flex gap-3 pt-2">
            {screen !== 'child-info' && (
              <button
                type="button"
                onClick={goBack}
                disabled={submitting}
                className="flex-1 rounded-card border-2 border-line py-3 text-sm font-semibold text-ink hover:border-primary/40 transition-colors disabled:opacity-50"
              >
                Back
              </button>
            )}
            {screen !== 'generate' ? (
              <button
                type="button"
                onClick={goNext}
                disabled={!canAdvance()}
                className="flex-1 btn-primary py-3 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleFinish()}
                disabled={submitting}
                className="flex-1 btn-primary py-3 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? 'Generating plan…' : `Generate ${state.childName}'s plan`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
