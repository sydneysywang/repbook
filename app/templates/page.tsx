"use client";

import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { useStore } from "@/lib/store";

const TEMPLATE_LIMIT = 20;

export default function TemplatesPage() {
  const { data } = useStore();
  return (
    <>
      <PageHeader
        title="Templates"
        subtitle={
          <span className="tabular-nums">
            {data.templates.length} / {TEMPLATE_LIMIT}
          </span>
        }
      />
      <EmptyState
        title="No templates yet."
        helper="Save your go-to routines here to start them in one tap."
      />
    </>
  );
}
