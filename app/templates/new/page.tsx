"use client";

import { useRouter } from "next/navigation";
import { ButtonLink } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { TemplateForm } from "@/components/TemplateForm";
import { useStore } from "@/lib/store";
import { TEMPLATE_LIMIT_MESSAGE, canCreateTemplate } from "@/lib/validation";

export default function NewTemplatePage() {
  const { ready, data, createTemplate } = useStore();
  const router = useRouter();

  if (!ready) return null;

  return (
    <>
      <PageHeader title="New template" back={{ href: "/templates", label: "Templates" }} />
      {canCreateTemplate(data.templates) ? (
        <TemplateForm
          initial={{ name: "", exercises: [] }}
          cancelHref="/templates"
          submitLabel="Save template"
          onSave={(draft) => {
            const result = createTemplate(draft);
            if (result.ok) router.replace(`/templates/${result.id}`);
            return result;
          }}
        />
      ) : (
        <EmptyState
          title="Template limit reached."
          helper={TEMPLATE_LIMIT_MESSAGE}
          action={
            <ButtonLink href="/templates" variant="secondary">
              Back to templates
            </ButtonLink>
          }
        />
      )}
    </>
  );
}
