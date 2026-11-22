import type { AppData } from "./types";

export const STORAGE_KEY = "repbook:v1";

export function emptyData(): AppData {
  return {
    version: 1,
    customExercises: [],
    variations: [],
    workouts: [],
    templates: [],
    activeWorkout: null,
  };
}

export type LoadResult =
  | { status: "ok"; data: AppData }
  | { status: "empty" }
  | { status: "corrupt" }
  | { status: "unavailable" };

export type SaveResult = "ok" | "full" | "unavailable";

function isAppData(value: unknown): value is AppData {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    v.version === 1 &&
    Array.isArray(v.customExercises) &&
    Array.isArray(v.variations) &&
    Array.isArray(v.workouts) &&
    Array.isArray(v.templates) &&
    (v.activeWorkout === null || typeof v.activeWorkout === "object")
  );
}

/** Browser only. Never throws. */
export function loadData(): LoadResult {
  if (typeof window === "undefined") return { status: "unavailable" };
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return { status: "unavailable" };
  }
  if (raw === null) return { status: "empty" };
  try {
    const parsed: unknown = JSON.parse(raw);
    return isAppData(parsed) ? { status: "ok", data: parsed } : { status: "corrupt" };
  } catch {
    return { status: "corrupt" };
  }
}

function isQuotaError(err: unknown): boolean {
  return (
    err instanceof DOMException &&
    (err.name === "QuotaExceededError" || err.name === "NS_ERROR_DOM_QUOTA_REACHED")
  );
}

/** Browser only. Never throws. */
export function saveData(data: AppData): SaveResult {
  if (typeof window === "undefined") return "unavailable";
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return "ok";
  } catch (err) {
    return isQuotaError(err) ? "full" : "unavailable";
  }
}
