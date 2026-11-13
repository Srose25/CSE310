import type { GoalSchedule } from './types';

export function validateGoal(input: { title: string; xpValue: number; schedule: GoalSchedule }): string[] {
  const errors: string[] = [];
  if (!input.title.trim() || input.title.trim().length > 120) errors.push('Title must be between 1 and 120 characters.');
  if (!Number.isInteger(input.xpValue) || input.xpValue <= 0) errors.push('XP must be a positive whole number.');
  if (input.schedule.endDate && input.schedule.endDate < input.schedule.startDate) errors.push('End date must be on or after the start date.');
  if (input.schedule.kind === 'weekly' && !input.schedule.weekdaysMask) errors.push('Choose at least one weekday.');
  if (input.schedule.kind === 'monthly' && (!input.schedule.monthDay || input.schedule.monthDay < 1 || input.schedule.monthDay > 31)) errors.push('Choose a valid month day.');
  return errors;
}

