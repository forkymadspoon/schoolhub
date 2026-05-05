import { Routes, Route, Navigate } from 'react-router-dom';
import { OnboardingWizard } from '../components/parent/OnboardingWizard';

export function Onboarding() {
  return (
    <div className="min-h-screen bg-bg">
      <Routes>
        <Route path="/" element={<Navigate to="./wizard" replace />} />
        <Route path="/wizard/*" element={<OnboardingWizard />} />
      </Routes>
    </div>
  );
}
