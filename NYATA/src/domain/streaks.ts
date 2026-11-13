import type { LocalDate } from './types';

export function trailingStreak(scheduledDates: LocalDate[], completedDates: Set<LocalDate>, today: LocalDate): number {
  let streak = 0;
  for (let i = scheduledDates.length - 1; i >= 0; i -= 1) {
    const date = scheduledDates[i];
    if (date > today) continue;
    if (!completedDates.has(date)) break;
    streak += 1;
  }
  return streak;
}

