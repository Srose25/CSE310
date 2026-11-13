import { addDays, dayDifference, monthDifference, parseDate } from './dates';
import type { LocalDate, RecurrenceRule } from './types';

const isInBounds = (date: LocalDate, from: LocalDate, through: LocalDate, rule: RecurrenceRule & { startDate?: LocalDate; endDate?: LocalDate }) =>
  date >= from && date <= through && (!rule.startDate || date >= rule.startDate) && (!rule.endDate || date <= rule.endDate);

export function generateOccurrenceDates(rule: RecurrenceRule & { startDate?: LocalDate; endDate?: LocalDate }, from: LocalDate, through: LocalDate): LocalDate[] {
  if (from > through) return [];
  const result: LocalDate[] = [];
  for (let date = from; date <= through; date = addDays(date, 1)) {
    const offset = rule.startDate ? dayDifference(rule.startDate, date) : 0;
    if (!isInBounds(date, from, through, rule) || offset < 0) continue;
    const parsed = parseDate(date);
    const weekdayBit = (parsed.getUTCDay() + 6) % 7;
    const matches = rule.kind === 'once'
      ? date === rule.startDate
      : rule.kind === 'daily'
        ? offset % rule.interval === 0
        : rule.kind === 'weekly'
          ? Math.floor(offset / 7) % rule.interval === 0 && !!(rule.weekdaysMask && (rule.weekdaysMask & (1 << weekdayBit)))
          : parsed.getUTCDate() === rule.monthDay && rule.startDate !== undefined && monthDifference(rule.startDate, date) % rule.interval === 0;
    if (matches) result.push(date);
  }
  return result;
}

