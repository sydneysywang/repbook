"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Dialog } from "@/components/Dialog";
import { ExerciseEditor, newSet } from "@/components/ExerciseEditor";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { VariationPicker } from "@/components/VariationPicker";
import { useStore } from "@/lib/store";
import { countSets, formatClock, formatElapsed, plural } from "@/lib/summary";
import type { ActiveWorkout, WorkoutExercise } from "@/lib/types";
import { prepareWorkoutForSave } from "@/lib/validation";

type Saved = { exerciseCount: number; setCount: number; droppedSets: number };

export default function WorkoutPage() {
  const { data } = useStore();
  const [saved, setSaved] = useState<Saved | null>(null);

  if (data.activeWorkout) {
    return <ActiveWorkoutView active={data.activeWorkout} onSaved={setSaved} />;
  }
  return <StartScreen saved={saved} onStart={() => setSaved(null)} />;
}

/* ---------- No workout running ---------- */

function StartScreen({ saved, onStart }: { saved: Saved | null; onStart: () => void }) {
  const { data, startWorkout } = useStore();
  const templates = [...data.templates].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
  const [problem, setProblem] = useState<string | null>(null);

  function start(templateId?: string) {
    const result = startWorkout(templateId);
    if (result.ok) onStart();
    else setProblem(result.problems[0]);
  }

  return (
    <>
      <PageHeader title="Workout" subtitle="Start blank, or pick up one of your templates." />

      {saved && (
        <div role="status" className="border-b border-rule py-5">
          <p className="flex items-center gap-2 font-bold">
            <Icon name="asterisk" size={18} className="shrink-0 text-orange" />
            Workout saved.
          </p>
          <p className="mt-1 text-sm text-muted tabular-nums">
            {plural(saved.exerciseCount, "exercise")} · {plural(saved.setCount, "set")}
            {saved.droppedSets > 0 &&
              ` · ${plural(saved.droppedSets, "incomplete set")} left out`}
          </p>
        </div>
      )}

      <div className="py-6">
        <Button onClick={() => start()}>Start blank workout</Button>
        {problem && (
          <p role="alert" className="mt-3 text-sm text-muted">
            {problem}
          </p>
        )}
      </div>

      <section aria-labelledby="start-from-template" className="border-t border-rule pt-6">
        <h2 id="start-from-template" className="flex items-center gap-2 font-bold">
          <Icon name="asterisk" size={18} className="text-orange" />
          Or start from a template
        </h2>
        {templates.length === 0 ? (
          <p className="mt-2 text-muted">
            No templates yet.{" "}
            <Link href="/templates/new" className="font-medium text-ink underline underline-offset-4">
              Create one
            </Link>{" "}
            to start your usual routine in one tap.
          </p>
        ) : (
          <ul className="mt-3 border-t border-rule">
            {templates.map((t) => (
              <li key={t.id} className="border-b border-rule">
                <button
                  type="button"
                  onClick={() => start(t.id)}
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
        )}
      </section>
    </>
  );
}

/* ---------- Workout running ---------- */

function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function ActiveWorkoutView({ active, onSaved }: { active: ActiveWorkout; onSaved: (s: Saved) => void }) {
  const { data, exerciseName, updateActiveExercises, discardWorkout, finishWorkout } = useStore();
  const now = useNow(30_000);
  const [confirm, setConfirm] = useState<"finish" | "discard" | null>(null);
  const [finishProblem, setFinishProblem] = useState<string | null>(null);

  const template = active.templateId ? data.templates.find((t) => t.id === active.templateId) : undefined;
  const title = template?.name ?? "Workout in progress";
  const prepared = prepareWorkoutForSave(active.exercises);

  function finish() {
    const result = finishWorkout();
    setConfirm(null);
    if (!result.ok) return setFinishProblem(result.problems[0]);
    onSaved(result);
    window.scrollTo({ top: 0 });
  }

  return (
    <>
      <PageHeader
        title={title}
        subtitle={
          <span className="tabular-nums">
            Started {formatClock(active.startedAt)} · {formatElapsed(active.startedAt, now)}
          </span>
        }
      />

      <ExerciseEditor<WorkoutExercise>
        exercises={active.exercises}
        onChange={updateActiveExercises}
        createExercise={(exerciseId) => ({
          id: crypto.randomUUID(),
          exerciseId,
          variationId: null,
          sets: [newSet()],
        })}
        renderExtra={(ex, update) => (
          <VariationPicker
            exerciseId={ex.exerciseId}
            exerciseName={exerciseName(ex.exerciseId)}
            variationId={ex.variationId}
            onChange={(variationId) => update({ ...ex, variationId })}
          />
        )}
        emptyTitle="Nothing logged yet."
        emptyHelper="Add your first exercise, then log each set's weight and reps."
      />

      <div className="mt-8 border-t border-rule pt-6">
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => {
              setFinishProblem(null);
              setConfirm("finish");
            }}
          >
            Finish workout
          </Button>
          <Button variant="secondary" onClick={() => setConfirm("discard")}>
            Discard
          </Button>
        </div>
        {finishProblem && (
          <p role="alert" className="mt-3 text-sm text-muted">
            {finishProblem}
          </p>
        )}
      </div>

      {confirm === "finish" &&
        (prepared.completeSets === 0 ? (
          <Dialog open onClose={() => setConfirm(null)} title="Nothing to save yet">
            <div className="p-5">
              <p className="text-muted">
                Log at least one set with both weight and reps (use 0 kg for bodyweight), then finish.
              </p>
              <div className="mt-6 flex justify-end">
                <Button variant="secondary" onClick={() => setConfirm(null)}>
                  Keep going
                </Button>
              </div>
            </div>
          </Dialog>
        ) : (
          <ConfirmDialog
            open
            title="Finish workout?"
            message={
              `${plural(prepared.exercises.length, "exercise")} and ${plural(prepared.completeSets, "set")} will be saved.` +
              (prepared.droppedSets > 0
                ? ` ${plural(prepared.droppedSets, "set")} missing weight or reps will be left out.`
                : "")
            }
            confirmLabel="Finish"
            onCancel={() => setConfirm(null)}
            onConfirm={finish}
          />
        ))}

      <ConfirmDialog
        open={confirm === "discard"}
        title="Discard this workout?"
        message="Everything you've logged in this workout will be deleted. This can't be undone."
        confirmLabel="Discard"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          setConfirm(null);
          discardWorkout();
        }}
      />
    </>
  );
}
