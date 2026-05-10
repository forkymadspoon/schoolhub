import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { OnboardingWizard } from '../components/parent/OnboardingWizard';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';

function AuthStep() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (mode === 'signup') {
      const { data, error: err } = await supabase.auth.signUp({ email, password });
      if (err) { setError(err.message); setLoading(false); return; }
      // If no session, email confirmation is required
      if (!data.session) setConfirmSent(true);
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError(err.message);
    }
    setLoading(false);
  }

  if (confirmSent) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="card w-full max-w-sm space-y-4 text-center">
          <div className="text-4xl">📬</div>
          <h1 className="text-ink font-bold text-xl">Check your email</h1>
          <p className="text-muted text-sm">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then come back here.
          </p>
          <p className="text-xs text-muted">
            No email? Check spam, or{' '}
            <button
              type="button"
              className="underline"
              onClick={() => { setConfirmSent(false); setMode('signin'); }}
            >
              sign in
            </button>{' '}
            if you already confirmed.
          </p>
          <p className="text-xs text-muted border-t border-line pt-3">
            Tip: disable email confirmation in Supabase Dashboard → Authentication → Providers → Email for local testing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="card w-full max-w-sm space-y-5">
        <div className="flex flex-col items-center gap-1 pb-1">
          <img src="/icon-light.svg" alt="SchoolHub" style={{ width: 150, height: 150 }} />
          <div className="text-center">
            <h1 className="text-ink font-bold text-lg">
              {mode === 'signup' ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-muted text-sm mt-0.5">
              {mode === 'signup' ? 'Set up SchoolHub for your family' : 'Sign in to continue'}
            </p>
          </div>
        </div>

        <form onSubmit={e => void handleSubmit(e)} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full rounded-card border border-line px-4 py-3 text-ink placeholder:text-muted focus:outline-none focus:border-primary"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password (min 6 chars)"
            minLength={6}
            required
            className="w-full rounded-card border border-line px-4 py-3 text-ink placeholder:text-muted focus:outline-none focus:border-primary"
          />
          {error && <p className="text-game-orange text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Please wait…' : mode === 'signup' ? 'Create account & continue' : 'Sign in'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => { setMode(m => m === 'signup' ? 'signin' : 'signup'); setError(''); }}
          className="text-sm text-muted underline w-full text-center"
        >
          {mode === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
}

export function Onboarding() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return <AuthStep />;

  return (
    <div className="min-h-screen bg-bg">
      <Routes>
        <Route path="/" element={<Navigate to="./wizard" replace />} />
        <Route path="/wizard/*" element={<OnboardingWizard />} />
      </Routes>
    </div>
  );
}
