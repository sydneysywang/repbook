"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { TemplateStartList } from "@/components/TemplateStartList";
import { WorkoutListItem } from "@/components/WorkoutListItem";
import { useStore } from "@/lib/store";
import {
  countSince,
  formatClock,
  recentTemplates,
  sortNewestFirst,
  startOfMonth,
  startOfWeek,
} from "@/lib/summary";

export default function HomePage() {
  const { data, startWorkout } = useStore();
  const router = useRouter();
  const [problem, setProblem] = useState<string | null>(null);

  const active = data.activeWorkout;
  const lastWorkout = sortNewestFirst(data.workouts)[0];
  const quickStarts = recentTemplates(data.templates, data.workouts).slice(0, 3);

  function start(templateId?: string) {
    const result = startWorkout(templateId);
    if (result.ok) router.push("/workout");
    else setProblem(result.problems[0]);
  }

  return (
    <>
      <PageHeader
        title={active ? "Keep going." : "Ready to train?"}
        subtitle={
          active ? (
            <span className="tabular-nums">Workout started at {formatClock(active.startedAt)}.</span>
          ) : (
            "Start blank, or pick one of your templates."
          )
        }
      />

      <div className="py-6">
        {active ? (
          <ButtonLink href="/workout" className="min-h-14 w-full text-lg sm:w-auto">
            Resume workout
          </ButtonLink>
        ) : (
          <Button onClick={() => start()} className="min-h-14 w-full text-lg sm:w-auto">
            Start workout
          </Button>
        )}
        {problem && (
          <p role="alert" className="mt-3 text-sm text-muted">
            {problem}
          </p>
        )}
      </div>

      {!active && data.templates.length > 0 && (
        <section aria-labelledby="quick-start" className="border-t border-rule pt-6">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="quick-start" className="flex items-center gap-2 font-bold">
              <Icon name="asterisk" size={18} className="text-orange" />
              Quick start
            </h2>
            <Link
              href="/templates"
              className="inline-flex min-h-11 items-center text-sm font-medium text-muted hover:text-ink"
            >
              All templates
            </Link>
          </div>
          <TemplateStartList onStart={start} templates={quickStarts} hideLastRule />
        </section>
      )}

      {data.workouts.length === 0 ? (
        <div className="border-t border-rule">
          <EmptyState
            title="No workouts yet — start your first one."
            helper={
              data.templates.length === 0
                ? "Tip: save a template for the routine you do most, then start it in one tap."
                : "Your weekly count and last workout will show up here."
            }
          />
        </div>
      ) : (
        <>
          <TrainingSummary />

          <section aria-labelledby="last-workout" className="border-t border-rule pt-6">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="last-workout" className="flex items-center gap-2 font-bold">
                <Icon name="asterisk" size={18} className="text-orange" />
                Last workout
              </h2>
              <Link
                href="/history"
                className="inline-flex min-h-11 items-center text-sm font-medium text-muted hover:text-ink"
              >
                All history
              </Link>
            </div>
            <ul className="border-t border-rule">
              <WorkoutListItem workout={lastWorkout} />
            </ul>
          </section>
        </>
      )}
    </>
  );
}

/** Weekly and monthly counts. Only rendered in the browser once workouts exist (reads the clock). */
function TrainingSummary() {
  const { data } = useStore();
  const now = new Date();
  const thisWeek = countSince(data.workouts, startOfWeek(now));
  const thisMonth = countSince(data.workouts, startOfMonth(now));

  return (
    <section aria-labelledby="summary" className="border-t border-rule pt-6">
      <h2 id="summary" className="flex items-center gap-2 font-bold">
        <Icon name="asterisk" size={18} className="text-orange" />
        Your training
      </h2>
      <dl className="mt-3 grid grid-cols-2 gap-4 pb-6">
        <div>
          <dt className="text-sm text-muted">Workouts this week</dt>
          <dd className="text-4xl font-bold tracking-tight tabular-nums">{thisWeek}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Workouts this month</dt>
          <dd className="text-4xl font-bold tracking-tight tabular-nums">{thisMonth}</dd>
        </div>
      </dl>
    </section>
  );
}
