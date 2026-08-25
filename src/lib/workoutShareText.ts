import { entryHasWeight } from "@/lib/workoutEntry";
import type { CompletedWorkout, WeightUnit } from "@/types";

function formatCompletedAt(iso: string): string {
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

/**
 * Plain-text share summary: one line per weight group on done exercises.
 * Example: Bench Press | 2x10 | 25kg | RPE7
 */
export function formatWorkoutShareText(
  workout: CompletedWorkout,
  weightUnit: WeightUnit,
): string {
  const lines = [`*Workout completed on ${formatCompletedAt(workout.completedAt)}*`];

  for (const entry of workout.entries) {
    if (!entry.completed || !entryHasWeight(entry)) continue;
    for (const group of entry.weightGroups) {
      if (!(group.weight > 0) || group.sets < 1) continue;
      const base = `${entry.displayName} | ${group.sets}x${entry.targetReps} | ${group.weight}${weightUnit}`;
      lines.push(group.rpe != null ? `${base} | RPE${group.rpe}` : base);
    }
  }

  return lines.join("\n");
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to execCommand
  }

  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}
