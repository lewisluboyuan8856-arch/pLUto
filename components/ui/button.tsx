import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

const buttonStyles =
  "inline-flex items-center justify-center rounded-full border border-transparent px-5 py-3 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/50 disabled:pointer-events-none disabled:opacity-60";

type SharedProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

function getVariantStyles(variant: SharedProps["variant"]) {
  switch (variant) {
    case "secondary":
      return "border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/18";
    case "ghost":
      return "border-ink/10 bg-white text-ink hover:border-ink/20 hover:bg-paper";
    default:
      return "bg-coral text-white shadow-card hover:bg-coral/90";
  }
}

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: ComponentPropsWithoutRef<"button"> & SharedProps) {
  return (
    <button className={cn(buttonStyles, getVariantStyles(variant), className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  variant = "primary",
  className,
  href,
  ...props
}: ComponentPropsWithoutRef<typeof Link> & SharedProps) {
  return (
    <Link className={cn(buttonStyles, getVariantStyles(variant), className)} href={href} {...props}>
      {children}
    </Link>
  );
}
