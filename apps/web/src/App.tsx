import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Onboarding } from './pages/Onboarding';
import { ParentDashboard } from './pages/ParentDashboard';
import { StudentHome } from './pages/StudentHome';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { PDPAPage } from './pages/PDPAPage';
import { ContactPage } from './pages/ContactPage';

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
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/onboarding/*" element={<Onboarding />} />
        <Route
          path="/login"
          element={session ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/student/*"
          element={session ? <StudentHome /> : <Navigate to="/" replace />}
        />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/pdpa" element={<PDPAPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route
          path="/*"
          element={session ? <ParentDashboard /> : <LandingPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}
