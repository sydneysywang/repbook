"use client";

import { useState, type FormEvent } from "react";
import { useStore } from "@/lib/store";
import type { Variation } from "@/lib/types";
import { Button } from "./Button";
import { ConfirmDialog } from "./ConfirmDialog";
import { Dialog } from "./Dialog";
import { Icon } from "./Icon";

type VariationPickerProps = {
  exerciseId: string;
  exerciseName: string;
  variationId: string | null;
  onChange: (variationId: string | null) => void;
};

const inputClasses =
  "min-h-11 w-full rounded-[3px] border border-rule bg-bg px-3 text-base text-ink placeholder:text-muted focus:border-ink focus:outline-none";

const rowClasses = "flex min-h-12 flex-1 items-center gap-2 px-5 text-left hover:bg-bg/60";

/**
 * Chip under an exercise in the active workout. Opens a list of that
 * exercise's variations (usually specific machines), where they can also be
 * added, renamed and deleted.
 */
export function VariationPicker({ exerciseId, exerciseName, variationId, onChange }: VariationPickerProps) {
  const { variationsFor, getVariation, addVariation, renameVariation, deleteVariation } = useStore();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Variation | null>(null);

  const variations = variationsFor(exerciseId);
  const current = variationId ? getVariation(variationId) : undefined;

  function close() {
    setOpen(false);
    setNewName("");
    setAddError(null);
    setMenuId(null);
    setRenamingId(null);
    setRenameError(null);
  }

  function pick(id: string | null) {
    onChange(id);
    close();
  }

  function submitAdd(e: FormEvent) {
    e.preventDefault();
    // React events bubble through portals to the page's form; keep them here.
    e.stopPropagation();
    const result = addVariation(exerciseId, newName);
    if (!result.ok) return setAddError(result.problems[0]);
    pick(result.id);
  }

  function submitRename(e: FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!renamingId) return;
    const result = renameVariation(renamingId, renameValue);
    if (!result.ok) return setRenameError(result.problems[0]);
    setRenamingId(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${exerciseName} variation: ${current ? current.name : "none"}. Change`}
        className={`mt-1 inline-flex min-h-11 max-w-full items-center gap-1.5 rounded-[3px] border px-3 text-sm font-medium ${
          current ? "border-ink text-ink" : "border-rule text-muted hover:text-ink"
        }`}
      >
        {current ? (
          <span className="truncate">
            <span className="text-muted">Variation:</span> {current.name}
          </span>
        ) : (
          <>
            <Icon name="plus" size={14} />
            Variation (optional)
          </>
        )}
      </button>

      <Dialog open={open} onClose={close} title={`${exerciseName} variation`}>
        <ul className="border-b border-rule">
          <li className="border-b border-rule last:border-b-0">
            <button type="button" onClick={() => pick(null)} className={rowClasses}>
              <span className="flex-1">Standard (no variation)</span>
              {!current && <Icon name="check" size={18} className="text-orange" />}
            </button>
          </li>
          {variations.map((v) => (
            <li key={v.id} className="border-b border-rule last:border-b-0">
              {renamingId === v.id ? (
                <form onSubmit={submitRename} className="flex flex-col gap-2 px-5 py-3">
                  <label className="sr-only" htmlFor={`rename-variation-${v.id}`}>
                    New name for {v.name}
                  </label>
                  <input
                    id={`rename-variation-${v.id}`}
                    autoFocus
                    value={renameValue}
                    onChange={(e) => {
                      setRenameValue(e.target.value);
                      setRenameError(null);
                    }}
                    maxLength={60}
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
                    <button type="button" onClick={() => pick(v.id)} className={rowClasses}>
                      <span className="flex-1 break-words">{v.name}</span>
                      {current?.id === v.id && <Icon name="check" size={18} className="text-orange" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMenuId(menuId === v.id ? null : v.id)}
                      aria-label={`Options for ${v.name}`}
                      aria-expanded={menuId === v.id}
                      className="flex w-12 items-center justify-center text-muted hover:text-ink"
                    >
                      <Icon name="more" size={20} />
                    </button>
                  </div>
                  {menuId === v.id && (
                    <div className="flex gap-2 px-5 pb-3">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setMenuId(null);
                          setRenamingId(v.id);
                          setRenameValue(v.name);
                          setRenameError(null);
                        }}
                      >
                        Rename
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setMenuId(null);
                          setDeleting(v);
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

        <form onSubmit={submitAdd} className="flex flex-col gap-2 p-5">
          <label htmlFor={`new-variation-${exerciseId}`} className="flex items-center gap-2 font-bold">
            <Icon name="asterisk" size={16} className="text-orange" />
            Add a variation
          </label>
          <p className="text-sm text-muted">Usually a specific machine at your gym.</p>
          <div className="flex gap-2">
            <input
              id={`new-variation-${exerciseId}`}
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setAddError(null);
              }}
              placeholder="e.g. Glute Drive"
              maxLength={60}
              className={inputClasses}
              aria-invalid={addError ? true : undefined}
              aria-describedby={addError ? `new-variation-error-${exerciseId}` : undefined}
            />
            <button
              type="submit"
              className="inline-flex min-h-11 shrink-0 items-center rounded-[3px] bg-primary px-4 font-medium text-on-primary hover:opacity-85"
            >
              Add
            </button>
          </div>
          {addError && (
            <p id={`new-variation-error-${exerciseId}`} role="alert" className="text-sm text-red">
              {addError}
            </p>
          )}
        </form>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        title={`Delete "${deleting?.name ?? ""}"?`}
        message="It will be hidden from this list. Past workouts that used it keep showing its name."
        confirmLabel="Delete"
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteVariation(deleting.id);
          setDeleting(null);
        }}
      />
    </>
  );
}
