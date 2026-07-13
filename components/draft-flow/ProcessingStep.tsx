import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { InfoIcon, XIcon } from "@phosphor-icons/react";

const messages = [
  "Menganalisis foto produk",
  "Menyusun judul, deskripsi, dan poin utama",
  "Menyiapkan kata kunci yang relevan",
];

const previewRows = [
  { label: "Judul", width: "w-3/4" },
  { label: "Deskripsi", width: "w-full" },
  { label: "Keyword", width: "w-2/3" },
];

type ProcessingStepProps = {
  onCancel: () => void;
};

export function ProcessingStep({ onCancel }: ProcessingStepProps) {
  return (
    <section
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="surface-enter mx-auto flex w-full max-w-xl flex-col overflow-hidden rounded-xl border border-border bg-[linear-gradient(180deg,white_0%,oklch(0.992_0.004_145)_100%)] p-4 sm:p-6"
    >
      <div className="flex justify-center">
        <div className="processing-illustration relative flex h-28 w-28 items-center justify-center rounded-full bg-primary-soft">
          <div className="relative h-[74px] w-14 rounded-[10px] border-2 border-primary bg-white">
            <div className="absolute left-4 top-4 h-1 w-1 rounded-full bg-primary" />
            <div className="absolute left-7 top-4 h-1 w-5 rounded-full bg-ink" />
            <div className="absolute left-7 top-8 h-1 w-6 rounded-full bg-muted" />
            <div className="absolute left-7 top-12 h-1 w-3 rounded-full bg-muted" />
            <div className="absolute -bottom-0.5 -left-0.5 h-9 w-7 rounded-br-[8px] rounded-tl-[8px] border-2 border-primary bg-[oklch(0.620_0.095_145)]" />
          </div>
          <span aria-hidden="true" className="processing-scan" />
        </div>
      </div>

      <div className="mt-7 text-center">
        <h2
          data-stage-heading
          tabIndex={-1}
          className="mx-auto max-w-sm text-balance text-2xl font-bold leading-tight text-ink outline-none"
        >
          Kami sedang menyiapkan draft listing Anda
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Proses berjalan secara otomatis. Tahap rinci tidak ditampilkan karena
          AI memprosesnya sebagai satu permintaan.
        </p>
      </div>

      <div className="mt-7 space-y-4">
        {messages.map((message, index) => (
          <p
            key={message}
            className="surface-enter flex items-start gap-3 text-sm font-semibold leading-snug text-ink"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <span
              aria-hidden="true"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            </span>
            {message}
          </p>
        ))}
      </div>

      <div
        className="mt-8 space-y-3 rounded-xl border border-border bg-white/80 p-4"
        aria-hidden="true"
      >
        {previewRows.map((row, index) => (
          <div
            key={row.label}
            className="surface-enter grid gap-2"
            style={{ animationDelay: `${260 + index * 90}ms` }}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-muted">
                {row.label}
              </span>
              {index === 0 ? (
                <span className="typing-dots text-xs font-semibold text-primary">
                  menulis
                </span>
              ) : null}
            </div>
            <Skeleton className={`h-7 ${row.width}`} />
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-3 rounded-xl border border-warning-border bg-warning-bg p-4 text-ink">
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ink text-sm font-bold"
        >
          <InfoIcon size={16} weight="bold" />
        </span>
        <p className="text-sm font-semibold leading-relaxed">
          Proses ini biasanya selesai dalam 10 sampai 20 detik.
        </p>
      </div>

      <div className="mt-5 flex justify-center">
        <Button
          type="button"
          variant="danger"
          onClick={onCancel}
          className="w-full sm:w-auto"
        >
          <XIcon aria-hidden="true" size={18} weight="bold" />
          Batalkan proses
        </Button>
      </div>
    </section>
  );
}
