import type { AppData } from "@/types";

const KEY = "workout-tracker-v1";

const defaultData: AppData = {
  exercises: [],
  routines: [],
  workouts: [],
  activeWorkout: null,
  weightUnit: "kg",
};

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaultData };
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return {
      exercises: Array.isArray(parsed.exercises) ? parsed.exercises : [],
      routines: Array.isArray(parsed.routines) ? parsed.routines : [],
      workouts: Array.isArray(parsed.workouts) ? parsed.workouts : [],
      activeWorkout: parsed.activeWorkout ?? null,
      weightUnit: parsed.weightUnit === "lb" ? "lb" : "kg",
    };
  } catch {
    return { ...defaultData };
  }
}

export function saveAppData(data: AppData): void {
  localStorage.setItem(KEY, JSON.stringify(data));
}
