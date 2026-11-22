/**
 * Soft orange → coral → magenta → purple → periwinkle blob at the top of a
 * page, behind the title. Decorative only: the parent must be
 * `relative isolate` and text must stay readable without it.
 */
export function Glow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -top-28 left-1/2 -z-10 h-80 w-[44rem] max-w-[160vw] -translate-x-1/2 blur-3xl"
      style={{
        opacity: "var(--glow-opacity)",
        background: [
          "radial-gradient(closest-side at 22% 50%, color-mix(in srgb, var(--glow-orange) 60%, transparent), transparent)",
          "radial-gradient(closest-side at 45% 45%, color-mix(in srgb, var(--glow-red) 75%, transparent), transparent)",
          "radial-gradient(closest-side at 64% 40%, color-mix(in srgb, var(--glow-magenta) 60%, transparent), transparent)",
          "radial-gradient(closest-side at 82% 62%, color-mix(in srgb, var(--glow-purple) 45%, transparent), transparent)",
          "radial-gradient(closest-side at 94% 22%, color-mix(in srgb, var(--glow-periwinkle) 55%, transparent), transparent)",
        ].join(", "),
      }}
    />
  );
}
