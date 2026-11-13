import { canComplete } from './completion';
import type { Goal } from './types';

const goal: Goal = { id: 'g', title: 'Read', xpValue: 10, schedule: { kind: 'once', interval: 1, startDate: '2026-01-01', dueTime: '09:00', timezoneId: 'UTC' } };
describe('completion eligibility', () => {
  it('blocks before due time and allows at due time', () => {
    expect(canComplete(goal, '2026-01-01', new Date('2026-01-01T08:59:00Z'), { completed: false })).toBe(false);
    expect(canComplete(goal, '2026-01-01', new Date('2026-01-01T09:00:00Z'), { completed: false })).toBe(true);
  });
  it('is idempotent for completed state', () => expect(canComplete(goal, '2026-01-01', new Date('2026-01-01T10:00:00Z'), { completed: true })).toBe(false));
});

