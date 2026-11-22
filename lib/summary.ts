import type { SetEntry } from "./types";

export function countSets(exercises: { sets: SetEntry[] }[]): number {
  return exercises.reduce((n, ex) => n + ex.sets.length, 0);
}

export function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

/** Weight first: "60 kg × 8", "bodyweight × 10". */
export function formatSet(set: SetEntry): string {
  const reps = set.reps ?? "–";
  const weight = set.weight === null ? "–" : set.weight === 0 ? "bodyweight" : `${set.weight} kg`;
  return `${weight} × ${reps}`;
}

/** Time since a start, e.g. "12 min" or "1 h 05 min". */
export function formatElapsed(startedAt: string, now: number): string {
  const minutes = Math.max(0, Math.floor((now - new Date(startedAt).getTime()) / 60000));
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  return `${h} h ${String(minutes % 60).padStart(2, "0")} min`;
}

/** Clock time in the user's locale, e.g. "18:42". */
export function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

/** Workout length, e.g. "48 min" or "1 h 05 min". */
export function formatDuration(startedAt: string, finishedAt: string): string {
  return formatElapsed(startedAt, new Date(finishedAt).getTime());
}

/** Total kg lifted: weight × reps over every set (bodyweight sets add 0). */
export function totalVolume(exercises: { sets: SetEntry[] }[]): number {
  return exercises.reduce(
    (sum, ex) => sum + ex.sets.reduce((s, set) => s + (set.weight ?? 0) * (set.reps ?? 0), 0),
    0,
  );
}

export function formatVolume(kg: number): string {
  return `${kg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg`;
}

/** "Mon 23 Nov", with the year added when it isn't this year. */
export function formatDate(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    ...(d.getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}),
  });
}

/** Short form for hints, e.g. "23 Nov". */
export function formatShortDate(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    ...(d.getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}),
  });
}

/** Newest first. */
export function sortNewestFirst<T extends { startedAt: string }>(workouts: T[]): T[] {
  return [...workouts].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

/** Local midnight on the Monday of the week containing `now`. */
export function startOfWeek(now: Date): Date {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

export function startOfMonth(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function countSince(workouts: { startedAt: string }[], since: Date): number {
  const t = since.getTime();
  return workouts.filter((w) => new Date(w.startedAt).getTime() >= t).length;
}

export type LastTime = { startedAt: string; workoutId: string; sets: SetEntry[] };

/**
 * The sets from the most recent saved workout that had this exercise with this
 * exact variation (no variation only matches no variation).
 */
export function lastTimeFor(
  workouts: {
    id: string;
    startedAt: string;
    exercises: { exerciseId: string; variationId: string | null; sets: SetEntry[] }[];
  }[],
  exerciseId: string,
  variationId: string | null,
): LastTime | null {
  for (const w of sortNewestFirst(workouts)) {
    const matches = w.exercises.filter(
      (ex) => ex.exerciseId === exerciseId && ex.variationId === variationId,
    );
    if (matches.length > 0) {
      return { startedAt: w.startedAt, workoutId: w.id, sets: matches.flatMap((ex) => ex.sets) };
    }
  }
  return null;
}

/**
 * Templates for quick starts: most recently used first (by the newest workout
 * started from them), then never-used ones by most recently created.
 */
export function recentTemplates<T extends { id: string; createdAt: string }>(
  templates: T[],
  workouts: { templateId: string | null; startedAt: string }[],
): T[] {
  const lastUsed = new Map<string, string>();
  for (const w of workouts) {
    if (!w.templateId) continue;
    const prev = lastUsed.get(w.templateId);
    if (!prev || w.startedAt > prev) lastUsed.set(w.templateId, w.startedAt);
  }
  return [...templates].sort((a, b) => {
    const ua = lastUsed.get(a.id);
    const ub = lastUsed.get(b.id);
    if (ua && ub) return ub.localeCompare(ua);
    if (ua) return -1;
    if (ub) return 1;
    return b.createdAt.localeCompare(a.createdAt);
  });
}
