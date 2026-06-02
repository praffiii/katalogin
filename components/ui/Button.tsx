import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-[oklch(0.350_0.110_140)] text-white hover:bg-[oklch(0.300_0.105_140)]",
  secondary:
    "border-[oklch(0.350_0.110_140)] bg-white text-[oklch(0.350_0.110_140)] hover:bg-[oklch(0.940_0.035_140)]",
  danger:
    "border-[oklch(0.560_0.170_28)] bg-white text-[oklch(0.560_0.170_28)] hover:bg-[oklch(0.970_0.030_28)]",
};

export function Button({
  className = "",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`lift-interactive inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border px-4 py-3 text-sm font-semibold leading-tight transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[oklch(0.350_0.110_140)] disabled:cursor-not-allowed disabled:border-transparent disabled:bg-[oklch(0.970_0.003_145)] disabled:text-[oklch(0.440_0.016_145)] disabled:hover:translate-y-0 ${variants[variant]} ${className}`}
    />
  );
}
