import { Routes, Route, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useEffect, useState, type ReactNode } from 'react';
import { ParentBottomNav } from '../components/parent/ParentBottomNav';
import { ParentSidebar } from '../components/parent/ParentSidebar';
import { Dashboard } from '../components/parent/Dashboard';
import { PlanPage } from '../components/parent/PlanPage';
import { ProgressPage } from '../components/parent/ProgressPage';
import { WellbeingPage } from '../components/parent/WellbeingPage';
import { SettingsPage } from '../components/parent/SettingsPage';
import { ExamCountdownWidget } from '../components/shared/ExamCountdownWidget';
import { ChildSwitcherDropdown, CHILD_EMOJIS } from '../components/parent/ChildSwitcherDropdown';
import { NotificationSettings } from '../components/parent/NotificationSettings';
import { useActiveChild } from '../hooks/useActiveChild';
import { useWellbeing } from '../hooks/useWellbeing';
import { api } from '../services/api';
import type { Child } from '@schoolhub/types';
import BellIcon from '../assets/icons/interface/bell.svg?react';

// ── Shared App Header ─────────────────────────────────────────────────────────

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function AppHeader({ isHome, pageTitle }: { isHome: boolean; pageTitle: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeChild, allChildren } = useActiveChild();
  const { signals } = useWellbeing(activeChild?.id ?? null);
  const openSignals = signals.filter(s => !s.resolved_at).length;
  const [showNotifSettings, setShowNotifSettings] = useState(false);

  function handleChildSwitch(id: string) {
    const params = new URLSearchParams(searchParams);
    params.set('child', id);
    setSearchParams(params, { replace: true });
  }

  return (
    <>
      {/* Mobile header */}
      <header className="md:hidden bg-surface border-b border-line px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <img src="/logo.svg" alt="SchoolHub" className="w-32 h-auto" />
        <button
          type="button"
          onClick={() => setShowNotifSettings(true)}
          className="relative w-7 h-7 rounded-full flex items-center justify-center hover:bg-primary-soft/40 transition-colors"
          aria-label="Notifications"
        >
          <BellIcon className="w-3.5 h-3.5 text-muted" />
          {openSignals > 0 && (
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-game-orange border border-surface" />
          )}
        </button>
      </header>

      {/* Desktop header */}
      <header className="hidden md:flex items-center justify-between px-8 border-b border-line bg-surface sticky top-0 z-10 h-[90px]">
        <div className="flex flex-col gap-1.5">
          {isHome && (
            <p className="text-muted text-xs">
              {new Date().toLocaleDateString('en-SG', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          )}
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-ink font-bold text-xl">
              {isHome ? greeting() : pageTitle}
            </h1>
            <ChildSwitcherDropdown
              allChildren={allChildren}
              activeChild={activeChild}
              onSwitch={handleChildSwitch}
              onAddChild={() => navigate('/onboarding', { state: { from: location.pathname } })}
            />
            {activeChild && (
              <ExamCountdownWidget childId={activeChild.id} gradeLevel={activeChild.grade_level} />
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowNotifSettings(true)}
          className="relative w-7 h-7 rounded-full flex items-center justify-center hover:bg-primary-soft/40 transition-colors"
          aria-label="Notifications"
        >
          <BellIcon className="w-3.5 h-3.5 text-muted" />
          {openSignals > 0 && (
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-game-orange border border-surface" />
          )}
        </button>
      </header>

      {/* Mobile child pills */}
      <div className="md:hidden flex items-center gap-2 flex-wrap px-4 pt-3">
        {allChildren.map((child, i) => (
          <button
            key={child.id}
            type="button"
            onClick={() => handleChildSwitch(child.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-sm font-semibold transition-colors ${
              activeChild?.id === child.id
                ? 'bg-primary text-white'
                : 'bg-primary-soft text-primary hover:bg-primary/20'
            }`}
          >
            <span>{CHILD_EMOJIS[i % CHILD_EMOJIS.length]}</span>
            <span>{child.name} {child.grade_level}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => navigate('/onboarding', { state: { from: location.pathname } })}
          className="flex items-center gap-1 px-3 py-1.5 rounded-pill text-sm font-semibold border border-dashed border-line text-muted hover:border-primary hover:text-primary transition-colors min-h-0"
        >
          + Add child
        </button>
      </div>

      {showNotifSettings && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40"
          onClick={() => setShowNotifSettings(false)}
        >
          <div
            className="bg-surface rounded-t-card sm:rounded-card shadow-card w-full max-w-lg mx-0 sm:mx-4 p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-ink font-semibold text-lg">Notification settings</h2>
              <button type="button" onClick={() => setShowNotifSettings(false)}
                className="text-muted hover:text-ink text-xl" aria-label="Close">×</button>
            </div>
            <NotificationSettings />
          </div>
        </div>
      )}
    </>
  );
}

// ── Page Shell (inner pages — no own header, just main wrapper) ───────────────

function PageShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="px-4 md:px-8 py-5 pb-24 md:pb-8 max-w-4xl">
      {children}
    </main>
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

  const PAGE_TITLES: Record<string, string> = {
    '/': '',          // home — shows greeting instead
    '/plan': 'Plan',
    '/progress': 'Progress',
    '/wellbeing': 'Wellbeing',
    '/settings': 'Settings',
  };
  const pageTitle = PAGE_TITLES[location.pathname] ?? '';
  const isHome = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <AlphaBanner />
      <div className="flex flex-1">
        <ParentSidebar />
        <div className="flex-1 flex flex-col min-w-0 md:ml-60">
          <AppHeader isHome={isHome} pageTitle={pageTitle} />

          <Routes>
            <Route path="/" element={<Dashboard />} />

            <Route path="/plan" element={
              <PageShell title="Plan">
                <PlanPage />
              </PageShell>
            } />

            <Route path="/progress" element={
              <PageShell title="Progress">
                <ProgressPage />
              </PageShell>
            } />

            <Route path="/wellbeing" element={
              <PageShell title="Wellbeing">
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
