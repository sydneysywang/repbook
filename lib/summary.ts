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
