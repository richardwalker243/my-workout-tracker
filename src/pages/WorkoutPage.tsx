import { useMemo } from "react";
import { Link } from "react-router-dom";
import { lastMaxWeightForExercise } from "@/lib/workoutStats";
import { useAppState } from "@/state";

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function WorkoutPage() {
  const { data, startWorkout, updateActiveEntry, finishWorkout, discardActiveWorkout } =
    useAppState();

  const sortedRoutines = useMemo(
    () => [...data.routines].sort((a, b) => a.name.localeCompare(b.name)),
    [data.routines],
  );

  const active = data.activeWorkout;

  if (active) {
    return (
      <div className="space-y-4 pb-28">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">In progress</p>
          <p className="text-lg font-semibold text-white">{active.routineNameSnapshot}</p>
          <p className="text-sm text-slate-500">Started {formatWhen(active.startedAt)}</p>
        </div>

        <ul className="space-y-3">
          {active.entries.map((entry, index) => {
            const lastMax = lastMaxWeightForExercise(
              entry.exerciseId,
              data.workouts,
              active.startedAt,
            );
            return (
              <li
                key={`${entry.exerciseId}-${index}`}
                className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-base font-semibold text-white">{entry.displayName}</h2>
                    <p className="text-sm text-slate-500">
                      Target {entry.targetSets}×{entry.targetReps}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-slate-300 shrink-0">
                    <input
                      type="checkbox"
                      checked={entry.completed}
                      onChange={(e) =>
                        updateActiveEntry(index, { completed: e.target.checked })
                      }
                      className="h-5 w-5 rounded border-slate-600 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                    />
                    Done
                  </label>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-950/80 px-3 py-2">
                    <p className="text-xs text-slate-500">Last time max ({data.weightUnit})</p>
                    <p className="text-lg font-medium text-slate-200">
                      {lastMax != null ? lastMax : "—"}
                    </p>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-500">
                      Today max ({data.weightUnit})
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="0.5"
                      inputMode="decimal"
                      placeholder="0"
                      value={entry.sessionMaxWeight ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        updateActiveEntry(index, {
                          sessionMaxWeight: v === "" ? null : Number(v),
                        });
                      }}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-base text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-800 bg-slate-950/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur">
          <div className="mx-auto flex max-w-lg flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                if (confirm("Discard this workout? Nothing will be saved.")) {
                  discardActiveWorkout();
                }
              }}
              className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={() => {
                finishWorkout();
              }}
              className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 text-base font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Finish & save workout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">Pick a routine and log max weight as you go.</p>

      {sortedRoutines.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-4 py-8 text-center text-slate-500">
          <p className="mb-3">Create a routine first.</p>
          <Link
            to="/routines/new"
            className="font-medium text-emerald-400 hover:text-emerald-300"
          >
            New routine
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {sortedRoutines.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => startWorkout(r)}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-4 text-left transition-colors hover:border-emerald-900/50 hover:bg-slate-900"
              >
                <span className="font-medium text-white">{r.name}</span>
                <span className="text-sm text-emerald-500">Start</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
