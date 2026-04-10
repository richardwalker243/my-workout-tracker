import type { CompletedWorkout } from "@/types";

/** Local calendar date as YYYY-MM-DD */
export function toLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function isoToLocalDateKey(iso: string): string {
  return toLocalDateKey(new Date(iso));
}

/** Monday 00:00 local for the week containing `d`. */
export function mondayOfWeek(d: Date): Date {
  const t = startOfLocalDay(d);
  const day = t.getDay();
  const diffFromMonday = (day + 6) % 7;
  t.setDate(t.getDate() - diffFromMonday);
  return t;
}

export function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** Count of completed workouts per local calendar day */
export function activeDaysMap(workouts: CompletedWorkout[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const w of workouts) {
    const key = isoToLocalDateKey(w.completedAt);
    m.set(key, (m.get(key) ?? 0) + 1);
  }
  return m;
}

export function earliestWorkoutDate(workouts: CompletedWorkout[]): Date | null {
  if (workouts.length === 0) return null;
  let min = Infinity;
  for (const w of workouts) {
    const t = new Date(w.completedAt).getTime();
    if (t < min) min = t;
  }
  return new Date(min);
}

/**
 * Mondays from the week containing `earliest` through current week,
 * oldest first (index 0 = earliest week).
 */
export function weekMondaysChronological(earliest: Date, now: Date = new Date()): Date[] {
  const currentMonday = mondayOfWeek(now);
  const earliestMonday = mondayOfWeek(earliest);
  const list: Date[] = [];
  for (
    let w = new Date(earliestMonday);
    w.getTime() <= currentMonday.getTime();
    w.setDate(w.getDate() + 7)
  ) {
    list.push(new Date(w));
  }
  return list;
}
