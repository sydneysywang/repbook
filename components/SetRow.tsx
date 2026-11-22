"use client";

import { useState } from "react";
import type { SetEntry } from "@/lib/types";
import { Icon } from "./Icon";

function parseReps(text: string): number | null {
  const t = text.trim();
  return /^\d+$/.test(t) ? Number(t) : null;
}

function parseWeight(text: string): number | null {
  const t = text.trim().replace(",", ".");
  return /^\d+(\.\d*)?$|^\.\d+$/.test(t) ? Number(t) : null;
}

function format(value: number | null): string {
  return value === null ? "" : String(value);
}

type NumberFieldProps = {
  label: string;
  suffix: string;
  value: number | null;
  parse: (text: string) => number | null;
  inputMode: "numeric" | "decimal";
  invalid: boolean;
  onChange: (value: number | null) => void;
};

/**
 * Keeps the typed text locally so in-between input like "62." or "62," isn't
 * rewritten while typing; the stored value is a number or null.
 */
function NumberField({ label, suffix, value, parse, inputMode, invalid, onChange }: NumberFieldProps) {
  const [text, setText] = useState(() => format(value));
  // The value changed from outside (e.g. a copied set): show it.
  if (parse(text) !== value && !(value === null && text.trim() !== "" && parse(text) === null)) {
    setText(format(value));
  }
  return (
    <label className="relative flex-1">
      <span className="sr-only">{label}</span>
      <input
        type="text"
        inputMode={inputMode}
        autoComplete="off"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onChange(parse(e.target.value));
        }}
        aria-invalid={invalid || undefined}
        className={`min-h-11 w-full rounded-[3px] border bg-bg pr-10 pl-3 text-base tabular-nums text-ink focus:outline-none ${
          invalid ? "border-red focus:border-red" : "border-rule focus:border-ink"
        }`}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted"
      >
        {suffix}
      </span>
    </label>
  );
}

type SetRowProps = {
  index: number;
  set: SetEntry;
  exerciseName: string;
  incomplete: boolean;
  onChange: (set: SetEntry) => void;
  onRemove: () => void;
  /** Show the "done" tick (active workout only). */
  trackDone?: boolean;
};

export function SetRow({ index, set, exerciseName, incomplete, onChange, onRemove, trackDone = false }: SetRowProps) {
  const n = index + 1;
  const done = trackDone && set.done === true;
  const canTick = set.reps !== null && set.weight !== null;
  // Clearing a value un-ticks the set: a done set always has reps and weight.
  const change = (next: SetEntry) =>
    onChange(next.done && (next.reps === null || next.weight === null) ? { ...next, done: false } : next);

  return (
    <div
      className={`-mx-2 flex items-center gap-1.5 rounded-[3px] px-2 py-1 transition-colors sm:gap-2 ${
        done ? "bg-orange/15" : ""
      }`}
    >
      <span
        className={`w-6 shrink-0 text-sm font-medium tabular-nums ${done ? "text-ink" : "text-muted"}`}
      >
        {n}
      </span>
      <NumberField
        label={`${exerciseName}, set ${n}: weight in kg`}
        suffix="kg"
        value={set.weight}
        parse={parseWeight}
        inputMode="decimal"
        invalid={incomplete && set.weight === null}
        onChange={(weight) => change({ ...set, weight })}
      />
      <span aria-hidden className="text-muted">
        ×
      </span>
      <NumberField
        label={`${exerciseName}, set ${n}: reps`}
        suffix="reps"
        value={set.reps}
        parse={parseReps}
        inputMode="numeric"
        invalid={incomplete && set.reps === null}
        onChange={(reps) => change({ ...set, reps })}
      />
      {trackDone && (
        <button
          type="button"
          onClick={() => onChange({ ...set, done: !done })}
          disabled={!done && !canTick}
          aria-pressed={done}
          aria-label={`${exerciseName}, set ${n}: done`}
          title={!done && !canTick ? "Add weight and reps first" : undefined}
          className="flex size-11 shrink-0 items-center justify-center disabled:cursor-not-allowed disabled:opacity-35"
        >
          <span
            className={`flex size-8 items-center justify-center rounded-full border transition-colors ${
              done ? "border-primary bg-primary text-on-primary" : "border-rule text-muted"
            }`}
          >
            <Icon name="check" size={18} strokeWidth={done ? 2.2 : 1.6} />
          </span>
        </button>
      )}
      {done ? (
        // Keep the column so rows stay aligned; done sets can't be removed by accident.
        <span aria-hidden className="size-11 shrink-0" />
      ) : (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove set ${n} of ${exerciseName}`}
          className="flex size-11 shrink-0 items-center justify-center text-muted hover:text-ink"
        >
          <Icon name="close" size={18} />
        </button>
      )}
    </div>
  );
}
