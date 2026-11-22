"use client";

import { useStore } from "@/lib/store";
import { formatSet, formatShortDate, lastTimeFor } from "@/lib/summary";

/** "Last time · 12 Nov: 60 kg × 8, 60 kg × 8" for this exercise + variation. */
export function LastTimeHint({ exerciseId, variationId }: { exerciseId: string; variationId: string | null }) {
  const { data } = useStore();
  const last = lastTimeFor(data.workouts, exerciseId, variationId);

  if (!last) {
    return (
      <p className="mt-2 text-sm text-muted">
        {variationId ? "First time with this variation." : "First time logging this."}
      </p>
    );
  }
  return (
    <p className="mt-2 text-sm text-muted tabular-nums">
      <span className="font-medium text-ink">Last time</span> · {formatShortDate(last.startedAt)}:{" "}
      {last.sets.map(formatSet).join(", ")}
    </p>
  );
}
