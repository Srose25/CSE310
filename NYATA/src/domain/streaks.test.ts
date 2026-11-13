import { trailingStreak } from './streaks';
describe('trailingStreak', () => {
  it('ignores future dates and counts completed trailing schedules', () => {
    expect(trailingStreak(['2026-01-01', '2026-01-03', '2026-01-05', '2026-01-07'], new Set(['2026-01-03', '2026-01-05']), '2026-01-06')).toBe(2);
  });
});

