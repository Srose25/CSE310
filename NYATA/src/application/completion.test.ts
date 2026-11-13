import { completeOccurrence } from './completion';
import type { Goal } from '@/src/domain/types';

const goal: Goal = { id: 'g', title: 'Walk', xpValue: 20, schedule: { kind: 'once', interval: 1, startDate: '2026-01-01', timezoneId: 'UTC' } };
it('awards XP through one completion operation', async () => {
  const writes: unknown[] = [];
  const result = await completeOccurrence({ getGoalAndCompletion: async () => ({ goal, localDate: '2026-01-01' as const }), insertCompletionAndXp: async record => { writes.push(record); } }, 'o1', new Date('2026-01-01T00:00:00Z'));
  expect(result).toEqual({ awardedXp: 20, alreadyCompleted: false });
  expect(writes).toHaveLength(1);
});

