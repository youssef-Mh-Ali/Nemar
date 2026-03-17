"use client";

import { forwardRef, TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const textareaId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-[var(--color-text)] mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
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
            resize-none
            ${error ? "border-[var(--color-error)]" : ""}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-[var(--color-error)]">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

