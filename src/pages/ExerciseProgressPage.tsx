import { useMemo, useState } from "react";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { occurrencesForExercise } from "@/lib/workoutStats";
import { useAppState } from "@/state";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
);

function formatShort(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function ExerciseProgressPage() {
  const { data } = useAppState();
  const [exerciseId, setExerciseId] = useState<string | null>(null);

  const exercisesSorted = useMemo(
    () => [...data.exercises].sort((a, b) => a.name.localeCompare(b.name)),
    [data.exercises],
  );

  const selected = exerciseId ? data.exercises.find((e) => e.id === exerciseId) : undefined;
  const occurrences = selected
    ? occurrencesForExercise(selected.id, data.workouts)
    : [];

  const chartPoints = occurrences.filter((o) => o.sessionMaxWeight != null);

  const chartData = useMemo(() => {
    return {
      labels: chartPoints.map((o) => formatShort(o.completedAt)),
      datasets: [
        {
          label: `Max (${data.weightUnit})`,
          data: chartPoints.map((o) => o.sessionMaxWeight as number),
          borderColor: "rgb(52, 211, 153)",
          backgroundColor: "rgba(52, 211, 153, 0.15)",
          tension: 0.25,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [chartPoints, data.weightUnit]);

  const chartOptions: ChartOptions<"line"> = useMemo(() => {
    const points = chartPoints;
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => {
              const i = items[0]?.dataIndex;
              if (i == null) return "";
              const o = points[i];
              return o ? new Date(o.completedAt).toLocaleString() : "";
            },
          },
        },
      },
      scales: {
        x: {
          ticks: { color: "#94a3b8", maxRotation: 45, minRotation: 0 },
          grid: { color: "rgba(51, 65, 85, 0.5)" },
        },
        y: {
          ticks: { color: "#94a3b8" },
          grid: { color: "rgba(51, 65, 85, 0.5)" },
          title: {
            display: true,
            text: data.weightUnit,
            color: "#64748b",
          },
        },
      },
    };
  }, [chartPoints, data.weightUnit]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Pick an exercise to see past sessions and a progress chart.
      </p>

      {exercisesSorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-4 py-8 text-center text-slate-500">
          Exercises appear here after you add them to a routine.
        </div>
      ) : (
        <>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Exercise</label>
            <select
              value={exerciseId ?? ""}
              onChange={(e) => setExerciseId(e.target.value || null)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-base text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="">Select…</option>
              {exercisesSorted.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
          </div>

          {selected && (
            <>
              {occurrences.length === 0 ? (
                <p className="text-sm text-slate-500">No logged sessions for this exercise yet.</p>
              ) : (
                <>
                  <div className="h-56 w-full rounded-2xl border border-slate-800 bg-slate-900/40 p-3">
                    {chartPoints.length >= 2 ? (
                      <Line data={chartData} options={chartOptions} />
                    ) : (
                      <p className="flex h-full items-center justify-center text-center text-sm text-slate-500 px-4">
                        Chart needs at least two sessions with a max weight logged.
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="mb-2 text-sm font-medium text-slate-300">History</h3>
                    <ul className="space-y-2">
                      {[...occurrences]
                        .sort(
                          (a, b) =>
                            new Date(b.completedAt).getTime() -
                            new Date(a.completedAt).getTime(),
                        )
                        .map((o) => (
                          <li
                            key={`${o.workoutId}-${o.completedAt}`}
                            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2"
                          >
                            <div>
                              <p className="text-sm text-slate-200">
                                {new Date(o.completedAt).toLocaleString()}
                              </p>
                              <p className="text-xs text-slate-500">{o.routineName}</p>
                            </div>
                            <p className="font-mono text-sm text-white">
                              {o.sessionMaxWeight != null
                                ? `${o.sessionMaxWeight} ${data.weightUnit}`
                                : "—"}
                            </p>
                          </li>
                        ))}
                    </ul>
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
