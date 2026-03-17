"use client";

import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--color-text)] mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-3
            bg-[var(--color-bg-card)]
            border border-[var(--color-border)]
            rounded-[var(--radius-md)]
            text-[var(--color-text)]
            placeholder:text-[var(--color-text-muted)]
            transition-all duration-[var(--transition-fast)]
            focus:outline-none focus:border-[var(--color-primary)]
            focus:ring-2 focus:ring-[var(--color-primary)]/10
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? "border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/10" : ""}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-[var(--color-error)]">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

