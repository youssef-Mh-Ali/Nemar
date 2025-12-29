"use client";

import { forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

type ButtonVariant = "primary" | "secondary" | "accent" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)] active:bg-[var(--color-primary-dark)]",
  secondary:
    "bg-[var(--color-bg-alt)] text-[var(--color-text)] hover:bg-[var(--color-border)] active:bg-[var(--color-border-light)]",
  accent:
    "bg-[var(--color-accent)] text-[var(--color-primary-dark)] hover:bg-[var(--color-accent-light)] active:bg-[var(--color-accent-dark)]",
  outline:
    "bg-transparent border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-alt)] hover:border-[var(--color-text-muted)]",
  ghost:
    "bg-transparent text-[var(--color-text)] hover:bg-[var(--color-bg-alt)]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-6 py-3 text-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      fullWidth = false,
      className = "",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
        className={`
          inline-flex items-center justify-center gap-2
          font-medium rounded-[var(--radius-md)]
          transition-colors duration-[var(--transition-fast)]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
