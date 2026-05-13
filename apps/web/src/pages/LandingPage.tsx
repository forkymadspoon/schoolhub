import { useState, useEffect, useRef, type FormEvent } from 'react';
import { supabase } from '../services/supabase';

type Tab = 'signup' | 'login';

// ── Data ──────────────────────────────────────────────────────────────────────

const FEATURES = [
  { num: '01', icon: '🤖', title: 'AI Adaptive Scheduling',   body: "Weekly study plans that auto-regenerate based on completion rates, exam proximity, and your child's pace. Powered by Claude Sonnet AI.", tag: 'Auto-regenerates weekly', blue: false },
  { num: '02', icon: '📚', title: 'MOE Curriculum Aligned',   body: "Synced with Singapore's official P1–P6 syllabi for English, Maths, Science, and Chinese. No manual setup. Updated weekly automatically.", tag: 'All 6 MOE subjects', blue: false },
  { num: '03', icon: '🧩', title: 'SEN Support Built-in',      body: "Optional ADHD and Autism Spectrum profiles adapt pacing, structure, and rewards. 5-minute bite cap for ADHD; 48-hour advance notice for ASD schedule changes.", tag: 'Evidence-based', blue: false },
  { num: '04', icon: '🏆', title: 'Gamification That Works',   body: 'Streaks, XP points, and subject badges keep students genuinely motivated. XP awarded live within 2 seconds via WebSocket.', tag: 'Real-time rewards', blue: false },
  { num: '05', icon: '💚', title: 'Wellbeing Guardrails',      body: 'Rule-based mental health monitoring flags overload, burnout, and exam anxiety early. Suggestions only — parent always overrides. Never clinical.', tag: 'Scholar Pro', blue: true },
  { num: '06', icon: '⏱️', title: 'Exam Countdown, Always On', body: 'PSLE, SA1, and SA2 countdowns on every screen, colour-coded green → yellow → red. Upload your school calendar or enter dates manually.', tag: 'Persistent on every screen', blue: false },
];

const STEPS = [
  { n: 1, icon: '👤', title: "Create your child's profile", body: "Add name, grade level, and optionally an SEN profile in under 60 seconds. Add siblings — SchoolHub manages the whole family in one place." },
  { n: 2, icon: '📁', title: 'Upload your school files',    body: 'Drop in your school calendar (.ics/.pdf), exam dates, spelling lists (.csv/.xlsx), or syllabus PDF. Our AI parses everything automatically.' },
  { n: 3, icon: '📅', title: 'Get your personalised plan',  body: 'A week-by-week schedule with spaced repetition and exam buffer weeks, generated in seconds. It auto-adjusts whenever life changes.' },
];

const PRICING = [
  {
    tier: 'Free Trial', price: '0', period: '7 days · No credit card',
    featured: false,
    features: [
      { yes: true,  text: '1 child profile' },
      { yes: true,  text: '1 subject' },
      { yes: true,  text: 'AI scheduling' },
      { yes: true,  text: 'MOE curriculum' },
      { yes: false, text: 'Gamification rewards' },
      { yes: false, text: 'Wellbeing dashboard' },
      { yes: false, text: 'SEN profiles' },
    ],
  },
  {
    tier: 'Scholar', price: '18', period: 'per month',
    featured: true,
    features: [
      { yes: true, text: 'Up to 2 children' },
      { yes: true, text: 'All 6 subjects' },
      { yes: true, text: 'AI scheduling' },
      { yes: true, text: 'Gamification & badges' },
      { yes: true, text: 'Shareable progress reports' },
      { yes: true, text: '1 SEN profile' },
      { yes: false, text: 'Wellbeing dashboard' },
    ],
  },
  {
    tier: 'Scholar Pro', price: '35', period: 'per month',
    featured: false,
    features: [
      { yes: true, text: 'Up to 4 children' },
      { yes: true, text: 'All 6 subjects' },
      { yes: true, text: 'AI scheduling' },
      { yes: true, text: 'Gamification & badges' },
      { yes: true, text: 'Mental health dashboard' },
      { yes: true, text: 'SEN for all children' },
      { yes: true, text: 'Offline PWA + priority support' },
    ],
  },
];

// ── AuthCard ──────────────────────────────────────────────────────────────────

function AuthCard({ initialTab = 'signup' }: { initialTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);

  // Sign-up form
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPass, setSuPass]   = useState('');
  const [grade, setGrade]     = useState('');
  const [suLoading, setSuLoading] = useState(false);
  const [suError, setSuError]     = useState('');
  const [suDone, setSuDone]       = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState('');

  // Log-in form
  const [liEmail, setLiEmail] = useState('');
  const [liPass, setLiPass]   = useState('');
  const [liLoading, setLiLoading] = useState(false);
  const [liError, setLiError]     = useState('');
  const [liInfo, setLiInfo]       = useState('');

  function switchTab(t: Tab) {
    setTab(t);
    setSuError(''); setLiError(''); setLiInfo(''); setSuDone(false);
  }

  async function handleSignup(e: FormEvent) {
    e.preventDefault();
    setSuError('');
    if (!fname.trim()) return setSuError('Please enter your first name.');
    if (!suEmail.trim()) return setSuError('Please enter your email address.');
    if (suPass.length < 8) return setSuError('Password must be at least 8 characters.');
    setSuLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: suEmail, password: suPass,
      options: { data: { first_name: fname, last_name: lname, child_grade: grade } },
    });
    setSuLoading(false);
    if (error) return setSuError(error.message);
    if (data.session) return; // session set → App re-routes automatically
    setConfirmedEmail(suEmail);
    setSuDone(true);
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLiError(''); setLiInfo('');
    if (!liEmail.trim()) return setLiError('Please enter your email address.');
    if (!liPass) return setLiError('Please enter your password.');
    setLiLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: liEmail, password: liPass });
    setLiLoading(false);
    if (error) {
      setLiError(error.message === 'Invalid login credentials' ? 'Incorrect email or password.' : error.message);
    }
    // on success, session is set → App.tsx re-routes automatically
  }

  async function handleGoogleAuth() {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
  }

  async function handleForgotPassword() {
    setLiError(''); setLiInfo('');
    if (!liEmail.trim()) return setLiError('Enter your email above first, then click "Forgot password?".');
    const { error } = await supabase.auth.resetPasswordForEmail(liEmail);
    if (error) return setLiError(error.message);
    setLiInfo(`Reset email sent to ${liEmail}. Check your inbox.`);
  }

  const tabBase = 'flex-1 py-2.5 text-sm font-bold rounded-[9px] transition-all duration-200 cursor-pointer border-none';
  const tabActive = 'bg-white text-ink shadow-soft';
  const tabInactive = 'bg-transparent text-muted';

  return (
    <div className="card p-8 sticky top-24">
      {/* Success state */}
      {suDone && (
        <div className="flex flex-col items-center text-center gap-4 py-3">
          <div className="w-14 h-14 rounded-full bg-game-green flex items-center justify-center" style={{ boxShadow: '0 4px 20px rgba(135,200,60,0.35)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div className="font-extrabold text-ink text-lg">Check your email! 📬</div>
          <p className="text-muted text-sm leading-relaxed max-w-[260px]">
            We sent a confirmation link to <strong>{confirmedEmail}</strong>. Click it to activate your account, then log in.
          </p>
          <button className="btn-primary w-full text-sm" onClick={() => { setSuDone(false); switchTab('login'); }}>
            Go to Log In
          </button>
        </div>
      )}

      {!suDone && (
        <>
          {/* Tabs */}
          <div className="grid grid-cols-2 bg-bg border border-line rounded-xl p-1 mb-6">
            <button className={`${tabBase} ${tab === 'signup' ? tabActive : tabInactive}`} onClick={() => switchTab('signup')}>Sign Up</button>
            <button className={`${tabBase} ${tab === 'login'  ? tabActive : tabInactive}`} onClick={() => switchTab('login')}>Log In</button>
          </div>

          {/* Sign Up */}
          {tab === 'signup' && (
            <div>
              <p className="font-extrabold text-ink text-lg mb-0.5">Create your account</p>
              <p className="text-muted text-xs mb-5">7-day free trial · No credit card required</p>
              {suError && <div className="bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 text-red-800 text-sm font-semibold mb-4">{suError}</div>}
              <form onSubmit={e => void handleSignup(e)} noValidate>
                <div className="grid grid-cols-2 gap-3 mb-3.5">
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1.5">First name</label>
                    <input type="text" value={fname} onChange={e => setFname(e.target.value)} placeholder="Sarah" autoComplete="given-name" className="w-full border border-line rounded-[10px] px-3.5 py-2.5 text-sm font-medium text-ink placeholder:text-[#A8BDC8] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1.5">Last name</label>
                    <input type="text" value={lname} onChange={e => setLname(e.target.value)} placeholder="Tan" autoComplete="family-name" className="w-full border border-line rounded-[10px] px-3.5 py-2.5 text-sm font-medium text-ink placeholder:text-[#A8BDC8] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
                  </div>
                </div>
                <div className="mb-3.5">
                  <label className="block text-xs font-bold text-ink mb-1.5">Email address</label>
                  <input type="email" value={suEmail} onChange={e => setSuEmail(e.target.value)} placeholder="sarah@example.com" autoComplete="email" className="w-full border border-line rounded-[10px] px-3.5 py-2.5 text-sm font-medium text-ink placeholder:text-[#A8BDC8] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" required />
                </div>
                <div className="mb-3.5">
                  <label className="block text-xs font-bold text-ink mb-1.5">Password</label>
                  <input type="password" value={suPass} onChange={e => setSuPass(e.target.value)} placeholder="Min. 8 characters" autoComplete="new-password" className="w-full border border-line rounded-[10px] px-3.5 py-2.5 text-sm font-medium text-ink placeholder:text-[#A8BDC8] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" required />
                </div>
                <div className="mb-5">
                  <label className="block text-xs font-bold text-ink mb-1.5">Child's grade level</label>
                  <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full border border-line rounded-[10px] px-3.5 py-2.5 text-sm font-medium text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-white appearance-none">
                    <option value="">Select grade (optional)</option>
                    {['K2','P1','P2','P3','P4','P5','P6'].map(g => (
                      <option key={g} value={g}>{g === 'K2' ? 'K2 — Kindergarten 2' : g === 'P6' ? 'Primary 6 (PSLE year)' : `Primary ${g.slice(1)}`}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" disabled={suLoading} className="btn-primary w-full">
                  {suLoading ? 'Creating account…' : 'Create Free Account'}
                </button>
              </form>
              <Divider />
              <GoogleButton onClick={() => void handleGoogleAuth()} />
              <p className="text-center text-muted text-xs mt-4">Already have an account? <button className="text-primary font-bold hover:underline" onClick={() => switchTab('login')}>Log in</button></p>
              <p className="text-center text-[11px] text-muted mt-2.5 leading-relaxed">By signing up you agree to our <a href="#" className="text-primary">Terms</a> &amp; <a href="#" className="text-primary">Privacy Policy</a>.</p>
            </div>
          )}

          {/* Log In */}
          {tab === 'login' && (
            <div>
              <p className="font-extrabold text-ink text-lg mb-0.5">Welcome back</p>
              <p className="text-muted text-xs mb-5">Sign in to your SchoolHub dashboard</p>
              {liError && <div className="bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 text-red-800 text-sm font-semibold mb-4">{liError}</div>}
              {liInfo  && <div className="bg-primary-soft border border-primary/30 rounded-xl px-3.5 py-2.5 text-primary-dark text-sm font-semibold mb-4">{liInfo}</div>}
              <form onSubmit={e => void handleLogin(e)} noValidate>
                <div className="mb-3.5">
                  <label className="block text-xs font-bold text-ink mb-1.5">Email address</label>
                  <input type="email" value={liEmail} onChange={e => setLiEmail(e.target.value)} placeholder="sarah@example.com" autoComplete="email" className="w-full border border-line rounded-[10px] px-3.5 py-2.5 text-sm font-medium text-ink placeholder:text-[#A8BDC8] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" required />
                </div>
                <div className="mb-1.5">
                  <label className="block text-xs font-bold text-ink mb-1.5">Password</label>
                  <input type="password" value={liPass} onChange={e => setLiPass(e.target.value)} placeholder="Your password" autoComplete="current-password" className="w-full border border-line rounded-[10px] px-3.5 py-2.5 text-sm font-medium text-ink placeholder:text-[#A8BDC8] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" required />
                </div>
                <button type="button" className="block text-right text-xs text-primary font-semibold mb-4 w-full hover:underline" onClick={() => void handleForgotPassword()}>Forgot password?</button>
                <button type="submit" disabled={liLoading} className="btn-primary w-full">
                  {liLoading ? 'Signing in…' : 'Log In'}
                </button>
              </form>
              <Divider />
              <GoogleButton onClick={() => void handleGoogleAuth()} />
              <p className="text-center text-muted text-xs mt-4">Don't have an account? <button className="text-primary font-bold hover:underline" onClick={() => switchTab('signup')}>Sign up free</button></p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-line" />
      <span className="text-xs font-semibold text-muted">or</span>
      <div className="flex-1 h-px bg-line" />
    </div>
  );
}

function GoogleButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white border border-line rounded-[10px] text-sm font-semibold text-ink hover:bg-bg transition-colors">
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Continue with Google
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function LandingPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const authCardRef = useRef<HTMLDivElement>(null);

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('lp-in'); observer.unobserve(e.target); } }),
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' },
    );
    document.querySelectorAll('.lp-reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function focusAuth() {
    authCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return (
    <div className="min-h-screen bg-bg">

      {/* ── NAV ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-bg/90 backdrop-blur-md border-b border-line px-8 flex items-center justify-between gap-6" style={{ minHeight: 60 }}>
        <a href="#top" className="flex items-center gap-2.5 min-h-0 min-w-0">
          <img src="/icon-light.svg" alt="SchoolHub" height={30} width={30} />
          <span className="font-extrabold text-ink text-[17px] tracking-tight">SchoolHub</span>
        </a>
        <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
          {['Features','How it works','Pricing'].map(label => (
            <li key={label}><a href={`#${label.toLowerCase().replace(' ','-')}`} className="text-sm font-semibold text-muted hover:text-ink transition-colors min-h-0 min-w-0">{label}</a></li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <button className="hidden md:block text-sm font-semibold text-muted hover:text-ink px-4 py-2 rounded-pill hover:bg-primary-soft transition-colors" onClick={focusAuth}>Log in</button>
          <button className="btn-primary text-sm !py-2 !px-5 hidden md:flex" onClick={focusAuth}>Get Started</button>
          <button className="md:hidden p-2 flex flex-col gap-[5px]" aria-label="Menu" onClick={() => setMobileNavOpen(v => !v)}>
            <span className="block w-5 h-0.5 bg-ink rounded" /><span className="block w-5 h-0.5 bg-ink rounded" /><span className="block w-5 h-0.5 bg-ink rounded" />
          </button>
        </div>
      </nav>
      {mobileNavOpen && (
        <div className="fixed top-[60px] inset-x-0 z-40 bg-bg/98 border-b border-line flex flex-col p-5 gap-1">
          {['Features','How it works','Pricing'].map(label => (
            <a key={label} href={`#${label.toLowerCase().replace(' ','-')}`} onClick={() => setMobileNavOpen(false)} className="text-base font-semibold text-ink py-3 border-b border-line min-h-0">{label}</a>
          ))}
          <button className="btn-primary mt-3 text-sm" onClick={() => { setMobileNavOpen(false); focusAuth(); }}>Get Started Free</button>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="pt-[108px] pb-20 px-8" id="top">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 desktop:grid-cols-[1fr_440px] gap-12 desktop:gap-[72px] items-start">

          {/* Left */}
          <div className="flex flex-col items-center desktop:items-start pt-4">
            <div className="inline-flex items-center gap-2 bg-primary-soft border border-primary/25 rounded-pill px-3.5 py-1.5 text-xs font-bold text-primary-dark mb-7">
              <span className="w-1.5 h-1.5 bg-primary rounded-full" style={{ animation: 'lp-pulse 2s ease-in-out infinite' }} />
              Singapore K2–P6 · MOE Curriculum Aligned
            </div>
            <h1 className="text-[clamp(40px,5.5vw,68px)] font-black leading-[1.04] tracking-[-2px] text-ink mb-6 text-center desktop:text-left">
              Study Smarter.<br /><span className="text-primary">Stress Less.</span>
            </h1>
            <p className="text-[18px] text-muted font-medium leading-[1.7] mb-9 max-w-[480px] text-center desktop:text-left">
              AI-powered adaptive study scheduling for Singapore students aged 6–12. Personalised plans, SEN support, and real-time wellbeing — so every child thrives.
            </p>
            <ul className="list-none m-0 p-0 flex flex-col gap-2.5 mb-10 self-center desktop:self-start">
              {['MOE P1–P6 curriculum built-in, synced weekly','SEN support for ADHD & Autism Spectrum','PSLE & SA countdown on every screen','XP, streaks & badges that actually motivate'].map(text => (
                <li key={text} className="flex items-center gap-2.5 text-[15px] font-semibold text-ink">
                  <span className="w-5 h-5 rounded-full bg-game-green-tint border border-game-green flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-[#3D6E00]">✓</span>
                  {text}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2.5 flex-wrap justify-center desktop:justify-start mb-6">
              <button className="btn-primary !py-4 !px-8 text-base" onClick={focusAuth}>Start free — 7 days</button>
              <a href="#features" className="btn-secondary !py-4 !px-8 text-base">See features →</a>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted flex-wrap justify-center desktop:justify-start">
              <span>No credit card required</span><span className="text-line">·</span>
              <span>Setup in &lt;3 minutes</span><span className="text-line">·</span>
              <span>PDPA compliant</span>
            </div>
          </div>

          {/* Auth card */}
          <div ref={authCardRef}>
            <AuthCard />
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="bg-ink py-8 px-8">
        <div className="max-w-[1100px] mx-auto grid grid-cols-2 desktop:grid-cols-4">
          {[
            { num: '2,400+', label: 'Families on waitlist', accent: true },
            { num: '6',      label: 'MOE subjects covered',     accent: false },
            { num: '90%+',   label: 'Curriculum parse accuracy', accent: true },
            { num: '<3 min', label: 'Average setup time',        accent: false },
          ].map((s, i) => (
            <div key={i} className="text-center py-2 px-4 border-r border-white/10 last:border-r-0 [&:nth-child(even)]:border-r-0 desktop:[&:nth-child(even)]:border-r desktop:[&:nth-child(2n)]:border-white/10">
              <div className={`text-[34px] font-black leading-none mb-1 ${s.accent ? 'text-primary' : 'text-white'}`}>{s.num}</div>
              <div className="text-xs font-semibold text-white/45">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section className="py-24 px-8 bg-white" id="features">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-14 lp-reveal">
            <span className="block text-[11px] font-bold tracking-[2.5px] uppercase text-primary mb-3.5">SEC. ONE — FEATURES</span>
            <h2 className="text-[clamp(28px,4vw,42px)] font-extrabold tracking-tight text-ink mb-3">Everything your child needs to excel</h2>
            <p className="text-[17px] text-muted font-medium leading-[1.65] max-w-[560px] mx-auto">Six core capabilities that work together to build confident, capable learners — without the burnout.</p>
          </div>
          <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={f.num} className={`card hover:-translate-y-1 hover:shadow-card transition-transform duration-200 lp-reveal lp-d${i + 1}`}>
                <div className="text-[11px] font-bold tracking-[2px] uppercase text-primary mb-3.5">{f.num}</div>
                <div className="w-12 h-12 rounded-[14px] bg-primary-soft border border-primary/20 flex items-center justify-center text-[22px] mb-4">{f.icon}</div>
                <h3 className="text-[17px] font-extrabold text-ink mb-2">{f.title}</h3>
                <p className="text-sm text-muted leading-[1.65] font-medium">{f.body}</p>
                <span className={`inline-flex items-center rounded-pill text-[11px] font-bold px-2.5 py-0.5 mt-3.5 ${f.blue ? 'bg-primary-soft text-primary-dark' : 'bg-game-green-tint text-[#3D6E00]'}`}>{f.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-8 bg-bg" id="how-it-works">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-14 lp-reveal">
            <span className="block text-[11px] font-bold tracking-[2.5px] uppercase text-primary mb-3.5">SEC. TWO — HOW IT WORKS</span>
            <h2 className="text-[clamp(28px,4vw,42px)] font-extrabold tracking-tight text-ink mb-3">Up and running in 3 minutes</h2>
            <p className="text-[17px] text-muted font-medium leading-[1.65] max-w-[560px] mx-auto">No lengthy onboarding. No manual data entry. SchoolHub builds your plan automatically from day one.</p>
          </div>
          <div className="grid grid-cols-1 tablet:grid-cols-3 gap-7 max-w-[860px] mx-auto">
            {STEPS.map((s, i) => (
              <div key={s.n} className={`card text-center py-10 px-6 lp-reveal lp-d${i + 1}`}>
                <div className="w-12 h-12 rounded-full bg-primary text-white text-lg font-black flex items-center justify-center mx-auto mb-4" style={{ boxShadow: '0 4px 16px rgba(25,142,204,0.35)' }}>{s.n}</div>
                <div className="text-3xl mb-3.5">{s.icon}</div>
                <h3 className="text-[17px] font-extrabold text-ink mb-2.5">{s.title}</h3>
                <p className="text-sm text-muted leading-[1.65] font-medium">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-24 px-8 bg-white" id="pricing">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-14 lp-reveal">
            <span className="block text-[11px] font-bold tracking-[2.5px] uppercase text-primary mb-3.5">SEC. THREE — PRICING</span>
            <h2 className="text-[clamp(28px,4vw,42px)] font-extrabold tracking-tight text-ink mb-3">Simple, transparent pricing</h2>
            <p className="text-[17px] text-muted font-medium leading-[1.65] max-w-[560px] mx-auto">Start free for 7 days. Upgrade only when you're ready. Annual plan saves 2 months.</p>
          </div>
          <div className="grid grid-cols-1 tablet:grid-cols-3 gap-5 items-start max-w-[900px] mx-auto">
            {PRICING.map((p, i) => (
              <div key={p.tier} className={`card relative lp-reveal lp-d${i + 1} ${p.featured ? 'border-primary ring-1 ring-primary shadow-card' : ''}`}>
                {p.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[11px] font-extrabold tracking-[1px] uppercase px-3.5 py-1 rounded-pill">Most Popular</div>}
                <div className="text-xs font-bold tracking-[2px] uppercase text-muted mb-2.5">{p.tier}</div>
                <div className="text-[42px] font-black text-ink leading-none mb-1"><sup className="text-lg font-bold align-top mt-2">$</sup>{p.price}</div>
                <div className="text-xs text-muted font-medium mb-5">{p.period}</div>
                <div className="h-px bg-line mb-5" />
                <ul className="list-none m-0 p-0 flex flex-col gap-2.5 mb-7">
                  {p.features.map(f => (
                    <li key={f.text} className={`flex items-start gap-2.5 text-sm font-medium ${f.yes ? 'text-ink' : 'text-muted'}`}>
                      <span className={`w-4.5 h-4.5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center text-[9px] ${f.yes ? 'bg-game-green-tint border border-game-green text-[#3D6E00] font-bold' : 'bg-[#F0F0F0] text-[#CCC]'}`}>{f.yes ? '✓' : '✕'}</span>
                      {f.text}
                    </li>
                  ))}
                </ul>
                <button className={p.featured ? 'btn-primary w-full' : 'btn-secondary w-full'} onClick={focusAuth}>
                  {p.tier === 'Free Trial' ? 'Start Free Trial' : 'Get Started →'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section className="py-24 px-8 text-center" style={{ background: 'linear-gradient(160deg, #1A2B3D 0%, #0E2031 100%)' }}>
        <div className="max-w-[1100px] mx-auto">
          <span className="block text-[11px] font-bold tracking-[2.5px] uppercase text-white/40 mb-5">Get started today</span>
          <h2 className="text-[clamp(32px,5vw,52px)] font-black tracking-tight text-white leading-[1.1] mb-4">
            Ready to build your child's<br />study plan?
          </h2>
          <p className="text-[18px] text-white/60 font-medium mb-10 leading-[1.55]">
            Join thousands of Singapore families studying smarter.<br />7-day free trial. No credit card. Cancel anytime.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button className="btn-primary !py-4 !px-8 text-base" onClick={focusAuth}>Start Free Trial →</button>
            <a href="#features" className="btn-secondary !py-4 !px-8 text-base !bg-transparent !text-white/65 !border-white/20 hover:!bg-white/10 hover:!text-white hover:!border-white/35">See all features</a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-ink border-t border-white/[0.07] py-10 px-8">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between flex-wrap gap-5">
          <div className="flex items-center gap-2.5">
            <img src="/icon-light.svg" alt="" height={24} width={24} aria-hidden style={{ filter: 'brightness(0) invert(1) opacity(0.6)' }} />
            <span className="text-sm font-extrabold text-white">SchoolHub</span>
          </div>
          <div className="flex gap-6 flex-wrap">
            {['Privacy Policy','Terms of Service','PDPA','Contact'].map(l => (
              <a key={l} href="#" className="text-xs font-semibold text-white/35 hover:text-white/75 transition-colors min-h-0 min-w-0">{l}</a>
            ))}
          </div>
          <p className="text-xs text-white/25 font-medium">© 2026 SchoolHub · Singapore</p>
        </div>
      </footer>

      {/* Pulse keyframe for eyebrow dot */}
      <style>{`@keyframes lp-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.65)} }`}</style>
    </div>
  );
}
