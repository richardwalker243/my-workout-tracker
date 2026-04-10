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

type MonthGroup = {
  key: string;
  label: string;
  mondays: Date[];
};

function groupWeeksByMonthOfMonday(mondays: Date[]): MonthGroup[] {
  const map = new Map<string, Date[]>();
  for (const m of mondays) {
    const key = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(m);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, ms]) => ({
      key,
      label: ms[0].toLocaleDateString(undefined, { month: "long", year: "numeric" }),
      mondays: ms,
    }));
}

export function ActivityHeatmap({ workouts }: Props) {
  const todayStart = useMemo(() => startOfLocalDay(new Date()), []);
  const todayKey = useMemo(() => toLocalDateKey(todayStart), [todayStart]);

  const { counts, monthGroups } = useMemo(() => {
    const earliest = earliestWorkoutDate(workouts);
    if (!earliest) {
      return { counts: new Map<string, number>(), monthGroups: [] as MonthGroup[] };
    }
    const weekMondays = weekMondaysChronological(earliest);
    return {
      counts: activeDaysMap(workouts),
      monthGroups: groupWeeksByMonthOfMonday(weekMondays),
    };
  }, [workouts]);

  if (monthGroups.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3" aria-label="Workout activity by week">
      <h2 className="text-sm font-medium text-slate-300">Activity calendar</h2>

      <div className="grid grid-cols-7 gap-x-2 gap-y-1">
        {WEEKDAY_LABELS.map((c, i) => (
          <div
            key={`h-${i}`}
            className="flex justify-center text-[9px] font-medium uppercase tracking-wide text-slate-500"
            aria-hidden
          >
            {c}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-5">
        {monthGroups.map((group) => (
          <div key={group.key}>
            <h3 className="mb-2 text-xs font-medium text-slate-400">{group.label}</h3>
            <div className="grid grid-cols-7 gap-x-2 gap-y-2">
              {group.mondays.flatMap((monday) =>
                Array.from({ length: 7 }, (_, i) => {
                  const day = addDays(monday, i);
                  const dateKey = toLocalDateKey(day);
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
                    <div key={dateKey} className="flex items-center justify-center">
                      <div
                        title={title}
                        tabIndex={0}
                        className={[
                          "size-3 shrink-0 rounded-sm outline-none transition-colors sm:size-3.5",
                          "hover:ring-1 hover:ring-slate-500 focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-950",
                          active ? "bg-orange-500" : "bg-slate-800/90 ring-1 ring-slate-800/80",
                        ].join(" ")}
                      />
                    </div>
                  );
                }),
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
