"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Icon } from "@/components/Icon";
import { NotFoundMessage } from "@/components/NotFoundMessage";
import { PageHeader } from "@/components/PageHeader";
import { useStore } from "@/lib/store";
import { countSets, formatSet, plural } from "@/lib/summary";

export function TemplateView() {
  const { id } = useParams<{ id: string }>();
  const { ready, data, exerciseName, cloneTemplate, deleteTemplate, startWorkout } = useStore();
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [cloneProblem, setCloneProblem] = useState<string | null>(null);
  const [startProblem, setStartProblem] = useState<string | null>(null);
  // Just deleted: render nothing while navigating away (avoids a "not found" flash).
  const [leaving, setLeaving] = useState(false);

  if (!ready || leaving) return null;

  const template = data.templates.find((t) => t.id === id);
  if (!template) {
    return (
      <NotFoundMessage
        title="Template not found."
        helper="It may have been deleted, or the link is wrong."
      />
    );
  }

  function clone() {
    const result = cloneTemplate(template!.id);
    if (result.ok) router.push(`/templates/${result.id}`);
    else setCloneProblem(result.problems[0]);
  }

  function start() {
    const result = startWorkout(template!.id);
    if (result.ok) router.push("/workout");
    else setStartProblem(result.problems[0]);
  }

  const running = data.activeWorkout !== null;

  return (
    <>
      <PageHeader
        title={template.name}
        back={{ href: "/templates", label: "Templates" }}
        subtitle={
          <span className="tabular-nums">
            {plural(template.exercises.length, "exercise")} · {plural(countSets(template.exercises), "set")}
          </span>
        }
      />

      <ol>
        {template.exercises.map((ex) => (
          <li key={ex.id} className="border-b border-rule py-5">
            <h2 className="text-lg font-bold tracking-tight">{exerciseName(ex.exerciseId)}</h2>
            <ol className="mt-2 flex flex-col gap-1">
              {ex.sets.map((set, i) => (
                <li key={set.id} className="flex gap-4 tabular-nums">
                  <span className="w-5 text-muted">{i + 1}</span>
                  <span>{formatSet(set)}</span>
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ol>

      <div className="pt-6">
        {running ? (
          <>
            <ButtonLink href="/workout">Resume workout</ButtonLink>
            <p className="mt-3 text-sm text-muted">
              A workout is already running. Finish or discard it to start this template.
            </p>
          </>
        ) : (
          <Button onClick={start}>Start workout</Button>
        )}
        {startProblem && (
          <p role="alert" className="mt-3 text-sm text-muted">
            {startProblem}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-3 pt-4">
        <ButtonLink href={`/templates/${template.id}/edit`} variant="secondary">
          <Icon name="pencil" size={18} />
          Edit
        </ButtonLink>
        <Button variant="secondary" onClick={clone}>
          <Icon name="copy" size={18} />
          Clone
        </Button>
        <Button variant="secondary" onClick={() => setConfirmDelete(true)}>
          <Icon name="trash" size={18} />
          Delete
        </Button>
      </div>
      {cloneProblem && (
        <p role="alert" className="mt-3 text-sm text-muted">
          {cloneProblem}
        </p>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete "${template.name}"?`}
        message="This removes the template. Past workouts aren't affected."
        confirmLabel="Delete"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          setLeaving(true);
          router.replace("/templates");
          deleteTemplate(template.id);
        }}
      />
    </>
  );
}
