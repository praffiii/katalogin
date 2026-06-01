import type { InputHTMLAttributes } from "react";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`min-h-11 w-full rounded-[10px] border border-[oklch(0.900_0.006_145)] bg-white px-3.5 py-3 text-base !font-normal leading-normal text-[oklch(0.180_0.018_145)] outline-none transition-colors placeholder:!font-normal placeholder:text-[oklch(0.440_0.016_145)] focus:border-[oklch(0.350_0.110_140)] focus:ring-2 focus:ring-[oklch(0.940_0.035_140)] disabled:bg-[oklch(0.970_0.003_145)] disabled:text-[oklch(0.440_0.016_145)] ${className}`}
    />
  );
}
