import { useState, useEffect, useCallback } from 'react';
import type { SiblingConflict, GradeLevel, Intensity } from '@schoolhub/types';
import { api } from '../services/api';
import { supabase } from '../services/supabase';
import { isoWeek, fmtDate } from '../lib/utils';

export interface DayEntry {
  date: string;
  intensity: Intensity;
  bite_count: number;
  total_minutes: number;
}

export interface ChildLane {
  child_id: string;
  name: string;
  grade_level: GradeLevel;
  daily: DayEntry[];
}

interface TimelineResponse {
  week: string;
  children: ChildLane[];
  conflicts: SiblingConflict[];
  load_balance_suggestions: string[];
}

function isoWeekToMonday(isoWeekStr: string): Date {
  const parts = isoWeekStr.split('-W');
  const year = parseInt(parts[0] ?? '0', 10);
  const week = parseInt(parts[1] ?? '1', 10);
  const jan4 = new Date(year, 0, 4);
  const jan4Day = (jan4.getDay() + 6) % 7;
  const mon = new Date(jan4);
  mon.setDate(jan4.getDate() - jan4Day + (week - 1) * 7);
  return mon;
}

export function useSiblingTimeline() {
  const [week, setWeek] = useState(() => isoWeek(new Date()));
  const [parentId, setParentId] = useState<string | null>(null);
  const [children, setChildren] = useState<ChildLane[]>([]);
  const [conflicts, setConflicts] = useState<SiblingConflict[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      setParentId(data.user?.id ?? null);
    });
  }, []);

  const fetchTimeline = useCallback(() => {
    if (!parentId) return;
    setLoading(true);
    void api
      .get<TimelineResponse>(`/households/${parentId}/timeline?week=${week}`)
      .then((d) => {
        setChildren(d.children);
        setConflicts(d.conflicts);
        setSuggestions(d.load_balance_suggestions);
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [parentId, week]);

  useEffect(() => { fetchTimeline(); }, [fetchTimeline]);

  const monday = isoWeekToMonday(week);
  const weekLabel = `Week of ${fmtDate(monday.toISOString().slice(0, 10))}`;

  const prevWeek = () => {
    const prev = new Date(monday);
    prev.setDate(prev.getDate() - 7);
    setWeek(isoWeek(prev));
  };

  const nextWeek = () => {
    const next = new Date(monday);
    next.setDate(next.getDate() + 7);
    setWeek(isoWeek(next));
  };

  return { children, conflicts, suggestions, loading, week, weekLabel, prevWeek, nextWeek };
}
