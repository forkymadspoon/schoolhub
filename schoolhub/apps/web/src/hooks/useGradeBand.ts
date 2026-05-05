import { useMemo } from 'react';
import type { GradeLevel, GradeBand } from '@schoolhub/types';
import { gradeBandForLevel } from '@schoolhub/types';

export function useGradeBand(gradeLevel: GradeLevel): GradeBand {
  return useMemo(() => gradeBandForLevel(gradeLevel), [gradeLevel]);
}
