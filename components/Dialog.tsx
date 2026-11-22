"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** "sheet": full screen on phone, centred panel on laptop. "small": centred box everywhere. */
  size?: "sheet" | "small";
  /** Optional focus target when the dialog opens. */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
};

/**
 * Native <dialog> as a modal: focus trap, Esc to close and top-layer stacking
 * for free. Only mounted while open, and portalled to <body> so forms inside it
 * are never nested in a page's form.
 */
export function Dialog({ open, onClose, title, children, size = "small", initialFocusRef }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!open || !el || el.open) return;
    el.showModal();
    initialFocusRef?.current?.focus();
  }, [open, initialFocusRef]);

  if (!open) return null;

  const sizing =
    size === "sheet"
      ? "m-0 h-dvh max-h-none w-full max-w-none pt-[env(safe-area-inset-top)] md:m-auto md:pt-0 md:h-[min(44rem,85vh)] md:w-[34rem] md:border"
      : "m-auto w-[calc(100%-2.5rem)] max-w-sm border";

  return createPortal(
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      // Click on the dimmed backdrop (the dialog element itself) closes it.
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={`${sizing} border-rule bg-surface p-0 text-ink backdrop:bg-black/45 backdrop:backdrop-blur-[2px]`}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-rule py-2 pr-2 pl-5">
          <h2 className="text-lg font-bold tracking-tight">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-11 items-center justify-center text-muted hover:text-ink"
          >
            <Icon name="close" size={22} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </dialog>,
    document.body,
  );
}
