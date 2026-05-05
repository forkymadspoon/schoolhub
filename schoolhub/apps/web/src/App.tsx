import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Onboarding } from './pages/Onboarding';
import { ParentDashboard } from './pages/ParentDashboard';
import { StudentHome } from './pages/StudentHome';

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
      <Routes>
        <Route
          path="/onboarding/*"
          element={!session ? <Onboarding /> : <Navigate to="/" replace />}
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
