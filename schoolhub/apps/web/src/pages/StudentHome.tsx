import { useEffect, useState } from 'react';
import { Routes, Route, useSearchParams } from 'react-router-dom';
import type { Child } from '@schoolhub/types';
import { api } from '../services/api';
import { StudentBottomNav } from '../components/student/StudentBottomNav';
import { StudentSidebar } from '../components/student/StudentSidebar';
import { DailyGoal } from '../components/student/DailyGoal';
import { StatsPage } from '../components/student/StatsPage';
import { StudentSettingsPage } from '../components/student/StudentSettingsPage';

function StudentShell({ child }: { child: Child }) {
  return (
    <div className="flex min-h-screen bg-bg">
      <StudentSidebar />
      <div className="flex-1 flex flex-col min-w-0 md:ml-60">
        <Routes>
          <Route path="/" element={<DailyGoal childId={child.id} senProfile={child.sen_profile} />} />
          <Route path="/stats" element={
            <div className="pb-24 md:pb-0">
              <header className="bg-surface border-b border-line px-4 md:px-8 py-3 sticky top-0 z-10">
                <div className="max-w-4xl">
                  <h1 className="text-ink font-bold text-base">Stats</h1>
                  <p className="text-muted text-xs">{child.name}</p>
                </div>
              </header>
              <main className="px-4 md:px-8 py-5 max-w-4xl"><StatsPage /></main>
            </div>
          } />
          <Route path="/settings" element={
            <div className="pb-24 md:pb-0">
              <header className="bg-surface border-b border-line px-4 md:px-8 py-3 sticky top-0 z-10">
                <div className="max-w-4xl">
                  <h1 className="text-ink font-bold text-base">Settings</h1>
                </div>
              </header>
              <main className="px-4 md:px-8 py-5 max-w-4xl"><StudentSettingsPage /></main>
            </div>
          } />
        </Routes>
        <StudentBottomNav />
      </div>
    </div>
  );
}

export function StudentHome() {
  const [searchParams] = useSearchParams();
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const idParam = searchParams.get('child');
    const load: Promise<Child> = idParam
      ? api.get<Child>(`/children/${idParam}`)
      : api.get<Child[]>('/children').then(list => {
          const first = list[0];
          if (!first) throw new Error('No children found');
          return first;
        });

    void load.then(setChild).catch(() => null).finally(() => setLoading(false));
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!child) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="card text-center max-w-xs w-full">
          <p className="text-ink font-semibold mb-1">No child profile found</p>
          <p className="text-muted text-sm">Complete onboarding first to set up a child profile.</p>
        </div>
      </div>
    );
  }

  return <StudentShell child={child} />;
}
