"use client";

import { useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import type { SetEntry } from "@/lib/types";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";
import { ExercisePicker } from "./ExercisePicker";
import { Icon } from "./Icon";
import { SetRow } from "./SetRow";

/** Shape shared by template exercises and workout exercises. */
type EditableExercise = { id: string; exerciseId: string; sets: SetEntry[] };

type ExerciseEditorProps<T extends EditableExercise> = {
  exercises: T[];
  onChange: (exercises: T[]) => void;
  /** Builds a new entry when an exercise is picked (workouts add a variation field). */
  createExercise: (exerciseId: string) => T;
  /** Sets to outline because they are missing reps or weight. */
  incompleteSetIds?: Set<string>;
  /** Extra controls under an exercise's name (e.g. the variation picker in workouts). */
  renderExtra?: (exercise: T, update: (next: T) => void) => ReactNode;
  emptyTitle?: string;
  emptyHelper?: string;
};

export function newSet(from?: SetEntry): SetEntry {
  return { id: crypto.randomUUID(), reps: from?.reps ?? null, weight: from?.weight ?? null };
}

/**
 * List of exercises with their sets. Shared by template editing now, and by
 * the active workout and history edit later.
 */
export function ExerciseEditor<T extends EditableExercise>({
  exercises,
  onChange,
  createExercise,
  incompleteSetIds,
  renderExtra,
  emptyTitle = "No exercises yet.",
  emptyHelper = "Add your first exercise to get started.",
}: ExerciseEditorProps<T>) {
  const { exerciseName } = useStore();
  const [pickerOpen, setPickerOpen] = useState(false);

  function updateAt(index: number, next: T) {
    onChange(exercises.map((ex, i) => (i === index ? next : ex)));
  }

  return (
    <div>
      {exercises.length === 0 ? (
        <EmptyState title={emptyTitle} helper={emptyHelper} />
      ) : (
        <ol>
          {exercises.map((ex, i) => {
            const name = exerciseName(ex.exerciseId);
            const update = (next: T) => updateAt(i, next);
            return (
              <li key={ex.id} className="border-b border-rule py-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="pt-2 text-lg font-bold tracking-tight">{name}</h3>
                  <button
                    type="button"
                    onClick={() => onChange(exercises.filter((_, j) => j !== i))}
                    aria-label={`Remove ${name}`}
                    className="-mr-2 flex size-11 shrink-0 items-center justify-center text-muted hover:text-ink"
                  >
                    <Icon name="trash" size={20} />
                  </button>
                </div>
                {renderExtra?.(ex, update)}
                <div className="mt-3 flex flex-col gap-2">
                  {ex.sets.map((set, si) => (
                    <SetRow
                      key={set.id}
                      index={si}
                      set={set}
                      exerciseName={name}
                      incomplete={incompleteSetIds?.has(set.id) ?? false}
                      onChange={(s) => update({ ...ex, sets: ex.sets.map((x) => (x.id === s.id ? s : x)) })}
                      onRemove={() => update({ ...ex, sets: ex.sets.filter((x) => x.id !== set.id) })}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => update({ ...ex, sets: [...ex.sets, newSet(ex.sets.at(-1))] })}
                  className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-ink hover:opacity-75"
                >
                  <Icon name="plus" size={16} />
                  Add set
                </button>
              </li>
            );
          })}
        </ol>
      )}

      <Button variant="secondary" className="mt-5" onClick={() => setPickerOpen(true)}>
        <Icon name="plus" size={18} />
        Add exercise
      </Button>

      <ExercisePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(exerciseId) => {
          setPickerOpen(false);
          onChange([...exercises, createExercise(exerciseId)]);
        }}
      />
    </div>
  );
}
