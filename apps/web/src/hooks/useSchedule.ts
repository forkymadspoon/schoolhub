import { useState, useEffect, useCallback } from 'react';
import type { StudySchedule } from '@schoolhub/types';
import { api } from '../services/api';

export interface ActiveScheduleResponse {
  schedule: StudySchedule;
  bites_this_week: { total: number; completed: number };
}

export function useSchedule(childId: string | null) {
  const [data, setData] = useState<ActiveScheduleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    if (!childId) return;
    setLoading(true);
    void api
      .get<ActiveScheduleResponse>(`/schedules/${childId}/active`)
      .then(d => { setData(d); setError(null); })
      .catch((e: unknown) => { setData(null); setError(String(e)); })
      .finally(() => setLoading(false));
  }, [childId]);

  useEffect(() => { fetch(); }, [fetch]);

  return {
    schedule: data?.schedule ?? null,
    bitesThisWeek: data?.bites_this_week ?? null,
    loading,
    error,
    refresh: fetch,
  };
}
