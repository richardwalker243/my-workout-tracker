import type { SessionWeightGroup, WorkoutEntry } from "@/types";

/** Highest weight logged for an entry (weight groups, else legacy session max). */
export function entrySessionMaxWeight(entry: WorkoutEntry): number | null {
  const fromGroups = entry.weightGroups
    .map((g) => g.weight)
    .filter((w) => Number.isFinite(w) && w > 0);
  if (fromGroups.length > 0) return Math.max(...fromGroups);
  if (
    entry.sessionMaxWeight != null &&
    Number.isFinite(entry.sessionMaxWeight) &&
    entry.sessionMaxWeight > 0
  ) {
    return entry.sessionMaxWeight;
  }
  return null;
}

/** Drop incomplete placeholder groups (weight must be > 0). */
export function sanitizeWeightGroups(groups: SessionWeightGroup[]): SessionWeightGroup[] {
  return groups
    .map((g) => normalizeWeightGroup(g))
    .filter((g): g is SessionWeightGroup => g != null && g.weight > 0);
}

export function entryHasWeight(entry: WorkoutEntry): boolean {
  return entrySessionMaxWeight(entry) != null;
}

export function normalizeWeightGroup(raw: unknown): SessionWeightGroup | null {
  if (!raw || typeof raw !== "object") return null;
  const g = raw as Partial<SessionWeightGroup>;
  const weight = Number(g.weight);
  const sets = Number(g.sets);
  if (!Number.isFinite(weight) || weight < 0) return null;
  if (!Number.isFinite(sets) || sets < 1) return null;
  let rpe: number | null = null;
  if (g.rpe != null && g.rpe !== ("" as unknown)) {
    const n = Number(g.rpe);
    if (Number.isInteger(n) && n >= 1 && n <= 10) rpe = n;
  }
  return { weight, sets: Math.floor(sets), rpe };
}

/** Migrate a raw entry from localStorage into the current WorkoutEntry shape. */
export function normalizeWorkoutEntry(raw: unknown): WorkoutEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const e = raw as Record<string, unknown>;
  if (typeof e.exerciseId !== "string" || typeof e.displayName !== "string") return null;

  const targetSets = Number(e.targetSets);
  const targetReps = Number(e.targetReps);
  const completed = Boolean(e.completed);

  let weightGroups: SessionWeightGroup[] = [];
  if (Array.isArray(e.weightGroups)) {
    weightGroups = e.weightGroups
      .map(normalizeWeightGroup)
      .filter((g): g is SessionWeightGroup => g != null);
  }

  const legacyMax =
    e.sessionMaxWeight == null || e.sessionMaxWeight === ""
      ? null
      : Number(e.sessionMaxWeight);

  if (weightGroups.length === 0 && legacyMax != null && Number.isFinite(legacyMax)) {
    weightGroups = [{ weight: legacyMax, sets: 1, rpe: null }];
  }

  return {
    exerciseId: e.exerciseId,
    displayName: e.displayName,
    targetSets: Number.isFinite(targetSets) ? targetSets : 0,
    targetReps: Number.isFinite(targetReps) ? targetReps : 0,
    weightGroups,
    completed,
  };
}
