import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';

export function StudentSettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      <div className="card flex flex-col gap-3">
        <h3 className="text-ink font-semibold text-sm">Preferences</h3>
        <div className="flex items-center justify-between bg-bg rounded-2xl px-3 py-3">
          <div>
            <p className="text-ink font-medium text-sm">Exam countdown</p>
            <p className="text-muted text-xs">Show or hide the countdown chip</p>
          </div>
          <button type="button" className="text-muted text-xs bg-line rounded-pill px-3 py-1">Show</button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate('/')}
        className="card flex items-center justify-between text-left hover:shadow-md transition-shadow"
      >
        <div>
          <p className="text-ink font-medium text-sm">Switch to parent view</p>
          <p className="text-muted text-xs">Go back to the parent dashboard</p>
        </div>
        <span className="text-muted text-lg">›</span>
      </button>

      <button
        type="button"
        onClick={() => void supabase.auth.signOut()}
        className="btn-secondary py-3 text-sm text-game-orange border-game-orange/30 hover:border-game-orange"
      >
        Sign out
      </button>
    </div>
  );
}
