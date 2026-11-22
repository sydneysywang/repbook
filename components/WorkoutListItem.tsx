"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { countSets, formatDate, formatDuration, formatVolume, plural, totalVolume } from "@/lib/summary";
import type { Workout } from "@/lib/types";
import { Icon } from "./Icon";

/** One past workout as a tappable row: date, template name, and its numbers. */
export function WorkoutListItem({ workout }: { workout: Workout }) {
  const { data } = useStore();
  const template = workout.templateId
    ? data.templates.find((t) => t.id === workout.templateId)
    : undefined;

  return (
    <li className="border-b border-rule">
      <Link
        href={`/history/${workout.id}`}
        className="flex min-h-16 items-center justify-between gap-4 py-4 hover:opacity-75"
      >
        <span className="min-w-0">
          <span className="block truncate text-lg font-bold tracking-tight">
            {formatDate(workout.startedAt)}
            {template && <span className="font-normal text-muted"> · {template.name}</span>}
          </span>
          <span className="block text-sm text-muted tabular-nums">
            {formatDuration(workout.startedAt, workout.finishedAt)} ·{" "}
            {plural(workout.exercises.length, "exercise")} · {plural(countSets(workout.exercises), "set")} ·{" "}
            {formatVolume(totalVolume(workout.exercises))}
          </span>
        </span>
        <Icon name="chevron-right" size={20} className="shrink-0 text-muted" />
      </Link>
    </li>
  );
}
