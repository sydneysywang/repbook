import { Suspense } from "react";
import { TemplateView } from "./TemplateView";

// The id is only known at request time (and the data lives in the browser),
// so the client component reading it sits inside Suspense.
export default function TemplatePage() {
  return (
    <Suspense fallback={null}>
      <TemplateView />
    </Suspense>
  );
}
