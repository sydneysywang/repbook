import type { ReactNode } from "react";
import { Icon } from "./Icon";

type EmptyStateProps = {
  title: string;
  helper: string;
  action?: ReactNode;
};

/** ✱ + short bold line + one muted helper line. Left-aligned, not boxed. */
export function EmptyState({ title, helper, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-start gap-2 py-8">
      <Icon name="asterisk" size={28} className="text-orange" />
      <p className="text-lg font-bold tracking-tight">{title}</p>
      <p className="text-muted">{helper}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
