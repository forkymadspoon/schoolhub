import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, type ReactNode } from 'react';
import { ParentBottomNav } from '../components/parent/ParentBottomNav';
import { ParentSidebar } from '../components/parent/ParentSidebar';
import { Dashboard } from '../components/parent/Dashboard';
import { PlanPage } from '../components/parent/PlanPage';
import { ProgressPage } from '../components/parent/ProgressPage';
import { WellbeingPage } from '../components/parent/WellbeingPage';
import { SettingsPage } from '../components/parent/SettingsPage';
import { api } from '../services/api';
import type { Child } from '@schoolhub/types';

function PageShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <>
      <header className="bg-surface border-b border-line px-4 md:px-8 sticky top-0 z-10 h-[90px] flex items-center">
        <div className="max-w-4xl">
          <h1 className="text-ink font-bold text-base">{title}</h1>
          {subtitle && <p className="text-muted text-xs mt-0.5">{subtitle}</p>}
        </div>
      </header>
      <main className="px-4 md:px-8 py-5 pb-24 md:pb-8 max-w-4xl">
        {children}
      </main>
    </>
  );
}

function AlphaBanner() {
  return (
    <div className="w-full bg-primary px-4 py-1.5 text-center text-xs text-white/80 tracking-wide">
      Alpha — schedules are illustrative
    </div>
  );
}

export function ParentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const skipRedirect = (location.state as { skipOnboardingRedirect?: boolean } | null)?.skipOnboardingRedirect;

  useEffect(() => {
    if (skipRedirect) return;
    api.get<Child[]>('/children')
      .then(children => { if (children.length === 0) navigate('/onboarding', { replace: true }); })
      .catch(() => null);
  }, [navigate, skipRedirect]);

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <AlphaBanner />
      <div className="flex flex-1">
      <ParentSidebar />
      <div className="flex-1 flex flex-col min-w-0 md:ml-60">
        <Routes>
          {/* Home has its own header + layout */}
          <Route path="/" element={<Dashboard />} />

          <Route path="/plan" element={
            <PageShell title="Plan" subtitle="Your child's study schedule">
              <PlanPage />
            </PageShell>
          } />

          <Route path="/progress" element={
            <PageShell title="Progress" subtitle="Badges, XP, and completion trends">
              <ProgressPage />
            </PageShell>
          } />

          <Route path="/wellbeing" element={
            <PageShell title="Wellbeing" subtitle="Mental health guardrails">
              <WellbeingPage />
            </PageShell>
          } />

          <Route path="/settings" element={
            <PageShell title="Settings">
              <SettingsPage />
            </PageShell>
          } />
        </Routes>
        <ParentBottomNav />
      </div>
      </div>
    </div>
  );
}
