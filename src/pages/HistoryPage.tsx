import { useMemo, useState } from "react";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import { CopySummaryButton } from "@/components/CopySummaryButton";
import { entrySessionMaxWeight } from "@/lib/workoutEntry";
import { workoutSummary } from "@/lib/workoutStats";
import { useAppState } from "@/state";
import type { CompletedWorkout } from "@/types";

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function HistoryPage() {
  const { data } = useAppState();
  const [selected, setSelected] = useState<CompletedWorkout | null>(null);

  const sorted = useMemo(
    () =>
      [...data.workouts].sort(
        (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
      ),
    [data.workouts],
  );

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-400">Completed workouts on this device</p>

      {sorted.length > 0 && <ActivityHeatmap workouts={data.workouts} />}

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-4 py-10 text-center text-slate-500">
          No workouts yet. Finish one from the Workout tab.
        </div>
      ) : (
        <ul className="space-y-2">
          {sorted.map((w) => (
            <li key={w.id}>
              <button
                type="button"
                onClick={() => setSelected(w)}
                className="flex w-full flex-col items-start gap-1 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-4 text-left transition-colors hover:border-slate-700 hover:bg-slate-900"
              >
                <span className="font-medium text-white">{w.routineNameSnapshot}</span>
                <span className="text-sm text-slate-500">{formatWhen(w.completedAt)}</span>
                <span className="text-xs text-slate-600">{workoutSummary(w)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="history-dialog-title"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="history-dialog-title" className="text-lg font-semibold text-white">
                  {selected.routineNameSnapshot}
                </h2>
                <p className="mt-1 text-sm text-slate-500">{formatWhen(selected.completedAt)}</p>
              </div>
              <CopySummaryButton workout={selected} weightUnit={data.weightUnit} />
            </div>
            <ul className="mt-4 space-y-3">
              {selected.entries.map((e, i) => {
                const max = entrySessionMaxWeight(e);
                return (
                  <li
                    key={`${e.exerciseId}-${i}`}
                    className="rounded-xl border border-slate-800/80 bg-slate-900/40 px-3 py-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-200">{e.displayName}</p>
                        <p className="text-xs text-slate-500">
                          Target {e.targetSets}×{e.targetReps}
                          {e.completed ? " · done" : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Max</p>
                        <p className="font-mono text-base text-white">
                          {max != null ? `${max} ${data.weightUnit}` : "—"}
                        </p>
                      </div>
                    </div>
                    {e.weightGroups.length > 0 && (
                      <ul className="mt-2 space-y-1 border-t border-slate-800/80 pt-2">
                        {e.weightGroups.map((g, gi) => (
                          <li
                            key={`${g.weight}-${g.sets}-${gi}`}
                            className="text-xs text-slate-400"
                          >
                            {g.sets}x{e.targetReps} · {g.weight}
                            {data.weightUnit}
                            {g.rpe != null ? ` · RPE${g.rpe}` : ""}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mt-6 w-full rounded-xl bg-slate-800 py-3 text-sm font-medium text-white hover:bg-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
