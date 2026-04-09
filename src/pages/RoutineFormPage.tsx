import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { newId } from "@/lib/id";
import { useAppState } from "@/state";
import type { Exercise, Routine, RoutineExercise } from "@/types";

type Row = {
  exerciseId: string;
  name: string;
  targetSets: number;
  targetReps: number;
};

function routineToRows(routine: Routine, exercises: Exercise[]): Row[] {
  const nameById = new Map(exercises.map((e) => [e.id, e.name]));
  return routine.exercises.map((re) => ({
    exerciseId: re.exerciseId,
    name: nameById.get(re.exerciseId) ?? "",
    targetSets: re.targetSets,
    targetReps: re.targetReps,
  }));
}

export function RoutineFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, saveRoutine, deleteRoutine } = useAppState();

  const existing = id ? data.routines.find((r) => r.id === id) : undefined;

  const [routineName, setRoutineName] = useState("");
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (existing) {
      setRoutineName(existing.name);
      setRows(routineToRows(existing, data.exercises));
    } else if (!id) {
      setRoutineName("");
      setRows([]);
    }
  }, [existing, id, data.exercises]);

  const catalogByName = useMemo(() => {
    const m = new Map<string, Exercise>();
    for (const e of data.exercises) {
      m.set(e.name.trim().toLowerCase(), e);
    }
    return m;
  }, [data.exercises]);

  if (id && !existing) {
    return (
      <div className="space-y-4">
        <Link
          to="/routines"
          className="inline-block rounded-lg px-2 py-1 text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200"
        >
          Back to routines
        </Link>
        <p className="text-slate-400">This routine could not be found.</p>
      </div>
    );
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      { exerciseId: newId(), name: "", targetSets: 3, targetReps: 8 },
    ]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function moveRow(index: number, dir: -1 | 1) {
    setRows((prev) => {
      const next = [...prev];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  }

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const name = routineName.trim();
    if (!name) return;

    const catalogUpdates: Exercise[] = [];
    const routineExercises: RoutineExercise[] = [];

    for (const row of rows) {
      const n = row.name.trim();
      if (!n) continue;
      const key = n.toLowerCase();
      const match = catalogByName.get(key);
      const exerciseId = match?.id ?? row.exerciseId;
      catalogUpdates.push({ id: exerciseId, name: n });
      routineExercises.push({
        exerciseId,
        targetSets: Math.max(1, row.targetSets),
        targetReps: Math.max(1, row.targetReps),
      });
    }

    if (routineExercises.length === 0) return;

    const routine: Routine = {
      id: existing?.id ?? newId(),
      name,
      exercises: routineExercises,
    };

    const merged = new Map(data.exercises.map((x) => [x.id, x]));
    for (const u of catalogUpdates) {
      merged.set(u.id, u);
    }
    saveRoutine(routine, [...merged.values()]);
    navigate("/routines");
  }

  function handleDelete() {
    if (!existing) return;
    if (!confirm("Delete this routine? Past workouts stay in history.")) return;
    deleteRoutine(existing.id);
    navigate("/routines");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/routines"
          className="rounded-lg px-2 py-1 text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200"
        >
          Back
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Routine name</label>
          <input
            value={routineName}
            onChange={(e) => setRoutineName(e.target.value)}
            placeholder="e.g. Arm day"
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-base text-white placeholder:text-slate-600 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            required
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">Exercises</span>
            <button
              type="button"
              onClick={addRow}
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-medium text-orange-400 hover:bg-slate-700"
            >
              Add exercise
            </button>
          </div>

          {rows.length === 0 ? (
            <p className="text-sm text-slate-500">Add at least one exercise with sets and reps.</p>
          ) : (
            <ul className="space-y-3">
              {rows.map((row, index) => (
                <li
                  key={`${row.exerciseId}-${index}`}
                  className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-3"
                >
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      aria-label="Move up"
                      onClick={() => moveRow(index, -1)}
                      className="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-400 hover:bg-slate-800"
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      aria-label="Move down"
                      onClick={() => moveRow(index, 1)}
                      className="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-400 hover:bg-slate-800"
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="ml-auto rounded-lg px-2 py-1 text-xs text-red-400 hover:bg-red-950/50"
                    >
                      Remove
                    </button>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-500">Exercise name</label>
                    <input
                      list="exercise-suggestions"
                      value={row.name}
                      onChange={(e) => updateRow(index, { name: e.target.value })}
                      placeholder="Bench press"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-base text-white placeholder:text-slate-600 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs text-slate-500">Sets</label>
                      <input
                        type="number"
                        min={1}
                        value={row.targetSets}
                        onChange={(e) =>
                          updateRow(index, { targetSets: Number(e.target.value) || 1 })
                        }
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-base text-white focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-slate-500">Reps</label>
                      <input
                        type="number"
                        min={1}
                        value={row.targetReps}
                        onChange={(e) =>
                          updateRow(index, { targetReps: Number(e.target.value) || 1 })
                        }
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-base text-white focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <datalist id="exercise-suggestions">
          {data.exercises.map((ex) => (
            <option key={ex.id} value={ex.name} />
          ))}
        </datalist>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            className="rounded-xl bg-orange-500 px-5 py-3 text-base font-semibold text-slate-950 hover:bg-orange-400"
          >
            Save routine
          </button>
          {existing && (
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-xl border border-red-900/60 px-5 py-3 text-base font-medium text-red-400 hover:bg-red-950/40"
            >
              Delete routine
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
