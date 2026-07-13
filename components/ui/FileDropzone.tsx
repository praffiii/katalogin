import { CloudArrowUpIcon } from "@phosphor-icons/react";
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
  description = "JPG, PNG, atau WebP maks. 3 MB",
  onFileSelected,
  title = "Seret & lepas foto di sini",
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
      className={`lift-interactive group flex min-h-64 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-4 py-8 text-center focus-within:border-[oklch(0.350_0.110_140)] focus-within:ring-2 focus-within:ring-[oklch(0.940_0.035_140)] ${
        isDragging
          ? "border-[oklch(0.350_0.110_140)] bg-[oklch(0.940_0.035_140)]"
          : "border-control-border bg-white hover:border-[oklch(0.350_0.110_140)] hover:bg-[oklch(0.940_0.035_140)]"
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
      <CloudArrowUpIcon
        aria-hidden="true"
        className="h-14 w-14 text-[oklch(0.180_0.018_145)] transition-transform group-hover:-translate-y-0.5"
        size={56}
        weight="bold"
      />
      <span className="text-base font-semibold text-[oklch(0.180_0.018_145)]">
        {title}
      </span>
      <span className="max-w-64 text-sm leading-relaxed text-[oklch(0.440_0.016_145)]">
        {description}
      </span>
      <span className="mt-3 inline-flex min-h-11 w-full max-w-56 items-center justify-center rounded-[10px] border border-control-border bg-white px-4 py-3 text-sm font-semibold leading-tight text-[oklch(0.180_0.018_145)] transition-colors group-hover:bg-[oklch(0.985_0_0)]">
        Pilih dari galeri
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
