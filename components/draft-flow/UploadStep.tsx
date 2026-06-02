"use client";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { GenerateListingRequest, Marketplace } from "@/types/listing";

type FormValues = Omit<GenerateListingRequest, "imageBase64" | "mimeType">;
type DraftStep = "upload" | "photo" | "details";

type UploadStepProps = {
  error: string | null;
  formValues: FormValues;
  imageFile: File | null;
  previewUrl: string | null;
  step: DraftStep;
  onFileSelected: (file: File) => void;
  onRemoveFile: () => void;
  onFormChange: (values: Partial<FormValues>) => void;
  onGenerate: () => void;
  onGoToDetails: () => void;
  onGoToPhoto: () => void;
};

export function UploadStep({
  error,
  formValues,
  imageFile,
  previewUrl,
  step,
  onFileSelected,
  onRemoveFile,
  onFormChange,
  onGenerate,
  onGoToDetails,
  onGoToPhoto,
}: UploadStepProps) {
  const showPhotoSection = step !== "details";
  const showDetailsSection = step === "details";

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.1fr)] lg:gap-0">
      <section
        className={`surface-enter lg:block lg:pr-8 ${
          showPhotoSection ? "block" : "hidden"
        }`}
      >
        <div className="mb-4">
          <h2 className="text-lg font-semibold leading-snug text-ink">
            Foto produk
          </h2>
          <p className="mt-1 max-w-[65ch] text-sm leading-relaxed text-muted">
            Unggah satu foto utama yang paling jelas.
          </p>
        </div>

        {previewUrl ? (
          <div className="photo-enter space-y-3">
            <div className="overflow-hidden rounded-xl bg-surface">
              <img
                src={previewUrl}
                alt="Preview foto produk"
                className="h-56 w-full object-contain p-2 sm:h-80 lg:h-96"
              />
            </div>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">
                  {imageFile?.name || "Foto produk dipilih"}
                </p>
                <p className="mt-0.5 text-sm text-muted">JPG, PNG, atau WebP</p>
              </div>
              <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:grid-cols-[9rem_9rem]">
                <label className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-[10px] border border-border bg-white px-4 py-2 text-sm font-semibold leading-tight text-primary transition-colors hover:border-primary hover:bg-surface focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary">
                  Ganti foto
                  <input
                    aria-label="Ganti foto produk"
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
                <Button
                  type="button"
                  variant="secondary"
                  className="min-h-11 w-full !rounded-[10px] !border !border-border !bg-white px-4 py-2 text-error hover:!border-error-border hover:!bg-surface hover:text-error"
                  onClick={onRemoveFile}
                >
                  Hapus
                </Button>
              </div>
            </div>
            <div className="sticky bottom-3 -mx-3 mt-4 bg-white/95 px-3 pt-3 lg:hidden">
              <Button type="button" className="w-full" onClick={onGoToDetails}>
                Lanjut ke detail
              </Button>
            </div>
          </div>
        ) : (
          <FileDropzone onFileSelected={onFileSelected} />
        )}

        {error ? (
          <Alert className="mt-4" variant="error">
            <span className="block font-semibold">Foto belum bisa dipakai</span>
            {error}
          </Alert>
        ) : null}
      </section>

      <section
        className={`surface-enter border-border lg:block lg:border-l lg:pl-8 ${
          showDetailsSection
            ? "block"
            : "hidden border-t pt-6 lg:border-t-0 lg:pt-0"
        }`}
      >
        <div className="mb-4">
          <div>
            <h2 className="text-lg font-semibold leading-snug text-ink">
              Detail listing
            </h2>
            <p className="mt-1 max-w-[65ch] text-sm leading-relaxed text-muted">
              Isi jika ada detail yang tidak terlihat di foto.
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-ink">
            Nama produk
            <Input
              value={formValues.productName || ""}
              placeholder="Contoh: Jenis produk dan merek"
              onChange={(event) =>
                onFormChange({ productName: event.target.value })
              }
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-ink">
              Kondisi
              <select
                className="min-h-11 rounded-[10px] border border-border bg-white px-3.5 py-3 text-base font-normal text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
                value={formValues.condition || ""}
                onChange={(event) =>
                  onFormChange({
                    condition: (event.target.value ||
                      undefined) as FormValues["condition"],
                  })
                }
              >
                <option value="">Belum diisi</option>
                <option value="new">Baru</option>
                <option value="used">Bekas</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm font-semibold text-ink">
              Marketplace
              <select
                className="min-h-11 rounded-[10px] border border-border bg-white px-3.5 py-3 text-base font-normal text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
                value={formValues.marketplace || "general"}
                onChange={(event) =>
                  onFormChange({
                    marketplace: event.target.value as Marketplace,
                  })
                }
              >
                <option value="general">Marketplace umum</option>
                <option value="shopee">Shopee</option>
                <option value="tokopedia">Tokopedia</option>
                <option value="tiktok">TikTok Shop</option>
              </select>
            </label>
          </div>

          <label className="grid gap-2 text-sm font-semibold text-ink">
            Detail tambahan
            <Textarea
              value={formValues.notes || ""}
              placeholder="Ukuran, bahan, warna, varian, atau info penting lain."
              onChange={(event) => onFormChange({ notes: event.target.value })}
            />
          </label>

          <div className="sticky bottom-3 -mx-3 mt-2 bg-white/95 px-3 pt-3 sm:static sm:mx-0 sm:bg-transparent sm:px-0 sm:pt-0">
            <Button
              type="button"
              className="w-full"
              disabled={!imageFile}
              onClick={onGenerate}
            >
              Buat draft listing
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="mt-3 w-full lg:hidden"
              onClick={onGoToPhoto}
            >
              Kembali ke foto
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
