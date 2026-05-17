import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { api } from '../services/api';
import type { Child } from '@schoolhub/types';

type Tab = 'signup' | 'login';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab: Tab = searchParams.get('tab') === 'login' ? 'login' : 'signup';

  const [tab, setTab] = useState<Tab>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setError('');
    setInfo('');
  }, [tab]);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    if (data.session) {
      navigate('/onboarding');
    } else {
      setInfo('Check your inbox to confirm your email, then log in.');
      setTab('login');
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    try {
      const children = await api.get<Child[]>('/children');
      navigate(children.length === 0 ? '/onboarding' : '/', { replace: true });
    } catch {
      navigate('/', { replace: true });
    }
  }

  async function handleForgotPassword() {
    if (!email) { setError('Enter your email address above first.'); return; }
    setError('');
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login?tab=login`,
    });
    setLoading(false);
    if (err) { setError(err.message); } else { setInfo('Password reset link sent — check your inbox.'); }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT: Form panel ── */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white border-r border-line flex-shrink-0">

        {/* Top bar */}
        <div className="px-8 py-5 flex items-center justify-between border-b border-line">
          <Link to="/" className="flex items-center gap-2.5 min-h-0 min-w-0">
            <img src="/logo.svg" alt="SchoolHub" height={44} width={161} />
          </Link>
          <Link to="/" className="text-xs font-semibold text-muted hover:text-ink transition-colors min-h-0">
            ← Back to home
          </Link>
        </div>

        {/* Form */}
        <div className="flex-1 flex flex-col justify-center px-8 py-10">
          <div className="max-w-[360px] w-full mx-auto">

            <h1 className="text-[26px] font-extrabold text-ink mb-1">
              {tab === 'signup' ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-sm text-muted mb-8 leading-[1.6]">
              {tab === 'signup'
                ? 'Start your free 7-day trial — no credit card required.'
                : 'Log in to your SchoolHub account.'}
            </p>

            {/* Tabs */}
            <div className="flex rounded-pill bg-surface p-1 mb-7 border border-line">
              {(['signup', 'login'] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2 text-sm font-semibold rounded-pill transition-all ${
                    tab === t ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-ink'
                  }`}
                >
                  {t === 'signup' ? 'Sign Up' : 'Log In'}
                </button>
              ))}
            </div>

            {/* Feedback banners */}
            {error && (
              <div className="mb-5 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}
            {info && (
              <div className="mb-5 px-3.5 py-2.5 rounded-xl bg-game-green-tint border border-game-green/30 text-[#3D6E00] text-sm">
                {info}
              </div>
            )}

            {/* Form fields */}
            <form onSubmit={tab === 'signup' ? handleSignUp : handleLogin} className="space-y-4">
              {tab === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">Full name</label>
                  <input
                    type="text" required value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Tan"
                    className="w-full px-4 py-3 rounded-xl border border-line bg-white text-ink placeholder:text-muted focus:outline-none focus:border-primary transition-colors text-sm"
                    style={{ minHeight: 0 }}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wide mb-1.5">Email address</label>
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-line bg-white text-ink placeholder:text-muted focus:outline-none focus:border-primary transition-colors text-sm"
                  style={{ minHeight: 0 }}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-ink uppercase tracking-wide">Password</label>
                  {tab === 'login' && (
                    <button type="button" onClick={handleForgotPassword} className="text-xs text-primary hover:underline font-medium" style={{ minHeight: 0 }}>
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  type="password" required minLength={8} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={tab === 'signup' ? 'Min. 8 characters' : '••••••••'}
                  className="w-full px-4 py-3 rounded-xl border border-line bg-white text-ink placeholder:text-muted focus:outline-none focus:border-primary transition-colors text-sm"
                  style={{ minHeight: 0 }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full !py-3 text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? 'Please wait…' : tab === 'signup' ? 'Create account →' : 'Log in →'}
              </button>
            </form>

            <p className="text-center text-sm text-muted mt-6">
              {tab === 'signup' ? (
                <>Already have an account?{' '}
                  <button type="button" onClick={() => setTab('login')} className="text-primary hover:underline font-semibold" style={{ minHeight: 0 }}>Log in</button>
                </>
              ) : (
                <>New to SchoolHub?{' '}
                  <button type="button" onClick={() => setTab('signup')} className="text-primary hover:underline font-semibold" style={{ minHeight: 0 }}>Create account</button>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Legal footer */}
        <div className="px-8 py-5 border-t border-line">
          <p className="text-xs text-muted">
            By continuing you agree to our{' '}
            <Link to="/terms" className="text-primary hover:underline">Terms</Link> and{' '}
            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>

      {/* ── RIGHT: Typographic hero panel ── */}
      <div className="hidden lg:flex flex-1 bg-primary flex-col items-start justify-center px-16 xl:px-20 relative overflow-hidden select-none">

        {/* Background decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute bottom-10 -left-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />

        {/* Big display type */}
        <div className="relative z-10 text-white">
          <div className="text-[clamp(56px,5.5vw,80px)] font-black leading-[0.9] tracking-tight">
            <div>Study</div>
            <div className="flex items-center gap-3 mt-1">smarter.<span className="text-[0.85em]">📚</span></div>
            <div className="mt-7 text-white/75">Stress</div>
            <div className="flex items-center gap-3 mt-1 text-white/75">less.<span className="text-[0.85em]">💚</span></div>
            <div className="mt-7 text-white/50">PSLE</div>
            <div className="flex items-center gap-3 mt-1 text-white/50">ready.<span className="text-[0.85em]">🎓</span></div>
          </div>

          {/* Stats row */}
          <div className="mt-14 flex gap-10 border-t border-white/20 pt-8">
            {[
              { num: '2,400+', label: 'Families on waitlist' },
              { num: '6',      label: 'MOE subjects covered' },
              { num: '<3 min', label: 'Average setup time'   },
            ].map(s => (
              <div key={s.label}>
                <div className="text-2xl font-black text-white">{s.num}</div>
                <div className="text-xs text-white/50 mt-0.5 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
