import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Icon } from "./Icon";

export type ButtonVariant = "primary" | "secondary";

export function buttonClasses(variant: ButtonVariant = "primary"): string {
  const base =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-[3px] px-5 text-base font-medium transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-40";
  return variant === "primary"
    ? `${base} bg-primary text-on-primary`
    : `${base} border border-ink text-ink`;
}

type ButtonProps = ComponentProps<"button"> & { variant?: ButtonVariant };

export function Button({ variant = "primary", className = "", children, ...rest }: ButtonProps) {
  return (
    <button type="button" className={`${buttonClasses(variant)} ${className}`} {...rest}>
      {children}
      {variant === "primary" && <Icon name="arrow-right" size={18} />}
    </button>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

export function ButtonLink({ variant = "primary", className = "", children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={`${buttonClasses(variant)} ${className}`} {...rest}>
      {children}
      {variant === "primary" && <Icon name="arrow-right" size={18} />}
    </Link>
  );
}
