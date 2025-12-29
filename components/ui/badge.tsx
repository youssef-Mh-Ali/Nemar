"use client";

import { HTMLAttributes } from "react";

type BadgeVariant =
  | "default"
  | "available"
  | "reserved"
  | "sold"
  | "success"
  | "warning"
  | "error"
  | "info";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  default:
    "bg-[var(--color-bg-alt)] text-[var(--color-text-secondary)]",
  available:
    "bg-[var(--color-available-bg)] text-[var(--color-available)]",
  reserved:
    "bg-[var(--color-reserved-bg)] text-[var(--color-reserved)]",
  sold:
    "bg-[var(--color-sold-bg)] text-[var(--color-sold)]",
  success:
    "bg-green-50 text-green-700",
  warning:
    "bg-yellow-50 text-yellow-700",
  error:
    "bg-red-50 text-red-700",
  info:
    "bg-blue-50 text-blue-700",
};

export function Badge({
  variant = "default",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center
        px-2.5 py-0.5
        text-xs font-medium
        rounded-full
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: "Available" | "Reserved" | "Sold" | "SoldOut" }) {
  const variantMap: Record<string, BadgeVariant> = {
    Available: "available",
    Reserved: "reserved",
    Sold: "sold",
    SoldOut: "sold",
  };

  const labelMap: Record<string, string> = {
    Available: "متاح",
    Reserved: "محجوز",
    Sold: "مباع",
    SoldOut: "مباع بالكامل",
  };

  return (
    <Badge variant={variantMap[status]}>
      {labelMap[status]}
    </Badge>
  );
}

