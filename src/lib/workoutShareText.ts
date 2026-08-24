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
 * Plain-text share summary: done exercises with a recorded weight only.
 * Rows: Exercise | sets×reps | weight unit
 */
export function formatWorkoutShareText(
  workout: CompletedWorkout,
  weightUnit: WeightUnit,
): string {
  const lines = [`*Workout completed on ${formatCompletedAt(workout.completedAt)}*`];

  for (const entry of workout.entries) {
    if (!entry.completed || entry.sessionMaxWeight == null) continue;
    lines.push(
      `${entry.displayName} | ${entry.targetSets}×${entry.targetReps} | ${entry.sessionMaxWeight} ${weightUnit}`,
    );
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
