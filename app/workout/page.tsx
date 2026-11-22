import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";

export default function WorkoutPage() {
  return (
    <>
      <PageHeader title="Workout" />
      <EmptyState
        title="No workout running."
        helper="Soon you'll start a blank workout or pick a template here."
      />
    </>
  );
}
