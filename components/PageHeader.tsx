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
    // No `isolate` here: the glow overhangs the header, and as its own stacking
    // context it painted over the button below (e.g. a washed-out "Start
    // workout"). Without it, the glow's -z-10 sits behind all of <main>.
    <header className="relative border-b border-rule pb-6">
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
