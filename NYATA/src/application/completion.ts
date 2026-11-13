import { canComplete } from '@/src/domain/completion';
import type { Goal, LocalDate } from '@/src/domain/types';

export type CompletionRecord = { occurrenceId: string; completedAt: string; xpValue: number };

export type CompletionRepository = {
  getGoalAndCompletion(occurrenceId: string): Promise<{ goal: Goal; localDate: LocalDate; completion?: CompletionRecord }>;
  insertCompletionAndXp(record: CompletionRecord): Promise<void>;
};

export async function completeOccurrence(repo: CompletionRepository, occurrenceId: string, now: Date): Promise<{ awardedXp: number; alreadyCompleted: boolean }> {
  const found = await repo.getGoalAndCompletion(occurrenceId);
  if (found.completion) return { awardedXp: 0, alreadyCompleted: true };
  if (!canComplete(found.goal, found.localDate, now, { completed: false })) throw new Error('This goal is not ready to complete yet.');
  const record = { occurrenceId, completedAt: now.toISOString(), xpValue: found.goal.xpValue };
  await repo.insertCompletionAndXp(record);
  return { awardedXp: record.xpValue, alreadyCompleted: false };
}

