import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Child } from '@schoolhub/types';
import { api } from '../services/api';
import { DailyGoal } from '../components/student/DailyGoal';

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

    void load
      .then(setChild)
      .catch(() => null)
      .finally(() => setLoading(false));
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
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-muted text-sm">No child profile found.</p>
      </div>
    );
  }

  return <DailyGoal childId={child.id} senProfile={child.sen_profile} />;
}
