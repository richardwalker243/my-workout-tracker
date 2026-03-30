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

export type WorkoutEntry = {
  exerciseId: string;
  displayName: string;
  targetSets: number;
  targetReps: number;
  sessionMaxWeight: number | null;
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
