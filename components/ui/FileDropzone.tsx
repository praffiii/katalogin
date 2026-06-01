"use client";

import type { InputHTMLAttributes } from "react";

type FileDropzoneProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "accept" | "multiple" | "onChange"
> & {
  onFileSelected: (file: File) => void;
};

export function FileDropzone({
  className = "",
  onFileSelected,
  ...props
}: FileDropzoneProps) {
  return (
    <label
      className={`flex min-h-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[oklch(0.900_0.006_145)] bg-white px-4 py-6 text-center transition hover:border-[oklch(0.350_0.110_140)] hover:bg-[oklch(0.940_0.035_140)] focus-within:border-[oklch(0.350_0.110_140)] focus-within:ring-2 focus-within:ring-[oklch(0.940_0.035_140)] ${className}`}
    >
      <span className="text-sm font-semibold text-[oklch(0.180_0.018_145)]">
        Pilih foto produk
      </span>
      <span className="max-w-64 text-sm leading-relaxed text-[oklch(0.440_0.016_145)]">
        Tarik foto ke sini atau pilih dari perangkat. JPG, PNG, atau WebP.
      </span>
      <input
        {...props}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onFileSelected(file);
          }
        }}
      />
    </label>
  );
}
