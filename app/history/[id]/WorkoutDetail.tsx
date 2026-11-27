"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ExerciseEditor, newSet } from "@/components/ExerciseEditor";
import { Icon } from "@/components/Icon";
import { useLeaveGuard } from "@/components/LeaveGuard";
import { NotFoundMessage } from "@/components/NotFoundMessage";
import { PageHeader } from "@/components/PageHeader";
import { VariationPicker } from "@/components/VariationPicker";
import { useStore } from "@/lib/store";
import {
  countSets,
  formatClock,
  formatDate,
  formatDuration,
  formatSet,
  formatVolume,
  totalVolume,
} from "@/lib/summary";
import type { Workout, WorkoutExercise } from "@/lib/types";
import { validateWorkoutEdit } from "@/lib/validation";

export function WorkoutDetail() {
  const { id } = useParams<{ id: string }>();
  const { ready, data, deleteWorkout } = useStore();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Just deleted: render nothing while navigating away (avoids a "not found" flash).
  const [leaving, setLeaving] = useState(false);

  if (!ready || leaving) return null;

  const workout = data.workouts.find((w) => w.id === id);
  if (!workout) {
    return (
      <NotFoundMessage title="Workout not found." helper="It may have been deleted, or the link is wrong." />
    );
  }

  const template = workout.templateId ? data.templates.find((t) => t.id === workout.templateId) : undefined;

  return (
    <>
      <PageHeader
        title={formatDate(workout.startedAt)}
        subtitle={
          <span className="tabular-nums">
            {formatClock(workout.startedAt)}–{formatClock(workout.finishedAt)} ·{" "}
            {formatDuration(workout.startedAt, workout.finishedAt)}
            {template && (
              <>
                {" · "}
                <Link href={`/templates/${template.id}`} className="underline underline-offset-4 hover:text-ink">
                  {template.name}
                </Link>
              </>
            )}
          </span>
        }
      />

      {editing ? (
        <EditWorkout key={workout.id} workout={workout} onDone={() => setEditing(false)} />
      ) : (
        <>
          <Stats workout={workout} />
          <WorkoutExercises workout={workout} />

          <div className="flex flex-wrap gap-3 pt-6">
            <Button variant="secondary" onClick={() => setEditing(true)}>
              <Icon name="pencil" size={18} />
              Edit
            </Button>
            <Button variant="secondary" onClick={() => setConfirmDelete(true)}>
              <Icon name="trash" size={18} />
              Delete
            </Button>
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this workout?"
        message="It will be removed from your history and summaries. This can't be undone."
        confirmLabel="Delete"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          setLeaving(true);
          router.replace("/history");
          deleteWorkout(workout.id);
        }}
      />
    </>
  );
}

function Stats({ workout }: { workout: Workout }) {
  const stats = [
    { label: "Exercises", value: String(workout.exercises.length) },
    { label: "Sets", value: String(countSets(workout.exercises)) },
    { label: "Volume", value: formatVolume(totalVolume(workout.exercises)) },
  ];
  return (
    <dl className="grid grid-cols-3 border-b border-rule py-5">
      {stats.map((s) => (
        <div key={s.label}>
          <dt className="text-sm text-muted">{s.label}</dt>
          <dd className="text-2xl font-bold tracking-tight tabular-nums">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function WorkoutExercises({ workout }: { workout: Workout }) {
  const { exerciseName, getVariation } = useStore();
  return (
    <ol>
      {workout.exercises.map((ex) => {
        // Deleted variations still show their name on past workouts.
        const variation = ex.variationId ? getVariation(ex.variationId) : undefined;
        return (
          <li key={ex.id} className="border-b border-rule py-5">
            <h2 className="text-lg font-bold tracking-tight">{exerciseName(ex.exerciseId)}</h2>
            {variation && <p className="text-sm text-muted">{variation.name}</p>}
            <ol className="mt-2 flex flex-col gap-1">
              {ex.sets.map((set, i) => (
                <li key={set.id} className="flex gap-4 tabular-nums">
                  <span className="w-5 text-muted">{i + 1}</span>
                  <span>{formatSet(set)}</span>
                </li>
              ))}
            </ol>
          </li>
        );
      })}
    </ol>
  );
}

function EditWorkout({ workout, onDone }: { workout: Workout; onDone: () => void }) {
  const { exerciseName, updateWorkout } = useStore();
  const [exercises, setExercises] = useState<WorkoutExercise[]>(workout.exercises);
  const [showProblems, setShowProblems] = useState(false);
  const [saveProblems, setSaveProblems] = useState<string[]>([]);
  // Back or a nav tab asks before throwing away unsaved edits.
  useLeaveGuard(exercises !== workout.exercises);

  const validation = validateWorkoutEdit(exercises, exerciseName);
  const problems = showProblems ? (validation.problems.length ? validation.problems : saveProblems) : [];

  function save() {
    setShowProblems(true);
    if (validation.problems.length > 0) return;
    const result = updateWorkout(workout.id, exercises);
    if (!result.ok) return setSaveProblems(result.problems);
    onDone();
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="pt-2">
      <ExerciseEditor<WorkoutExercise>
        exercises={exercises}
        onChange={(next) => {
          setExercises(next);
          setSaveProblems([]);
        }}
        createExercise={(exerciseId) => ({
          id: crypto.randomUUID(),
          exerciseId,
          variationId: null,
          sets: [newSet()],
        })}
        incompleteSetIds={showProblems ? validation.incompleteSetIds : undefined}
        renderExtra={(ex, update) => (
          <VariationPicker
            exerciseId={ex.exerciseId}
            exerciseName={exerciseName(ex.exerciseId)}
            variationId={ex.variationId}
            onChange={(variationId) => update({ ...ex, variationId })}
          />
        )}
        emptyTitle="No exercises left."
        emptyHelper="Add one back, or cancel and delete the workout instead."
      />

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
          <Button onClick={save}>Save changes</Button>
          <Button variant="secondary" onClick={onDone}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
