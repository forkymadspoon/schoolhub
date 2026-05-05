import { useState, useEffect, useCallback } from 'react';
import type { WellbeingSignal } from '@schoolhub/types';
import { api } from '../services/api';

export function useWellbeing(childId: string | null) {
  const [signals, setSignals] = useState<WellbeingSignal[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(() => {
    if (!childId) return;
    setLoading(true);
    void api
      .get<{ signals: WellbeingSignal[] }>(`/children/${childId}/wellbeing`)
      .then((d) => setSignals(d.signals))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [childId]);

  useEffect(() => { refresh(); }, [refresh]);

  const acknowledge = async (
    signalId: string,
    action: 'accepted' | 'modified' | 'dismissed',
  ) => {
    await api.post(`/children/${childId}/wellbeing/${signalId}/ack`, { action });
    setSignals((prev) =>
      prev.map((s) =>
        s.id === signalId ? { ...s, acknowledgement: action, resolved_at: new Date().toISOString() } : s,
      ),
    );
  };

  return { signals, loading, acknowledge, refresh };
}
