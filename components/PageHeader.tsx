import Link from "next/link";
import type { ReactNode } from "react";
import { Glow } from "./Glow";
import { Icon } from "./Icon";

type PageHeaderProps = {
  title: string;
  subtitle?: ReactNode;
  /** Optional link back up a level, shown above the title. */
  back?: { href: string; label: string };
};

/** Page title with the warm glow behind it, followed by a rule line. */
export function PageHeader({ title, subtitle, back }: PageHeaderProps) {
  return (
    <header className="relative isolate border-b border-rule pb-6">
      <Glow />
      {back && (
        <Link
          href={back.href}
          className="-ml-1 mb-3 inline-flex min-h-11 items-center gap-1.5 px-1 text-sm font-medium text-muted hover:text-ink"
        >
          <Icon name="arrow-left" size={18} />
          {back.label}
        </Link>
      )}
      <h1 className="text-4xl font-bold tracking-tight break-words md:text-5xl">{title}</h1>
      {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
    </header>
  );
}
