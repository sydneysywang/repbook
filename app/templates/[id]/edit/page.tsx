import { Suspense } from "react";
import { EditTemplate } from "./EditTemplate";

export default function EditTemplatePage() {
  return (
    <Suspense fallback={null}>
      <EditTemplate />
    </Suspense>
  );
}
