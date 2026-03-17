"use client";

import { forwardRef, SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = "", id, ...props }, ref) => {
    const selectId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-[var(--color-text)] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full px-4 py-3 pr-10
              bg-[var(--color-bg-card)]
              border border-[var(--color-border)]
              rounded-[var(--radius-md)]
              text-[var(--color-text)]
              appearance-none
              transition-all duration-[var(--transition-fast)]
              focus:outline-none focus:border-[var(--color-primary)]
              focus:ring-2 focus:ring-[var(--color-primary)]/10
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? "border-[var(--color-error)]" : ""}
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)] pointer-events-none" />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-[var(--color-error)]">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

