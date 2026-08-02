import Link, { type LinkProps } from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger";

export function buttonClass(variant: Variant = "primary", className?: string) {
  return clsx(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50",
    variant === "primary" && "bg-brand text-white hover:bg-brand-strong",
    variant === "secondary" && "border border-brand bg-white text-brand hover:bg-surface",
    variant === "ghost" && "text-brand hover:bg-surface",
    variant === "danger" && "bg-danger text-white hover:brightness-90",
    className,
  );
}

export function Button({ variant = "primary", className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={buttonClass(variant, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className,
  children,
  ...props
}: LinkProps & { variant?: Variant; className?: string; children: ReactNode }) {
  return (
    <Link className={buttonClass(variant, className)} {...props}>
      {children}
    </Link>
  );
}
