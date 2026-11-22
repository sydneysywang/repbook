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
import type {
  AppData,
  Exercise,
  MuscleGroup,
  TemplateExercise,
  Variation,
  WorkoutExercise,
} from "./types";
import {
  TEMPLATE_LIMIT_MESSAGE,
  canCreateTemplate,
  cloneName,
  isExerciseNameTaken,
  isVariationNameTaken,
  prepareWorkoutForSave,
  validateTemplate,
  validateWorkoutEdit,
  type TemplateDraft,
} from "./validation";

export type ActionResult = { ok: true; id: string } | { ok: false; problems: string[] };

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

  /** Display name for any exercise id, including deleted custom ones. */
  exerciseName: (id: string) => string;

  createTemplate: (draft: TemplateDraft) => ActionResult;
  updateTemplate: (id: string, draft: TemplateDraft) => ActionResult;
  cloneTemplate: (id: string) => ActionResult;
  deleteTemplate: (id: string) => void;

  addCustomExercise: (name: string, muscleGroup: MuscleGroup) => ActionResult;
  renameCustomExercise: (id: string, name: string) => ActionResult;
  deleteCustomExercise: (id: string) => void;

  /** Starts blank, or from a template (copies exercises and sets, never variations). */
  startWorkout: (templateId?: string) => ActionResult;
  updateActiveExercises: (exercises: WorkoutExercise[]) => void;
  discardWorkout: () => void;
  /** Saves ticked sets only; needs at least one. */
  finishWorkout: () => FinishResult;
  /** New template from a saved workout's exercises and sets (never variations). */
  saveWorkoutAsTemplate: (workoutId: string, name: string) => ActionResult;
  /** Replace a template's exercises and sets with a saved workout's; keeps its name. */
  updateTemplateFromWorkout: (templateId: string, workoutId: string) => ActionResult;
  /** Edit a past workout's exercises, variations and sets; every set needs reps and weight. */
  updateWorkout: (id: string, exercises: WorkoutExercise[]) => ActionResult;
  deleteWorkout: (id: string) => void;

  /** An exercise's variations that haven't been deleted (for pickers). */
  variationsFor: (exerciseId: string) => Variation[];
  addVariation: (exerciseId: string, name: string) => ActionResult;
  renameVariation: (id: string, name: string) => ActionResult;
  deleteVariation: (id: string) => void;
};

export type FinishResult =
  | { ok: true; id: string; exerciseCount: number; setCount: number; droppedSets: number }
  | { ok: false; problems: string[] };

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
    const exerciseName = (id: string) => exerciseById.get(id)?.name ?? "Unknown exercise";
    const now = () => new Date().toISOString();

    // Rules are checked against the data this render sees; user actions are
    // one tap at a time, so that is always the latest saved state.
    const checkDraft = (draft: TemplateDraft, exceptId?: string): string[] =>
      validateTemplate(draft, data.templates, exerciseName, exceptId).problems;

    const cleanName = (name: string) => name.trim().replace(/\s+/g, " ");

    const createTemplate = (draft: TemplateDraft): ActionResult => {
      if (!canCreateTemplate(data.templates)) return { ok: false, problems: [TEMPLATE_LIMIT_MESSAGE] };
      const problems = checkDraft(draft);
      if (problems.length) return { ok: false, problems };
      const id = crypto.randomUUID();
      const t = now();
      update((d) => ({
        ...d,
        templates: [
          ...d.templates,
          { id, name: cleanName(draft.name), exercises: draft.exercises, createdAt: t, updatedAt: t },
        ],
      }));
      return { ok: true, id };
    };

    const updateTemplate = (id: string, draft: TemplateDraft): ActionResult => {
      if (!data.templates.some((t) => t.id === id))
        return { ok: false, problems: ["This template no longer exists."] };
      const problems = checkDraft(draft, id);
      if (problems.length) return { ok: false, problems };
      update((d) => ({
        ...d,
        templates: d.templates.map((t) =>
          t.id === id
            ? { ...t, name: cleanName(draft.name), exercises: draft.exercises, updatedAt: now() }
            : t,
        ),
      }));
      return { ok: true, id };
    };

    // Templates copy exercises and sets (reps + weight) with fresh ids, never variations.
    const templateExercisesFrom = (exercises: WorkoutExercise[]): TemplateExercise[] =>
      exercises.map((ex) => ({
        id: crypto.randomUUID(),
        exerciseId: ex.exerciseId,
        sets: ex.sets.map((s) => ({ id: crypto.randomUUID(), reps: s.reps, weight: s.weight })),
      }));

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
      exerciseName,

      createTemplate,
      updateTemplate,

      cloneTemplate: (id) => {
        const source = data.templates.find((t) => t.id === id);
        if (!source) return { ok: false, problems: ["This template no longer exists."] };
        if (!canCreateTemplate(data.templates)) return { ok: false, problems: [TEMPLATE_LIMIT_MESSAGE] };
        const newId = crypto.randomUUID();
        const t = now();
        const copy = {
          id: newId,
          name: cloneName(source.name, data.templates),
          // Fresh ids so the copy is fully independent.
          exercises: source.exercises.map((ex) => ({
            ...ex,
            id: crypto.randomUUID(),
            sets: ex.sets.map((s) => ({ ...s, id: crypto.randomUUID() })),
          })),
          createdAt: t,
          updatedAt: t,
        };
        update((d) => ({ ...d, templates: [...d.templates, copy] }));
        return { ok: true, id: newId };
      },

      deleteTemplate: (id) => {
        update((d) => ({ ...d, templates: d.templates.filter((t) => t.id !== id) }));
      },

      addCustomExercise: (name, muscleGroup) => {
        const clean = cleanName(name);
        if (!clean) return { ok: false, problems: ["Give the exercise a name."] };
        if (isExerciseNameTaken(clean, allExercises))
          return { ok: false, problems: [`"${clean}" is already in the list.`] };
        const id = crypto.randomUUID();
        update((d) => ({
          ...d,
          customExercises: [...d.customExercises, { id, name: clean, muscleGroup, builtIn: false }],
        }));
        return { ok: true, id };
      },

      renameCustomExercise: (id, name) => {
        const ex = exerciseById.get(id);
        if (!ex || ex.builtIn) return { ok: false, problems: ["Built-in exercises can't be renamed."] };
        const clean = cleanName(name);
        if (!clean) return { ok: false, problems: ["Give the exercise a name."] };
        if (isExerciseNameTaken(clean, allExercises, id))
          return { ok: false, problems: [`"${clean}" is already in the list.`] };
        update((d) => ({
          ...d,
          customExercises: d.customExercises.map((e) => (e.id === id ? { ...e, name: clean } : e)),
        }));
        return { ok: true, id };
      },

      deleteCustomExercise: (id) => {
        // Soft delete: hidden from pickers; templates and past workouts keep the name.
        update((d) => ({
          ...d,
          customExercises: d.customExercises.map((e) => (e.id === id ? { ...e, deleted: true } : e)),
        }));
      },

      startWorkout: (templateId) => {
        if (data.activeWorkout) return { ok: false, problems: ["A workout is already running."] };
        let exercises: WorkoutExercise[] = [];
        if (templateId) {
          const template = data.templates.find((t) => t.id === templateId);
          if (!template) return { ok: false, problems: ["This template no longer exists."] };
          exercises = template.exercises.map((ex) => ({
            id: crypto.randomUUID(),
            exerciseId: ex.exerciseId,
            variationId: null,
            // Planned numbers only; nothing is ticked yet.
            sets: ex.sets.map((s) => ({ id: crypto.randomUUID(), reps: s.reps, weight: s.weight })),
          }));
        }
        update((d) => ({
          ...d,
          activeWorkout: { startedAt: now(), templateId: templateId ?? null, exercises },
        }));
        return { ok: true, id: templateId ?? "blank" };
      },

      updateActiveExercises: (exercises) => {
        update((d) => (d.activeWorkout ? { ...d, activeWorkout: { ...d.activeWorkout, exercises } } : d));
      },

      discardWorkout: () => {
        update((d) => ({ ...d, activeWorkout: null }));
      },

      finishWorkout: () => {
        const active = data.activeWorkout;
        if (!active) return { ok: false, problems: ["There's no workout running."] };
        const prepared = prepareWorkoutForSave(active.exercises);
        if (prepared.completeSets === 0)
          return {
            ok: false,
            problems: ["Tick at least one set you've done before finishing."],
          };
        const id = crypto.randomUUID();
        const workout = {
          id,
          startedAt: active.startedAt,
          finishedAt: now(),
          templateId: active.templateId,
          exercises: prepared.exercises,
        };
        update((d) => ({ ...d, workouts: [...d.workouts, workout], activeWorkout: null }));
        return {
          ok: true,
          id,
          exerciseCount: prepared.exercises.length,
          setCount: prepared.completeSets,
          droppedSets: prepared.droppedSets,
        };
      },

      saveWorkoutAsTemplate: (workoutId, name) => {
        const workout = data.workouts.find((w) => w.id === workoutId);
        if (!workout) return { ok: false, problems: ["This workout no longer exists."] };
        return createTemplate({ name, exercises: templateExercisesFrom(workout.exercises) });
      },

      updateTemplateFromWorkout: (templateId, workoutId) => {
        const workout = data.workouts.find((w) => w.id === workoutId);
        if (!workout) return { ok: false, problems: ["This workout no longer exists."] };
        const template = data.templates.find((t) => t.id === templateId);
        if (!template) return { ok: false, problems: ["This template no longer exists."] };
        return updateTemplate(templateId, {
          name: template.name,
          exercises: templateExercisesFrom(workout.exercises),
        });
      },

      updateWorkout: (id, exercises) => {
        if (!data.workouts.some((w) => w.id === id))
          return { ok: false, problems: ["This workout no longer exists."] };
        const problems = validateWorkoutEdit(exercises, exerciseName).problems;
        if (problems.length) return { ok: false, problems };
        // Saved workouts never store the tick.
        const clean = exercises.map((ex) => ({
          ...ex,
          sets: ex.sets.map(({ id: setId, reps, weight }) => ({ id: setId, reps, weight })),
        }));
        update((d) => ({
          ...d,
          workouts: d.workouts.map((w) => (w.id === id ? { ...w, exercises: clean } : w)),
        }));
        return { ok: true, id };
      },

      deleteWorkout: (id) => {
        update((d) => ({ ...d, workouts: d.workouts.filter((w) => w.id !== id) }));
      },

      variationsFor: (exerciseId) =>
        data.variations
          .filter((v) => v.exerciseId === exerciseId && !v.deleted)
          .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" })),

      addVariation: (exerciseId, name) => {
        const clean = cleanName(name);
        if (!clean) return { ok: false, problems: ["Give the variation a name."] };
        if (isVariationNameTaken(clean, data.variations, exerciseId))
          return { ok: false, problems: [`"${clean}" already exists for this exercise.`] };
        const id = crypto.randomUUID();
        update((d) => ({ ...d, variations: [...d.variations, { id, exerciseId, name: clean }] }));
        return { ok: true, id };
      },

      renameVariation: (id, name) => {
        const v = variationById.get(id);
        if (!v) return { ok: false, problems: ["This variation no longer exists."] };
        const clean = cleanName(name);
        if (!clean) return { ok: false, problems: ["Give the variation a name."] };
        if (isVariationNameTaken(clean, data.variations, v.exerciseId, id))
          return { ok: false, problems: [`"${clean}" already exists for this exercise.`] };
        update((d) => ({
          ...d,
          variations: d.variations.map((x) => (x.id === id ? { ...x, name: clean } : x)),
        }));
        return { ok: true, id };
      },

      deleteVariation: (id) => {
        // Soft delete: hidden from pickers; past workouts keep the name.
        // The running workout drops it so the picker and the chip agree.
        update((d) => ({
          ...d,
          variations: d.variations.map((v) => (v.id === id ? { ...v, deleted: true } : v)),
          activeWorkout: d.activeWorkout && {
            ...d.activeWorkout,
            exercises: d.activeWorkout.exercises.map((ex) =>
              ex.variationId === id ? { ...ex, variationId: null } : ex,
            ),
          },
        }));
      },
    };
  }, [ready, data, storageError, update, resetData, dismissStorageError]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
