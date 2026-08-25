import { normalizeWorkoutEntry } from "@/lib/workoutEntry";
import type { ActiveWorkout, AppData, CompletedWorkout } from "@/types";

const KEY = "workout-tracker-v1";

const defaultData: AppData = {
  exercises: [],
  routines: [],
  workouts: [],
  activeWorkout: null,
  weightUnit: "kg",
};

function normalizeCompletedWorkout(raw: unknown): CompletedWorkout | null {
  if (!raw || typeof raw !== "object") return null;
  const w = raw as Record<string, unknown>;
  if (typeof w.id !== "string" || typeof w.completedAt !== "string") return null;
  if (typeof w.routineId !== "string" || typeof w.routineNameSnapshot !== "string") return null;
  if (!Array.isArray(w.entries)) return null;
  const entries = w.entries
    .map(normalizeWorkoutEntry)
    .filter((e): e is NonNullable<typeof e> => e != null);
  return {
    id: w.id,
    completedAt: w.completedAt,
    routineId: w.routineId,
    routineNameSnapshot: w.routineNameSnapshot,
    entries,
  };
}

function normalizeActiveWorkout(raw: unknown): ActiveWorkout | null {
  if (!raw || typeof raw !== "object") return null;
  const w = raw as Record<string, unknown>;
  if (typeof w.routineId !== "string" || typeof w.routineNameSnapshot !== "string") return null;
  if (typeof w.startedAt !== "string" || !Array.isArray(w.entries)) return null;
  const entries = w.entries
    .map(normalizeWorkoutEntry)
    .filter((e): e is NonNullable<typeof e> => e != null);
  return {
    routineId: w.routineId,
    routineNameSnapshot: w.routineNameSnapshot,
    startedAt: w.startedAt,
    entries,
  };
}

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaultData };
    const parsed = JSON.parse(raw) as Partial<AppData>;
    const workouts = Array.isArray(parsed.workouts)
      ? parsed.workouts
          .map(normalizeCompletedWorkout)
          .filter((w): w is CompletedWorkout => w != null)
      : [];
    return {
      exercises: Array.isArray(parsed.exercises) ? parsed.exercises : [],
      routines: Array.isArray(parsed.routines) ? parsed.routines : [],
      workouts,
      activeWorkout: normalizeActiveWorkout(parsed.activeWorkout),
      weightUnit: parsed.weightUnit === "lb" ? "lb" : "kg",
    };
  } catch {
    return { ...defaultData };
  }
}

export function saveAppData(data: AppData): void {
  localStorage.setItem(KEY, JSON.stringify(data));
}
