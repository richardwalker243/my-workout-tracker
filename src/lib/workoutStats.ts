import type { CompletedWorkout } from "@/types";

/** Latest session max weight for an exercise before `beforeIso` (exclusive), scanning completed workouts newest-first. */
export function lastMaxWeightForExercise(
  exerciseId: string,
  workouts: CompletedWorkout[],
  beforeIso: string,
): number | null {
  const sorted = [...workouts].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );
  const cutoff = new Date(beforeIso).getTime();
  for (const w of sorted) {
    if (new Date(w.completedAt).getTime() >= cutoff) continue;
    const entry = w.entries.find((e) => e.exerciseId === exerciseId);
    if (entry && entry.sessionMaxWeight != null) {
      return entry.sessionMaxWeight;
    }
  }
  return null;
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
      sessionMaxWeight: entry.sessionMaxWeight,
      completed: entry.completed,
    });
  }
  return list;
}

export function workoutSummary(w: CompletedWorkout): string {
  const withWeight = w.entries.filter((e) => e.sessionMaxWeight != null).length;
  const done = w.entries.filter((e) => e.completed).length;
  return `${done}/${w.entries.length} exercises · ${withWeight} with weight`;
}
