import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Onboarding } from './pages/Onboarding';
import { ParentDashboard } from './pages/ParentDashboard';
import { StudentHome } from './pages/StudentHome';

function AlphaBanner() {
  return (
    <div className="w-full bg-primary px-4 py-1.5 text-center text-xs text-white/80 tracking-wide">
      Alpha — schedules are illustrative
    </div>
  );
}

export function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AlphaBanner />
      <Routes>
        <Route
          path="/onboarding/*"
          element={<Onboarding />}
        />
        <Route
          path="/student/*"
          element={session ? <StudentHome /> : <Navigate to="/onboarding" replace />}
        />
        <Route
          path="/*"
          element={
            session ? <ParentDashboard /> : <Navigate to="/onboarding" replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
