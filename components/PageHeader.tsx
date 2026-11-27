import type { ReactNode } from "react";
import { Glow } from "./Glow";

type PageHeaderProps = {
  title: string;
  subtitle?: ReactNode;
};

/**
 * Page title with the warm glow behind it, followed by a rule line.
 * The "Back" button is rendered by AppShell at the top of the page content, above this.
 */
export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    // No `isolate` here: the glow overhangs the header, and as its own stacking
    // context it painted over the button below (e.g. a washed-out "Start
    // workout"). Without it, the glow's -z-10 sits behind all of <main>.
    <header className="relative border-b border-rule pb-6">
      <Glow />
      <h1 className="text-4xl font-bold tracking-tight break-words md:text-5xl">{title}</h1>
      {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
    </header>
  );
}
