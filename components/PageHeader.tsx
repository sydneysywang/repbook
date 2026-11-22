import type { ReactNode } from "react";
import { Glow } from "./Glow";

type PageHeaderProps = {
  title: string;
  subtitle?: ReactNode;
};

/** Page title with the warm glow behind it, followed by a rule line. */
export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="relative isolate border-b border-rule pb-6">
      <Glow />
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{title}</h1>
      {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
    </header>
  );
}
