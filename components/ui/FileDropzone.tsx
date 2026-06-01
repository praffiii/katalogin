"use client";

import { useState, type DragEvent, type InputHTMLAttributes } from "react";

type FileDropzoneProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "accept" | "multiple" | "onChange"
> & {
  onFileSelected: (file: File) => void;
  title?: string;
  description?: string;
};

export function FileDropzone({
  className = "",
  description = "Tarik foto ke sini atau pilih dari perangkat. JPG, PNG, atau WebP.",
  onFileSelected,
  title = "Pilih foto produk",
  ...props
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  }

  return (
    <label
      className={`flex min-h-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-6 text-center transition focus-within:border-[oklch(0.350_0.110_140)] focus-within:ring-2 focus-within:ring-[oklch(0.940_0.035_140)] ${
        isDragging
          ? "border-[oklch(0.350_0.110_140)] bg-[oklch(0.940_0.035_140)]"
          : "border-[oklch(0.900_0.006_145)] bg-white hover:border-[oklch(0.350_0.110_140)] hover:bg-[oklch(0.940_0.035_140)]"
      } ${className}`}
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setIsDragging(false);
      }}
      onDragOver={(event) => {
        event.preventDefault();
      }}
      onDrop={handleDrop}
    >
      <span className="text-sm font-semibold text-[oklch(0.180_0.018_145)]">
        {title}
      </span>
      <span className="max-w-64 text-sm leading-relaxed text-[oklch(0.440_0.016_145)]">
        {description}
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
          event.target.value = "";
        }}
      />
    </label>
  );
}
