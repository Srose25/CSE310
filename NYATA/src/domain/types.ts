export type LocalDate = `${number}-${number}-${number}`;
export type RecurrenceKind = 'once' | 'daily' | 'weekly' | 'monthly';

export type RecurrenceRule = {
  kind: RecurrenceKind;
  interval: number;
  weekdaysMask?: number;
  monthDay?: number;
};

export type GoalSchedule = RecurrenceRule & {
  startDate: LocalDate;
  endDate?: LocalDate;
  startTime?: string;
  dueTime?: string;
  timezoneId: string;
};

export type Goal = { id: string; title: string; xpValue: number; schedule: GoalSchedule };

