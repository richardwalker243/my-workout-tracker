import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { newId } from "@/lib/id";
import { loadAppData, saveAppData } from "@/storage";
import type {
  ActiveWorkout,
  AppData,
  CompletedWorkout,
  Exercise,
  Routine,
  RoutineExercise,
  WeightUnit,
  WorkoutEntry,
} from "@/types";

type Action =
  | { type: "saveRoutine"; routine: Routine }
  | { type: "deleteRoutine"; id: string }
  | { type: "ensureExercises"; exercises: Exercise[] }
  | { type: "startWorkout"; routine: Routine; exerciseNames: Map<string, string> }
  | { type: "updateActiveEntry"; index: number; patch: Partial<WorkoutEntry> }
  | { type: "finishWorkout" }
  | { type: "discardActiveWorkout" }
  | { type: "setWeightUnit"; unit: WeightUnit };

function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case "ensureExercises": {
      const byId = new Map(state.exercises.map((e) => [e.id, e]));
      for (const e of action.exercises) {
        byId.set(e.id, e);
      }
      return { ...state, exercises: [...byId.values()] };
    }
    case "saveRoutine": {
      const others = state.routines.filter((r) => r.id !== action.routine.id);
      return { ...state, routines: [...others, action.routine] };
    }
    case "deleteRoutine":
      return {
        ...state,
        routines: state.routines.filter((r) => r.id !== action.id),
      };
    case "startWorkout": {
      const entries: WorkoutEntry[] = action.routine.exercises.map((re) => ({
        exerciseId: re.exerciseId,
        displayName:
          action.exerciseNames.get(re.exerciseId) ?? "Unknown exercise",
        targetSets: re.targetSets,
        targetReps: re.targetReps,
        sessionMaxWeight: null,
        completed: false,
      }));
      const active: ActiveWorkout = {
        routineId: action.routine.id,
        routineNameSnapshot: action.routine.name,
        startedAt: new Date().toISOString(),
        entries,
      };
      return { ...state, activeWorkout: active };
    }
    case "updateActiveEntry": {
      if (!state.activeWorkout) return state;
      const entries = state.activeWorkout.entries.map((e, i) =>
        i === action.index ? { ...e, ...action.patch } : e,
      );
      return {
        ...state,
        activeWorkout: { ...state.activeWorkout, entries },
      };
    }
    case "finishWorkout": {
      if (!state.activeWorkout) return state;
      const completed: CompletedWorkout = {
        id: newId(),
        completedAt: new Date().toISOString(),
        routineId: state.activeWorkout.routineId,
        routineNameSnapshot: state.activeWorkout.routineNameSnapshot,
        entries: state.activeWorkout.entries.map((e) => ({ ...e })),
      };
      return {
        ...state,
        workouts: [...state.workouts, completed],
        activeWorkout: null,
      };
    }
    case "discardActiveWorkout":
      return { ...state, activeWorkout: null };
    case "setWeightUnit":
      return { ...state, weightUnit: action.unit };
    default:
      return state;
  }
}

type Ctx = {
  data: AppData;
  saveRoutine: (routine: Routine, catalogUpdates: Exercise[]) => void;
  deleteRoutine: (id: string) => void;
  startWorkout: (routine: Routine) => void;
  updateActiveEntry: (index: number, patch: Partial<WorkoutEntry>) => void;
  finishWorkout: () => void;
  discardActiveWorkout: () => void;
  setWeightUnit: (unit: WeightUnit) => void;
  exerciseNameById: (id: string) => string | undefined;
};

const AppStateContext = createContext<Ctx | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(reducer, undefined as unknown as AppData, () =>
    loadAppData(),
  );

  useEffect(() => {
    saveAppData(data);
  }, [data]);

  const exerciseNameById = useCallback(
    (id: string) => data.exercises.find((e) => e.id === id)?.name,
    [data.exercises],
  );

  const saveRoutine = useCallback((routine: Routine, catalogUpdates: Exercise[]) => {
    dispatch({ type: "ensureExercises", exercises: catalogUpdates });
    dispatch({ type: "saveRoutine", routine });
  }, []);

  const deleteRoutine = useCallback((id: string) => {
    dispatch({ type: "deleteRoutine", id });
  }, []);

  const startWorkout = useCallback(
    (routine: Routine) => {
      const exerciseNames = new Map<string, string>();
      for (const ex of routine.exercises) {
        exerciseNames.set(ex.exerciseId, exerciseNameById(ex.exerciseId) ?? "?");
      }
      dispatch({ type: "startWorkout", routine, exerciseNames });
    },
    [exerciseNameById],
  );

  const updateActiveEntry = useCallback((index: number, patch: Partial<WorkoutEntry>) => {
    dispatch({ type: "updateActiveEntry", index, patch });
  }, []);

  const finishWorkout = useCallback(() => {
    dispatch({ type: "finishWorkout" });
  }, []);

  const discardActiveWorkout = useCallback(() => {
    dispatch({ type: "discardActiveWorkout" });
  }, []);

  const setWeightUnit = useCallback((unit: WeightUnit) => {
    dispatch({ type: "setWeightUnit", unit });
  }, []);

  const value = useMemo(
    () => ({
      data,
      saveRoutine,
      deleteRoutine,
      startWorkout,
      updateActiveEntry,
      finishWorkout,
      discardActiveWorkout,
      setWeightUnit,
      exerciseNameById,
    }),
    [
      data,
      saveRoutine,
      deleteRoutine,
      startWorkout,
      updateActiveEntry,
      finishWorkout,
      discardActiveWorkout,
      setWeightUnit,
      exerciseNameById,
    ],
  );

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState(): Ctx {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState outside provider");
  return ctx;
}

export type { RoutineExercise };
