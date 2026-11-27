"use client";

import { useState, type FormEvent } from "react";
import { useStore, type ActionResult } from "@/lib/store";
import type { TemplateExercise } from "@/lib/types";
import { validateTemplate, type TemplateDraft } from "@/lib/validation";
import { Button, ButtonLink } from "./Button";
import { ExerciseEditor, newSet } from "./ExerciseEditor";
import { Icon } from "./Icon";
import { useLeaveGuard } from "./LeaveGuard";

type TemplateFormProps = {
  initial: TemplateDraft;
  /** Template being edited; undefined when creating. */
  templateId?: string;
  cancelHref: string;
  submitLabel: string;
  onSave: (draft: TemplateDraft) => ActionResult;
};

export function TemplateForm({ initial, templateId, cancelHref, submitLabel, onSave }: TemplateFormProps) {
  const { data, exerciseName } = useStore();
  const [draft, setDraft] = useState<TemplateDraft>(initial);
  // Problems only show after the first save attempt, then update live as they're fixed.
  const [attempted, setAttempted] = useState(false);
  const [saveProblems, setSaveProblems] = useState<string[]>([]);
  // Back or a nav tab asks before throwing away unsaved edits.
  const [startDraft] = useState(initial);
  useLeaveGuard(draft !== startDraft);

  const validation = validateTemplate(draft, data.templates, exerciseName, templateId);
  const problems = attempted ? (validation.problems.length ? validation.problems : saveProblems) : [];

  function submit(e: FormEvent) {
    e.preventDefault();
    setAttempted(true);
    if (validation.problems.length) return;
    const result = onSave(draft);
    if (!result.ok) setSaveProblems(result.problems);
  }

  return (
    <form onSubmit={submit} noValidate className="pt-6">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-muted">Template name</span>
        <input
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          placeholder="e.g. Push day"
          maxLength={60}
          className="min-h-12 w-full rounded-[3px] border border-rule bg-bg px-3 text-lg font-medium text-ink placeholder:text-muted focus:border-ink focus:outline-none"
        />
      </label>

      <div className="mt-4 border-t border-rule">
        <ExerciseEditor<TemplateExercise>
          exercises={draft.exercises}
          onChange={(exercises) => setDraft({ ...draft, exercises })}
          createExercise={(exerciseId) => ({ id: crypto.randomUUID(), exerciseId, sets: [newSet()] })}
          incompleteSetIds={attempted ? validation.incompleteSetIds : undefined}
          emptyHelper="Add the exercises you usually do, with your target reps and weight."
        />
      </div>

      <div className="mt-8 border-t border-rule pt-6">
        {problems.length > 0 && (
          <div role="alert" className="mb-5">
            <p className="flex items-center gap-2 font-bold">
              <Icon name="asterisk" size={18} className="shrink-0 text-red" />
              {problems.length === 1 ? "One thing to fix before saving" : "A few things to fix before saving"}
            </p>
            <ul className="mt-2 list-disc pl-6 text-sm text-muted">
              {problems.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          <Button type="submit">{submitLabel}</Button>
          <ButtonLink href={cancelHref} variant="secondary">
            Cancel
          </ButtonLink>
        </div>
      </div>
    </form>
  );
}
