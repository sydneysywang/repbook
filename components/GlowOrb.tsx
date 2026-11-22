import type { ReactNode } from "react";

/**
 * Big centred orb behind a short message, for "big moments" (About, and the
 * "Workout saved" screen later). Light mode: coral core → magenta → purple with
 * a periwinkle crescent on one side. Dark mode: plum → black with a coral rim.
 * Colours come from --orb-* in globals.css.
 */
export function GlowOrb({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate flex min-h-[60vh] items-center justify-center py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 aspect-square w-[min(34rem,120vw)] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          opacity: 0.85,
          background: [
            // Crescent of the accent colour, offset to the right.
            "radial-gradient(circle at 78% 42%, color-mix(in srgb, var(--orb-accent) 55%, transparent) 0%, transparent 32%)",
            "radial-gradient(circle, var(--orb-inner) 0%, var(--orb-mid) 30%, var(--orb-outer) 52%, color-mix(in srgb, var(--orb-outer) 25%, transparent) 68%, transparent 76%)",
          ].join(", "),
        }}
      />
      {children}
    </div>
  );
}
