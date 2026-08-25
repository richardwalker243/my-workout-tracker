export type Exercise = {
  id: string;
  name: string;
};

export type RoutineExercise = {
  exerciseId: string;
  targetSets: number;
  targetReps: number;
};

export type Routine = {
  id: string;
  name: string;
  exercises: RoutineExercise[];
};

/** One or more sets at the same weight, sharing a single optional RPE (1–10). */
export type SessionWeightGroup = {
  weight: number;
  sets: number;
  rpe: number | null;
};

export type WorkoutEntry = {
  exerciseId: string;
  displayName: string;
  targetSets: number;
  targetReps: number;
  /** Logged weight groups for this exercise (preferred). */
  weightGroups: SessionWeightGroup[];
  /**
   * Legacy single max from before weight groups. Prefer `weightGroups`;
   * kept optional so older localStorage payloads still parse.
   */
  sessionMaxWeight?: number | null;
  completed: boolean;
};

export type CompletedWorkout = {
  id: string;
  completedAt: string;
  routineId: string;
  routineNameSnapshot: string;
  entries: WorkoutEntry[];
};

export type ActiveWorkout = {
  routineId: string;
  routineNameSnapshot: string;
  startedAt: string;
  entries: WorkoutEntry[];
};

export type WeightUnit = "kg" | "lb";

export type AppData = {
  exercises: Exercise[];
  routines: Routine[];
  workouts: CompletedWorkout[];
  activeWorkout: ActiveWorkout | null;
  weightUnit: WeightUnit;
};
