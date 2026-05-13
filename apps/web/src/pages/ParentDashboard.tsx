import { Routes, Route } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ParentBottomNav } from '../components/parent/ParentBottomNav';
import { ParentSidebar } from '../components/parent/ParentSidebar';
import { Dashboard } from '../components/parent/Dashboard';
import { PlanPage } from '../components/parent/PlanPage';
import { ProgressPage } from '../components/parent/ProgressPage';
import { WellbeingPage } from '../components/parent/WellbeingPage';
import { SettingsPage } from '../components/parent/SettingsPage';

function PageShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <>
      <header className="bg-surface border-b border-line px-4 md:px-8 py-3 sticky top-0 z-10">
        <div className="max-w-4xl">
          <h1 className="text-ink font-bold text-base">{title}</h1>
          {subtitle && <p className="text-muted text-xs">{subtitle}</p>}
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
  return (
    <div className="flex min-h-screen bg-bg">
      <ParentSidebar />
      <div className="flex-1 flex flex-col min-w-0 md:ml-60">
        <AlphaBanner />
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
  );
}
