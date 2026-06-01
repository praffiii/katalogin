import type { HTMLAttributes } from "react";

export function Skeleton({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={`animate-pulse rounded-[10px] bg-[oklch(0.970_0.003_145)] ${className}`}
    />
  );
}
