import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";

export default function HomePage() {
  return (
    <>
      <PageHeader title="Ready to train?" subtitle="Your workouts, templates and progress live here." />
      <EmptyState
        title="No workouts yet — start your first one."
        helper="Quick starts and your weekly summary will show up here."
      />
    </>
  );
}
