"use client";

import { HTMLAttributes, forwardRef, ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, keyof HTMLMotionProps<"div">> {
  hoverable?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  children?: ReactNode;
}

const paddingSizes = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hoverable = false, padding = "md", className = "", children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={hoverable ? { y: -2 } : undefined}
        transition={{ duration: 0.2 }}
        className={`
          bg-[var(--color-bg-card)]
          border border-[var(--color-border-light)]
          rounded-[var(--radius-lg)]
          shadow-[var(--shadow-sm)]
          ${hoverable ? "hover:shadow-[var(--shadow-md)] cursor-pointer" : ""}
          ${paddingSizes[padding]}
          ${className}
        `}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";

export const CardHeader = ({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) => (
  <div className={`mb-4 ${className}`}>{children}</div>
);

export const CardTitle = ({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) => (
  <h3 className={`text-lg font-semibold text-[var(--color-text)] ${className}`}>
    {children}
  </h3>
);

export const CardDescription = ({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) => (
  <p className={`text-sm text-[var(--color-text-muted)] mt-1 ${className}`}>
    {children}
  </p>
);

export const CardContent = ({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) => <div className={className}>{children}</div>;

export const CardFooter = ({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) => (
  <div className={`mt-4 pt-4 border-t border-[var(--color-border-light)] ${className}`}>
    {children}
  </div>
);
