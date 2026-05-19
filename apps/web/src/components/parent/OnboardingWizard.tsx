import { useState, useEffect, useRef } from 'react';
import Lottie from 'lottie-react';
import coffeeBreakAnimation from '../../assets/animations/coffee-break.json';
import { useNavigate, useLocation } from 'react-router-dom';
import type { GradeLevel, SENProfile, Subject } from '@schoolhub/types';
import { gradeBandForLevel } from '@schoolhub/types';
import { api } from '../../services/api';

// ─── Constants ───────────────────────────────────────────────────────────────

const AVATARS = ['⚡', '👾', '🧱', '🤖', '🐉', '👻', '🍄', '⭐', '🦖', '🔮', '🌸', '🎮'];
const ALL_GRADES: GradeLevel[] = ['K2', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6'];

const SG_PRIMARY_SCHOOLS = [
  'Admiralty Primary School',
  'Ahmad Ibrahim Primary School',
  'Ai Tong School',
  'Alexandra Primary School',
  'Anchor Green Primary School',
  'Anderson Primary School',
  'Ang Mo Kio Primary School',
  'Anglo-Chinese School (Junior)',
  'Anglo-Chinese School (Primary)',
  'Angsana Primary School',
  'Beacon Primary School',
  'Bedok Green Primary School',
  'Bendemeer Primary School',
  'Blangah Rise Primary School',
  'Boon Lay Garden Primary School',
  'Bukit Panjang Primary School',
  'Bukit Timah Primary School',
  'Bukit View Primary School',
  'Canberra Primary School',
  'Canossa Catholic Primary School',
  'Cantonment Primary School',
  'Casuarina Primary School',
  'Catholic High School (Primary)',
  'Cedar Primary School',
  'Changkat Primary School',
  'CHIJ (Katong) Primary',
  'CHIJ (Kellock)',
  'CHIJ Our Lady of Good Counsel',
  'CHIJ Our Lady of the Nativity',
  'CHIJ Our Lady Queen of Peace',
  'CHIJ Primary (Toa Payoh)',
  "CHIJ Saint Nicholas Girls' School (Primary)",
  'Chongfu School',
  'Chongzheng Primary School',
  'Chua Chu Kang Primary School',
  'Clementi Primary School',
  'Compassvale Primary School',
  'Concord Primary School',
  'Coral Primary School',
  'Corporation Primary School',
  'Da Qiao Primary School',
  'Damai Primary School',
  'Dazhong Primary School',
  'De La Salle School',
  'East Coast Primary School',
  'East Spring Primary School',
  'East View Primary School',
  'Edgefield Primary School',
  'Elias Park Primary School',
  'Endeavour Primary School',
  'Evergreen Primary School',
  'Fairfield Methodist School (Primary)',
  'Farrer Park Primary School',
  'Fengshan Primary School',
  'Fernvale Primary School',
  'First Toa Payoh Primary School',
  'Frontier Primary School',
  'Fuchun Primary School',
  'Fuhua Primary School',
  'Gan Eng Seng Primary School',
  'Geylang Methodist School (Primary)',
  'Gongshang Primary School',
  'Greendale Primary School',
  'Greenridge Primary School',
  'Greenwood Primary School',
  "Haig Girls' School",
  'Henry Park Primary School',
  "Holy Innocents' Primary School",
  'Hong Wen School',
  'Horizon Primary School',
  'Hougang Primary School',
  'Huamin Primary School',
  'Innova Primary School',
  'Jiemin Primary School',
  'Jing Shan Primary School',
  'Junyuan Primary School',
  'Jurong Primary School',
  'Jurong West Primary School',
  'Juying Primary School',
  'Keming Primary School',
  'Kheng Cheng School',
  'Kong Hwa School',
  'Kranji Primary School',
  'Kuo Chuan Presbyterian Primary School',
  'Lakeside Primary School',
  'Lianhua Primary School',
  'Maha Bodhi School',
  'Maris Stella High School (Primary)',
  'Marsiling Primary School',
  'Marymount Convent School',
  'Mayflower Primary School',
  'Mee Toh School',
  'Meridian Primary School',
  "Methodist Girls' School (Primary)",
  'Montfort Junior School',
  'Nan Chiau Primary School',
  'Nan Hua Primary School',
  'Nanyang Primary School',
  'Naval Base Primary School',
  'New Town Primary School',
  'Ngee Ann Primary School',
  'North Spring Primary School',
  'North View Primary School',
  'North Vista Primary School',
  'Northland Primary School',
  'Northoaks Primary School',
  'Northshore Primary School',
  'Oasis Primary School',
  'Opera Estate Primary School',
  'Palm View Primary School',
  'Park View Primary School',
  'Pasir Ris Primary School',
  'Paya Lebar Methodist Girls\' School (Primary)',
  'Pei Chun Public School',
  'Pei Hwa Presbyterian Primary School',
  'Pei Tong Primary School',
  'Peiying Primary School',
  'Pioneer Primary School',
  'Poi Ching School',
  'Princess Elizabeth Primary School',
  'Punggol Cove Primary School',
  'Punggol Green Primary School',
  'Punggol Primary School',
  'Punggol View Primary School',
  'Qifa Primary School',
  'Qihua Primary School',
  'Queenstown Primary School',
  'Radin Mas Primary School',
  "Raffles Girls' Primary School",
  'Red Swastika School',
  'River Valley Primary School',
  'Riverside Primary School',
  'Rivervale Primary School',
  'Rosyth School',
  'Rulang Primary School',
  'Sembawang Primary School',
  'Seng Kang Primary School',
  'Sengkang Green Primary School',
  'Shuqun Primary School',
  'Si Ling Primary School',
  'Singapore Chinese Girls\' School (Primary)',
  'South View Primary School',
  'Springdale Primary School',
  "St. Andrew's Junior School",
  "St. Anthony's Canossian Primary School",
  "St. Anthony's Primary School",
  "St. Gabriel's Primary School",
  "St. Hilda's Primary School",
  "St. Joseph's Institution Junior",
  "St. Margaret's Primary School",
  "St. Stephen's School",
  'Tampines North Primary School',
  'Tampines Primary School',
  'Tanjong Katong Primary School',
  'Tao Nan School',
  'Teck Ghee Primary School',
  'Teck Whye Primary School',
  'Telok Kurau Primary School',
  'Temasek Primary School',
  'Townsville Primary School',
  'Unity Primary School',
  'Valour Primary School',
  'Waterway Primary School',
  'Wellington Primary School',
  'West Grove Primary School',
  'West Spring Primary School',
  'West View Primary School',
  'Westwood Primary School',
  'White Sands Primary School',
  'Woodgrove Primary School',
  'Woodlands Primary School',
  'Woodlands Ring Primary School',
  'Xinghua Primary School',
  'Xingnan Primary School',
  'Xinmin Primary School',
  'Xishan Primary School',
  'Yangzheng Primary School',
  'Yew Tee Primary School',
  'Yio Chu Kang Primary School',
  'Yishun Primary School',
  'Yu Neng Primary School',
  'Yuhua Primary School',
  'Yumin Primary School',
  'Zhangde Primary School',
  'Zhenghua Primary School',
  'Zhonghua Primary School',
];

const SEN_OPTIONS = [
  { label: 'Dyslexia', value: 'Dyslexia' },
  { label: 'ADHD / attention', value: 'ADHD' },
  { label: 'Autism spectrum', value: 'Autism_Spectrum' },
  { label: 'Speech & language', value: 'Speech' },
  { label: 'Sensory / processing', value: 'Sensory' },
  { label: 'Anxiety', value: 'Anxiety' },
  { label: 'Gifted / 2e', value: 'Gifted' },
  { label: 'Other', value: 'Other' },
];

const GOALS = [
  'Build daily reading habit',
  'Confidence in Math',
  'Better handwriting',
  'Curiosity & play',
  'Improve Science grades',
  'Strengthen Chinese',
  'Build study discipline',
  'Reduce exam stress',
];

const TUITION_OPTIONS = ['English', 'Mathematics', 'Science', 'Chinese', 'None'];
const ACTIVITY_OPTIONS = ['Sports', 'Music', 'Art', 'Coding', 'Dance', 'Religion class', 'None'];
const SLEEP_OPTIONS = [8, 9, 10, 11];

// ─── Types ───────────────────────────────────────────────────────────────────

type WizardScreen =
  | 'welcome'
  | 'child-info'
  | 'school-details'
  | 'subjects'
  | 'sen'
  | 'activities'
  | 'wellbeing'
  | 'psle-prep'
  | 'goals'
  | 'generate';

type PsleStyle = 'light' | 'balanced' | 'sprint' | '';

interface WizardState {
  childName: string;
  avatar: string;
  gradeLevel: GradeLevel | '';
  schoolName: string;
  schoolStart: string;
  schoolEnd: string;
  subjects: Subject[];
  weeklyMinutes: number;
  senTags: string[];
  senNotes: string;
  tuition: string[];
  activities: string[];
  sleepTarget: number;
  bedtime: string;
  goals: string[];
  psleStyle: PsleStyle;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function subjectsForGrade(grade: GradeLevel): Subject[] {
  if (grade === 'P4' || grade === 'P5' || grade === 'P6')
    return ['English', 'Mathematics', 'Science', 'Chinese'];
  return ['English', 'Mathematics', 'Chinese'];
}

function defaultSubjectsForGrade(grade: GradeLevel): Subject[] {
  if (grade === 'K2') return ['English', 'Mathematics', 'Chinese'];
  if (grade === 'P4' || grade === 'P5' || grade === 'P6')
    return ['English', 'Mathematics', 'Science'];
  return ['English', 'Mathematics'];
}

function defaultMinutesForGrade(grade: GradeLevel): number {
  return { K2: 30, P1: 45, P2: 60, P3: 75, P4: 90, P5: 120, P6: 150 }[grade];
}

function subjectLabel(s: Subject, isK2: boolean): string {
  if (!isK2) return s;
  if (s === 'English') return 'English Foundations';
  if (s === 'Mathematics') return 'Maths Foundations';
  return s;
}

function deriveSENProfile(tags: string[]): SENProfile {
  if (tags.includes('ADHD')) return 'ADHD';
  if (tags.includes('Autism_Spectrum')) return 'Autism_Spectrum';
  if (tags.some(t => ['Dyslexia', 'Speech', 'Sensory', 'Anxiety', 'Gifted', 'Other'].includes(t)))
    return 'Other_SEN';
  return null;
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min/wk`;
  const hrs = minutes / 60;
  return `${Number.isInteger(hrs) ? hrs : hrs.toFixed(1)} hrs/wk`;
}

const SCREEN_ORDER: WizardScreen[] = [
  'welcome', 'child-info', 'school-details', 'subjects',
  'sen', 'activities', 'wellbeing', 'psle-prep', 'goals', 'generate',
];

const NUMBERED_SCREENS: WizardScreen[] = [
  'child-info', 'school-details', 'subjects', 'sen', 'activities', 'wellbeing', 'psle-prep', 'goals',
];

const TIME_ESTIMATES: Record<WizardScreen, string> = {
  welcome: '~5 min left',
  'child-info': '~4 min left',
  'school-details': '~3 min left',
  subjects: '~2.5 min left',
  sen: '~2 min left',
  activities: '~1.5 min left',
  wellbeing: '~1 min left',
  'psle-prep': '~45 sec left',
  goals: '~30 sec left',
  generate: 'Almost done!',
};

const PSLE_PREP_OPTIONS: { value: PsleStyle; label: string; desc: string }[] = [
  { value: 'light',    label: 'Light & balanced', desc: 'Steady habits, plenty of rest.' },
  { value: 'balanced', label: 'Balanced focus',   desc: 'Daily bites + weekly mock practice.' },
  { value: 'sprint',   label: 'Full sprint',       desc: 'Higher volume, more drills.' },
];

const P6_GOALS = [
  'Achieve PSLE target',
  'Improve weakest subject',
  'Reduce exam stress',
  'Maintain wellbeing',
  'Strengthen Chinese',
  'Build study discipline',
];

const K2_GOALS = [
  'Build daily reading habit',
  'Curiosity & play',
  'Better handwriting',
  'Strengthen Chinese',
  'Build morning routine',
  'P1 readiness confidence',
];

// ─── Pill chip component ─────────────────────────────────────────────────────

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-full border-2 px-4 py-2 text-sm font-medium transition-colors',
        selected
          ? 'border-primary bg-primary-soft text-primary'
          : 'border-line bg-surface text-ink hover:border-primary/40',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

// ─── Screen: Welcome ─────────────────────────────────────────────────────────

function ScreenWelcome({ onStart, onDismiss }: { onStart: () => void; onDismiss: () => void }) {
  return (
    <div className="space-y-6 py-2">
      <div className="flex justify-end -mt-1 -mr-1">
        <button
          type="button"
          onClick={onDismiss}
          className="w-7 h-7 flex items-center justify-center rounded-full text-muted hover:text-ink hover:bg-line transition-colors text-lg leading-none"
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <div className="text-center">
        <div className="text-5xl mb-4">☕</div>
        <h1 className="text-3xl font-black text-ink leading-tight">
          Welcome to SchoolHub
        </h1>
        <p className="text-sm text-muted mt-2 leading-relaxed">
          Quick as your morning brew — let's build a study plan your child will actually love.
        </p>
      </div>
      <ul className="space-y-2.5">
        {[
          'MOE-aligned curriculum for every grade',
          'Adapts to your child\'s pace and needs',
          'SEN-aware pacing and structure',
          'Takes less than 5 minutes to set up',
        ].map(item => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-ink">
            <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            {item}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onStart}
        className="btn-primary w-full py-3.5 text-sm font-semibold"
      >
        Let's start →
      </button>
    </div>
  );
}

// ─── Screen: Child info ───────────────────────────────────────────────────────

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
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-ink">Tell us about your child</h2>
        <p className="text-xs text-muted mt-0.5">We'll personalise everything around them.</p>
      </div>

      {/* Name */}
      <div>
        <label className="block text-xs font-semibold text-ink mb-1">Child's name</label>
        <input
          type="text"
          value={state.childName}
          onChange={e => set({ childName: e.target.value })}
          placeholder="e.g. Ava"
          maxLength={50}
          autoFocus
          className="w-full rounded-xl border-2 border-line px-3 py-2 text-ink placeholder:text-muted focus:outline-none focus:border-primary text-sm"
        />
      </div>

      {/* Avatar */}
      <div>
        <label className="block text-xs font-semibold text-ink mb-1.5">Pick an avatar</label>
        <div className="grid grid-cols-6 gap-1.5">
          {AVATARS.map(emoji => (
            <button
              key={emoji}
              type="button"
              onClick={() => set({ avatar: emoji })}
              className={[
                'rounded-xl border-2 py-1.5 text-xl transition-colors',
                state.avatar === emoji
                  ? 'border-primary bg-primary-soft'
                  : 'border-line bg-surface hover:border-primary/40',
              ].join(' ')}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Grade */}
      <div>
        <label className="block text-xs font-semibold text-ink mb-1.5">Current grade</label>
        <div className="grid grid-cols-4 gap-1.5">
          {ALL_GRADES.map(g => (
            <button
              key={g}
              type="button"
              onClick={() => onGradeChange(g)}
              className={[
                'rounded-xl border-2 py-1.5 text-sm font-semibold transition-colors',
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
            We'll use P1 Readiness tracks — no syllabus upload needed!
          </p>
        )}
        {state.gradeLevel === 'P6' && (
          <p className="text-xs text-primary mt-2 bg-primary-soft rounded-lg px-3 py-2">
            PSLE year — we'll build in buffer weeks before every exam.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Screen: School details ───────────────────────────────────────────────────

function SchoolCombobox({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim().length === 0
    ? SG_PRIMARY_SCHOOLS.slice(0, 8)
    : SG_PRIMARY_SCHOOLS.filter(s => s.toLowerCase().includes(query.toLowerCase())).slice(0, 8);

  function select(school: string) {
    onChange(school);
    setQuery(school);
    setOpen(false);
  }

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Type to search schools…"
        maxLength={100}
        autoComplete="off"
        className="w-full rounded-xl border-2 border-line px-4 py-3 text-ink placeholder:text-muted focus:outline-none focus:border-primary text-sm"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-line rounded-xl shadow-card overflow-hidden max-h-52 overflow-y-auto">
          {filtered.map(school => (
            <li key={school}>
              <button
                type="button"
                onMouseDown={e => { e.preventDefault(); select(school); }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-primary-soft transition-colors min-h-0 ${
                  school === value ? 'bg-primary-soft text-primary font-semibold' : 'text-ink'
                }`}
              >
                {school}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ScreenSchoolDetails({
  state,
  set,
}: {
  state: WizardState;
  set: (p: Partial<WizardState>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-ink">School details</h2>
        <p className="text-sm text-muted mt-1">
          <span className="text-primary font-medium">Optional</span> — helps us avoid scheduling during school hours.
        </p>
      </div>
      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">School name</label>
        <SchoolCombobox value={state.schoolName} onChange={v => set({ schoolName: v })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-ink mb-1.5">School starts</label>
          <input
            type="time"
            value={state.schoolStart}
            onChange={e => set({ schoolStart: e.target.value })}
            className="w-full rounded-xl border-2 border-line px-4 py-3 text-ink focus:outline-none focus:border-primary text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-ink mb-1.5">School ends</label>
          <input
            type="time"
            value={state.schoolEnd}
            onChange={e => set({ schoolEnd: e.target.value })}
            className="w-full rounded-xl border-2 border-line px-4 py-3 text-ink focus:outline-none focus:border-primary text-sm"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Subjects ─────────────────────────────────────────────────────────

function ScreenSubjects({
  state,
  set,
}: {
  state: WizardState;
  set: (p: Partial<WizardState>) => void;
}) {
  const grade = state.gradeLevel as GradeLevel;
  const available = subjectsForGrade(grade);
  const isK2 = grade === 'K2';

  function toggle(s: Subject) {
    set({
      subjects: state.subjects.includes(s)
        ? state.subjects.filter(x => x !== s)
        : [...state.subjects, s],
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-ink">
          {isK2 ? 'Readiness tracks' : 'Strengths & focus areas'}
        </h2>
        <p className="text-sm text-muted mt-1">
          {isK2
            ? `Select tracks for ${state.childName || 'your child'}'s readiness plan.`
            : `Which subjects does ${state.childName || 'your child'} need support in?`}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {available.map(s => (
          <Chip
            key={s}
            label={subjectLabel(s, isK2)}
            selected={state.subjects.includes(s)}
            onClick={() => toggle(s)}
          />
        ))}
      </div>
      {state.subjects.length === 0 && (
        <p className="text-xs text-game-orange">Select at least one subject to continue.</p>
      )}
    </div>
  );
}

// ─── Screen: SEN ─────────────────────────────────────────────────────────────

function ScreenSEN({
  state,
  set,
}: {
  state: WizardState;
  set: (p: Partial<WizardState>) => void;
}) {
  function toggle(value: string) {
    const next = state.senTags.includes(value)
      ? state.senTags.filter(t => t !== value)
      : [...state.senTags, value];
    set({ senTags: next });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-ink">Learning needs & support</h2>
        <p className="text-sm text-muted mt-1">
          <span className="text-primary font-medium">Optional</span> — adjusts pacing and structure, not content. Select all that apply.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {SEN_OPTIONS.map(opt => (
          <Chip
            key={opt.value}
            label={opt.label}
            selected={state.senTags.includes(opt.value)}
            onClick={() => toggle(opt.value)}
          />
        ))}
      </div>
      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">
          Anything else helpful to know?
        </label>
        <textarea
          value={state.senNotes}
          onChange={e => set({ senNotes: e.target.value })}
          placeholder="e.g. prefers visual instructions, needs extra time for transitions..."
          rows={3}
          maxLength={500}
          className="w-full rounded-xl border-2 border-line px-4 py-3 text-ink placeholder:text-muted focus:outline-none focus:border-primary text-sm resize-none"
        />
      </div>
    </div>
  );
}

// ─── Screen: Activities ───────────────────────────────────────────────────────

function ScreenActivities({
  state,
  set,
}: {
  state: WizardState;
  set: (p: Partial<WizardState>) => void;
}) {
  function toggleTuition(v: string) {
    if (v === 'None') { set({ tuition: ['None'] }); return; }
    const next = state.tuition.includes(v)
      ? state.tuition.filter(t => t !== v)
      : [...state.tuition.filter(t => t !== 'None'), v];
    set({ tuition: next.length ? next : [] });
  }

  function toggleActivity(v: string) {
    if (v === 'None') { set({ activities: ['None'] }); return; }
    const next = state.activities.includes(v)
      ? state.activities.filter(t => t !== v)
      : [...state.activities.filter(t => t !== 'None'), v];
    set({ activities: next.length ? next : [] });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-ink">Tuition & activities</h2>
        <p className="text-sm text-muted mt-1">We'll factor these into the schedule to avoid overload.</p>
      </div>

      <div>
        <p className="text-sm font-semibold text-ink mb-2">Tuition subjects</p>
        <div className="flex flex-wrap gap-2">
          {TUITION_OPTIONS.map(v => (
            <Chip key={v} label={v} selected={state.tuition.includes(v)} onClick={() => toggleTuition(v)} />
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-ink mb-2">Activities & CCAs</p>
        <div className="flex flex-wrap gap-2">
          {ACTIVITY_OPTIONS.map(v => (
            <Chip key={v} label={v} selected={state.activities.includes(v)} onClick={() => toggleActivity(v)} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Wellbeing ────────────────────────────────────────────────────────

function ScreenWellbeing({
  state,
  set,
}: {
  state: WizardState;
  set: (p: Partial<WizardState>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-ink">Wellbeing baseline</h2>
        <p className="text-sm text-muted mt-1">Helps us make sure the plan keeps {state.childName || 'your child'} happy and healthy.</p>
      </div>

      <div>
        <p className="text-sm font-semibold text-ink mb-2">Sleep target (hours/night)</p>
        <div className="flex gap-2">
          {SLEEP_OPTIONS.map(h => (
            <button
              key={h}
              type="button"
              onClick={() => set({ sleepTarget: h })}
              className={[
                'flex-1 rounded-xl border-2 py-3 text-sm font-semibold transition-colors',
                state.sleepTarget === h
                  ? 'border-primary bg-primary text-white'
                  : 'border-line bg-surface text-ink hover:border-primary/40',
              ].join(' ')}
            >
              {h}h
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">Usual bedtime</label>
        <input
          type="time"
          value={state.bedtime}
          onChange={e => set({ bedtime: e.target.value })}
          className="w-full rounded-xl border-2 border-line px-4 py-3 text-ink focus:outline-none focus:border-primary text-sm"
        />
      </div>
    </div>
  );
}

// ─── Screen: PSLE prep style (P6 only) ───────────────────────────────────────

function ScreenPslePrep({
  state,
  set,
}: {
  state: WizardState;
  set: (p: Partial<WizardState>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-ink">PSLE prep style</h2>
        <p className="text-sm text-muted mt-1">How intense should we plan things for the road to PSLE?</p>
      </div>
      <div className="flex flex-col gap-3">
        {PSLE_PREP_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => set({ psleStyle: opt.value })}
            className={[
              'w-full text-left px-4 py-4 rounded-2xl border-2 transition-all',
              state.psleStyle === opt.value
                ? 'border-primary bg-primary-soft'
                : 'border-line bg-surface hover:border-primary/40',
            ].join(' ')}
          >
            <p className={`text-sm font-bold ${state.psleStyle === opt.value ? 'text-primary' : 'text-ink'}`}>
              {opt.label}
            </p>
            <p className="text-xs text-muted mt-0.5">{opt.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Screen: Goals ────────────────────────────────────────────────────────────

function ScreenGoals({
  state,
  set,
}: {
  state: WizardState;
  set: (p: Partial<WizardState>) => void;
}) {
  const isP6 = state.gradeLevel === 'P6';
  const isK2 = state.gradeLevel === 'K2';
  const goalList = isP6 ? P6_GOALS : isK2 ? K2_GOALS : GOALS;

  function toggle(g: string) {
    if (state.goals.includes(g)) {
      set({ goals: state.goals.filter(x => x !== g) });
    } else if (state.goals.length < 3) {
      set({ goals: [...state.goals, g] });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-ink">Pick your goals</h2>
        <p className="text-sm text-muted mt-1">Choose 1–3. We'll shape the plan around these.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {goalList.map(g => {
          const selected = state.goals.includes(g);
          const maxed = !selected && state.goals.length >= 3;
          return (
            <button
              key={g}
              type="button"
              onClick={() => toggle(g)}
              disabled={maxed}
              className={[
                'rounded-full border-2 px-4 py-2 text-sm font-medium transition-colors',
                selected
                  ? 'border-primary bg-primary-soft text-primary'
                  : maxed
                    ? 'border-line bg-surface text-muted cursor-not-allowed opacity-50'
                    : 'border-line bg-surface text-ink hover:border-primary/40',
              ].join(' ')}
            >
              {g}
            </button>
          );
        })}
      </div>
      {state.goals.length === 0 && (
        <p className="text-xs text-muted">Pick at least one goal to continue.</p>
      )}
    </div>
  );
}

// ─── Screen: Generate / All set ──────────────────────────────────────────────

const PLAN_STEPS = [
  'Creating your child\'s profile…',
  'Analysing subjects and goals…',
  'Mapping the school calendar…',
  'Spacing out topics for best retention…',
  'Building the weekly schedule…',
  'Almost there — finishing up…',
];

function PlanLoadingScreen({ childName }: { childName: string }) {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStepIdx(i => Math.min(i + 1, PLAN_STEPS.length - 1));
    }, 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <Lottie
        animationData={coffeeBreakAnimation}
        loop
        className="w-52 h-52"
      />
      <div>
        <h2 className="text-xl font-black text-ink">Building {childName}'s plan</h2>
        <p className="text-sm text-muted mt-1">This usually takes 15–30 seconds</p>
      </div>
      <div className="w-full bg-line rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-[3000ms] ease-out"
          style={{ width: `${((stepIdx + 1) / PLAN_STEPS.length) * 100}%` }}
        />
      </div>
      <p className="text-sm text-primary font-medium min-h-[1.5rem]">
        {PLAN_STEPS[stepIdx]}
      </p>
    </div>
  );
}

function ScreenGenerate({
  state,
  error,
  submitting,
}: {
  state: WizardState;
  error: string | null;
  submitting: boolean;
}) {
  const isK2 = state.gradeLevel === 'K2';
  const senLabel = state.senTags.length > 0
    ? state.senTags.map(t => SEN_OPTIONS.find(o => o.value === t)?.label ?? t).join(', ')
    : 'None';

  if (submitting) return <PlanLoadingScreen childName={state.childName || 'your child'} />;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-black text-ink">All set!</h2>
        <p className="text-sm text-muted mt-1">
          {state.childName}'s personalised plan is ready to generate.
        </p>
      </div>

      <div className="rounded-2xl border-2 border-line bg-surface p-5 space-y-3">
        <div className="flex items-center gap-3 pb-3 border-b border-line">
          <span className="text-2xl">{state.avatar || '⚡'}</span>
          <div>
            <p className="font-bold text-ink">{state.childName}</p>
            <p className="text-xs text-muted">{state.gradeLevel}</p>
          </div>
        </div>

        {state.schoolName && (
          <SummaryRow icon="🏫" label="School" value={state.schoolName} />
        )}
        <SummaryRow
          icon="📚"
          label={isK2 ? 'Readiness tracks' : 'Subjects'}
          value={state.subjects.map(s => subjectLabel(s, isK2)).join(', ') || '—'}
        />
        <SummaryRow
          icon="😴"
          label="Sleep target"
          value={`${state.sleepTarget}h / night`}
        />
        {state.goals.length > 0 && (
          <SummaryRow icon="🎯" label="Goals" value={state.goals.join(', ')} />
        )}
        {senLabel !== 'None' && (
          <SummaryRow icon="💙" label="Support" value={senLabel} />
        )}
      </div>

      {isK2 && (
        <div className="rounded-xl bg-primary-soft border border-primary/20 px-4 py-3 text-xs text-primary leading-relaxed">
          We'll use P1 Readiness tracks and show a countdown to P1 intake.
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}

function SummaryRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-base flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <p className="text-sm font-medium text-ink truncate">{value}</p>
      </div>
    </div>
  );
}

// ─── Wizard shell ─────────────────────────────────────────────────────────────

export function OnboardingWizard() {
  const navigate = useNavigate();
  const location = useLocation();
  const dismissTarget = (location.state as { from?: string } | null)?.from ?? '/';
  const [screen, setScreen] = useState<WizardScreen>('welcome');
  const [submitting, setSubmitting] = useState(false);
  const [pendingChildId, setPendingChildId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [state, setState] = useState<WizardState>({
    childName: '',
    avatar: AVATARS[0] ?? '⚡',
    gradeLevel: '',
    schoolName: '',
    schoolStart: '07:30',
    schoolEnd: '13:30',
    subjects: ['English', 'Mathematics'],
    weeklyMinutes: 120,
    senTags: [],
    senNotes: '',
    tuition: [],
    activities: [],
    sleepTarget: 9,
    bedtime: '21:00',
    goals: [],
    psleStyle: '',
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

  const isP6 = state.gradeLevel === 'P6';
  const isK2 = state.gradeLevel === 'K2';
  const currentIdx = SCREEN_ORDER.indexOf(screen);
  const visibleNumbered = NUMBERED_SCREENS.filter(s => {
    if (s === 'psle-prep') return isP6;
    if (s === 'school-details') return !isK2;
    return true;
  });
  const numberedIdx = visibleNumbered.indexOf(screen);
  const isNumbered = numberedIdx !== -1;
  const totalSteps = visibleNumbered.length;

  function skipScreen(s: WizardScreen): boolean {
    if (s === 'psle-prep') return !isP6;
    if (s === 'school-details') return isK2;
    return false;
  }

  function goNext() {
    let idx = currentIdx + 1;
    while (idx < SCREEN_ORDER.length && skipScreen(SCREEN_ORDER[idx]!)) idx++;
    const next = SCREEN_ORDER[idx];
    if (next) setScreen(next);
  }

  function goBack() {
    let idx = currentIdx - 1;
    while (idx >= 0 && skipScreen(SCREEN_ORDER[idx]!)) idx--;
    const prev = SCREEN_ORDER[idx];
    if (prev) setScreen(prev);
  }

  function canAdvance(): boolean {
    if (screen === 'child-info') return state.childName.trim().length > 0 && state.gradeLevel !== '';
    if (screen === 'subjects') return state.subjects.length > 0;
    if (screen === 'psle-prep') return state.psleStyle !== '';
    if (screen === 'goals') return state.goals.length > 0;
    return true;
  }

  async function handleFinish() {
    setSubmitting(true);
    setError(null);
    const startedAt = Date.now();
    try {
      const grade = state.gradeLevel as GradeLevel;
      const { id: childId } = await api.post<{ id: string }>('/children', {
        name: state.childName,
        grade_level: grade,
        grade_band: gradeBandForLevel(grade),
        sen_profile: deriveSENProfile(state.senTags),
      });
      setPendingChildId(childId);

      await api.post('/schedules/generate', {
        child_id: childId,
        subjects: state.subjects,
        exam_dates: [],
        weekly_minutes: state.weeklyMinutes,
        trigger_reason: 'initial',
      });

      const remaining = 5000 - (Date.now() - startedAt);
      if (remaining > 0) await new Promise(res => setTimeout(res, remaining));

      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center px-4 py-6">
      {/* Top bar */}
      {screen !== 'welcome' && (
        <div className="w-full max-w-md mb-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              {isNumbered && (
                <span className="text-xs font-semibold text-ink">
                  Step {numberedIdx + 1} of {totalSteps}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted">{TIME_ESTIMATES[screen]}</span>
              <button
                type="button"
                onClick={() => navigate(dismissTarget, { state: { skipOnboardingRedirect: true, ...(submitting && pendingChildId ? { planGenerating: true } : {}) } })}
                className="text-xs text-muted hover:text-ink underline transition-colors"
              >
                Save & exit
              </button>
            </div>
          </div>
          {isNumbered && (
            <div className="h-1.5 rounded-full bg-line overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${((numberedIdx + 1) / totalSteps) * 100}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl bg-surface shadow-card p-6">
        {screen === 'welcome' && <ScreenWelcome onStart={goNext} onDismiss={() => navigate(dismissTarget, { state: { skipOnboardingRedirect: true } })} />}
        {screen === 'child-info' && (
          <ScreenChildInfo state={state} onGradeChange={handleGradeChange} set={set} />
        )}
        {screen === 'school-details' && <ScreenSchoolDetails state={state} set={set} />}
        {screen === 'subjects' && <ScreenSubjects state={state} set={set} />}
        {screen === 'sen' && <ScreenSEN state={state} set={set} />}
        {screen === 'activities' && <ScreenActivities state={state} set={set} />}
        {screen === 'wellbeing' && <ScreenWellbeing state={state} set={set} />}
        {screen === 'psle-prep' && <ScreenPslePrep state={state} set={set} />}
        {screen === 'goals' && <ScreenGoals state={state} set={set} />}
        {screen === 'generate' && <ScreenGenerate state={state} error={error} submitting={submitting} />}

        {/* Navigation */}
        {screen !== 'welcome' && !submitting && (
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={goBack}
              disabled={submitting}
              className="flex-1 rounded-xl border-2 border-line py-3 text-sm font-semibold text-ink hover:border-primary/40 transition-colors disabled:opacity-50"
            >
              Back
            </button>
            {screen !== 'generate' ? (
              <button
                type="button"
                onClick={goNext}
                disabled={!canAdvance()}
                className="flex-1 btn-primary py-3 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleFinish()}
                disabled={submitting}
                className="flex-1 btn-primary py-3 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating plan…' : `Create ${state.childName}'s plan ✓`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
