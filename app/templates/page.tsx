"use client";

import Link from "next/link";
import { Button, ButtonLink } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { useStore } from "@/lib/store";
import { countSets, plural } from "@/lib/summary";
import { TEMPLATE_LIMIT, TEMPLATE_LIMIT_MESSAGE, canCreateTemplate } from "@/lib/validation";

export default function TemplatesPage() {
  const { data } = useStore();
  const templates = [...data.templates].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
  const canCreate = canCreateTemplate(data.templates);

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

      {templates.length === 0 ? (
        <EmptyState
          title="No templates yet."
          helper="Save your go-to routines here to start them in one tap."
          action={<ButtonLink href="/templates/new">New template</ButtonLink>}
        />
      ) : (
        <>
          <div className="py-6">
            {canCreate ? (
              <ButtonLink href="/templates/new">New template</ButtonLink>
            ) : (
              <>
                <Button disabled aria-describedby="limit-note">
                  New template
                </Button>
                <p id="limit-note" className="mt-3 text-sm text-muted">
                  {TEMPLATE_LIMIT_MESSAGE}
                </p>
              </>
            )}
          </div>
          <ul className="border-t border-rule">
            {templates.map((t) => (
              <li key={t.id} className="border-b border-rule">
                <Link
                  href={`/templates/${t.id}`}
                  className="flex min-h-16 items-center justify-between gap-4 py-4 hover:opacity-75"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-lg font-bold tracking-tight">{t.name}</span>
                    <span className="block text-sm text-muted tabular-nums">
                      {plural(t.exercises.length, "exercise")} · {plural(countSets(t.exercises), "set")}
                    </span>
                  </span>
                  <Icon name="chevron-right" size={20} className="shrink-0 text-muted" />
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
