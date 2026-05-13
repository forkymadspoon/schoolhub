import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';

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
    if (err) {
      setError(err.message);
      return;
    }
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
    if (err) {
      setError(err.message);
      return;
    }
    navigate('/');
  }

  async function handleForgotPassword() {
    if (!email) {
      setError('Enter your email address above first.');
      return;
    }
    setError('');
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login?tab=login`,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setInfo('Password reset link sent — check your inbox.');
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Nav */}
      <nav className="w-full px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-primary font-bold text-lg">
          <span className="text-2xl">📚</span>
          SchoolHub
        </Link>
        <Link to="/" className="text-sm text-muted hover:text-ink transition-colors">
          ← Back to home
        </Link>
      </nav>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="card rounded-card p-8 shadow-lg">
            {/* Logo / heading */}
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">📚</div>
              <h1 className="text-2xl font-bold text-ink">
                {tab === 'signup' ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="text-sm text-muted mt-1">
                {tab === 'signup'
                  ? 'Start your free 7-day trial — no credit card required.'
                  : 'Log in to your SchoolHub account.'}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex rounded-pill bg-surface p-1 mb-6">
              {(['signup', 'login'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2 text-sm font-medium rounded-pill transition-all ${
                    tab === t
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  {t === 'signup' ? 'Sign Up' : 'Log In'}
                </button>
              ))}
            </div>

            {/* Feedback */}
            {error && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}
            {info && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                {info}
              </div>
            )}

            {/* Form */}
            <form onSubmit={tab === 'signup' ? handleSignUp : handleLogin} className="space-y-4">
              {tab === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Full name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Tan"
                    className="w-full px-3 py-2.5 rounded-lg border border-line bg-white text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-ink mb-1">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2.5 rounded-lg border border-line bg-white text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={tab === 'signup' ? 'Min. 8 characters' : '••••••••'}
                  className="w-full px-3 py-2.5 rounded-lg border border-line bg-white text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                />
              </div>

              {tab === 'login' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-2.5 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading
                  ? 'Please wait…'
                  : tab === 'signup'
                  ? 'Create account'
                  : 'Log in'}
              </button>
            </form>

            {/* Switch tab hint */}
            <p className="text-center text-sm text-muted mt-5">
              {tab === 'signup' ? (
                <>
                  Already have an account?{' '}
                  <button onClick={() => setTab('login')} className="text-primary hover:underline font-medium">
                    Log in
                  </button>
                </>
              ) : (
                <>
                  New to SchoolHub?{' '}
                  <button onClick={() => setTab('signup')} className="text-primary hover:underline font-medium">
                    Create account
                  </button>
                </>
              )}
            </p>
          </div>

          <p className="text-center text-xs text-muted mt-4">
            By continuing you agree to our{' '}
            <span className="text-primary cursor-pointer hover:underline">Terms</span> and{' '}
            <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
