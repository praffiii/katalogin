import type { HTMLAttributes } from "react";

type AlertVariant = "info" | "warning" | "error";

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: AlertVariant;
};

const variants: Record<AlertVariant, string> = {
  info: "border-[oklch(0.900_0.006_145)] bg-[oklch(0.985_0_0)]",
  warning: "border-[oklch(0.835_0.100_72)] bg-[oklch(0.975_0.030_72)]",
  error: "border-[oklch(0.830_0.105_28)] bg-[oklch(0.975_0.028_28)]",
};

export function Alert({
  className = "",
  variant = "info",
  ...props
}: AlertProps) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      {...props}
      className={`rounded-[10px] border px-3.5 py-3 text-sm leading-relaxed text-[oklch(0.180_0.018_145)] ${variants[variant]} ${className}`}
    />
  );
}
