import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Child } from '@schoolhub/types';
import { api } from '../services/api';

export function useActiveChild() {
  const [searchParams] = useSearchParams();
  const [allChildren, setAllChildren] = useState<Child[]>([]);

  useEffect(() => {
    void api.get<Child[]>('/children').then(setAllChildren).catch(() => null);
  }, []);

  const childIdParam = searchParams.get('child');
  const activeChild = (childIdParam ? allChildren.find(c => c.id === childIdParam) : null)
    ?? allChildren[0]
    ?? null;

  return { activeChild, allChildren };
}
