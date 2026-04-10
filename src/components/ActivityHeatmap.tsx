import { useMemo } from "react";
import {
  activeDaysMap,
  addDays,
  earliestWorkoutDate,
  formatWeekRangeShort,
  startOfLocalDay,
  toLocalDateKey,
  weekMondaysNewestFirst,
} from "@/lib/activityCalendar";
import type { CompletedWorkout } from "@/types";

type Props = {
  workouts: CompletedWorkout[];
};

export function ActivityHeatmap({ workouts }: Props) {
  const todayStart = useMemo(() => startOfLocalDay(new Date()), []);
  const todayKey = useMemo(() => toLocalDateKey(todayStart), [todayStart]);

  const { counts, weekMondays } = useMemo(() => {
    const earliest = earliestWorkoutDate(workouts);
    if (!earliest) {
      return { counts: new Map<string, number>(), weekMondays: [] as Date[] };
    }
    return {
      counts: activeDaysMap(workouts),
      weekMondays: weekMondaysNewestFirst(earliest),
    };
  }, [workouts]);

  if (weekMondays.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3" aria-label="Workout activity by week">
      <h2 className="text-sm font-medium text-slate-300">Activity calendar</h2>
      <p className="text-xs text-slate-500">
        Current week at the top — scroll down for older weeks.
      </p>

      <div className="space-y-4">
        {weekMondays.map((monday) => (
          <div key={monday.getTime()} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{formatWeekRangeShort(monday)}</span>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: 7 }, (_, i) => {
                const day = addDays(monday, i);
                const key = toLocalDateKey(day);
                const n = counts.get(key) ?? 0;
                const hasWorkout = n > 0;
                const isFuture = key > todayKey;
                const active = hasWorkout && !isFuture;
                const label = day.toLocaleDateString(undefined, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                });
                const title =
                  n > 1
                    ? `${label} · ${n} workouts`
                    : n === 1
                      ? `${label} · 1 workout`
                      : isFuture
                        ? `${label} · upcoming`
                        : `${label} · no workout`;

                return (
                  <div
                    key={key}
                    title={title}
                    className={[
                      "aspect-square min-h-[2.25rem] rounded-lg transition-colors",
                      active
                        ? "bg-orange-500"
                        : "bg-slate-800/90 ring-1 ring-slate-800",
                    ].join(" ")}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div
        className="grid grid-cols-7 gap-1.5 pt-1 text-center text-[10px] font-medium uppercase tracking-wide text-slate-500"
        aria-hidden
      >
        {["M", "T", "W", "T", "F", "S", "S"].map((c, i) => (
          <span key={`${c}-${i}`}>{c}</span>
        ))}
      </div>
    </section>
  );
}
