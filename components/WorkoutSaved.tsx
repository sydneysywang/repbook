"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { useStore } from "@/lib/store";
import { countSets, plural } from "@/lib/summary";
import { TEMPLATE_LIMIT_MESSAGE, canCreateTemplate, cloneName } from "@/lib/validation";
import { Button, buttonClasses } from "./Button";
import { ConfirmDialog } from "./ConfirmDialog";
import { Dialog } from "./Dialog";
import { GlowOrb } from "./GlowOrb";
import { Icon } from "./Icon";

export type SavedWorkoutInfo = {
  workoutId: string;
  /** The template the workout was started from, if any (it may since have been deleted). */
  templateId: string | null;
  exerciseCount: number;
  setCount: number;
  droppedSets: number;
};

/** The plain "Saved · …" line underneath keeps the confirmation clear. */
const SAVED_HEADINGS = [
  "You showed up. That's the hard part.",
  "Another one for the book.",
  "Nice work.",
];

type Outcome =
  | { kind: "created"; templateId: string; name: string }
  | { kind: "updated"; templateId: string; name: string }
  | { kind: "skipped" };

/**
 * Shown right after finishing: the glow-orb "Workout saved" moment, then the
 * one-time choice of what to do with templates.
 */
export function WorkoutSaved({ saved, onDone }: { saved: SavedWorkoutInfo; onDone: () => void }) {
  const { data, saveWorkoutAsTemplate, updateTemplateFromWorkout } = useStore();
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [dialog, setDialog] = useState<"new" | "update" | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  const workout = data.workouts.find((w) => w.id === saved.workoutId);
  const startedFromTemplate = saved.templateId !== null;
  const template = saved.templateId ? data.templates.find((t) => t.id === saved.templateId) : undefined;
  const atLimit = !canCreateTemplate(data.templates);
  // Steps through the list by workout count: varies from one workout to the
  // next, but stays put while this screen re-renders.
  const heading = SAVED_HEADINGS[data.workouts.length % SAVED_HEADINGS.length];

  function update() {
    if (!template) return;
    const result = updateTemplateFromWorkout(template.id, saved.workoutId);
    setDialog(null);
    if (!result.ok) return setProblem(result.problems[0]);
    setProblem(null);
    setOutcome({ kind: "updated", templateId: template.id, name: template.name });
  }

  return (
    <>
      <GlowOrb compact>
        <div role="status" className="max-w-sm text-center">
          <p className="text-4xl font-bold tracking-tight text-balance md:text-5xl">{heading}</p>
          <p className="mt-3 text-muted tabular-nums">
            Saved · {plural(saved.exerciseCount, "exercise")} · {plural(saved.setCount, "set")}
          </p>
          {saved.droppedSets > 0 && (
            <p className="mt-1 text-sm text-muted tabular-nums">
              {plural(saved.droppedSets, "unticked set")} left out
            </p>
          )}
        </div>
      </GlowOrb>

      {workout && (
        <section aria-labelledby="template-step" className="border-t border-rule py-6">
          <h2 id="template-step" className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <Icon name="asterisk" size={18} className="text-orange" />
            {startedFromTemplate ? "Your template" : "Do this again?"}
          </h2>

          {outcome ? (
            <OutcomeMessage outcome={outcome} />
          ) : (
            <>
              <p className="mt-2 text-muted">
                {!startedFromTemplate
                  ? "Save it as a template to start it in one tap next time."
                  : template
                    ? `Want “${template.name}” to match what you did today? Variations aren't saved in templates.`
                    : "The template you started from has been deleted. You can save today's workout as a new one."}
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {template && (
                  <Button onClick={() => setDialog("update")}>Update &ldquo;{template.name}&rdquo;</Button>
                )}
                <button
                  type="button"
                  disabled={atLimit}
                  onClick={() => setDialog("new")}
                  className={buttonClasses(template ? "secondary" : "primary")}
                >
                  {startedFromTemplate ? "Save as new template" : "Save as template"}
                  {!template && <Icon name="arrow-right" size={18} />}
                </button>
                <button
                  type="button"
                  onClick={() => setOutcome({ kind: "skipped" })}
                  className={buttonClasses("secondary")}
                >
                  {startedFromTemplate ? "Don't change templates" : "No thanks"}
                </button>
              </div>

              {atLimit && (
                <p className="mt-3 text-sm text-muted">
                  {TEMPLATE_LIMIT_MESSAGE}
                  {template && " You can still update the one you used."}
                </p>
              )}
              {problem && (
                <p role="alert" className="mt-3 text-sm text-muted">
                  {problem}
                </p>
              )}
            </>
          )}
        </section>
      )}

      <div className="border-t border-rule py-6">
        <button
          type="button"
          onClick={onDone}
          className={buttonClasses(outcome || !workout ? "primary" : "secondary")}
        >
          Done
          {(outcome || !workout) && <Icon name="arrow-right" size={18} />}
        </button>
      </div>

      {dialog === "update" && template && workout && (
        <ConfirmDialog
          open
          title={`Update “${template.name}”?`}
          message={`Its exercises and sets will be replaced with today's: ${plural(workout.exercises.length, "exercise")}, ${plural(countSets(workout.exercises), "set")}.`}
          confirmLabel="Update"
          onCancel={() => setDialog(null)}
          onConfirm={update}
        />
      )}

      {dialog === "new" && (
        <NameDialog
          initialName={template ? cloneName(template.name, data.templates) : ""}
          onCancel={() => setDialog(null)}
          onSave={(name) => {
            const result = saveWorkoutAsTemplate(saved.workoutId, name);
            if (!result.ok) return result.problems[0];
            setDialog(null);
            setProblem(null);
            setOutcome({ kind: "created", templateId: result.id, name: name.trim().replace(/\s+/g, " ") });
            return null;
          }}
        />
      )}
    </>
  );
}

function OutcomeMessage({ outcome }: { outcome: Outcome }) {
  if (outcome.kind === "skipped") {
    return <p className="mt-2 text-muted">No changes to your templates.</p>;
  }
  return (
    <p className="mt-2 text-muted">
      {outcome.kind === "created" ? "Saved as " : "Updated "}
      <Link
        href={`/templates/${outcome.templateId}`}
        className="font-medium text-ink underline underline-offset-4"
      >
        {outcome.name}
      </Link>
      {outcome.kind === "created" ? ". Start it from Home or Workout next time." : "."}
    </p>
  );
}

function NameDialog({
  initialName,
  onCancel,
  onSave,
}: {
  initialName: string;
  onCancel: () => void;
  /** Returns a problem to show, or null when saved. */
  onSave: (name: string) => string | null;
}) {
  const [name, setName] = useState(initialName);
  const [problem, setProblem] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    setProblem(onSave(name));
  }

  return (
    <Dialog open onClose={onCancel} title="Save as template" initialFocusRef={inputRef}>
      <form onSubmit={submit} noValidate className="p-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-muted">Template name</span>
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setProblem(null);
            }}
            placeholder="e.g. Push day"
            maxLength={60}
            aria-invalid={problem !== null}
            aria-describedby={problem ? "template-name-problem" : undefined}
            className="min-h-12 w-full rounded-[3px] border border-rule bg-bg px-3 text-lg font-medium text-ink placeholder:text-muted focus:border-ink focus:outline-none"
          />
        </label>
        {problem && (
          <p id="template-name-problem" role="alert" className="mt-2 text-sm text-muted">
            {problem}
          </p>
        )}
        <p className="mt-3 text-sm text-muted">
          Saves today&apos;s exercises, sets, reps and weights. Variations are picked during each
          workout.
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save template</Button>
        </div>
      </form>
    </Dialog>
  );
}
