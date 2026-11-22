"use client";

import { ButtonLink } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { WorkoutListItem } from "@/components/WorkoutListItem";
import { useStore } from "@/lib/store";
import { plural, sortNewestFirst } from "@/lib/summary";

export default function HistoryPage() {
  const { data } = useStore();
  const workouts = sortNewestFirst(data.workouts);

  return (
    <>
      <PageHeader
        title="History"
        subtitle={workouts.length > 0 && <span className="tabular-nums">{plural(workouts.length, "workout")}</span>}
      />
      {workouts.length === 0 ? (
        <EmptyState
          title="No workouts yet — start your first one."
          helper="Finished workouts will appear here, newest first."
          action={<ButtonLink href="/workout">Go to workout</ButtonLink>}
        />
      ) : (
        <ul>
          {workouts.map((w) => (
            <WorkoutListItem key={w.id} workout={w} />
          ))}
        </ul>
      )}
    </>
  );
}
