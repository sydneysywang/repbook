"use client";

import { useParams, useRouter } from "next/navigation";
import { NotFoundMessage } from "@/components/NotFoundMessage";
import { PageHeader } from "@/components/PageHeader";
import { TemplateForm } from "@/components/TemplateForm";
import { useStore } from "@/lib/store";

export function EditTemplate() {
  const { id } = useParams<{ id: string }>();
  const { ready, data, updateTemplate } = useStore();
  const router = useRouter();

  // Wait for browser data so the form starts with the saved template.
  if (!ready) return null;

  const template = data.templates.find((t) => t.id === id);
  if (!template) {
    return (
      <NotFoundMessage
        title="Template not found."
        helper="It may have been deleted, or the link is wrong."
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Edit template"
        back={{ href: `/templates/${template.id}`, label: template.name }}
      />
      <TemplateForm
        key={template.id}
        initial={{ name: template.name, exercises: template.exercises }}
        templateId={template.id}
        cancelHref={`/templates/${template.id}`}
        submitLabel="Save changes"
        onSave={(draft) => {
          const result = updateTemplate(template.id, draft);
          if (result.ok) router.replace(`/templates/${template.id}`);
          return result;
        }}
      />
    </>
  );
}
