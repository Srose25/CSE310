import type { LocalDate } from './types';

export const parseDate = (date: LocalDate): Date => {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

export const formatDate = (date: Date): LocalDate =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}` as LocalDate;

export const addDays = (date: LocalDate, days: number): LocalDate => {
  const next = parseDate(date);
  next.setUTCDate(next.getUTCDate() + days);
  return formatDate(next);
};

export const dayDifference = (from: LocalDate, to: LocalDate) =>
  Math.round((parseDate(to).getTime() - parseDate(from).getTime()) / 86400000);

export const monthDifference = (from: LocalDate, to: LocalDate) => {
  const a = parseDate(from);
  const b = parseDate(to);
  return (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + b.getUTCMonth() - a.getUTCMonth();
};

