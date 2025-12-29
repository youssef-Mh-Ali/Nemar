"use client";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: "none" | "sm" | "md" | "lg" | "full";
}

const roundedClasses = {
  none: "rounded-none",
  sm: "rounded-[var(--radius-sm)]",
  md: "rounded-[var(--radius-md)]",
  lg: "rounded-[var(--radius-lg)]",
  full: "rounded-full",
};

export function Skeleton({
  className = "",
  width,
  height,
  rounded = "md",
}: SkeletonProps) {
  return (
    <div
      className={`skeleton ${roundedClasses[rounded]} ${className}`}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-[var(--color-bg-card)] rounded-[var(--radius-lg)] p-4 space-y-4">
      <Skeleton height={160} className="w-full" rounded="lg" />
      <div className="space-y-2">
        <Skeleton height={20} width="70%" />
        <Skeleton height={16} width="50%" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton height={24} width={80} rounded="full" />
        <Skeleton height={16} width={60} />
      </div>
    </div>
  );
}

export function SkeletonUnitCard() {
  return (
    <div className="bg-[var(--color-bg-card)] rounded-[var(--radius-lg)] overflow-hidden">
      <Skeleton height={180} className="w-full" rounded="none" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <Skeleton height={24} width="40%" />
          <Skeleton height={24} width={60} rounded="full" />
        </div>
        <Skeleton height={16} width="60%" />
        <div className="flex gap-4">
          <Skeleton height={16} width={60} />
          <Skeleton height={16} width={60} />
          <Skeleton height={16} width={60} />
        </div>
        <Skeleton height={20} width="50%" />
      </div>
    </div>
  );
}

