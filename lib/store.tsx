"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { BUILT_IN_EXERCISES } from "./exercise-library";
import { emptyData, loadData, saveData } from "./storage";
import type { AppData, Exercise, Variation } from "./types";

/**
 * - "corrupt": saved data couldn't be read. We stop saving so nothing is lost
 *   until the user chooses to start fresh.
 * - "full": the browser's storage is full; the latest change wasn't saved.
 * - "unavailable": storage is blocked (e.g. some private modes); changes only
 *   last until the tab closes.
 */
export type StorageError = "corrupt" | "full" | "unavailable" | null;

type StoreValue = {
  ready: boolean;
  data: AppData;
  storageError: StorageError;
  /** Built-in plus custom exercises that haven't been deleted (for pickers). */
  exercises: Exercise[];
  /** Looks up any exercise, including deleted custom ones (for past workouts). */
  getExercise: (id: string) => Exercise | undefined;
  getVariation: (id: string) => Variation | undefined;
  /** Apply a change to the data; it is saved automatically. */
  update: (fn: (data: AppData) => AppData) => void;
  /** Throw away unreadable saved data and start with an empty app. */
  resetData: () => void;
  dismissStorageError: () => void;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<AppData>(emptyData);
  const [storageError, setStorageError] = useState<StorageError>(null);
  // While saved data is unreadable, don't overwrite it.
  const [saveBlocked, setSaveBlocked] = useState(false);

  // Read browser storage once after mount (it doesn't exist on the server).
  useEffect(() => {
    const result = loadData();
    /* eslint-disable react-hooks/set-state-in-effect -- syncing from an external store on mount */
    if (result.status === "ok") setData(result.data);
    if (result.status === "corrupt") {
      setStorageError("corrupt");
      setSaveBlocked(true);
    }
    if (result.status === "unavailable") setStorageError("unavailable");
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Persist every change after the initial load.
  useEffect(() => {
    if (!ready || saveBlocked) return;
    const result = saveData(data);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reporting the external write result
    if (result !== "ok") setStorageError(result);
  }, [data, ready, saveBlocked]);

  const update = useCallback((fn: (data: AppData) => AppData) => {
    setData((prev) => fn(prev));
  }, []);

  const resetData = useCallback(() => {
    setSaveBlocked(false);
    setStorageError(null);
    setData(emptyData());
  }, []);

  const dismissStorageError = useCallback(() => setStorageError(null), []);

  const value = useMemo<StoreValue>(() => {
    const allExercises = [...BUILT_IN_EXERCISES, ...data.customExercises];
    const exerciseById = new Map(allExercises.map((e) => [e.id, e]));
    const variationById = new Map(data.variations.map((v) => [v.id, v]));
    return {
      ready,
      data,
      storageError,
      exercises: allExercises.filter((e) => !e.deleted),
      getExercise: (id) => exerciseById.get(id),
      getVariation: (id) => variationById.get(id),
      update,
      resetData,
      dismissStorageError,
    };
  }, [ready, data, storageError, update, resetData, dismissStorageError]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
