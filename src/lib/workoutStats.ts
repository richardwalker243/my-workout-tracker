import { entryHasWeight, entrySessionMaxWeight } from "@/lib/workoutEntry";
import type { CompletedWorkout } from "@/types";

/**
 * Up to `limit` prior session max weights for an exercise before `beforeIso` (exclusive).
 * Returned oldest → newest so the row reads chronologically.
 */
export function recentMaxWeightsForExercise(
  exerciseId: string,
  workouts: CompletedWorkout[],
  beforeIso: string,
  limit = 5,
): number[] {
  const sorted = [...workouts].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );
  const cutoff = new Date(beforeIso).getTime();
  const newestFirst: number[] = [];
  for (const w of sorted) {
    if (new Date(w.completedAt).getTime() >= cutoff) continue;
    const entry = w.entries.find((e) => e.exerciseId === exerciseId);
    if (!entry) continue;
    const max = entrySessionMaxWeight(entry);
    if (max != null) {
      newestFirst.push(max);
      if (newestFirst.length >= limit) break;
    }
  }
  return newestFirst.reverse();
}

export type ExerciseOccurrence = {
  workoutId: string;
  completedAt: string;
  routineName: string;
  sessionMaxWeight: number | null;
  completed: boolean;
};

export function occurrencesForExercise(
  exerciseId: string,
  workouts: CompletedWorkout[],
): ExerciseOccurrence[] {
  const list: ExerciseOccurrence[] = [];
  const sorted = [...workouts].sort(
    (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime(),
  );
  for (const w of sorted) {
    const entry = w.entries.find((e) => e.exerciseId === exerciseId);
    if (!entry) continue;
    list.push({
      workoutId: w.id,
      completedAt: w.completedAt,
      routineName: w.routineNameSnapshot,
      sessionMaxWeight: entrySessionMaxWeight(entry),
      completed: entry.completed,
    });
  }
  return list;
}

export function workoutSummary(w: CompletedWorkout): string {
  const withWeight = w.entries.filter((e) => entryHasWeight(e)).length;
  const done = w.entries.filter((e) => e.completed).length;
  return `${done}/${w.entries.length} exercises · ${withWeight} with weight`;
}
