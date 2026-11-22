"use client";

import { useStore } from "@/lib/store";
import { countSets, plural } from "@/lib/summary";
import type { Template } from "@/lib/types";
import { Icon } from "./Icon";

type TemplateStartListProps = {
  onStart: (templateId: string) => void;
  /** Which templates to show, in order. Defaults to all of them, A–Z. */
  templates?: Template[];
  /** Drop the last row's bottom rule when the next section's top rule closes the list. */
  hideLastRule?: boolean;
};

/** Templates as one-tap starts (Workout start screen and Home). */
export function TemplateStartList({ onStart, templates: shown, hideLastRule = false }: TemplateStartListProps) {
  const { data } = useStore();
  const templates =
    shown ??
    [...data.templates].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base", numeric: true }));

  return (
    <ul className="mt-3 border-t border-rule">
      {templates.map((t) => (
        <li key={t.id} className={`border-b border-rule ${hideLastRule ? "last:border-b-0" : ""}`}>
          <button
            type="button"
            onClick={() => onStart(t.id)}
            className="flex min-h-16 w-full items-center justify-between gap-4 py-4 text-left hover:opacity-75"
          >
            <span className="min-w-0">
              <span className="block truncate text-lg font-bold tracking-tight">{t.name}</span>
              <span className="block text-sm text-muted tabular-nums">
                {plural(t.exercises.length, "exercise")} · {plural(countSets(t.exercises), "set")}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1 text-sm font-medium">
              Start
              <Icon name="arrow-right" size={18} />
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
