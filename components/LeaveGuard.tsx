"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { ConfirmDialog } from "./ConfirmDialog";

type LeaveGuard = {
  /** Go to `href`, asking first if the page has unsaved changes. */
  leave: (href: string) => void;
  /** onClick for a <Link>: stops it and asks first if there are unsaved changes. */
  onLinkClick: (event: MouseEvent, href: string) => void;
  hold: () => () => void;
};

const LeaveGuardContext = createContext<LeaveGuard | null>(null);

function useLeaveGuardContext(): LeaveGuard {
  const ctx = useContext(LeaveGuardContext);
  if (!ctx) throw new Error("LeaveGuardProvider is missing");
  return ctx;
}

/**
 * Lets a page with an in-place edit (a past workout, a template form) ask
 * "Discard your changes?" before the app's own Back button or nav links take
 * the user away.
 */
export function LeaveGuardProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const holds = useRef(0);
  const [pending, setPending] = useState<string | null>(null);

  const value = useMemo<LeaveGuard>(
    () => ({
      leave: (href) => (holds.current > 0 ? setPending(href) : router.push(href)),
      onLinkClick: (event, href) => {
        // Let new-tab / new-window clicks through: they don't lose anything.
        if (holds.current === 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        setPending(href);
      },
      hold: () => {
        holds.current += 1;
        return () => {
          holds.current -= 1;
        };
      },
    }),
    [router],
  );

  return (
    <LeaveGuardContext.Provider value={value}>
      {children}
      <ConfirmDialog
        open={pending !== null}
        title="Discard your changes?"
        message="You've made changes on this page that aren't saved yet. Leaving now loses them."
        confirmLabel="Discard"
        onCancel={() => setPending(null)}
        onConfirm={() => {
          const href = pending;
          setPending(null);
          if (href) router.push(href);
        }}
      />
    </LeaveGuardContext.Provider>
  );
}

export function useLeave() {
  return useLeaveGuardContext().leave;
}

export function useLeaveLinkClick() {
  return useLeaveGuardContext().onLinkClick;
}

/** While `active`, leaving via Back or the nav asks for confirmation first. */
export function useLeaveGuard(active: boolean) {
  const { hold } = useLeaveGuardContext();
  useEffect(() => (active ? hold() : undefined), [active, hold]);
}
