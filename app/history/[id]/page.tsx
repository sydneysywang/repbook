import { Suspense } from "react";
import { WorkoutDetail } from "./WorkoutDetail";

// The id is only known at request time (and the data lives in the browser),
// so the client component reading it sits inside Suspense.
export default function WorkoutPage() {
  return (
    <Suspense fallback={null}>
      <WorkoutDetail />
    </Suspense>
  );
}
