"use client";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { GenerateListingRequest, Marketplace } from "@/types/listing";

type FormValues = Omit<GenerateListingRequest, "imageBase64" | "mimeType">;

type UploadStepProps = {
  error: string | null;
  formValues: FormValues;
  imageFile: File | null;
  previewUrl: string | null;
  onFileSelected: (file: File) => void;
  onRemoveFile: () => void;
  onFormChange: (values: Partial<FormValues>) => void;
  onGenerate: () => void;
};

export function UploadStep({
  error,
  formValues,
  imageFile,
  previewUrl,
  onFileSelected,
  onRemoveFile,
  onFormChange,
  onGenerate,
}: UploadStepProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <section className="rounded-xl border border-border bg-white p-4 sm:p-6">
        <div className="mb-4">
          <h2 className="text-base font-semibold leading-snug text-ink">
            Foto produk
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Satu foto saja. Foto tidak disimpan.
          </p>
        </div>

        {previewUrl ? (
          <div className="space-y-3">
            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              <img
                src={previewUrl}
                alt="Preview foto produk"
                className="aspect-[4/3] w-full object-contain"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <FileDropzone
                aria-label="Ganti foto produk"
                className="min-h-0 flex-1 rounded-[10px] py-3"
                onFileSelected={onFileSelected}
              />
              <Button type="button" variant="secondary" onClick={onRemoveFile}>
                Hapus
              </Button>
            </div>
            {imageFile ? (
              <p className="text-sm text-muted">{imageFile.name}</p>
            ) : null}
          </div>
        ) : (
          <FileDropzone onFileSelected={onFileSelected} />
        )}

        {error ? (
          <Alert className="mt-4" variant="error">
            {error}
          </Alert>
        ) : null}
      </section>

      <section className="rounded-xl border border-border bg-white p-4 sm:p-6">
        <div className="mb-4">
          <h2 className="text-base font-semibold leading-snug text-ink">
            Konteks opsional
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Isi bila ada detail yang tidak terlihat di foto.
          </p>
        </div>

        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-ink">
            Nama produk
            <Input
              value={formValues.productName || ""}
              placeholder="Contoh: Tas rajut mini"
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
                <option value="general">Umum</option>
                <option value="shopee">Shopee</option>
                <option value="tokopedia">Tokopedia</option>
                <option value="tiktok">TikTok Shop</option>
              </select>
            </label>
          </div>

          <label className="grid gap-2 text-sm font-semibold text-ink">
            Catatan tambahan
            <Textarea
              value={formValues.notes || ""}
              placeholder="Ukuran, bahan, warna, varian, atau info penting lain."
              onChange={(event) => onFormChange({ notes: event.target.value })}
            />
          </label>

          <Button type="button" disabled={!imageFile} onClick={onGenerate}>
            Buat draft listing
          </Button>
        </div>
      </section>
    </div>
  );
}
