"use client";

import { useRef, useState, type FormEvent } from "react";
import { MUSCLE_GROUPS } from "@/lib/exercise-library";
import { useStore } from "@/lib/store";
import type { Exercise, MuscleGroup } from "@/lib/types";
import { isExerciseNameTaken } from "@/lib/validation";
import { Button } from "./Button";
import { ConfirmDialog } from "./ConfirmDialog";
import { Dialog } from "./Dialog";
import { EmptyState } from "./EmptyState";
import { Icon } from "./Icon";

type ExercisePickerProps = {
  open: boolean;
  onClose: () => void;
  onPick: (exerciseId: string) => void;
};

const inputClasses =
  "min-h-11 w-full rounded-[3px] border border-rule bg-bg px-3 text-base text-ink placeholder:text-muted focus:border-ink focus:outline-none";

function matches(exercise: Exercise, words: string[]): boolean {
  const name = exercise.name.toLocaleLowerCase();
  return words.every((w) => name.includes(w));
}

/**
 * Search the exercise list and pick one. Also where custom exercises are
 * added, renamed and deleted (there is no separate Library page).
 */
export function ExercisePicker({ open, onClose, onPick }: ExercisePickerProps) {
  const { exercises, addCustomExercise, renameCustomExercise, deleteCustomExercise } = useStore();
  const searchRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  // Adding a custom exercise.
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newGroup, setNewGroup] = useState<MuscleGroup>("Chest");
  const [addError, setAddError] = useState<string | null>(null);
  // Managing a custom exercise (the ⋯ menu).
  const [menuId, setMenuId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Exercise | null>(null);

  function reset() {
    setQuery("");
    setAdding(false);
    setAddError(null);
    setMenuId(null);
    setRenamingId(null);
    setRenameError(null);
  }

  function close() {
    reset();
    onClose();
  }

  function pick(id: string) {
    reset();
    onPick(id);
  }

  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const groups = MUSCLE_GROUPS.map((group) => ({
    group,
    items: exercises.filter((e) => e.muscleGroup === group && matches(e, words)),
  })).filter((g) => g.items.length > 0);
  const exactMatch = query.trim() !== "" && isExerciseNameTaken(query, exercises);

  function startAdding() {
    setNewName(query.trim());
    setAddError(null);
    setAdding(true);
  }

  function submitAdd(e: FormEvent) {
    e.preventDefault();
    // React events bubble through portals to the page's form; keep them here.
    e.stopPropagation();
    const result = addCustomExercise(newName, newGroup);
    if (!result.ok) return setAddError(result.problems[0]);
    pick(result.id);
  }

  function startRename(ex: Exercise) {
    setMenuId(null);
    setRenamingId(ex.id);
    setRenameValue(ex.name);
    setRenameError(null);
  }

  function submitRename(e: FormEvent) {
    e.preventDefault();
    // React events bubble through portals to the page's form; keep them here.
    e.stopPropagation();
    if (!renamingId) return;
    const result = renameCustomExercise(renamingId, renameValue);
    if (!result.ok) return setRenameError(result.problems[0]);
    setRenamingId(null);
  }

  return (
    <>
      <Dialog open={open} onClose={close} title="Add exercise" size="sheet" initialFocusRef={searchRef}>
        {adding ? (
          <form onSubmit={submitAdd} className="flex flex-col gap-4 p-5">
            <p className="flex items-center gap-2 font-bold">
              <Icon name="asterisk" size={18} className="text-orange" />
              New custom exercise
            </p>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-muted">Name</span>
              <input
                autoFocus
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setAddError(null);
                }}
                placeholder="e.g. Cossack Squat"
                className={inputClasses}
                aria-invalid={addError ? true : undefined}
                aria-describedby={addError ? "add-error" : undefined}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-muted">Muscle group</span>
              <select
                value={newGroup}
                onChange={(e) => setNewGroup(e.target.value as MuscleGroup)}
                className={inputClasses}
              >
                {MUSCLE_GROUPS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </label>
            {addError && (
              <p id="add-error" role="alert" className="text-sm text-red">
                {addError}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <Button type="submit">Add and pick</Button>
              <Button variant="secondary" onClick={() => setAdding(false)}>
                Back to list
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col">
            <div className="sticky top-0 z-10 border-b border-rule bg-surface p-4">
              <label className="relative block">
                <span className="sr-only">Search exercises</span>
                <Icon
                  name="search"
                  size={18}
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
                />
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search exercises"
                  className={`${inputClasses} pl-9`}
                />
              </label>
            </div>

            {!exactMatch && (
              <button
                type="button"
                onClick={startAdding}
                className="flex min-h-12 items-center gap-2 border-b border-rule px-5 text-left font-medium hover:bg-bg/60"
              >
                <Icon name="plus" size={18} className="shrink-0 text-orange" />
                {query.trim() ? (
                  <span>
                    Add &ldquo;{query.trim()}&rdquo; as a custom exercise
                  </span>
                ) : (
                  <span>Add a custom exercise</span>
                )}
              </button>
            )}

            {groups.length === 0 ? (
              <div className="px-5">
                <EmptyState
                  title="No matches."
                  helper="Try another word, or add it as a custom exercise."
                />
              </div>
            ) : (
              groups.map(({ group, items }) => (
                <section key={group} aria-label={group}>
                  <h3 className="px-5 pt-5 pb-1 text-xs font-medium tracking-wide text-muted uppercase">
                    {group}
                  </h3>
                  <ul>
                    {items.map((ex) => (
                      <li key={ex.id} className="border-b border-rule last:border-b-0">
                        {renamingId === ex.id ? (
                          <form onSubmit={submitRename} className="flex flex-col gap-2 px-5 py-3">
                            <label className="sr-only" htmlFor={`rename-${ex.id}`}>
                              New name for {ex.name}
                            </label>
                            <input
                              id={`rename-${ex.id}`}
                              autoFocus
                              value={renameValue}
                              onChange={(e) => {
                                setRenameValue(e.target.value);
                                setRenameError(null);
                              }}
                              className={inputClasses}
                              aria-invalid={renameError ? true : undefined}
                            />
                            {renameError && (
                              <p role="alert" className="text-sm text-red">
                                {renameError}
                              </p>
                            )}
                            <div className="flex gap-3">
                              <Button type="submit">Save</Button>
                              <Button variant="secondary" onClick={() => setRenamingId(null)}>
                                Cancel
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <div className="flex items-stretch">
                              <button
                                type="button"
                                onClick={() => pick(ex.id)}
                                className="flex min-h-12 flex-1 items-center px-5 text-left hover:bg-bg/60"
                              >
                                {ex.name}
                                {!ex.builtIn && <span className="ml-2 text-xs text-muted">Custom</span>}
                              </button>
                              {!ex.builtIn && (
                                <button
                                  type="button"
                                  onClick={() => setMenuId(menuId === ex.id ? null : ex.id)}
                                  aria-label={`Options for ${ex.name}`}
                                  aria-expanded={menuId === ex.id}
                                  className="flex w-12 items-center justify-center text-muted hover:text-ink"
                                >
                                  <Icon name="more" size={20} />
                                </button>
                              )}
                            </div>
                            {menuId === ex.id && (
                              <div className="flex gap-2 px-5 pb-3">
                                <Button variant="secondary" onClick={() => startRename(ex)}>
                                  Rename
                                </Button>
                                <Button
                                  variant="secondary"
                                  onClick={() => {
                                    setMenuId(null);
                                    setDeleting(ex);
                                  }}
                                >
                                  Delete
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              ))
            )}
          </div>
        )}
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        title={`Delete "${deleting?.name ?? ""}"?`}
        message="It will be hidden from the exercise list. Templates and past workouts that use it keep showing it."
        confirmLabel="Delete"
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteCustomExercise(deleting.id);
          setDeleting(null);
        }}
      />
    </>
  );
}
