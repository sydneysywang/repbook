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
