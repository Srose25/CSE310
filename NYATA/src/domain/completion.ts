import { parseDate } from './dates';
import type { Goal, LocalDate } from './types';

export type CompletionState = { completed: boolean; completedAt?: string };

export function completionNotBefore(goal: Goal, localDate: LocalDate): Date {
  const time = goal.schedule.dueTime ?? goal.schedule.startTime;
  const date = parseDate(localDate);
  if (!time) return date;
  const [hours, minutes] = time.split(':').map(Number);
  date.setUTCHours(hours, minutes, 0, 0);
  return date;
}

export function canComplete(goal: Goal, localDate: LocalDate, now: Date, state: CompletionState): boolean {
  return !state.completed && now.getTime() >= completionNotBefore(goal, localDate).getTime();
}

