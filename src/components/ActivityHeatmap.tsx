import { useMemo } from "react";
import {
  activeDaysMap,
  addDays,
  earliestWorkoutDate,
  startOfLocalDay,
  toLocalDateKey,
  weekMondaysChronological,
} from "@/lib/activityCalendar";
import type { CompletedWorkout } from "@/types";

type Props = {
  workouts: CompletedWorkout[];
};

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const;

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
      weekMondays: weekMondaysChronological(earliest),
    };
  }, [workouts]);

  const cells = useMemo(() => {
    const out: { day: Date; dateKey: string }[] = [];
    for (const monday of weekMondays) {
      for (let i = 0; i < 7; i++) {
        const day = addDays(monday, i);
        out.push({ day, dateKey: toLocalDateKey(day) });
      }
    }
    return out;
  }, [weekMondays]);

  if (weekMondays.length === 0) {
    return null;
  }

  return (
    <section className="space-y-2" aria-label="Workout activity by week">
      <h2 className="text-sm font-medium text-slate-300">Activity calendar</h2>
      <p className="text-xs text-slate-500">
        Oldest weeks at the top; most recent at the bottom. Hover or focus a tile for the date.
      </p>

      <div className="grid grid-cols-7 gap-x-1 gap-y-0.5">
        {WEEKDAY_LABELS.map((c, i) => (
          <div
            key={`h-${i}`}
            className="pb-0.5 text-center text-[9px] font-medium uppercase tracking-wide text-slate-500"
            aria-hidden
          >
            {c}
          </div>
        ))}

        {cells.map(({ day, dateKey }) => {
          const n = counts.get(dateKey) ?? 0;
          const hasWorkout = n > 0;
          const isFuture = dateKey > todayKey;
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
              key={dateKey}
              title={title}
              tabIndex={0}
              className={[
                "aspect-square min-h-0 w-full rounded-md outline-none transition-colors",
                "hover:ring-1 hover:ring-slate-500 focus-visible:ring-2 focus-visible:ring-orange-400",
                active ? "bg-orange-500" : "bg-slate-800/90 ring-1 ring-slate-800/80",
              ].join(" ")}
            />
          );
        })}
      </div>
    </section>
  );
}
