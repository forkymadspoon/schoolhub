import { Routes, Route, Navigate } from 'react-router-dom';
import { OnboardingWizard } from '../components/parent/OnboardingWizard';
import { useAuth } from '../hooks/useAuth';

export function Onboarding() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-bg">
      <Routes>
        <Route path="/" element={<Navigate to="./wizard" replace />} />
        <Route path="/wizard/*" element={<OnboardingWizard />} />
      </Routes>
    </div>
  );
}
