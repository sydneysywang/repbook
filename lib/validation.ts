import type { Exercise, SetEntry, Template, TemplateExercise, Variation, WorkoutExercise } from "./types";

export const TEMPLATE_LIMIT = 20;

export const TEMPLATE_LIMIT_MESSAGE = `You've reached ${TEMPLATE_LIMIT} templates. Delete one to add another.`;

/** What the template editor works on before it is saved. */
export type TemplateDraft = {
  name: string;
  exercises: TemplateExercise[];
};

export type TemplateValidation = {
  problems: string[];
  /** Ids of sets missing reps or weight, so the editor can outline them. */
  incompleteSetIds: Set<string>;
};

function normalise(name: string): string {
  return name.trim().toLocaleLowerCase();
}

/** Case-insensitive, ignoring surrounding spaces. */
export function isNameTaken(name: string, templates: Template[], exceptId?: string): boolean {
  const n = normalise(name);
  return templates.some((t) => t.id !== exceptId && normalise(t.name) === n);
}

export function canCreateTemplate(templates: Template[]): boolean {
  return templates.length < TEMPLATE_LIMIT;
}

export function isSetComplete(set: SetEntry): boolean {
  return set.reps !== null && set.weight !== null;
}

export function validateTemplate(
  draft: TemplateDraft,
  templates: Template[],
  exerciseName: (exerciseId: string) => string,
  exceptId?: string,
): TemplateValidation {
  const problems: string[] = [];
  const incompleteSetIds = new Set<string>();

  if (draft.name.trim() === "") problems.push("Give the template a name.");
  else if (isNameTaken(draft.name, templates, exceptId))
    problems.push(`You already have a template called "${draft.name.trim()}".`);

  if (draft.exercises.length === 0) problems.push("Add at least one exercise.");

  for (const ex of draft.exercises) {
    if (ex.sets.length === 0) {
      problems.push(`${exerciseName(ex.exerciseId)}: add at least one set.`);
      continue;
    }
    ex.sets.forEach((set, i) => {
      if (isSetComplete(set)) return;
      incompleteSetIds.add(set.id);
      const missing =
        set.reps === null && set.weight === null
          ? "add weight and reps"
          : set.reps === null
            ? "add reps"
            : "add a weight (0 for bodyweight)";
      problems.push(`${exerciseName(ex.exerciseId)}, set ${i + 1}: ${missing}.`);
    });
  }

  return { problems, incompleteSetIds };
}

/** "Push day" → "Push day (copy)", then "(copy 2)", … until unused. */
export function cloneName(name: string, templates: Template[]): string {
  const base = name.replace(/ \(copy(?: \d+)?\)$/, "");
  let candidate = `${base} (copy)`;
  for (let n = 2; isNameTaken(candidate, templates); n++) candidate = `${base} (copy ${n})`;
  return candidate;
}

/** Custom exercise names must not clash with any exercise shown in the picker. */
export function isExerciseNameTaken(
  name: string,
  exercises: Exercise[],
  exceptId?: string,
): boolean {
  const n = normalise(name);
  return exercises.some((e) => !e.deleted && e.id !== exceptId && normalise(e.name) === n);
}

/** Variation names must be unique within one exercise (ignoring case and deleted ones). */
export function isVariationNameTaken(
  name: string,
  variations: Variation[],
  exerciseId: string,
  exceptId?: string,
): boolean {
  const n = normalise(name);
  return variations.some(
    (v) => !v.deleted && v.exerciseId === exerciseId && v.id !== exceptId && normalise(v.name) === n,
  );
}

export type PreparedWorkout = {
  /** Only complete sets; exercises left with no sets are dropped. */
  exercises: WorkoutExercise[];
  droppedSets: number;
  completeSets: number;
};

/** Finish rule: sets missing reps or weight are dropped before saving. */
export function prepareWorkoutForSave(exercises: WorkoutExercise[]): PreparedWorkout {
  let droppedSets = 0;
  let completeSets = 0;
  const kept: WorkoutExercise[] = [];
  for (const ex of exercises) {
    const sets = ex.sets.filter(isSetComplete);
    droppedSets += ex.sets.length - sets.length;
    completeSets += sets.length;
    if (sets.length > 0) kept.push({ ...ex, sets });
  }
  return { exercises: kept, droppedSets, completeSets };
}
