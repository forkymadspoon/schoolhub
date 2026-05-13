import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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

// ── Component ─────────────────────────────────────────────────────────────────

export function LandingPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('lp-in'); observer.unobserve(e.target); } }),
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' },
    );
    document.querySelectorAll('.lp-reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-bg">

      {/* ── NAV ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-bg/90 backdrop-blur-md border-b border-line px-8 flex items-center justify-between gap-6" style={{ minHeight: 60 }}>
        <Link to="/" className="flex items-center gap-2.5 min-h-0 min-w-0">
          <img src="/icon-light.svg" alt="SchoolHub" height={30} width={30} />
          <span className="font-extrabold text-ink text-[17px] tracking-tight">SchoolHub</span>
        </Link>
        <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
          {['Features', 'How it works', 'Pricing'].map(label => (
            <li key={label}>
              <a href={`#${label.toLowerCase().replace(' ', '-')}`} className="text-sm font-semibold text-muted hover:text-ink transition-colors min-h-0 min-w-0">{label}</a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <Link to="/login?tab=login" className="hidden md:flex items-center text-sm font-semibold text-muted hover:text-ink px-4 py-2 rounded-pill hover:bg-primary-soft transition-colors min-h-0">Log in</Link>
          <Link to="/login" className="btn-primary text-sm !py-2 !px-5 hidden md:flex">Get Started</Link>
          <button className="md:hidden p-2 flex flex-col gap-[5px]" aria-label="Menu" onClick={() => setMobileNavOpen(v => !v)}>
            <span className="block w-5 h-0.5 bg-ink rounded" /><span className="block w-5 h-0.5 bg-ink rounded" /><span className="block w-5 h-0.5 bg-ink rounded" />
          </button>
        </div>
      </nav>

      {mobileNavOpen && (
        <div className="fixed top-[60px] inset-x-0 z-40 bg-bg/98 border-b border-line flex flex-col p-5 gap-1">
          {['Features', 'How it works', 'Pricing'].map(label => (
            <a key={label} href={`#${label.toLowerCase().replace(' ', '-')}`} onClick={() => setMobileNavOpen(false)} className="text-base font-semibold text-ink py-3 border-b border-line min-h-0">{label}</a>
          ))}
          <Link to="/login?tab=login" className="text-base font-semibold text-ink py-3 border-b border-line" onClick={() => setMobileNavOpen(false)}>Log in</Link>
          <Link to="/login" className="btn-primary mt-3 text-sm text-center" onClick={() => setMobileNavOpen(false)}>Get Started Free</Link>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="pt-[108px] pb-24 px-8 text-center" id="top">
        <div className="max-w-[760px] mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary-soft border border-primary/25 rounded-pill px-3.5 py-1.5 text-xs font-bold text-primary-dark mb-8">
            <span className="w-1.5 h-1.5 bg-primary rounded-full" style={{ animation: 'lp-pulse 2s ease-in-out infinite' }} />
            Singapore K2–P6 · MOE Curriculum Aligned
          </div>
          <h1 className="text-[clamp(42px,6vw,72px)] font-black leading-[1.03] tracking-[-2px] text-ink mb-6">
            Study Smarter.<br /><span className="text-primary">Stress Less.</span>
          </h1>
          <p className="text-[18px] text-muted font-medium leading-[1.7] mb-10 max-w-[520px] mx-auto">
            AI-powered adaptive study scheduling for Singapore students aged 6–12. Personalised plans, SEN support, and real-time wellbeing — so every child thrives.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap mb-8">
            <Link to="/login" className="btn-primary !py-4 !px-9 text-base">Get Started Free →</Link>
            <a href="#features" className="btn-secondary !py-4 !px-9 text-base">See features</a>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted flex-wrap">
            <span>No credit card required</span><span className="text-line">·</span>
            <span>Setup in &lt;3 minutes</span><span className="text-line">·</span>
            <span>PDPA compliant</span>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="bg-ink py-8 px-8">
        <div className="max-w-[1100px] mx-auto grid grid-cols-2 desktop:grid-cols-4">
          {[
            { num: '2,400+', label: 'Families on waitlist',       accent: true  },
            { num: '6',      label: 'MOE subjects covered',        accent: false },
            { num: '90%+',   label: 'Curriculum parse accuracy',   accent: true  },
            { num: '<3 min', label: 'Average setup time',          accent: false },
          ].map((s, i) => (
            <div key={i} className="text-center py-2 px-4 border-r border-white/10 last:border-r-0">
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
                {p.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[11px] font-extrabold tracking-[1px] uppercase px-3.5 py-1 rounded-pill whitespace-nowrap">Most Popular</div>}
                <div className="text-xs font-bold tracking-[2px] uppercase text-muted mb-2.5">{p.tier}</div>
                <div className="text-[42px] font-black text-ink leading-none mb-1"><sup className="text-lg font-bold align-top mt-2">$</sup>{p.price}</div>
                <div className="text-xs text-muted font-medium mb-5">{p.period}</div>
                <div className="h-px bg-line mb-5" />
                <ul className="list-none m-0 p-0 flex flex-col gap-2.5 mb-7">
                  {p.features.map(f => (
                    <li key={f.text} className={`flex items-start gap-2.5 text-sm font-medium ${f.yes ? 'text-ink' : 'text-muted'}`}>
                      <span className={`w-[18px] h-[18px] rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center text-[9px] font-bold ${f.yes ? 'bg-game-green-tint border border-game-green text-[#3D6E00]' : 'bg-[#F0F0F0] text-[#CCC]'}`}>{f.yes ? '✓' : '✕'}</span>
                      {f.text}
                    </li>
                  ))}
                </ul>
                <Link to="/login" className={`block text-center ${p.featured ? 'btn-primary' : 'btn-secondary'} w-full`}>
                  {p.tier === 'Free Trial' ? 'Start Free Trial' : 'Get Started →'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section className="py-24 px-8 text-center" style={{ background: 'linear-gradient(160deg, #1A2B3D 0%, #0E2031 100%)' }}>
        <div className="max-w-[760px] mx-auto">
          <span className="block text-[11px] font-bold tracking-[2.5px] uppercase text-white/40 mb-5">Get started today</span>
          <h2 className="text-[clamp(32px,5vw,52px)] font-black tracking-tight text-white leading-[1.1] mb-4">
            Ready to build your child's<br />study plan?
          </h2>
          <p className="text-[18px] text-white/60 font-medium mb-10 leading-[1.55]">
            Join thousands of Singapore families studying smarter.<br />7-day free trial. No credit card. Cancel anytime.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/login" className="btn-primary !py-4 !px-9 text-base">Start Free Trial →</Link>
            <a href="#features" className="btn-secondary !py-4 !px-9 text-base !bg-transparent !text-white/65 !border-white/20 hover:!bg-white/10 hover:!text-white">See all features</a>
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
            {['Privacy Policy', 'Terms of Service', 'PDPA', 'Contact'].map(l => (
              <a key={l} href="#" className="text-xs font-semibold text-white/35 hover:text-white/75 transition-colors min-h-0 min-w-0">{l}</a>
            ))}
          </div>
          <p className="text-xs text-white/25 font-medium">© 2026 SchoolHub · Singapore</p>
        </div>
      </footer>

      <style>{`@keyframes lp-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.65)} }`}</style>
    </div>
  );
}
