import { generateOccurrenceDates } from './recurrence';

describe('generateOccurrenceDates', () => {
  it('generates daily intervals within bounds', () => {
    expect(generateOccurrenceDates({ kind: 'daily', interval: 2, startDate: '2026-01-01' }, '2026-01-01', '2026-01-05')).toEqual(['2026-01-01', '2026-01-03', '2026-01-05']);
  });
  it('skips invalid monthly dates', () => {
    expect(generateOccurrenceDates({ kind: 'monthly', interval: 1, monthDay: 31, startDate: '2026-01-01' }, '2026-02-01', '2026-03-31')).toEqual(['2026-03-31']);
  });
});

