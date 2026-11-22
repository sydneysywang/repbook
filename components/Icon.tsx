import type { ReactNode, SVGProps } from "react";

export type IconName =
  | "home"
  | "workout"
  | "history"
  | "templates"
  | "info"
  | "arrow-right"
  | "asterisk";

const PATHS: Record<IconName, ReactNode> = {
  home: (
    <>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6 9v11h12V9" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  workout: (
    <>
      <path d="M3 9v6M6.5 6.5v11M17.5 6.5v11M21 9v6" />
      <path d="M6.5 12h11" />
    </>
  ),
  history: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  templates: (
    <>
      <rect x="4" y="4" width="16" height="5" rx="1" />
      <rect x="4" y="11" width="16" height="9" rx="1" />
      <path d="M8 15h8" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5" />
      <circle cx="12" cy="7.75" r="0.6" fill="currentColor" />
    </>
  ),
  "arrow-right": (
    <>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  asterisk: (
    <>
      <path d="M12 3v18" />
      <path d="m4.2 7.5 15.6 9" />
      <path d="m4.2 16.5 15.6-9" />
    </>
  ),
};

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
  size?: number;
  /** Accessible label; without one the icon is decorative. */
  label?: string;
};

export function Icon({ name, size = 24, label, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
