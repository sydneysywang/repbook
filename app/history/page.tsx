import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";

export default function HistoryPage() {
  return (
    <>
      <PageHeader title="History" />
      <EmptyState
        title="No workouts yet."
        helper="Finished workouts will appear here, newest first."
      />
    </>
  );
}
