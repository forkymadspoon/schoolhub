import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export interface ChildStats {
  streak: number;
  total_xp: number;
  recent_badge: { subject: string; tier: string } | null;
}

export function useStats(childId: string | null) {
  const [stats, setStats] = useState<ChildStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(() => {
    if (!childId) return;
    setLoading(true);
    void api
      .get<ChildStats>(`/children/${childId}/stats`)
      .then(setStats)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [childId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { stats, loading, refresh: fetch };
}
